#!/usr/bin/env python3
"""
Neon Icon Generator for Mario Rikart – Dark Neon OLED Style
Generates 256×256 PNG icons with neon glow on pure black (#000) background.
Uses Pillow only (no external SVG libs needed).
"""
import math
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os

OUTPUT = '/Users/user/mario-rikart/core-astro/public/images/icons/items'
os.makedirs(OUTPUT, exist_ok=True)

# ─── Glow helper ─────────────────────────────────────────
def apply_neon_glow(canvas, color_rgb, blur_radius=8, passes=3):
    """Add a neon glow by blurring bright pixels and compositing additively."""
    glow = canvas.copy()
    for _ in range(passes):
        glow = glow.filter(ImageFilter.GaussianBlur(blur_radius))
    # Additive blend: brighten original with glow
    result = Image.new('RGBA', canvas.size, (0, 0, 0, 255))
    result = Image.alpha_composite(result, glow)
    result = Image.alpha_composite(result, canvas)
    return result

def new_canvas(size=256):
    return Image.new('RGBA', (size, size), (0, 0, 0, 0))

def finalize(img, name, glow_color=None, glow_blur=6, glow_passes=2):
    """Apply glow, composite onto black, and save."""
    if glow_color:
        img = apply_neon_glow(img, glow_color, glow_blur, glow_passes)
    # Composite onto solid black
    black = Image.new('RGBA', img.size, (0, 0, 0, 255))
    result = Image.alpha_composite(black, img)
    path = os.path.join(OUTPUT, f'{name}.png')
    result.save(path, 'PNG', optimize=True)
    print(f'  ✓ {name}.png')

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

STROKE = 3  # Global uniform stroke width

# ═══════════════════════════════════════════════════════════
# 1. COINS – Mario-style gold neon coin
# ═══════════════════════════════════════════════════════════
def draw_coin_gold():
    """Perfect circle, flat 2D, gold neon, vertical slit."""
    c = new_canvas()
    d = ImageDraw.Draw(c)
    cx, cy, r = 128, 128, 85
    gold = (255, 215, 0, 255)
    gold_dim = (200, 170, 0, 255)

    # Outer circle
    d.ellipse([cx-r, cy-r, cx+r, cy+r], outline=gold, width=STROKE+1)
    # Inner circle (smaller)
    ri = r - 14
    d.ellipse([cx-ri, cy-ri, cx+ri, cy+ri], outline=gold_dim, width=STROKE)
    # Vertical slit (center line)
    d.line([cx, cy-ri+12, cx, cy+ri-12], fill=gold, width=STROKE)
    # Small horizontal serifs
    d.line([cx-8, cy-ri+12, cx+8, cy-ri+12], fill=gold_dim, width=2)
    d.line([cx-8, cy+ri-12, cx+8, cy+ri-12], fill=gold_dim, width=2)

    finalize(c, 'coin-gold', glow_color=(255,215,0), glow_blur=8, glow_passes=3)

def draw_coins_stack():
    """Stack of 3 coins, offset vertically."""
    c = new_canvas()
    d = ImageDraw.Draw(c)
    gold = (255, 215, 0, 255)
    gold_dim = (200, 170, 0, 255)

    offsets = [(128, 165, 55), (128, 128, 55), (128, 91, 55)]
    for cx, cy, r in offsets:
        d.ellipse([cx-r, cy-r, cx+r, cy+r], outline=gold, width=STROKE+1)
        ri = r - 10
        d.ellipse([cx-ri, cy-ri, cx+ri, cy+ri], outline=gold_dim, width=STROKE)
        d.line([cx, cy-ri+8, cx, cy+ri-8], fill=gold, width=2)

    finalize(c, 'coins-stack', glow_color=(255,215,0), glow_blur=8, glow_passes=3)


# ═══════════════════════════════════════════════════════════
# 2. POKER – Chip, Cards, Dice
# ═══════════════════════════════════════════════════════════
def draw_poker_chip():
    """Poker chip: disc with dashed border."""
    c = new_canvas()
    d = ImageDraw.Draw(c)
    cx, cy, r = 128, 128, 90
    red = (255, 40, 40, 255)
    white = (255, 255, 255, 255)

    # Outer ring
    d.ellipse([cx-r, cy-r, cx+r, cy+r], outline=red, width=STROKE+2)
    # Dashed inner ring
    ri = r - 15
    num_dashes = 24
    for i in range(num_dashes):
        a1 = (2 * math.pi * i) / num_dashes
        a2 = (2 * math.pi * (i + 0.4)) / num_dashes
        x1 = cx + ri * math.cos(a1)
        y1 = cy + ri * math.sin(a1)
        x2 = cx + ri * math.cos(a2)
        y2 = cy + ri * math.sin(a2)
        d.line([x1, y1, x2, y2], fill=white, width=STROKE)
    # Center circle
    rc = 30
    d.ellipse([cx-rc, cy-rc, cx+rc, cy+rc], outline=red, width=STROKE)
    # Dollar or star in center
    for angle in range(0, 360, 72):
        a = math.radians(angle - 90)
        x = cx + 15 * math.cos(a)
        y = cy + 15 * math.sin(a)
        d.ellipse([x-2, y-2, x+2, y+2], fill=red)

    finalize(c, 'poker-chip', glow_color=(255,40,40), glow_blur=7, glow_passes=2)

def draw_poker_cards():
    """Two cards fanned – ace of spades dominant, magenta outlines."""
    c = new_canvas()
    d = ImageDraw.Draw(c)
    magenta = (255, 0, 160, 255)
    white = (255, 255, 255, 255)
    sw = STROKE

    # Back card (rotated slightly right)
    def draw_card(d, cx, cy, w, h, rotation, outline_color):
        hw, hh = w/2, h/2
        a = math.radians(rotation)
        cos_a, sin_a = math.cos(a), math.sin(a)
        corners = [(-hw,-hh), (hw,-hh), (hw,hh), (-hw,hh)]
        pts = [(cx + x*cos_a - y*sin_a, cy + x*sin_a + y*cos_a) for x,y in corners]
        d.polygon(pts, outline=outline_color, fill=None)
        # Re-draw edges with width
        for i in range(4):
            d.line([pts[i], pts[(i+1)%4]], fill=outline_color, width=sw)
        return pts

    # Back card
    draw_card(d, 140, 130, 100, 140, 12, (180, 0, 120, 200))

    # Front card (Ace of Spades)
    pts = draw_card(d, 118, 128, 100, 140, -5, magenta)

    # Spade symbol in center
    scx, scy = 118, 115
    # Spade body (upside-down heart + stem)
    spade_pts = []
    for t in range(0, 361, 5):
        a = math.radians(t)
        r_base = 18
        # heart -> invert to make spade
        x = scx + r_base * math.sin(a) * (1 + abs(math.cos(a))*0.3)
        y = scy - r_base * abs(math.cos(a)) * (1 + math.sin(a)*0.3)
        if t > 180:
            y = scy + (scy - y) # flip
        spade_pts.append((x,y))
    # Simplified spade using basic shapes
    d.ellipse([scx-14, scy-20, scx+2, scy+2], outline=white, width=2)
    d.ellipse([scx-2, scy-20, scx+14, scy+2], outline=white, width=2)
    d.polygon([(scx, scy-22), (scx-14, scy-4), (scx+14, scy-4)], outline=white)
    d.line([scx, scy-4, scx, scy+14], fill=white, width=2)
    d.line([scx-6, scy+14, scx+6, scy+14], fill=white, width=2)

    # "A" top-left of front card
    a_x, a_y = 78, 72
    d.text((a_x, a_y), "A", fill=white)

    finalize(c, 'poker-card', glow_color=(255,0,160), glow_blur=7, glow_passes=2)

def draw_poker_dice():
    """Isometric pair of dice, white/cyan neon lines."""
    c = new_canvas()
    d = ImageDraw.Draw(c)
    cyan = (0, 220, 255, 255)
    white = (255, 255, 255, 255)

    def draw_die(d, ox, oy, s, rotation=0):
        """Draw an isometric die. s = size."""
        a = math.radians(30 + rotation)
        b = math.radians(150 + rotation)
        # Top face
        dx1, dy1 = s*math.cos(a), -s*math.sin(a)
        dx2, dy2 = s*math.cos(b), -s*math.sin(b)
        top = [(ox, oy), (ox+dx1, oy+dy1), (ox+dx1+dx2, oy+dy1+dy2), (ox+dx2, oy+dy2)]
        # Front-right face
        fr = [(ox+dx1, oy+dy1), (ox+dx1, oy+dy1+s), (ox+dx1+dx2, oy+dy1+dy2+s), (ox+dx1+dx2, oy+dy1+dy2)]
        # Front-left face
        fl = [(ox+dx2, oy+dy2), (ox+dx2, oy+dy2+s), (ox+dx1+dx2, oy+dy1+dy2+s), (ox+dx1+dx2, oy+dy1+dy2)]

        for face in [top, fr, fl]:
            for i in range(4):
                d.line([face[i], face[(i+1)%4]], fill=cyan, width=STROKE)

        # Dots on top face (3 dots = diagonal)
        center_top = ((top[0][0]+top[2][0])/2, (top[0][1]+top[2][1])/2)
        dot_r = 3
        d.ellipse([center_top[0]-dot_r, center_top[1]-dot_r, center_top[0]+dot_r, center_top[1]+dot_r], fill=white)
        for corner_i in [0, 2]:
            cx = (top[corner_i][0] + center_top[0]) / 2
            cy_d = (top[corner_i][1] + center_top[1]) / 2
            d.ellipse([cx-dot_r, cy_d-dot_r, cx+dot_r, cy_d+dot_r], fill=white)

    draw_die(d, 90, 100, 50, rotation=0)
    draw_die(d, 145, 85, 45, rotation=15)

    finalize(c, 'poker-dice', glow_color=(0,220,255), glow_blur=6, glow_passes=2)


# ═══════════════════════════════════════════════════════════
# 3. TROMBI – AMAS, EVENT, COM, TRAVEL
# ═══════════════════════════════════════════════════════════
def draw_trombi_amas():
    """Stacked documents / expand folder – sepia/gold style."""
    c = new_canvas()
    d = ImageDraw.Draw(c)
    gold = (255, 200, 80, 255)
    gold_dim = (200, 160, 60, 255)

    # Three stacked rectangles (back to front)
    for i, offset in enumerate([(10, 8), (5, 4), (0, 0)]):
        ox, oy = 55 + offset[0], 50 + offset[1]
        w, h = 145, 160
        col = gold if i == 2 else gold_dim
        d.rectangle([ox, oy, ox+w, oy+h], outline=col, width=STROKE)
        # Horizontal "text" lines inside front doc only
        if i == 2:
            for ln in range(4):
                ly = oy + 30 + ln * 28
                d.line([ox+20, ly, ox+w-20, ly], fill=gold_dim, width=2)

    finalize(c, 'trombi-amas', glow_color=(255,200,80), glow_blur=6, glow_passes=2)

def draw_trombi_event():
    """Calendar with neon star – sepia/gold."""
    c = new_canvas()
    d = ImageDraw.Draw(c)
    gold = (255, 200, 80, 255)
    gold_dim = (200, 160, 60, 255)

    # Calendar body
    x1, y1, x2, y2 = 55, 60, 200, 210
    d.rectangle([x1, y1, x2, y2], outline=gold, width=STROKE)
    # Top bar
    d.rectangle([x1, y1, x2, y1+30], outline=gold, width=STROKE)
    # Calendar hooks
    for hx in [90, 165]:
        d.line([hx, y1-12, hx, y1+10], fill=gold, width=STROKE+1)
    # Star in center
    scx, scy = 128, 150
    star_r = 28
    star_pts = []
    for i in range(10):
        angle = math.radians(i * 36 - 90)
        r = star_r if i % 2 == 0 else star_r * 0.4
        star_pts.append((scx + r * math.cos(angle), scy + r * math.sin(angle)))
    d.polygon(star_pts, outline=gold, fill=None)
    for i in range(len(star_pts)):
        d.line([star_pts[i], star_pts[(i+1)%len(star_pts)]], fill=gold, width=2)

    finalize(c, 'trombi-event', glow_color=(255,200,80), glow_blur=6, glow_passes=2)

def draw_trombi_com():
    """Speech bubble with 3 dots – sepia/gold."""
    c = new_canvas()
    d = ImageDraw.Draw(c)
    gold = (255, 200, 80, 255)
    gold_dim = (200, 160, 60, 255)

    # Rounded rectangle bubble
    x1, y1, x2, y2 = 40, 50, 216, 165
    r = 20
    d.rounded_rectangle([x1, y1, x2, y2], radius=r, outline=gold, width=STROKE)
    # Tail (triangle pointing down-left)
    tail = [(80, y2), (60, y2+35), (110, y2)]
    d.polygon(tail, outline=gold)
    d.line([tail[0], tail[1]], fill=gold, width=STROKE)
    d.line([tail[1], tail[2]], fill=gold, width=STROKE)

    # Three dots
    dot_r = 8
    for dx in [-35, 0, 35]:
        cx = 128 + dx
        cy = 108
        d.ellipse([cx-dot_r, cy-dot_r, cx+dot_r, cy+dot_r], fill=gold)

    finalize(c, 'trombi-com', glow_color=(255,200,80), glow_blur=6, glow_passes=2)

def draw_trombi_travel():
    """Globe with flight arc and pin – cyan/gold."""
    c = new_canvas()
    d = ImageDraw.Draw(c)
    cyan = (0, 200, 255, 255)
    gold = (255, 200, 80, 255)

    cx, cy, r = 128, 128, 75
    # Globe circle
    d.ellipse([cx-r, cy-r, cx+r, cy+r], outline=cyan, width=STROKE)
    # Equator
    d.arc([cx-r, cy-20, cx+r, cy+20], 0, 360, fill=cyan, width=2)
    # Meridian
    d.arc([cx-25, cy-r, cx+25, cy+r], 0, 360, fill=cyan, width=2)

    # Flight arc (bezier approximation)
    arc_pts = []
    for t in range(0, 101, 2):
        t_n = t / 100
        # Quadratic bezier: start(-50,-30), control(0,-80), end(50,-20)
        x = (1-t_n)**2 * (cx-50) + 2*(1-t_n)*t_n * cx + t_n**2 * (cx+50)
        y = (1-t_n)**2 * (cy-30) + 2*(1-t_n)*t_n * (cy-80) + t_n**2 * (cy-20)
        arc_pts.append((x, y))
    for i in range(len(arc_pts)-1):
        d.line([arc_pts[i], arc_pts[i+1]], fill=gold, width=2)

    # Pin at destination
    px, py = cx+50, cy-20
    d.ellipse([px-6, py-6, px+6, py+6], fill=gold)
    d.polygon([(px, py+12), (px-5, py), (px+5, py)], fill=gold)

    finalize(c, 'trombi-travel', glow_color=(0,200,255), glow_blur=6, glow_passes=2)


# ═══════════════════════════════════════════════════════════
# 4. LUIGI ARCADE – Champi Ninja, Doodle-Weed
# ═══════════════════════════════════════════════════════════
def draw_champi_ninja():
    """Mushroom with ninja bandana across eyes."""
    c = new_canvas()
    d = ImageDraw.Draw(c)
    red = (255, 50, 50, 255)
    white = (255, 255, 255, 255)
    black_fill = (0, 0, 0, 255)

    # Mushroom cap (half ellipse)
    cap_x1, cap_y1, cap_x2, cap_y2 = 48, 50, 208, 170
    d.arc([cap_x1, cap_y1, cap_x2, cap_y2], 180, 360, fill=red, width=STROKE+1)
    d.line([cap_x1, (cap_y1+cap_y2)//2, cap_x2, (cap_y1+cap_y2)//2], fill=red, width=STROKE)

    # Spots on cap
    for sx, sy, sr in [(100, 80, 12), (155, 85, 10), (128, 65, 8)]:
        d.ellipse([sx-sr, sy-sr, sx+sr, sy+sr], outline=white, width=2)

    # Stem
    stem_y = (cap_y1+cap_y2)//2
    d.rectangle([90, stem_y, 166, stem_y+60], outline=white, width=STROKE)

    # Ninja bandana across eyes
    band_y = stem_y + 15
    d.rectangle([75, band_y, 181, band_y+20], fill=red, outline=red, width=1)

    # Eyes (angry slits visible through bandana)
    for ex in [110, 146]:
        d.line([ex-6, band_y+10, ex+6, band_y+10], fill=white, width=3)

    # Bandana tails
    d.line([181, band_y+5, 205, band_y-10], fill=red, width=STROKE)
    d.line([181, band_y+15, 208, band_y+5], fill=red, width=STROKE)

    finalize(c, 'champi-ninja', glow_color=(255,50,50), glow_blur=7, glow_passes=2)

def draw_doodle_weed():
    """Doodle character/rocket going up with green smoke trail."""
    c = new_canvas()
    d = ImageDraw.Draw(c)
    green = (57, 255, 20, 255)
    green_dim = (30, 180, 10, 180)
    purple = (180, 80, 255, 255)

    # Simple rocket body
    rcx, rcy = 128, 90
    # Nose cone
    d.polygon([(rcx, rcy-45), (rcx-20, rcy-10), (rcx+20, rcy-10)], outline=purple, width=STROKE)
    # Body
    d.rectangle([rcx-20, rcy-10, rcx+20, rcy+40], outline=purple, width=STROKE)
    # Fins
    d.polygon([(rcx-20, rcy+25), (rcx-35, rcy+45), (rcx-20, rcy+40)], outline=purple, width=2)
    d.polygon([(rcx+20, rcy+25), (rcx+35, rcy+45), (rcx+20, rcy+40)], outline=purple, width=2)
    # Window
    d.ellipse([rcx-8, rcy, rcx+8, rcy+16], outline=green, width=2)

    # Green smoke trail below
    for i in range(8):
        t = i / 7
        y = rcy + 50 + i * 16
        spread = 10 + i * 8
        alpha = int(220 * (1 - t * 0.7))
        col = (30, 180, 10, alpha)
        d.ellipse([rcx-spread, y-6, rcx+spread, y+6], outline=col, width=2)

    finalize(c, 'doodle-weed', glow_color=(57,255,20), glow_blur=7, glow_passes=2)


# ═══════════════════════════════════════════════════════════
# 5. Additional missing/updated icons
# ═══════════════════════════════════════════════════════════
def draw_brain_maze():
    """Brain shape with maze-like internal lines."""
    c = new_canvas()
    d = ImageDraw.Draw(c)
    orange = (255, 68, 0, 255)

    cx, cy = 128, 128
    # Brain outline (two overlapping circles)
    d.arc([cx-65, cy-60, cx+5, cy+60], 0, 360, fill=orange, width=STROKE)
    d.arc([cx-5, cy-60, cx+65, cy+60], 0, 360, fill=orange, width=STROKE)
    # Center divide
    d.line([cx, cy-55, cx, cy+55], fill=orange, width=2)
    # Squiggly internal lines (L hemisphere)
    for offset in [-30, -10, 10, 30]:
        yy = cy + offset
        d.arc([cx-55, yy-12, cx-10, yy+12], 0, 180, fill=orange, width=2)
    # R hemisphere
    for offset in [-20, 0, 20]:
        yy = cy + offset
        d.arc([cx+10, yy-15, cx+55, yy+15], 180, 360, fill=orange, width=2)

    finalize(c, 'brain-maze', glow_color=(255,68,0), glow_blur=6, glow_passes=2)

def draw_chrono_stopwatch():
    """Stopwatch icon – cyan neon."""
    c = new_canvas()
    d = ImageDraw.Draw(c)
    cyan = (0, 200, 255, 255)

    cx, cy, r = 128, 140, 72
    # Watch body
    d.ellipse([cx-r, cy-r, cx+r, cy+r], outline=cyan, width=STROKE)
    # Top button
    d.rectangle([cx-8, cy-r-18, cx+8, cy-r], outline=cyan, width=STROKE)
    # Small ring
    d.arc([cx-12, cy-r-6, cx+12, cy-r+6], 0, 360, fill=cyan, width=2)
    # Clock hands
    d.line([cx, cy, cx, cy-45], fill=cyan, width=STROKE)  # minute
    d.line([cx, cy, cx+30, cy+10], fill=cyan, width=2)  # second
    # Tick marks
    for i in range(12):
        a = math.radians(i * 30 - 90)
        x1 = cx + (r-8) * math.cos(a)
        y1 = cy + (r-8) * math.sin(a)
        x2 = cx + (r-2) * math.cos(a)
        y2 = cy + (r-2) * math.sin(a)
        d.line([x1, y1, x2, y2], fill=cyan, width=2)

    finalize(c, 'chrono-stopwatch', glow_color=(0,200,255), glow_blur=6, glow_passes=2)

def draw_star_purple():
    """5-pointed star – magenta/purple neon."""
    c = new_canvas()
    d = ImageDraw.Draw(c)
    mag = (255, 0, 255, 255)

    cx, cy, r_out, r_in = 128, 128, 80, 35
    pts = []
    for i in range(10):
        angle = math.radians(i * 36 - 90)
        r = r_out if i % 2 == 0 else r_in
        pts.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    for i in range(len(pts)):
        d.line([pts[i], pts[(i+1)%len(pts)]], fill=mag, width=STROKE)
    # Inner glow dot
    d.ellipse([cx-4, cy-4, cx+4, cy+4], fill=mag)

    finalize(c, 'star-purple', glow_color=(255,0,255), glow_blur=7, glow_passes=2)

def draw_red_mushroom():
    """Red spotted mushroom – classic Mario style, neon."""
    c = new_canvas()
    d = ImageDraw.Draw(c)
    red = (255, 50, 50, 255)
    white = (255, 255, 255, 255)

    # Cap (half ellipse)
    cap_cx, cap_y = 128, 120
    d.arc([48, 45, 208, 165], 180, 360, fill=red, width=STROKE+1)
    d.line([48, 105, 208, 105], fill=red, width=STROKE)
    # Spots
    for sx, sy, sr in [(95, 75, 14), (160, 80, 12), (128, 58, 10)]:
        d.ellipse([sx-sr, sy-sr, sx+sr, sy+sr], outline=white, width=2)
    # Stem
    d.rectangle([90, 105, 166, 175], outline=white, width=STROKE)
    # Eyes
    for ex in [108, 148]:
        d.ellipse([ex-6, 120, ex+6, 140], fill=white)
        d.ellipse([ex-3, 126, ex+3, 136], fill=(0,0,0,255))

    finalize(c, 'red-mushroom-spotted', glow_color=(255,50,50), glow_blur=7, glow_passes=2)

def draw_poker_card_only():
    """Cleaner poker card for nav/badges."""
    c = new_canvas()
    d = ImageDraw.Draw(c)
    magenta = (255, 0, 160, 255)
    white = (255, 255, 255, 255)

    # Single prominent card
    x1, y1 = 68, 38
    w, h = 120, 170
    r = 12
    d.rounded_rectangle([x1, y1, x1+w, y1+h], radius=r, outline=magenta, width=STROKE+1)
    
    # Spade symbol
    scx, scy = x1 + w//2, y1 + h//2 - 5
    # Spade top (two arcs + triangle)
    d.ellipse([scx-16, scy-22, scx, scy-2], outline=white, width=2)
    d.ellipse([scx, scy-22, scx+16, scy-2], outline=white, width=2)
    d.polygon([(scx, scy-28), (scx-16, scy-8), (scx+16, scy-8)], outline=white)
    d.line([scx, scy-6, scx, scy+12], fill=white, width=2)
    d.line([scx-6, scy+12, scx+6, scy+12], fill=white, width=2)
    
    # A in top-left
    d.text((x1+10, y1+8), "A", fill=white)
    # A in bottom-right (inverted feel)
    d.text((x1+w-18, y1+h-24), "A", fill=white)

    finalize(c, 'poker-card', glow_color=(255,0,160), glow_blur=7, glow_passes=2)


# ═══════════════════════════════════════════════════════════
# RUN ALL GENERATORS
# ═══════════════════════════════════════════════════════════
if __name__ == '__main__':
    print("=== Generating Neon Icons ===\n")

    print("1. COINS")
    draw_coin_gold()
    draw_coins_stack()

    print("\n2. POKER")
    draw_poker_chip()
    draw_poker_card_only()  # replaces old poker-card
    draw_poker_dice()

    print("\n3. TROMBI")
    draw_trombi_amas()
    draw_trombi_event()
    draw_trombi_com()
    draw_trombi_travel()

    print("\n4. LUIGI ARCADE")
    draw_champi_ninja()
    draw_doodle_weed()

    print("\n5. REFRESHED SUPPORT ICONS")
    draw_brain_maze()
    draw_chrono_stopwatch()
    draw_star_purple()
    draw_red_mushroom()

    print("\n=== Done ===")
