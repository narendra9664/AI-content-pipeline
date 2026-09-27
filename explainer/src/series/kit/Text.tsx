import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BODY, CLAMP, Theme} from '../theme';
import {Sentence, VOData, f, sentences} from '../vo';

// Covers render a video frame without its spoken text (headline/captions).
export const HideSpoken = React.createContext(false);

// Markup: *accent*  _accent2_  ~bad~  ^muted^
type Mode = 'n' | 'a' | 'b' | 'r' | 'm';
const MARKS: Record<string, Mode> = {'*': 'a', _: 'b', '~': 'r', '^': 'm'};

export const parse = (s: string) => {
  const out: {w: string; mode: Mode}[] = [];
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

export const colorFor = (t: Theme, mode: Mode) =>
  mode === 'a' ? t.accent : mode === 'b' ? t.accent2 : mode === 'r' ? t.bad : mode === 'm' ? t.muted : t.text;

type TextProps = {
  theme: Theme;
  text: string;
  size: number;
  start?: number;
  stagger?: number;
  display?: boolean;
  weight?: number;
  align?: 'center' | 'left';
  exitAt?: number;
  maxWidth?: number;
  lineHeight?: number;
  italicAccent?: boolean;
};

// Words rise in one by one from a blur (the "kinetic type" look).
export const Words: React.FC<TextProps> = ({
  theme, text, size, start = 0, stagger = 3, display = true, weight, align = 'center', exitAt, maxWidth, lineHeight = 1.08, italicAccent,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const toks = parse(text);
  const exit = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 10], [0, 1], CLAMP);
  return (
    <div
      style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : 'flex-start',
        columnGap: size * 0.24, rowGap: size * 0.04, maxWidth,
        fontFamily: display ? theme.display : BODY,
        fontWeight: weight ?? (display ? theme.displayWeight : 700),
        letterSpacing: display ? theme.displayTracking : '-0.02em',
        fontSize: size, lineHeight,
      }}
    >
      {toks.map((t, i) => {
        const p = spring({frame: frame - (start + i * stagger), fps, config: {damping: 16, stiffness: 120, mass: 0.7}});
        const blur = Math.max(0, (1 - p) * 10) + exit * 8;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              color: colorFor(theme, t.mode),
              fontStyle: italicAccent && t.mode !== 'n' ? 'italic' : undefined,
              opacity: Math.min(1, p * 1.4) * (1 - exit),
              transform: `translateY(${(1 - p) * size * 0.45 - exit * size * 0.3}px)`,
              filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
            }}
          >
            {t.w}
          </span>
        );
      })}
    </div>
  );
};

// VO-synced headline: shows the sentence being spoken, each word appearing on its real
// start time. Doubles as captions for muted autoplay.
export const SpokenHeadline: React.FC<{
  theme: Theme;
  vo: VOData;
  size: number;
  emph?: string[];
  emph2?: string[];
  y: number;
  width: number;
  hideAfter?: number;
  display?: boolean;
  italicAccent?: boolean;
  skip?: number[];
  splitComma?: boolean;
}> = ({theme, vo, size, emph = [], emph2 = [], y, width, hideAfter, display = true, italicAccent, skip = [], splitComma}) => {
  const frame = useCurrentFrame();
  const {fps, width: W} = useVideoConfig();
  const hidden = React.useContext(HideSpoken);
  const list = sentences(vo, splitComma);
  const idx = list.findIndex((s, i) => {
    const next = list[i + 1];
    return frame >= f(s.s) - 3 && (!next || frame < f(next.s) - 3);
  });
  if (hidden || idx < 0 || skip.includes(idx) || (hideAfter !== undefined && frame >= hideAfter)) return null;
  const s: Sentence = list[idx];
  const next = list[idx + 1];
  const exitStart = next ? f(next.s) - 7 : Infinity;
  const exit = interpolate(frame, [exitStart, exitStart + 4], [0, 1], CLAMP);
  const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9']/g, '');
  const e1 = new Set(emph.map(norm));
  const e2 = new Set(emph2.map(norm));
  return (
    <div
      style={{
        position: 'absolute', top: y, left: (W - width) / 2, width,
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: size * 0.24, rowGap: size * 0.02,
        fontFamily: display ? theme.display : BODY,
        fontWeight: display ? theme.displayWeight : 700,
        letterSpacing: display ? theme.displayTracking : '-0.02em',
        fontSize: size, lineHeight: 1.08,
        opacity: 1 - exit, transform: `translateY(${-exit * 20}px)`,
      }}
    >
      {vo.words.slice(s.i0, s.i1 + 1).map((w, k) => {
        const p = spring({frame: frame - (f(w.s) - 2), fps, config: {damping: 18, stiffness: 160, mass: 0.6}});
        const key = norm(w.w);
        const color = e1.has(key) ? theme.accent : e2.has(key) ? theme.accent2 : theme.text;
        return (
          <span
            key={k}
            style={{
              display: 'inline-block', color,
              fontStyle: italicAccent && (e1.has(key) || e2.has(key)) ? 'italic' : undefined,
              opacity: Math.min(1, p * 1.5),
              transform: `translateY(${(1 - p) * size * 0.35}px)`,
              filter: p < 0.97 ? `blur(${(1 - p) * 8}px)` : undefined,
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

// Bottom captions for horizontal VO videos (LinkedIn autoplays muted).
export const Captions: React.FC<{theme: Theme; vo: VOData; y: number; size?: number; maxWords?: number; hideAfter?: number}> = ({
  theme, vo, y, size = 40, maxWords = 6, hideAfter,
}) => {
  const frame = useCurrentFrame();
  const hidden = React.useContext(HideSpoken);
  const chunks: {i0: number; i1: number}[] = [];
  let i0 = 0;
  vo.words.forEach((w, i) => {
    const endSentence = /[.?!,]$/.test(w.w);
    if (i - i0 + 1 >= maxWords || endSentence || i === vo.words.length - 1) {
      chunks.push({i0, i1: i});
      i0 = i + 1;
    }
  });
  const t = frame / 30;
  const cur = chunks.find((c, k) => {
    const next = chunks[k + 1];
    return t >= vo.words[c.i0].s - 0.05 && (!next || t < vo.words[next.i0].s - 0.05) && t <= vo.words[c.i1].e + 0.6;
  });
  if (hidden || !cur || (hideAfter !== undefined && frame >= hideAfter)) return null;
  const light = theme.mode === 'light';
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          padding: '12px 26px', borderRadius: 16,
          background: light ? 'rgba(255,255,255,0.86)' : 'rgba(0,0,0,0.55)',
          border: `1px solid ${theme.line}`,
          fontFamily: BODY, fontWeight: 700, fontSize: size, letterSpacing: '-0.01em',
          display: 'flex', gap: size * 0.28,
        }}
      >
        {vo.words.slice(cur.i0, cur.i1 + 1).map((w, k) => {
          const active = t >= w.s - 0.03;
          return (
            <span key={k} style={{color: active ? theme.text : theme.muted, opacity: active ? 1 : 0.55}}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const Label: React.FC<{theme: Theme; children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties}> = ({
  theme, children, color, size = 20, style,
}) => (
  <div
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 10, padding: `${size * 0.45}px ${size * 0.9}px`,
      borderRadius: 999, border: `1px solid ${color ?? theme.accent}66`, background: `${color ?? theme.accent}14`,
      fontFamily: BODY, fontWeight: 700, fontSize: size, letterSpacing: '0.16em', color: color ?? theme.accent,
      textTransform: 'uppercase', ...style,
    }}
  >
    {children}
  </div>
);
