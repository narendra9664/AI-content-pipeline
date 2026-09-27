import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Activity, ChevronRight, ListOrdered, Send} from 'lucide-react';
import {LogoMark, Wordmark} from '../components/Bits';
import {C, CLAMP, FONT} from '../theme';

const PILLS = [
  {label: 'Track', Icon: Activity},
  {label: 'Rank', Icon: ListOrdered},
  {label: 'Follow up', Icon: Send},
];

export const Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const orb = spring({frame, fps, config: {damping: 12, stiffness: 90}});
  const wave = interpolate(frame, [0, 34], [0, 1], CLAMP);
  const word = spring({frame: frame - 14, fps, config: {damping: 200}});
  // the orb is born where the lead orbit collapsed (y=640), then rises into the lockup
  const rise = spring({frame: frame - 6, fps, config: {damping: 200, stiffness: 90}});
  const orbY = interpolate(rise, [0, 1], [640, 390]);

  return (
    <AbsoluteFill style={{fontFamily: FONT, alignItems: 'center', color: C.text}}>
      {/* shockwave */}
      <div
        style={{
          position: 'absolute',
          left: 960 - 110,
          top: 640 - 110,
          width: 220,
          height: 220,
          borderRadius: 110,
          border: '2px solid rgba(0,163,255,0.8)',
          transform: `scale(${0.4 + wave * 7})`,
          opacity: 1 - wave,
        }}
      />
      <div style={{position: 'absolute', left: 960 - 110, top: orbY - 110, transform: `scale(${0.75 + orb * 0.25})`}}>
        <LogoMark size={220} glow={1.2} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 590,
          opacity: word,
          transform: `translateY(${(1 - word) * 40}px)`,
          filter: word < 0.98 ? `blur(${(1 - word) * 12}px)` : undefined,
          letterSpacing: `${(1 - word) * 0.25}em`,
        }}
      >
        <Wordmark size={110} />
      </div>
      <div style={{position: 'absolute', top: 780, display: 'flex', alignItems: 'center', gap: 18}}>
        {PILLS.map(({label, Icon}, i) => {
          const p = spring({frame: frame - (42 + i * 12), fps, config: {damping: 12, stiffness: 160}});
          return (
            <React.Fragment key={label}>
              {i > 0 ? (
                <ChevronRight size={34} color={C.dim} style={{opacity: Math.min(1, p * 1.5)}} />
              ) : null}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '16px 28px',
                  borderRadius: 999,
                  background: 'rgba(0,163,255,0.10)',
                  border: '1px solid rgba(0,163,255,0.5)',
                  boxShadow: '0 0 30px rgba(0,163,255,0.25)',
                  fontSize: 34,
                  fontWeight: 700,
                  color: C.text,
                  transform: `scale(${p})`,
                  opacity: Math.min(1, p * 1.4),
                }}
              >
                <Icon size={32} color={C.blue} strokeWidth={2.4} />
                {label}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
