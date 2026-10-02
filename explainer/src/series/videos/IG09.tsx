import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Check, Moon, Sun, Zap} from 'lucide-react';
import {BODY, CLAMP, THEMES, alpha} from '../theme';
import {VOData, at} from '../vo';
import data from '../vo/ig09.json';
import {Stage} from '../kit/Stage';
import {Label, SpokenHeadline} from '../kit/Text';
import {Phone} from '../kit/Frames';
import {Photo, SiteMobile, StatusBar} from '../kit/Site';
import {Rise, Show, Tap} from '../kit/Misc';
import {EndCard} from '../kit/Logo';
import {Soundtrack} from '../kit/Audio';
import {CommentPrompt, FadeOut, LogRow, Ring, RewindFx} from '../kit/Social';

// IG09 "The 8 PM speed test": enquire on your own site tonight and time the reply.
const T = THEMES.aurora;
const vo = data as VOData;
export const IG09_FRAMES = Math.ceil(vo.duration * 30) + 60;
const w = (word: string, n = 1) => at(vo, word, n);

const tEnquire = w('enquire');
const tWebsite = w('website.');
const tTimer = w('timer.');
const tFive = w('5');
const tHour = w('hour?');
const tTomorrow = w('tomorrow');
const tMorning = w('morning?');
const tYour = w('your', 2);
const tWith = w('with');
const tSeconds = w('seconds.');
const tComment = w('comment');
const tPass = w('pass');
const tDM = w('dm');
const tSend = tWebsite + 8;

const PX = 80;
const PY = 470;
const PW = 400;
const K = (PW * 0.93) / 390;
const GOLD = '#C8A46A';
const INK = '#0D0E11';
const RX = 520;
const RW = 490;

// elapsed seconds on the waiting timer (the night fast-forwards), then the 8-second rerun
const NIGHT = 13 * 3600 + 14 * 60;
const waited = (f: number) =>
  interpolate(f, [tTimer, tFive, tFive + 8, tHour, tHour + 8, tTomorrow, tMorning + 8], [0, 40, 300, 320, 3600, 3700, NIGHT], {...CLAMP, easing: (x) => x * x * (3 - 2 * x)});
const rerun = (f: number) => interpolate(f, [tWith + 6, tSeconds], [0, 8], CLAMP);
const hms = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const x = Math.floor(s % 60);
  return [h, m, x].map((v) => String(v).padStart(2, '0')).join(':');
};

const FormScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame - tEnquire;
  const type = (text: string, from: number, speed: number) => text.slice(0, Math.max(0, Math.floor((t - from) * speed)));
  const sent = frame >= tSend + 3;
  const press = interpolate(frame, [tSend - 3, tSend, tSend + 4], [1, 0.95, 1], CLAMP);
  const field = (label: string, value: string, y: number, h = 50) => (
    <div style={{position: 'absolute', left: 22, right: 22, top: y}}>
      <div style={{fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: 'rgba(243,238,230,0.55)', marginBottom: 6}}>{label}</div>
      <div style={{height: h, borderRadius: 12, border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.04)', padding: '14px 14px', fontSize: 15.5, color: '#F3EEE6', lineHeight: 1.4}}>{value}</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', inset: 0, background: INK, fontFamily: BODY, color: '#F3EEE6'}}>
      <Photo w={390} h={230} zoom={1.7} fx={0.5} fy={0.35} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 390, height: 230, background: `linear-gradient(180deg, rgba(0,0,0,0.5), rgba(13,14,17,0) 40%, ${INK} 100%)`}} />
      <div style={{position: 'absolute', left: 22, top: 58, fontWeight: 600, fontSize: 14, letterSpacing: '0.42em', color: '#fff'}}>VELORIA</div>
      <div style={{position: 'absolute', left: 22, top: 196, fontFamily: 'Instrument Serif', fontSize: 38, lineHeight: 1}}>Enquire about 42A</div>
      {field('NAME', type('Sam (testing)', 4, 1.4), 262)}
      {field('EMAIL', type('sam@example.com', 10, 2), 348)}
      {field('MESSAGE', type('Is Penthouse 42A available this week?', 16, 2.2), 434, 76)}
      <div
        style={{
          position: 'absolute', left: 22, right: 22, top: 546, height: 52, borderRadius: 999, background: sent ? '#1F7A4D' : GOLD, color: sent ? '#fff' : '#15120C',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700, fontSize: 15.5, transform: `scale(${press})`,
        }}
      >
        {sent ? (
          <>
            <Check size={18} strokeWidth={3} /> Enquiry sent · 8:00 PM
          </>
        ) : (
          'Send enquiry'
        )}
      </div>
      <StatusBar color="#fff" time="8:00" />
    </div>
  );
};

type Note = {at: number; app: string; icon: string; color: string; title: string; body: string; time: string};

const Lock: React.FC<{time: string; date: string; notes: Note[]; morning?: number}> = ({time, date, notes, morning = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const shown = notes.filter((n) => frame >= n.at);
  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: BODY, color: '#fff', overflow: 'hidden'}}>
      <Photo w={390} h={844} zoom={2.2} fx={0.5} fy={0.45} />
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(5,6,12,${0.55 - morning * 0.3}), rgba(5,6,12,${0.85 - morning * 0.3}))`}} />
      {morning > 0 ? <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(255,184,77,${0.25 * morning}), rgba(255,95,162,0))`}} /> : null}
      <StatusBar color="#fff" time="" />
      <div style={{position: 'absolute', top: 92, left: 0, right: 0, textAlign: 'center', fontSize: 17, fontWeight: 600, opacity: 0.85}}>{date}</div>
      <div style={{position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center', fontSize: 92, fontWeight: 700, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums'}}>{time}</div>
      {shown.length === 0 ? <div style={{position: 'absolute', top: 280, left: 0, right: 0, textAlign: 'center', fontSize: 15, fontWeight: 600, opacity: 0.6}}>No new messages</div> : null}
      <div style={{position: 'absolute', left: 14, right: 14, top: 260, display: 'flex', flexDirection: 'column', gap: 10}}>
        {shown.map((n) => {
          const p = spring({frame: frame - n.at, fps, config: {damping: 15, stiffness: 160}});
          return (
            <div key={n.title + n.time} style={{padding: '14px 16px', borderRadius: 22, background: 'rgba(255,255,255,0.2)', border: `2px solid ${n.color}`, opacity: p, transform: `translateY(${(1 - p) * -30}px) scale(${0.95 + 0.05 * p})`}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, opacity: 0.85}}>
                <div style={{width: 22, height: 22, borderRadius: 6, background: n.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#111'}}>{n.icon}</div>
                {n.app}
                <div style={{marginLeft: 'auto', fontWeight: 500}}>{n.time}</div>
              </div>
              <div style={{fontSize: 16.5, fontWeight: 700, marginTop: 6}}>{n.title}</div>
              <div style={{fontSize: 15, lineHeight: 1.35, opacity: 0.9}}>{n.body}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TimerPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rerunning = frame >= tWith;
  const s = rerunning ? rerun(frame) : waited(frame);
  const morning = rerunning ? 0 : interpolate(frame, [tTomorrow, tMorning + 8], [0, 1], CLAMP);
  const col = rerunning ? T.good : morning > 0.5 ? T.hot : T.accent2;
  const p = rerunning ? s / 8 : Math.min(1, s / NIGHT);
  const enter = spring({frame: frame - tTimer + 10, fps, config: {damping: 16}});
  const done = frame >= tSeconds;
  return (
    <div style={{position: 'absolute', left: RX, top: PY, width: RW, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: enter, transform: `scale(${0.85 + 0.15 * enter})`}}>
      <Ring size={430} stroke={20} p={p} color={col} track={alpha(col, 0.12)} glow={0.8}>
        <div style={{color: col, marginBottom: 8}}>{rerunning ? <Zap size={44} strokeWidth={2.4} /> : morning > 0.5 ? <Sun size={44} strokeWidth={2.4} /> : <Moon size={44} strokeWidth={2.4} />}</div>
        <div style={{fontFamily: T.display, fontWeight: 700, fontSize: 76, letterSpacing: '-0.04em', color: T.text, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>{hms(s)}</div>
        <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 19, letterSpacing: '0.16em', color: done ? T.good : T.muted, marginTop: 12}}>{done ? 'REPLY RECEIVED' : rerunning ? 'WAITING…' : 'WAITING FOR A REPLY'}</div>
      </Ring>
    </div>
  );
};

export const IG09: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: frame - 4, fps, config: {damping: 18, stiffness: 90}});
  const clockIn = spring({frame: frame - 8, fps, config: {damping: 16}});
  const clockOut = interpolate(frame, [tTimer - 14, tTimer - 4], [0, 1], CLAMP);
  const lockTime = frame < tFive + 8 ? '8:00' : frame < tHour + 8 ? '8:05' : frame < tTomorrow + 6 ? '9:00' : '9:14';
  const morning = interpolate(frame, [tTomorrow, tMorning + 8], [0, 1], CLAMP);
  const slowNotes: Note[] = [{at: tMorning + 6, app: 'Mail', icon: '@', color: '#9CA3AF', title: 'VELORIA Sales', body: 'Dear customer, thank you for your enquiry. A member of…', time: '9:14 AM'}];
  const fastNotes: Note[] = [{at: tSeconds, app: 'WhatsApp', icon: 'W', color: '#25D366', title: 'VELORIA · Maya', body: 'Hi Sam! 42A is available this week. Thursday 6 PM or Saturday 11 AM?', time: 'now'}];
  return (
    <AbsoluteFill>
      <Stage theme={T}>
        <FadeOut at={tPass - 14}>
          <div style={{position: 'absolute', left: PX, top: PY - 64, width: PW, display: 'flex', justifyContent: 'center', opacity: enter}}>
            <Label theme={T} size={22}>Your website</Label>
          </div>
          <div style={{position: 'absolute', left: PX, top: PY, opacity: enter, transform: `translateY(${(1 - enter) * 200}px)`}}>
            <Phone width={PW} screenBg={INK}>
              <Show to={tEnquire - 4}>
                <SiteMobile variant="dark" time="7:59" />
              </Show>
              <Show from={tEnquire - 4} to={tTimer - 4}>
                <FormScreen />
              </Show>
              <Show from={tTimer - 4} to={tWith + 4}>
                <Lock time={lockTime} date={frame < tTomorrow + 6 ? 'Tuesday, 13 October' : 'Wednesday, 14 October'} notes={slowNotes} morning={morning} />
              </Show>
              <Show from={tWith + 4}>
                <Lock time="8:00" date="Tuesday, 13 October" notes={fastNotes} />
              </Show>
            </Phone>
          </div>
          <Tap x={PX + PW * 0.035 + 195 * K} y={PY + PW * 0.035 + 572 * K} at={tSend} color={T.accent} />

          {/* right: the clock, then the timer */}
          <div style={{position: 'absolute', left: RX, top: PY + 120, width: RW, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, opacity: clockIn * (1 - clockOut)}}>
            <Moon size={70} color={T.hot} strokeWidth={2} />
            <div style={{fontFamily: T.display, fontWeight: 700, fontSize: 150, lineHeight: 1, color: T.text, letterSpacing: '-0.05em'}}>
              8:00<span style={{fontSize: 54, color: T.muted, marginLeft: 10}}>PM</span>
            </div>
            <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 24, letterSpacing: '0.2em', color: T.hot}}>TONIGHT</div>
          </div>
          {frame >= tTimer - 10 ? <TimerPanel /> : null}
          <div style={{position: 'absolute', left: RX, top: PY + 470, width: RW, display: 'flex', flexDirection: 'column', gap: 12}}>
            {frame < tYour - 4 ? (
              <>
                <LogRow theme={T} at={tFive + 6} width={RW} size={26} icon={<Moon size={26} strokeWidth={2.4} />} title="8:05 PM" sub="No reply" color={T.bad} />
                <LogRow theme={T} at={tHour + 6} width={RW} size={26} icon={<Moon size={26} strokeWidth={2.4} />} title="9:00 PM" sub="Still nothing" color={T.bad} />
                <LogRow theme={T} at={tMorning + 6} width={RW} size={26} icon={<Sun size={26} strokeWidth={2.4} />} title="9:14 AM, next day" sub="“Dear customer…”" color={T.hot} />
              </>
            ) : frame < tWith ? (
              <>
                <LogRow theme={T} at={tYour} width={RW} size={26} icon={<Check size={26} strokeWidth={2.6} />} title="Developer A" sub="Replied in 2 minutes" meta="2m" color={T.good} />
                <LogRow theme={T} at={tYour + 8} width={RW} size={26} icon={<Moon size={26} strokeWidth={2.4} />} title="Developer B" sub="Replied in 40 minutes" meta="40m" color={T.hot} />
                <LogRow theme={T} at={tYour + 16} width={RW} size={26} icon={<Sun size={26} strokeWidth={2.4} />} title="You" sub="Replied next morning" meta="13h" color={T.bad} active={1} />
              </>
            ) : (
              <Rise at={tSeconds} dy={30}>
                <LogRow theme={T} at={tSeconds} width={RW} size={30} icon={<Zap size={30} strokeWidth={2.4} />} title="frontdesk AI" sub="Personal reply in 8 seconds" meta="0:08" color={T.good} active={1} />
              </Rise>
            )}
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1372, display: 'flex', justifyContent: 'center'}}>
            <CommentPrompt theme={T} at={tComment} text="My time was…" width={700} size={44} />
          </div>
          <RewindFx theme={T} at={tWith - 8} label="REWIND · 8:00 PM" y={1010} />
        </FadeOut>
        <SpokenHeadline theme={T} vo={vo} size={78} y={190} width={960} hideAfter={tPass - 6} emph={['tonight.', 'timer.', 'seconds.']} emph2={['minutes?', 'hour?', 'morning?', 'anyway.', 'comment']} />
        <Sequence from={tPass - 6}>
          <EndCard theme={T} headline="Pass the *8 PM test.*" ctaAt={tDM - tPass + 4} />
        </Sequence>
      </Stage>
      <Soundtrack
        music="social" musicVol={0.42} musicFrom={28} sfxScale={0.75}
        cues={[
          [4, 'whoosh', 0.22], [8, 'chime', 0.15], [tEnquire, 'typing', 0.3], [tSend, 'click'], [tSend + 4, 'send', 0.45], [tTimer, 'blips', 0.3],
          [tFive, 'scan', 0.22], [tFive + 6, 'pop'], [tHour, 'scan', 0.22], [tHour + 6, 'pop'], [tTomorrow, 'riser', 0.2], [tMorning + 6, 'pop'],
          [tYour, 'pop', 0.25], [tYour + 8, 'pop', 0.25], [tYour + 16, 'impact', 0.25], [tWith - 8, 'scan', 0.3], [tSeconds, 'sparkle', 0.8], [tSeconds + 2, 'chime', 0.2],
          [tComment, 'typing', 0.3], [tPass - 6, 'whoosh'], [tPass + 10, 'sparkle'], [tDM, 'pop'],
        ]}
      />
    </AbsoluteFill>
  );
};
