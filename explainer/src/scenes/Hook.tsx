import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Eye} from 'lucide-react';
import {Kinetic} from '../components/Kinetic';
import {C, FONT} from '../theme';

const VISITS = ['Mon', 'Tue', 'Tue', 'Thu', 'Sat', 'Sun'];

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  // at ~2s the setup steps back to make room for the punchline
  const back = spring({frame: frame - 58, fps, config: {damping: 200}});

  return (
    <AbsoluteFill style={{fontFamily: FONT, color: C.text}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 250,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 34,
          transform: `translateY(${-back * 80}px) scale(${1 - back * 0.08})`,
          opacity: 1 - back * 0.5,
        }}
      >
        <div style={{display: 'flex', gap: 14}}>
          {VISITS.map((d, i) => {
            const p = spring({frame: frame - (16 + i * 5), fps, config: {damping: 11, stiffness: 190}});
            return (
              <div
                key={i}
                style={{
                  transform: `scale(${p}) translateY(${(1 - p) * 24}px)`,
                  opacity: Math.min(1, p * 1.3),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  padding: '11px 18px',
                  borderRadius: 999,
                  background: 'rgba(0,163,255,0.10)',
                  border: '1px solid rgba(0,163,255,0.5)',
                  boxShadow: '0 0 26px rgba(0,163,255,0.28)',
                  color: C.text,
                  fontSize: 22,
                  fontWeight: 600,
                }}
              >
                <Eye size={22} color={C.blue} strokeWidth={2.4} />
                {d}
              </div>
            );
          })}
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
          <Kinetic text="Your *hottest buyer* visited" size={86} start={2} stagger={3} />
          <Kinetic text="your listings *6 times* this week." size={86} start={12} stagger={3} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center'}}>
        <Kinetic text="~Nobody~ called them." size={104} weight={800} start={66} stagger={4} />
      </div>
    </AbsoluteFill>
  );
};
