from PIL import Image
import os

img = Image.open(os.path.expanduser("~/Downloads/Gemini_Generated_Image_g1xbi5g1xbi5g1xb.png"))
w, h = img.size
print(f"Image size: {w}x{h}")

cols, rows = 4, 2
cell_w = w // cols
cell_h = h // rows
print(f"Cell size: {cell_w}x{cell_h}")

pad = 20

icons = [
    (0, 0, "robot-ia-poker"),
    (0, 1, "join-request"),
    (0, 2, "bbl-popup"),
    (1, 0, "dev-filmstrip"),
    (1, 1, "warning-triangle"),
    (1, 3, "toad-vomit"),
]

out_dir = "core-astro/public/images/icons/items"
os.makedirs(out_dir, exist_ok=True)

for row, col, name in icons:
    x1 = col * cell_w + pad
    y1 = row * cell_h + pad
    x2 = (col + 1) * cell_w - pad
    y2 = (row + 1) * cell_h - pad
    icon = img.crop((x1, y1, x2, y2))
    path = os.path.join(out_dir, f"{name}.png")
    icon.save(path)
    print(f"Saved {path} ({icon.size[0]}x{icon.size[1]})")

print("Done!")
