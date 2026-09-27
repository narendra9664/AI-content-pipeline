import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, CLAMP, FONT, GRAD_BLUE, GRAD_GOLD, gradientText} from '../theme';

// Kinetic typography: words rise in one by one from a blur.
// Markup inside `text`: *blue accent*, _gold accent_, ~red accent~.
type Mode = 'n' | 'a' | 'g' | 'r';
type Tok = {w: string; mode: Mode};

const MARKS: Record<string, Mode> = {'*': 'a', _: 'g', '~': 'r'};

export const parseMarkup = (s: string): Tok[] => {
  const out: Tok[] = [];
  let mode: Mode = 'n';
  let cur = '';
  let curMode: Mode = 'n';
  const flush = () => {
    if (cur) out.push({w: cur, mode: curMode});
    cur = '';
  };
  for (const ch of s) {
    if (MARKS[ch]) {
      mode = mode === MARKS[ch] ? 'n' : MARKS[ch];
      continue;
    }
    if (ch === ' ') {
      flush();
      continue;
    }
    if (!cur) curMode = mode;
    cur += ch;
  }
  flush();
  return out;
};

const styleFor = (mode: Mode): React.CSSProperties => {
  if (mode === 'a') return gradientText(GRAD_BLUE);
  if (mode === 'g') return gradientText(GRAD_GOLD);
  if (mode === 'r') return {color: C.red};
  return {color: C.text};
};

export const Kinetic: React.FC<{
  text: string;
  size: number;
  start?: number;
  stagger?: number;
  weight?: number;
  align?: 'center' | 'left';
  exitAt?: number;
  maxWidth?: number;
  lineHeight?: number;
}> = ({text, size, start = 0, stagger = 3, weight = 700, align = 'center', exitAt, maxWidth, lineHeight = 1.12}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const toks = parseMarkup(text);
  const exit = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 12], [0, 1], CLAMP);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        columnGap: size * 0.26,
        rowGap: size * 0.06,
        maxWidth,
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        lineHeight,
        letterSpacing: '-0.02em',
      }}
    >
      {toks.map((t, i) => {
        const p = spring({
          frame: frame - (start + i * stagger),
          fps,
          config: {damping: 16, stiffness: 120, mass: 0.7},
        });
        const opacity = Math.min(1, p * 1.4) * (1 - exit);
        const y = (1 - p) * size * 0.45 - exit * size * 0.35;
        const blur = Math.max(0, (1 - p) * 10) + exit * 8;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity,
              transform: `translateY(${y}px)`,
              filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
              paddingBottom: size * 0.06,
              ...styleFor(t.mode),
            }}
          >
            {t.w}
          </span>
        );
      })}
    </div>
  );
};
