#!/usr/bin/env python3
"""Analyze the comprehensive icons_grid.png layout."""
import numpy as np
from PIL import Image

img = np.array(Image.open('/Users/user/Downloads/icons_grid.png'))
h, w = img.shape[:2]
print(f"Image: {w}x{h} channels={img.shape[2]}")

# Scan for dark gaps (black separators between cells)
row_brightness = img[:,:,:3].max(axis=2).mean(axis=1)
col_brightness = img[:,:,:3].max(axis=2).mean(axis=0)

# Find dark valleys
def find_dark_runs(brightness, threshold=12, min_run=2):
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

h_gaps = find_dark_runs(row_brightness)
v_gaps = find_dark_runs(col_brightness)

print(f"\nHorizontal dark gaps: {len(h_gaps)}")
for g in h_gaps:
    print(f"  y={g[0]}-{g[1]} (width={g[1]-g[0]+1})")

print(f"\nVertical dark gaps: {len(v_gaps)}")
for g in v_gaps:
    print(f"  x={g[0]}-{g[1]} (width={g[1]-g[0]+1})")

# Also try with different thresholds
for thresh in [8, 15, 20, 30]:
    hg = find_dark_runs(row_brightness, threshold=thresh)
    vg = find_dark_runs(col_brightness, threshold=thresh)
    print(f"\nThreshold {thresh}: {len(hg)} h_gaps, {len(vg)} v_gaps")

# Print brightness profile
print("\nRow brightness (every pixel block):")
step = max(1, h // 80)
for y in range(0, h, step):
    b = row_brightness[y]
    bar = "#" * min(50, int(b / 5))
    print(f"  y={y:4d}: {b:6.1f} {bar}")

print("\nCol brightness (every pixel block):")
step = max(1, w // 80)
for x in range(0, w, step):
    b = col_brightness[x]
    bar = "#" * min(50, int(b / 5))
    print(f"  x={x:4d}: {b:6.1f} {bar}")
