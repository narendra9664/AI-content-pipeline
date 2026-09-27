import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CalendarCheck, Check, Clock3, Rewind, Zap} from 'lucide-react';
import {BODY, CLAMP, THEMES, alpha} from '../theme';
import {VOData, at} from '../vo';
import vo4 from '../vo/v4.json';
import {Stage} from '../kit/Stage';
import {SpokenHeadline} from '../kit/Text';
import {Phone, phoneHeight} from '../kit/Frames';
import {Photo, StatusBar} from '../kit/Site';
import {Chip, Rise, Show, Tap} from '../kit/Misc';
import {ChatCard} from '../kit/Chat';
import {EndCard} from '../kit/Logo';
import {Soundtrack} from '../kit/Audio';

const T = THEMES.volt;
const vo = vo4 as VOData;
export const V4_FRAMES = Math.ceil(vo.duration * 30) + 45;
const w = (word: string, n = 1) => at(vo, word, n);

const PW = 580;
const PX = (1080 - PW) / 2;
const PY = 430;
const K = (PW * 0.93) / 390; // logical -> video px inside the phone

const GOLD = '#C8A46A';
const INK = '#0D0E11';

// The buyer fills in the developer's enquiry form.
const FormScreen: React.FC<{start: number; sendAt: number; fast?: boolean}> = ({start, sendAt, fast}) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  const type = (text: string, from: number, speed: number) => (fast ? text : text.slice(0, Math.max(0, Math.floor((t - from) * speed))));
  const sp = fast ? 3 : 1.6;
  const sent = frame >= sendAt + 4;
  const press = interpolate(frame, [sendAt - 3, sendAt, sendAt + 4], [1, 0.95, 1], CLAMP);
  const field = (label: string, value: string, y: number, h = 50) => (
    <div style={{position: 'absolute', left: 22, right: 22, top: y}}>
      <div style={{fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: 'rgba(243,238,230,0.55)', marginBottom: 6}}>{label}</div>
      <div style={{height: h, borderRadius: 12, border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.04)', padding: '14px 14px', fontSize: 15.5, color: '#F3EEE6', lineHeight: 1.4}}>
        {value}
      </div>
    </div>
  );
  return (
    <div style={{position: 'absolute', inset: 0, background: INK, fontFamily: BODY, color: '#F3EEE6'}}>
      <Photo w={390} h={230} zoom={1.7} fx={0.5} fy={0.35} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 390, height: 230, background: `linear-gradient(180deg, rgba(0,0,0,0.5), rgba(13,14,17,0) 40%, ${INK} 100%)`}} />
      <div style={{position: 'absolute', left: 22, top: 58, fontWeight: 600, fontSize: 14, letterSpacing: '0.42em', color: '#fff'}}>VELORIA</div>
      <div style={{position: 'absolute', left: 22, top: 196, fontFamily: 'Instrument Serif', fontSize: 38, lineHeight: 1}}>Book a private viewing</div>
      {field('NAME', type('Sarah K.', 6, sp), 262)}
      {field('RESIDENCE', type('Penthouse 42A', 14, sp), 348)}
      {field('MESSAGE', type('Could I see it this week? Evenings suit me best.', 24, sp * 1.6), 434, 92)}
      <div
        style={{
          position: 'absolute', left: 22, right: 22, top: 566, height: 52, borderRadius: 999, background: sent ? '#1F7A4D' : GOLD, color: sent ? '#fff' : '#15120C',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700, fontSize: 15.5, transform: `scale(${press})`,
        }}
      >
        {sent ? (
          <>
            <Check size={18} strokeWidth={3} /> Enquiry sent
          </>
        ) : (
          'Send enquiry'
        )}
      </div>
      {sent ? (
        <div style={{position: 'absolute', left: 22, right: 22, top: 640, fontSize: 14, lineHeight: 1.5, color: 'rgba(243,238,230,0.6)', textAlign: 'center'}}>
          {fast ? 'Thank you, Sarah. Check WhatsApp in a moment.' : 'Thank you. A member of our team will be in touch within 24 hours.'}
        </div>
      ) : null}
      <StatusBar color="#fff" time="9:00" />
    </div>
  );
};

type Note = {at: number; app: string; icon: string; color: string; title: string; body: string; time: string; hl?: boolean};

// Lock screen with notifications stacking newest-first.
const LockScreen: React.FC<{time: string; date: string; notes: Note[]; dimClock?: boolean}> = ({time, date, notes}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const shown = notes.filter((n) => frame >= n.at); // array order = lock-screen order (newest first)
  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: BODY, color: '#fff', overflow: 'hidden'}}>
      <Photo w={390} h={844} zoom={2.2} fx={0.5} fy={0.45} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,6,12,0.35), rgba(5,6,12,0.75))'}} />
      <StatusBar color="#fff" time="" />
      <div style={{position: 'absolute', top: 92, left: 0, right: 0, textAlign: 'center', fontSize: 17, fontWeight: 600, opacity: 0.85}}>{date}</div>
      <div style={{position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center', fontSize: 92, fontWeight: 700, letterSpacing: '-0.04em'}}>{time}</div>
      <div style={{position: 'absolute', left: 14, right: 14, top: 250, display: 'flex', flexDirection: 'column', gap: 10}}>
        {shown.map((n) => {
          const p = spring({frame: frame - n.at, fps, config: {damping: 15, stiffness: 160}});
          return (
            <div
              key={n.title + n.time}
              style={{
                padding: '14px 16px', borderRadius: 22, background: n.hl ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)',
                border: n.hl ? `2px solid ${n.color}` : '1px solid rgba(255,255,255,0.12)', opacity: p, transform: `translateY(${(1 - p) * -30}px) scale(${0.95 + 0.05 * p})`,
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, opacity: 0.85}}>
                <div style={{width: 22, height: 22, borderRadius: 6, background: n.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#111'}}>
                  {n.icon}
                </div>
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

const Rewinding: React.FC<{at: number}> = ({at: t}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [t, t + 5, t + 22, t + 30], [0, 1, 1, 0], CLAMP);
  if (p <= 0) return null;
  const lines = Array.from({length: 14});
  return (
    <div style={{position: 'absolute', inset: 0, opacity: p, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', inset: 0, background: alpha(T.accent, 0.1)}} />
      {lines.map((_, i) => (
        <div key={i} style={{position: 'absolute', left: 0, right: 0, top: ((i * 151 + frame * 37) % 1920), height: 3 + (i % 3) * 2, background: alpha(T.accent, 0.35)}} />
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 880, display: 'flex', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '18px 36px', borderRadius: 999, background: T.accent, color: T.onAccent, fontFamily: BODY, fontWeight: 800, fontSize: 52, letterSpacing: '0.06em'}}>
          <Rewind size={52} fill={T.onAccent} /> REWIND · 9:00 PM
        </div>
      </div>
    </div>
  );
};

export const V4: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tSends = w('sends');
  const tYour = w('your');
  const tMorning = w('morning.');
  const tBy = w('by');
  const tAlready = w('already');
  const tNow = w('now,');
  const tSame = w('same');
  const tFD = w('frontdesk');
  const tPersonal = w('personal');
  const tSeconds = w('seconds.');
  const tViewing = w('viewing');
  const tBooked = w('booked');
  const tCloses = w('closes');
  const tBe = w('be');
  const tDM = w('dm');

  const enter = spring({frame, fps, config: {damping: 18, stiffness: 90}});
  const closeTab = interpolate(frame, [tCloses, tCloses + 14], [0, 1], {...CLAMP, easing: (x) => x * x});
  const phoneOut = interpolate(frame, [tBe - 12, tBe], [0, 1], CLAMP);
  const lime = interpolate(frame, [tFD - 4, tFD + 8], [0, 1], CLAMP);
  const replyNote: Note = {at: tMorning - 2, app: 'Mail', icon: '@', color: '#9CA3AF', title: 'VELORIA Sales', body: 'Thank you for your enquiry. A member of our team will…', time: '9:14 AM'};
  const rivalNote: Note = {at: tAlready - 4, app: 'WhatsApp', icon: 'W', color: '#25D366', title: 'Solenne Residences', body: 'Hi Sarah! Your private viewing is confirmed for Saturday, 11 AM.', time: 'Last night, 9:06 PM', hl: true};

  return (
    <AbsoluteFill>
      <Stage theme={T}>
        <div
          style={{
            position: 'absolute', left: PX, top: PY, opacity: enter * (1 - phoneOut),
            transform: `translateY(${(1 - enter) * 300 + phoneOut * 120}px)`,
          }}
        >
          <Phone width={PW} screenBg={INK}>
            {/* 1. the slow way */}
            <Show to={tYour + 2}>
              <FormScreen start={4} sendAt={tSends + 12} />
            </Show>
            <Show from={tYour + 2} to={tNow + 12}>
              <LockScreen
                time={frame < tMorning - 2 ? '9:00' : '9:14'} date={frame < tMorning - 2 ? 'Tuesday, 12 March' : 'Wednesday, 13 March'}
                notes={[replyNote, rivalNote]}
              />
            </Show>
            {/* 2. the same enquiry, with frontdesk AI */}
            <Show from={tNow + 12} to={tPersonal - 2}>
              <FormScreen start={tNow + 12} sendAt={tFD + 2} fast />
            </Show>
            <Show from={tPersonal - 2}>
              <div style={{position: 'absolute', inset: 0, background: '#0B0C10', transform: `translateY(${-closeTab * 0}px)`}}>
                <StatusBar color="#fff" time="9:00" />
                <div style={{position: 'absolute', left: 0, right: 0, top: 70}}>
                  <ChatCard
                    theme={T} width={390} name="VELORIA · Sarah K." tone={0} status="WhatsApp · automated reply" size={19} readAt={tViewing}
                    messages={[
                      {from: 'us', text: 'Hi Sarah! Penthouse 42A is available for a private viewing this week. Thursday 6 PM or Saturday 11 AM?', at: tSeconds - 4, typing: tSeconds - tPersonal - 2},
                      {from: 'them', text: 'Saturday 11 works!', at: tViewing, typing: 10},
                      {from: 'system', text: 'Viewing booked · Sat 11:00 AM', at: tBooked + 2},
                    ]}
                  />
                </div>
              </div>
            </Show>
          </Phone>
          {/* tab closing: the screen slides away, the booking stays */}
          <div
            style={{
              position: 'absolute', left: PW * 0.035, top: PW * 0.035, width: PW * 0.93, height: phoneHeight(PW) - PW * 0.07, borderRadius: PW * 0.12,
              background: '#000', opacity: closeTab * 0.9, pointerEvents: 'none',
            }}
          />
        </div>
        {frame < tYour ? <Tap x={540} y={PY + PW * 0.035 + 592 * K} at={tSends + 12} color={T.accent} /> : null}
        {frame > tNow && frame < tPersonal ? <Tap x={540} y={PY + PW * 0.035 + 592 * K} at={tFD + 2} color={T.accent} /> : null}
        <Rewinding at={tNow - 4} />

        {/* big readable callouts */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 1300, display: 'flex', justifyContent: 'center'}}>
          <Rise at={tMorning - 2} exitAt={tNow - 6} dy={40}>
            <Chip theme={T} icon={<Clock3 size={34} strokeWidth={2.4} />} text="Your reply: next morning" meta="· 12 hrs" color={T.bad} size={40} />
          </Rise>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1400, display: 'flex', justifyContent: 'center'}}>
          <Rise at={tAlready} exitAt={tNow - 6} dy={40}>
            <Chip theme={T} icon={<CalendarCheck size={34} strokeWidth={2.4} />} text="She booked elsewhere" meta="· 9:06 PM" color={T.bad} size={40} solid />
          </Rise>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1300, display: 'flex', justifyContent: 'center'}}>
          <Rise at={tSeconds} exitAt={tBe - 10} dy={40}>
            <Chip theme={T} icon={<Zap size={34} strokeWidth={2.4} />} text="Personal reply" meta="· 8 seconds" color={T.accent} size={40} />
          </Rise>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1400, display: 'flex', justifyContent: 'center'}}>
          <Rise at={tBooked} exitAt={tBe - 10} dy={40}>
            <Chip theme={T} icon={<CalendarCheck size={34} strokeWidth={2.4} />} text="Viewing booked" meta="· before she left" color={T.accent} size={40} solid />
          </Rise>
        </div>
        {lime > 0 && frame < tBe ? (
          <div style={{position: 'absolute', inset: 0, boxShadow: `inset 0 0 ${160 * lime}px ${alpha(T.accent, 0.18 * lime)}`, pointerEvents: 'none'}} />
        ) : null}

        <SpokenHeadline
          theme={T} vo={vo} size={78} y={160} width={960} hideAfter={tBe - 6}
          emph={['nine', 'pm.', 'morning.', 'else.', 'seconds.', 'booked', 'tab.']} emph2={['frontdesk', 'ai.']}
        />
        <Sequence from={tBe - 6}>
          <EndCard theme={T} headline="Be the *first* to answer." ctaAt={tDM - tBe + 4} />
        </Sequence>
      </Stage>
      <Soundtrack
        vo="v4" music="social" musicVol={0.14}
        cues={[
          [0, 'whoosh', 0.22], [8, 'typing', 0.3], [tSends + 12, 'click'], [tSends + 16, 'send'], [tYour, 'whoosh', 0.22], [tMorning - 2, 'pop'],
          [tAlready - 4, 'impact', 0.3], [tNow - 6, 'riser', 0.25], [tNow - 2, 'scan', 0.3], [tNow + 12, 'whoosh', 0.2], [tSame + 4, 'typing', 0.3],
          [tFD + 2, 'click'], [tFD + 6, 'send'], [tPersonal, 'typing', 0.3], [tSeconds - 4, 'send'], [tSeconds, 'sparkle'],
          [tViewing, 'pop'], [tBooked + 2, 'chime', 0.2], [tCloses, 'whoosh', 0.2],
          [tBe - 6, 'impact', 0.35], [tBe + 10, 'sparkle'], [tDM, 'pop'],
        ]}
      />
    </AbsoluteFill>
  );
};
