import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ArrowDownWideNarrow, Building2, DoorOpen, Flame, Globe, Instagram, MessageCircle} from 'lucide-react';
import {Avatar, StepHeading} from '../components/Bits';
import {Panel} from '../components/Panel';
import {C, CLAMP, FONT} from '../theme';

// Arrival order; the scene re-sorts them by intent score.
const LEADS = [
  {name: 'Daniel K.', ini: 'DK', src: 'Portal', Icon: Building2, act: 'Saved 2 listings', score: 41},
  {name: 'Sarah M.', ini: 'SM', src: 'Instagram', Icon: Instagram, act: 'Pricing page · 11:48 PM', score: 92},
  {name: 'Priya S.', ini: 'PS', src: 'Website', Icon: Globe, act: 'Opened the brochure', score: 23},
  {name: 'Omar A.', ini: 'OA', src: 'WhatsApp', Icon: MessageCircle, act: 'Asked for a viewing', score: 87},
  {name: 'Lucas B.', ini: 'LB', src: 'Open house', Icon: DoorOpen, act: 'Signed the guest list', score: 35},
  {name: 'Mei L.', ini: 'ML', src: 'Website', Icon: Globe, act: 'Viewed 3 floor plans', score: 78},
];
const ORDER = LEADS.map((l, i) => ({i, s: l.score}))
  .sort((a, b) => b.s - a.s)
  .map((x) => x.i);
const RANK_OF = LEADS.map((_, i) => ORDER.indexOf(i));

const ROW_H = 96;
const SORT_AT = 84;
const HOT_AT = 118;
const COLS = {lead: 36, src: 372, act: 560, intent: 810};

export const Rank: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sort = spring({frame: frame - SORT_AT, fps, config: {damping: 18, stiffness: 80}});
  const sortedLabel = spring({frame: frame - SORT_AT + 4, fps, config: {damping: 14}});

  return (
    <AbsoluteFill style={{fontFamily: FONT, color: C.text}}>
      <StepHeading
        step="02 — RANK"
        title="AI ranks who's *ready to buy.*"
        sub="Your agents call the hottest buyers first — not whoever emailed last."
      />
      <Panel x={830} y={165} width={990} height={760} title="Lead queue · Today" enter={0} glow={C.violet}>
        <div
          style={{
            position: 'absolute',
            top: 22,
            left: 0,
            right: 0,
            height: 30,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '0.14em',
            color: C.dim,
          }}
        >
          <span style={{position: 'absolute', left: COLS.lead}}>LEAD</span>
          <span style={{position: 'absolute', left: COLS.src}}>SOURCE</span>
          <span style={{position: 'absolute', left: COLS.act}}>LATEST ACTIVITY</span>
          <span
            style={{
              position: 'absolute',
              left: COLS.intent,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: sortedLabel > 0.5 ? C.blue : C.dim,
            }}
          >
            INTENT
            <ArrowDownWideNarrow
              size={18}
              color={C.blue}
              strokeWidth={2.6}
              style={{transform: `scale(${sortedLabel})`, opacity: sortedLabel}}
            />
          </span>
        </div>
        <div style={{position: 'absolute', top: 64, left: 24, right: 24, height: 1, background: C.line}} />
        {LEADS.map((l, i) => {
          const appearAt = 16 + i * 6;
          const p = spring({frame: frame - appearAt, fps, config: {damping: 16, stiffness: 140}});
          const count = interpolate(frame, [appearAt + 6, appearAt + 40], [0, 1], {
            ...CLAMP,
            easing: Easing.out(Easing.cubic),
          });
          const rank = RANK_OF[i];
          const y = 78 + interpolate(sort, [0, 1], [i, rank]) * ROW_H;
          const movingUp = rank < i;
          const isHot = rank < 3;
          const hot = isHot ? spring({frame: frame - (HOT_AT + rank * 5), fps, config: {damping: 12, stiffness: 160}}) : 0;
          const dim = isHot ? 1 : interpolate(frame, [HOT_AT, HOT_AT + 16], [1, 0.4], CLAMP);
          const lift = movingUp ? Math.sin(sort * Math.PI) * 0.025 : 0;
          const value = Math.round(l.score * count);
          return (
            <div
              key={l.name}
              style={{
                position: 'absolute',
                left: 16,
                right: 16,
                top: y,
                height: ROW_H - 10,
                borderRadius: 18,
                opacity: Math.min(1, p * 1.4) * dim,
                transform: `translateX(${(1 - p) * 50}px) scale(${1 + lift})`,
                zIndex: movingUp ? 10 : 1,
                background: `rgba(255,215,0,${0.07 * hot})`,
                boxShadow: hot > 0.05 ? `inset 4px 0 0 rgba(255,200,0,${hot}), 0 0 ${36 * hot}px rgba(255,190,0,${0.18 * hot})` : undefined,
              }}
            >
              <div style={{position: 'absolute', left: COLS.lead - 16, top: 17, display: 'flex', alignItems: 'center', gap: 16}}>
                <Avatar initials={l.ini} size={52} tone={i} />
                <div style={{fontSize: 25, fontWeight: 600}}>{l.name}</div>
                  {isHot ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: 'linear-gradient(90deg, #FFE680, #FFB300)',
                      color: '#1A1200',
                      fontSize: 14,
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      transform: `scale(${hot})`,
                      opacity: Math.min(1, hot * 1.5),
                    }}
                  >
                    <Flame size={14} color="#1A1200" strokeWidth={2.8} />
                    HOT
                  </div>
                ) : null}
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: COLS.src - 16,
                  top: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)',
                  fontSize: 18,
                  fontWeight: 600,
                  color: C.muted,
                }}
              >
                <l.Icon size={17} color={C.muted} strokeWidth={2.3} />
                {l.src}
              </div>
              <div style={{position: 'absolute', left: COLS.act - 16, top: 30, fontSize: 20, color: C.muted}}>{l.act}</div>
              <div style={{position: 'absolute', left: COLS.intent - 16, top: 22, display: 'flex', alignItems: 'center', gap: 14}}>
                <div style={{width: 92, height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.08)', overflow: 'hidden'}}>
                  <div
                    style={{
                      width: `${l.score * count}%`,
                      height: '100%',
                      borderRadius: 5,
                      background: isHot && hot > 0.3 ? 'linear-gradient(90deg, #FFE680, #FFB300)' : `linear-gradient(90deg, ${C.blue}, ${C.violet})`,
                    }}
                  />
                </div>
                <div style={{fontSize: 28, fontWeight: 800, width: 44, color: isHot && hot > 0.3 ? C.gold : C.text}}>{value}</div>

              </div>
            </div>
          );
        })}
      </Panel>
    </AbsoluteFill>
  );
};
