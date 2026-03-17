#!/usr/bin/env python3
"""Extract individual icons from the neon icon grid image."""
from PIL import Image
import numpy as np
import os

# Try both recent Gemini images - pick the one that matches user's attachment
GRID_PATH = '/Users/user/Downloads/Gemini_Generated_Image_2lxbuo2lxbuo2lxb.png'
OUT_DIR = '/Users/user/mario-rikart/core-astro/public/images/icons/items'
os.makedirs(OUT_DIR, exist_ok=True)

img = Image.open(GRID_PATH)
w, h = img.size
print(f'Grid image: {w}x{h}')

# Grid is 8 columns x 4 rows
COLS = 8
ROWS = 4
cell_w = w / COLS
cell_h = h / ROWS
print(f'Cell size: {cell_w:.1f} x {cell_h:.1f}')

# Icon names mapped by position (row, col) - 0-indexed
# Row 0: nav icons (already done)
# Row 1: nav icons continued + horoscope
# Row 2: Toad-xique flasks + other items
# Row 3: bananas, castle, star, mushrooms, shell

ICON_MAP = {
    # Row 0 - nav icons (1-8)
    (0, 0): 'mario-face',
    (0, 1): 'luigi-face',
    (0, 2): 'peach-crown',
    (0, 3): 'toad-mushroom',
    (0, 4): 'wario-face',
    (0, 5): 'test-person',
    (0, 6): 'question-block',
    (0, 7): 'red-mushroom-spotted',
    # Row 1 - more icons (9-16... but 8 items)
    (1, 0): 'chrono-stopwatch',
    (1, 1): 'poker-card',
    (1, 2): 'classified-folder',
    (1, 3): 'brain-maze',
    (1, 4): 'potion-vial-cyan',
    (1, 5): 'question-block-crossword',
    (1, 6): 'constellation-stars',  # This might be at end of row or different position
    (1, 7): 'horoscope-stars',
    # Row 2 - Toad-xique flasks + game items
    (2, 0): 'flask-purple-atomic',
    (2, 1): 'flask-green-erlenmeyer',
    (2, 2): 'flask-blue-beaker',
    (2, 3): 'flask-orange-distill',
    (2, 4): 'coin-gold',
    (2, 5): 'coins-stack',
    (2, 6): 'treasure-chest',
    (2, 7): 'fire-flower-pixel',
    # Row 3 - misc items
    (3, 0): 'banana-peel-cyan',
    (3, 1): 'banana-peel-teal',
    (3, 2): 'castle-gothic-purple',
    (3, 3): 'star-purple',
    (3, 4): 'star-mushroom-indigo',
    (3, 5): 'mushroom-red-poison',
    (3, 6): 'mushroom-red-classic',
    (3, 7): 'shell-spiked-green',
}

# Extract each cell with slight padding inset
PADDING = 8  # pixels to trim from each edge

for (row, col), name in ICON_MAP.items():
    left = int(col * cell_w) + PADDING
    top = int(row * cell_h) + PADDING
    right = int((col + 1) * cell_w) - PADDING
    bottom = int((row + 1) * cell_h) - PADDING
    
    cell = img.crop((left, top, right, bottom))
    out_path = os.path.join(OUT_DIR, f'{name}.png')
    cell.save(out_path, 'PNG')
    print(f'Saved: {name}.png ({cell.size[0]}x{cell.size[1]})')

print(f'\nDone! Extracted {len(ICON_MAP)} icons to {OUT_DIR}')
