import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CalendarCheck, CheckCheck, ChevronLeft, Hourglass, Moon, Sun, Zap} from 'lucide-react';
import {BODY, CLAMP, THEMES, alpha} from '../theme';
import {VOData, at} from '../vo';
import data from '../vo/ig04.json';
import {Stage} from '../kit/Stage';
import {SpokenHeadline} from '../kit/Text';
import {Phone} from '../kit/Frames';
import {StatusBar} from '../kit/Site';
import {Chip, Rise} from '../kit/Misc';
import {EndCard} from '../kit/Logo';
import {Soundtrack} from '../kit/Audio';
import {FadeOut, Stamp} from '../kit/Social';

// IG04 "POV: you're the buyer": two developers, one evening, one reply that wins.
const T = THEMES.emerald;
const vo = data as VOData;
export const IG04_FRAMES = Math.ceil(vo.duration * 30) + 60;
const w = (word: string, n = 1) => at(vo, word, n);

const tMessage = w('message');
const tOne = w('one', 1);
const tReplies = w('replies', 1);
const tTwoMin = w('2');
const tMinutes = w('minutes.');
const tDelivered = w('delivered,');
const tBook = w('book');
const tFirst = w('first.');
const tSecond = w('second');
const tNext = w('next');
const tMorning = w('morning.');
const tToo = w('too');
const tWhich = w('which');
const tReply = w('reply');
const tDM = w('dm');

const PW = 460;
const PY = 494;
const LX = 70;
const RX = 1080 - 70 - PW;
const ASK = 'Hi! Is the penthouse still available? Can I see it this week?';

type Bub = {mine?: boolean; system?: boolean; sep?: boolean; text: string; at: number; time?: string; typing?: number};

const Thread: React.FC<{name: string; initial: string; avatarBg: string; sub: string; clock: string; msgs: Bub[]; readAt: number}> = ({
  name, initial, avatarBg, sub, clock, msgs, readAt,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{position: 'absolute', inset: 0, background: '#0B141A', fontFamily: BODY}}>
      <StatusBar color="#fff" time={clock} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 48, height: 76, background: '#1F2C33', display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px'}}>
        <ChevronLeft size={24} color="#E9EDEF" />
        <div style={{width: 46, height: 46, borderRadius: 46, background: avatarBg, color: '#0B141A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 21, flexShrink: 0}}>{initial}</div>
        <div style={{minWidth: 0}}>
          <div style={{fontSize: 20, fontWeight: 700, color: '#E9EDEF', whiteSpace: 'nowrap'}}>{name}</div>
          <div style={{fontSize: 14.5, color: '#8696A0', whiteSpace: 'nowrap'}}>{sub}</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 12, right: 12, top: 140, display: 'flex', flexDirection: 'column', gap: 12}}>
        <div style={{alignSelf: 'center', padding: '5px 12px', borderRadius: 8, background: '#182229', color: '#8696A0', fontSize: 14, fontWeight: 700}}>TODAY</div>
        {msgs.map((m, i) => {
          if (frame < m.at - (m.typing ?? 0)) return null;
          const p = spring({frame: frame - m.at, fps, config: {damping: 15, stiffness: 160, mass: 0.6}});
          if (m.sep || m.system) {
            return (
              <div
                key={i}
                style={{
                  alignSelf: 'center', marginTop: m.sep ? 8 : 4, padding: m.system ? '9px 16px' : '5px 12px', borderRadius: m.system ? 999 : 8,
                  background: m.system ? alpha(T.accent, 0.16) : '#182229', border: m.system ? `1.5px solid ${alpha(T.accent, 0.7)}` : undefined,
                  color: m.system ? T.accent : '#8696A0', fontSize: m.system ? 17 : 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7,
                  opacity: Math.min(1, p * 1.4), transform: `scale(${0.85 + 0.15 * p})`,
                }}
              >
                {m.system ? <CalendarCheck size={19} strokeWidth={2.4} /> : null}
                {m.text}
              </div>
            );
          }
          if (frame < m.at) {
            return (
              <div key={i} style={{alignSelf: 'flex-start', padding: '15px 18px', borderRadius: 14, borderTopLeftRadius: 3, background: '#202C33', display: 'flex', gap: 6}}>
                {[0, 1, 2].map((k) => (
                  <div key={k} style={{width: 9, height: 9, borderRadius: 9, background: '#8696A0', opacity: 0.35 + 0.65 * Math.max(0, Math.sin((frame - k * 4) / 4))}} />
                ))}
              </div>
            );
          }
          const read = frame >= readAt;
          return (
            <div
              key={i}
              style={{
                alignSelf: m.mine ? 'flex-end' : 'flex-start', maxWidth: '88%', padding: '10px 12px 7px 13px', borderRadius: 14,
                borderTopRightRadius: m.mine ? 3 : 14, borderTopLeftRadius: m.mine ? 14 : 3, background: m.mine ? '#005C4B' : '#202C33',
                color: '#E9EDEF', fontSize: 21, lineHeight: 1.3, opacity: Math.min(1, p * 1.4), transform: `scale(${0.85 + 0.15 * p})`,
                transformOrigin: m.mine ? '100% 0' : '0 0',
              }}
            >
              {m.text}
              <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 5, marginTop: 4, fontSize: 13.5, color: 'rgba(233,237,239,0.6)'}}>
                {m.time}
                {m.mine ? <CheckCheck size={19} strokeWidth={2.4} color={read ? '#53BDEB' : '#8696A0'} /> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// The shared clock above both phones.
const ClockChip: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: frame - (tMessage - 30), fps, config: {damping: 16}});
  const steps: [number, string, boolean][] = [[0, '9:00 PM', false], [tTwoMin, '9:02 PM', false], [tNext - 2, '9:14 AM · next day', true]];
  const idx = steps.reduce((k, s, i) => (frame >= s[0] ? i : k), 0);
  const [t0, label, day] = steps[idx];
  const flip = spring({frame: frame - t0, fps, config: {damping: 16, stiffness: 200}});
  const col = day ? T.hot : T.accent;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 412, display: 'flex', justifyContent: 'center', opacity: enter, transform: `scale(${0.8 + 0.2 * enter})`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 28px', borderRadius: 999, background: alpha(col, 0.12), border: `1.5px solid ${alpha(col, 0.6)}`, color: col, fontFamily: BODY, fontWeight: 800, fontSize: 36, overflow: 'hidden'}}>
        {day ? <Sun size={34} strokeWidth={2.4} /> : <Moon size={34} strokeWidth={2.4} />}
        <span style={{display: 'inline-block', transform: `translateY(${(1 - flip) * 30}px)`, opacity: flip, fontVariantNumeric: 'tabular-nums'}}>{label}</span>
      </div>
    </div>
  );
};

export const IG04: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enterL = spring({frame: frame - 6, fps, config: {damping: 18, stiffness: 90}});
  const enterR = spring({frame: frame - 12, fps, config: {damping: 18, stiffness: 90}});
  const winL = interpolate(frame, [tOne - 4, tOne + 8], [0, 1], CLAMP);
  const dimR = interpolate(frame, [tDelivered - 4, tDelivered + 8], [0, 1], CLAMP) * (1 - interpolate(frame, [tSecond - 6, tSecond + 4], [0, 1], CLAMP));
  const which = interpolate(frame, [tWhich - 4, tWhich + 10], [0, 1], CLAMP);
  const clock = (frame < tTwoMin ? '9:00' : frame < tNext - 2 ? '9:02' : '9:14');
  const fast: Bub[] = [
    {mine: true, text: ASK, at: tMessage + 2, time: '9:00 PM'},
    {text: 'Hi Sarah! Yes, it is. Thursday 6 PM or Saturday 11 AM for a private viewing?', at: tTwoMin, typing: tTwoMin - tReplies, time: '9:02 PM'},
    {mine: true, text: 'Saturday 11 works!', at: tBook + 2, time: '9:03 PM'},
    {system: true, text: 'Viewing booked · Sat 11:00 AM', at: tFirst + 4},
  ];
  const slow: Bub[] = [
    {mine: true, text: ASK, at: tMessage + 8, time: '9:00 PM'},
    {sep: true, text: 'NEXT MORNING', at: tNext},
    {text: 'Dear customer, thank you for your enquiry. Our team will contact you shortly.', at: tMorning + 4, typing: 10, time: '9:14 AM'},
  ];
  const glow = (c: string, k: number) => (k > 0 ? `0 0 ${80 * k}px ${alpha(c, 0.35 * k)}` : undefined);
  return (
    <AbsoluteFill>
      <Stage theme={T}>
        <FadeOut at={tReply - 14}>
          <ClockChip />
          <div
            style={{
              position: 'absolute', left: LX, top: PY, opacity: enterL, borderRadius: PW * 0.15, boxShadow: glow(T.accent, winL * (1 - which * 0.5)),
              transform: `translateY(${(1 - enterL) * 260}px) rotate(${-2 * enterL}deg) scale(${1 - which * 0.04})`,
            }}
          >
            <Phone width={PW} screenBg="#0B141A">
              <Thread name="Solenne Residences" initial="S" avatarBg="#7C9CBF" sub="online" clock={clock} msgs={fast} readAt={tReplies - 6} />
            </Phone>
          </div>
          <div
            style={{
              position: 'absolute', left: RX, top: PY, opacity: enterR * (1 - dimR * 0.35),
              transform: `translateY(${(1 - enterR) * 260}px) rotate(${2 * enterR}deg) scale(${1 - which * 0.04})`,
            }}
          >
            <Phone width={PW} screenBg="#0B141A">
              <Thread name="VELORIA Sales" initial="V" avatarBg="#C8A46A" sub="last seen today at 6:12 PM" clock={clock} msgs={slow} readAt={tNext + 4} />
            </Phone>
          </div>
          {/* "delivered, not read" callout on the slow phone */}
          <div style={{position: 'absolute', left: RX, width: PW, top: PY + 560, display: 'flex', justifyContent: 'center'}}>
            <Rise at={tDelivered} exitAt={tSecond - 6} dy={20}>
              <div style={{padding: '10px 20px', borderRadius: 999, background: alpha('#000000', 0.7), border: `1.5px solid ${alpha(T.muted, 0.6)}`, color: T.text, fontFamily: BODY, fontWeight: 700, fontSize: 27, display: 'flex', alignItems: 'center', gap: 10}}>
                <CheckCheck size={28} color="#8696A0" strokeWidth={2.6} /> Delivered. Not read.
              </div>
            </Rise>
          </div>
          <div style={{position: 'absolute', left: RX - 30, width: PW + 60, top: PY + 600, display: 'flex', justifyContent: 'center', zIndex: 10}}>
            <Stamp theme={T} at={tToo} text="TOO LATE" size={66} rotate={-9} />
          </div>
          {/* the score under each phone */}
          <div style={{position: 'absolute', left: LX, width: PW, top: 1484, display: 'flex', justifyContent: 'center'}}>
            <Rise at={tMinutes} dy={30}>
              <Chip theme={T} icon={<Zap size={30} strokeWidth={2.4} />} text="2 minutes" color={T.accent} size={34} solid={which > 0.5} />
            </Rise>
          </div>
          <div style={{position: 'absolute', left: RX, width: PW, top: 1484, display: 'flex', justifyContent: 'center'}}>
            <Rise at={tMorning} dy={30}>
              <Chip theme={T} icon={<Hourglass size={30} strokeWidth={2.4} />} text="12 hours" color={T.bad} size={34} solid={which > 0.5} />
            </Rise>
          </div>
        </FadeOut>
        <SpokenHeadline theme={T} vo={vo} size={78} y={196} width={960} hideAfter={tReply - 6} emph={['2', 'minutes.', 'first.', 'booked']} emph2={['pov:', 'too', 'late.', 'not', 'read.', 'you?']} />
        <Sequence from={tReply - 6}>
          <EndCard theme={T} headline="Reply while they're *still looking.*" ctaAt={tDM - tReply + 4} />
        </Sequence>
      </Stage>
      <Soundtrack
        music="social" musicVol={0.42} musicFrom={12} sfxScale={0.75}
        cues={[
          [6, 'whoosh', 0.22], [tMessage + 2, 'send', 0.45], [tMessage + 8, 'send', 0.35], [tReplies, 'typing', 0.3], [tTwoMin, 'pop'], [tTwoMin + 2, 'chime', 0.15],
          [tDelivered, 'blips', 0.25], [tBook + 2, 'send', 0.45], [tFirst + 4, 'chime', 0.2], [tNext - 4, 'whoosh', 0.22], [tMorning + 4, 'pop'],
          [tToo, 'impact', 0.4], [tWhich, 'riser', 0.2], [tReply - 6, 'whoosh'], [tReply + 10, 'sparkle'], [tDM, 'pop'],
        ]}
      />
    </AbsoluteFill>
  );
};
