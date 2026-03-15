#!/usr/bin/env python3
"""Analyze trombi page images to get precise face and text bounding boxes."""
import cv2
import numpy as np
import json
import os

IMG_DIR = "core-astro/public/images/trombi"

# Person-to-page mapping with expected names to search in OCR
PAGES = {
    1: {"people": ["LUCAS TRIBUT", "ESTELLE BOUILLET"], "side": ["left", "right"]},
    2: {"people": ["INES ENNADIF", "THOMAS DUBUC"], "side": ["left", "right"]},
    3: {"people": ["MATEO CAVALOC", "KYLIAN LIBOUBAN"], "side": ["left", "right"]},
    4: {"people": ["ALEXANDRE HOFHERR", "EMMA GOMES"], "side": ["left", "right"]},
    5: {"people": ["VALENTIN DEGROTTE", "MAXIME BLOOD"], "side": ["left", "right"]},
    6: {"people": ["VICTOIRE CALLENS", "HANAE LEMOINE"], "side": ["left", "right"]},
    7: {"people": ["EDOUARD SOUIED", "ADEK ROUSSEL", "ALYXANE LEFEVRE"], "side": ["left", "right", "center"]},
    8: {"people": ["BAPTISTE DUBREUIL", "AURELIEN MALIGE", "SALOME VALMORIN"], "side": ["left", "right", "center"]},
    9: {"people": ["SALOME NATHAN"], "side": ["center"]},
}

def detect_faces(img_path):
    """Detect faces using multiple cascade classifiers with various params."""
    img = cv2.imread(img_path)
    if img is None:
        return [], (0, 0)
    h, w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)
    
    cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    # Try multiple scale factors for better detection
    all_faces = []
    for sf in [1.05, 1.1, 1.15, 1.2]:
        for mn in [3, 4, 5]:
            faces = cascade.detectMultiScale(gray, scaleFactor=sf, minNeighbors=mn, 
                                              minSize=(int(w*0.05), int(h*0.03)))
            if len(faces) > 0:
                for (fx, fy, fw, fh) in faces:
                    all_faces.append((fx/w*100, fy/h*100, fw/w*100, fh/h*100, sf, mn))
    
    # Also try profile face
    profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')
    for sf in [1.1, 1.15]:
        faces = profile_cascade.detectMultiScale(gray, scaleFactor=sf, minNeighbors=3,
                                                  minSize=(int(w*0.05), int(h*0.03)))
        if len(faces) > 0:
            for (fx, fy, fw, fh) in faces:
                all_faces.append((fx/w*100, fy/h*100, fw/w*100, fh/h*100, sf, -1))
    
    # Cluster nearby faces (within 5% distance)
    if not all_faces:
        return [], (w, h)
    
    unique_faces = []
    used = set()
    for i, (x1, y1, w1, h1, _, _) in enumerate(all_faces):
        if i in used:
            continue
        cluster = [(x1, y1, w1, h1)]
        used.add(i)
        for j, (x2, y2, w2, h2, _, _) in enumerate(all_faces):
            if j in used:
                continue
            cx1, cy1 = x1 + w1/2, y1 + h1/2
            cx2, cy2 = x2 + w2/2, y2 + h2/2
            if abs(cx1-cx2) < 8 and abs(cy1-cy2) < 8:
                cluster.append((x2, y2, w2, h2))
                used.add(j)
        # Average the cluster
        avg_x = np.mean([c[0] for c in cluster])
        avg_y = np.mean([c[1] for c in cluster])
        avg_w = np.mean([c[2] for c in cluster])
        avg_h = np.mean([c[3] for c in cluster])
        # Filter out too-small or too-large detections
        if avg_w > 3 and avg_h > 2 and avg_w < 40 and avg_h < 30:
            unique_faces.append({
                'x': round(avg_x, 1),
                'y': round(avg_y, 1),
                'w': round(avg_w, 1),
                'h': round(avg_h, 1),
                'count': len(cluster)
            })
    
    # Sort by confidence (number of detections in cluster)
    unique_faces.sort(key=lambda f: f['count'], reverse=True)
    
    return unique_faces, (w, h)


def detect_text_regions(img_path):
    """Use MSER and morphology to find text regions without OCR dependency."""
    img = cv2.imread(img_path)
    if img is None:
        return []
    h, w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Focus on lower half where names typically are (y > 60%)
    text_regions = []
    
    # Method: threshold + contour detection for text blocks
    # Names are typically large text on contrasting backgrounds
    for thresh_val in [127, 150, 180, 200]:
        _, binary = cv2.threshold(gray, thresh_val, 255, cv2.THRESH_BINARY_INV)
        
        # Dilate to connect letters into words
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (int(w*0.02), int(h*0.005)))
        dilated = cv2.dilate(binary, kernel, iterations=2)
        
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for cnt in contours:
            x, y_pos, cw, ch = cv2.boundingRect(cnt)
            # Filter: text blocks should be reasonable size
            x_pct = x / w * 100
            y_pct = y_pos / h * 100
            w_pct = cw / w * 100
            h_pct = ch / h * 100
            
            # Name text: typically 10-50% wide, 1-5% tall, in lower portion
            if 5 < w_pct < 55 and 0.5 < h_pct < 5 and y_pct > 50:
                text_regions.append({
                    'x': round(x_pct, 1),
                    'y': round(y_pct, 1),
                    'w': round(w_pct, 1),
                    'h': round(h_pct, 1),
                    'thresh': thresh_val
                })
    
    return text_regions


for page_num in range(1, 10):
    img_path = os.path.join(IMG_DIR, f"page_{page_num}.jpg")
    print(f"\n{'='*60}")
    print(f"PAGE {page_num}: {PAGES[page_num]['people']}")
    print(f"{'='*60}")
    
    faces, (w, h) = detect_faces(img_path)
    print(f"Image size: {w}x{h}")
    print(f"Faces detected ({len(faces)}):")
    for i, f in enumerate(faces):
        print(f"  Face {i}: x={f['x']}%, y={f['y']}%, w={f['w']}%, h={f['h']}% (confidence: {f['count']} detections)")
    
    text_regions = detect_text_regions(img_path)
    # Deduplicate text regions
    unique_texts = []
    for t in text_regions:
        is_dup = False
        for u in unique_texts:
            if abs(t['x'] - u['x']) < 3 and abs(t['y'] - u['y']) < 2:
                is_dup = True
                break
        if not is_dup:
            unique_texts.append(t)
    
    print(f"\nText regions in lower half ({len(unique_texts)}):")
    for t in unique_texts[:10]:  # Show top 10
        print(f"  Text: x={t['x']}%, y={t['y']}%, w={t['w']}%, h={t['h']}%")
