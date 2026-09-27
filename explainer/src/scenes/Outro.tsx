import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Kinetic} from '../components/Kinetic';
import {LogoMark, Wordmark} from '../components/Bits';
import {C, CLAMP, FONT} from '../theme';

const CTA = 'DM "AUDIT" to @frontdesk.ops';
const TYPE_AT = 64;

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const up = spring({frame: frame - 36, fps, config: {damping: 200}});
  const logo = spring({frame: frame - 40, fps, config: {damping: 14, stiffness: 110}});
  const pill = spring({frame: frame - 58, fps, config: {damping: 16, stiffness: 140}});
  const typed = Math.round(interpolate(frame, [TYPE_AT, TYPE_AT + 30], [0, CTA.length], CLAMP));
  const sub = interpolate(frame, [96, 112], [0, 1], CLAMP);
  const caretOn = Math.floor(frame / 9) % 2 === 0;

  return (
    <AbsoluteFill style={{fontFamily: FONT, alignItems: 'center', color: C.text}}>
      <div
        style={{
          position: 'absolute',
          top: 440,
          transform: `translateY(${-up * 250}px) scale(${1 - up * 0.22})`,
        }}
      >
        <Kinetic text="Never lose a _ready buyer_ again." size={92} weight={800} start={14} stagger={3} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 400,
          display: 'flex',
          alignItems: 'center',
          gap: 34,
          opacity: Math.min(1, logo * 1.4),
          transform: `translateY(${(1 - logo) * 50}px) scale(${0.85 + 0.15 * logo})`,
        }}
      >
        <LogoMark size={120} />
        <Wordmark size={96} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 610,
          minWidth: 700,
          display: 'flex',
          justifyContent: 'center',
          padding: '24px 44px',
          borderRadius: 999,
          background: 'rgba(0,163,255,0.08)',
          border: '1.5px solid rgba(0,163,255,0.7)',
          boxShadow: '0 0 50px rgba(0,163,255,0.35), inset 0 0 30px rgba(0,163,255,0.12)',
          fontSize: 44,
          fontWeight: 600,
          color: C.text,
          opacity: Math.min(1, pill * 1.4),
          transform: `scale(${0.9 + 0.1 * pill})`,
        }}
      >
        <span>
          {CTA.slice(0, typed)}
          <span
            style={{
              display: 'inline-block',
              width: 3,
              height: 46,
              marginLeft: 4,
              verticalAlign: 'middle',
              background: C.blue,
              opacity: caretOn ? 1 : 0,
            }}
          />
        </span>
      </div>
      <div style={{position: 'absolute', top: 760, fontSize: 30, fontWeight: 500, color: C.muted, opacity: sub}}>
        AI lead tracking, ranking &amp; follow-up for luxury developers
      </div>
    </AbsoluteFill>
  );
};
