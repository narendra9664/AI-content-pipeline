import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Clock, Eye, FileDown, Flame, Instagram, MessageCircle} from 'lucide-react';
import {Avatar, StepHeading} from '../components/Bits';
import {Panel} from '../components/Panel';
import {C, CLAMP, FONT} from '../theme';

const BASE_SCORE = 10;
const EVENTS = [
  {Icon: Eye, title: 'Viewed Penthouse 42A · 4 times', when: 'Mon · 7:12 PM', pts: 18, at: 34},
  {Icon: FileDown, title: 'Downloaded the floor plan', when: 'Tue · 9:40 AM', pts: 15, at: 52},
  {Icon: Instagram, title: 'Came back from an Instagram ad', when: 'Wed · 1:05 PM', pts: 10, at: 70},
  {Icon: MessageCircle, title: 'Asked about payment plans', when: 'Thu · 6:22 PM', pts: 22, at: 88},
  {Icon: Clock, title: 'Opened the pricing page', when: 'Fri · 11:48 PM', pts: 17, at: 106},
];
const HOT_AT = 128;

const ScoreRing: React.FC<{value: number; hot: number}> = ({value, hot}) => {
  const size = 152;
  const stroke = 13;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{position: 'relative', width: size, height: size}}>
      <svg width={size} height={size} style={{transform: 'rotate(-90deg)'}}>
        <defs>
          <linearGradient id="ring-blue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={C.blue} />
            <stop offset="100%" stopColor={C.violet} />
          </linearGradient>
          <linearGradient id="ring-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFE680" />
            <stop offset="100%" stopColor={C.amber} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ring-blue)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - value / 100)}
          opacity={1 - hot}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ring-gold)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - value / 100)}
          opacity={hot}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{fontSize: 50, fontWeight: 800, letterSpacing: '-0.03em', color: hot > 0.5 ? C.gold : C.text}}>
          {Math.round(value)}
        </div>
        <div style={{fontSize: 15, fontWeight: 600, color: C.muted, letterSpacing: '0.12em', marginTop: -4}}>
          INTENT
        </div>
      </div>
    </div>
  );
};

export const Track: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const score =
    BASE_SCORE +
    EVENTS.reduce(
      (acc, e) =>
        acc +
        e.pts *
          interpolate(frame, [e.at + 4, e.at + 18], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)}),
      0,
    );
  const hot = spring({frame: frame - HOT_AT, fps, config: {damping: 11, stiffness: 170}});
  const hotFade = interpolate(frame, [HOT_AT - 4, HOT_AT + 8], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{fontFamily: FONT, color: C.text}}>
      <StepHeading
        step="01 — TRACK"
        title="Every visit. Every click. *Every signal.*"
        sub="See what each buyer viewed, downloaded and asked about — in one live timeline."
      />
      <Panel x={880} y={100} width={900} height={880} title="Lead profile" enter={0}>
        <div style={{display: 'flex', alignItems: 'center', gap: 24, padding: '30px 36px 22px'}}>
          <Avatar initials="SM" size={88} tone={1} />
          <div>
            <div style={{fontSize: 38, fontWeight: 700, letterSpacing: '-0.02em'}}>Sarah M.</div>
            <div style={{fontSize: 22, color: C.muted, marginTop: 4}}>Penthouse 42A · $4.8M</div>
          </div>
          <div style={{marginLeft: 'auto', position: 'relative'}}>
            <ScoreRing value={score} hot={hotFade} />
            <div
              style={{
                position: 'absolute',
                left: '50%',
                bottom: -18,
                transform: `translateX(-50%) scale(${hot})`,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 999,
                background: 'linear-gradient(90deg, #FFE680, #FFB300)',
                color: '#1A1200',
                fontSize: 17,
                fontWeight: 800,
                letterSpacing: '0.08em',
                boxShadow: '0 0 28px rgba(255,200,0,0.55)',
                whiteSpace: 'nowrap',
              }}
            >
              <Flame size={17} color="#1A1200" strokeWidth={2.6} />
              HOT LEAD
            </div>
          </div>
        </div>
        <div style={{height: 1, background: C.line, margin: '6px 36px 0'}} />
        <div style={{padding: '22px 36px 0', fontSize: 16, fontWeight: 700, letterSpacing: '0.16em', color: C.dim}}>
          ACTIVITY TIMELINE
        </div>
        <div style={{position: 'relative', padding: '14px 36px 0'}}>
          <div
            style={{
              position: 'absolute',
              left: 36 + 27,
              top: 40,
              width: 2,
              height: interpolate(frame, [34, 110], [0, 4 * 96], CLAMP),
              background: 'linear-gradient(180deg, rgba(0,163,255,0.6), rgba(124,77,255,0.4))',
            }}
          />
          {EVENTS.map((e, i) => {
            const p = spring({frame: frame - e.at, fps, config: {damping: 15, stiffness: 140}});
            return (
              <div
                key={i}
                style={{
                  height: 96,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 22,
                  opacity: Math.min(1, p * 1.4),
                  transform: `translateX(${(1 - p) * 60}px)`,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    background: '#12213A',
                    border: '1px solid rgba(0,163,255,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(0,163,255,0.25)',
                    flexShrink: 0,
                  }}
                >
                  <e.Icon size={26} color={C.blue} strokeWidth={2.3} />
                </div>
                <div>
                  <div style={{fontSize: 26, fontWeight: 600}}>{e.title}</div>
                  <div style={{fontSize: 19, color: C.muted, marginTop: 3}}>{e.when}</div>
                </div>
                <div
                  style={{
                    marginLeft: 'auto',
                    padding: '8px 14px',
                    borderRadius: 12,
                    background: 'rgba(0,230,118,0.12)',
                    color: C.green,
                    fontSize: 21,
                    fontWeight: 700,
                  }}
                >
                  +{e.pts}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </AbsoluteFill>
  );
};
