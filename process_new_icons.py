#!/usr/bin/env python3
"""Process user-provided icons from Downloads: remove near-black bg, center on 256x256 OLED black, apply glow."""
from PIL import Image, ImageFilter

OUTPUT = 'core-astro/public/images/icons/items'

def process_icon(src_path, dest_name, glow_color_threshold=15):
    img = Image.open(src_path).convert('RGBA')
    w, h = img.size

    # Remove near-black background pixels
    pixels = img.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if r + g + b < glow_color_threshold:
                pixels[x, y] = (0, 0, 0, 0)

    # Resize to fit within 220x220, maintain aspect ratio
    target = 220
    scale = min(target / w, target / h)
    new_w = int(w * scale)
    new_h = int(h * scale)
    img = img.resize((new_w, new_h), Image.LANCZOS)

    # Center on 256x256 transparent canvas
    canvas = Image.new('RGBA', (256, 256), (0, 0, 0, 0))
    offset_x = (256 - new_w) // 2
    offset_y = (256 - new_h) // 2
    canvas.paste(img, (offset_x, offset_y), img)

    # Apply glow (blur + composite)
    glow = canvas.copy()
    for _ in range(3):
        glow = glow.filter(ImageFilter.GaussianBlur(6))

    result = Image.new('RGBA', (256, 256), (0, 0, 0, 255))
    result = Image.alpha_composite(result, glow)
    result = Image.alpha_composite(result, canvas)

    path = f'{OUTPUT}/{dest_name}.png'
    result.save(path, 'PNG', optimize=True)
    print(f'  OK {dest_name}.png ({new_w}x{new_h} centered on 256x256)')

print("Processing new icons from Downloads...")
process_icon('/Users/user/Downloads/pièce.png', 'coin-gold')
process_icon('/Users/user/Downloads/pièces.png', 'coins-stack')
process_icon('/Users/user/Downloads/champignon.png', 'red-mushroom-spotted')
print("Done!")
