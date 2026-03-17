from PIL import Image
import numpy as np
import os

ITEMS_DIR = "core-astro/public/images/icons/items"
os.makedirs(ITEMS_DIR, exist_ok=True)

DARK_THRESH = 55
WHITE_THRESH = 220
GREY_SPREAD = 35
GREY_MAX = 80

def clean_icon(img):
    """Remove dark bg, white borders, grey artifacts, then auto-crop."""
    arr = np.array(img.convert("RGBA"))
    r, g, b = arr[:,:,0].astype(int), arr[:,:,1].astype(int), arr[:,:,2].astype(int)
    max_ch = np.maximum(np.maximum(r, g), b)
    min_ch = np.minimum(np.minimum(r, g), b)
    spread = max_ch - min_ch
    
    # Remove dark background
    arr[max_ch < DARK_THRESH, 3] = 0
    
    # Remove white/near-white pixels (grid borders between cells)
    arr[min_ch > WHITE_THRESH, 3] = 0
    
    # Remove greyish artifacts (low saturation + low brightness)
    grey_mask = (spread < GREY_SPREAD) & (max_ch < GREY_MAX)
    arr[grey_mask, 3] = 0
    
    # Remove remaining light-grey (card edge artifacts)
    light_grey = (spread < 15) & (min_ch > 180)
    arr[light_grey, 3] = 0
    
    result = Image.fromarray(arr)
    
    # Auto-crop to non-transparent bounding box
    bbox = result.getbbox()
    if bbox:
        pad = 4
        x1 = max(0, bbox[0] - pad)
        y1 = max(0, bbox[1] - pad)
        x2 = min(result.width, bbox[2] + pad)
        y2 = min(result.height, bbox[3] + pad)
        result = result.crop((x1, y1, x2, y2))
    
    return result


def extract_grid(image_path, cols, rows, names, pad=8):
    """Extract icons from a grid image with minimal padding."""
    img = Image.open(os.path.expanduser(image_path))
    w, h = img.size
    cell_w = w // cols
    cell_h = h // rows
    
    for row, col, name in names:
        x1 = col * cell_w + pad
        y1 = row * cell_h + pad
        x2 = (col + 1) * cell_w - pad
        y2 = (row + 1) * cell_h - pad
        cell = img.crop((x1, y1, x2, y2))
        icon = clean_icon(cell)
        out = os.path.join(ITEMS_DIR, f"{name}.png")
        icon.save(out)
        iw, ih = icon.size
        corners = [icon.getpixel((0,0))[3], icon.getpixel((iw-1,0))[3],
                   icon.getpixel((0,ih-1))[3], icon.getpixel((iw-1,ih-1))[3]]
        status = "OK" if all(c == 0 for c in corners) else f"WARN corners={corners}"
        print(f"  {name}.png: {iw}x{ih} {status}")


# === Grid 1: Main 8x4 items grid ===
print("=== Main items grid (8x4) ===")
MAIN_GRID = "~/Downloads/Gemini_Generated_Image_2lxbuo2lxbuo2lxb.png"
main_icons = [
    (0, 0, "coin-gold"), (0, 1, "coins-stack"), (0, 2, "treasure-chest"),
    (0, 3, "fire-flower-pixel"), (0, 4, "red-mushroom-spotted"),
    (0, 5, "flask-purple-atomic"), (0, 6, "flask-green-erlenmeyer"),
    (0, 7, "flask-blue-beaker"),
    (1, 0, "flask-orange-distill"), (1, 1, "poker-card"), (1, 2, "peach-crown"),
    (1, 3, "star-purple"), (1, 4, "shell-spiked-green"), (1, 5, "banana-peel-cyan"),
    (1, 6, "castle-gothic-purple"), (1, 7, "classified-folder"),
    (2, 0, "brain-maze"), (2, 1, "question-block"), (2, 2, "wario-face"),
    (2, 3, "mario-face"), (2, 4, "luigi-face"), (2, 5, "toad-mushroom"),
    (2, 6, "star-mushroom-indigo"), (2, 7, "mushroom-red-poison"),
    (3, 0, "mushroom-red-classic"), (3, 1, "chrono-stopwatch"),
    (3, 2, "question-block-crossword"), (3, 3, "constellation-stars"),
    (3, 4, "horoscope-stars"), (3, 5, "potion-vial-cyan"),
    (3, 6, "banana-peel-teal"), (3, 7, "test-person"),
]
extract_grid(MAIN_GRID, 8, 4, main_icons)

# === Grid 2: Animal horoscope icons (3x2) ===
print("\n=== Animal horoscope grid (3x2) ===")
ANIMAL_GRID = "~/Downloads/Gemini_Generated_Image_k4wckok4wckok4wc.png"
animal_icons = [
    (0, 0, "dragon-red"), (0, 1, "lion-gold"), (0, 2, "leopard-cyan"),
    (1, 0, "monkey-green"), (1, 1, "rhino-purple"), (1, 2, "phoenix-magenta"),
]
extract_grid(ANIMAL_GRID, 3, 2, animal_icons)

# === Grid 3: Extra icons (4x2) ===
print("\n=== Extra icons grid (4x2) ===")
EXTRA_GRID = "~/Downloads/Gemini_Generated_Image_g1xbi5g1xbi5g1xb.png"
extra_icons = [
    (0, 0, "robot-ia-poker"), (0, 1, "join-request"), (0, 2, "bbl-popup"),
    (1, 0, "dev-filmstrip"), (1, 1, "warning-triangle"), (1, 3, "toad-vomit"),
]
extract_grid(EXTRA_GRID, 4, 2, extra_icons)

print("\n=== All done! ===")
