# ChemBuddy logo options: writes SVGs and a preview page into _work/drafts/logo/.
# Colours match the app: primary #1a5f7a, dark #0d3d4d, teal #2a9d8f.
import math, os, sys

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
DARK, PRIMARY, TEAL, LIGHT = '#0d3d4d', '#1a5f7a', '#2a9d8f', '#bfe9e2'
FONT = "font-family=\"'Segoe UI', 'Helvetica Neue', Arial, sans-serif\""

# (flask paths kept for reference; not used)
FLASK = 'M41 18 H59 M44 18 V42 L23 76 Q19 85 29 85 H71 Q81 85 77 76 L56 42 V18'
LIQUID = 'M33.6 59 H66.4 L77 76 Q81 85 71 85 H29 Q19 85 23 76 Z'

def gear(cx, cy, r_out, r_in, teeth, hole):
    pts = []
    for i in range(teeth * 4):
        a = 2 * math.pi * i / (teeth * 4)
        r = r_out if (i % 4) in (1, 2) else r_in
        pts.append('%.2f %.2f' % (cx + r * math.cos(a), cy + r * math.sin(a)))
    ring = 'M' + ' L'.join(pts) + ' Z'
    # hole drawn as a counter-clockwise circle so fill-rule evenodd cuts it out
    h = 'M%.2f %.2f a%.2f %.2f 0 1 0 %.2f 0 a%.2f %.2f 0 1 0 %.2f 0 Z' % (cx - hole, cy, hole, hole, 2 * hole, hole, hole, -2 * hole)
    return ring + ' ' + h

def wordmark(x, y, size, anchor='start', light=False):
    a = DARK if not light else '#ffffff'
    b = TEAL if not light else LIGHT
    return ('<text x="%s" y="%s" %s font-size="%s" font-weight="700" text-anchor="%s" letter-spacing="0.5">'
            '<tspan fill="%s">Chem</tspan><tspan fill="%s">Buddy</tspan></text>') % (x, y, FONT, size, anchor, a, b)

def tagline(x, y, size, anchor='start', colour=PRIMARY):
    return ('<text x="%s" y="%s" %s font-size="%s" font-weight="600" text-anchor="%s" fill="%s" letter-spacing="2">'
            'YOUR VIRTUAL PLANT TOUR</text>') % (x, y, FONT, size, anchor, colour)

# ---- Option A: plant skyline on the teal tile (column, sphere, tank, pipe) ----
def icon_a(tx=0, ty=0, s=1.0, light=False):
    w = '#fff'
    return ('<g transform="translate(%s %s) scale(%s)">'
            '<defs><linearGradient id="ga" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient></defs>'
            '<rect x="0" y="0" width="100" height="100" rx="22" fill="url(#ga)"/>'
            # distillation column with top head and trays
            '<path d="M24 82 V26 Q24 17 31 17 Q38 17 38 26 V82 Z" fill="%s"/>'
            '<g stroke="%s" stroke-width="2" stroke-linecap="round"><line x1="27" y1="34" x2="35" y2="34"/><line x1="27" y1="44" x2="35" y2="44"/><line x1="27" y1="54" x2="35" y2="54"/><line x1="27" y1="64" x2="35" y2="64"/></g>'
            # pipe from column to sphere
            '<path d="M38 40 H52 V52" fill="none" stroke="%s" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>'
            # sphere on legs
            '<circle cx="56" cy="60" r="11" fill="%s"/>'
            '<g stroke="%s" stroke-width="3" stroke-linecap="round"><line x1="49" y1="67" x2="47" y2="82"/><line x1="63" y1="67" x2="65" y2="82"/></g>'
            # cone roof tank
            '<path d="M70 82 V62 L78.5 56 L87 62 V82 Z" fill="%s"/>'
            # ground line
            '<line x1="16" y1="83" x2="88" y2="83" stroke="%s" stroke-width="3.5" stroke-linecap="round"/>'
            '</g>') % (tx, ty, s, PRIMARY, TEAL, w, TEAL, w, w, w, w, LIGHT)

# ---- Option B: gate valve P&ID symbol with a handwheel, on a pipe ----
def icon_b(tx=0, ty=0, s=1.0, light=False):
    line = '#fff' if light else DARK
    spokes = ''.join('<line x1="50" y1="24" x2="%.1f" y2="%.1f"/>' % (50 + 13 * math.cos(a), 24 + 13 * math.sin(a))
                     for a in [i * math.pi / 2 + math.pi / 4 for i in range(4)])
    return ('<g transform="translate(%s %s) scale(%s)">'
            # pipe
            '<line x1="6" y1="72" x2="94" y2="72" stroke="%s" stroke-width="7" stroke-linecap="round"/>'
            # bow-tie valve body
            '<path d="M26 56 L50 72 L26 88 Z M74 56 L50 72 L74 88 Z" fill="%s" stroke="%s" stroke-width="4" stroke-linejoin="round"/>'
            # stem
            '<line x1="50" y1="37" x2="50" y2="72" stroke="%s" stroke-width="4.5" stroke-linecap="round"/>'
            # handwheel
            '<circle cx="50" cy="24" r="14" fill="none" stroke="%s" stroke-width="4.5"/>'
            '<g stroke="%s" stroke-width="3" stroke-linecap="round">%s</g>'
            '<circle cx="50" cy="24" r="3.5" fill="%s"/>'
            '</g>') % (tx, ty, s, line, TEAL, line, line, TEAL, TEAL, spokes, line)

# ---- Option C: pressure gauge, needle in the green (normal) zone ----
def icon_c(tx=0, ty=0, s=1.0, light=False):
    cx, cy, r = 50, 46, 36
    def pt(deg, rad):
        a = math.radians(deg)
        return cx + rad * math.cos(a), cy + rad * math.sin(a)
    def arc(d1, d2, rad):
        x1, y1 = pt(d1, rad); x2, y2 = pt(d2, rad)
        return 'M%.2f %.2f A%s %s 0 0 1 %.2f %.2f' % (x1, y1, rad, rad, x2, y2)
    ticks = ''.join('<line x1="%.2f" y1="%.2f" x2="%.2f" y2="%.2f"/>' % (pt(d, 27) + pt(d, 22)) for d in range(150, 391, 30))
    nx, ny = pt(-60, 22)   # needle points up and right, into the green zone
    return ('<g transform="translate(%s %s) scale(%s)">'
            # connection stub
            '<rect x="44" y="80" width="12" height="14" rx="2" fill="%s"/>'
            '<circle cx="%s" cy="%s" r="%s" fill="%s"/>'
            '<circle cx="%s" cy="%s" r="%s" fill="#fff"/>'
            # coloured zones: green normal, amber high
            '<path d="%s" fill="none" stroke="%s" stroke-width="5"/>'
            '<path d="%s" fill="none" stroke="#e9a23b" stroke-width="5"/>'
            '<g stroke="%s" stroke-width="2.2" stroke-linecap="round">%s</g>'
            '<line x1="%s" y1="%s" x2="%.2f" y2="%.2f" stroke="%s" stroke-width="4" stroke-linecap="round"/>'
            '<circle cx="%s" cy="%s" r="4.5" fill="%s"/>'
            '</g>') % (tx, ty, s, LIGHT if light else DARK, cx, cy, r, PRIMARY, cx, cy, r - 6,
                       arc(-110, -20, 17), TEAL, arc(-20, 30, 17), DARK, ticks,
                       cx, cy, nx, ny, DARK, cx, cy, DARK)

def svg(w, h, body, bg=None):
    b = '<rect width="100%%" height="100%%" fill="%s"/>' % bg if bg else ''
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d">%s%s</svg>' % (w, h, w, h, b, body)

files = {}
for key, icon in (('A', icon_a), ('B', icon_b), ('C', icon_c)):
    # horizontal lock-up: icon left, wordmark + tagline right
    files['option-%s-horizontal.svg' % key] = svg(560, 140, icon(20, 20, 1.0) + wordmark(140, 84, 56) + tagline(143, 114, 15))
    # stacked lock-up: icon above, wordmark below (for square spaces)
    files['option-%s-stacked.svg' % key] = svg(360, 262, icon(130, 24, 1.0) + wordmark(180, 200, 52, 'middle') + tagline(180, 232, 14, 'middle'))
    # icon alone (app icon, favicon, social)
    files['option-%s-icon.svg' % key] = svg(120, 120, icon(10, 10, 1.0))
    # horizontal on dark background (banner on a dark design)
    files['option-%s-on-dark.svg' % key] = svg(560, 140, icon(20, 20, 1.0, light=True) + wordmark(140, 84, 56, light=True) + tagline(143, 114, 15, colour=LIGHT), bg=DARK)

for name, content in files.items():
    open(os.path.join(OUT, name), 'w', encoding='utf-8').write(content)

cards = ''
for key, title in (('A', 'Option A — Plant skyline'), ('B', 'Option B — Valve and handwheel'), ('C', 'Option C — Pressure gauge')):
    cards += ('<section><h2>%s</h2><div class="row">'
              '<div class="box">%s</div><div class="box">%s</div><div class="box small">%s</div></div>'
              '<div class="row"><div class="box dark">%s</div></div></section>') % (
        title, files['option-%s-horizontal.svg' % key], files['option-%s-stacked.svg' % key],
        files['option-%s-icon.svg' % key], files['option-%s-on-dark.svg' % key])
page = ('<!DOCTYPE html><html><head><meta charset="utf-8"><title>ChemBuddy logo options</title><style>'
        'body{font-family:Segoe UI,Arial,sans-serif;background:#f3f6f8;margin:24px;color:#1f2d33}'
        'h1{margin:0 0 6px}section{background:#fff;border-radius:12px;padding:16px 20px;margin:18px 0;box-shadow:0 1px 4px rgba(0,0,0,.08)}'
        'h2{margin:0 0 10px;font-size:18px;color:#0d3d4d}.row{display:flex;gap:18px;align-items:center;flex-wrap:wrap;margin-bottom:10px}'
        '.box{border:1px dashed #ccd;border-radius:8px;padding:6px}.box.small svg{width:120px;height:120px}'
        '.box.dark{border-color:transparent;padding:0}</style></head><body>'
        '<h1>ChemBuddy — logo options</h1><p>Each option: horizontal, stacked, icon alone, and on a dark background.</p>'
        + cards + '</body></html>')
open(os.path.join(OUT, 'logo-options.html'), 'w', encoding='utf-8').write(page)
print('wrote', len(files), 'svgs')
