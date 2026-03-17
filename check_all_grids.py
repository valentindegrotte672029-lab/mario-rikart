#!/usr/bin/env python3
"""Check all Gemini images for dimensions and grid structure."""
from PIL import Image
import os, glob

for f in sorted(glob.glob('/Users/user/Downloads/Gemini_Generated_Image_*.png')):
    img = Image.open(f)
    basename = os.path.basename(f)
    short = basename.replace('Gemini_Generated_Image_', '').replace('.png', '')
    print(f"{short}: {img.size[0]}x{img.size[1]} mode={img.mode}")
