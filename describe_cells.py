#!/usr/bin/env python3
"""Describe content of each cell in unexplored grids by dominant color/brightness."""
import numpy as np
from PIL import Image
import os

def describe_cell_content(cell_path):
    """Describe what might be in a cell based on color analysis."""
    img = np.array(Image.open(cell_path).convert('RGB'))
    
    # Only look at bright pixels (actual content, not background)
    max_per_pixel = img.max(axis=2)
    bright_mask = max_per_pixel > 40
    
    if bright_mask.sum() < 100:
        return "EMPTY/dark", (0,0,0)
    
    bright_pixels = img[bright_mask]
    avg_color = bright_pixels.mean(axis=0).astype(int)
    
    r, g, b = avg_color
    
    # Determine dominant color
    if r > g * 1.5 and r > b * 1.5:
        color = "RED"
    elif g > r * 1.5 and g > b * 1.5:
        color = "GREEN"
    elif b > r * 1.3 and b > g * 1.3:
        color = "BLUE"
    elif r > 150 and g > 100 and b < 80:
        color = "GOLD/YELLOW"
    elif r > 150 and g < 80 and b > 100:
        color = "MAGENTA/PINK"
    elif r < 80 and g > 150 and b > 150:
        color = "CYAN"
    elif r > 150 and g > 80 and b < 60:
        color = "ORANGE"
    elif r > 120 and g > 80 and b > 120:
        color = "PURPLE/MIXED"
    elif r > 200 and g > 200 and b > 200:
        color = "WHITE"
    else:
        color = "MIXED"
    
    content_pct = bright_mask.sum() / bright_mask.size * 100
    
    return f"{color} ({content_pct:.0f}% fill) rgb=({r},{g},{b})", tuple(avg_color)

DEBUG = '/Users/user/mario-rikart/grid_debug'

for grid_dir in sorted(os.listdir(DEBUG)):
    grid_path = os.path.join(DEBUG, grid_dir)
    if not os.path.isdir(grid_path):
        continue
    
    print(f"\n{'='*60}")
    print(f"Grid: {grid_dir}")
    print(f"{'='*60}")
    
    cells = sorted([f for f in os.listdir(grid_path) if f.endswith('.png')])
    for cell_file in cells:
        cell_path = os.path.join(grid_path, cell_file)
        desc, color = describe_cell_content(cell_path)
        print(f"  {cell_file:30s} → {desc}")
