#!/usr/bin/env python3
"""
Podcast cover for Echoes of Wisdom Season 1
Studio of Phronesis branding — cream/teal/gold palette
Uses Amiri font for proper Arabic RTL rendering
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random
import os
import arabic_reshaper
from bidi.algorithm import get_display

# ─── Brand colors ───
CREAM = (245, 239, 228)
TEAL = (15, 92, 94)
TEAL_DEEP = (10, 60, 62)
GOLD = (180, 141, 60)
INK = (26, 26, 26)
INK_SOFT = (90, 90, 90)

SIZE = 1024
CX = SIZE // 2

# ─── Fonts ───
AMIRI_REG = "/home/z/my-project/fonts/Amiri-Regular.ttf"
AMIRI_BOLD = "/home/z/my-project/fonts/Amiri-Bold.ttf"
SERIF_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
SERIF_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"

def f(path, size):
    return ImageFont.truetype(path, size)

def ar(text):
    """Reshape Arabic for PIL rendering"""
    return get_display(arabic_reshaper.reshape(text))

# ─── Canvas with subtle texture ───
img = Image.new("RGB", (SIZE, SIZE), CREAM)
noise = Image.new("L", (SIZE, SIZE), 128)
nd = ImageDraw.Draw(noise)
for x in range(0, SIZE, 2):
    for y in range(0, SIZE, 2):
        nd.point((x, y), fill=random.randint(120, 135))
noise = noise.filter(ImageFilter.GaussianBlur(0.5))
img = Image.blend(img, Image.merge("RGB", [noise, noise, noise]), 0.03)
draw = ImageDraw.Draw(img)

# ─── Helper: centered text ───
def centered(text, y, font, fill):
    bbox = draw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    draw.text((CX - w // 2, y), text, fill=fill, font=font)
    return y + (bbox[3] - bbox[1]) + 8

def ornament(y):
    ds = 5
    draw.line([(120, y), (CX - 25, y)], fill=GOLD, width=1)
    draw.line([(CX + 25, y), (SIZE - 120, y)], fill=GOLD, width=1)
    draw.polygon([(CX, y-ds), (CX+ds, y), (CX, y+ds), (CX-ds, y)], fill=GOLD)

# ─── Border ───
draw.rectangle([40, 40, SIZE-40, SIZE-40], outline=GOLD, width=2)
draw.rectangle([48, 48, SIZE-48, SIZE-48], outline=GOLD, width=1)

# ─── Layout (top to bottom) ───
y = 70

# Top ornament
ornament(y)
y += 25

# ─── Eagle logo (gold tinted) ───
logo_path = "/home/z/my-project/upload/Double-headed_eagle_of_the_Sultanate_of_Rum.svg.png"
if os.path.exists(logo_path):
    logo = Image.open(logo_path).convert("RGBA")
    ls = 200
    r = logo.width / logo.height
    nw = ls
    nh = int(ls / r)
    logo = logo.resize((nw, nh), Image.LANCZOS)
    # Gold tint
    gt = Image.new("RGBA", (nw, nh), (0, 0, 0, 0))
    gp, tp = logo.load(), gt.load()
    for yy in range(nh):
        for xx in range(nw):
            _, _, _, a = gp[xx, yy]
            if a > 0:
                tp[xx, yy] = (GOLD[0], GOLD[1], GOLD[2], a)
    img.paste(gt, (CX - nw // 2, y), gt)
    y += nh + 20

# ─── "Echoes of Wisdom" (English, teal, large) ───
y = centered("Echoes of Wisdom", y, f(SERIF_BOLD, 56), TEAL)
y += 5

# ─── "أصداء الحكمة" (Arabic, gold, Amiri) ───
y = centered(ar("أصداء الحكمة"), y, f(AMIRI_BOLD, 48), GOLD)
y += 10

# ─── Divider ───
ornament(y)
y += 25

# ─── Slogan (Arabic, Amiri, teal-deep) ───
y = centered(ar("رِحْلَةٌ في الفِكْرِ لا تَطْرَحُ أَجْوِبَةً،"), y, f(AMIRI_REG, 32), TEAL_DEEP)
y = centered(ar("بَلْ تُلْهِمُ أَسْئِلَةً"), y, f(AMIRI_REG, 32), TEAL_DEEP)
y += 10

# ─── Divider ───
ornament(y)
y += 25

# ─── "SEASON 1" + "الموسم الأول" ───
y = centered("SEASON 1", y, f(MONO, 24), TEAL)
y += 3
y = centered(ar("الموسم الأول"), y, f(AMIRI_REG, 28), TEAL)
y += 15

# ─── Divider ───
ornament(y)
y += 20

# ─── "إعداد وتقديم أحمد علي" ───
y = centered(ar("إعداد وتقديم أحمد علي"), y, f(AMIRI_REG, 28), INK_SOFT)
y += 15

# ─── Bottom ornament ───
ornament(SIZE - 85)

# ─── "Studio of Phronesis" ───
centered("Studio of Phronesis", SIZE - 72, f(SERIF_REG, 22), INK_SOFT)

# ─── Save ───
out = "/home/z/my-project/download/echoes-season1-cover.png"
img.save(out, "PNG", quality=95)
print(f"✓ Saved: {out}")
