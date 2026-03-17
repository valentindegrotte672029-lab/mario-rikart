from PIL import Image
import os, glob

ITEMS_DIR = "core-astro/public/images/icons/items"
THRESHOLD = 35  # pixels darker than this become transparent

for path in glob.glob(os.path.join(ITEMS_DIR, "*.png")):
    img = Image.open(path).convert("RGBA")
    data = img.getdata()
    new_data = []
    for r, g, b, a in data:
        brightness = max(r, g, b)
        if brightness < THRESHOLD:
            new_data.append((r, g, b, 0))
        else:
            new_data.append((r, g, b, a))
    img.putdata(new_data)
    img.save(path)
    print(f"Processed {os.path.basename(path)}")

print("Done!")
