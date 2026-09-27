import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BODY, CLAMP, Theme, alpha} from '../theme';

// Spring entrance (and optional exit) for any block.
export const Rise: React.FC<{
  at: number;
  exitAt?: number;
  dy?: number;
  dx?: number;
  scale?: number;
  blur?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  damping?: number;
}> = ({at, exitAt, dy = 60, dx = 0, scale = 0.94, blur = true, children, style, damping = 16}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping, stiffness: 120, mass: 0.8}});
  const out = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 10], [0, 1], CLAMP);
  if (frame < at - 1 || out >= 1) return null;
  const b = blur ? (1 - Math.min(1, p)) * 12 + out * 10 : 0;
  return (
    <div
      style={{
        opacity: Math.min(1, p * 1.4) * (1 - out),
        transform: `translate(${(1 - p) * dx}px, ${(1 - p) * dy - out * 30}px) scale(${scale + (1 - scale) * p})`,
        filter: b > 0.3 ? `blur(${b}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Absolutely-positioned wrapper (keeps compositions readable).
export const At: React.FC<{x: number; y: number; w?: number; center?: boolean; children: React.ReactNode; z?: number}> = ({x, y, w, center, children, z}) => (
  <div
    style={{
      position: 'absolute', left: center ? x - (w ?? 0) / 2 : x, top: y, width: w, zIndex: z,
      display: center ? 'flex' : undefined, justifyContent: center ? 'center' : undefined,
    }}
  >
    {children}
  </div>
);

// Big readable event chip ("Opened Penthouse 42A ×4").
export const Chip: React.FC<{
  theme: Theme;
  icon: React.ReactNode;
  text: React.ReactNode;
  meta?: React.ReactNode;
  size?: number;
  color?: string;
  solid?: boolean;
}> = ({theme, icon, text, meta, size = 34, color, solid}) => {
  const c = color ?? theme.accent;
  const light = theme.mode === 'light';
  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: size * 0.5, padding: `${size * 0.42}px ${size * 0.75}px ${size * 0.42}px ${size * 0.45}px`,
        borderRadius: 999, background: solid ? c : light ? 'rgba(255,255,255,0.92)' : alpha('#0A0C12', 0.78),
        border: `1px solid ${alpha(c, solid ? 1 : 0.55)}`, boxShadow: `0 ${size * 0.4}px ${size * 1.4}px rgba(0,0,0,${light ? 0.1 : 0.4}), 0 0 ${size}px ${alpha(c, light ? 0.12 : 0.25)}`,
        fontFamily: BODY, fontWeight: 700, fontSize: size, color: solid ? theme.onAccent : theme.text, letterSpacing: '-0.01em', whiteSpace: 'nowrap',
      }}
    >
      <div
        style={{
          width: size * 1.5, height: size * 1.5, borderRadius: 999, background: solid ? alpha('#000000', 0.15) : alpha(c, 0.16), color: solid ? theme.onAccent : c,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >
        {icon}
      </div>
      {text}
      {meta ? <span style={{color: solid ? theme.onAccent : c, fontWeight: 800}}>{meta}</span> : null}
    </div>
  );
};

// Finger tap: ring that expands and fades.
export const Tap: React.FC<{x: number; y: number; at: number; color: string; size?: number}> = ({x, y, at, color, size = 60}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < -6 || t > 24) return null;
  const press = interpolate(t, [-6, 0, 6], [0, 1, 0.8], CLAMP);
  const ring = interpolate(t, [0, 22], [0, 1], CLAMP);
  return (
    <div style={{position: 'absolute', left: x - size, top: y - size, width: size * 2, height: size * 2, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: size * 0.6, top: size * 0.6, width: size * 0.8, height: size * 0.8, borderRadius: size, background: alpha(color, 0.45 * press), transform: `scale(${0.6 + press * 0.4})`}} />
      <div
        style={{
          position: 'absolute', left: size * (1 - ring), top: size * (1 - ring), width: size * 2 * ring, height: size * 2 * ring, borderRadius: '50%',
          border: `3px solid ${alpha(color, 1 - ring)}`,
        }}
      />
    </div>
  );
};

// Desktop pointer that glides between waypoints [frame, x, y].
export const Cursor: React.FC<{path: [number, number, number][]; clicks?: number[]; color?: string; size?: number}> = ({path, clicks = [], color = '#fff', size = 34}) => {
  const frame = useCurrentFrame();
  if (frame < path[0][0]) return null;
  const fs = path.map((p) => p[0]);
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let x = path[path.length - 1][1];
  let y = path[path.length - 1][2];
  for (let i = 0; i < path.length - 1; i++) {
    if (frame >= fs[i] && frame < fs[i + 1]) {
      const t = ease((frame - fs[i]) / (fs[i + 1] - fs[i]));
      x = path[i][1] + (path[i + 1][1] - path[i][1]) * t;
      y = path[i][2] + (path[i + 1][2] - path[i][2]) * t;
    }
  }
  const press = clicks.some((c) => frame >= c && frame < c + 6) ? 0.85 : 1;
  return (
    <>
      {clicks.map((c) => (
        <Tap key={c} x={x} y={y} at={c} color={color} size={size * 1.2} />
      ))}
      <svg width={size} height={size * 1.3} viewBox="0 0 24 31" style={{position: 'absolute', left: x - size * 0.12, top: y - size * 0.08, transform: `scale(${press})`, transformOrigin: '10% 10%', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'}}>
        <path d="M2 2 L2 25 L8 19.5 L12 29 L16.5 27 L12.5 18 L20.5 18 Z" fill="#fff" stroke="#111" strokeWidth={1.6} strokeLinejoin="round" />
      </svg>
    </>
  );
};

export const Counter: React.FC<{from: number; to: number; at: number; dur?: number; prefix?: string; suffix?: string; decimals?: number}> = ({
  from, to, at, dur = 30, prefix = '', suffix = '', decimals = 0,
}) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [at, at + dur], [from, to], {...CLAMP, easing: (t) => 1 - Math.pow(1 - t, 3)});
  return (
    <span style={{fontVariantNumeric: 'tabular-nums'}}>
      {prefix}
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
};

// Digital clock with a blinking colon.
export const Clock: React.FC<{theme: Theme; time: string; ampm?: string; size: number; color?: string; label?: string}> = ({theme, time, ampm, size, color, label}) => {
  const frame = useCurrentFrame();
  const [h, m] = time.split(':');
  const blink = Math.floor(frame / 15) % 2 === 0 ? 1 : 0.25;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: theme.display}}>
      {label ? <div style={{fontFamily: BODY, fontWeight: 700, fontSize: size * 0.16, letterSpacing: '0.3em', color: theme.muted, marginBottom: size * 0.05}}>{label}</div> : null}
      <div style={{display: 'flex', alignItems: 'baseline', fontWeight: theme.displayWeight, fontSize: size, letterSpacing: '-0.04em', color: color ?? theme.text, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>
        {h}
        <span style={{opacity: blink, margin: `0 ${size * 0.02}px`}}>:</span>
        {m}
        {ampm ? <span style={{fontSize: size * 0.32, marginLeft: size * 0.12, letterSpacing: '0', color: theme.muted}}>{ampm}</span> : null}
      </div>
    </div>
  );
};

// Line that draws through text (for "No spreadsheets", "templates", etc.).
export const Strike: React.FC<{at: number; color: string; children: React.ReactNode; thickness?: number}> = ({at, color, children, thickness = 6}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 10], [0, 1], {...CLAMP, easing: (t) => 1 - Math.pow(1 - t, 2)});
  return (
    <span style={{position: 'relative', display: 'inline-block'}}>
      <span style={{opacity: 1 - p * 0.45}}>{children}</span>
      <span style={{position: 'absolute', left: -6, top: '52%', height: thickness, width: `calc(${p * 100}% + ${p * 12}px)`, background: color, borderRadius: thickness, transform: 'rotate(-2deg)'}} />
    </span>
  );
};

// Camera: scales/pans its children around a focus point in composition pixels.
export const Camera: React.FC<{keys: [number, number, number, number][]; children: React.ReactNode}> = ({keys, children}) => {
  // keys: [frame, zoom, focusX, focusY]
  const frame = useCurrentFrame();
  const fs = keys.map((k) => k[0]);
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const pick = () => {
    if (fs.length === 1 || frame <= fs[0]) return keys[0].slice(1);
    for (let k = 0; k < fs.length - 1; k++) {
      if (frame >= fs[k] && frame < fs[k + 1]) {
        const t = ease((frame - fs[k]) / (fs[k + 1] - fs[k]));
        return keys[k].slice(1).map((v, j) => v + (keys[k + 1][j + 1] - v) * t);
      }
    }
    return keys[keys.length - 1].slice(1);
  };
  const [z, fx, fy] = pick();
  const {width, height} = useVideoConfig();
  return (
    <div
      style={{
        position: 'absolute', inset: 0, transformOrigin: '0 0',
        transform: `translate(${width / 2 - fx * z}px, ${height / 2 - fy * z}px) scale(${z})`,
      }}
    >
      {children}
    </div>
  );
};

// Soft glowing divider / connector line.
export const Beam: React.FC<{x1: number; y1: number; x2: number; y2: number; at: number; color: string; dur?: number; width?: number}> = ({x1, y1, x2, y2, at, color, dur = 14, width = 3}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], CLAMP);
  if (p <= 0) return null;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const dot = ((frame - at) % 30) / 30;
  return (
    <div style={{position: 'absolute', left: x1, top: y1 - width / 2, width: len, height: width, transformOrigin: '0 50%', transform: `rotate(${ang}deg)`}}>
      <div style={{width: `${p * 100}%`, height: '100%', background: `linear-gradient(90deg, ${alpha(color, 0.1)}, ${color})`, borderRadius: width, boxShadow: `0 0 12px ${alpha(color, 0.7)}`}} />
      {p >= 1 ? <div style={{position: 'absolute', left: `${dot * 100}%`, top: -width * 1.5, width: width * 4, height: width * 4, borderRadius: 99, background: '#fff', boxShadow: `0 0 14px ${color}`}} /> : null}
    </div>
  );
};

// Renders children only inside [from, to) WITHOUT re-basing time (unlike <Sequence>),
// so children can keep using absolute, VO-keyed frame numbers.
export const Show: React.FC<{from?: number; to?: number; children: React.ReactNode}> = ({from = 0, to = Infinity, children}) => {
  const frame = useCurrentFrame();
  return frame >= from && frame < to ? <>{children}</> : null;
};
