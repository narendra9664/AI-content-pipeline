# Tile QA stills into labelled contact sheets: python3 scripts/sheet.py out/qa/V1 4 405 [frames...]
import sys, os, glob
from PIL import Image, ImageDraw
d, cols, tw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
only = set(int(x) for x in sys.argv[4:])
files = sorted(f for f in glob.glob(os.path.join(d, 'f*.png')) if not only or int(os.path.basename(f)[1:5]) in only)
per = cols * 2
for s in range(0, len(files), per):
    chunk = files[s:s+per]
    ims = [Image.open(f).convert('RGB') for f in chunk]
    th = int(ims[0].height * tw / ims[0].width)
    rows = (len(ims) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * tw + (cols - 1) * 6, rows * th + (rows - 1) * 6), (255, 0, 255))
    for i, (im, f) in enumerate(zip(ims, chunk)):
        im = im.resize((tw, th), Image.LANCZOS)
        ImageDraw.Draw(im).text((8, 8), os.path.basename(f), fill=(255, 0, 255))
        sheet.paste(im, ((i % cols) * (tw + 6), (i // cols) * (th + 6)))
    out = os.path.join(d, f'sheet{s // per + 1:02d}.jpg')
    sheet.save(out, quality=88)
    print(out)
