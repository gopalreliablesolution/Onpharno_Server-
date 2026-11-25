"""Generates branded ONPHARNO placeholder images (WebP, 1200x1200) for every product,
dosage form and health category. Run: python3 scripts/make_images.py  (needs Pillow).
These are illustrations, NOT photographs. Replace with real product photos named <slug>.webp."""
import json, os, math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
S, OUT = 1600, 1200
LORA = "/usr/share/fonts/truetype/google-fonts/Lora-Variable.ttf"
POP_M = "/usr/share/fonts/truetype/google-fonts/Poppins-Medium.ttf"
POP_R = "/usr/share/fonts/truetype/google-fonts/Poppins-Regular.ttf"
LOGO = Image.open(os.path.join(ROOT, "assets", "logo-mark.png")).convert("RGB")

def font(path, size, bold=False):
    f = ImageFont.truetype(path, size)
    if bold:
        try: f.set_variation_by_name("Bold")
        except Exception: pass
    return f

def hx(h): return tuple(int(h[i:i+2], 16) for i in (1, 3, 5))
def mix(a, b, t): return tuple(int(a[i]*(1-t)+b[i]*t) for i in range(3))
def lighten(c, t): return mix(c, (255,255,255), t)
def darken(c, t): return mix(c, (0,0,0), t)

BRAND_A, BRAND_B = hx("#D85430"), hx("#843C30")
CAT_COLORS = {
 "Daily Wellness":"#D85430","Men's Health":"#8E3B33","Women's Health":"#C9503A","Beauty Nutrition":"#E0703C",
 "Sports Nutrition":"#A83030","Healthy Ageing":"#9C4A3C","Gut Health":"#C04830","Immunity":"#E4572E",
 "Bone & Joint":"#843C30","Brain Health":"#B5402F","Sleep & Stress":"#A64B3C","Specialized Nutrition":"#CB5A36"}

def vgrad(size, top, bot):
    m = Image.linear_gradient("L").resize(size)
    return Image.composite(Image.new("RGB", size, bot), Image.new("RGB", size, top), m)

def grad_layer(size, mask, top, bot, alpha=255):
    g = vgrad(size, top, bot).convert("RGBA")
    g.putalpha(mask.point(lambda v: v*alpha//255) if alpha != 255 else mask)
    return g

def rr_mask(size, bbox, r):
    m = Image.new("L", size, 0); ImageDraw.Draw(m).rounded_rectangle(bbox, r, fill=255); return m

def paste_c(cv, layer, cx, cy):
    cv.paste(layer, (int(cx - layer.width/2), int(cy - layer.height/2)), layer)

# ---------- objects ----------
def capsule(L, W, angle, cl, cr, mode="solid", fill=None, dots=None, inner=None):
    N = int(L + W*1.2); cx = cy = N//2
    x0, x1, y0, y1 = cx-L//2, cx+L//2, cy-W//2, cy+W//2
    M = rr_mask((N, N), (x0, y0, x1, y1), W//2)
    layer = Image.new("RGBA", (N, N), (0,0,0,0))
    def paint(region, top, bot):
        layer.alpha_composite(grad_layer((N, N), ImageChops.multiply(M, region), top, bot))
    def rect_mask(xa, xb):
        m = Image.new("L", (N, N), 0); ImageDraw.Draw(m).rectangle((xa, 0, xb, N), fill=255); return m
    if mode == "solid":
        left = rect_mask(0, cx); right = ImageChops.invert(left)
        paint(left, lighten(cl, .25), darken(cl, .18)); paint(right, lighten(cr, .25), darken(cr, .18))
    else:
        capm = rect_mask(0, x0 + int(L*0.36))
        paint(capm, lighten(cl, .25), darken(cl, .18))
        body = ImageChops.multiply(M, ImageChops.invert(capm))
        gl = Image.new("RGBA", (N, N), (255,255,255,0)); gl.putalpha(body.point(lambda v: v*95//255)); layer.alpha_composite(gl)
        fm = rr_mask((N, N), (x0+14, y0+14, x1-14, y1-14), (W-28)//2)
        fm = ImageChops.multiply(fm, ImageChops.invert(capm))
        if fill:
            layer.alpha_composite(grad_layer((N, N), fm, lighten(fill, .35), darken(fill, .1), 235))
        if dots:
            rnd = random.Random(7); dl = Image.new("RGBA", (N, N), (0,0,0,0)); dd = ImageDraw.Draw(dl)
            for _ in range(70):
                px = rnd.randint(x0 + int(L*.40), x1 - W//3); py = rnd.randint(y0 + 30, y1 - 30); r = rnd.randint(14, 24)
                c = rnd.choice(dots); dd.ellipse((px-r, py-r, px+r, py+r), fill=c+(255,), outline=darken(c, .25)+(255,), width=3)
                dd.ellipse((px-r//2, py-r//2-2, px-2, py-2), fill=(255,255,255,140))
            dl.putalpha(ImageChops.multiply(dl.getchannel("A"), fm)); layer.alpha_composite(dl)
        if inner is not None:
            layer.alpha_composite(inner, (cx - inner.width//2 + int(L*.12), cy - inner.height//2))
    ol = Image.new("RGBA", (N, N), (0,0,0,0)); ImageDraw.Draw(ol).rounded_rectangle((x0, y0, x1, y1), W//2, outline=(0,0,0,55), width=4)
    layer.alpha_composite(ol)
    hl = Image.new("RGBA", (N, N), (0,0,0,0))
    ImageDraw.Draw(hl).rounded_rectangle((x0+int(W*.4), y0+int(W*.14), x1-int(W*.4), y0+int(W*.3)), int(W*.08), fill=(255,255,255,120))
    hl.putalpha(ImageChops.multiply(hl.getchannel("A"), M)); layer.alpha_composite(hl)
    return layer.rotate(angle, resample=Image.BICUBIC, expand=True)

def tablet(D, color, oblong=False):
    N = D + 80; W = D; H = int(D*0.62) if oblong else D
    layer = Image.new("RGBA", (N, N), (0,0,0,0)); cx = cy = N//2
    def shp(inset):
        m = Image.new("L", (N, N), 0); dr = ImageDraw.Draw(m)
        if oblong: dr.rounded_rectangle((cx-W//2+inset, cy-H//2+inset, cx+W//2-inset, cy+H//2-inset), H//2-inset, fill=255)
        else: dr.ellipse((cx-W//2+inset, cy-H//2+inset, cx+W//2-inset, cy+H//2-inset), fill=255)
        return m
    layer.alpha_composite(grad_layer((N, N), shp(0), darken(color, .12), darken(color, .3)))
    layer.alpha_composite(grad_layer((N, N), shp(16), lighten(color, .35), color))
    dl = ImageDraw.Draw(layer)
    dl.line((cx - W//2 + 40, cy, cx + W//2 - 40, cy), fill=darken(color, .35) + (180,), width=7)
    dl.line((cx - W//2 + 40, cy+7, cx + W//2 - 40, cy+7), fill=(255,255,255,150), width=4)
    hl = Image.new("RGBA", (N, N), (0,0,0,0)); ImageDraw.Draw(hl).ellipse((cx-W//2+46, cy-H//2+30, cx-W//2+170, cy-H//2+80), fill=(255,255,255,120))
    hl.putalpha(ImageChops.multiply(hl.getchannel("A"), shp(10))); layer.alpha_composite(hl)
    return layer

def softgel(Wd, Ht, angle, base):
    N = int(Wd*1.3); layer = Image.new("RGBA", (N, N), (0,0,0,0)); cx = cy = N//2
    m = Image.new("L", (N, N), 0); ImageDraw.Draw(m).ellipse((cx-Wd//2, cy-Ht//2, cx+Wd//2, cy+Ht//2), fill=255)
    layer.alpha_composite(grad_layer((N, N), m, lighten(base, .45), darken(base, .22)))
    d = ImageDraw.Draw(layer); d.line((cx-Wd//2+30, cy, cx+Wd//2-30, cy), fill=darken(base, .3)+(110,), width=4)
    hl = Image.new("RGBA", (N, N), (0,0,0,0)); ImageDraw.Draw(hl).ellipse((cx-Wd//2+50, cy-Ht//2+24, cx+Wd//4, cy-Ht//2+80), fill=(255,255,255,170))
    hl.putalpha(ImageChops.multiply(hl.getchannel("A"), m)); layer.alpha_composite(hl)
    return layer.rotate(angle, resample=Image.BICUBIC, expand=True)

def label_text(layer, box, text, color, size=44):
    d = ImageDraw.Draw(layer); f = font(POP_M, size)
    w = d.textlength(text, font=f); x = box[0] + (box[2]-box[0]-w)/2; y = box[1] + (box[3]-box[1]-size)/2 - 4
    d.text((x, y), text, font=f, fill=color)

def sachet(w, h, color, angle):
    N = max(w, h) + 240; layer = Image.new("RGBA", (N, N), (0,0,0,0)); cx = cy = N//2
    x0, x1, y0, y1 = cx-w//2, cx+w//2, cy-h//2, cy+h//2; step, dep = 24, 14
    pts = []
    for i, x in enumerate(range(x0, x1+1, step)): pts.append((x, y0 + (dep if i % 2 else 0)))
    for i, x in enumerate(range(x1, x0-1, -step)): pts.append((x, y1 - (dep if i % 2 else 0)))
    m = Image.new("L", (N, N), 0); ImageDraw.Draw(m).polygon(pts, fill=255)
    layer.alpha_composite(grad_layer((N, N), m, lighten(color, .15), darken(color, .22)))
    d = ImageDraw.Draw(layer)
    d.rounded_rectangle((x0+36, cy-h*0.18, x1-36, cy+h*0.18), 22, fill=(255,255,255,245))
    label_text(layer, (x0+36, int(cy-h*0.18), x1-36, int(cy+h*0.18)), "ONPHARNO", darken(color, .15), 46)
    sh = Image.new("RGBA", (N, N), (0,0,0,0)); ImageDraw.Draw(sh).rectangle((x0+20, y0, x0+60, y1), fill=(255,255,255,70))
    sh.putalpha(ImageChops.multiply(sh.getchannel("A"), m)); layer.alpha_composite(sh)
    return layer.rotate(angle, resample=Image.BICUBIC, expand=True)

def tub(color):
    N = (900, 1000); layer = Image.new("RGBA", N, (0,0,0,0))
    layer.alpha_composite(grad_layer(N, rr_mask(N, (170, 190, 730, 930), 60), lighten(color, .1), darken(color, .25)))
    layer.alpha_composite(grad_layer(N, rr_mask(N, (140, 60, 760, 210), 40), lighten((60,50,50), .15), (40,30,30)))
    d = ImageDraw.Draw(layer)
    d.rounded_rectangle((215, 380, 685, 780), 30, fill=(255,255,255,245))
    label_text(layer, (215, 420, 685, 520), "ONPHARNO", darken(color, .15), 54)
    d.line((300, 560, 600, 560), fill=color+(255,), width=8)
    label_text(layer, (215, 600, 685, 700), "POWDER", (120,100,95), 40)
    hl = Image.new("RGBA", N, (0,0,0,0)); ImageDraw.Draw(hl).rounded_rectangle((200, 230, 250, 900), 20, fill=(255,255,255,70)); layer.alpha_composite(hl)
    return layer

def scoop(color):
    N = (520, 360); layer = Image.new("RGBA", N, (0,0,0,0)); d = ImageDraw.Draw(layer)
    d.rounded_rectangle((180, 130, 500, 170), 20, fill=darken(color, .2)+(255,))
    m = Image.new("L", N, 0); ImageDraw.Draw(m).pieslice((10, 40, 230, 300), 0, 180, fill=255)
    layer.alpha_composite(grad_layer(N, m, lighten(color, .2), darken(color, .2)))
    d.ellipse((10, 130, 230, 175), fill=lighten(color, .7)+(255,))
    return layer

def gummy(sz, color, angle):
    N = sz + 80; layer = Image.new("RGBA", (N, N), (0,0,0,0)); c = N//2
    m = rr_mask((N, N), (c-sz//2, c-sz//2, c+sz//2, c+sz//2), int(sz*.32))
    layer.alpha_composite(grad_layer((N, N), m, lighten(color, .3), darken(color, .2), 245))
    hl = Image.new("RGBA", (N, N), (0,0,0,0)); ImageDraw.Draw(hl).ellipse((c-sz//2+22, c-sz//2+20, c-sz//2+sz//2, c-sz//2+sz//3), fill=(255,255,255,120))
    hl.putalpha(ImageChops.multiply(hl.getchannel("A"), m)); layer.alpha_composite(hl)
    rnd = random.Random(int(sz)); d = ImageDraw.Draw(layer)
    for _ in range(26):
        x, y = rnd.randint(c-sz//2+20, c+sz//2-20), rnd.randint(c-sz//2+20, c+sz//2-20); d.ellipse((x-4, y-4, x+4, y+4), fill=(255,255,255,170))
    return layer.rotate(angle, resample=Image.BICUBIC, expand=True)

def bottle(color, liquid):
    N = (620, 1000); layer = Image.new("RGBA", N, (0,0,0,0)); d = ImageDraw.Draw(layer)
    body = rr_mask(N, (90, 280, 530, 930), 80); neck = rr_mask(N, (215, 170, 405, 310), 20)
    glass = Image.new("RGBA", N, (255,255,255,0)); glass.putalpha(ImageChops.lighter(body, neck).point(lambda v: v*70//255)); layer.alpha_composite(glass)
    layer.alpha_composite(grad_layer(N, rr_mask(N, (106, 420, 514, 914), 66), lighten(liquid, .25), darken(liquid, .15), 240))
    layer.alpha_composite(grad_layer(N, rr_mask(N, (190, 70, 430, 190), 28), lighten(color, .2), darken(color, .2)))
    d.rounded_rectangle((90, 280, 530, 930), 80, outline=(0,0,0,50), width=4)
    d.rounded_rectangle((130, 560, 490, 800), 24, fill=(255,255,255,245))
    label_text(layer, (130, 580, 490, 680), "ONPHARNO", darken(color, .15), 46)
    d.line((190, 710, 430, 710), fill=color+(255,), width=8)
    hl = Image.new("RGBA", N, (0,0,0,0)); ImageDraw.Draw(hl).rounded_rectangle((120, 320, 150, 880), 14, fill=(255,255,255,110)); layer.alpha_composite(hl)
    return layer

def vial(color, liquid):
    N = (280, 720); layer = Image.new("RGBA", N, (0,0,0,0)); d = ImageDraw.Draw(layer)
    body = rr_mask(N, (40, 170, 240, 690), 70); neck = rr_mask(N, (80, 100, 200, 190), 10)
    glass = Image.new("RGBA", N, (255,255,255,0)); glass.putalpha(ImageChops.lighter(body, neck).point(lambda v: v*70//255)); layer.alpha_composite(glass)
    layer.alpha_composite(grad_layer(N, rr_mask(N, (54, 260, 226, 676), 58), lighten(liquid, .25), darken(liquid, .15), 240))
    layer.alpha_composite(grad_layer(N, rr_mask(N, (60, 20, 220, 120), 24), lighten(color, .2), darken(color, .2)))
    d.rounded_rectangle((40, 170, 240, 690), 70, outline=(0,0,0,50), width=4)
    d.rectangle((54, 400, 226, 520), fill=(255,255,255,240)); d.line((54, 460, 226, 460), fill=color+(255,), width=8)
    return layer

def tube(color):
    N = (420, 960); layer = Image.new("RGBA", N, (0,0,0,0)); d = ImageDraw.Draw(layer)
    layer.alpha_composite(grad_layer(N, rr_mask(N, (80, 150, 340, 930), 40), (250,250,250), (215,215,215)))
    d.rectangle((80, 330, 340, 700), fill=color+(255,))
    layer.alpha_composite(grad_layer(N, rr_mask(N, (60, 40, 360, 180), 36), lighten((70,60,60), .1), (40,32,32)))
    d.rounded_rectangle((115, 420, 305, 610), 22, fill=(255,255,255,240)); label_text(layer, (115, 475, 305, 560), "ONPHARNO", darken(color, .15), 30)
    hl = Image.new("RGBA", N, (0,0,0,0)); ImageDraw.Draw(hl).rounded_rectangle((100, 200, 130, 900), 12, fill=(255,255,255,120)); layer.alpha_composite(hl)
    return layer

def hexagon(r, cx, cy, rot=0):
    return [(cx + r*math.cos(math.radians(60*i + rot)), cy + r*math.sin(math.radians(60*i + rot))) for i in range(6)]

# ---------- scenes ----------
def scene(cv, form, color):
    cx, cy = 800, 690
    amber = mix((236,170,60), color, .12)
    liquid_dark = darken(mix((200,110,40), color, .3), .1)
    if form == "Tablets":
        paste_c(cv, tablet(430, lighten(color, .72)), cx-120, cy+40)
        paste_c(cv, tablet(300, lighten(color, .6), oblong=False), cx+250, cy-130)
        paste_c(cv, tablet(380, lighten(color, .8), oblong=True).rotate(-18, resample=Image.BICUBIC, expand=True), cx+180, cy+210)
    elif form == "Capsules":
        paste_c(cv, capsule(620, 250, -32, color, lighten(color, .55)), cx-60, cy-40)
        paste_c(cv, capsule(520, 210, 24, darken(color, .1), (245,235,220)), cx+90, cy+190)
    elif form == "Liquid-Filled Hard Capsules":
        paste_c(cv, capsule(900, 340, -18, color, color, mode="glass", fill=amber), cx, cy+10)
    elif form == "Softgels":
        paste_c(cv, softgel(560, 300, -22, amber), cx-60, cy-90)
        paste_c(cv, softgel(480, 260, 18, amber), cx+120, cy+170)
        paste_c(cv, softgel(300, 170, 40, amber), cx-260, cy+230)
    elif form == "Effervescent":
        paste_c(cv, tube(color), cx-170, cy+20)
        paste_c(cv, tablet(300, lighten(color, .75)), cx+190, cy+250)
        rnd = random.Random(3); b = Image.new("RGBA", (S, S), (0,0,0,0)); bd = ImageDraw.Draw(b)
        for _ in range(26):
            x, y, r = rnd.randint(cx+30, cx+420), rnd.randint(cy-300, cy+60), rnd.randint(10, 34)
            bd.ellipse((x-r, y-r, x+r, y+r), outline=lighten(color, .35)+(220,), width=5)
        cv.paste(b, (0, 0), b)
    elif form == "Sachets":
        paste_c(cv, sachet(430, 640, color, -9), cx-170, cy+10)
        paste_c(cv, sachet(430, 640, darken(color, .12), 10), cx+190, cy+40)
    elif form == "Powders":
        paste_c(cv, tub(color), cx-70, cy+10); paste_c(cv, scoop(color), cx+300, cy+270)
    elif form == "Gummies":
        cols = [color, (240,140,50), (200,50,60), (245,190,60), (225,110,130)]
        spots = [(cx-250, cy-120, 270, -12), (cx+60, cy-210, 250, 14), (cx+300, cy+20, 260, -8), (cx-60, cy+120, 290, 10), (cx-330, cy+230, 230, 18), (cx+220, cy+260, 230, -16)]
        for i, (x, y, sz, a) in enumerate(spots): paste_c(cv, gummy(sz, cols[i % 5], a), x, y)
    elif form == "Liquids & Syrups":
        paste_c(cv, bottle(color, liquid_dark), cx, cy+10)
    elif form == "Oral Shots":
        paste_c(cv, vial(color, liquid_dark), cx-290, cy+60); paste_c(cv, vial(color, liquid_dark), cx, cy-10); paste_c(cv, vial(color, liquid_dark), cx+290, cy+60)
    elif form == "Capsule-in-Capsule":
        inner = capsule(520, 190, 0, lighten(color, .2), (245,235,220))
        paste_c(cv, capsule(920, 360, -16, color, color, mode="glass", fill=None, inner=inner), cx, cy+10)
    elif form == "Pellets-in-Capsule":
        dots = [color, (240,170,60), (230,215,190), darken(color, .2), (120,150,90)]
        paste_c(cv, capsule(920, 340, -16, color, color, mode="glass", fill=(250,240,225), dots=dots), cx, cy+10)
    else:  # hexagon motif for health categories
        d = ImageDraw.Draw(cv)
        for r, c in ((380, color), (300, lighten(color, .75)), (220, darken(color, .1))):
            d.polygon(hexagon(r, cx, cy, 30), fill=c)
        d.polygon(hexagon(120, cx, cy, 30), fill=(255,255,255))

def wrap(d, text, f, maxw):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=f) <= maxw: cur = t
        else: lines.append(cur); cur = w
    lines.append(cur); return lines

def render(title, sub, form, color, pill, path, logo=True):
    cv = Image.new("RGB", (S, S), (255,255,255))
    bd = Image.new("RGBA", (S, S), (0,0,0,0)); d0 = ImageDraw.Draw(bd)
    d0.ellipse((240, 100, 1360, 1220), fill=mix(color, (255,255,255), .9)+(255,))
    d0.ellipse((330, 190, 1270, 1130), outline=mix(color, (255,255,255), .78)+(255,), width=6)
    cv.paste(bd, (0, 0), bd)
    sh = Image.new("RGBA", (S, S), (0,0,0,0)); ImageDraw.Draw(sh).ellipse((420, 1050, 1180, 1130), fill=(0,0,0,75))
    sh = sh.filter(ImageFilter.GaussianBlur(26)); cv.paste(sh, (0, 0), sh)
    scene(cv, form, color)
    d = ImageDraw.Draw(cv)
    if logo:
        lg = LOGO.resize((int(LOGO.width*150/LOGO.height), 150), Image.LANCZOS); cv.paste(lg, (70, 60))
    pf = font(POP_M, 40); pw = d.textlength(pill, font=pf)
    px1 = S - 70; px0 = px1 - pw - 72
    d.rounded_rectangle((px0, 80, px1, 80+84), 42, fill=color); d.text((px0+36, 80+16), pill, font=pf, fill=(255,255,255))
    size = 80
    tf = font(LORA, size, True); lines = wrap(d, title, tf, 1400)
    while len(lines) > 3 and size > 60:
        size -= 6; tf = font(LORA, size, True); lines = wrap(d, title, tf, 1400)
    y = 1190 - (0 if len(lines) > 2 else 20)
    for ln in lines:
        w = d.textlength(ln, font=tf); d.text(((S-w)/2, y), ln, font=tf, fill=darken(BRAND_B, .05)); y += int(size*1.16)
    sf = font(POP_R, 42); w = d.textlength(sub, font=sf); d.text(((S-w)/2, y+14), sub, font=sf, fill=(120,100,95))
    for x in range(S): d.line((x, S-24, x, S), fill=mix(BRAND_A, BRAND_B, x/S))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    cv.resize((OUT, OUT), Image.LANCZOS).save(path, "WEBP", quality=88, method=6)

if __name__ == "__main__":
    products = json.load(open(os.path.join(ROOT, "data", "products.json"), encoding="utf-8"))
    cats = json.load(open(os.path.join(ROOT, "data", "categories.json"), encoding="utf-8"))
    for i, p in enumerate(products):
        render(p["name"], p["healthCategory"], p["dosageForm"], hx(CAT_COLORS[p["healthCategory"]]), p["dosageForm"],
               os.path.join(ROOT, "images", "products", p["slug"] + ".webp"))
    for c in cats:
        if c["type"] == "health_category":
            render(c["name"], "ONPHARNO Health Category", "hex", hx(CAT_COLORS[c["name"]]), "Health Category",
                   os.path.join(ROOT, "images", "categories", c["slug"] + ".webp"))
        else:
            render(c["name"], "ONPHARNO Dosage Form", c["name"], hx("#D85430"), (c.get("badge") or "Dosage Form"),
                   os.path.join(ROOT, "images", "categories", c["slug"] + ".webp"))
    print("images:", len(products), "products +", len(cats), "category/form tiles")
