#!/usr/bin/env python3
"""Detect white separator grid and extract cells from icons_grid.png."""
import numpy as np
from PIL import Image
import os

img = Image.open('/Users/user/Downloads/icons_grid.png').convert('RGBA')
arr = np.array(img)
h, w = arr.shape[:2]
print(f"Image: {w}x{h}")

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

print(f"\nH separators ({len(h_seps)}):")
for s in h_seps:
    print(f"  y={s[0]}-{s[1]} (w={s[1]-s[0]+1})")

print(f"\nV separators ({len(v_seps)}):")
for s in v_seps:
    print(f"  x={s[0]}-{s[1]} (w={s[1]-s[0]+1})")

rows = len(h_seps) - 1
cols = len(v_seps) - 1
print(f"\nGrid: {cols} cols x {rows} rows = {cols * rows} cells")

# Extract cells
cells = []
for r in range(rows):
    for c in range(cols):
        y1 = h_seps[r][1] + 1
        y2 = h_seps[r+1][0] - 1
        x1 = v_seps[c][1] + 1
        x2 = v_seps[c+1][0] - 1
        cells.append((r, c, x1, y1, x2, y2))
        cell_w = x2 - x1 + 1
        cell_h = y2 - y1 + 1
        
        # Check cell content
        cell_arr = arr[y1:y2+1, x1:x2+1, :3]
        max_b = cell_arr.max()
        avg_b = cell_arr.mean()
        
        # Dominant color
        content_mask = cell_arr.max(axis=2) > 40
        if content_mask.sum() > 100:
            bright_px = cell_arr[content_mask]
            rc, gc, bc = bright_px.mean(axis=0).astype(int)
            if rc > gc * 1.3 and rc > bc * 1.3:
                col_desc = "RED"
            elif gc > rc * 1.3 and gc > bc * 1.3:
                col_desc = "GREEN"
            elif bc > rc * 1.2 and bc > gc * 1.2:
                col_desc = "BLUE/PURPLE"
            elif rc > 130 and gc > 80 and bc < 80:
                col_desc = "GOLD/ORANGE"
            elif rc > 130 and bc > 100 and gc < 80:
                col_desc = "MAGENTA/PINK"
            elif gc > 100 and bc > 100 and rc < 80:
                col_desc = "CYAN"
            else:
                col_desc = f"MIXED"
            col_desc += f" rgb=({rc},{gc},{bc})"
        else:
            col_desc = "EMPTY"
        
        print(f"  [{r},{c}] ({cell_w}x{cell_h}) {col_desc}")

# Save cells to debug dir
debug_dir = '/Users/user/mario-rikart/grid_debug/icons_grid'
os.makedirs(debug_dir, exist_ok=True)
for r, c, x1, y1, x2, y2 in cells:
    cell = img.crop((x1, y1, x2+1, y2+1))
    cell.save(os.path.join(debug_dir, f'cell_r{r}_c{c}.png'))
print(f"\nSaved {len(cells)} cells to {debug_dir}")
