#!/usr/bin/env python3
"""Extract ALL cells from ALL Gemini grids into numbered debug folders."""
import numpy as np
from PIL import Image
import os

def extract_cells_adaptive(img_path, output_dir, forced_grid=None):
    """Extract all cells from a grid image, auto-detecting grid layout."""
    img = Image.open(img_path).convert('RGBA')
    arr = np.array(img)
    h, w = arr.shape[:2]
    name = os.path.basename(img_path).replace('Gemini_Generated_Image_', '').replace('.png', '')
    
    out = os.path.join(output_dir, name)
    os.makedirs(out, exist_ok=True)
    
    print(f"\n{'='*60}")
    print(f"{name}: {w}x{h}")
    
    if forced_grid:
        cols, rows = forced_grid
    else:
        # Try to detect grid
        # Method 1: White separators (threshold 200)
        cols, rows = detect_white_grid(arr)
        if cols * rows < 4:
            # Method 2: Dark gaps (threshold 15)
            cols, rows = detect_dark_grid(arr)
        if cols * rows < 4:
            # Method 3: Even division heuristic
            # Common grids: 8x4, 6x4, 4x2, 3x2, 10x6
            # Try likely sizes based on aspect ratio
            aspect = w / h
            if aspect > 1.5:  # Landscape
                candidates = [(8,4), (6,4), (10,6), (4,2), (3,2)]
            else:  # Portrait or square
                candidates = [(4,8), (4,6), (6,10), (2,4), (2,3)]
            cols, rows = candidates[0]
            print(f"  Using fallback grid: {cols}x{rows}")
    
    print(f"  Grid: {cols}x{rows} = {cols*rows} cells")
    
    cell_w = w // cols
    cell_h = h // rows
    
    for r in range(rows):
        for c in range(cols):
            idx = r * cols + c
            x1 = c * cell_w
            y1 = r * cell_h
            x2 = x1 + cell_w
            y2 = y1 + cell_h
            
            cell = img.crop((x1, y1, x2, y2))
            
            # Check if cell has content
            cell_arr = np.array(cell)[:,:,:3]
            max_brightness = cell_arr.max()
            avg_brightness = cell_arr.mean()
            
            cell.save(os.path.join(out, f"cell_{idx:02d}_r{r}c{c}.png"))
            
            # Quick content description
            if max_brightness < 20:
                desc = "EMPTY"
            elif avg_brightness < 10:
                desc = "sparse"
            else:
                desc = f"content (avg={avg_brightness:.1f} max={max_brightness})"
            
            print(f"  [{idx:2d}] r{r}c{c}: {desc}")

def detect_white_grid(arr):
    h, w = arr.shape[:2]
    
    def find_seps(axis, threshold=200, min_run=8, merge_gap=50):
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
                    raw_runs.append((start, i-1))
                in_run = False
        if in_run and len(is_bright) - start >= min_run:
            raw_runs.append((start, len(is_bright)-1))
        if not raw_runs:
            return []
        merged = [list(raw_runs[0])]
        for s, e in raw_runs[1:]:
            if s - merged[-1][1] < merge_gap:
                merged[-1][1] = e
            else:
                merged.append([s, e])
        return [tuple(m) for m in merged]
    
    h_seps = find_seps(0)
    v_seps = find_seps(1)
    cols = max(0, len(v_seps) - 1)
    rows = max(0, len(h_seps) - 1)
    if cols > 0 and rows > 0:
        print(f"  White separator grid: {cols}x{rows}")
    return cols, rows

def detect_dark_grid(arr):
    h, w = arr.shape[:2]
    
    def find_dark_gaps(axis, threshold=12, min_run=3):
        if axis == 0:
            brightness = arr[:,:,:3].max(axis=2).mean(axis=1)
        else:
            brightness = arr[:,:,:3].max(axis=2).mean(axis=0)
        is_dark = brightness < threshold
        runs = []
        in_run = False
        start = 0
        for i in range(len(is_dark)):
            if is_dark[i] and not in_run:
                start = i
                in_run = True
            elif not is_dark[i] and in_run:
                if i - start >= min_run:
                    runs.append((start, i-1))
                in_run = False
        if in_run and len(is_dark) - start >= min_run:
            runs.append((start, len(is_dark)-1))
        return runs
    
    h_gaps = find_dark_gaps(0)
    v_gaps = find_dark_gaps(1)
    # The number of cells = gaps + 1 if no border gaps, or gaps - 1 if border gaps on both sides
    rows = max(0, len(h_gaps) - 1) if h_gaps and h_gaps[0][0] < 10 else len(h_gaps) + 1
    cols = max(0, len(v_gaps) - 1) if v_gaps and v_gaps[0][0] < 10 else len(v_gaps) + 1
    if cols > 0 and rows > 0:
        print(f"  Dark gap grid: {cols}x{rows}")
    return cols, rows

OUTPUT = '/Users/user/mario-rikart/grid_debug'
os.makedirs(OUTPUT, exist_ok=True)

# Process ALL Gemini images with known/forced grids
grids = [
    ('Gemini_Generated_Image_9agxos9agxos9agx.png', None),
    ('Gemini_Generated_Image_hjkupjhjkupjhjku.png', None),
    ('Gemini_Generated_Image_ka0k6hka0k6hka0k.png', None),
    ('Gemini_Generated_Image_mqsgyxmqsgyxmqsg.png', (8, 4)),  # try 8x4  
    ('Gemini_Generated_Image_np0t0inp0t0inp0t.png', (6, 10)),  # try 6x10 portrait
]

for fname, forced in grids:
    path = os.path.join('/Users/user/Downloads', fname)
    if os.path.exists(path):
        extract_cells_adaptive(path, OUTPUT, forced_grid=forced)
