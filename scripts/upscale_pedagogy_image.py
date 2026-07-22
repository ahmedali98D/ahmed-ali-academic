#!/usr/bin/env python3
"""
Upscale the pedagogy image using PIL with LANCZOS resampling.
The original is 523x298 which is too small for the hero area.
We upscale to 1600x911 with LANCZOS + slight sharpening.
The image will be displayed with a cream gradient overlay at 60% opacity,
so minor softness from upscaling will be visually masked.
"""
from PIL import Image, ImageFilter, ImageEnhance
import os

INPUT = '/home/z/my-project/upload/Pedagogy and Curriculum..jpg'
OUTPUT = '/home/z/my-project/audit/phronesis-studio/public/library/pedagogy-and-curriculum.jpg'

im = Image.open(INPUT)
print(f'Original size: {im.size}, mode: {im.mode}')

# Convert to RGB if needed (for JPEG output)
if im.mode != 'RGB':
    im = im.convert('RGB')

# Upscale to 1600px wide with LANCZOS (highest quality resampling)
target_w = 1600
target_h = int(target_w * im.size[1] / im.size[0])
print(f'Target size: {target_w}x{target_h}')
upscaled = im.resize((target_w, target_h), Image.LANCZOS)

# Apply slight unsharp mask to counteract upscaling softness
sharpened = upscaled.filter(ImageFilter.UnsharpMask(radius=1.5, percent=80, threshold=2))

# Slight saturation boost to compensate for any washed-out look from upscaling
enhancer = ImageEnhance.Color(sharpened)
final = enhancer.enhance(1.1)

# Save as high-quality JPEG
final.save(OUTPUT, 'JPEG', quality=92, optimize=True, progressive=True)
print(f'Saved: {OUTPUT}')
print(f'Final file size: {os.path.getsize(OUTPUT)} bytes')
print(f'Final dimensions: {final.size}')
