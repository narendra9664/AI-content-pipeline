import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Check, Download, Flame, Phone as PhoneIcon, Tag} from 'lucide-react';
import {BODY, CLAMP, THEMES, alpha} from '../theme';
import {VOData, at} from '../vo';
import data from '../vo/ig03.json';
import {Stage} from '../kit/Stage';
import {SpokenHeadline} from '../kit/Text';
import {Chip, Rise} from '../kit/Misc';
import {Avatar, ScoreRing} from '../kit/Lead';
import {EndCard, FDMark} from '../kit/Logo';
import {Soundtrack} from '../kit/Audio';
import {FadeOut} from '../kit/Social';

// IG03 "3 signs a buyer is ready (none of them is a form)": an editorial listicle.
const T = THEMES.sand;
const vo = data as VOData;
export const IG03_FRAMES = Math.ceil(vo.duration * 30) + 60;
const w = (word: string, n = 1) => at(vo, word, n);
const SERIF = T.display;

const tNone = w('none');
const tForm = w('form.');
const tOne = w('one');
const tKeep = w('keep');
const tTwo = w('two');
const tDownload = w('download');
const tPlans = w('plans.');
const tThree = w('three', 1);
const tAsk = w('ask');
const tAll = w('all');
const tCall = w('call');
const tFD = w('frontdesk');
const tNever = w('never');
const tDM = w('dm');
const REVEAL = [tOne, tTwo, tThree];
const LABELS = ['Comes back', 'Floor plans', 'Asks to pay'];

const card: React.CSSProperties = {
  background: T.surface, border: `1px solid ${T.line}`, borderRadius: 40, boxShadow: '0 30px 80px rgba(20,33,61,0.12)', fontFamily: BODY,
};

const Slots: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{position: 'absolute', left: 70, top: 470, display: 'flex', gap: 20}}>
      {[0, 1, 2].map((i) => {
        const enter = spring({frame: frame - 14 - i * 5, fps, config: {damping: 16, stiffness: 130}});
        const on = spring({frame: frame - REVEAL[i], fps, config: {damping: 14, stiffness: 150}});
        const tick = spring({frame: frame - (tAll + 4 + i * 7), fps, config: {damping: 11, stiffness: 180}});
        const filled = frame >= REVEAL[i];
        return (
          <div
            key={i}
            style={{
              position: 'relative', width: 300, height: 140, borderRadius: 32, display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px',
              background: filled ? T.accent : alpha('#FFFFFF', 0.55), border: filled ? `1px solid ${T.accent}` : `2px dashed ${alpha(T.accent, 0.3)}`,
              boxShadow: filled ? `0 ${20 * on}px ${50 * on}px rgba(20,33,61,0.22)` : undefined,
              opacity: enter, transform: `translateY(${(1 - enter) * 30}px) scale(${filled ? 0.94 + 0.06 * on : 1})`,
            }}
          >
            <div style={{fontFamily: SERIF, fontSize: 104, lineHeight: 1, color: filled ? T.accent2 : alpha(T.accent, 0.35), fontStyle: 'italic', width: 60, textAlign: 'center'}}>{i + 1}</div>
            <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 30, lineHeight: 1.12, color: '#FFFFFF', opacity: filled ? on : 0}}>{LABELS[i]}</div>
            {frame >= tAll + 4 + i * 7 ? (
              <div
                style={{
                  position: 'absolute', right: -12, top: -12, width: 52, height: 52, borderRadius: 52, background: T.good, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${tick})`, boxShadow: '0 8px 20px rgba(42,127,98,0.4)',
                }}
              >
                <Check size={32} strokeWidth={3.4} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

// Scene 0: the contact form, crossed out.
const FormCard: React.FC = () => {
  const frame = useCurrentFrame();
  const x1 = interpolate(frame, [tForm, tForm + 8], [0, 1], CLAMP);
  const x2 = interpolate(frame, [tForm + 6, tForm + 14], [0, 1], CLAMP);
  const field = (label: string, h = 84) => (
    <div style={{marginTop: 26}}>
      <div style={{fontSize: 24, fontWeight: 700, letterSpacing: '0.12em', color: T.muted}}>{label}</div>
      <div style={{height: h, marginTop: 12, borderRadius: 20, border: `1.5px solid ${T.line}`, background: T.surface2}} />
    </div>
  );
  return (
    <div style={{...card, position: 'relative', width: 860, padding: '52px 60px', opacity: 1 - x2 * 0.35}}>
      <div style={{fontFamily: SERIF, fontSize: 68, color: T.text}}>Contact us</div>
      {field('NAME')}
      {field('EMAIL')}
      {field('MESSAGE', 150)}
      <div style={{marginTop: 34, height: 96, borderRadius: 999, background: T.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 34}}>Submit</div>
      <svg width="100%" height="100%" viewBox="0 0 860 840" preserveAspectRatio="none" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <path d="M 110 130 L 750 720" stroke={T.bad} strokeWidth={26} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - x1} />
        <path d="M 750 130 L 110 720" stroke={T.bad} strokeWidth={26} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - x2} />
      </svg>
    </div>
  );
};

// Scene 1: a week of visits.
const VISITS: [number, number][] = [[0, tKeep], [2, tKeep + 9], [3, tKeep + 18], [3, tKeep + 27]];
const WeekCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = VISITS.filter(([, t]) => frame >= t).length;
  const bump = VISITS.reduce((m, [, t]) => Math.max(m, interpolate(frame, [t, t + 3, t + 10], [0, 1, 0], CLAMP)), 0);
  return (
    <div style={{...card, width: 940, padding: '48px 50px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <div style={{fontSize: 25, fontWeight: 700, letterSpacing: '0.14em', color: T.muted}}>PENTHOUSE 42A · THIS WEEK</div>
          <div style={{fontFamily: SERIF, fontSize: 70, color: T.text, marginTop: 8}}>Sarah K. is back</div>
        </div>
        <div style={{fontFamily: SERIF, fontSize: 150, lineHeight: 1, color: T.accent2, transform: `scale(${1 + bump * 0.15})`}}>×{n}</div>
      </div>
      <div style={{display: 'flex', gap: 14, marginTop: 36}}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
          const vs = VISITS.filter(([day]) => day === i);
          const any = vs.some(([, t]) => frame >= t);
          return (
            <div key={i} style={{flex: 1, height: 300, borderRadius: 26, background: any ? alpha(T.accent2, 0.14) : T.surface2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '22px 0'}}>
              <div style={{fontWeight: 800, fontSize: 30, color: T.muted}}>{d}</div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                {vs.map(([, t], k) => {
                  const p = spring({frame: frame - t, fps, config: {damping: 10, stiffness: 180}});
                  return <div key={k} style={{width: 54, height: 54, borderRadius: 54, background: T.accent2, transform: `scale(${p})`, boxShadow: `0 0 20px ${alpha(T.accent2, 0.7)}`}} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Scene 2: the floor plan draws itself while the PDF downloads.
const PlanCard: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [tTwo + 6, tPlans + 6], [0, 1], {...CLAMP, easing: (x) => 1 - Math.pow(1 - x, 2)});
  const dl = interpolate(frame, [tDownload, tPlans + 4], [0, 1], CLAMP);
  const done = dl >= 1;
  return (
    <div style={{...card, width: 940, padding: '46px 50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
      <svg width={800} height={550} viewBox="0 0 160 110" fill="none" stroke={T.accent} strokeWidth={1.4} strokeLinecap="round">
        <rect x="4" y="4" width="152" height="102" rx="2" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
        <path d="M60 4 V58 M60 76 V106 M4 58 H44 M60 58 H100 M100 4 V40 M100 58 V106 M118 58 H156 M100 40 H156" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - Math.max(0, draw * 1.3 - 0.3)} />
        <path d="M44 58 A16 16 0 0 1 60 42" strokeDasharray="2 2" opacity={draw} />
        <rect x="12" y="66" width="36" height="30" rx="2" stroke={T.accent2} opacity={draw} />
        <rect x="110" y="70" width="36" height="26" rx="4" stroke={T.accent2} opacity={draw} />
        <text x="30" y="34" fill={T.muted} stroke="none" fontSize="7" fontFamily="Inter" opacity={draw}>Living</text>
        <text x="112" y="28" fill={T.muted} stroke="none" fontSize="7" fontFamily="Inter" opacity={draw}>Terrace</text>
      </svg>
      <div style={{width: '100%', display: 'flex', alignItems: 'center', gap: 24, padding: '24px 30px', borderRadius: 28, background: T.surface2}}>
        <div style={{width: 80, height: 80, borderRadius: 22, background: done ? T.good : T.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {done ? <Check size={44} strokeWidth={3} /> : <Download size={42} strokeWidth={2.6} />}
        </div>
        <div style={{flex: 1}}>
          <div style={{fontWeight: 800, fontSize: 36, color: T.text}}>floor-plans-42A.pdf</div>
          <div style={{height: 12, borderRadius: 12, background: alpha(T.accent, 0.12), marginTop: 14, overflow: 'hidden'}}>
            <div style={{width: `${dl * 100}%`, height: '100%', background: done ? T.good : T.accent2}} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Scene 3: the question that means money.
const AskCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const typing = frame < tAsk + 4;
  const p = spring({frame: frame - tAsk - 4, fps, config: {damping: 15, stiffness: 150}});
  return (
    <div style={{width: 940, display: 'flex', flexDirection: 'column', gap: 44, alignItems: 'flex-start'}}>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 20}}>
        <Avatar name="Sarah K." tone={0} size={116} />
        <div
          style={{
            ...card, borderRadius: 48, borderBottomLeftRadius: 12, padding: typing ? '42px 48px' : '40px 48px', maxWidth: 790,
            fontSize: 56, fontWeight: 600, lineHeight: 1.22, color: T.text,
          }}
        >
          {typing ? (
            <div style={{display: 'flex', gap: 12}}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{width: 22, height: 22, borderRadius: 22, background: T.muted, opacity: 0.35 + 0.65 * Math.max(0, Math.sin((frame - i * 4) / 4))}} />
              ))}
            </div>
          ) : (
            <span style={{opacity: Math.min(1, p * 1.5)}}>
              What does the <span style={{color: T.accent2, fontWeight: 800}}>payment plan</span> look like for 42A?
            </span>
          )}
        </div>
      </div>
      <div style={{alignSelf: 'center'}}>
        <Rise at={tAsk + 16} dy={30}>
          <Chip theme={T} icon={<Tag size={42} strokeWidth={2.4} />} text="Money question" meta="· budget is real" color={T.accent2} size={46} />
        </Rise>
      </div>
    </div>
  );
};

// Scene 4: call today (a phone that rings).
const CallCard: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = Math.sin(frame * 1.6) * 7 * (Math.floor((frame - tCall) / 12) % 2 === 0 ? 1 : 0.2);
  return (
    <div style={{...card, width: 940, padding: '60px 56px', display: 'flex', alignItems: 'center', gap: 44}}>
      <div style={{position: 'relative', width: 200, height: 200, flexShrink: 0}}>
        {[0, 1, 2].map((i) => {
          const r = (((frame - tCall - i * 10) % 30) + 30) % 30 / 30;
          return <div key={i} style={{position: 'absolute', inset: -40 * r, borderRadius: '50%', border: `3px solid ${alpha(T.good, 0.6 * (1 - r))}`}} />;
        })}
        <div style={{position: 'absolute', inset: 0, borderRadius: 150, background: T.good, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${shake}deg)`}}>
          <PhoneIcon size={92} strokeWidth={2.4} />
        </div>
      </div>
      <div>
        <div style={{fontSize: 28, fontWeight: 700, letterSpacing: '0.14em', color: T.good}}>3 OF 3 SIGNS</div>
        <div style={{fontFamily: SERIF, fontSize: 84, lineHeight: 1, color: T.text, marginTop: 10}}>Call Sarah today.</div>
        <div style={{fontSize: 34, fontWeight: 600, color: T.muted, marginTop: 12}}>Not next week.</div>
      </div>
    </div>
  );
};

// Scene 5: the flag.
const FlagCard: React.FC = () => (
  <div style={{...card, width: 940, padding: '52px 54px', border: `2px solid ${alpha(T.accent2, 0.7)}`, boxShadow: `0 30px 80px ${alpha(T.accent2, 0.22)}`}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <FDMark size={54} color={T.accent} color2={T.accent2} />
      <div style={{fontWeight: 800, fontSize: 30, letterSpacing: '0.12em', color: T.accent}}>FRONTDESK AI · NOW</div>
    </div>
    <div style={{display: 'flex', alignItems: 'center', gap: 30, marginTop: 40}}>
      <div style={{flex: 1}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, color: T.bad, fontWeight: 800, fontSize: 30, letterSpacing: '0.1em'}}>
          <Flame size={34} strokeWidth={2.6} /> READY BUYER
        </div>
        <div style={{fontFamily: SERIF, fontSize: 96, lineHeight: 1, color: T.text, marginTop: 12}}>Sarah K.</div>
        <div style={{fontSize: 31, fontWeight: 600, color: T.muted, marginTop: 14, lineHeight: 1.3}}>Back 4×, floor plans,<br />payment plans</div>
      </div>
      <ScoreRing theme={T} value={92} size={240} start={tFD + 8} color={T.accent2} label="INTENT" />
    </div>
  </div>
);

const Scene: React.FC<{from: number; to: number; children: React.ReactNode}> = ({from, to, children}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 650, height: 840, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <Rise at={from} exitAt={to} dy={70}>
      {children}
    </Rise>
  </div>
);

export const IG03: React.FC = () => (
  <AbsoluteFill>
    <Stage theme={T}>
      <FadeOut at={tNever - 14}>
        <Slots />
        <Scene from={tNone - 4} to={tOne - 8}>
          <FormCard />
        </Scene>
        <Scene from={tOne + 4} to={tTwo - 8}>
          <WeekCard />
        </Scene>
        <Scene from={tTwo + 4} to={tThree - 8}>
          <PlanCard />
        </Scene>
        <Scene from={tThree + 4} to={tAll - 6}>
          <AskCard />
        </Scene>
        <Scene from={tCall - 6} to={tFD - 8}>
          <CallCard />
        </Scene>
        <Scene from={tFD - 2} to={tNever - 14}>
          <FlagCard />
        </Scene>
      </FadeOut>
      <SpokenHeadline theme={T} vo={vo} size={90} y={196} width={960} hideAfter={tNever - 6} emph={['ready.', 'form.', 'back.', 'floor', 'plans.', 'pay.', 'today.']} emph2={['one:', 'two:', 'three:']} italicAccent />
      <Sequence from={tNever - 6}>
        <EndCard theme={T} headline="Never miss a *ready* buyer." ctaAt={tDM - tNever + 4} italicAccent headSize={116} />
      </Sequence>
    </Stage>
    <Soundtrack
      music="luxury" musicVol={0.75} musicFrom={6} sfxScale={0.7}
      cues={[
        [6, 'whoosh', 0.2], [14, 'pop', 0.2], [tNone - 4, 'whoosh', 0.2], [tForm, 'impact', 0.3], [tOne, 'pop'], [tKeep, 'blips', 0.3],
        [tTwo, 'pop'], [tDownload, 'scan', 0.25], [tPlans + 4, 'chime', 0.18], [tThree, 'pop'], [tAsk - 6, 'typing', 0.3], [tAsk + 4, 'send', 0.4],
        [tAll + 4, 'click', 0.5], [tAll + 11, 'click', 0.5], [tAll + 18, 'click', 0.5], [tCall - 6, 'whoosh', 0.2], [tCall, 'blips', 0.35],
        [tFD - 2, 'sparkle', 0.7], [tFD + 8, 'chime', 0.2], [tNever - 6, 'whoosh'], [tNever + 10, 'sparkle'], [tDM, 'pop'],
      ]}
    />
  </AbsoluteFill>
);
