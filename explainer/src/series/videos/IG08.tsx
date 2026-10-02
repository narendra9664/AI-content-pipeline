import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Download, Moon, PhoneCall, Quote, Repeat, Tag} from 'lucide-react';
import {BODY, CLAMP, THEMES, alpha} from '../theme';
import {VOData, at} from '../vo';
import data from '../vo/ig08.json';
import {Stage} from '../kit/Stage';
import {SpokenHeadline} from '../kit/Text';
import {Strike} from '../kit/Misc';
import {Avatar, ScoreRing} from '../kit/Lead';
import {EndCard, FDMark} from '../kit/Logo';
import {Soundtrack} from '../kit/Audio';
import {FadeOut, LogRow} from '../kit/Social';

// IG08 "Never ask 'So, what are you looking for?' again": the pre-call brief.
const T = THEMES.teal;
const vo = data as VOData;
export const IG08_FRAMES = Math.ceil(vo.duration * 30) + 60;
const w = (word: string, n = 1) => at(vo, word, n);

const tSo = w('so');
const tFor = w('for');
const tThey = w('they', 1);
const tJust = w('just');
const tFour = w('4');
const tFloor = w('floor');
const tPayment = w('payment');
const tAlways = w('always');
const tFD = w('frontdesk');
const tOpen = w('open');
const tDM = w('dm');

// The agent's call, with the question that wastes it.
const CallCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: frame - 4, fps, config: {damping: 16, stiffness: 110}});
  const small = interpolate(frame, [tFour - 10, tFour + 6], [0, 1], {...CLAMP, easing: (x) => x * x * (3 - 2 * x)});
  const secs = Math.max(0, Math.floor((frame - 6) / 30));
  const q = spring({frame: frame - tSo + 2, fps, config: {damping: 15, stiffness: 150}});
  return (
    <div style={{position: 'absolute', left: 70, top: 440, width: 940, transformOrigin: '50% 0', transform: `scale(${1 - small * 0.12}) translateY(${(1 - enter) * 60 - small * 30}px)`, opacity: enter * (1 - small * 0.45)}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '26px 30px', borderRadius: 36, background: T.surface, border: `1px solid ${T.line}`, boxShadow: '0 30px 80px rgba(0,0,0,0.4)', fontFamily: BODY}}>
        <Avatar name="Sarah K." tone={0} size={92} />
        <div style={{flex: 1}}>
          <div style={{fontWeight: 800, fontSize: 38, color: T.text}}>Sarah K.</div>
          <div style={{fontWeight: 600, fontSize: 24, color: T.good, fontVariantNumeric: 'tabular-nums'}}>Calling · 00:{String(secs).padStart(2, '0')}</div>
        </div>
        <div style={{width: 84, height: 84, borderRadius: 84, background: '#E5484D', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(135deg)'}}>
          <PhoneCall size={40} strokeWidth={2.4} />
        </div>
      </div>
      <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 22, opacity: q, transform: `translateY(${(1 - q) * 20}px)`}}>
        <div style={{maxWidth: 760, padding: '24px 32px', borderRadius: 34, borderBottomRightRadius: 8, background: T.accent, color: T.onAccent, fontFamily: BODY, fontWeight: 700, fontSize: 40, lineHeight: 1.25}}>
          <Strike at={tThey - 4} color={T.bad} thickness={7}>
            So, what are you looking for?
          </Strike>
        </div>
      </div>
    </div>
  );
};

const BriefCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: frame - tFour + 4, fps, config: {damping: 16, stiffness: 110}});
  const head = interpolate(frame, [tFD - 4, tFD + 8], [0, 1], CLAMP);
  const opener = spring({frame: frame - tFD - 16, fps, config: {damping: 15, stiffness: 140}});
  const glow = interpolate(frame, [tOpen - 4, tOpen + 8], [0, 1], CLAMP);
  if (frame < tFour - 6) return null;
  return (
    <div style={{position: 'absolute', left: 70, top: 700, width: 940, opacity: enter, transform: `translateY(${(1 - enter) * 80}px)`}}>
      <div
        style={{
          borderRadius: 40, padding: '30px 30px 34px', background: T.surface2, border: `1.5px solid ${alpha(T.accent, 0.3 + 0.4 * head)}`,
          boxShadow: `0 40px 100px rgba(0,0,0,0.45), 0 0 ${60 * head}px ${alpha(T.accent, 0.2 * head)}`, fontFamily: BODY,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 16, height: 70}}>
          <div style={{opacity: head, display: 'flex', alignItems: 'center', gap: 14, flex: 1}}>
            <FDMark size={46} color={T.accent} color2={T.accent2} />
            <div>
              <div style={{fontWeight: 800, fontSize: 24, letterSpacing: '0.14em', color: T.accent}}>PRE-CALL BRIEF</div>
              <div style={{fontWeight: 700, fontSize: 30, color: T.text}}>Sarah K. · Penthouse 42A</div>
            </div>
          </div>
          <div style={{opacity: 1 - head, flex: head >= 1 ? 0 : 1, fontWeight: 800, fontSize: 24, letterSpacing: '0.14em', color: T.muted}}>WHAT SHE DID</div>
          <div style={{opacity: head}}>
            <ScoreRing theme={T} value={92} size={96} start={tFD + 4} color={T.hot} />
          </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 22}}>
          <LogRow theme={T} at={tFour} width={880} size={32} icon={<Repeat size={32} strokeWidth={2.4} />} title="4 visits to Penthouse 42A" sub="Last one yesterday" color={T.accent} />
          <LogRow theme={T} at={tFloor} width={880} size={32} icon={<Download size={32} strokeWidth={2.4} />} title="Downloaded the floor plans" sub="Spent longest on the terrace" color={T.accent} />
          <LogRow theme={T} at={tPayment} width={880} size={32} icon={<Tag size={32} strokeWidth={2.4} />} title="Read the payment plans" sub="Twice" color={T.hot} />
          <LogRow theme={T} at={tAlways} width={880} size={32} icon={<Moon size={32} strokeWidth={2.4} />} title="Always browses after 8 PM" sub="Best time to call: evenings" color={T.hot} />
        </div>
        {frame >= tFD + 15 ? (
          <div
            style={{
              marginTop: 18, padding: '22px 26px', borderRadius: 28, background: alpha(T.accent, 0.12 + 0.1 * glow), border: `2px solid ${alpha(T.accent, 0.7 + 0.3 * glow)}`,
              boxShadow: `0 0 ${50 * glow}px ${alpha(T.accent, 0.35 * glow)}`,
              opacity: opener, transform: `scale(${(0.92 + 0.08 * opener) * (1 + 0.03 * glow)})`, display: 'flex', gap: 18, alignItems: 'flex-start',
            }}
          >
            <Quote size={40} color={T.accent} strokeWidth={2.6} style={{flexShrink: 0, marginTop: 4}} />
            <div>
              <div style={{fontWeight: 800, fontSize: 22, letterSpacing: '0.14em', color: T.accent}}>OPEN WITH</div>
              <div style={{fontWeight: 700, fontSize: 34, lineHeight: 1.25, color: T.text, marginTop: 6}}>“Did the 42A floor plans answer your questions about the terrace?”</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const IG08: React.FC = () => (
  <AbsoluteFill>
    <Stage theme={T}>
      <FadeOut at={tDM - 14}>
        <CallCard />
        <BriefCard />
      </FadeOut>
      <SpokenHeadline theme={T} vo={vo} size={74} y={190} width={960} hideAfter={tDM - 8} emph={['never', 'already', 'told', 'words.', 'care', 'about.']} emph2={['4', 'visits', 'floor', 'payment', '8', 'pm.', 'briefs']} />
      <Sequence from={tDM - 8}>
        <EndCard theme={T} headline="Never open *blind* again." ctaAt={14} />
      </Sequence>
    </Stage>
    <Soundtrack
      music="tech" musicVol={0.42} musicFrom={44} sfxScale={0.75}
      cues={[
        [4, 'whoosh', 0.22], [8, 'blips', 0.25], [tSo, 'pop'], [tFor + 2, 'pop', 0.2], [tThey - 4, 'impact', 0.3], [tJust, 'whoosh', 0.2],
        [tFour, 'pop'], [tFloor, 'pop'], [tPayment, 'pop'], [tAlways, 'pop'], [tFD - 4, 'scan', 0.3], [tFD + 6, 'chime', 0.18], [tFD + 16, 'sparkle', 0.7], [tOpen, 'pop', 0.25],
        [tDM - 8, 'whoosh'], [tDM + 8, 'sparkle'], [tDM + 14, 'pop'],
      ]}
    />
  </AbsoluteFill>
);
