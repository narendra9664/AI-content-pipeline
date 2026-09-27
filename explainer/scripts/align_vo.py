"""Speed up an ElevenLabs voiceover and force-align it to its script.

Produces public/series/vo/<id>.mp3 (tempo-adjusted) and src/series/vo/<id>.json with
per-word start/end times, so on-screen text and captions can be keyed to the exact
spoken word. Alignment uses pocketsphinx (offline, bundled en-US model).

usage: python3 scripts/align_vo.py <id> <tempo> "<script text>"
"""
import json
import os
import re
import subprocess
import sys

from pocketsphinx import Decoder

FFMPEG = os.environ.get("FFMPEG", "ffmpeg")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# How each display word is spoken, for words the dictionary doesn't know.
SPOKEN = {
    "frontdesk": ["front", "desk"],
    "ai": ["a", "i"],
    "dm": ["d", "m"],
    "pm": ["p", "m"],
    "am": ["a", "m"],
    "whatsapp": ["what's", "app"],
    "forty-eight": ["forty", "eight"],
    "follow-ups": ["follow", "ups"],
    "follow-up": ["follow", "up"],
    "agent's": ["agents"],
    "buyer's": ["buyers"],
}

# Pronunciations (CMU phones) for words missing from the bundled dictionary.
PRON = {
    "viewings": "V Y UW IH NG Z",
}


def tokens_for(word, dec):
    key = re.sub(r"[^a-z0-9'\-]", "", word.lower()).strip("'-")
    if key in SPOKEN:
        return SPOKEN[key]
    if key in PRON:
        if dec.lookup_word(key) is None:
            dec.add_word(key, PRON[key], True)
        return [key]
    parts = [p for p in key.split("-") if p]
    out = []
    for p in parts:
        if dec.lookup_word(p) is None:
            raise SystemExit(f"out-of-dictionary word: {p!r} (add it to SPOKEN or PRON)")
        out.append(p)
    return out


def main():
    vid, tempo, text = sys.argv[1], float(sys.argv[2]), sys.argv[3]
    raw = os.path.join(ROOT, "public/series/vo", f"{vid}-raw.mp3")
    out_mp3 = os.path.join(ROOT, "public/series/vo", f"{vid}.mp3")
    pcm = f"/tmp/{vid}.raw"
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", raw, "-af", f"atempo={tempo}",
                    "-ar", "44100", "-b:a", "192k", out_mp3], check=True)
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", out_mp3, "-ac", "1", "-ar", "16000",
                    "-f", "s16le", pcm], check=True)
    duration = os.path.getsize(pcm) / 2 / 16000

    dec = Decoder(samprate=16000, bestpath=False)
    words = text.split()
    spoken = [tokens_for(w, dec) for w in words]
    flat = [t for toks in spoken for t in toks]
    dec.set_align_text(" ".join(flat))
    dec.start_utt()
    with open(pcm, "rb") as f:
        dec.process_raw(f.read(), full_utt=True)
    dec.end_utt()
    segs = [s for s in dec.seg() if not s.word.startswith("<") and not s.word.startswith("[")]
    if len(segs) != len(flat):
        raise SystemExit(f"alignment mismatch: {len(segs)} segments for {len(flat)} tokens")

    out, k = [], 0
    for w, toks in zip(words, spoken):
        first, last = segs[k], segs[k + len(toks) - 1]
        k += len(toks)
        out.append({"w": w, "s": round(first.start_frame / 100, 2), "e": round((last.end_frame + 1) / 100, 2)})

    data = {"id": vid, "tempo": tempo, "duration": round(duration, 2), "text": text, "words": out}
    dest = os.path.join(ROOT, "src/series/vo", f"{vid}.json")
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, "w") as f:
        json.dump(data, f, indent=1)
    print(f"{vid}: {duration:.2f}s, {len(out)} words, last word ends {out[-1]['e']}s")


if __name__ == "__main__":
    main()
