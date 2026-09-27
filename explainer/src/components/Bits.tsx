import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Activity} from 'lucide-react';
import {C, CLAMP, FONT, GRAD_BLUE, gradientText} from '../theme';
import {Kinetic} from './Kinetic';

const AVATAR_GRADS = [
  ['#00A3FF', '#7C4DFF'],
  ['#FF8A5B', '#FF4E8A'],
  ['#00C9A7', '#00A3FF'],
  ['#FFB300', '#FF6A3D'],
  ['#9B6BFF', '#FF5AC8'],
  ['#3DDC97', '#1E9BFF'],
];

export const Avatar: React.FC<{initials: string; size: number; tone?: number}> = ({initials, size, tone = 0}) => {
  const [a, b] = AVATAR_GRADS[tone % AVATAR_GRADS.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: `linear-gradient(135deg, ${a}, ${b})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: size * 0.38,
        color: '#fff',
        flexShrink: 0,
        boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
      }}
    >
      {initials}
    </div>
  );
};

// Left-column copy for the three "how it works" steps.
export const StepHeading: React.FC<{step: string; title: string; sub: string; x?: number; y?: number}> = ({
  step,
  title,
  sub,
  x = 130,
  y = 300,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const label = spring({frame, fps, config: {damping: 200}});
  const subIn = interpolate(frame, [30, 48], [0, 1], CLAMP);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 690, fontFamily: FONT}}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 16px',
          borderRadius: 999,
          border: `1px solid ${C.blue}66`,
          background: 'rgba(0,163,255,0.08)',
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: '0.18em',
          color: C.blue,
          opacity: label,
          transform: `translateX(${(1 - label) * -30}px)`,
          marginBottom: 28,
        }}
      >
        {step}
      </div>
      <Kinetic text={title} size={66} align="left" start={2} stagger={3} maxWidth={690} />
      <div
        style={{
          marginTop: 26,
          fontSize: 29,
          lineHeight: 1.45,
          fontWeight: 500,
          color: C.muted,
          opacity: subIn,
          transform: `translateY(${(1 - subIn) * 16}px)`,
          maxWidth: 620,
        }}
      >
        {sub}
      </div>
    </div>
  );
};

// Glowing orb logo mark.
export const LogoMark: React.FC<{size: number; glow?: number}> = ({size, glow = 1}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'relative', width: size, height: size}}>
      <div
        style={{
          position: 'absolute',
          inset: -size * 0.9,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(0,163,255,${0.45 * glow}) 0%, rgba(124,77,255,${0.18 * glow}) 35%, rgba(0,0,0,0) 65%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 34% 28%, #CFF0FF 0%, #00A3FF 32%, #4B34D8 72%, #1B1450 100%)',
          boxShadow: `0 0 ${size * 0.35}px rgba(0,163,255,0.65), inset 0 -${size * 0.08}px ${size * 0.2}px rgba(10,5,40,0.6)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Activity size={size * 0.46} color="#fff" strokeWidth={2.4} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: -size * 0.28,
          top: size * 0.36,
          width: size * 1.56,
          height: size * 0.28,
          borderRadius: '50%',
          border: '2px solid rgba(160,220,255,0.55)',
          transform: `rotate(${-18 + Math.sin(frame / 30) * 4}deg)`,
        }}
      />
    </div>
  );
};

export const Wordmark: React.FC<{size: number}> = ({size}) => (
  <div style={{fontFamily: FONT, fontSize: size, fontWeight: 800, letterSpacing: '-0.03em', color: C.text}}>
    frontdesk <span style={gradientText(GRAD_BLUE)}>AI</span>
  </div>
);
