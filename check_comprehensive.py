#!/usr/bin/env python3
"""Examine mqsgyxmqsgyxmqsg and np0t0inp0t0inp0t for icon content."""
import numpy as np
from PIL import Image

for name in ['mqsgyxmqsgyxmqsg', 'np0t0inp0t0inp0t']:
    path = f'/Users/user/Downloads/Gemini_Generated_Image_{name}.png'
    img = np.array(Image.open(path))
    h, w = img.shape[:2]
    print(f"\n=== {name}: {w}x{h} ===")
    
    # Check if it's a grid by looking at brightness profiles
    # For a grid of icons on black, we'd see valleys of near-zero brightness 
    # between content clusters
    
    row_brightness = img[:,:,:3].max(axis=2).mean(axis=1)
    col_brightness = img[:,:,:3].max(axis=2).mean(axis=0)
    
    # Print brightness at regular intervals
    print(f"\n  Row brightness profile (every ~{h//30} px):")
    step = max(1, h // 30)
    for y in range(0, h, step):
        b = row_brightness[y]
        bar = "#" * int(b / 5)
        print(f"    y={y:4d}: {b:5.1f} {bar}")
    
    print(f"\n  Col brightness profile (every ~{w//30} px):")
    step = max(1, w // 30)
    for x in range(0, w, step):
        b = col_brightness[x]
        bar = "#" * int(b / 5)
        print(f"    x={x:4d}: {b:5.1f} {bar}")
    
    # Also check: if we assume 10x6 or 6x10 grid, what are the cell sizes?
    print(f"\n  If 10x6 grid: cell = {w/10:.1f} x {h/6:.1f}")
    print(f"  If 6x10 grid: cell = {w/6:.1f} x {h/10:.1f}")
