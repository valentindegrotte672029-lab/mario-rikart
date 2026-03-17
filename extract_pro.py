#!/usr/bin/env python3
"""
Professional icon extraction from neon grid images.
Produces 256x256 PNG icons with OLED-black background, neon content centered.
"""
import numpy as np
from PIL import Image
import os

OUTPUT_DIR = '/Users/user/mario-rikart/core-astro/public/images/icons/items'

def find_grid_separators(img_array, axis, threshold=200, min_run=8):
    """Find separator lines (white/bright) along an axis.
    axis=0: horizontal separators (scan rows)
    axis=1: vertical separators (scan cols)
    Returns merged groups (adjacent bright runs merged if gap < merge_gap).
    """
    if axis == 0:
        brightness = img_array[:,:,:3].max(axis=2).mean(axis=1)
    else:
        brightness = img_array[:,:,:3].max(axis=2).mean(axis=0)
    
    # Find runs of bright pixels
    is_bright = brightness > threshold
    raw_runs = []
    in_run = False
    run_start = 0
    
    for i in range(len(is_bright)):
        if is_bright[i] and not in_run:
            run_start = i
            in_run = True
        elif not is_bright[i] and in_run:
            if i - run_start >= min_run:
                raw_runs.append((run_start, i - 1))
            in_run = False
    if in_run and len(is_bright) - run_start >= min_run:
        raw_runs.append((run_start, len(is_bright) - 1))
    
    # Merge runs that are close together (gap < 50px) into single separator bands
    if not raw_runs:
        return []
    
    merged = [list(raw_runs[0])]
    for start, end in raw_runs[1:]:
        if start - merged[-1][1] < 50:
            merged[-1][1] = end  # extend current band
        else:
            merged.append([start, end])
    
    return [tuple(m) for m in merged]

def get_cell_regions(img_array, cols, rows):
    """Determine cell regions from grid image using separator detection."""
    h_seps = find_grid_separators(img_array, axis=0)
    v_seps = find_grid_separators(img_array, axis=1)
    
    h, w = img_array.shape[:2]
    
    print(f"  H separators (merged): {h_seps}")
    print(f"  V separators (merged): {v_seps}")
    
    # Build row/col boundaries
    # Use outermost separators as borders, subdivide interior evenly if not enough internal seps
    if len(h_seps) >= 2:
        content_top = h_seps[0][1] + 1
        content_bottom = h_seps[-1][0] - 1
    else:
        content_top = 0
        content_bottom = h - 1
    
    if len(h_seps) >= rows + 1:
        row_starts = []
        for i in range(rows):
            top = h_seps[i][1] + 1
            bottom = h_seps[i+1][0] - 1
            row_starts.append((top, bottom))
    else:
        # Evenly divide content area
        content_h = content_bottom - content_top + 1
        cell_h = content_h // rows
        row_starts = [(content_top + i * cell_h, content_top + (i+1) * cell_h - 1) for i in range(rows)]
    
    if len(v_seps) >= 2:
        content_left = v_seps[0][1] + 1
        content_right = v_seps[-1][0] - 1
    else:
        content_left = 0
        content_right = w - 1
    
    if len(v_seps) >= cols + 1:
        col_starts = []
        for j in range(cols):
            left = v_seps[j][1] + 1
            right = v_seps[j+1][0] - 1
            col_starts.append((left, right))
    else:
        # Evenly divide content area
        content_w = content_right - content_left + 1
        cell_w = content_w // cols
        col_starts = [(content_left + j * cell_w, content_left + (j+1) * cell_w - 1) for j in range(cols)]
    
    print(f"  Row bounds: {row_starts}")
    print(f"  Col bounds: {col_starts}")
    
    cells = []
    for r in range(rows):
        for c in range(cols):
            y1, y2 = row_starts[r]
            x1, x2 = col_starts[c]
            cells.append((x1, y1, x2, y2))
    
    return cells

def find_neon_content_bbox(cell_img, brightness_threshold=30):
    """Find the bounding box of actual neon content (non-dark pixels) in a cell."""
    arr = np.array(cell_img)
    if arr.shape[2] == 4:
        rgb = arr[:,:,:3]
    else:
        rgb = arr
    
    # A pixel is "content" if any channel exceeds the threshold
    content_mask = rgb.max(axis=2) > brightness_threshold
    
    if not content_mask.any():
        return None
    
    rows_with_content = np.where(content_mask.any(axis=1))[0]
    cols_with_content = np.where(content_mask.any(axis=0))[0]
    
    return (
        cols_with_content[0],   # left
        rows_with_content[0],   # top
        cols_with_content[-1],  # right
        rows_with_content[-1],  # bottom
    )

def extract_icon_256(cell_img, output_path, padding_pct=0.08):
    """
    Extract a 256x256 icon from a cell:
    1. Find neon content bounding box
    2. Crop to content with padding
    3. Place centered on 256x256 black canvas
    """
    bbox = find_neon_content_bbox(cell_img, brightness_threshold=25)
    if bbox is None:
        print(f"  WARNING: No content found for {output_path}")
        return False
    
    left, top, right, bottom = bbox
    content_w = right - left + 1
    content_h = bottom - top + 1
    
    # Add small padding around content
    pad = int(max(content_w, content_h) * padding_pct)
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(cell_img.width - 1, right + pad)
    bottom = min(cell_img.height - 1, bottom + pad)
    
    # Crop to content
    content_crop = cell_img.crop((left, top, right + 1, bottom + 1))
    crop_w, crop_h = content_crop.size
    
    # Scale to fit in 256x256 with some breathing room (90% of canvas)
    max_dim = max(crop_w, crop_h)
    target_size = int(256 * 0.90)
    scale = target_size / max_dim
    
    new_w = int(crop_w * scale)
    new_h = int(crop_h * scale)
    
    # High quality resize
    content_resized = content_crop.resize((new_w, new_h), Image.LANCZOS)
    
    # Create 256x256 black canvas (RGBA for clean compositing)
    canvas = Image.new('RGBA', (256, 256), (0, 0, 0, 255))
    
    # Center the content
    offset_x = (256 - new_w) // 2
    offset_y = (256 - new_h) // 2
    
    # Composite content onto black canvas
    canvas.paste(content_resized, (offset_x, offset_y), content_resized if content_resized.mode == 'RGBA' else None)
    
    # Save as PNG
    canvas.save(output_path, 'PNG', optimize=True)
    return True

def process_grid(image_path, cols, rows, icon_names, output_dir):
    """Process a complete grid image and extract all icons."""
    print(f"\n{'='*60}")
    print(f"Processing: {os.path.basename(image_path)}")
    print(f"Grid: {cols}x{rows} = {cols*rows} cells")
    print(f"{'='*60}")
    
    img = Image.open(image_path).convert('RGBA')
    arr = np.array(img)
    
    cells = get_cell_regions(arr, cols, rows)
    
    if len(icon_names) != len(cells):
        print(f"WARNING: {len(icon_names)} names for {len(cells)} cells!")
    
    os.makedirs(output_dir, exist_ok=True)
    
    for i, (x1, y1, x2, y2) in enumerate(cells):
        if i >= len(icon_names):
            break
        
        name = icon_names[i]
        if name is None:
            print(f"  Skipping cell {i} (no name)")
            continue
        
        cell = img.crop((x1, y1, x2 + 1, y2 + 1))
        out_path = os.path.join(output_dir, f"{name}.png")
        
        ok = extract_icon_256(cell, out_path)
        if ok:
            print(f"  [{i:2d}] {name}.png  (cell {x1},{y1}-{x2},{y2})")

# ============================================================
# GRID 1: Main icons 8x4 = 32
# Reading left-to-right, top-to-bottom from the Gemini grid
# ============================================================
GRID1_NAMES = [
    # Row 1 (top)
    'coin-gold',            # gold coin
    'coins-stack',          # stack of coins  
    'treasure-chest',       # treasure chest
    'fire-flower-pixel',    # fire flower
    'red-mushroom-spotted', # red mushroom
    'flask-purple-atomic',  # purple flask
    'flask-green-erlenmeyer', # green flask
    'flask-blue-beaker',    # blue beaker
    # Row 2
    'flask-orange-distill', # orange distill flask
    'poker-card',           # poker card (ace of spades)
    'peach-crown',          # peach crown
    'star-purple',          # purple star
    'shell-spiked-green',   # green shell
    'banana-peel-cyan',     # cyan banana peel
    'castle-gothic-purple', # purple gothic castle
    'classified-folder',    # classified folder
    # Row 3
    'brain-maze',           # brain maze
    'question-block',       # question block
    'wario-face',           # wario face
    'mario-face',           # mario face
    'luigi-face',           # luigi face
    'toad-mushroom',        # toad mushroom
    'star-mushroom-indigo', # indigo star mushroom
    'mushroom-red-poison',  # red poison mushroom
    # Row 4 (bottom)
    'mushroom-red-classic', # classic red mushroom
    'chrono-stopwatch',     # stopwatch
    'question-block-crossword', # crossword question block
    'constellation-stars',  # constellation
    'horoscope-stars',      # horoscope stars
    'potion-vial-cyan',     # cyan potion vial
    'banana-peel-teal',     # teal banana peel
    'test-person',          # test person silhouette
]

# ============================================================
# GRID 2: Animal horoscope icons 3x2 = 6
# ============================================================
GRID2_NAMES = [
    # Row 1
    'dragon-red',       # red dragon
    'lion-gold',        # gold lion
    'leopard-cyan',     # cyan leopard
    # Row 2
    'monkey-green',     # green monkey
    'rhino-purple',     # purple rhino
    'phoenix-magenta',  # magenta phoenix
]

# ============================================================
# GRID 3: Extra icons 4x2 = 8 (but only 6 used icons, 2 may be unused)
# ============================================================
GRID3_NAMES = [
    # Row 1
    'robot-ia-poker',       # robot/AI icon
    'join-request',         # join/hand icon
    'bbl-popup',            # BBL balloon icon
    'dev-filmstrip',        # filmstrip/dev icon
    # Row 2
    'warning-triangle',     # warning triangle
    'toad-vomit',           # toad vomit icon
    None,                   # unused cell (if exists)
    None,                   # unused cell (if exists)
]

if __name__ == '__main__':
    process_grid(
        '/Users/user/Downloads/Gemini_Generated_Image_2lxbuo2lxbuo2lxb.png',
        cols=8, rows=4, icon_names=GRID1_NAMES, output_dir=OUTPUT_DIR
    )
    process_grid(
        '/Users/user/Downloads/Gemini_Generated_Image_k4wckok4wckok4wc.png',
        cols=3, rows=2, icon_names=GRID2_NAMES, output_dir=OUTPUT_DIR
    )
    process_grid(
        '/Users/user/Downloads/Gemini_Generated_Image_g1xbi5g1xbi5g1xb.png',
        cols=4, rows=2, icon_names=GRID3_NAMES, output_dir=OUTPUT_DIR
    )
    
    print(f"\n{'='*60}")
    print("EXTRACTION COMPLETE")
    print(f"{'='*60}")
    # List what we produced
    count = 0
    for f in sorted(os.listdir(OUTPUT_DIR)):
        if f.endswith('.png'):
            fpath = os.path.join(OUTPUT_DIR, f)
            sz = Image.open(fpath).size
            count += 1
            print(f"  {f}: {sz[0]}x{sz[1]}")
    print(f"\nTotal: {count} icons")
