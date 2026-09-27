import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {BODY, Theme} from '../theme';

const Blob: React.FC<{color: string; size: number; x: number; y: number}> = ({color, size, x, y}) => (
  <div
    style={{
      position: 'absolute',
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 62%)`,
    }}
  />
);

// Themed animated background: drifting light blobs, optional grid, vignette (dark themes).
export const Stage: React.FC<{theme: Theme; children?: React.ReactNode; calm?: boolean}> = ({theme, children, calm}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = frame / 30;
  const m = Math.max(width, height);
  const k = calm ? 0.5 : 1;
  return (
    <AbsoluteFill style={{background: theme.bg, overflow: 'hidden', fontFamily: BODY, color: theme.text}}>
      <Blob color={theme.blobs[0]} size={m * 1.05} x={width * 0.2 + Math.sin(t * 0.33 * k) * width * 0.12} y={height * 0.18 + Math.cos(t * 0.27 * k) * height * 0.08} />
      <Blob color={theme.blobs[1]} size={m * 0.95} x={width * 0.85 + Math.cos(t * 0.25 * k) * width * 0.1} y={height * 0.8 + Math.sin(t * 0.31 * k) * height * 0.08} />
      <Blob color={theme.blobs[2]} size={m * 0.7} x={width * 0.6 + Math.sin(t * 0.2 * k + 1) * width * 0.18} y={height * 0.45 + Math.cos(t * 0.22 * k) * height * 0.12} />
      {theme.grid ? (
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${theme.line} 1px, transparent 1px), linear-gradient(90deg, ${theme.line} 1px, transparent 1px)`,
            backgroundSize: '72px 72px',
            backgroundPosition: `${(frame * 0.35) % 72}px ${(frame * 0.2) % 72}px`,
            opacity: 0.5,
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
            maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
          }}
        />
      ) : null}
      {theme.mode === 'dark' ? (
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6) 100%)'}} />
      ) : (
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(255,255,255,0) 55%, rgba(255,255,255,0.35) 100%)'}} />
      )}
      {children}
    </AbsoluteFill>
  );
};
