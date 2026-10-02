import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CalendarCheck, FastForward, Flame, History, Inbox, MessageCircle, Send, UserRound} from 'lucide-react';
import {BODY, CLAMP, THEMES, alpha} from '../theme';
import {VOData, at} from '../vo';
import data from '../vo/ig06.json';
import {Stage} from '../kit/Stage';
import {SpokenHeadline} from '../kit/Text';
import {EndCard} from '../kit/Logo';
import {Soundtrack} from '../kit/Audio';
import {FadeOut, LogRow, Ring} from '../kit/Social';

// IG06 "The first 60 seconds after a buyer enquires": a stopwatch speed-run.
const T = THEMES.volt;
const vo = data as VOData;
export const IG06_FRAMES = Math.ceil(vo.duration * 30) + 60;
const w = (word: string, n = 1) => at(vo, word, n);

const tEnquiry = w('enquiry');
const tHistory = w('history');
const tScored = w('scored');
const tHot = w('hot.', 1);
const tPersonal = w('personal');
const tAgent = w('agent');
const tShe = w('she');
const tViewing = w('viewing');
const tAnswer = w('answer');
const tDM = w('dm');

// Stopwatch seconds at each step (the run is sped up; the badge says so).
const KEYS: [number, number][] = [[tEnquiry, 1], [tHistory, 3], [tScored, 5], [tPersonal, 8], [tAgent, 15], [tShe, 41], [tViewing, 52]];
const secondsAt = (f: number) => (f < tEnquiry - 10 ? 0 : interpolate(f, [tEnquiry - 10, ...KEYS.map((k) => k[0])], [0, ...KEYS.map((k) => k[1])], CLAMP));

const Stopwatch: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: frame - 4, fps, config: {damping: 16, stiffness: 100}});
  const s = secondsAt(frame);
  const done = frame >= tViewing;
  const burst = spring({frame: frame - tViewing, fps, config: {damping: 9, stiffness: 160}});
  const ticks = Array.from({length: 60});
  return (
    <div style={{position: 'absolute', left: 540 - 260, top: 410, width: 520, height: 520, opacity: enter, transform: `scale(${(0.8 + 0.2 * enter) * (done ? 1 + 0.04 * Math.sin(Math.PI * Math.min(1, burst)) : 1)})`}}>
      <svg width={520} height={520} style={{position: 'absolute', inset: 0}}>
        {ticks.map((_, i) => {
          const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
          const big = i % 5 === 0;
          const r1 = 254;
          const r2 = big ? 232 : 242;
          const lit = i <= s;
          return (
            <line
              key={i} x1={260 + Math.cos(a) * r1} y1={260 + Math.sin(a) * r1} x2={260 + Math.cos(a) * r2} y2={260 + Math.sin(a) * r2}
              stroke={lit && s > 0 ? T.accent : alpha('#FFFFFF', 0.18)} strokeWidth={big ? 4 : 2} strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div style={{position: 'absolute', left: 45, top: 45}}>
        <Ring size={430} stroke={22} p={s / 60} color={T.accent} track={alpha(T.accent, 0.1)} glow={0.9}>
          <div style={{fontFamily: T.display, fontWeight: 700, fontSize: 160, lineHeight: 1, color: T.text, letterSpacing: '-0.05em', fontVariantNumeric: 'tabular-nums'}}>
            0:{String(Math.floor(s)).padStart(2, '0')}
          </div>
          <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 23, letterSpacing: '0.18em', color: done ? T.accent : T.muted, marginTop: 12}}>
            {done ? 'VIEWING BOOKED' : 'SINCE ENQUIRY'}
          </div>
        </Ring>
      </div>
    </div>
  );
};

const IC = 32;
const STEPS: {at: number; icon: React.ReactNode; title: string; sub: string; sec: number}[] = [
  {at: tEnquiry, icon: <Inbox size={IC} strokeWidth={2.4} />, title: 'Enquiry lands', sub: 'Sarah K. · Penthouse 42A', sec: 1},
  {at: tHistory, icon: <History size={IC} strokeWidth={2.4} />, title: 'History loaded', sub: '4 visits · floor plans', sec: 3},
  {at: tScored, icon: <Flame size={IC} strokeWidth={2.4} />, title: 'Scored 88 · Hot', sub: 'Top of today’s list', sec: 5},
  {at: tPersonal, icon: <Send size={IC} strokeWidth={2.4} />, title: 'Personal reply sent', sub: 'About the 42A terrace, not a template', sec: 8},
  {at: tAgent, icon: <UserRound size={IC} strokeWidth={2.4} />, title: 'Agent briefed', sub: 'Maya: she prefers evenings', sec: 15},
  {at: tShe, icon: <MessageCircle size={IC} strokeWidth={2.4} />, title: 'Sarah replies', sub: '“Saturday works!”', sec: 41},
  {at: tViewing, icon: <CalendarCheck size={IC} strokeWidth={2.4} />, title: 'Viewing booked', sub: 'Saturday, 11:00 AM', sec: 52},
];
const ROW = 110; // row pitch in the log
const VISIBLE = 4;

// The log keeps the newest four steps in view, scrolling older ones up and out.
const Log: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const latest = STEPS.reduce((k, s, i) => (frame >= s.at ? i : k), -1);
  let offset = 0;
  STEPS.forEach((s, i) => {
    if (i >= VISIBLE) offset += spring({frame: frame - s.at, fps, config: {damping: 18, stiffness: 120}}) * ROW;
  });
  return (
    <div
      style={{
        position: 'absolute', left: 70, top: 994, width: 940, height: VISIBLE * ROW, overflow: 'hidden',
        WebkitMaskImage: 'linear-gradient(180deg, transparent 0, black 26px, black 100%)', maskImage: 'linear-gradient(180deg, transparent 0, black 26px, black 100%)',
      }}
    >
      <div style={{position: 'absolute', left: 0, top: 8 - offset, display: 'flex', flexDirection: 'column', gap: ROW - 98}}>
        {STEPS.map((s, i) => (
          <div key={s.title} style={{height: 98, display: 'flex', alignItems: 'center'}}>
            <LogRow
              theme={T} at={s.at} width={940} size={32} icon={s.icon} title={s.title} sub={s.sub}
              meta={`0:${String(s.sec).padStart(2, '0')}`} active={i === latest ? 1 : 0} dim={latest - i >= 2 ? 0.45 : 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const IG06: React.FC = () => {
  const frame = useCurrentFrame();
  const badge = interpolate(frame, [tEnquiry - 6, tEnquiry + 6], [0, 1], CLAMP);
  return (
    <AbsoluteFill>
      <Stage theme={T}>
        <FadeOut at={tAnswer - 14}>
          <Stopwatch />
          <div style={{position: 'absolute', right: 56, top: 420, opacity: badge, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999, border: `1px solid ${alpha(T.accent, 0.5)}`, color: T.accent, fontFamily: BODY, fontWeight: 800, fontSize: 20, letterSpacing: '0.12em'}}>
            <FastForward size={20} strokeWidth={2.6} /> SPED UP
          </div>
          <Log />
        </FadeOut>
        <SpokenHeadline theme={T} vo={vo} size={78} y={196} width={960} hideAfter={tAnswer - 6} emph={['60', 'seconds', 'hot.', 'personal', 'brief.', 'booked.']} emph2={[]} />
        <Sequence from={tAnswer - 6}>
          <EndCard theme={T} headline="Answer while they're *hot.*" ctaAt={tDM - tAnswer + 4} />
        </Sequence>
      </Stage>
      <Soundtrack
        music="tech" musicVol={0.42} musicFrom={30} sfxScale={0.75}
        cues={[
          [4, 'whoosh', 0.22], [tEnquiry - 10, 'riser', 0.2], ...STEPS.map((s) => [s.at, 'pop'] as [number, 'pop']),
          [tHistory + 4, 'scan', 0.25], [tHot, 'impact', 0.25], [tPersonal + 4, 'send', 0.4], [tShe + 2, 'chime', 0.15], [tViewing + 2, 'sparkle', 0.8],
          [tAnswer - 6, 'whoosh'], [tAnswer + 10, 'sparkle'], [tDM, 'pop'],
        ]}
      />
    </AbsoluteFill>
  );
};
