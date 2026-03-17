#!/usr/bin/env python3
"""Identify each cell content by analyzing shape, color distribution, and position.
Cross-reference with the user's description to build the name mapping."""
import numpy as np
from PIL import Image
import os

DEBUG = '/Users/user/mario-rikart/grid_debug/icons_grid'

# Analyze each cell for more detail
for r in range(5):
    print(f"\n{'='*60}")
    print(f"ROW {r}")
    print(f"{'='*60}")
    for c in range(10):
        path = os.path.join(DEBUG, f'cell_r{r}_c{c}.png')
        img = np.array(Image.open(path).convert('RGB'))
        
        content_mask = img.max(axis=2) > 40
        if content_mask.sum() < 50:
            print(f"  [{r},{c}] EMPTY")
            continue
        
        bright = img[content_mask]
        avg = bright.mean(axis=0).astype(int)
        
        # Get the brightest pixels (top 10%)
        max_ch = img.max(axis=2)
        top_thresh = np.percentile(max_ch[content_mask], 90)
        top_mask = max_ch > top_thresh
        top_pixels = img[top_mask]
        top_avg = top_pixels.mean(axis=0).astype(int) if len(top_pixels) > 0 else avg
        
        # Content bounding box
        rows_c = np.where(content_mask.any(axis=1))[0]
        cols_c = np.where(content_mask.any(axis=0))[0]
        bbox_h = rows_c[-1] - rows_c[0] + 1
        bbox_w = cols_c[-1] - cols_c[0] + 1
        aspect = bbox_w / bbox_h if bbox_h > 0 else 0
        fill = content_mask.sum() / content_mask.size * 100
        
        # Color channel dominance
        r_ch = avg[0]; g_ch = avg[1]; b_ch = avg[2]
        max_ch_val = max(r_ch, g_ch, b_ch)
        
        print(f"  [{r},{c}] avg=({r_ch:3d},{g_ch:3d},{b_ch:3d}) top90=({top_avg[0]:3d},{top_avg[1]:3d},{top_avg[2]:3d}) fill={fill:.0f}% aspect={aspect:.2f} bbox={bbox_w}x{bbox_h}")
