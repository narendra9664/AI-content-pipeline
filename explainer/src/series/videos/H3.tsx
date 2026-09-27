import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Bot, CalendarCheck, Check, FileText, Mail, MessageCircle, MessageSquare, Timer, X} from 'lucide-react';
import {BODY, CLAMP, THEMES, alpha} from '../theme';
import {VOData, at} from '../vo';
import vo from '../vo/h3.json';
import {Stage} from '../kit/Stage';
import {SpokenHeadline} from '../kit/Text';
import {Beam, Rise, Show} from '../kit/Misc';
import {Avatar, LeadRow, lead} from '../kit/Lead';
import {EndCard, FDMark} from '../kit/Logo';
import {Soundtrack} from '../kit/Audio';

const T = THEMES.sand;
const V = vo as VOData;
export const H3_FRAMES = Math.ceil(V.duration * 30) + 45;
const w = (word: string, n = 1) => at(V, word, n);
const SERIF = T.display;
const card: React.CSSProperties = {background: T.surface, border: `1px solid ${T.line}`, boxShadow: '0 30px 80px rgba(20,33,61,0.10)', fontFamily: BODY};

const Robot: React.FC = () => {
  const frame = useCurrentFrame();
  const tHuman = w('human.');
  const x = interpolate(frame, [tHuman, tHuman + 10], [0, 1], CLAMP);
  return (
    <div style={{...card, position: 'absolute', left: 170, top: 300, width: 720, borderRadius: 34, padding: 36, filter: `grayscale(${x})`, opacity: 1 - x * 0.35}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, fontWeight: 700, fontSize: 26, color: T.muted}}>
        <Bot size={30} /> Auto-reply
        <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, color: T.good}}>
          <Timer size={26} /> 2 seconds
        </div>
      </div>
      <div style={{marginTop: 22, padding: '24px 26px', borderRadius: 22, background: T.surface2, fontFamily: 'monospace', fontSize: 25, lineHeight: 1.5, color: T.text}}>
        Dear Customer,
        <br />
        Thank you for your enquiry (Ref #4471). A member of our team will contact you shortly.
      </div>
      <div
        style={{
          position: 'absolute', right: -30, top: -26, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 22px', borderRadius: 999, background: T.bad, color: '#fff',
          fontWeight: 800, fontSize: 28, opacity: x, transform: `scale(${0.6 + 0.4 * x}) rotate(4deg)`,
        }}
      >
        <X size={28} strokeWidth={3} /> Fast, but not human
      </div>
    </div>
  );
};

const HumanHello: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tHuman = w('human.');
  const p = spring({frame: frame - tHuman, fps, config: {damping: 16}});
  return (
    <div style={{position: 'absolute', left: 1010, top: 330, opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
      <div style={{fontFamily: SERIF, fontSize: 150, lineHeight: 0.95, color: T.text}}>
        Hi <span style={{fontStyle: 'italic', color: T.accent2}}>Sarah,</span>
      </div>
      <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 34, color: T.muted, marginTop: 24, maxWidth: 700, lineHeight: 1.4}}>Fast, and it sounds like someone who knows her.</div>
    </div>
  );
};

const Trigger: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tIntent = w('intent,');
  const tFD = w('frontdesk');
  const tChannel = w('channel');
  const tPrefer = w('prefer.');
  const writing = Math.floor(frame / 8) % 4;
  const ch: [string, React.ReactNode, boolean][] = [
    ['WhatsApp', <MessageCircle key="w" size={30} strokeWidth={2.4} />, true],
    ['Email', <Mail key="e" size={30} strokeWidth={2.4} />, false],
    ['SMS', <MessageSquare key="s" size={30} strokeWidth={2.4} />, false],
  ];
  return (
    <>
      <div style={{position: 'absolute', left: 150, top: 420}}>
        <Rise at={w('when') - 2} dy={50}>
          <LeadRow theme={T} l={lead('sarah')} width={620} h={130} focus={1} />
        </Rise>
      </div>
      <Beam x1={780} y1={485} x2={1040} y2={485} at={tFD - 4} color={T.accent2} width={4} dur={12} />
      <div style={{position: 'absolute', left: 1050, top: 330}}>
        <Rise at={tFD - 2} dy={50}>
          <div style={{...card, width: 720, borderRadius: 34, padding: 34}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <FDMark size={52} color={T.accent} color2={T.accent2} />
              <div>
                <div style={{fontWeight: 800, fontSize: 32, color: T.text}}>Writing a personal follow-up{'.'.repeat(writing)}</div>
                <div style={{fontWeight: 500, fontSize: 24, color: T.muted}}>Triggered by real intent · score 92</div>
              </div>
            </div>
            <div style={{height: 1, background: T.line, margin: '26px 0 22px'}} />
            <div style={{fontWeight: 700, fontSize: 22, letterSpacing: '0.14em', color: T.muted, marginBottom: 16}}>CHANNEL</div>
            <div style={{display: 'flex', gap: 14}}>
              {ch.map(([name, icon, pick], i) => {
                const p = spring({frame: frame - (tChannel - 4 + i * 4), fps, config: {damping: 15}});
                const on = pick && frame >= tPrefer;
                return (
                  <div
                    key={name}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: 76, borderRadius: 20, fontWeight: 800, fontSize: 27,
                      background: on ? T.accent : T.surface2, color: on ? '#fff' : T.muted, border: `2px solid ${on ? T.accent : 'transparent'}`,
                      opacity: p, transform: `scale(${0.9 + 0.1 * p + (on ? 0.04 : 0)})`,
                    }}
                  >
                    {icon}
                    {name}
                  </div>
                );
              })}
            </div>
            <div style={{fontWeight: 600, fontSize: 24, color: T.accent2, marginTop: 16, opacity: frame >= tPrefer ? 1 : 0}}>Sarah replies fastest on WhatsApp</div>
          </div>
        </Rise>
      </div>
    </>
  );
};

// The message itself, with the personal details highlighted as they are mentioned.
const Compose: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tMentions = w('mentions');
  const tHome = w('home');
  const tPrivate = w('private');
  const hl = (t: number) => interpolate(frame, [t, t + 8], [0, 1], CLAMP);
  const Tok: React.FC<{t: number; label: string; children: React.ReactNode}> = ({t, label, children}) => {
    const p = hl(t);
    return (
      <span style={{position: 'relative', display: 'inline-block', padding: '0 8px', margin: '0 -2px', lineHeight: 1.5, borderRadius: 10, background: alpha(T.accent2, 0.28 * p), boxShadow: `inset 0 -4px 0 ${alpha(T.accent2, p)}`}}>
        {children}
        <span
          style={{
            position: 'absolute', left: 8, top: '100%', marginTop: 5, lineHeight: 1, whiteSpace: 'nowrap', fontFamily: BODY, fontWeight: 800, fontSize: 19, letterSpacing: '0.08em',
            color: T.accent2, opacity: p, transform: `translateY(${(1 - p) * -8}px)`,
          }}
        >
          {label}
        </span>
      </span>
    );
  };
  const p = spring({frame: frame - (tMentions - 8), fps, config: {damping: 16}});
  return (
    <div style={{position: 'absolute', left: 260, top: 290, opacity: p, transform: `translateY(${(1 - p) * 50}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22, fontFamily: BODY}}>
        <Avatar name="Maya S." tone={4} size={64} />
        <div>
          <div style={{fontWeight: 800, fontSize: 30, color: T.text}}>Maya · VELORIA</div>
          <div style={{fontWeight: 500, fontSize: 22, color: T.muted}}>WhatsApp · to Sarah K. · written by frontdesk AI</div>
        </div>
      </div>
      <div style={{...card, width: 1400, borderRadius: 40, borderTopLeftRadius: 10, padding: '40px 46px 56px', fontFamily: BODY, fontWeight: 500, fontSize: 42, lineHeight: 2.15, color: T.text}}>
        Hi Sarah, it&apos;s Maya from VELORIA. I saw you were looking at{' '}
        <Tok t={tHome - 4} label="FROM HER VISITS">Penthouse 42A</Tok> again, the one with the corner terrace. Would you like a{' '}
        <Tok t={tPrivate - 4} label="THE OFFER">private viewing this Saturday</Tok>? I can hold 11 AM for you.
      </div>
    </div>
  );
};

const DAYS = ['Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM'];

const Booking: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tBooks = w('books');
  const tCal = w('calendar.');
  const drop = spring({frame: frame - (tBooks + 6), fps, config: {damping: 13, stiffness: 120}});
  const COLW = 250;
  const ROWH = 96;
  return (
    <div style={{position: 'absolute', left: 300, top: 250}}>
      <Rise at={w('and') - 8} dy={60}>
        <div style={{...card, width: 1320, borderRadius: 36, padding: 34}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22}}>
            <Avatar name="Maya S." tone={4} size={56} />
            <div style={{fontWeight: 800, fontSize: 32, color: T.text}}>Maya&apos;s calendar</div>
            <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 25, color: T.good, opacity: frame >= tCal ? 1 : 0}}>
              <CalendarCheck size={28} /> Booked and synced
            </div>
          </div>
          <div style={{display: 'flex'}}>
            <div style={{width: 110}}>
              <div style={{height: 50}} />
              {HOURS.map((h) => (
                <div key={h} style={{height: ROWH, fontWeight: 600, fontSize: 22, color: T.muted}}>{h}</div>
              ))}
            </div>
            {DAYS.map((d, di) => (
              <div key={d} style={{width: COLW, position: 'relative'}}>
                <div style={{height: 50, fontWeight: 800, fontSize: 26, color: d === 'Sat' ? T.accent2 : T.text}}>{d}</div>
                {HOURS.map((h) => (
                  <div key={h} style={{height: ROWH, borderTop: `1px solid ${T.line}`, borderLeft: `1px solid ${T.line}`}} />
                ))}
                {di === 0 ? <Slot top={50 + ROWH * 1} h={ROWH} text="Site visit · Omar R." muted /> : null}
                {di === 1 ? <Slot top={50 + ROWH * 3} h={ROWH} text="Team meeting" muted /> : null}
                {di === 2 ? (
                  <div style={{position: 'absolute', left: 8, right: 8, top: 50 + ROWH * 2 + 6, opacity: Math.min(1, drop * 1.5), transform: `translateY(${(1 - drop) * -120}px) scale(${0.9 + 0.1 * drop})`}}>
                    <div
                      style={{
                        height: ROWH * 1.4, borderRadius: 16, padding: '12px 16px', background: T.accent, color: '#fff', boxShadow: `0 20px 50px ${alpha(T.accent, 0.35)}`,
                        fontFamily: BODY,
                      }}
                    >
                      <div style={{fontWeight: 800, fontSize: 23}}>Private viewing</div>
                      <div style={{fontWeight: 600, fontSize: 20, opacity: 0.85}}>Sarah K. · 42A · 11:00</div>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </Rise>
    </div>
  );
};

const Slot: React.FC<{top: number; h: number; text: string; muted?: boolean}> = ({top, h, text}) => (
  <div style={{position: 'absolute', left: 8, right: 8, top: top + 6, height: h - 12, borderRadius: 14, background: T.surface2, padding: '10px 14px', fontFamily: BODY, fontWeight: 700, fontSize: 20, color: T.muted}}>{text}</div>
);

const Brief: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tYour = w('your', 2);
  const tKnowing = w('knowing');
  const rows: [string, string][] = [
    ['Looked at', 'Penthouse 42A (4 visits), compared with Sky Villa'],
    ['Downloaded', 'Floor plans, Friday 12:04 AM'],
    ['Asked about', 'Payment plans'],
    ['Prefers', 'WhatsApp, evenings'],
  ];
  return (
    <div style={{position: 'absolute', left: 300, top: 250}}>
      <Rise at={tYour - 4} dy={60}>
        <div style={{...card, width: 1320, borderRadius: 36, padding: '36px 44px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
            <div style={{width: 64, height: 64, borderRadius: 20, background: alpha(T.accent, 0.1), color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <FileText size={32} />
            </div>
            <div>
              <div style={{fontFamily: SERIF, fontSize: 46, color: T.text}}>Viewing brief · Sarah K.</div>
              <div style={{fontWeight: 600, fontSize: 23, color: T.muted}}>Saturday 11:00 · Penthouse 42A · intent score 92</div>
            </div>
          </div>
          <div style={{height: 1, background: T.line, margin: '26px 0'}} />
          <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
            {rows.map(([k, v], i) => {
              const p = spring({frame: frame - (tKnowing - 6 + i * 5), fps, config: {damping: 16}});
              return (
                <div key={k} style={{display: 'flex', alignItems: 'center', gap: 22, opacity: p, transform: `translateX(${(1 - p) * 40}px)`}}>
                  <div style={{width: 36, height: 36, borderRadius: 36, background: T.good, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Check size={20} strokeWidth={3} />
                  </div>
                  <div style={{width: 230, fontWeight: 700, fontSize: 28, color: T.muted}}>{k}</div>
                  <div style={{fontWeight: 700, fontSize: 30, color: T.text}}>{v}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Rise>
    </div>
  );
};

const Reply: React.FC = () => {
  const tThe = w('the', 3);
  const tFeels = w('feels');
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center'}}>
      <Rise at={tThe - 4} dy={60}>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 22}}>
          <Avatar name="Sarah K." tone={0} size={90} />
          <div>
            <div style={{...card, borderRadius: 40, borderBottomLeftRadius: 10, padding: '34px 44px', fontWeight: 500, fontSize: 46, lineHeight: 1.4, color: T.text, maxWidth: 1100}}>
              Perfect, that&apos;s exactly the one I wanted to see. Thank you, Maya! See you Saturday.
            </div>
            <Rise at={tFeels} dy={20}>
              <div style={{marginTop: 16, fontFamily: BODY, fontWeight: 700, fontSize: 26, color: T.muted}}>Sarah K. · replied in 3 minutes</div>
            </Rise>
          </div>
        </div>
      </Rise>
    </div>
  );
};

export const H3: React.FC = () => {
  const tWhen = w('when');
  const tIt = w('it');
  const tAnd = w('and');
  const tYour = w('your', 2);
  const tThe = w('the', 3);
  const tAfter = w('after.');
  const tDM = w('dm');
  const tEnd = tAfter + 10;
  return (
    <AbsoluteFill>
      <Stage theme={T} calm>
        <Show to={tWhen}>
          <Rise at={0} exitAt={tWhen - 10} dy={40}>
            <Robot />
          </Rise>
          <Show to={tWhen - 2}>
            <FadeOut at={tWhen - 10}>
              <HumanHello />
            </FadeOut>
          </Show>
        </Show>
        <Show from={tWhen - 8} to={tIt}>
          <FadeOut at={tIt - 10}>
            <Trigger />
          </FadeOut>
        </Show>
        <Show from={tIt - 10} to={tAnd + 2}>
          <FadeOut at={tAnd - 8}>
            <Compose />
          </FadeOut>
        </Show>
        <Show from={tAnd - 10} to={tYour + 2}>
          <FadeOut at={tYour - 8}>
            <Booking />
          </FadeOut>
        </Show>
        <Show from={tYour - 8} to={tThe + 2}>
          <FadeOut at={tThe - 8}>
            <Brief />
          </FadeOut>
        </Show>
        <Show from={tThe - 8} to={tEnd}>
          <FadeOut at={tEnd - 10}>
            <Reply />
          </FadeOut>
        </Show>

        <SpokenHeadline
          theme={T} vo={V} size={60} y={70} width={1700} hideAfter={tEnd} splitComma italicAccent
          emph={['human.', 'personal', 'exact', 'private', 'calendar.', 'everything.', 'after.']} emph2={[]}
        />
        <Sequence from={tEnd}>
          <EndCard theme={T} vertical={false} headline="Follow-up that feels *personal.*" ctaAt={tDM - tEnd + 14} italicAccent />
        </Sequence>
      </Stage>
      <Soundtrack
        vo="h3" music="luxury" musicVol={0.3}
        cues={[
          [4, 'pop', 0.2], [w('human.'), 'impact', 0.25], [w('human.') + 4, 'sparkle'], [tWhen - 8, 'whoosh', 0.2], [w('intent,') - 6, 'pop', 0.2], [w('frontdesk') - 4, 'blips', 0.35],
          [w('prefer.'), 'click'], [tIt - 10, 'whoosh', 0.2], [w('mentions'), 'typing', 0.3], [w('home') - 4, 'pop', 0.2], [w('private') - 4, 'pop', 0.2],
          [tAnd - 10, 'whoosh', 0.2], [w('books') + 6, 'pop'], [w('calendar.'), 'chime', 0.16], [tYour - 8, 'whoosh', 0.2], [w('knowing') - 6, 'blips', 0.3],
          [tThe - 8, 'whoosh', 0.2], [tThe, 'send'], [tEnd, 'whoosh', 0.2], [tEnd + 14, 'sparkle'], [tDM + 14, 'pop'],
        ]}
      />
    </AbsoluteFill>
  );
};

const FadeOut: React.FC<{at: number; children: React.ReactNode}> = ({at: t, children}) => {
  const frame = useCurrentFrame();
  return <div style={{position: 'absolute', inset: 0, opacity: interpolate(frame, [t, t + 10], [1, 0], CLAMP)}}>{children}</div>;
};
