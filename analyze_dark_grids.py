#!/usr/bin/env python3
"""Analyze the non-white-separator grid images by looking at content patterns."""
import numpy as np
from PIL import Image

files = {
    'hjkupjhjkupjhjku': '/Users/user/Downloads/Gemini_Generated_Image_hjkupjhjkupjhjku.png',
    'ka0k6hka0k6hka0k': '/Users/user/Downloads/Gemini_Generated_Image_ka0k6hka0k6hka0k.png',
    'mqsgyxmqsgyxmqsg': '/Users/user/Downloads/Gemini_Generated_Image_mqsgyxmqsgyxmqsg.png',
    'np0t0inp0t0inp0t': '/Users/user/Downloads/Gemini_Generated_Image_np0t0inp0t0inp0t.png',
}

for name, path in files.items():
    img = np.array(Image.open(path))
    h, w = img.shape[:2]
    print(f"\n=== {name}: {w}x{h} ===")
    
    # Look for dark gaps between icons (brightness valleys)
    # Row-wise: average brightness
    row_brightness = img[:,:,:3].max(axis=2).mean(axis=1)
    
    # Find dark valleys (brightness < 15)
    dark_threshold = 15
    is_dark = row_brightness < dark_threshold
    
    # Find dark runs
    dark_runs = []
    in_dark = False
    start = 0
    for y in range(h):
        if is_dark[y] and not in_dark:
            start = y
            in_dark = True
        elif not is_dark[y] and in_dark:
            if y - start >= 3:  # At least 3px dark gap
                dark_runs.append((start, y-1))
            in_dark = False
    if in_dark:
        dark_runs.append((start, h-1))
    
    print(f"  Dark H runs (gaps): {len(dark_runs)}")
    for dr in dark_runs[:20]:
        print(f"    y={dr[0]}-{dr[1]} (width={dr[1]-dr[0]+1})")
    
    # Column-wise
    col_brightness = img[:,:,:3].max(axis=2).mean(axis=0)
    is_dark_col = col_brightness < dark_threshold
    
    dark_cols = []
    in_dark = False
    start = 0
    for x in range(w):
        if is_dark_col[x] and not in_dark:
            start = x
            in_dark = True
        elif not is_dark_col[x] and in_dark:
            if x - start >= 3:
                dark_cols.append((start, x-1))
            in_dark = False
    if in_dark:
        dark_cols.append((start, w-1))
    
    print(f"  Dark V runs (gaps): {len(dark_cols)}")
    for dc in dark_cols[:20]:
        print(f"    x={dc[0]}-{dc[1]} (width={dc[1]-dc[0]+1})")
    
    # Estimate grid
    if dark_runs:
        n_rows = len(dark_runs) - 1 if dark_runs[0][0] < 5 else len(dark_runs) + 1
    else:
        n_rows = 1
    if dark_cols:
        n_cols = len(dark_cols) - 1 if dark_cols[0][0] < 5 else len(dark_cols) + 1
    else:
        n_cols = 1
    print(f"  Estimated grid: {n_cols} cols x {n_rows} rows = {n_cols*n_rows} cells")
