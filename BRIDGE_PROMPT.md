# PulseControl Bridge — Copilot Build Prompt

> Paste this entire file as your first message. Do not truncate it.

---

## What You Are Building

**PulseControl Bridge** is a macOS desktop application that acts as the server-side counterpart to the **PulseControl Mobile** app (already built — iOS/Android React Native). The Bridge:

1. Runs a WebSocket server on port **8765**
2. Receives MIDI CC and transport messages from the mobile app
3. Forwards them to a **CoreMIDI virtual port** so any DAW or hardware can receive them
4. Displays a minimal, dark UI showing connection status, connected device info, and a live activity feed
5. Generates a **QR code** containing its WebSocket URL so the mobile app can scan and connect instantly

This is a **native macOS app** — not Electron. Use **Tauri v2**.

---

## Tech Stack (non-negotiable)

| Layer | Technology |
|---|---|
| App shell | Tauri v2 (Rust backend + WebView frontend) |
| Rust async runtime | tokio (multi-thread) |
| WebSocket server | axum + `axum::extract::ws` |
| MIDI output | midir 0.9 (CoreMIDI virtual port on macOS) |
| mDNS/discovery | mdns-sd 0.11 |
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v3 (dark theme only) |
| State (frontend) | zustand 5 |
| QR code display | qrcode.react |
| Icons | lucide-react |

---

## Project Bootstrap

```bash
npm create tauri-app@latest pulsecontrol-bridge -- \
  --template react-ts \
  --manager npm

cd pulsecontrol-bridge
npm install
```

Then add frontend deps:

```bash
npm install zustand qrcode.react lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Add to `src-tauri/Cargo.toml` (under `[dependencies]`):

```toml
tokio = { version = "1", features = ["full"] }
axum = { version = "0.7", features = ["ws"] }
midir = "0.9"
mdns-sd = "0.11"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
uuid = { version = "1", features = ["v4"] }
local-ip-address = "0.6"
tower-http = { version = "0.5", features = ["cors"] }
```

Tauri v2 `src-tauri/tauri.conf.json` — key settings:

```json
{
  "productName": "PulseControl Bridge",
  "identifier": "studio.ernestkeyz.pulsecontrol-bridge",
  "version": "1.0.0",
  "bundle": {
    "active": true,
    "targets": "dmg",
    "icon": ["icons/icon.icns"]
  },
  "app": {
    "windows": [{
      "title": "PulseControl Bridge",
      "width": 520,
      "height": 640,
      "resizable": false,
      "decorations": true
    }]
  },
  "plugins": {
    "shell": { "open": true }
  }
}
```

---

## Exact WebSocket Protocol

> This contract is fixed by the mobile app. Do NOT change message shapes.

### Mobile → Bridge messages

#### 1. Hello handshake (sent immediately on connect)

```json
{
  "type": "hello",
  "client": "pulsecontrol-mobile",
  "version": "1.0.0"
}
```

Bridge must store `client` and `version` and display them in the UI. Respond with:

```json
{ "type": "ack", "server": "pulsecontrol-bridge", "version": "1.0.0" }
```

#### 2. MIDI CC message (fader or knob moved)

```json
{
  "type": "midi_cc",
  "controlId": "fader-scene-1-0",
  "cc": 1,
  "value": 87,
  "timestamp": 1716800000000,
  "channel": 1
}
```

Fields:
- `controlId` — string identifier of the control (for UI display, not sent to MIDI)
- `cc` — MIDI CC number, **0–127**
- `value` — MIDI value, **0–127** (already clamped by the mobile app)
- `timestamp` — Unix ms timestamp (log/display only)
- `channel` — MIDI channel **1–16**

Bridge action: send `Control Change` on `channel`, `cc`, `value` via midir CoreMIDI virtual port.

MIDI byte encoding:

```
status = 0xB0 | (channel - 1)   // 0xB0 for ch1, 0xB1 for ch2, …
data   = [status, cc, value]
```

#### 3. Transport command

```json
{
  "type": "transport",
  "action": "play",
  "cc": 118,
  "value": 127,
  "channel": 1,
  "timestamp": 1716800000000
}
```

`action` is one of `"play"`, `"stop"`, `"record"`. The `cc` and `value` fields are authoritative — send them via MIDI CC exactly like a `midi_cc` message (the `action` field is for UI display only).

Default CC assignments from the mobile app:
- `play` → CC 118
- `stop` → CC 117
- `record` → CC 119

### Bridge → Mobile messages (required)

```json
{ "type": "ack", "server": "pulsecontrol-bridge", "version": "1.0.0" }
```

Sent only in response to `hello`. All other messages are fire-and-forget from the mobile side.

### Bridge → Mobile (optional, future-proof)

```json
{ "type": "error", "message": "MIDI port unavailable" }
```

---

## Default CC Map (from mobile defaults)

Faders 1–8 → CC 1–8 (MIDI channel 1 by default, user-configurable in mobile Settings)  
Knobs 1–8 → CC 11–18  
Transport Play → CC 118, Stop → CC 117, Record → CC 119

The mobile app allows per-scene CC remapping, so the Bridge must handle **any CC number 0–127**.

---

## Rust Backend — Required Tauri Commands

Expose these as `#[tauri::command]` functions:

### `get_server_info() -> ServerInfo`

```rust
pub struct ServerInfo {
    pub ip: String,          // local LAN IP, e.g. "192.168.1.10"
    pub port: u16,           // always 8765
    pub ws_url: String,      // "ws://192.168.1.10:8765"
    pub status: String,      // "running" | "stopped" | "error"
    pub midi_port_name: String, // e.g. "PulseControl"
}
```

### `get_activity_log() -> Vec<ActivityEntry>`

```rust
pub struct ActivityEntry {
    pub timestamp: u64,       // Unix ms
    pub message_type: String, // "midi_cc" | "transport" | "hello" | "connect" | "disconnect"
    pub detail: String,       // human-readable, e.g. "CH1 CC7 val=90"
}
```

Return the last 50 entries max.

### `clear_activity_log()`

Clears the in-memory log.

### `set_midi_port(name: String) -> Result<(), String>`

Recreates the midir virtual port with the given name. Default name: `"PulseControl"`.

---

## Rust Backend — Implementation Guide

### File: `src-tauri/src/main.rs`

```
main.rs
  └── spawns tokio runtime
  └── starts WebSocket server (axum) on 0.0.0.0:8765
  └── registers mDNS service: _pulsecontrol._tcp.local. port 8765
  └── opens midir CoreMIDI virtual output port named "PulseControl"
  └── sets up shared state (Arc<Mutex<...>>)
  └── runs tauri app
```

### Shared state (Arc<Mutex<T>>)

```rust
struct AppState {
    midi_out: Option<midir::MidiOutputConnection>,
    activity_log: Vec<ActivityEntry>,
    connected_client: Option<String>,  // from hello.client
    connected_version: Option<String>, // from hello.version
}
```

### WebSocket handler logic (pseudocode)

```
on connection:
    log "connect" event
    notify frontend via tauri event "client-connected"

on message received:
    parse JSON
    match type:
        "hello"     → store client/version, send ack, emit "hello-received" event
        "midi_cc"   → send MIDI CC via midir, log activity, emit "activity" event
        "transport" → send MIDI CC via midir (same as midi_cc), log activity, emit "activity" event

on disconnect:
    log "disconnect" event
    emit "client-disconnected" event
```

### midir virtual port

```rust
let midi_out = MidiOutput::new("PulseControl Bridge")?;
let port = midi_out.create_virtual("PulseControl")?;
// To send CC:
let status = 0xB0 | (channel - 1) as u8;
port.send(&[status, cc as u8, value as u8])?;
```

### mDNS registration

```rust
let mdns = ServiceDaemon::new()?;
let service_info = ServiceInfo::new(
    "_pulsecontrol._tcp.local.",
    "PulseControl Bridge",
    &format!("{}.local.", hostname),
    &local_ip,
    8765,
    None,
)?;
mdns.register(service_info)?;
```

---

## Frontend UI — Layout

Window: **520 × 640 px**, fixed size, dark theme (`#080808` background).

### Color palette (must match mobile app exactly)

```
background:    #080808
surface:       #0f0f0f
surface-alt:   #1a1a1a
border:        #2a2a2a
accent:        #00d4ff   (cyan)
accent-dim:    #007a99
text-primary:  #f5f5f5
text-secondary:#9e9e9e
text-muted:    #555555
green:         #22c55e
red:           #ef4444
amber:         #f59e0b
```

### Screen layout (top to bottom)

```
┌─────────────────────────────────────────────┐
│  ● PULSECONTROL BRIDGE        [status dot]  │  ← header, 48px
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  QR CODE (200×200)                  │   │  ← QR section
│  │  ws://192.168.1.10:8765             │   │
│  │  Scan with PulseControl Mobile      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  STATUS                             │   │  ← status card
│  │  WebSocket   ● Running              │   │
│  │  MIDI Port   ● PulseControl         │   │
│  │  Client      pulsecontrol-mobile    │   │
│  │              v1.0.0                 │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ACTIVITY                        [CLEAR]   │  ← activity log
│  ┌─────────────────────────────────────┐   │
│  │  12:04:32  CH1 CC7  val=90          │   │
│  │  12:04:31  CH1 CC7  val=84          │   │
│  │  12:04:30  hello — pulsecontrol…    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  MIDI PORT: [PulseControl        ] [APPLY]  │  ← footer controls
└─────────────────────────────────────────────┘
```

### Status dot colors

- `running` / `connected` → `#22c55e` (green)
- `connecting` → `#f59e0b` (amber, pulsing)
- `error` / `stopped` → `#ef4444` (red)
- `disconnected` (no client) → `#555555` (muted)

---

## Frontend — React Components

```
src/
  App.tsx              # Root, reads tauri events + polls commands
  components/
    Header.tsx         # App name, server status dot
    QrPanel.tsx        # QR code + URL display
    StatusCard.tsx     # WebSocket / MIDI / client status rows
    ActivityLog.tsx    # Scrollable last-50 log entries
    Footer.tsx         # MIDI port name input + Apply button
  store/
    useServerStore.ts  # zustand: serverInfo, activityLog, clientInfo
  hooks/
    useTauriEvents.ts  # listen("activity"), listen("client-connected"), etc.
```

### Tauri event names (Rust emits → React listens)

| Rust emits | Payload |
|---|---|
| `"client-connected"` | `{ client: string, version: string }` |
| `"client-disconnected"` | `{}` |
| `"hello-received"` | `{ client: string, version: string }` |
| `"activity"` | `ActivityEntry` (same shape as Rust struct) |

---

## QR Code

The QR code encodes exactly: `ws://<LAN_IP>:8765`

Example: `ws://192.168.1.10:8765`

The mobile app's connection screen has a **SCAN QR** button that opens `expo-camera` in full screen, reads the QR, and pre-fills the WebSocket URL input — so the QR must encode a valid `ws://` URL and nothing else.

Use `qrcode.react`:

```tsx
import { QRCodeSVG } from "qrcode.react";
<QRCodeSVG
  value={wsUrl}
  size={200}
  bgColor="#0f0f0f"
  fgColor="#00d4ff"
  level="M"
/>
```

---

## macOS Permissions (`src-tauri/Info.plist`)

```xml
<key>NSLocalNetworkUsageDescription</key>
<string>PulseControl Bridge needs local network access to connect with PulseControl Mobile.</string>
```

MIDI virtual ports do not require special entitlements on macOS.

---

## File/Folder Structure to Create

```
pulsecontrol-bridge/
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── QrPanel.tsx
│   │   ├── StatusCard.tsx
│   │   ├── ActivityLog.tsx
│   │   └── Footer.tsx
│   ├── store/
│   │   └── useServerStore.ts
│   └── hooks/
│       └── useTauriEvents.ts
├── src-tauri/
│   ├── src/
│   │   ├── main.rs
│   │   ├── server.rs       # axum WebSocket handler
│   │   ├── midi.rs         # midir wrapper
│   │   ├── discovery.rs    # mDNS
│   │   └── state.rs        # AppState + ActivityEntry types
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── Info.plist
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## Success Criteria

1. `npm run tauri dev` starts with no errors.
2. The UI shows the local IP and a valid `ws://` QR code.
3. The mobile app can scan the QR code and connect.
4. Moving a fader on the mobile app sends a MIDI CC message visible in a DAW (e.g. Logic Pro X) on the virtual port named `"PulseControl"`.
5. The activity log shows each incoming message in real time.
6. Disconnecting the mobile app shows the status as disconnected.
7. Changing the MIDI port name via the UI and clicking Apply recreates the port with the new name.

---

## What the Mobile App Expects from the Bridge

- Port **8765** — hardcoded default in the mobile app (`ws://192.168.1.100:8765`)
- WebSocket endpoint at the root path: `ws://<ip>:8765/` (no sub-path)
- All messages are UTF-8 text frames containing JSON (no binary frames)
- The `ack` response to `hello` must arrive within a reasonable timeout (the mobile app does not currently enforce a timeout but will in future)
- The server must accept multiple sequential connections (the mobile app reconnects up to 5× on drop)
- **No authentication** — the Bridge is LAN-only

---

## Ernest Keyz Studios

This is part of the **PulseControl** suite built by **Ernest Keyz Studios**.  
The app identifier namespace is `studio.ernestkeyz.*`.

---

*End of prompt. Build the complete working project from this specification.*
