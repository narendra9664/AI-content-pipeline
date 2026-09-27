import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CalendarDays, Download, Flame, Moon, Zap} from 'lucide-react';
import {BODY, CLAMP, THEMES, alpha} from '../theme';
import {VOData, at} from '../vo';
import vo2 from '../vo/v2.json';
import {Stage} from '../kit/Stage';
import {SpokenHeadline} from '../kit/Text';
import {Phone} from '../kit/Frames';
import {SiteMobile} from '../kit/Site';
import {Chip, Clock, Rise, Tap} from '../kit/Misc';
import {ChatCard, Toast} from '../kit/Chat';
import {EndCard} from '../kit/Logo';
import {Soundtrack} from '../kit/Audio';

const T = THEMES.emerald;
const vo = vo2 as VOData;
export const V2_FRAMES = Math.ceil(vo.duration * 30) + 45;
const w = (word: string, n = 1) => at(vo, word, n);

// Time reference that flips as days pass ("nobody notices until Monday").
const TimePill: React.FC = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [w("don't") - 12, w("don't") - 2], [0, 1], CLAMP);
  const {fps} = useVideoConfig();
  const tNobody = w('nobody');
  const tMonday = w('monday');
  const tWith = w('with');
  const steps: [number, string, boolean][] = [
    [0, 'Thursday · 11:48 PM', false],
    [tNobody + 6, 'Friday', true],
    [tNobody + 14, 'Saturday', true],
    [tNobody + 22, 'Sunday', true],
    [tMonday - 2, 'Monday · 9:00 AM', true],
    [tWith, 'Thursday · 11:48 PM', false],
  ];
  const idx = steps.reduce((k, s, i) => (frame >= s[0] ? i : k), 0);
  const [t0, label, late] = steps[idx];
  const flip = spring({frame: frame - t0, fps, config: {damping: 16, stiffness: 200}});
  const enter = spring({frame: frame - 60, fps, config: {damping: 16, stiffness: 120}});
  if (frame < 58) return null;
  const col = late ? T.bad : T.accent;
  return (
    <div style={{position: 'absolute', top: 420, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: enter * (1 - out), transform: `scale(${0.8 + 0.2 * enter})`}}>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '12px 26px', borderRadius: 999, overflow: 'hidden',
          background: alpha(col, 0.12), border: `1.5px solid ${alpha(col, 0.6)}`, color: col, fontFamily: BODY, fontWeight: 800, fontSize: 34,
        }}
      >
        {late ? <CalendarDays size={34} strokeWidth={2.4} /> : <Moon size={34} strokeWidth={2.4} />}
        <span style={{display: 'inline-block', transform: `translateY(${(1 - flip) * 30}px)`, opacity: flip}}>{label}</span>
      </div>
    </div>
  );
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const VISITS = [[0], [1], [], [2, 3], [], [], []]; // visit indices per day; #3 is tonight

const Week: React.FC<{start: number; now: number}> = ({start, now}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pulse = 0.5 + 0.5 * Math.sin(frame / 4);
  return (
    <div style={{width: 900, padding: '28px 30px', borderRadius: 34, background: T.surface, border: `1px solid ${T.line}`, boxShadow: '0 30px 80px rgba(0,0,0,0.45)'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, fontFamily: BODY}}>
        <div style={{fontWeight: 800, fontSize: 32, color: T.text}}>Visits this week</div>
        <div style={{fontWeight: 800, fontSize: 32, color: T.accent}}>{Math.min(4, Math.max(0, Math.floor((frame - start) / 4) + 1))}</div>
      </div>
      <div style={{display: 'flex', gap: 12}}>
        {DAYS.map((d, i) => {
          const today = i === 3;
          return (
            <div
              key={d}
              style={{
                flex: 1, height: 150, borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0',
                background: today ? alpha(T.accent, 0.12) : T.surface2, border: `1px solid ${today ? alpha(T.accent, 0.6) : 'transparent'}`,
              }}
            >
              <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 24, color: today ? T.accent : T.muted}}>{d}</div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center'}}>
                {VISITS[i].map((v) => {
                  const t = v === 3 ? now : start + v * 4;
                  const p = spring({frame: frame - t, fps, config: {damping: 12, stiffness: 180}});
                  const live = v === 3;
                  return (
                    <div
                      key={v}
                      style={{
                        width: 26, height: 26, borderRadius: 26, background: live ? T.hot : T.accent, transform: `scale(${p})`,
                        boxShadow: live ? `0 0 ${10 + 14 * pulse}px ${T.hot}` : `0 0 10px ${alpha(T.accent, 0.6)}`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Unread: React.FC<{at: number; off: number}> = ({at: t, off}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - t, fps, config: {damping: 11, stiffness: 160}});
  const o = interpolate(frame, [off, off + 10], [0, 1], CLAMP);
  if (frame < t) return null;
  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, top: 1040, display: 'flex', justifyContent: 'center', zIndex: 20,
        opacity: (1 - o) * Math.min(1, p * 2), transform: `rotate(-8deg) scale(${1.45 - 0.45 * p}) translateY(${o * -200}px)`,
      }}
    >
      <div style={{padding: '14px 34px', border: `6px solid ${T.bad}`, borderRadius: 18, color: T.bad, fontFamily: BODY, fontWeight: 800, fontSize: 58, letterSpacing: '0.06em', background: alpha('#000000', 0.35)}}>
        UNREAD TILL MONDAY
      </div>
    </div>
  );
};

export const V2: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tOpens = w('opens');
  const tAgain = w('again');
  const tFourth = w('fourth');
  const tDown = w('downloaded');
  const tPay = w('payment');
  const tIn = w('in');
  const tNobody = w('nobody');
  const tWith = w('with');
  const tPersonal = w('personal');
  const tSeconds = w('seconds');
  const tAgent = w('agent');
  const tDont = w("don't");
  const tDM = w('dm');

  const gray = interpolate(frame, [tIn, tIn + 12], [0, 1], CLAMP) * (1 - interpolate(frame, [tWith - 4, tWith + 10], [0, 1], CLAMP));
  const scroll = interpolate(frame, [66, 90], [0, 1110], {...CLAMP, easing: (t) => t * t * (3 - 2 * t)});
  const pricingGlow = Math.max(interpolate(frame, [tOpens, tOpens + 8], [0, 1], CLAMP), interpolate(frame, [tAgain, tAgain + 4, tAgain + 20], [0, 1, 0.8], CLAMP));
  const n = frame >= tAgain ? 2 : 1;
  const bump = interpolate(frame, [tAgain, tAgain + 6], [1.25, 1], CLAMP);
  const moon = spring({frame, fps, config: {damping: 200}});

  return (
    <AbsoluteFill>
      <Stage theme={T}>
        {/* 11:48 PM */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center'}}>
          <Rise at={0} exitAt={56} dy={40}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
              <div style={{color: T.accent2, opacity: moon, transform: `rotate(${(1 - moon) * -40}deg)`}}>
                <Moon size={120} strokeWidth={1.6} />
              </div>
              <Clock theme={T} time="11:48" ampm="PM" size={250} label="THURSDAY NIGHT" />
            </div>
          </Rise>
        </div>

        <TimePill />

        {/* The pricing page, opened again. */}
        <div style={{position: 'absolute', left: 290, top: 540}}>
          <Rise at={56} exitAt={tFourth - 16} dy={260}>
            <Phone width={500} screenBg="#0D0E11">
              <SiteMobile scroll={scroll} glow={{pricing: pricingGlow}} time="11:48" />
            </Phone>
          </Rise>
        </div>
        {frame < tFourth - 12 ? (
          <>
            <Tap x={540} y={1110} at={tOpens} color={T.accent} />
            <Tap x={540} y={1110} at={tAgain} color={T.accent} />
          </>
        ) : null}
        <div style={{position: 'absolute', left: 0, right: 0, top: 1230, display: 'flex', justifyContent: 'center'}}>
          <Rise at={tOpens + 2} exitAt={tFourth - 16} dy={30}>
            <div style={{transform: `scale(${bump})`}}>
              <Chip theme={T} icon={<Zap size={32} strokeWidth={2.4} />} text="Opened pricing page" meta={`×${n}`} color={T.hot} size={38} />
            </div>
          </Rise>
        </div>

        {/* Activity, then the long silence, then the instant reply. */}
        <div style={{position: 'absolute', inset: 0, filter: gray > 0.01 ? `grayscale(${gray}) brightness(${1 - gray * 0.25})` : undefined}}>
          <div style={{position: 'absolute', left: 90, top: 520}}>
            <Rise at={tFourth - 12} exitAt={tAgent - 10} dy={60}>
              <Week start={tFourth - 8} now={tFourth + 2} />
            </Rise>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 800, display: 'flex', justifyContent: 'center'}}>
            <Rise at={tDown - 2} exitAt={tAgent - 10} dy={30}>
              <Chip theme={T} icon={<Download size={32} strokeWidth={2.4} />} text="Downloaded the floor plan" size={38} />
            </Rise>
          </div>
          <div style={{position: 'absolute', left: 90, top: 920}}>
            <Rise at={tPay - 22} exitAt={tDont - 12} dy={80}>
              <ChatCard
                theme={T} width={900} name="Sarah K." tone={0} status="WhatsApp · replies automated" size={34} readAt={tSeconds + 30}
                messages={[
                  {from: 'them', text: 'Hi! Do you have payment plans for Penthouse 42A?', at: tPay, typing: 14},
                  {from: 'us', text: 'Hi Sarah! Yes, 42A has a flexible plan. Shall I send it with a few private viewing slots?', at: tSeconds, typing: tSeconds - tPersonal},
                ]}
              />
            </Rise>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1420, display: 'flex', justifyContent: 'center'}}>
            <Rise at={tSeconds + 8} exitAt={tDont - 10} dy={30}>
              <Chip theme={T} icon={<Zap size={32} strokeWidth={2.4} />} text="Replied at 11:48 PM" meta="· in seconds" color={T.accent} size={36} />
            </Rise>
          </div>
        </div>
        <Unread at={tNobody + 4} off={tWith} />

        {/* The agent gets the alert. */}
        <div style={{position: 'absolute', left: 90, top: 560}}>
          <Rise at={tAgent - 4} exitAt={tDont - 10} dy={-60}>
            <Toast
              theme={T} at={tAgent - 4} width={900} icon={<Flame size={34} strokeWidth={2.4} />} title="Hot lead · Sarah K. · 92" body="Asked about payment plans. Call her first." meta="11:48 PM" color={T.hot} size={38}
            />
          </Rise>
        </div>

        <SpokenHeadline
          theme={T} vo={vo} size={74} y={170} width={960} hideAfter={tDont - 6} splitComma skip={[0]}
          emph={['again.', 'fourth', 'downloaded', 'payment', 'monday.', 'seconds,', 'alert.']} emph2={['frontdesk', 'ai,']}
        />
        <Sequence from={tDont - 6}>
          <EndCard theme={T} headline="Don't make your *hottest buyer* wait." ctaAt={tDM - tDont + 4} />
        </Sequence>
      </Stage>
      <Soundtrack
        vo="v2" music="social" musicVol={0.14}
        cues={[
          [0, 'chime', 0.14], [56, 'whoosh'], [tOpens - 1, 'click'], [tOpens + 2, 'pop'], [tAgain - 1, 'click'], [tAgain + 1, 'pop', 0.35],
          [tFourth - 12, 'whoosh'], [tFourth - 8, 'blips'], [tFourth + 2, 'pop'], [tDown - 2, 'pop'], [tPay - 14, 'typing', 0.3], [tPay, 'pop'],
          [tIn, 'whoosh', 0.2], [tNobody + 4, 'impact', 0.4], [tWith - 4, 'riser', 0.25], [tWith + 6, 'sparkle'],
          [tPersonal, 'typing', 0.35], [tSeconds, 'send'], [tSeconds + 8, 'pop'], [tAgent - 4, 'chime', 0.2],
          [tDont - 6, 'impact', 0.35], [tDont + 10, 'sparkle'], [tDM, 'pop'],
        ]}
      />
    </AbsoluteFill>
  );
};
