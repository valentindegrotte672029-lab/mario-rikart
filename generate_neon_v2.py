#!/usr/bin/env python3
"""
Neon Icon Generator v2 – Refined geometric assets
Generates pixel-perfect 256×256 neon icons on OLED black.
Focus: coins (geometric gold), mushroom (sharp), poker (magenta minimal).
Uses supersampled rendering (512→256) for anti-aliased crispness.
"""
import math
from PIL import Image, ImageDraw, ImageFilter
import os

OUTPUT = '/Users/user/mario-rikart/core-astro/public/images/icons/items'
os.makedirs(OUTPUT, exist_ok=True)

# ─── Rendering at 2× then downscale for crisp anti-aliasing ─────
RENDER_SIZE = 512
FINAL_SIZE = 256
SW = 5  # stroke width at 2× (becomes ~2.5px final = sharp neon line)
SW_THICK = 7

def new_canvas():
    return Image.new('RGBA', (RENDER_SIZE, RENDER_SIZE), (0, 0, 0, 0))

def apply_neon_glow(canvas, blur_radius=10, passes=3):
    glow = canvas.copy()
    for _ in range(passes):
        glow = glow.filter(ImageFilter.GaussianBlur(blur_radius))
    result = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    result = Image.alpha_composite(result, glow)
    result = Image.alpha_composite(result, canvas)
    return result

def finalize(img, name, glow_blur=12, glow_passes=3):
    img = apply_neon_glow(img, glow_blur, glow_passes)
    # Downscale 2x with LANCZOS
    img = img.resize((FINAL_SIZE, FINAL_SIZE), Image.LANCZOS)
    # Composite onto solid black
    black = Image.new('RGBA', (FINAL_SIZE, FINAL_SIZE), (0, 0, 0, 255))
    result = Image.alpha_composite(black, img)
    path = os.path.join(OUTPUT, f'{name}.png')
    result.save(path, 'PNG', optimize=True)
    print(f'  ✓ {name}.png')


# ═══════════════════════════════════════════════════════════
# 1. COIN-GOLD – Perfect geometric circle, gold neon, center slit
# ═══════════════════════════════════════════════════════════
def draw_coin_gold():
    c = new_canvas()
    d = ImageDraw.Draw(c)
    cx, cy = 256, 256
    gold = (255, 215, 0, 255)
    gold_bright = (255, 235, 80, 255)

    r_outer = 110
    r_inner = 88

    # Outer circle – thick bright gold
    d.ellipse([cx-r_outer, cy-r_outer, cx+r_outer, cy+r_outer],
              outline=gold_bright, width=SW_THICK)
    # Inner circle – thinner gold
    d.ellipse([cx-r_inner, cy-r_inner, cx+r_inner, cy+r_inner],
              outline=gold, width=SW)

    # Vertical center slit – crisp
    slit_top = cy - r_inner + 20
    slit_bot = cy + r_inner - 20
    d.line([cx, slit_top, cx, slit_bot], fill=gold_bright, width=SW)

    # Top/bottom serif (small horizontal lines at slit ends)
    serif_hw = 12
    d.line([cx-serif_hw, slit_top, cx+serif_hw, slit_top], fill=gold, width=SW-1)
    d.line([cx-serif_hw, slit_bot, cx+serif_hw, slit_bot], fill=gold, width=SW-1)

    finalize(c, 'coin-gold', glow_blur=14, glow_passes=3)


def draw_coins_stack():
    c = new_canvas()
    d = ImageDraw.Draw(c)
    gold = (255, 215, 0, 255)
    gold_bright = (255, 235, 80, 255)

    # 3 coins stacked vertically offset
    for i, (cx, cy) in enumerate([(256, 310), (256, 256), (256, 202)]):
        r_o = 72
        r_i = 58
        col = gold_bright if i == 2 else gold
        d.ellipse([cx-r_o, cy-r_o, cx+r_o, cy+r_o], outline=col, width=SW_THICK if i==2 else SW)
        d.ellipse([cx-r_i, cy-r_i, cx+r_i, cy+r_i], outline=gold, width=SW-1)
        # Vertical slit
        st, sb = cy - r_i + 14, cy + r_i - 14
        d.line([cx, st, cx, sb], fill=col, width=SW-1)

    finalize(c, 'coins-stack', glow_blur=12, glow_passes=3)


# ═══════════════════════════════════════════════════════════
# 2. RED-MUSHROOM-SPOTTED – Sharp, geometric, iconic
# ═══════════════════════════════════════════════════════════
def draw_red_mushroom():
    c = new_canvas()
    d = ImageDraw.Draw(c)
    red = (255, 45, 45, 255)
    white = (255, 255, 255, 255)

    # Cap – clean arc
    cap_left, cap_right = 68, 444
    cap_top = 70
    cap_mid_y = 240  # flat bottom of cap

    # Draw dome as upper half of ellipse
    d.arc([cap_left, cap_top, cap_right, cap_mid_y + (cap_mid_y - cap_top)],
          180, 360, fill=red, width=SW_THICK)
    # Flat bottom line of cap
    d.line([cap_left, cap_mid_y, cap_right, cap_mid_y], fill=red, width=SW_THICK)

    # Spots – clean circles
    spots = [(190, 140, 24), (310, 150, 20), (256, 110, 18)]
    for sx, sy, sr in spots:
        d.ellipse([sx-sr, sy-sr, sx+sr, sy+sr], outline=white, width=SW)

    # Stem – clean rectangle
    stem_l, stem_r = 170, 342
    stem_top = cap_mid_y
    stem_bot = cap_mid_y + 120
    d.line([stem_l, stem_top, stem_l, stem_bot], fill=white, width=SW)
    d.line([stem_r, stem_top, stem_r, stem_bot], fill=white, width=SW)
    d.line([stem_l, stem_bot, stem_r, stem_bot], fill=white, width=SW)

    # Eyes – simple ovals
    for ex in [216, 296]:
        d.ellipse([ex-10, cap_mid_y+20, ex+10, cap_mid_y+52], outline=white, width=SW)
        # Pupil
        d.ellipse([ex-4, cap_mid_y+32, ex+4, cap_mid_y+46], fill=white)

    finalize(c, 'red-mushroom-spotted', glow_blur=12, glow_passes=2)


# ═══════════════════════════════════════════════════════════
# 3. CHAMPI-NINJA – Mushroom + ninja bandana
# ═══════════════════════════════════════════════════════════
def draw_champi_ninja():
    c = new_canvas()
    d = ImageDraw.Draw(c)
    red = (255, 45, 45, 255)
    white = (255, 255, 255, 255)
    dark_red = (180, 0, 0, 255)

    cap_left, cap_right = 68, 444
    cap_top = 70
    cap_mid_y = 240

    # Dome
    d.arc([cap_left, cap_top, cap_right, cap_mid_y + (cap_mid_y - cap_top)],
          180, 360, fill=red, width=SW_THICK)
    d.line([cap_left, cap_mid_y, cap_right, cap_mid_y], fill=red, width=SW_THICK)

    # Spots
    for sx, sy, sr in [(190, 140, 24), (310, 150, 20), (256, 110, 18)]:
        d.ellipse([sx-sr, sy-sr, sx+sr, sy+sr], outline=white, width=SW)

    # Stem
    stem_l, stem_r = 170, 342
    stem_top = cap_mid_y
    stem_bot = cap_mid_y + 110
    d.line([stem_l, stem_top, stem_l, stem_bot], fill=white, width=SW)
    d.line([stem_r, stem_top, stem_r, stem_bot], fill=white, width=SW)
    d.line([stem_l, stem_bot, stem_r, stem_bot], fill=white, width=SW)

    # Ninja bandana – horizontal band across eyes
    band_y1 = cap_mid_y + 18
    band_y2 = cap_mid_y + 52
    d.rectangle([stem_l-15, band_y1, stem_r+15, band_y2], outline=red, width=SW)
    # Fill band semi-transparent
    d.rectangle([stem_l-14, band_y1+1, stem_r+14, band_y2-1], fill=(180, 0, 0, 200))

    # Angry slit eyes through bandana
    eye_y = (band_y1 + band_y2) // 2
    for ex in [216, 296]:
        d.line([ex-14, eye_y, ex+14, eye_y], fill=white, width=SW+1)
        # Slight angry brow angle
        d.line([ex-14, eye_y-6, ex+4, eye_y-2], fill=white, width=SW-1)

    # Bandana tails flying right
    tail_y = (band_y1 + band_y2) // 2
    d.line([stem_r+15, band_y1+6, stem_r+55, band_y1-15], fill=red, width=SW)
    d.line([stem_r+15, band_y2-6, stem_r+60, band_y2-2], fill=red, width=SW)

    finalize(c, 'champi-ninja', glow_blur=12, glow_passes=2)


# ═══════════════════════════════════════════════════════════
# 4. POKER-CARD – Ace, magenta neon, ultra-minimal
# ═══════════════════════════════════════════════════════════
def draw_poker_card():
    c = new_canvas()
    d = ImageDraw.Draw(c)
    mag = (255, 0, 160, 255)
    mag_dim = (200, 0, 120, 220)
    white = (255, 255, 255, 255)

    # Back card (rotated slightly)
    def rotated_rect(d, cx, cy, w, h, angle_deg, color, sw):
        a = math.radians(angle_deg)
        cos_a, sin_a = math.cos(a), math.sin(a)
        hw, hh = w/2, h/2
        corners = [(-hw,-hh), (hw,-hh), (hw,hh), (-hw,hh)]
        pts = [(cx + x*cos_a - y*sin_a, cy + x*sin_a + y*cos_a) for x,y in corners]
        for i in range(4):
            d.line([pts[i], pts[(i+1)%4]], fill=color, width=sw)
        return pts

    # Back card (offset, dimmer)
    rotated_rect(d, 274, 260, 140, 210, 10, mag_dim, SW)

    # Front card (ace of spades)
    pts = rotated_rect(d, 240, 256, 140, 210, -4, mag, SW_THICK)

    # Spade in center of front card
    scx, scy = 240, 240

    # Spade = inverted heart + stem
    # Two overlapping circles for body
    sr = 18
    d.ellipse([scx-sr-8, scy-sr-14, scx-8+sr, scy+4], outline=white, width=SW)
    d.ellipse([scx+8-sr, scy-sr-14, scx+8+sr, scy+4], outline=white, width=SW)
    # Top point
    d.polygon([(scx, scy-sr-28), (scx-sr-6, scy-6), (scx+sr+6, scy-6)], outline=white)
    d.line([(scx, scy-sr-28), (scx-sr-6, scy-6)], fill=white, width=SW-1)
    d.line([(scx, scy-sr-28), (scx+sr+6, scy-6)], fill=white, width=SW-1)
    # Stem
    d.line([scx, scy+2, scx, scy+22], fill=white, width=SW)
    # Serif base
    d.line([scx-10, scy+22, scx+10, scy+22], fill=white, width=SW-1)

    # "A" top-left corner (approximate with lines)
    ax, ay = 185, 170
    d.line([ax, ay+20, ax+8, ay], fill=white, width=SW-1)
    d.line([ax+8, ay, ax+16, ay+20], fill=white, width=SW-1)
    d.line([ax+3, ay+12, ax+13, ay+12], fill=white, width=SW-2)

    finalize(c, 'poker-card', glow_blur=10, glow_passes=2)


# ═══════════════════════════════════════════════════════════
# 5. POKER-CHIP – Disc with dashed border, magenta neon
# ═══════════════════════════════════════════════════════════
def draw_poker_chip():
    c = new_canvas()
    d = ImageDraw.Draw(c)
    mag = (255, 0, 160, 255)
    white = (255, 255, 255, 255)
    cx, cy = 256, 256

    r_outer = 110
    r_dash = 90
    r_inner = 40

    # Outer ring
    d.ellipse([cx-r_outer, cy-r_outer, cx+r_outer, cy+r_outer],
              outline=mag, width=SW_THICK)

    # Dashed ring (24 dashes around circumference)
    n_dashes = 24
    for i in range(n_dashes):
        a1 = math.radians(i * 360 / n_dashes)
        a2 = math.radians((i + 0.4) * 360 / n_dashes)
        x1, y1 = cx + r_dash * math.cos(a1), cy + r_dash * math.sin(a1)
        x2, y2 = cx + r_dash * math.cos(a2), cy + r_dash * math.sin(a2)
        d.line([x1, y1, x2, y2], fill=white, width=SW)

    # Center circle
    d.ellipse([cx-r_inner, cy-r_inner, cx+r_inner, cy+r_inner],
              outline=mag, width=SW)

    # Star in center (5-pointed, small)
    star_r = 18
    star_pts = []
    for i in range(10):
        angle = math.radians(i * 36 - 90)
        r = star_r if i % 2 == 0 else star_r * 0.4
        star_pts.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    for i in range(len(star_pts)):
        d.line([star_pts[i], star_pts[(i+1)%len(star_pts)]], fill=mag, width=SW-1)

    finalize(c, 'poker-chip', glow_blur=10, glow_passes=2)


# ═══════════════════════════════════════════════════════════
# 6. POKER-DICE – Isometric pair, cyan neon lines
# ═══════════════════════════════════════════════════════════
def draw_poker_dice():
    c = new_canvas()
    d = ImageDraw.Draw(c)
    cyan = (0, 220, 255, 255)
    white = (255, 255, 255, 255)

    def iso_die(d, ox, oy, s):
        """Draw isometric die outline."""
        a30 = math.radians(30)
        a150 = math.radians(150)
        dx1 = s * math.cos(a30)
        dy1 = -s * math.sin(a30)
        dx2 = s * math.cos(a150)
        dy2 = -s * math.sin(a150)

        top = [(ox, oy), (ox+dx1, oy+dy1), (ox+dx1+dx2, oy+dy1+dy2), (ox+dx2, oy+dy2)]
        right = [(ox+dx1, oy+dy1), (ox+dx1, oy+dy1+s), (ox+dx1+dx2, oy+dy1+dy2+s), (ox+dx1+dx2, oy+dy1+dy2)]
        left = [(ox+dx2, oy+dy2), (ox+dx2, oy+dy2+s), (ox+dx1+dx2, oy+dy1+dy2+s), (ox+dx1+dx2, oy+dy1+dy2)]

        for face in [top, right, left]:
            for i in range(4):
                d.line([face[i], face[(i+1)%4]], fill=cyan, width=SW)

        # Dots on top face (center + two corners = 3)
        center = ((top[0][0]+top[2][0])/2, (top[0][1]+top[2][1])/2)
        dot_r = 5
        d.ellipse([center[0]-dot_r, center[1]-dot_r, center[0]+dot_r, center[1]+dot_r], fill=white)
        for ci in [0, 2]:
            mx = (top[ci][0] + center[0]) / 2
            my = (top[ci][1] + center[1]) / 2
            d.ellipse([mx-dot_r, my-dot_r, mx+dot_r, my+dot_r], fill=white)

    iso_die(d, 170, 220, 70)
    iso_die(d, 280, 190, 60)

    finalize(c, 'poker-dice', glow_blur=10, glow_passes=2)


# ═══════════════════════════════════════════════════════════
if __name__ == '__main__':
    print("=== Neon Icons v2 – Refined Assets ===\n")

    print("COINS")
    draw_coin_gold()
    draw_coins_stack()

    print("\nMUSHROOM")
    draw_red_mushroom()
    draw_champi_ninja()

    print("\nPOKER")
    draw_poker_card()
    draw_poker_chip()
    draw_poker_dice()

    print("\n=== Done ===")
