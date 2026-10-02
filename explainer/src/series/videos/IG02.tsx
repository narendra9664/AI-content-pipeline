import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CalendarX, ChevronLeft, Download, Eye, Flame, Mail, Moon, PhoneCall, PhoneOff} from 'lucide-react';
import {BODY, CLAMP, THEMES, alpha} from '../theme';
import {VOData, at} from '../vo';
import data from '../vo/ig02.json';
import {Stage} from '../kit/Stage';
import {SpokenHeadline} from '../kit/Text';
import {Phone} from '../kit/Frames';
import {Photo, SiteMobile, StatusBar} from '../kit/Site';
import {Show, Tap} from '../kit/Misc';
import {Avatar, ScoreRing} from '../kit/Lead';
import {EndCard} from '../kit/Logo';
import {Soundtrack} from '../kit/Audio';
import {FadeOut, LogRow, RewindFx, Stamp} from '../kit/Social';

// IG02 "One buyer, 14 days, zero form fills": a buyer's diary nobody read.
const T = THEMES.midnight;
const vo = data as VOData;
export const IG02_FRAMES = Math.ceil(vo.duration * 30) + 60;
const w = (word: string, n = 1) => at(vo, word, n);

const tFourteen = w('14', 1);
const tZero = w('zero');
const D = [w('day', 1), w('day', 2), w('day', 3), w('day', 4), w('day', 5)]; // days 1, 3, 6, 9, 14
const DAYS = [1, 3, 6, 9, 14];
const tClicks = w('clicks');
const tPenthouse = w('penthouse');
const tFloor = w('floor');
const tPayment = w('payment');
const tSomewhere = w('somewhere');
const tNobody = w('nobody');
const tFlags = w('flags');
const tCatch = w('catch');
const tDM = w('dm');
const tRewind = tFlags - 16;

const PX = 70;
const PY = 566;
const PW = 440;
const K = (PW * 0.93) / 390;
const sx = (lx: number) => PX + PW * 0.035 + lx * K;
const sy = (ly: number) => PY + PW * 0.035 + ly * K;
const COL_X = 540;
const COL_W = 470;
const GOLD = '#C8A46A';

// The newsletter she opened on day 1.
const MailScreen: React.FC<{press: number}> = ({press}) => (
  <div style={{position: 'absolute', inset: 0, background: '#0F1115', fontFamily: BODY, color: '#F3EEE6'}}>
    <StatusBar color="#fff" time="7:42" />
    <div style={{position: 'absolute', left: 16, top: 60, display: 'flex', alignItems: 'center', gap: 4, fontSize: 15, color: '#8AB4FF'}}>
      <ChevronLeft size={20} /> Inbox
    </div>
    <div style={{position: 'absolute', left: 20, right: 20, top: 100}}>
      <div style={{fontSize: 22, fontWeight: 700, lineHeight: 1.2}}>The Sky Penthouses are now selling</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 14}}>
        <div style={{width: 38, height: 38, borderRadius: 38, background: GOLD, color: '#15120C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800}}>V</div>
        <div>
          <div style={{fontSize: 14, fontWeight: 700}}>VELORIA Sky Residences</div>
          <div style={{fontSize: 12, color: 'rgba(243,238,230,0.55)'}}>to Sarah · 7:40 PM</div>
        </div>
      </div>
    </div>
    <Photo w={350} h={210} zoom={1.6} fx={0.5} fy={0.4} radius={14} style={{position: 'absolute', left: 20, top: 228}} />
    <div style={{position: 'absolute', left: 20, right: 20, top: 458, fontFamily: 'Instrument Serif', fontSize: 32, lineHeight: 1.05}}>Four penthouses. One skyline.</div>
    <div style={{position: 'absolute', left: 20, right: 20, top: 536, fontSize: 14, lineHeight: 1.5, color: 'rgba(243,238,230,0.7)'}}>
      Floors 40 to 44, private terraces, and a first look for our list before the public release.
    </div>
    <div
      style={{
        position: 'absolute', left: 20, right: 20, top: 622, height: 50, borderRadius: 999, background: GOLD, color: '#15120C',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, transform: `scale(${press})`,
      }}
    >
      View the penthouses →
    </div>
  </div>
);

// Day 14: the confirmation she got from someone else.
const ConfirmScreen: React.FC<{start: number}> = ({start}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bubble = (t: number, text: React.ReactNode, mine?: boolean, strong?: boolean) => {
    const p = spring({frame: frame - t, fps, config: {damping: 15, stiffness: 160, mass: 0.6}});
    return (
      <div
        style={{
          alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '82%', padding: '9px 12px', borderRadius: 12,
          borderTopLeftRadius: mine ? 12 : 3, borderTopRightRadius: mine ? 3 : 12, background: mine ? '#005C4B' : '#202C33',
          color: '#E9EDEF', fontSize: 15.5, lineHeight: 1.35, fontWeight: strong ? 700 : 400,
          opacity: Math.min(1, p * 1.4), transform: `scale(${0.85 + 0.15 * p})`, transformOrigin: mine ? '100% 0' : '0 0',
        }}
      >
        {text}
      </div>
    );
  };
  return (
    <div style={{position: 'absolute', inset: 0, background: '#0B141A', fontFamily: BODY}}>
      <StatusBar color="#fff" time="10:12" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 48, height: 64, background: '#1F2C33', display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px'}}>
        <ChevronLeft size={22} color="#E9EDEF" />
        <div style={{width: 38, height: 38, borderRadius: 38, background: '#7C9CBF', color: '#0B141A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800}}>S</div>
        <div>
          <div style={{fontSize: 15.5, fontWeight: 700, color: '#E9EDEF'}}>Solenne Residences</div>
          <div style={{fontSize: 12, color: '#8696A0'}}>Business account</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 12, right: 12, top: 132, display: 'flex', flexDirection: 'column', gap: 8}}>
        <div style={{alignSelf: 'center', padding: '4px 10px', borderRadius: 8, background: '#182229', color: '#8696A0', fontSize: 12, fontWeight: 600}}>TODAY</div>
        {bubble(start + 4, 'Hi Sarah! Lovely to hear from you. Your private viewing is confirmed:')}
        {bubble(start + 16, 'Saturday, 11 AM · Sky Penthouse', false, true)}
        {bubble(start + 30, 'Perfect, see you then!', true)}
      </div>
    </div>
  );
};

const CELL = 58;
const GAP = 9;
const STRIP_X = (1080 - (14 * CELL + 13 * GAP)) / 2;
const STRIP_Y = 438;

// Which day the playhead sits on (slides between diary entries, rewinds to day 6).
const dayAt = (frame: number) => {
  const keys: [number, number][] = [[D[0], 1], [D[1], 3], [D[2], 6], [D[3], 9], [D[4], 14]];
  let d = 0;
  for (const [t, day] of keys) {
    if (frame >= t) d = interpolate(frame, [t, t + 8], [d === 0 ? day : d, day], CLAMP);
  }
  if (frame >= tRewind) d = interpolate(frame, [tRewind, tRewind + 18], [14, 6], {...CLAMP, easing: (x) => x * x * (3 - 2 * x)});
  return d;
};

const DayStrip: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const d = dayAt(frame);
  const head = interpolate(frame, [D[0] - 6, D[0]], [0, 1], CLAMP);
  const rewound = interpolate(frame, [tRewind + 6, tRewind + 16], [0, 1], CLAMP);
  return (
    <div style={{position: 'absolute', left: STRIP_X, top: STRIP_Y, width: 14 * CELL + 13 * GAP, height: 86}}>
      {Array.from({length: 14}).map((_, i) => {
        const day = i + 1;
        const p = spring({frame: frame - tFourteen - i * 2, fps, config: {damping: 14, stiffness: 160}});
        const k = DAYS.indexOf(day);
        const lit = k >= 0 && frame >= D[k] + 2;
        const gone = day > 6 && k >= 0 ? rewound : 0;
        const isLast = day === 14;
        const col = isLast ? T.bad : day === 6 && frame >= tFlags ? T.hot : T.accent;
        return (
          <div
            key={day}
            style={{
              position: 'absolute', left: i * (CELL + GAP), top: 0, width: CELL, height: 86, borderRadius: 16,
              background: lit && !gone ? alpha(col, 0.16) : alpha('#FFFFFF', 0.04), border: `1px solid ${lit && !gone ? alpha(col, 0.6) : T.line}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0',
              transform: `scale(${p})`, opacity: p, fontFamily: BODY,
            }}
          >
            <div style={{fontWeight: 700, fontSize: 22, color: lit && !gone ? T.text : T.muted, fontVariantNumeric: 'tabular-nums'}}>{day}</div>
            <div
              style={{
                width: 14, height: 14, borderRadius: 14, background: col, opacity: lit ? 1 - gone * 0.8 : 0,
                boxShadow: `0 0 12px ${alpha(col, 0.9)}`, transform: `scale(${lit ? spring({frame: frame - D[Math.max(0, k)] - 2, fps, config: {damping: 10}}) : 0})`,
              }}
            />
          </div>
        );
      })}
      {d > 0 ? (
        <div
          style={{
            position: 'absolute', left: (d - 1) * (CELL + GAP) - 5, top: -5, width: CELL + 10, height: 96, borderRadius: 20,
            border: `3px solid ${frame >= tFlags ? T.hot : T.accent2}`, boxShadow: `0 0 24px ${alpha(frame >= tFlags ? T.hot : T.accent2, 0.6)}`, opacity: head,
          }}
        />
      ) : null}
    </div>
  );
};

const Counter: React.FC<{label: string; value: number; color: string; at: number; x: number}> = ({label, value, color, at: t, x}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - t, fps, config: {damping: 15, stiffness: 140}});
  return (
    <div
      style={{
        position: 'absolute', left: x, top: 0, width: (COL_W - 16) / 2, height: 150, borderRadius: 28, background: T.surface, border: `1px solid ${alpha(color, 0.45)}`,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px', fontFamily: BODY, opacity: p, transform: `translateY(${(1 - p) * 30}px)`,
        boxShadow: `0 20px 50px rgba(0,0,0,0.35), 0 0 30px ${alpha(color, 0.12)}`,
      }}
    >
      <div style={{fontWeight: 700, fontSize: 19, letterSpacing: '0.16em', color: T.muted}}>{label}</div>
      <div style={{fontFamily: T.display, fontWeight: 700, fontSize: 76, lineHeight: 1, color, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums'}}>{value}</div>
    </div>
  );
};

// What frontdesk AI would have sent the team on day 6.
const Alert: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - tFlags, fps, config: {damping: 14, stiffness: 140}});
  if (frame < tFlags - 1) return null;
  return (
    <div
      style={{
        position: 'absolute', left: COL_X, top: 566, width: COL_W, borderRadius: 32, padding: 28, background: `linear-gradient(160deg, ${alpha(T.hot, 0.18)}, ${alpha(T.hot, 0)} 60%), ${T.surface}`,
        border: `2px solid ${alpha(T.hot, 0.7)}`, boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 60px ${alpha(T.hot, 0.25)}`, fontFamily: BODY, zIndex: 20,
        opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * -60}px) scale(${0.9 + 0.1 * p})`,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 12, color: T.hot, fontWeight: 800, fontSize: 22, letterSpacing: '0.14em'}}>
        <Flame size={28} strokeWidth={2.6} /> READY BUYER · DAY 6
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 20}}>
        <Avatar name="Sarah K." tone={0} size={76} />
        <div style={{flex: 1}}>
          <div style={{fontWeight: 800, fontSize: 36, color: T.text, letterSpacing: '-0.02em'}}>Sarah K.</div>
          <div style={{fontWeight: 500, fontSize: 22, color: T.muted}}>Just downloaded the floor plans</div>
        </div>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 22}}>
        <div style={{flex: 1, height: 70, borderRadius: 999, background: T.hot, color: '#1A1203', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontWeight: 800, fontSize: 27}}>
          <PhoneCall size={28} strokeWidth={2.6} /> Call her today
        </div>
        <ScoreRing theme={T} value={84} size={96} start={tFlags + 6} color={T.hot} />
      </div>
    </div>
  );
};

export const IG02: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: frame - 4, fps, config: {damping: 18, stiffness: 90}});
  const press = interpolate(frame, [tClicks - 3, tClicks, tClicks + 4], [1, 0.94, 1], CLAMP);
  const rewound = frame >= tFlags - 2;
  // where she is on the site, day by day
  const scroll = rewound
    ? 1040
    : interpolate(frame, [D[1], D[1] + 26, D[2], D[2] + 26, D[3], D[3] + 26], [0, 420, 420, 1040, 1040, 1210], {...CLAMP, easing: (x) => x * x * (3 - 2 * x)});
  const glow = {
    ph42a: frame >= tPenthouse && frame < D[2] ? 1 : 0,
    floorplan: (frame >= tFloor && frame < D[3]) || rewound ? 1 : 0,
    pricing: frame >= tPayment && !rewound ? 1 : 0,
  };
  const signals = DAYS.slice(0, 4).filter((_, k) => frame >= D[k] + 2).length;
  const rowsBack = interpolate(frame, [tRewind + 6, tRewind + 16], [0, 1], CLAMP);
  const night = frame >= D[3] && frame < D[4] ? 1 : 0;
  return (
    <AbsoluteFill>
      <Stage theme={T}>
        <FadeOut at={tCatch - 14}>
          <DayStrip />
          <div style={{position: 'absolute', left: PX, top: PY, opacity: enter, transform: `translateY(${(1 - enter) * 200}px)`}}>
            <Phone width={PW} screenBg="#0D0E11">
              <Show to={tClicks + 8}>
                <MailScreen press={press} />
              </Show>
              <Show from={tClicks + 8} to={D[4]}>
                <SiteMobile variant="dark" scroll={scroll} glow={glow} time={night ? '11:04' : '9:41'} />
                {night ? <div style={{position: 'absolute', inset: 0, background: 'rgba(10,20,60,0.22)'}} /> : null}
              </Show>
              <Show from={D[4]} to={tFlags - 2}>
                <ConfirmScreen start={D[4] + 6} />
              </Show>
              <Show from={tFlags - 2}>
                <SiteMobile variant="dark" scroll={1040} glow={{floorplan: 1}} time="9:41" />
              </Show>
            </Phone>
          </div>
          <Tap x={sx(195)} y={sy(647)} at={tClicks} color={T.accent2} />
          <div style={{position: 'absolute', left: PX - 10, width: PW + 20, top: 980, display: 'flex', justifyContent: 'center', zIndex: 15}}>
            <Stamp theme={T} at={tSomewhere} text="BOOKED ELSEWHERE" size={40} exitAt={tRewind} />
          </div>

          {/* right column: the buyer, the counts, the diary */}
          <div style={{position: 'absolute', left: COL_X, top: PY, width: COL_W, height: 150, opacity: spring({frame: frame - 8, fps, config: {damping: 200}})}}>
            <div
              style={{
                height: 150, borderRadius: 28, background: T.surface, border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', gap: 18, padding: '0 24px',
                fontFamily: BODY, boxShadow: '0 20px 50px rgba(0,0,0,0.35)', opacity: frame >= tZero ? 0 : 1,
              }}
            >
              <Avatar name="Sarah K." tone={0} size={80} />
              <div>
                <div style={{fontWeight: 800, fontSize: 36, color: T.text}}>Sarah K.</div>
                <div style={{fontWeight: 500, fontSize: 22, color: T.muted}}>On your newsletter list</div>
              </div>
            </div>
          </div>
          <div style={{position: 'absolute', left: COL_X, top: PY, width: COL_W, height: 150, opacity: interpolate(frame, [tFlags - 6, tFlags + 2], [1, 0], CLAMP)}}>
            <Counter label="SIGNALS" value={signals} color={T.accent2} at={tZero} x={0} />
            <Counter label="FORM FILLS" value={0} color={T.bad} at={tZero + 6} x={(COL_W + 16) / 2} />
          </div>
          <div style={{position: 'absolute', left: COL_X, top: 738, display: 'flex', flexDirection: 'column', gap: 12}}>
            <LogRow theme={T} at={D[0] + 2} width={COL_W} size={27} icon={<Mail size={27} strokeWidth={2.4} />} title="Day 1 · Newsletter" sub="Clicked “View the penthouses”" dim={rowsBack * 0.6} />
            <LogRow theme={T} at={D[1] + 2} width={COL_W} size={27} icon={<Eye size={27} strokeWidth={2.4} />} title="Day 3 · Penthouse 42A" sub="6 minutes on the page" dim={rowsBack * 0.6} />
            <LogRow theme={T} at={D[2] + 2} width={COL_W} size={27} icon={<Download size={27} strokeWidth={2.4} />} title="Day 6 · Floor plans" sub="floor-plans-42A.pdf" color={frame >= tFlags ? T.hot : T.accent} active={frame >= tFlags ? 1 : 0} />
            <LogRow theme={T} at={D[3] + 2} width={COL_W} size={27} icon={<Moon size={27} strokeWidth={2.4} />} title="Day 9 · Payment plans" sub="11:04 PM, read twice" dim={rowsBack} />
            <LogRow theme={T} at={D[4] + 2} width={COL_W} size={27} icon={<CalendarX size={27} strokeWidth={2.4} />} title="Day 14 · Viewing booked" sub="With another developer" color={T.bad} dim={rowsBack} />
            <LogRow theme={T} at={tNobody} width={COL_W} size={27} icon={<PhoneOff size={27} strokeWidth={2.4} />} title="Calls from your team: 0" sub="Lead status: New" color={T.bad} meta="0" dim={rowsBack} />
          </div>
          <Alert />
          <RewindFx theme={T} at={tRewind} label="REWIND · DAY 6" y={1000} />
        </FadeOut>

        <SpokenHeadline theme={T} vo={vo} size={78} y={196} width={960} hideAfter={tCatch - 6} emph={['zero', 'form', 'fills.', 'else.', 'nobody', 'called.']} emph2={['6.', '14', 'flags']} />
        <Sequence from={tCatch - 6}>
          <EndCard theme={T} headline="Catch them on *day 6.*" ctaAt={tDM - tCatch + 4} />
        </Sequence>
      </Stage>
      <Soundtrack
        music="tech" musicVol={0.42} musicFrom={2} sfxScale={0.75}
        cues={[
          [4, 'whoosh', 0.2], [tFourteen, 'blips', 0.3], [tZero, 'impact', 0.25], [tClicks, 'click'], [D[0] + 2, 'pop'], [D[1] + 2, 'pop'], [D[2] + 2, 'pop'],
          [D[3] + 2, 'pop'], [D[4] + 2, 'pop'], [tSomewhere, 'impact', 0.35], [tNobody, 'blips', 0.25],
          [tRewind - 4, 'riser', 0.25], [tRewind, 'scan', 0.3], [tFlags, 'chime', 0.22], [tFlags + 6, 'pop'],
          [tCatch - 6, 'whoosh'], [tCatch + 10, 'sparkle'], [tDM, 'pop'],
        ]}
      />
    </AbsoluteFill>
  );
};
