#!/usr/bin/env python3
"""Analyze ALL Gemini grids to find the comprehensive 10x6 one."""
import numpy as np
from PIL import Image
import os

def count_separators(img_path, threshold=200, min_run=8, merge_gap=50):
    img = np.array(Image.open(img_path))
    h, w = img.shape[:2]
    
    def find_seps(axis):
        if axis == 0:
            brightness = img[:,:,:3].max(axis=2).mean(axis=1)
        else:
            brightness = img[:,:,:3].max(axis=2).mean(axis=0)
        
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
        
        # Merge close runs
        if not raw_runs:
            return []
        merged = [list(raw_runs[0])]
        for start, end in raw_runs[1:]:
            if start - merged[-1][1] < merge_gap:
                merged[-1][1] = end
            else:
                merged.append([start, end])
        return [tuple(m) for m in merged]
    
    h_seps = find_seps(0)
    v_seps = find_seps(1)
    
    # Grid size = (v_seps - 1) x (h_seps - 1) if borders counted
    est_cols = max(0, len(v_seps) - 1)
    est_rows = max(0, len(h_seps) - 1)
    
    return est_cols, est_rows, h_seps, v_seps

files = [
    '9agxos9agxos9agx',
    'hjkupjhjkupjhjku',
    'ka0k6hka0k6hka0k',
    'mqsgyxmqsgyxmqsg',
    'np0t0inp0t0inp0t',
    # Already processed:
    '2lxbuo2lxbuo2lxb',
    'k4wckok4wckok4wc',
    'g1xbi5g1xbi5g1xb',
]

for f in files:
    path = f'/Users/user/Downloads/Gemini_Generated_Image_{f}.png'
    cols, rows, h_seps, v_seps = count_separators(path)
    img = Image.open(path)
    w, h = img.size
    print(f"\n{f}: {w}x{h}")
    print(f"  H seps: {len(h_seps)} -> {rows} rows")
    print(f"  V seps: {len(v_seps)} -> {cols} cols")
    print(f"  Estimated grid: {cols}x{rows} = {cols*rows} cells")
    if len(h_seps) <= 10:
        print(f"  H positions: {h_seps}")
    if len(v_seps) <= 15:
        print(f"  V positions: {v_seps}")
