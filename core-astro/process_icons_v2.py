import os
import glob
import numpy as np
from PIL import Image

def remove_black_background(input_path, output_path):
    try:
        img = Image.open(input_path).convert('RGBA')
        arr = np.array(img).astype(float)
        
        r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]
        
        # Calculate luminance (lightness) -> max of RGB
        # Because in additive blending (neon on black), the alpha matches the brightest channel
        L = np.max(arr[:,:,:3], axis=2)
        
        # New alpha is the lightness, bounded by the original alpha
        new_a = np.minimum(L, a)
        
        # Un-premultiply the RGB channels to recover the true bright color without the black suppression
        # Formula: C_true = C_premult / (Alpha / 255)
        with np.errstate(divide='ignore', invalid='ignore'):
            factor = 255.0 / new_a
            new_r = np.clip(np.nan_to_num(r * factor), 0, 255)
            new_g = np.clip(np.nan_to_num(g * factor), 0, 255)
            new_b = np.clip(np.nan_to_num(b * factor), 0, 255)
            
        # Optional: Boost brightness slightly and add contrast to make it a better sticker
        # We can increase the alpha slightly to make the core more solid
        gamma = 0.8
        new_a_boosted = np.clip(255 * (new_a / 255) ** gamma, 0, 255)
        
        arr[:,:,0] = new_r
        arr[:,:,1] = new_g
        arr[:,:,2] = new_b
        arr[:,:,3] = new_a_boosted
        
        out_img = Image.fromarray(arr.astype(np.uint8), 'RGBA')
        
        # Crop to visible bounds to make it a perfect sticker
        bbox = out_img.getbbox()
        if bbox:
            out_img = out_img.crop(bbox)
            
        out_img.save(output_path, 'PNG')
        print(f"✅ Processed {os.path.basename(output_path)}")
    except Exception as e:
        print(f"❌ Error processing {input_path}: {e}")

public_images = "/Users/user/.gemini/antigravity/playground/core-astro/public/images"
downloads_dir = "/Users/user/Downloads"

# Process Poker and Polymario from Downloads
new_icons = [
    (os.path.join(downloads_dir, "poker 1.png"), os.path.join(public_images, "poker-join.png")),
    (os.path.join(downloads_dir, "polymario 1.png"), os.path.join(public_images, "polymario-icon.png")),
]

for src, dst in new_icons:
    if os.path.exists(src):
        remove_black_background(src, dst)
    else:
        print(f"⚠️ Missing source file: {src}")

# Re-process all existing neon icons
neon_icons = glob.glob(os.path.join(public_images, "*-neon.png"))
# Add specifically requested icons
neon_icons += [
    os.path.join(public_images, "ticket-gold.png"),
    os.path.join(public_images, "bomb-timer.png"),
    os.path.join(public_images, "spider-banana.png"),
]

for icon in neon_icons:
    remove_black_background(icon, icon)

print("✨ All black backgrounds removed via mathematical Alpha recovery!")

# Process BeMario items
items_dir = os.path.join(public_images, "icons", "items")
item_icons = glob.glob(os.path.join(items_dir, "*.png"))
for icon in item_icons:
    remove_black_background(icon, icon)

print("✨ All BeMario items processed!")
