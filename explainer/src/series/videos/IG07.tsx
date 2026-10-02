import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CheckCheck, Zap} from 'lucide-react';
import {BODY, CLAMP, THEMES, alpha} from '../theme';
import {VOData, at} from '../vo';
import data from '../vo/ig07.json';
import {Stage} from '../kit/Stage';
import {SpokenHeadline} from '../kit/Text';
import {Strike} from '../kit/Misc';
import {EndCard} from '../kit/Logo';
import {Soundtrack} from '../kit/Audio';
import {FadeOut} from '../kit/Social';

// IG07 "Anatomy of a follow-up that books the viewing": one message, five annotated parts.
const T = THEMES.ivory;
const vo = data as VOData;
export const IG07_FRAMES = Math.ceil(vo.duration * 30) + 60;
const w = (word: string, n = 1) => at(vo, word, n);
const SERIF = T.display;

const tHer = w('her');
const tNot = w('not');
const tExact = w('exact');
const tSomething = w('something');
const tTwo = w('two');
const tReal = w('real');
const tSent = w('sent');
const tSave = w('save');
const tDM = w('dm');
const MARKS = [tHer, tExact, tSomething, tTwo, tReal];

const Mark: React.FC<{n: number; children: React.ReactNode}> = ({n, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = MARKS[n - 1];
  const p = interpolate(frame, [t, t + 12], [0, 1], {...CLAMP, easing: (x) => 1 - Math.pow(1 - x, 2)});
  const badge = spring({frame: frame - t - 6, fps, config: {damping: 11, stiffness: 180}});
  const live = frame >= t && frame < (MARKS[n] ?? tSent);
  return (
    <span style={{position: 'relative'}}>
      <span
        style={{
          backgroundImage: `linear-gradient(${alpha(T.accent, live ? 0.42 : 0.24)}, ${alpha(T.accent, live ? 0.42 : 0.24)})`,
          backgroundSize: `${p * 100}% 78%`, backgroundPosition: '0 70%', backgroundRepeat: 'no-repeat', borderRadius: 6, padding: '0 2px',
          WebkitBoxDecorationBreak: 'clone', boxDecorationBreak: 'clone',
        }}
      >
        {children}
      </span>
      {frame >= t ? (
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 40, marginLeft: 8, verticalAlign: 'super',
            background: T.accent2, color: '#fff', fontFamily: BODY, fontWeight: 800, fontSize: 22, transform: `scale(${badge})`, lineHeight: 1,
          }}
        >
          {n}
        </span>
      ) : null}
    </span>
  );
};

const MessageCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: frame - 6, fps, config: {damping: 18, stiffness: 100}});
  const dear = spring({frame: frame - tNot + 2, fps, config: {damping: 14, stiffness: 150}});
  const dearOut = interpolate(frame, [tExact - 8, tExact], [0, 1], CLAMP);
  const sent = spring({frame: frame - tSent, fps, config: {damping: 14, stiffness: 150}});
  return (
    <div
      style={{
        position: 'absolute', left: 70, top: 428, width: 940, borderRadius: 44, background: T.surface, border: `1px solid ${T.line}`,
        boxShadow: '0 40px 100px rgba(60,45,20,0.14)', padding: '34px 44px 30px', fontFamily: BODY,
        opacity: enter, transform: `translateY(${(1 - enter) * 80}px)`,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 22, borderBottom: `1px solid ${T.line}`}}>
        <div style={{width: 64, height: 64, borderRadius: 64, background: T.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 38}}>M</div>
        <div style={{flex: 1}}>
          <div style={{fontWeight: 800, fontSize: 30, color: T.text}}>Maya · VELORIA</div>
          <div style={{fontWeight: 500, fontSize: 22, color: T.muted}}>to Sarah K. · WhatsApp</div>
        </div>
        <div style={{opacity: sent, transform: `scale(${0.7 + 0.3 * sent})`, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 999, background: T.accent2, color: '#fff', fontWeight: 800, fontSize: 24}}>
          <Zap size={24} strokeWidth={2.6} /> Sent · 0:08
        </div>
      </div>
      <div style={{position: 'relative', fontSize: 37, fontWeight: 500, lineHeight: 1.42, color: T.text, marginTop: 26, display: 'flex', flexDirection: 'column', gap: 18}}>
        <div style={{position: 'absolute', right: 0, top: -6, opacity: dear * (1 - dearOut), transform: `rotate(4deg) scale(${0.8 + 0.2 * dear})`, padding: '8px 18px', borderRadius: 14, border: `2px dashed ${alpha(T.bad, 0.6)}`, color: T.bad, fontWeight: 700, fontSize: 30, background: alpha(T.bad, 0.06)}}>
          <Strike at={tNot + 10} color={T.bad} thickness={5}>
            Dear customer,
          </Strike>
        </div>
        <div>
          <Mark n={1}>Hi Sarah,</Mark>
        </div>
        <div>
          <Mark n={2}>Penthouse 42A</Mark> is still available, and its terrace catches the evening sun.
        </div>
        <div>
          I’ve added <Mark n={3}>the terrace measurements</Mark> to the floor plans for you.
        </div>
        <div>
          Would <Mark n={4}>Thursday 6 PM or Saturday 11 AM</Mark> suit you for a private viewing?
        </div>
        <div style={{fontWeight: 700}}>
          <Mark n={5}>Maya, VELORIA</Mark>
        </div>
      </div>
      <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 14, color: T.muted, fontSize: 22, fontWeight: 600, opacity: sent}}>
        8 seconds after her enquiry <CheckCheck size={26} color={T.accent2} strokeWidth={2.4} />
      </div>
    </div>
  );
};

const LIST: [string, string][] = [
  ['Her name', 'Never “Dear customer”'],
  ['The exact unit', 'Penthouse 42A, not “our project”'],
  ['A useful extra', 'Based on what she looked at'],
  ['Two clear times', 'Not “let me know”'],
  ['A real person', 'Maya, not “Team VELORIA”'],
];

const Checklist: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{position: 'absolute', left: 70, top: 1190, width: 940, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
      {LIST.map(([title, sub], i) => {
        const t = MARKS[i] + 8;
        const p = spring({frame: frame - t, fps, config: {damping: 16, stiffness: 140}});
        if (frame < t - 1) return <div key={title} />;
        return (
          <div
            key={title}
            style={{
              gridColumn: i === 4 ? '1 / span 2' : undefined, display: 'flex', alignItems: 'center', gap: 18, padding: '20px 22px', borderRadius: 28,
              background: T.surface, border: `1px solid ${T.line}`, boxShadow: '0 16px 40px rgba(60,45,20,0.08)', fontFamily: BODY,
              opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 30}px)`,
            }}
          >
            <div style={{width: 58, height: 58, borderRadius: 58, background: T.accent2, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 30, flexShrink: 0}}>{i + 1}</div>
            <div style={{minWidth: 0}}>
              <div style={{fontFamily: SERIF, fontSize: 46, lineHeight: 1, color: T.text}}>{title}</div>
              <div style={{fontSize: 23, fontWeight: 600, color: T.muted, marginTop: 6, whiteSpace: 'nowrap'}}>{sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const IG07: React.FC = () => (
  <AbsoluteFill>
    <Stage theme={T}>
      <FadeOut at={tSave - 14}>
        <MessageCard />
        <Checklist />
      </FadeOut>
      <SpokenHeadline theme={T} vo={vo} size={86} y={190} width={960} hideAfter={tSave - 6} emph={['anatomy', 'name.', 'exact', 'unit', 'useful,', 'two', 'times', 'real', 'person', 'seconds.']} emph2={[]} italicAccent />
      <Sequence from={tSave - 6}>
        <EndCard theme={T} headline="Save this for your *next reply.*" ctaAt={tDM - tSave + 4} italicAccent headSize={112} />
      </Sequence>
    </Stage>
    <Soundtrack
      music="luxury" musicVol={0.75} musicFrom={14} sfxScale={0.7}
      cues={[
        [6, 'whoosh', 0.22], ...MARKS.map((t) => [t, 'pop'] as [number, 'pop']), ...MARKS.map((t) => [t + 8, 'click', 0.35] as [number, 'click', number]),
        [tNot + 10, 'whoosh', 0.18], [tSent, 'send', 0.45], [tSent + 4, 'chime', 0.18],
        [tSave - 6, 'whoosh'], [tSave + 10, 'sparkle'], [tDM, 'pop'],
      ]}
    />
  </AbsoluteFill>
);
