#!/usr/bin/env python3
"""Process user-provided coin and mushroom icons for the app."""
from PIL import Image, ImageFilter
import os

OUTPUT = '/Users/user/mario-rikart/core-astro/public/images/icons/items'

def process_icon(src_path, dest_name, glow_color, glow_blur=6, glow_passes=2):
    """Load source, remove near-black bg, center on 256x256 black, apply glow."""
    img = Image.open(src_path).convert('RGBA')
    px = img.load()

    # Remove near-black pixels (background) → make transparent
    threshold = 20
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if r < threshold and g < threshold and b < threshold:
                px[x, y] = (0, 0, 0, 0)

    # Upscale to fit 200px max dimension (centered in 256x256)
    target_dim = 200
    ratio = target_dim / max(img.width, img.height)
    new_w = int(img.width * ratio)
    new_h = int(img.height * ratio)
    img = img.resize((new_w, new_h), Image.LANCZOS)

    # Center on transparent 256x256 canvas
    canvas = Image.new('RGBA', (256, 256), (0, 0, 0, 0))
    offset_x = (256 - new_w) // 2
    offset_y = (256 - new_h) // 2
    canvas.paste(img, (offset_x, offset_y), img)

    # Apply neon glow
    glow = canvas.copy()
    for _ in range(glow_passes):
        glow = glow.filter(ImageFilter.GaussianBlur(glow_blur))
    result = Image.new('RGBA', (256, 256), (0, 0, 0, 0))
    result = Image.alpha_composite(result, glow)
    result = Image.alpha_composite(result, canvas)

    # Composite onto solid black
    black = Image.new('RGBA', (256, 256), (0, 0, 0, 255))
    final = Image.alpha_composite(black, result)

    path = os.path.join(OUTPUT, f'{dest_name}.png')
    final.save(path, 'PNG', optimize=True)
    print(f'  ✓ {dest_name}.png ({img.size[0]}x{img.size[1]} upscaled → 256x256)')

if __name__ == '__main__':
    print("=== Processing user-provided icons ===\n")

    process_icon('/Users/user/Downloads/pièce.png', 'coin-gold',
                 glow_color=(255, 215, 0), glow_blur=8, glow_passes=3)

    process_icon('/Users/user/Downloads/pièces.png', 'coins-stack',
                 glow_color=(255, 215, 0), glow_blur=8, glow_passes=3)

    process_icon('/Users/user/Downloads/champignon.png', 'red-mushroom-spotted',
                 glow_color=(255, 50, 50), glow_blur=7, glow_passes=2)

    print("\n=== Done ===")
