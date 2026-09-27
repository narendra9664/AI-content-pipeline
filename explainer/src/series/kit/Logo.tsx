import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {MessageCircle} from 'lucide-react';
import {BODY, CLAMP, Theme, alpha} from '../theme';
import {Words} from './Text';

// The FD monogram, rebuilt as strokes so it can draw itself. Geometry matches the
// supplied logo (viewBox 297x283): one stroke for the stem + D bowl, one for the F bar.
const D_STROKE = 'M 28 283 V 28.25 H 155 A 113.25 113.25 0 0 1 155 254.75 H 114';
const F_BAR = 'M 56 141.5 H 150';

let gradientSeq = 0;

export const FDMark: React.FC<{
  size: number;
  color: string;
  color2?: string;
  draw?: number; // 0..1 stroke progress
  bar?: number; // 0..1 F-bar progress (defaults to draw)
  glow?: number; // 0..1
}> = ({size, color, color2, draw = 1, bar, glow = 0}) => {
  const [gid] = React.useState(() => `fdg${++gradientSeq}`);
  const b = bar ?? draw;
  return (
    <svg
      width={size}
      height={(size * 283) / 297}
      viewBox="0 0 297 283"
      style={{overflow: 'visible', display: 'block', filter: glow > 0 ? `drop-shadow(0 0 ${size * 0.14 * glow}px ${alpha(color, 0.75)})` : undefined}}
    >
      <defs>
        {/* userSpaceOnUse: the F bar is a zero-height path, so a bbox gradient would not render */}
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="297" y2="283">
          <stop offset="0" stopColor={color} />
          <stop offset="1" stopColor={color2 ?? color} />
        </linearGradient>
      </defs>
      <path d={D_STROKE} fill="none" stroke={`url(#${gid})`} strokeWidth={56.5} strokeLinejoin="miter" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
      <path d={F_BAR} fill="none" stroke={`url(#${gid})`} strokeWidth={55} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - b} />
    </svg>
  );
};

export const Wordmark: React.FC<{theme: Theme; size: number; color?: string}> = ({theme, size, color}) => (
  <div style={{fontFamily: BODY, fontWeight: 700, fontSize: size, letterSpacing: '-0.035em', color: color ?? theme.text, whiteSpace: 'nowrap'}}>
    frontdesk <span style={{color: theme.accent}}>AI</span>
  </div>
);

// Mark + wordmark lock-up that animates in from `start` (local frame).
export const LogoLockup: React.FC<{theme: Theme; start?: number; mark: number; word: number; row?: boolean}> = ({
  theme, start = 0, mark, word, row,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const draw = interpolate(frame, [start, start + 22], [0, 1], {...CLAMP, easing: (t) => 1 - Math.pow(1 - t, 3)});
  const bar = interpolate(frame, [start + 14, start + 26], [0, 1], {...CLAMP, easing: (t) => 1 - Math.pow(1 - t, 3)});
  const w = spring({frame: frame - start - 16, fps, config: {damping: 200}});
  const glow = interpolate(frame, [start + 18, start + 30, start + 60], [0, 1, 0.45], CLAMP);
  return (
    <div style={{display: 'flex', flexDirection: row ? 'row' : 'column', alignItems: 'center', gap: row ? mark * 0.3 : mark * 0.22}}>
      <FDMark size={mark} color={theme.accent} color2={theme.accent2} draw={draw} bar={bar} glow={glow} />
      <div style={{opacity: w, transform: `translate${row ? 'X' : 'Y'}(${(1 - w) * (row ? -20 : 18)}px)`}}>
        <Wordmark theme={theme} size={word} />
      </div>
    </div>
  );
};

// Closing card: logo draws, headline lands, CTA pill types itself.
export const EndCard: React.FC<{
  theme: Theme;
  headline: string; // Words markup
  ctaAt: number; // local frame the CTA appears
  cta?: string;
  sub?: string;
  handle?: string;
  vertical?: boolean;
  headSize?: number;
  italicAccent?: boolean;
  icon?: React.ReactNode;
}> = ({theme, headline, ctaAt, cta = 'DM us "AUDIT"', sub = 'Free lead-flow audit', handle = '@frontdesk.ops', vertical = true, headSize, italicAccent, icon}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pill = spring({frame: frame - ctaAt, fps, config: {damping: 14, stiffness: 140}});
  const chars = Math.round(interpolate(frame, [ctaAt + 6, ctaAt + 6 + cta.length * 1.3], [0, cta.length], CLAMP));
  const subIn = spring({frame: frame - ctaAt - 18, fps, config: {damping: 200}});
  const sheen = interpolate((frame - ctaAt) % 75, [0, 40], [-60, 160], CLAMP);
  const hs = headSize ?? (vertical ? 104 : 92);
  const light = theme.mode === 'light';
  return (
    <div
      style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: vertical ? 64 : 44, paddingBottom: vertical ? 120 : 0,
      }}
    >
      <LogoLockup theme={theme} mark={vertical ? 150 : 104} word={vertical ? 52 : 40} row={!vertical} />
      <Words theme={theme} text={headline} size={hs} start={12} stagger={4} maxWidth={vertical ? 900 : 1500} italicAccent={italicAccent} />
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, minHeight: vertical ? 190 : 150}}>
        <div
          style={{
            position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'center', gap: 18,
            padding: vertical ? '26px 46px' : '22px 40px', borderRadius: 999,
            background: `linear-gradient(135deg, ${theme.accent}, ${light ? theme.accent : theme.accent2})`,
            color: theme.onAccent, fontFamily: BODY, fontWeight: 800, fontSize: vertical ? 50 : 42, letterSpacing: '-0.02em',
            boxShadow: `0 20px 60px ${alpha(theme.accent, 0.45)}`,
            opacity: Math.min(1, pill * 1.3), transform: `scale(${0.7 + pill * 0.3})`,
          }}
        >
          {icon ?? <MessageCircle size={vertical ? 46 : 38} strokeWidth={2.4} />}
          <span style={{whiteSpace: 'pre'}}>
            {cta.slice(0, chars)}
            <span style={{opacity: chars < cta.length ? 1 : 0}}>|</span>
          </span>
          <div
            style={{
              position: 'absolute', top: 0, bottom: 0, width: 120, left: `${sheen}%`,
              background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.35), rgba(255,255,255,0))',
              transform: 'skewX(-20deg)',
            }}
          />
        </div>
        <div
          style={{
            opacity: subIn, transform: `translateY(${(1 - subIn) * 14}px)`,
            fontFamily: BODY, fontWeight: 600, fontSize: vertical ? 32 : 28, color: theme.muted, letterSpacing: '0.01em', textAlign: 'center',
          }}
        >
          {sub}
          {handle ? (
            <>
              {' '}
              <span style={{opacity: 0.5, margin: '0 10px'}}>·</span> <span style={{color: theme.text}}>{handle}</span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
