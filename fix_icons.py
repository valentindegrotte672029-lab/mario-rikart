from PIL import Image, ImageFilter
import numpy as np
import os, glob

ITEMS_DIR = "core-astro/public/images/icons/items"
THRESHOLD = 50  # more aggressive: anything with max(r,g,b) < 50 => transparent

for path in sorted(glob.glob(os.path.join(ITEMS_DIR, "*.png"))):
    img = Image.open(path).convert("RGBA")
    arr = np.array(img)
    
    # Step 1: Remove dark background (threshold on max channel)
    brightness = arr[:, :, :3].max(axis=2)
    arr[brightness < THRESHOLD, 3] = 0
    
    # Step 2: Also remove near-black pixels with low saturation (grey border artifacts)
    # These are pixels where all RGB channels are close and below 60
    r, g, b = arr[:,:,0].astype(int), arr[:,:,1].astype(int), arr[:,:,2].astype(int)
    max_ch = np.maximum(np.maximum(r, g), b)
    min_ch = np.minimum(np.minimum(r, g), b)
    spread = max_ch - min_ch
    # Remove greyish pixels (low spread + low brightness)
    grey_mask = (spread < 30) & (max_ch < 70)
    arr[grey_mask, 3] = 0
    
    img2 = Image.fromarray(arr)
    
    # Step 3: Auto-crop to non-transparent bounding box with small padding
    bbox = img2.getbbox()
    if bbox:
        x1, y1, x2, y2 = bbox
        # Add 2px padding
        pad = 2
        x1 = max(0, x1 - pad)
        y1 = max(0, y1 - pad)
        x2 = min(img2.width, x2 + pad)
        y2 = min(img2.height, y2 + pad)
        img2 = img2.crop((x1, y1, x2, y2))
    
    img2.save(path)
    name = os.path.basename(path)
    w, h = img2.size
    # Verify corners
    corners_alpha = [img2.getpixel((0,0))[3], img2.getpixel((w-1,0))[3], 
                     img2.getpixel((0,h-1))[3], img2.getpixel((w-1,h-1))[3]]
    print(f"{name}: {w}x{h}, corners: {corners_alpha}")

print("Done!")
