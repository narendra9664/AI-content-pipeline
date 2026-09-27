import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Activity, Bell, CalendarDays, CheckCheck, Coffee, Dices, Flame, ListOrdered, Mail, MessageCircle, Phone as PhoneIcon, Search, Send, Settings, Sheet} from 'lucide-react';
import {BODY, CLAMP, THEMES, alpha} from '../theme';
import {VOData, at} from '../vo';
import vo from '../vo/h4.json';
import {Stage} from '../kit/Stage';
import {Captions} from '../kit/Text';
import {Browser} from '../kit/Frames';
import {Camera, Clock, Rise, Show, Strike} from '../kit/Misc';
import {Avatar, Queue, lead} from '../kit/Lead';
import {FDMark, EndCard} from '../kit/Logo';
import {Soundtrack} from '../kit/Audio';

const T = THEMES.aurora;
const V = vo as VOData;
export const H4_FRAMES = Math.ceil(V.duration * 30) + 45;
const w = (word: string, n = 1) => at(V, word, n);

const WIN_W = 1400;
const K = WIN_W / 1280;
const WIN_X = (1920 - WIN_W) / 2;
const WIN_Y = 64;
const LH = 720;
const APP = '#0C0B16';

const NAV: [React.ReactNode, string][] = [
  [<ListOrdered key="a" size={17} />, 'Lead queue'],
  [<Send key="b" size={17} />, 'Follow-ups'],
  [<CalendarDays key="c" size={17} />, 'Viewings'],
  [<Activity key="d" size={17} />, 'Signals'],
  [<Settings key="e" size={17} />, 'Settings'],
];

const Kpi: React.FC<{x: number; label: string; value: string; color: string; glow?: number}> = ({x, label, value, color, glow = 0}) => (
  <div
    style={{
      position: 'absolute', left: x, top: 88, width: 330, height: 82, borderRadius: 16, padding: '14px 18px', background: T.surface,
      border: `1px solid ${glow > 0 ? alpha(color, 0.3 + 0.6 * glow) : T.line}`, boxShadow: glow > 0 ? `0 0 ${30 * glow}px ${alpha(color, 0.3 * glow)}` : undefined,
    }}
  >
    <div style={{fontSize: 13, fontWeight: 600, color: T.muted, letterSpacing: '0.02em'}}>{label}</div>
    <div style={{fontSize: 32, fontWeight: 800, color, letterSpacing: '-0.03em', marginTop: 2}}>{value}</div>
  </div>
);

const PanelShell: React.FC<{title: string; badge?: string; children: React.ReactNode; opacity: number; dy: number}> = ({title, badge, children, opacity, dy}) => (
  <div style={{position: 'absolute', inset: 0, opacity, transform: `translateY(${dy}px)`}}>
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14}}>
      <div style={{fontSize: 17, fontWeight: 800, color: T.text}}>{title}</div>
      {badge ? <div style={{fontSize: 12, fontWeight: 800, color: T.accent, padding: '4px 10px', borderRadius: 99, background: alpha(T.accent, 0.14)}}>{badge}</div> : null}
    </div>
    {children}
  </div>
);

const TIMELINE: [string, string][] = [
  ['Sun 9:15 PM', 'Viewed Penthouse 42A · 4th time'],
  ['Sat 10:12 AM', 'Asked about payment plans'],
  ['Fri 12:04 AM', 'Downloaded the floor plan'],
  ['Thu 11:48 PM', 'Opened the pricing page · twice'],
];
const SENT: [string, 'wa' | 'mail', string, string][] = [
  ['11:49 PM', 'wa', 'Sarah K.', 'Payment plan for 42A'],
  ['12:10 AM', 'mail', 'Omar R.', 'Floor plan PDF'],
  ['6:30 AM', 'wa', 'Priya M.', 'Viewing slots this week'],
  ['7:45 AM', 'mail', 'James L.', 'Price list'],
];

// The product: one screen with the ranked queue and a context panel.
export const Dashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tRanked = w('ranked');
  const tWhat = w('what');
  const tFollow = w('follow-ups');
  const tOvernight = w('overnight.');
  const tThree = w('three');
  const tCalling = w('calling');
  const ids = ['james', 'daniel', 'omar', 'mei', 'sarah', 'priya'];
  const sorted = ['sarah', 'omar', 'priya', 'james', 'daniel', 'mei'];
  // which right-panel content is showing
  const pDetail = interpolate(frame, [tWhat - 8, tWhat + 4], [0, 1], CLAMP) * (1 - interpolate(frame, [tFollow - 8, tFollow], [0, 1], CLAMP));
  const pSent = interpolate(frame, [tFollow - 2, tFollow + 8], [0, 1], CLAMP) * (1 - interpolate(frame, [tThree - 8, tThree], [0, 1], CLAMP));
  const pCall = interpolate(frame, [tThree - 2, tThree + 8], [0, 1], CLAMP);
  const pFocus = 1 - Math.max(pDetail, pSent, pCall);
  return (
    <div style={{position: 'absolute', inset: 0, background: APP, fontFamily: BODY, color: T.text}}>
      {/* sidebar */}
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 210, borderRight: `1px solid ${T.line}`, padding: '20px 16px', background: '#0A0914'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 30}}>
          <FDMark size={28} color={T.accent} color2={T.accent2} />
          <div style={{fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em'}}>
            frontdesk <span style={{color: T.accent}}>AI</span>
          </div>
        </div>
        {NAV.map(([icon, label], i) => (
          <div
            key={label}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, marginBottom: 4, fontSize: 14.5, fontWeight: 600,
              color: i === 0 ? T.text : T.muted, background: i === 0 ? alpha(T.accent, 0.16) : 'transparent',
            }}
          >
            {icon}
            {label}
          </div>
        ))}
        <div style={{position: 'absolute', left: 16, right: 16, bottom: 20, padding: '10px 12px', borderRadius: 12, background: T.surface, fontSize: 12.5, color: T.muted}}>
          Workspace
          <div style={{color: T.text, fontWeight: 700, fontSize: 13.5, marginTop: 2}}>VELORIA Sky Residences</div>
        </div>
      </div>
      {/* top bar */}
      <div style={{position: 'absolute', left: 230, right: 20, top: 18, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div>
          <div style={{fontWeight: 800, fontSize: 21, letterSpacing: '-0.02em'}}>Good morning, team</div>
          <div style={{fontSize: 13, color: T.muted}}>Monday · 9:00 AM · 37 new leads since Friday</div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, color: T.muted}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 8, width: 220, padding: '9px 12px', borderRadius: 10, background: T.surface, fontSize: 13}}>
            <Search size={15} /> Search leads
          </div>
          <Bell size={18} />
          <Avatar name="Maya S." tone={4} size={34} />
        </div>
      </div>
      <Kpi x={230} label="Ready to call" value="3" color={T.hot} glow={pCall} />
      <Kpi x={580} label="Follow-ups sent overnight" value="14" color={T.good} glow={pSent} />
      <Kpi x={930} label="New since Friday" value="37" color={T.accent} />

      {/* ranked queue */}
      <div style={{position: 'absolute', left: 230, top: 190, width: 620, fontSize: 12, fontWeight: 700, color: T.muted, letterSpacing: '0.12em', display: 'flex', justifyContent: 'space-between'}}>
        <span>LEAD QUEUE · RANKED BY INTENT</span>
        <span>SCORE</span>
      </div>
      <div style={{position: 'absolute', left: 230, top: 218}}>
        <Queue
          theme={T} ids={ids} from={ids} to={sorted} at={tRanked - 4} width={620} rowH={72} gap={8} scoreAt={0} tierAt={tRanked + 18}
          focusIds={['sarah', 'omar', 'priya']} focusAt={tThree} dimAfter={3} dimAt={tThree} flash={{sarah: tWhat - 4}}
        />
      </div>

      {/* context panel */}
      <div style={{position: 'absolute', left: 870, top: 190, width: 390, height: 510, borderRadius: 18, padding: 18, background: T.surface, border: `1px solid ${T.line}`}}>
        <div style={{position: 'relative', height: '100%'}}>
          <PanelShell title="Today's focus" opacity={pFocus} dy={0}>
            <div style={{fontSize: 14, lineHeight: 1.55, color: T.muted}}>
              3 buyers are showing strong intent.
              <br />
              14 follow-ups already went out overnight.
            </div>
          </PanelShell>
          <PanelShell title="Sarah K. · activity" badge="SCORE 92" opacity={pDetail} dy={(1 - pDetail) * 16}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
              {TIMELINE.map(([t, text], i) => {
                const p = spring({frame: frame - (tWhat + 2 + i * 5), fps, config: {damping: 16}});
                return (
                  <div key={t} style={{display: 'flex', gap: 12, opacity: p, transform: `translateX(${(1 - p) * 20}px)`}}>
                    <div style={{width: 10, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                      <div style={{width: 10, height: 10, borderRadius: 10, background: i === 0 ? T.hot : T.accent, marginTop: 5}} />
                      {i < TIMELINE.length - 1 ? <div style={{flex: 1, width: 2, background: T.line, marginTop: 4}} /> : null}
                    </div>
                    <div style={{paddingBottom: 6}}>
                      <div style={{fontSize: 12.5, fontWeight: 700, color: T.muted}}>{t}</div>
                      <div style={{fontSize: 15.5, fontWeight: 600, color: T.text}}>{text}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </PanelShell>
          <PanelShell title="Sent overnight" badge="AUTOMATIC" opacity={pSent} dy={(1 - pSent) * 16}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
              {SENT.map(([t, ch, who, what], i) => {
                const p = spring({frame: frame - (tFollow + 4 + i * 6), fps, config: {damping: 16}});
                const tick = frame > tOvernight + i * 4;
                return (
                  <div key={t} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: T.surface2, opacity: p, transform: `translateY(${(1 - p) * 14}px)`}}>
                    <div style={{width: 34, height: 34, borderRadius: 10, background: alpha(ch === 'wa' ? T.good : T.accent, 0.16), color: ch === 'wa' ? T.good : T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      {ch === 'wa' ? <MessageCircle size={17} /> : <Mail size={17} />}
                    </div>
                    <div style={{flex: 1}}>
                      <div style={{fontSize: 14.5, fontWeight: 700}}>{who} · <span style={{color: T.muted, fontWeight: 600}}>{what}</span></div>
                      <div style={{fontSize: 12, color: T.muted}}>{t} · {ch === 'wa' ? 'WhatsApp' : 'Email'}</div>
                    </div>
                    <CheckCheck size={17} color={tick ? T.accent : T.muted} />
                  </div>
                );
              })}
            </div>
          </PanelShell>
          <PanelShell title="Call these first" badge="3 READY" opacity={pCall} dy={(1 - pCall) * 16}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
              {['sarah', 'omar', 'priya'].map((id, i) => {
                const l = lead(id);
                const p = spring({frame: frame - (tThree + 2 + i * 5), fps, config: {damping: 15}});
                const ring = interpolate((frame - tCalling - i * 6) % 40, [0, 40], [0, 1], CLAMP);
                return (
                  <div key={id} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px', borderRadius: 14, background: T.surface2, border: `1px solid ${alpha(T.hot, 0.35)}`, opacity: p, transform: `scale(${0.92 + 0.08 * p})`}}>
                    <Avatar name={l.name} tone={l.tone} size={40} />
                    <div style={{flex: 1}}>
                      <div style={{fontSize: 15.5, fontWeight: 800}}>{l.name} <span style={{color: T.hot}}>{l.score}</span></div>
                      <div style={{fontSize: 12.5, color: T.muted}}>{l.signal}</div>
                    </div>
                    <div style={{position: 'relative', width: 40, height: 40}}>
                      {frame > tCalling ? <div style={{position: 'absolute', inset: -10 * ring, borderRadius: 14, border: `2px solid ${alpha(T.good, 1 - ring)}`}} /> : null}
                      <div style={{position: 'absolute', inset: 0, borderRadius: 12, background: T.good, color: '#06140D', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <PhoneIcon size={18} strokeWidth={2.6} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </PanelShell>
        </div>
      </div>
    </div>
  );
};

const NoLine: React.FC<{at: number; icon: React.ReactNode; text: string; strike?: boolean; dimAt?: number; color: string}> = ({at: t, icon, text, strike = true, dimAt, color}) => {
  const frame = useCurrentFrame();
  const dim = dimAt === undefined ? 0 : interpolate(frame, [dimAt, dimAt + 8], [0, 1], CLAMP);
  return (
    <Rise at={t - 2} dy={40}>
      <div style={{display: 'flex', alignItems: 'center', gap: 34, opacity: 1 - dim * 0.55}}>
        <div style={{width: 110, height: 110, borderRadius: 30, background: alpha(color, 0.14), border: `2px solid ${alpha(color, 0.5)}`, color, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{icon}</div>
        <div style={{fontFamily: T.display, fontWeight: T.displayWeight, fontSize: 104, letterSpacing: T.displayTracking, color: T.text, lineHeight: 1}}>
          <span style={{color}}>No </span>
          {strike ? <Strike at={t + 8} color={alpha(color, 0.9)} thickness={8}>{text}</Strike> : text}
        </div>
      </div>
    </Rise>
  );
};

export const H4: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tYour = w('your');
  const tOpens = w('opens');
  const tEvery = w('every');
  const tWhat = w('what');
  const tThree = w('three');
  const tNo1 = w('no');
  const tNo2 = w('no', 2);
  const tNo3 = w('no', 3);
  const tThats = w("that's");
  const tDM = w('dm');
  const rise = spring({frame: frame - (tOpens - 10), fps, config: {damping: 20, stiffness: 60}});
  const back = interpolate(frame, [tNo1 - 10, tNo1 + 10], [0, 1], CLAMP);
  const gone = interpolate(frame, [tThats - 12, tThats], [0, 1], CLAMP);
  const panelX = WIN_X + 870 * K + 195 * K;
  const panelY = WIN_Y + 54 * K + 445 * K;
  const tableX = WIN_X + 540 * K;
  const tableY = WIN_Y + 54 * K + 440 * K;
  return (
    <AbsoluteFill>
      <Stage theme={T}>
        {/* Monday. Nine AM. */}
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Rise at={0} exitAt={tYour - 8} dy={40}>
            <div style={{display: 'flex', alignItems: 'center', gap: 60}}>
              <div style={{color: T.hot}}>
                <Coffee size={150} strokeWidth={1.5} />
              </div>
              <Clock theme={T} time="9:00" ampm="AM" size={260} label="MONDAY" />
            </div>
          </Rise>
        </div>

        {/* one screen */}
        <Show from={tYour - 12} to={tThats + 2}>
          <div style={{position: 'absolute', inset: 0, opacity: 1 - gone, filter: back > 0.01 ? `blur(${back * 10}px) brightness(${1 - back * 0.55})` : undefined}}>
            <Camera
              keys={[
                [0, 1, 960, 540], [tEvery - 2, 1, 960, 540], [tEvery + 22, 1.32, tableX, tableY], [tWhat - 10, 1.32, tableX, tableY],
                [tWhat + 14, 1.5, panelX, panelY], [tThree - 8, 1.5, panelX, panelY], [tThree + 16, 1.16, 1130, 520], [tNo1 - 10, 1.16, 1130, 520], [tNo1 + 20, 0.86, 960, 540],
              ]}
            >
              <div
                style={{
                  position: 'absolute', left: WIN_X, top: WIN_Y, perspective: 2400,
                  opacity: Math.min(1, rise * 1.5), transform: `translateY(${(1 - rise) * 500}px)`,
                }}
              >
                <div style={{transform: `rotateX(${(1 - rise) * 32}deg) scale(${0.9 + 0.1 * rise})`, transformOrigin: '50% 100%'}}>
                  <Browser width={WIN_W} lh={LH} url="app.frontdesk.ai/queue">
                    <Dashboard />
                  </Browser>
                </div>
              </div>
            </Camera>
          </div>
        </Show>

        {/* No spreadsheets. No guessing. No hot lead left waiting. */}
        <Show from={tNo1 - 4} to={tThats + 2}>
          <div style={{position: 'absolute', left: 250, top: 250, display: 'flex', flexDirection: 'column', gap: 50, opacity: 1 - gone}}>
            <NoLine at={tNo1} icon={<Sheet size={56} strokeWidth={2} />} text="spreadsheets." dimAt={tNo2 - 4} color={T.accent2} />
            {frame >= tNo2 - 3 ? <NoLine at={tNo2} icon={<Dices size={56} strokeWidth={2} />} text="guessing." dimAt={tNo3 - 4} color={T.accent2} /> : null}
            {frame >= tNo3 - 3 ? <NoLine at={tNo3} icon={<Flame size={56} strokeWidth={2} />} text="hot lead left waiting." strike={false} color={T.hot} /> : null}
          </div>
        </Show>

        <Show from={tYour - 6} to={tNo1 - 4}>
          <Captions theme={T} vo={V} y={955} size={42} maxWords={7} />
        </Show>
        <Sequence from={tThats - 6}>
          <EndCard theme={T} vertical={false} headline="That's *frontdesk AI.*" ctaAt={tDM - tThats + 4} />
        </Sequence>
      </Stage>
      <Soundtrack
        vo="h4" music="tech" musicVol={0.14}
        cues={[
          [0, 'chime', 0.14], [tYour - 8, 'whoosh', 0.2], [tOpens - 10, 'riser', 0.2], [tOpens + 4, 'impact', 0.3], [tEvery, 'whoosh', 0.2], [w('ranked') - 4, 'blips'],
          [tWhat - 8, 'whoosh', 0.2], [tWhat + 2, 'pop', 0.2], [w('follow-ups') - 2, 'pop', 0.2], [w('overnight.'), 'send'], [tThree - 2, 'whoosh', 0.2], [w('calling'), 'chime', 0.16],
          [tNo1 - 2, 'impact', 0.3], [tNo1 + 8, 'click'], [tNo2 - 2, 'impact', 0.25], [tNo2 + 8, 'click'], [tNo3 - 2, 'impact', 0.3], [w('waiting.'), 'sparkle'],
          [tThats - 6, 'whoosh'], [tThats + 10, 'sparkle'], [tDM, 'pop'],
        ]}
      />
    </AbsoluteFill>
  );
};
