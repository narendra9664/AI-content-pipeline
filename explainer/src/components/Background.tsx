import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../theme';

// Soft light blobs drifting behind everything — radial gradients, no CSS blur,
// so the look is "After Effects glow" while staying cheap to render.
const Blob: React.FC<{color: string; size: number; x: number; y: number; opacity: number}> = ({
  color,
  size,
  x,
  y,
  opacity,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 62%)`,
      opacity,
    }}
  />
);

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;

  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <Blob
        color="rgba(0,163,255,0.55)"
        size={1500}
        x={480 + Math.sin(t * 0.35) * 240}
        y={330 + Math.cos(t * 0.3) * 130}
        opacity={0.55}
      />
      <Blob
        color="rgba(124,77,255,0.6)"
        size={1400}
        x={1500 + Math.cos(t * 0.28) * 220}
        y={780 + Math.sin(t * 0.33) * 150}
        opacity={0.5}
      />
      <Blob
        color="rgba(0,163,255,0.4)"
        size={1000}
        x={1050 + Math.sin(t * 0.2 + 1) * 320}
        y={90 + Math.cos(t * 0.25) * 90}
        opacity={0.35}
      />
      {/* faint technical grid, masked to the centre */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          backgroundPosition: `${(frame * 0.4) % 80}px ${(frame * 0.25) % 80}px`,
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 25%, transparent 72%)',
          maskImage: 'radial-gradient(ellipse at center, black 25%, transparent 72%)',
        }}
      />
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.7) 100%)'}}
      />
    </AbsoluteFill>
  );
};
