from PIL import Image, ImageDraw
import os
import math

BG = (8, 8, 8)
SURFACE = (15, 15, 15)
ACCENT = (0, 212, 255)
ACCENT_DIM = (0, 122, 153)
WHITE = (255, 255, 255)

def draw_icon(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    r = int(size * 0.13)
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=BG)

    inner_pad = int(size * 0.1)
    inner_r = int(size * 0.08)
    draw.rounded_rectangle(
        [inner_pad, inner_pad, size - inner_pad, size - inner_pad],
        radius=inner_r,
        fill=SURFACE,
    )

    num_bars = 8
    heights_ratio = [0.35, 0.72, 1.0, 0.55, 0.88, 0.42, 0.78, 0.60]
    bar_area_w = size * 0.68
    bar_area_h = size * 0.50
    bar_area_x = (size - bar_area_w) / 2
    bar_area_y = size * 0.26

    gap = bar_area_w * 0.08 / (num_bars - 1)
    bar_w = (bar_area_w - gap * (num_bars - 1)) / num_bars

    for i, h_ratio in enumerate(heights_ratio):
        bh = bar_area_h * h_ratio
        bx = bar_area_x + i * (bar_w + gap)
        by = bar_area_y + (bar_area_h - bh)

        alpha_base = 180
        alpha = int(alpha_base + 75 * h_ratio)
        color = (ACCENT[0], ACCENT[1], ACCENT[2], alpha)

        br = max(1, int(bar_w * 0.35))
        draw.rounded_rectangle(
            [bx, by, bx + bar_w, by + bh],
            radius=br,
            fill=color,
        )

        if h_ratio > 0.65:
            glow_size = bar_w * 1.6
            gx = bx + (bar_w - glow_size) / 2
            draw.ellipse(
                [gx, by - glow_size * 0.3, gx + glow_size, by + glow_size * 0.3],
                fill=(ACCENT[0], ACCENT[1], ACCENT[2], 40),
            )

    label_y = bar_area_y + bar_area_h + size * 0.04
    label_h = size * 0.055
    dot_r = max(1, int(label_h * 0.2))
    dot_spacing = size * 0.065
    dot_start_x = size / 2 - (3 * dot_spacing) / 2

    for j in range(4):
        dx = dot_start_x + j * dot_spacing
        dy = label_y + label_h / 2
        color = ACCENT if j == 0 else (ACCENT_DIM[0], ACCENT_DIM[1], ACCENT_DIM[2], 180)
        draw.ellipse([dx - dot_r, dy - dot_r, dx + dot_r, dy + dot_r], fill=color)

    return img


def draw_splash(width, height):
    img = Image.new("RGBA", (width, height), BG + (255,))
    draw = ImageDraw.Draw(img)

    cx, cy = width // 2, height // 2

    icon = draw_icon(min(width, height) // 3)
    ix = cx - icon.width // 2
    iy = cy - icon.height // 2 - int(height * 0.06)
    img.paste(icon, (ix, iy), icon)

    return img


def draw_adaptive(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    num_bars = 8
    heights_ratio = [0.35, 0.72, 1.0, 0.55, 0.88, 0.42, 0.78, 0.60]
    bar_area_w = size * 0.72
    bar_area_h = size * 0.55
    bar_area_x = (size - bar_area_w) / 2
    bar_area_y = (size - bar_area_h) / 2

    gap = bar_area_w * 0.08 / (num_bars - 1)
    bar_w = (bar_area_w - gap * (num_bars - 1)) / num_bars

    for i, h_ratio in enumerate(heights_ratio):
        bh = bar_area_h * h_ratio
        bx = bar_area_x + i * (bar_w + gap)
        by = bar_area_y + (bar_area_h - bh)
        br = max(1, int(bar_w * 0.35))
        alpha = int(180 + 75 * h_ratio)
        draw.rounded_rectangle(
            [bx, by, bx + bar_w, by + bh],
            radius=br,
            fill=(ACCENT[0], ACCENT[1], ACCENT[2], alpha),
        )

    return img


def draw_favicon(size):
    img = Image.new("RGBA", (size, size), BG + (255,))
    draw = ImageDraw.Draw(img)
    r = int(size * 0.15)
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=BG)

    num_bars = 5
    heights_ratio = [0.5, 0.85, 1.0, 0.65, 0.4]
    baw = size * 0.70
    bah = size * 0.55
    bax = (size - baw) / 2
    bay = (size - bah) / 2

    gap = baw * 0.08 / (num_bars - 1)
    bw = (baw - gap * (num_bars - 1)) / num_bars

    for i, h in enumerate(heights_ratio):
        bh = bah * h
        bx = bax + i * (bw + gap)
        by = bay + (bah - bh)
        br = max(1, int(bw * 0.3))
        draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=br, fill=ACCENT)

    return img


assets = os.path.join(os.path.dirname(__file__), "..", "assets")
os.makedirs(assets, exist_ok=True)

icon = draw_icon(1024)
icon.save(os.path.join(assets, "icon.png"))
print("icon.png written")

adaptive = draw_adaptive(1024)
adaptive.save(os.path.join(assets, "adaptive-icon.png"))
print("adaptive-icon.png written")

fg = draw_adaptive(1024)
fg.save(os.path.join(assets, "android-icon-foreground.png"))
print("android-icon-foreground.png written")

bg = Image.new("RGBA", (1024, 1024), BG + (255,))
bg.save(os.path.join(assets, "android-icon-background.png"))
print("android-icon-background.png written")

mono = draw_adaptive(1024).convert("L").convert("RGBA")
mono.save(os.path.join(assets, "android-icon-monochrome.png"))
print("android-icon-monochrome.png written")

splash = draw_splash(1284, 2778)
splash.save(os.path.join(assets, "splash-icon.png"))
print("splash-icon.png written")

fav = draw_favicon(48)
fav.save(os.path.join(assets, "favicon.png"))
print("favicon.png written")

print("All icons generated.")
