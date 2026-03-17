import os
from PIL import Image

def center_and_remove_dot(image_path):
    img = Image.open(image_path).convert('RGBA')
    w, h = img.size
    # Remove small dot in bottom right (assume 10x10px in corner)
    for x in range(w-12, w):
        for y in range(h-12, h):
            img.putpixel((x, y), (0, 0, 0, 0))
    # Center content: find bbox of non-transparent pixels
    bbox = img.getbbox()
    if bbox:
        content = img.crop(bbox)
        # Create new blank image and paste centered
        new_img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        offset = ((w - content.width) // 2, (h - content.height) // 2)
        new_img.paste(content, offset)
        new_img.save(image_path)
    else:
        img.save(image_path)

def stretch_camera(image_path, factor=1.4):
    img = Image.open(image_path).convert('RGBA')
    w, h = img.size
    new_w = int(w * factor)
    img = img.resize((new_w, h), Image.LANCZOS)
    # Center in original canvas
    new_img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    offset = ((w - new_w) // 2, 0)
    new_img.paste(img, offset)
    new_img.save(image_path)

if __name__ == '__main__':
    folder = '.'
    for fname in os.listdir(folder):
        if fname.endswith('.png'):
            path = os.path.join(folder, fname)
            if fname == 'camera-neon.png':
                stretch_camera(path)
            else:
                center_and_remove_dot(path)
