import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {MessageCircle, Rewind} from 'lucide-react';
import {BODY, CLAMP, Theme, alpha} from '../theme';

// Building blocks for the silent Instagram series (IG01–IG10).

// Rubber stamp that slams in, slightly rotated ("TOO LATE", "BOOKED ELSEWHERE").
export const Stamp: React.FC<{theme: Theme; at: number; text: string; color?: string; size?: number; rotate?: number; exitAt?: number}> = ({
  theme, at, text, color, size = 58, rotate = -8, exitAt,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const p = spring({frame: frame - at, fps, config: {damping: 11, stiffness: 170}});
  const out = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 8], [0, 1], CLAMP);
  const c = color ?? theme.bad;
  return (
    <div
      style={{
        display: 'inline-block', padding: `${size * 0.22}px ${size * 0.55}px`, border: `${size * 0.1}px solid ${c}`, borderRadius: size * 0.3,
        color: c, fontFamily: BODY, fontWeight: 800, fontSize: size, letterSpacing: '0.06em', whiteSpace: 'nowrap',
        background: theme.mode === 'dark' ? alpha('#000000', 0.45) : alpha('#FFFFFF', 0.82),
        opacity: Math.min(1, p * 2) * (1 - out), transform: `rotate(${rotate}deg) scale(${1.45 - 0.45 * p})`,
        boxShadow: `0 ${size * 0.3}px ${size}px ${alpha(c, 0.25)}`,
      }}
    >
      {text}
    </div>
  );
};

// "Comment A, B or C" prompt: a comment field whose text types itself.
export const CommentPrompt: React.FC<{theme: Theme; at: number; text: string; exitAt?: number; size?: number; width?: number}> = ({
  theme, at, text, exitAt, size = 40, width = 760,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at - 1) return null;
  const p = spring({frame: frame - at, fps, config: {damping: 15, stiffness: 140}});
  const out = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 10], [0, 1], CLAMP);
  const chars = Math.round(interpolate(frame, [at + 6, at + 6 + text.length * 1.1], [0, text.length], CLAMP));
  const caret = Math.floor(frame / 8) % 2 === 0;
  const light = theme.mode === 'light';
  return (
    <div
      style={{
        width, display: 'flex', alignItems: 'center', gap: size * 0.5, padding: `${size * 0.5}px ${size * 0.7}px`, borderRadius: 999,
        background: light ? '#FFFFFF' : alpha('#FFFFFF', 0.08), border: `2px solid ${alpha(theme.accent, 0.55)}`,
        boxShadow: `0 ${size * 0.5}px ${size * 1.6}px ${alpha(theme.accent, light ? 0.18 : 0.3)}`,
        fontFamily: BODY, fontWeight: 700, fontSize: size, color: theme.text,
        opacity: Math.min(1, p * 1.4) * (1 - out), transform: `translateY(${(1 - p) * 50 - out * 20}px) scale(${0.9 + 0.1 * p})`,
      }}
    >
      <div style={{width: size * 1.5, height: size * 1.5, borderRadius: 99, background: theme.accent, color: theme.onAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
        <MessageCircle size={size * 0.85} strokeWidth={2.6} />
      </div>
      <span style={{whiteSpace: 'pre'}}>
        {text.slice(0, chars)}
        <span style={{color: theme.accent, opacity: caret ? 1 : 0}}>|</span>
      </span>
    </div>
  );
};

// Circular progress (0..1) with optional content in the middle.
export const Ring: React.FC<{size: number; stroke: number; p: number; color: string; track: string; glow?: number; children?: React.ReactNode; start?: number}> = ({
  size, stroke, p, color, track, glow = 0.7, children, start = -90,
}) => {
  const r = size / 2 - stroke / 2 - 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{position: 'relative', width: size, height: size, flexShrink: 0}}>
      <svg width={size} height={size} style={{transform: `rotate(${start}deg)`, overflow: 'visible'}}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`} strokeDashoffset={circ * (1 - Math.max(0, Math.min(1, p)))}
          style={{filter: glow > 0 && p > 0 ? `drop-shadow(0 0 ${stroke * 0.8}px ${alpha(color, glow)})` : undefined}}
        />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
    </div>
  );
};

// Tape-rewind sweep with a label pill ("REWIND · DAY 6").
export const RewindFx: React.FC<{theme: Theme; at: number; label: string; y?: number; dur?: number}> = ({theme, at, label, y = 900, dur = 26}) => {
  const frame = useCurrentFrame();
  const {height} = useVideoConfig();
  const p = interpolate(frame, [at, at + 5, at + dur - 8, at + dur], [0, 1, 1, 0], CLAMP);
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: p, pointerEvents: 'none', zIndex: 50}}>
      <div style={{position: 'absolute', inset: 0, background: alpha(theme.accent, 0.1)}} />
      {Array.from({length: 14}).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: 0, right: 0, top: (i * 151 + frame * 41) % height, height: 3 + (i % 3) * 2, background: alpha(theme.accent, 0.3)}} />
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: '16px 34px', borderRadius: 999, background: theme.accent, color: theme.onAccent,
            fontFamily: BODY, fontWeight: 800, fontSize: 46, letterSpacing: '0.06em', boxShadow: `0 20px 60px ${alpha(theme.accent, 0.45)}`,
          }}
        >
          <Rewind size={46} fill={theme.onAccent} /> {label}
        </div>
      </div>
    </div>
  );
};

// Fades its children out over 10 frames from `at` (and unmounts after).
export const FadeOut: React.FC<{at: number; children: React.ReactNode; dy?: number}> = ({at, children, dy = 0}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 10], [1, 0], CLAMP);
  if (o <= 0) return null;
  return <div style={{position: 'absolute', inset: 0, opacity: o, transform: `translateY(${(1 - o) * dy}px)`}}>{children}</div>;
};

// Small "SAMPLE DATA" style tag, so illustrative numbers never read as claims.
export const DemoTag: React.FC<{theme: Theme; text?: string; at?: number}> = ({theme, text = 'Illustrative example', at = 0}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 12], [0, 1], CLAMP);
  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderRadius: 999, opacity: o * 0.9,
        border: `1px solid ${theme.line}`, background: theme.mode === 'dark' ? alpha('#FFFFFF', 0.05) : alpha('#FFFFFF', 0.7),
        fontFamily: BODY, fontWeight: 600, fontSize: 20, letterSpacing: '0.12em', textTransform: 'uppercase', color: theme.muted,
      }}
    >
      <div style={{width: 8, height: 8, borderRadius: 8, background: theme.muted}} />
      {text}
    </div>
  );
};

// A row in a vertical log/feed: icon tile, title and sub, optional right-hand meta.
export const LogRow: React.FC<{
  theme: Theme;
  at: number;
  icon: React.ReactNode;
  title: React.ReactNode;
  sub?: React.ReactNode;
  meta?: React.ReactNode;
  color?: string;
  width: number;
  size?: number;
  active?: number; // 0..1 highlight
  dim?: number;
}> = ({theme, at, icon, title, sub, meta, color, width, size = 30, active = 0, dim = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at - 1) return null;
  const p = spring({frame: frame - at, fps, config: {damping: 16, stiffness: 150}});
  const c = color ?? theme.accent;
  return (
    <div
      style={{
        width, display: 'flex', alignItems: 'center', gap: size * 0.6, padding: `${size * 0.42}px ${size * 0.6}px`, borderRadius: size * 0.8,
        background: active > 0 ? `linear-gradient(90deg, ${alpha(c, 0.14 * active)}, ${theme.surface})` : theme.surface,
        border: `1px solid ${active > 0 ? alpha(c, 0.3 + 0.5 * active) : theme.line}`,
        boxShadow: `0 ${size * 0.4}px ${size * 1.2}px rgba(0,0,0,${theme.mode === 'dark' ? 0.3 : 0.07})`,
        fontFamily: BODY, opacity: Math.min(1, p * 1.4) * (1 - dim * 0.55), transform: `translateX(${(1 - p) * 70}px)`,
      }}
    >
      <div style={{width: size * 1.75, height: size * 1.75, borderRadius: size * 0.5, background: alpha(c, 0.16), color: c, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
        {icon}
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontWeight: 800, fontSize: size, color: theme.text, letterSpacing: '-0.02em', whiteSpace: 'nowrap'}}>{title}</div>
        {sub ? <div style={{fontWeight: 500, fontSize: size * 0.74, color: theme.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{sub}</div> : null}
      </div>
      {meta ? <div style={{fontWeight: 800, fontSize: size * 0.9, color: c, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>{meta}</div> : null}
    </div>
  );
};
