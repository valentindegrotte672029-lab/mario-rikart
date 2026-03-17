#!/usr/bin/env python3
"""
Professional extraction from the comprehensive icons_grid.png.
10 cols x 5 rows = 50 icons → 256x256 PNG with OLED black background.

Name mapping based on user description + color analysis of attached image:

ROW 0 - Character Heads:
[0,0] Mario head (RED)          → mario-face
[0,1] Luigi head+controller (GREEN) → luigi-face  
[0,2] Crown Peach (PINK/PURPLE) → peach-crown
[0,3] Peach-parody head (MAGENTA) → peach-parody (NEW - was not in old set)
[0,4] Toad head vomiting (CYAN) → toad-mushroom
[0,5] Wario head+beer (GOLD)   → wario-face
[0,6] ? block character (PURPLE/BLUE) - looks like Toad face → test-person  
[0,7] Mario alt / small (RED)  → mario-face-alt (NEW or variant?)
[0,8] Wario alt (GOLD)         → wario-face-alt (NEW?)
[0,9] Heart/love (PURPLE)      → heart-purple (NEW)

ROW 1 - UI / Functions:
[1,0] Robot AI Poker (RED)      → robot-ia-poker
[1,1] Join Request Hand (GREEN) → join-request
[1,2] BBL Popup Peach (FUCHSIA) → bbl-popup
[1,3] Dev Filmstrip (ORANGE)    → dev-filmstrip
[1,4] Warning Triangle (GOLD)   → warning-triangle
[1,5] Warning Triangle 2 (GOLD) → warning-triangle (duplicate? or warning-exclamation)
[1,6] Classified Folder (CYAN)  → classified-folder
[1,7] Classified/Gear? (RED)    → classified-gear (NEW?)
[1,8] Classified/Orange (ORANGE) → classified-orange (NEW?)
[1,9] Folder/Search (CYAN)     → folder-search (NEW?)

Wait - I need to look at this more carefully. Let me re-examine by looking at the
actual attached image the user sent.
"""

# Looking at the user's attached image (10x6 grid description):
# The image shows icons in roughly this layout:
#
# Row 0: Mario, Luigi+ctrl, Crown, Peach(ball?), Toad, Wario-beer, Toad?(purple), Mario-red, Wario-small, Heart-purple
# Row 1: Robot-poker, Hand-green, Heart-peach, Film-dev, Warning1, Warning2, Classified-cyan, Gear-red, Gear-orange, Folder-cyan
# Row 2: Star-gold, Coins-stack, Chest, Flower-green, Wave-orange, Dragon-red, Diamond-magenta, Gift-green, BlueThing, Pear(?gold)
# Row 3: Flask-purple, Flask-green, Flask-blue, Flask-amber, Potion-cyan, Lion-gold, Leopard-cyan, Monkey-green, Rhino-purple, Rhino-purple2
# Row 4: Fire-pink, Phoenix-pink, QuestionBlock-MOTS, QuestionBlock, Banana-cyan, Castle-purple, Star-constel, Mushroom-red, Shell-green(?), Constellation

# This is getting complex. Let me just extract all 50 cells with proper quality
# and use indexed names. The user can then confirm the mapping.

import numpy as np
from PIL import Image
import os

OUTPUT_DIR = '/Users/user/mario-rikart/core-astro/public/images/icons/items'

img = Image.open('/Users/user/Downloads/icons_grid.png').convert('RGBA')
arr = np.array(img)
h, w = arr.shape[:2]

def find_white_separators(arr, axis, threshold=200, min_run=5, merge_gap=30):
    if axis == 0:
        brightness = arr[:,:,:3].max(axis=2).mean(axis=1)
    else:
        brightness = arr[:,:,:3].max(axis=2).mean(axis=0)
    is_bright = brightness > threshold
    raw_runs = []
    in_run = False
    start = 0
    for i in range(len(is_bright)):
        if is_bright[i] and not in_run:
            start = i
            in_run = True
        elif not is_bright[i] and in_run:
            if i - start >= min_run:
                raw_runs.append((start, i - 1))
            in_run = False
    if in_run and len(is_bright) - start >= min_run:
        raw_runs.append((start, len(is_bright) - 1))
    if not raw_runs:
        return []
    merged = [list(raw_runs[0])]
    for s, e in raw_runs[1:]:
        if s - merged[-1][1] < merge_gap:
            merged[-1][1] = e
        else:
            merged.append([s, e])
    return [tuple(m) for m in merged]

h_seps = find_white_separators(arr, axis=0)
v_seps = find_white_separators(arr, axis=1)

rows_count = len(h_seps) - 1
cols_count = len(v_seps) - 1
print(f"Grid: {cols_count}x{rows_count} = {cols_count * rows_count} cells")

# ========================
# NAME MAPPING (10x5 = 50 icons)
# Based on user's description and attached image analysis:
#
# Row 0 - Character Heads (ligne 1):
#   Mario RED, Luigi GREEN+controller, Peach Crown ROSE, 
#   Peach-parody MAGENTA, Toad CYAN+vomit, Wario GOLD+beer
#   + 4 more: looks like some blue/purple face, a smaller red (mario?), gold face, purple heart
#
# Row 1 - UI/Functions (ligne 2):
#   Robot AI RED, Join Hand GREEN, BBL FUCHSIA, Dev Film ORANGE,
#   Warning GOLD, Warning GOLD (2), Classified CYAN, + more UI icons
#
# Row 2 - Gaming(coins/chest/flower) + some animals:
#   Star/coin GOLD, Coins-stack GOLD, Treasure GOLD, Fire-flower GREEN,
#   Orange-wave, Dragon RED, Diamond MAGENTA, Gift GREEN, Something CYAN, Pear? GOLD
#
# Row 3 - Flasks + Animals:
#   Flask PURPLE, Flask GREEN, Flask BLUE, Flask AMBER, 
#   Potion CYAN, Lion GOLD, Leopard CYAN, Monkey GREEN, Rhino PURPLE, Rhino PURPLE
#
# Row 4 - Fire/Phoenix/Blocks/Objects:
#   Fire PINK, Phoenix PINK, QuestionBlock(MOTS) INDIGO, QuestionBlock INDIGO,
#   Banana CYAN, Castle PURPLE, Constellation, Mushroom RED, Shell GREEN, Constellation-stars
# ========================

NAMES = [
    # Row 0 - Têtes de personnages
    'mario-face',              # [0,0] RED - Mario head
    'luigi-face',              # [0,1] GREEN - Luigi head + controller
    'peach-crown',             # [0,2] PINK/PURPLE - Peach crown
    'peach-parody',            # [0,3] MAGENTA - Peach parody (Penchliannee)
    'toad-mushroom',           # [0,4] CYAN - Toad head
    'wario-face',              # [0,5] GOLD - Wario head + beer
    'toad-vomit',              # [0,6] BLUE/PURPLE - Toad vomiting
    'mario-face-small',        # [0,7] RED small - alternate Mario
    'wario-face-small',        # [0,8] GOLD - Wario variant
    'heart-purple',            # [0,9] PURPLE - purple heart

    # Row 1 - UI / Fonctions App
    'robot-ia-poker',          # [1,0] RED - Robot AI
    'join-request',            # [1,1] GREEN - Hand/join
    'bbl-popup',               # [1,2] FUCHSIA - BBL peach
    'dev-filmstrip',           # [1,3] ORANGE - Film dev
    'warning-triangle',        # [1,4] GOLD - Warning !
    'warning-triangle-2',      # [1,5] GOLD - Warning ! (variant)
    'classified-folder',       # [1,6] CYAN - Classified
    'classified-gear',         # [1,7] RED - Gear/settings
    'classified-envelope',     # [1,8] ORANGE - Envelope/mail
    'folder-search',           # [1,9] CYAN - Folder + search

    # Row 2 - Gaming / Objects
    'star-mushroom-indigo',    # [2,0] GOLD - Star coin
    'coins-stack',             # [2,1] GOLD - Pile of coins
    'treasure-chest',          # [2,2] GOLD - Treasure chest
    'fire-flower-pixel',       # [2,3] GREEN - Fire flower pixel
    'ripple-orange',           # [2,4] ORANGE - Wave/ripple
    'dragon-red',              # [2,5] RED - Dragon horoscope
    'diamond-magenta',         # [2,6] MAGENTA - Diamond
    'gift-green',              # [2,7] GREEN - Gift box
    'question-block-blue',     # [2,8] CYAN - ? block variant
    'coin-gold',               # [2,9] GOLD - Single gold coin / pear?

    # Row 3 - Flasks + Animals  
    'flask-purple-atomic',     # [3,0] PURPLE - Purple flask
    'flask-green-erlenmeyer',  # [3,1] GREEN - Green flask
    'flask-blue-beaker',       # [3,2] BLUE - Blue flask
    'flask-orange-distill',    # [3,3] AMBER/ORANGE - Amber distill
    'potion-vial-cyan',        # [3,4] CYAN - Cyan potion
    'lion-gold',               # [3,5] GOLD - Lion horoscope
    'leopard-cyan',            # [3,6] CYAN - Leopard horoscope
    'monkey-green',            # [3,7] GREEN - Monkey horoscope
    'rhino-purple',            # [3,8] PURPLE - Rhino horoscope
    'phoenix-magenta',         # [3,9] PURPLE - Phoenix horoscope

    # Row 4 - Fire/Phoenix/Blocks/Misc
    'fire-red',                # [4,0] PINK/RED - Fire
    'phoenix-bird',            # [4,1] PINK/RED - Phoenix bird
    'question-block-crossword',# [4,2] INDIGO - MOTS KARTÉS block
    'question-block',          # [4,3] INDIGO - Simple question block
    'banana-peel-cyan',        # [4,4] CYAN - Banana peel
    'castle-gothic-purple',    # [4,5] PURPLE - Gothic castle
    'shooting-stars',          # [4,6] DARK PURPLE - Shooting stars
    'mushroom-red-classic',    # [4,7] RED - Classic mushroom
    'shell-spiked-green',      # [4,8] GREEN - Spikey shell
    'constellation-stars',     # [4,9] PURPLE - Constellation
]

def find_neon_content_bbox(cell_arr, brightness_threshold=25):
    rgb = cell_arr[:,:,:3]
    content_mask = rgb.max(axis=2) > brightness_threshold
    if not content_mask.any():
        return None
    rows_c = np.where(content_mask.any(axis=1))[0]
    cols_c = np.where(content_mask.any(axis=0))[0]
    return (cols_c[0], rows_c[0], cols_c[-1], rows_c[-1])

def extract_icon_256(cell_img, output_path, padding_pct=0.08):
    cell_arr = np.array(cell_img)
    bbox = find_neon_content_bbox(cell_arr)
    if bbox is None:
        print(f"  WARNING: No content for {output_path}")
        return False
    
    left, top, right, bottom = bbox
    content_w = right - left + 1
    content_h = bottom - top + 1
    
    pad = int(max(content_w, content_h) * padding_pct)
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(cell_img.width - 1, right + pad)
    bottom = min(cell_img.height - 1, bottom + pad)
    
    content_crop = cell_img.crop((left, top, right + 1, bottom + 1))
    crop_w, crop_h = content_crop.size
    
    max_dim = max(crop_w, crop_h)
    target_size = int(256 * 0.90)
    scale = target_size / max_dim
    
    new_w = int(crop_w * scale)
    new_h = int(crop_h * scale)
    
    content_resized = content_crop.resize((new_w, new_h), Image.LANCZOS)
    
    canvas = Image.new('RGBA', (256, 256), (0, 0, 0, 255))
    offset_x = (256 - new_w) // 2
    offset_y = (256 - new_h) // 2
    
    canvas.paste(content_resized, (offset_x, offset_y), 
                 content_resized if content_resized.mode == 'RGBA' else None)
    canvas.save(output_path, 'PNG', optimize=True)
    return True

os.makedirs(OUTPUT_DIR, exist_ok=True)

extracted = 0
for r in range(rows_count):
    for c in range(cols_count):
        idx = r * cols_count + c
        if idx >= len(NAMES):
            break
        
        name = NAMES[idx]
        
        y1 = h_seps[r][1] + 1
        y2 = h_seps[r+1][0] - 1
        x1 = v_seps[c][1] + 1
        x2 = v_seps[c+1][0] - 1
        
        cell = img.crop((x1, y1, x2 + 1, y2 + 1))
        out_path = os.path.join(OUTPUT_DIR, f"{name}.png")
        
        ok = extract_icon_256(cell, out_path)
        if ok:
            print(f"  [{r},{c}] → {name}.png")
            extracted += 1

print(f"\nExtracted {extracted} icons to {OUTPUT_DIR}")

# Verify all are 256x256
print("\nVerification:")
for f in sorted(os.listdir(OUTPUT_DIR)):
    if f.endswith('.png'):
        img_check = Image.open(os.path.join(OUTPUT_DIR, f))
        sz = img_check.size
        status = "OK" if sz == (256, 256) else f"WRONG SIZE {sz}"
        print(f"  {f}: {sz[0]}x{sz[1]} {status}")
