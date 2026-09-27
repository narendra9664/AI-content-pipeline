import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, CLAMP, FONT} from '../theme';

type Pose = {rx: number; ry: number; z: number};

// A glowing app window that swings in on a 3D tilt (the "floating dashboard"
// look from SaaS promos), then keeps drifting slightly so it never feels static.
export const Panel: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  enter?: number;
  from?: Pose;
  to?: Pose;
  glow?: string;
  live?: boolean;
  children: React.ReactNode;
}> = ({
  x,
  y,
  width,
  height,
  title,
  enter = 0,
  from = {rx: 14, ry: -34, z: -380},
  to = {rx: 5, ry: -12, z: 0},
  glow = C.blue,
  live = true,
  children,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - enter, fps, config: {damping: 20, stiffness: 70, mass: 1}});
  const drift = Math.sin((frame - enter) / 45) * 1.6;
  const rx = interpolate(p, [0, 1], [from.rx, to.rx]);
  const ry = interpolate(p, [0, 1], [from.ry, to.ry]) + drift;
  const z = interpolate(p, [0, 1], [from.z, to.z]);
  const opacity = interpolate(p, [0, 0.35], [0, 1], CLAMP);
  // one-off light sweep across the glass when it lands
  const sheen = interpolate(frame - enter, [10, 40], [-60, 160], CLAMP);

  return (
    <div style={{position: 'absolute', left: x, top: y, width, height, perspective: 2200}}>
      <div
        style={{
          width: '100%',
          height: '100%',
          opacity,
          transform: `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${z}px)`,
          borderRadius: 28,
          background: 'linear-gradient(180deg, rgba(22,26,40,0.96), rgba(12,14,22,0.97))',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: `0 0 0 1px ${glow}55, 0 0 90px ${glow}30, 0 50px 120px rgba(0,0,0,0.65)`,
          overflow: 'hidden',
          fontFamily: FONT,
          color: C.text,
          position: 'relative',
        }}
      >
        <div
          style={{
            height: 58,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 24px',
            borderBottom: `1px solid ${C.line}`,
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          {['#3A3F52', '#3A3F52', '#3A3F52'].map((c, i) => (
            <div key={i} style={{width: 13, height: 13, borderRadius: 7, background: c}} />
          ))}
          <div style={{marginLeft: 14, fontSize: 19, fontWeight: 600, color: C.muted}}>{title}</div>
          {live ? (
            <div
              style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 16,
                fontWeight: 600,
                color: C.green,
                padding: '6px 12px',
                borderRadius: 999,
                background: 'rgba(0,230,118,0.10)',
              }}
            >
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 5,
                  background: C.green,
                  opacity: 0.55 + 0.45 * Math.abs(Math.sin(frame / 9)),
                }}
              />
              LIVE
            </div>
          ) : null}
        </div>
        <div style={{position: 'relative', height: height - 58}}>{children}</div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(105deg, rgba(255,255,255,0) ${sheen - 20}%, rgba(255,255,255,0.07) ${sheen}%, rgba(255,255,255,0) ${sheen + 20}%)`,
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
};
