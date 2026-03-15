import ssl
ssl._create_default_https_context = ssl._create_unverified_context

import cv2
import os
import json

# Use OpenCV's built-in face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

outdir = '/Users/user/mario-rikart/core-astro/public/images/trombi'
results = {}

for page_num in range(1, 10):
    fname = os.path.join(outdir, 'page_' + str(page_num) + '.jpg')
    if not os.path.exists(fname):
        continue
    
    img = cv2.imread(fname)
    h_img, w_img = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Detect faces with multiple scale factors
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(80, 80))
    
    print('Page ' + str(page_num) + ' (' + str(w_img) + 'x' + str(h_img) + '): ' + str(len(faces)) + ' faces')
    
    page_faces = []
    for (x, y, w, h) in faces:
        # Convert to percentages of image dimensions
        pct_x = round(x / w_img * 100, 1)
        pct_y = round(y / h_img * 100, 1)
        pct_w = round(w / w_img * 100, 1)
        pct_h = round(h / h_img * 100, 1)
        print('  face at x=' + str(pct_x) + '% y=' + str(pct_y) + '% w=' + str(pct_w) + '% h=' + str(pct_h) + '%')
        page_faces.append({'x': pct_x, 'y': pct_y, 'w': pct_w, 'h': pct_h})
    
    results[page_num] = page_faces

print('\nJSON:')
print(json.dumps(results, indent=2))
