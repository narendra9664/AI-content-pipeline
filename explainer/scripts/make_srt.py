"""Write .srt subtitle files for the series from the aligned voiceover timings.

Each video's voiceover starts at frame 0, so word times map straight to video time.
Cues are single lines of at most 42 characters, broken at punctuation where possible.

usage: python3 scripts/make_srt.py            # writes out/series/captions/<ID>.srt
"""
import glob
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "out", "series", "captions")
MAX = 42


def ts(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def cues(words):
    """Group words into caption lines. Break at clause ends (, . ? !) and at pauses; join a
    short lead-in clause with the next one; split an over-long clause into balanced lines."""
    text = lambda ws: " ".join(x["w"] for x in ws)
    clauses, cur = [], []
    for w in words:
        if cur and w["s"] - cur[-1]["e"] > 0.6:
            clauses.append(cur)
            cur = []
        cur.append(w)
        if w["w"].rstrip("\"'”’")[-1:] in tuple(".?!,"):
            clauses.append(cur)
            cur = []
    if cur:
        clauses.append(cur)

    merged = []
    for c in clauses:
        prev = merged[-1] if merged else None
        if prev and prev[-1]["w"].rstrip("\"'”’")[-1:] == "," and len(text(prev)) < 18 and len(text(prev + c)) <= MAX + 8:
            merged[-1] = prev + c
        else:
            merged.append(c)

    out = []
    for c in merged:
        n = len(text(c))
        if n <= MAX + 8:
            out.append(c)
            continue
        parts = -(-n // MAX)
        target = n / parts
        line = []
        for w in c:
            if line and len(text(line + [w])) > target + 3:
                out.append(line)
                line = []
            line.append(w)
        out.append(line)
    return out


def main():
    os.makedirs(OUT, exist_ok=True)
    for path in sorted(glob.glob(os.path.join(ROOT, "src", "series", "vo", "*.json"))):
        vo = json.load(open(path))
        groups = cues(vo["words"])
        lines = []
        for k, g in enumerate(groups):
            start = g[0]["s"]
            end = g[-1]["e"] + 0.25
            if k + 1 < len(groups):
                end = min(end, groups[k + 1][0]["s"] - 0.04)
            lines.append(f"{k + 1}\n{ts(start)} --> {ts(end)}\n{' '.join(x['w'] for x in g)}\n")
        dst = os.path.join(OUT, f"{vo['id'].upper()}.srt")
        with open(dst, "w") as f:
            f.write("\n".join(lines))
        print(f"{os.path.basename(dst)}: {len(groups)} cues")


if __name__ == "__main__":
    main()
