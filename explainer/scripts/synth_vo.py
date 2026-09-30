"""Generate word-level timing for a script with NO voiceover — for the no-VO social series.

Produces src/series/vo/<id>.json in the exact shape scripts/align_vo.py produces from real
audio ({id, duration, text, words: [{w, s, e}]}), so every existing component that reads
vo.ts's `at()`/`endOf()`/`sentences()` or renders Captions/SpokenHeadline works unchanged —
it just paces off an estimated reading rhythm instead of a forced-aligned voice track.

Checked against the real per-word timings in src/series/vo/*.json (forced-aligned from the
actual ElevenLabs voiceovers) — individual VO takes vary in delivery pace, so this isn't a
frame-exact reproduction of any one recording, but a readable, consistent on-screen pace in the
same neighbourhood (within ~10-15% of real V3/H3 durations at the default 170 wpm). Each word
gets a duration from its length (longer words take longer to read) and a pause is added after
clause- and sentence-ending punctuation — the same pause shape scripts/make_srt.py already
expects (>0.6s gap = a natural clause break) and that every XTag/Rise/Camera beat in the kit is
timed against. Tune --wpm per script if a cut needs to land faster or slower.

No audio file is produced or needed: a video built on synthetic timing must omit the `vo` prop
on <Soundtrack> (it's optional — music/SFX only), so nothing tries to load a non-existent mp3.

usage: python3 scripts/synth_vo.py <id> "<script text>" [--wpm 145]
"""
import argparse
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Seconds of pause added after a word ending in this punctuation, before the next word starts.
PAUSE = {'.': 0.42, '?': 0.42, '!': 0.42, ',': 0.18, ';': 0.3, ':': 0.3}
LEAD_IN = 0.15  # silence before the first word, matching the ~0.1-0.2s every real VO has


def word_seconds(word: str, base: float) -> float:
    """A longer or multi-syllable word takes more time to read than 'a' or 'the'."""
    letters = len(re.sub(r"[^a-zA-Z']", '', word))
    syllables = max(1, len(re.findall(r'[aeiouyAEIOUY]+', word)))
    return base * (0.55 + 0.09 * letters + 0.16 * syllables) / (0.55 + 0.09 * 5 + 0.16 * 2)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('vid')
    p.add_argument('text')
    p.add_argument('--wpm', type=float, default=170, help='baseline words/minute (default 170: readable on-screen pace for silent kinetic text)')
    args = p.parse_args()

    base = 60 / args.wpm  # seconds for an "average" word before length/pause adjustment
    words = args.text.split()
    if not words:
        raise SystemExit('empty script')

    out, t = [], LEAD_IN
    for w in words:
        dur = word_seconds(w, base)
        s, e = round(t, 2), round(t + dur, 2)
        out.append({'w': w, 's': s, 'e': e})
        t = e + PAUSE.get(w[-1], 0.06)

    duration = round(t - PAUSE.get(words[-1][-1], 0.06) + 0.3, 2)  # small tail, no trailing pause
    data = {'id': args.vid, 'duration': duration, 'text': args.text, 'words': out}
    dest = os.path.join(ROOT, 'src/series/vo', f'{args.vid}.json')
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, 'w') as f:
        json.dump(data, f, indent=1)
    print(f'{args.vid}: {duration}s, {len(out)} words (synthetic, {args.wpm} wpm base)')


if __name__ == '__main__':
    main()
