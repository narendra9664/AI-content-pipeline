import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Building2, Globe, Instagram, Mail, Megaphone, MessageCircle, Phone, Users} from 'lucide-react';
import {Avatar} from '../components/Bits';
import {Kinetic} from '../components/Kinetic';
import {C, CLAMP, FONT} from '../theme';

const SOURCES = [Globe, Instagram, MessageCircle, Mail, Phone, Megaphone, Building2];
const INITIALS = ['DK', 'SM', 'PS', 'OA', 'LB', 'ML', 'JR', 'AN', 'TW', 'RC', 'EV', 'HN', 'KP', 'YS'];

const CX = 960;
const CY = 640;

type Ring = {rx: number; ry: number; count: number; speed: number; offset: number};
const RINGS: Ring[] = [
  {rx: 420, ry: 150, count: 6, speed: 0.22, offset: 0.3},
  {rx: 760, ry: 265, count: 8, speed: -0.14, offset: 0},
];

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  // everything gets pulled into the centre at the end (hand-off to the brand reveal)
  const collapseAll = spring({frame: frame - 108, fps, config: {damping: 200}});
  const centerIn = spring({frame: frame - 2, fps, config: {damping: 14}});

  let k = 0;
  const chips: React.ReactNode[] = [];
  RINGS.forEach((ring, r) => {
    for (let i = 0; i < ring.count; i++) {
      const idx = k++;
      const angle = ring.offset + (i / ring.count) * Math.PI * 2 + t * ring.speed;
      const depth = (Math.sin(angle) + 1) / 2; // 0 = back, 1 = front
      const appear = spring({frame: frame - (6 + idx * 3), fps, config: {damping: 13}});
      const c = spring({frame: frame - (104 + idx * 1.2), fps, config: {damping: 200}});
      const x = interpolate(c, [0, 1], [CX + ring.rx * Math.cos(angle), CX]);
      const y = interpolate(c, [0, 1], [CY + ring.ry * Math.sin(angle), CY]);
      const scale = (0.7 + 0.4 * depth) * appear * (1 - 0.85 * c);
      const Icon = SOURCES[idx % SOURCES.length];
      chips.push(
        <div
          key={`${r}-${i}`}
          style={{
            position: 'absolute',
            left: x - 42,
            top: y - 42,
            transform: `scale(${scale})`,
            opacity: (0.45 + 0.55 * depth) * (1 - c),
            zIndex: Math.round(depth * 100),
          }}
        >
          <Avatar initials={INITIALS[idx]} size={84} tone={idx} />
          <div
            style={{
              position: 'absolute',
              right: -6,
              bottom: -6,
              width: 32,
              height: 32,
              borderRadius: 16,
              background: C.surface2,
              border: '1px solid rgba(255,255,255,0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={17} color={C.text} strokeWidth={2.2} />
          </div>
        </div>,
      );
    }
  });

  const ringOpacity = interpolate(frame, [0, 20], [0, 1], CLAMP) * (1 - collapseAll);

  return (
    <AbsoluteFill style={{fontFamily: FONT, color: C.text}}>
      {RINGS.map((ring, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: CX - ring.rx,
            top: CY - ring.ry,
            width: ring.rx * 2,
            height: ring.ry * 2,
            borderRadius: '50%',
            border: '1.5px solid rgba(255,255,255,0.10)',
            opacity: ringOpacity,
          }}
        />
      ))}
      {/* centre hub */}
      <div
        style={{
          position: 'absolute',
          left: CX - 85,
          top: CY - 85,
          width: 170,
          height: 170,
          borderRadius: 85,
          zIndex: 60,
          transform: `scale(${centerIn * (1 + collapseAll * 0.35)})`,
          background: 'radial-gradient(circle at 35% 30%, rgba(0,163,255,0.35), rgba(15,18,28,0.95) 70%)',
          border: '1px solid rgba(0,163,255,0.55)',
          boxShadow: `0 0 ${60 + collapseAll * 140}px rgba(0,163,255,${0.35 + collapseAll * 0.5})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Users size={64} color={C.text} strokeWidth={2} />
      </div>
      {chips}
      <div style={{position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', justifyContent: 'center'}}>
        <Kinetic text="Leads pour in from *everywhere.*" size={70} start={4} exitAt={56} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', justifyContent: 'center'}}>
        <Kinetic text="But which ones are _ready to buy?_" size={70} start={62} />
      </div>
    </AbsoluteFill>
  );
};
