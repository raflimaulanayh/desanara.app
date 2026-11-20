"""Build clean Desanara brand SVGs from the designer's Illustrator exports (writes docs/brand/desanara/).

Run (needs Python 3.11+; the font is the OFL Montserrat variable font from github.com/google/fonts):
    python3 -m venv /tmp/brand && /tmp/brand/bin/pip install fonttools uharfbuzz
    mkdir -p /tmp/brand/fonts && curl -sSLo /tmp/brand/fonts/Montserrat.ttf \
      'https://github.com/google/fonts/raw/main/ofl/montserrat/Montserrat%5Bwght%5D.ttf'
    /tmp/brand/bin/fonttools varLib.instancer /tmp/brand/fonts/Montserrat.ttf wght=700 -o /tmp/brand/fonts/Montserrat-Bold.ttf
    /tmp/brand/bin/fonttools varLib.instancer /tmp/brand/fonts/Montserrat.ttf wght=600 -o /tmp/brand/fonts/Montserrat-SemiBold.ttf
    FONTS=/tmp/brand/fonts /tmp/brand/bin/python docs/brand/build-logo.py docs/brand/desanara
Then copy the served files (see docs/brand/README.md) and drop app-icon-square.svg after rendering apple-icon.png.

- Text (Montserrat Bold/SemiBold) is converted to outlines with HarfBuzz shaping (kerning on),
  reproducing Illustrator's per-tspan x positions and letter-spacing.
- Duplicate layers are dropped, the A4 canvas is cropped to the artwork, ids are stable for motion.
"""
import os
import sys
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.svgLib.path import parse_path
from fontTools.ttLib import TTFont

HERE = Path(__file__).parent
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / 'out'
OUT.mkdir(parents=True, exist_ok=True)

GRAD_TOP, GRAD_BOTTOM = '#9dd950', '#387b4c'
WORD = '#6cac4e'

# Mark geometry in the horizontal file's coordinates (Desantara Svg-01.svg).
TALL = 'm330.23,231.64s-12.77,24.51-8.43,78.13-78.89,53.87-78.89,53.87c0,0,50.04-25.79,46.98-62.04s-5.11-62.81,40.34-69.96Z'
TALL_SHADE = [
    ('.3', 'm322.74,301.62s1.36,56.97-85.45,62.02l1.02,8.45,102.13-.68-17.7-69.79Z'),
    ('.1', 'm281.78,294.4s30.52,39.01-49.38,73.79c-79.89,34.78,2.6-4.34,2.6-4.34l18.83-13.19,15.35-21.48,12.59-34.79Z'),
]
SMALL = 'm284.02,302.87s-20.17-22.72-45.96-1.02c-25.79,21.7-18.13,46.47-18.13,46.47,0,0,15.57-4.54,28.6-27.93,0,0-2.04,28.44-17.62,38.65,0,0,17.62-1.53,23.23-17.36,5.62-15.83,16.6-37.28,29.87-38.81Z'
SMALL_SHADE = [
    ('.1', 'm284.95,303.49s-21.45-8.25-38.47,22.26c0,0,16.85-26.51,38.47-22.26Z'),
    ('.3', 'm226.25,359.56c3.73-.12,7.45-1.16,10.83-2.69s6.5-3.65,9.18-6.23c3.43-3.3,6.89-6.77,8.65-11.15s5.46-8.34,8.81-11.21c1.68-1.44,3.8-1.24,5.65-2.46.38-.25,1.88-.84,2.07-1.26,0,0-6.34,13.58-6.34,13.58l-23.19,20.9-15.67.52Z'),
    ('.1', 'm229.63,306.64s-14.81,30.64-7.91,44.94l-17.36-14.3,25.28-30.64Z'),
]

# Text layout (horizontal file). The vertical file moves the mark and the text; offsets below.
WORD_ORIGIN = (345.74, 322.76)
TAG_ORIGIN = (350.1, 341.39)
TAG_SPANS = [  # (x, text, letter-spacing em) straight from the Illustrator export
    (0, 'R', .12), (11.76, 'agam ', .12), (65.04, 'K', .1), (76.62, 'a', .12), (86.71, 'ry', .1),
    (103.5, 'a, ', .12), (124.14, 'C', .1), (135.43, 'e', .12), (145.75, 'r', .11), (153.11, 'it', .1),
    (165.81, 'a Nusan', .12), (235.54, 't', .1), (242.83, 'a', .12), (252.92, 'r', .08), (259.93, 'a', .12),
]
WORD_SIZE, TAG_SIZE = 46.32, 13.9
LETTER_IDS = ['letter-d', 'letter-e', 'letter-s', 'letter-a1', 'letter-n', 'letter-a2', 'letter-r', 'letter-a3']


def bounds(d):
    pen = BoundsPen(None)
    parse_path(d, pen)
    return pen.bounds


class Face:
    def __init__(self, path):
        self.data = Path(path).read_bytes()
        self.tt = TTFont(path)
        self.glyphs = self.tt.getGlyphSet()
        self.upem = self.tt['head'].unitsPerEm
        self.font = hb.Font(hb.Face(self.data))

    def run(self, text, size, x, y, spacing_em=0.0):
        """Shape one run; returns [(char, svg path d)] in user space, baseline at y."""
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        hb.shape(self.font, buf, {'kern': True, 'liga': False})
        scale = size / self.upem
        order = self.tt.getGlyphOrder()
        pen_x, out = x, []
        for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
            name = order[info.codepoint]
            ch = text[info.cluster]
            if ch != ' ':
                svg = SVGPathPen(self.glyphs, ntos=lambda v: f'{v:.2f}'.rstrip('0').rstrip('.'))
                tp = TransformPen(svg, (scale, 0, 0, -scale, pen_x + pos.x_offset * scale, y))
                self.glyphs[name].draw(tp)
                out.append((ch, svg.getCommands()))
            pen_x += pos.x_advance * scale + spacing_em * size
        return out


FONTS = Path(os.environ.get('FONTS', HERE / 'fonts'))
bold = Face(FONTS / 'Montserrat-Bold.ttf')
semi = Face(FONTS / 'Montserrat-SemiBold.ttf')


def translate_d(d, dx, dy):
    """Paths start with an absolute-by-position 'm' and use only relative commands after it."""
    i = 1
    j = i
    while d[j] not in 'scl':
        j += 1
    x, y = (float(v) for v in d[i:j].split(','))
    return f'm{x + dx:.2f},{y + dy:.2f}{d[j:]}'


def wordmark_paths(dx=0, dy=0):
    letters = bold.run('DESANARA', WORD_SIZE, WORD_ORIGIN[0] + dx, WORD_ORIGIN[1] + dy)
    return [(LETTER_IDS[i], d) for i, (_, d) in enumerate(letters)]


def tagline_path(dx=0, dy=0):
    parts = []
    for x, text, ls in TAG_SPANS:
        parts += [d for _, d in semi.run(text, TAG_SIZE, TAG_ORIGIN[0] + x + dx, TAG_ORIGIN[1] + dy, ls)]
    return ''.join(parts)


def mark_svg(tone, dx=0, dy=0, prefix='dsn'):
    """tone: 'color' | flat colour hex."""
    tall, small = translate_d(TALL, dx, dy), translate_d(SMALL, dx, dy)
    if tone != 'color':
        return f'<g id="mark" fill="{tone}"><path id="leaf-tall" d="{tall}"/><path id="leaf-small" d="{small}"/></g>', ''
    b1, b2 = bounds(tall), bounds(small)
    defs = (
        f'<linearGradient id="{prefix}-g1" x1="0" y1="{b1[1]:.2f}" x2="0" y2="{b1[3]:.2f}" gradientUnits="userSpaceOnUse">'
        f'<stop offset="0" stop-color="{GRAD_TOP}"/><stop offset="1" stop-color="{GRAD_BOTTOM}"/></linearGradient>'
        f'<linearGradient id="{prefix}-g2" x1="0" y1="{b2[1]:.2f}" x2="0" y2="{b2[3]:.2f}" gradientUnits="userSpaceOnUse">'
        f'<stop offset="0" stop-color="{GRAD_TOP}"/><stop offset="1" stop-color="{GRAD_BOTTOM}"/></linearGradient>'
        f'<clipPath id="{prefix}-c1"><path d="{tall}"/></clipPath>'
        f'<clipPath id="{prefix}-c2"><path d="{small}"/></clipPath>'
    )
    shade = lambda items: ''.join(f'<path opacity="{o}" d="{translate_d(d, dx, dy)}"/>' for o, d in items)
    body = (
        f'<g id="mark">'
        f'<path id="leaf-tall" fill="url(#{prefix}-g1)" d="{tall}"/>'
        f'<g clip-path="url(#{prefix}-c1)">{shade(TALL_SHADE)}</g>'
        f'<path id="leaf-small" fill="url(#{prefix}-g2)" d="{small}"/>'
        f'<g clip-path="url(#{prefix}-c2)">{shade(SMALL_SHADE)}</g>'
        f'</g>'
    )
    return body, defs


def doc(view, body, defs='', label='Desanara'):
    x, y, w, h = view
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x:.2f} {y:.2f} {w:.2f} {h:.2f}" role="img" aria-label="{label}">'
        f'<title>{label}</title>'
        + (f'<defs>{defs}</defs>' if defs else '')
        + body
        + '</svg>\n'
    )


def union(*bs):
    return (min(b[0] for b in bs), min(b[1] for b in bs), max(b[2] for b in bs), max(b[3] for b in bs))


def view_of(b, pad):
    return (b[0] - pad, b[1] - pad, b[2] - b[0] + 2 * pad, b[3] - b[1] + 2 * pad)


TONES = {'': None, '-white': '#ffffff', '-black': '#1c1917'}
MARK_B = union(bounds(TALL), bounds(SMALL))
PAD = 1  # keeps anti-aliasing inside the box; clear space is the layout's job


def text_bounds(paths):
    return union(*(bounds(d) for d in paths))


def write(name, svg):
    (OUT / name).write_text(svg)


# Vertical layout: from Desantara Svg-02.svg, text translate (282.31 373.53) and mark moved.
V_TEXT_DX, V_TEXT_DY = 282.31 - WORD_ORIGIN[0], 373.53 - WORD_ORIGIN[1]
V_MARK_DX, V_MARK_DY = 477.72 - 330.23, 196.82 - 231.64

# Horizontal without tagline: the wordmark is centred on the mark's height.
word0 = wordmark_paths()
wb = text_bounds([d for _, d in word0])
H_WORD_DY = ((MARK_B[1] + MARK_B[3]) / 2) - ((wb[1] + wb[3]) / 2)

for suffix, flat in TONES.items():
    tone = flat or 'color'
    ink = flat or WORD
    pre = 'dsn' + suffix.replace('-', '')

    # mark
    body, defs = mark_svg(tone, prefix=pre)
    write(f'mark{suffix}.svg', doc(view_of(MARK_B, PAD), body, defs))

    # horizontal, no tagline
    words = wordmark_paths(0, H_WORD_DY)
    body, defs = mark_svg(tone, prefix=pre)
    letters = ''.join(f'<path id="{i}" d="{d}"/>' for i, d in words)
    b = union(MARK_B, text_bounds([d for _, d in words]))
    write(f'logo-horizontal{suffix}.svg', doc(view_of(b, PAD), body + f'<g id="wordmark" fill="{ink}">{letters}</g>', defs))

    # horizontal with tagline (designer layout)
    words = wordmark_paths()
    tag = tagline_path()
    letters = ''.join(f'<path id="{i}" d="{d}"/>' for i, d in words)
    b = union(MARK_B, text_bounds([d for _, d in words] + [tag]))
    write(
        f'logo-tagline{suffix}.svg',
        doc(view_of(b, PAD), body + f'<g id="wordmark" fill="{ink}">{letters}</g><path id="tagline" fill="{ink}" d="{tag}"/>', defs),
    )

    # vertical with tagline (designer layout)
    body, defs = mark_svg(tone, V_MARK_DX, V_MARK_DY, prefix=pre)
    words = wordmark_paths(V_TEXT_DX, V_TEXT_DY)
    tag = tagline_path(V_TEXT_DX, V_TEXT_DY)
    letters = ''.join(f'<path id="{i}" d="{d}"/>' for i, d in words)
    mb = union(bounds(translate_d(TALL, V_MARK_DX, V_MARK_DY)), bounds(translate_d(SMALL, V_MARK_DX, V_MARK_DY)))
    b = union(mb, text_bounds([d for _, d in words] + [tag]))
    write(
        f'logo-vertical{suffix}.svg',
        doc(view_of(b, PAD), body + f'<g id="wordmark" fill="{ink}">{letters}</g><path id="tagline" fill="{ink}" d="{tag}"/>', defs),
    )


# App icon: white mark on the logo gradient, rounded square (favicon) and full bleed (Apple, PWA).
def app_icon(rounded, pad_ratio=0.2):
    w, h = MARK_B[2] - MARK_B[0], MARK_B[3] - MARK_B[1]
    side = max(w, h) / (1 - 2 * pad_ratio)
    cx, cy = (MARK_B[0] + MARK_B[2]) / 2, (MARK_B[1] + MARK_B[3]) / 2
    x0, y0 = cx - side / 2, cy - side / 2
    rx = side * 0.22 if rounded else 0
    body, _ = mark_svg('#ffffff')
    defs = (
        f'<linearGradient id="dsn-bg" x1="0" y1="{y0:.2f}" x2="0" y2="{y0 + side:.2f}" gradientUnits="userSpaceOnUse">'
        f'<stop offset="0" stop-color="{GRAD_TOP}"/><stop offset="1" stop-color="{GRAD_BOTTOM}"/></linearGradient>'
    )
    rect = f'<rect id="background" x="{x0:.2f}" y="{y0:.2f}" width="{side:.2f}" height="{side:.2f}" rx="{rx:.2f}" fill="url(#dsn-bg)"/>'
    return doc((x0, y0, side, side), rect + body, defs)


write('app-icon.svg', app_icon(True))
write('app-icon-square.svg', app_icon(False))
print('mark bounds', MARK_B, 'word dy', round(H_WORD_DY, 2))
for f in sorted(OUT.glob('*.svg')):
    print(f.name, f.stat().st_size)
