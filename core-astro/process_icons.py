import os
from PIL import Image, ImageFilter, ImageEnhance
import numpy as np

def make_neon_icon(image_path, output_path, color_hex="#00FFFF", border_color="#FFFFFF"):
    try:
        # Load image
        img = Image.open(image_path).convert("RGBA")
        
        # 1. We just glow the existing image assuming it's already a sticker or transparent
        # Make sure background is perfectly transparent where alpha < 50
        data = np.array(img)
        alpha = data[:, :, 3]
        
        # Glow parameters
        glow_radius = 15
        
        # Resize canvas to fit glow
        new_width = img.width + glow_radius * 4
        new_height = img.height + glow_radius * 4
        
        # Create a solid color version of the shape for the glow
        shape = Image.new("RGBA", img.size, (0, 0, 0, 0))
        shape_data = np.array(shape)
        
        # Parse hex color
        hex_c = color_hex.lstrip('#')
        r, g, b = tuple(int(hex_c[i:i+2], 16) for i in (0, 2, 4))
        
        # Fill shape with color where alpha > 0
        shape_data[alpha > 50] = [r, g, b, 255]
        shape = Image.fromarray(shape_data, "RGBA")
        
        # Create canvas
        canvas = Image.new("RGBA", (new_width, new_height), (0, 0, 0, 0))
        offset_x = glow_radius * 2
        offset_y = glow_radius * 2
        
        # Paste the colored shape
        canvas.paste(shape, (offset_x, offset_y), shape)
        
        # Apply Gaussian Blur to create glow
        glow1 = canvas.filter(ImageFilter.GaussianBlur(10))
        glow2 = canvas.filter(ImageFilter.GaussianBlur(25))
        
        # Combine glows
        final_canvas = Image.new("RGBA", (new_width, new_height), (0, 0, 0, 0))
        final_canvas = Image.alpha_composite(final_canvas, glow2)
        final_canvas = Image.alpha_composite(final_canvas, glow1)
        
        # Paste original image on top
        final_canvas.paste(img, (offset_x, offset_y), img)
        
        # Crop to visible bounds
        bbox = final_canvas.getbbox()
        if bbox:
            final_canvas = final_canvas.crop(bbox)
            
        final_canvas.save(output_path, "PNG")
        print(f"✅ Processed {os.path.basename(output_path)}")
    except Exception as e:
        print(f"❌ Error processing {image_path}: {str(e)}")

import sys
import subprocess

# Add rembg for cut out
try:
    import rembg
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "rembg", "onnxruntime"])
    import rembg

def remove_background(image_path):
    with open(image_path, "rb") as f:
        input_data = f.read()
    output_data = rembg.remove(input_data)
    
    # Save temporarily
    tmp_out = image_path + ".tmp.png"
    with open(tmp_out, "wb") as f:
        f.write(output_data)
    
    return tmp_out

input_dir = "/Users/user/.gemini/antigravity/playground/core-astro/public/images"
new_media_dir = "/Users/user/.gemini/antigravity/brain/a8d0f72a-5dca-4439-9b67-821d94d783e3"

icons_to_process = [
    # Existing
    ("ticket-gold.png", "#FFD700"),
    ("camera-neon.png", "#FF3333"),
    ("bomb-timer.png", "#FF3333"),
    ("lock-neon.png", "#00FFCC"),
    ("skull-neon.png", "#FF00FF"),
    ("guitar-neon.png", "#00FFFF"),
    ("cop-neon.png", "#0000FF"),
    ("bike-neon.png", "#FF9900"),
    ("crown-neon.png", "#FFCC00"),
    ("canoe-neon.png", "#00CCFF"),
    ("tongue-neon.png", "#FF0066"),
    ("man-neon.png", "#3399FF"),
    ("woman-neon.png", "#FF3399"),
    ("ambulance-neon.png", "#FF0000"),
    ("soap-neon.png", "#FFFFFF"),
    ("poop-neon.png", "#663300"),
    ("fire-neon.png", "#FF6600"),
    ("devil-neon.png", "#FF0000"),
    ("books-neon.png", "#9933FF"),
    ("key-neon.png", "#FFCC00"),
    ("newspaper-neon.png", "#CCCCCC"),
    ("spider-banana.png", "#FFFF00"),
    ("book-neon.png", "#00FFCC"),
    ("lemon-neon.png", "#FFFF33"),
    ("apple-neon.png", "#33CC33")
]

# Process existing icons
for icon, color in icons_to_process:
    path = os.path.join(input_dir, icon)
    if os.path.exists(path):
        tmp = remove_background(path)
        make_neon_icon(tmp, path, color)
        if os.path.exists(tmp):
            os.remove(tmp)

# Process the new images sent dynamically
# We found: media__1773796604070.png and media__1773796603960.png
new_images = [
    ("media__1773796603960.png", "poker-join.png", "#FF00FF"),
    ("media__1773796604070.png", "polymario-icon.png", "#00FFFF")
]

for src, dst, color in new_images:
    src_path = os.path.join(new_media_dir, src)
    dst_path = os.path.join(input_dir, dst)
    if os.path.exists(src_path):
        tmp = remove_background(src_path)
        make_neon_icon(tmp, dst_path, color)
        if os.path.exists(tmp):
            os.remove(tmp)

print("Icons processed!")
