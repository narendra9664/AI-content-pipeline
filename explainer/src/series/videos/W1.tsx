import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BellRing, CalendarCheck, CalendarDays, Compass, Mail, Megaphone, Moon, Search, Snowflake, Users} from 'lucide-react';
import {BODY, CLAMP, THEMES, alpha} from '../theme';
import {VOData, at} from '../vo';
import vo from '../vo/w1.json';
import {Stage} from '../kit/Stage';
import {SpokenHeadline} from '../kit/Text';
import {Browser, BrowserStack} from '../kit/Frames';
import {D, DESKTOP_OUTLINES, Signals, SiteDesktop, XRay} from '../kit/Site';
import {Beam, Chip, Cursor, Rise, Show} from '../kit/Misc';
import {Avatar, Queue, ScoreRing} from '../kit/Lead';
import {ChatCard, Toast} from '../kit/Chat';
import {EndCard, LogoLockup} from '../kit/Logo';
import {Soundtrack} from '../kit/Audio';

const T = THEMES.brand;
const V = vo as VOData;
// The voiceover plus 3 s on the end card: 45 s with the current voice, as the website's button says.
export const W1_FRAMES = Math.ceil(V.duration * 30) + 90;
const w = (word: string, n = 1) => at(V, word, n);
const SERIF = T.display;

const FadeOut: React.FC<{at: number; children: React.ReactNode}> = ({at: t, children}) => {
  const frame = useCurrentFrame();
  return <div style={{position: 'absolute', inset: 0, opacity: interpolate(frame, [t, t + 12], [1, 0], CLAMP)}}>{children}</div>;
};

// 1. Buyers browse, compare, and come back at midnight.
const BW = 1240;
const BK = BW / 1280;
const BX = (1920 - BW) / 2;
const BY = 200;
const Browse: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tBrowse = w('browse.');
  const tCompare = w('compare.');
  const tMidnight = w('midnight');
  const enter = spring({frame, fps, config: {damping: 20, stiffness: 80}});
  const scroll = interpolate(frame, [tBrowse - 6, tBrowse + 20], [0, 180], {...CLAMP, easing: (x) => x * x * (3 - 2 * x)});
  const cmp = frame >= tCompare - 4 ? (Math.floor((frame - tCompare) / 9) % 2 === 0 ? 'ph42a' : 'sv38c') : '';
  const night = interpolate(frame, [tMidnight - 8, tMidnight + 6], [0, 1], CLAMP);
  const cx = (x: number) => BX + x * BK;
  const cy = (y: number) => BY + (54 + y - scroll) * BK;
  return (
    <>
      <div style={{position: 'absolute', left: BX, top: BY, opacity: enter, transform: `translateY(${(1 - enter) * 200}px)`}}>
        <Browser width={BW} lh={760} url="veloria-residences.com">
          <SiteDesktop scroll={scroll} glow={{ph42a: cmp === 'ph42a' ? 1 : 0, sv38c: cmp === 'sv38c' ? 1 : 0}} />
        </Browser>
        <div style={{position: 'absolute', inset: 0, borderRadius: 16, background: `rgba(3,5,20,${0.45 * night})`, pointerEvents: 'none'}} />
      </div>
      <Cursor
        path={[
          [4, 1500, 900], [30, cx(760), cy(300)], [tBrowse, cx(900), cy(420)], [tBrowse + 22, cx(240), cy(640)],
          [tCompare - 4, cx(250), cy(650)], [tCompare + 8, cx(640), cy(650)], [tCompare + 17, cx(250), cy(650)], [tCompare + 26, cx(640), cy(650)], [tMidnight + 30, cx(250), cy(650)],
        ]}
        color={T.accent}
        size={32}
      />
      <div style={{position: 'absolute', right: BX + 24, top: BY + 76}}>
        <Rise at={tMidnight - 4} dy={-20}>
          <Chip theme={T} icon={<Moon size={30} strokeWidth={2.4} />} text="12:04 AM" meta="· back again" color={T.hot} size={34} />
        </Rise>
      </div>
    </>
  );
};

// 2. Nobody sees it; the hottest buyer cools off.
const Cooling: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tMost = w('most');
  const tWait = w('wait,');
  const tCold = w('cold.');
  const cool = interpolate(frame, [tWait - 6, tCold + 6], [0, 1], {...CLAMP, easing: (x) => x * x * (3 - 2 * x)});
  const days = Math.min(3, Math.max(0, Math.floor((frame - tWait + 4) / 12) + 1));
  const ICE = '#8FD3FF';
  const mix = (a: string, b: string, t: number) => {
    const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const [x, y] = [p(a), p(b)];
    return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`;
  };
  const col = mix(T.hot, ICE, cool);
  const score = Math.round(92 - 58 * cool);
  const inbox = spring({frame: frame - tMost, fps, config: {damping: 16}});
  const lead = spring({frame: frame - (tWait - 14), fps, config: {damping: 16}});
  return (
    <>
      <div style={{position: 'absolute', left: 190, top: 330, opacity: inbox, transform: `translateY(${(1 - inbox) * 40}px)`}}>
        <div style={{width: 640, padding: 38, borderRadius: 36, background: T.surface, border: `1px solid ${T.line}`, fontFamily: BODY}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, fontWeight: 800, fontSize: 30, color: T.text}}>
            <Mail size={32} /> Sales inbox
          </div>
          <div style={{height: 1, background: T.line, margin: '24px 0'}} />
          <div style={{fontFamily: SERIF, fontSize: 120, lineHeight: 1, color: T.text}}>0</div>
          <div style={{fontWeight: 600, fontSize: 28, color: T.muted, marginTop: 8}}>new enquiries today</div>
          <div style={{fontWeight: 500, fontSize: 24, color: alpha(T.muted, 0.8), marginTop: 18}}>No forms filled. Nothing to follow up. Or so it seems.</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 900, top: 380, opacity: lead, transform: `translateY(${(1 - lead) * 40}px)`}}>
        <div
          style={{
            width: 820, padding: 38, borderRadius: 36, background: T.surface, border: `1.5px solid ${alpha(col, 0.6)}`, boxShadow: `0 0 80px ${alpha(cool > 0.5 ? ICE : T.hot, 0.18)}`,
            display: 'flex', alignItems: 'center', gap: 30, fontFamily: BODY, position: 'relative', overflow: 'hidden',
          }}
        >
          <ScoreRing theme={T} value={score} size={190} start={0} dur={1} color={col} label={cool > 0.6 ? 'COLD' : 'HOT'} />
          <div style={{flex: 1}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <Avatar name="Sarah K." tone={0} size={56} />
              <div style={{fontWeight: 800, fontSize: 38, color: T.text}}>Sarah K.</div>
            </div>
            <div style={{fontWeight: 600, fontSize: 26, color: T.muted, marginTop: 12}}>Viewed Penthouse 42A four times</div>
            <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 14, padding: '8px 16px', borderRadius: 999, background: alpha(col, 0.14), color: col, fontWeight: 800, fontSize: 25}}>
              {cool > 0.6 ? <Snowflake size={24} /> : null} Waiting {days} {days === 1 ? 'day' : 'days'} · no one called
            </div>
          </div>
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${alpha(ICE, 0.12 * cool)}, rgba(0,0,0,0))`, pointerEvents: 'none'}} />
        </div>
      </div>
    </>
  );
};

// 4. Track every visit, click and inquiry, across the site and campaigns.
const SOURCES: [string, React.ReactNode][] = [
  ['Instagram ads', <Megaphone key="i" size={28} strokeWidth={2.4} />],
  ['Google search', <Search key="g" size={28} strokeWidth={2.4} />],
  ['Email campaigns', <Mail key="e" size={28} strokeWidth={2.4} />],
  ['Property portals', <Compass key="p" size={28} strokeWidth={2.4} />],
];
const Tracking: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tTracks = w('tracks');
  const tVisit = w('visit,');
  const tClick = w('click');
  const tInquiry = w('inquiry');
  const tCampaigns = w('campaigns.');
  const sep = spring({frame: frame - (tTracks - 16), fps, config: {damping: 20, stiffness: 55}});
  const tags = [
    {id: 'ph42a', text: 'Visit · 4th', icon: 'eye' as const, at: tVisit, hot: true},
    {id: 'plans', text: 'Click · floor plans', icon: 'tap' as const, at: tClick, dx: 0, dy: -44},
    {id: 'navBook', text: 'Inquiry', icon: 'price' as const, at: tInquiry, dx: -40, dy: 56},
  ];
  return (
    <>
      <div style={{position: 'absolute', left: 120, top: 330, display: 'flex', flexDirection: 'column', gap: 22}}>
        {SOURCES.map(([name, icon], i) => {
          const p = spring({frame: frame - (tCampaigns - 18 + i * 4), fps, config: {damping: 15}});
          return (
            <div
              key={name}
              style={{
                display: 'flex', alignItems: 'center', gap: 16, width: 380, padding: '18px 22px', borderRadius: 22, background: T.surface,
                border: `1px solid ${alpha(T.accent2, 0.35)}`, opacity: p, transform: `translateX(${(1 - p) * -60}px)`, fontFamily: BODY,
              }}
            >
              <div style={{width: 52, height: 52, borderRadius: 16, background: alpha(T.accent2, 0.14), color: T.accent2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{icon}</div>
              <div style={{fontWeight: 700, fontSize: 28, color: T.text}}>{name}</div>
            </div>
          );
        })}
      </div>
      {SOURCES.map((_, i) => (
        <Beam key={i} x1={505} y1={375 + i * 112} x2={760} y2={600} at={tCampaigns - 10 + i * 4} color={T.accent2} width={3} dur={14} />
      ))}
      <div style={{position: 'absolute', left: 640, top: 200}}>
        <BrowserStack
          width={1180} lh={760} url="veloria-residences.com" rx={48 * sep} rz={-16 * sep} scale={1 - 0.2 * sep} chromeOpacity={1 - sep}
          layers={[
            {
              key: 'x', z: 0, bg: T.surface, shadow: `0 0 0 2px ${alpha(T.accent, 0.7 * sep)}, 0 0 90px ${alpha(T.accent, 0.35 * sep)}`,
              node: (
                <XRay
                  theme={T} boxes={D} outlines={DESKTOP_OUTLINES} w={1280} h={760} tags={tags} tagSize={20} gridSize={32}
                  heat={[{id: 'ph42a', at: tVisit}, {id: 'plans', at: tClick, r: 140}, {id: 'navBook', at: tInquiry, r: 140}]}
                  header={{text: 'Live · every visit, click and inquiry', at: tTracks}}
                />
              ),
            },
            {key: 's', z: 170 * sep + 0.5, opacity: interpolate(sep, [0.2, 0.5], [0, 1], CLAMP), node: <Signals theme={T} boxes={D} ids={['headline', 'image', 'plans', 'ph42a', 'sv38c', 'navBook']} at={tTracks} />},
            {key: 'site', z: 340 * sep + 1, opacity: 1 - 0.12 * sep, bg: '#0D0E11', shadow: `0 80px 140px rgba(0,0,0,${0.55 * sep})`, node: <SiteDesktop />},
          ]}
        />
      </div>
    </>
  );
};

// 5. Score and rank.
const Ranking: React.FC = () => {
  const tScores = w('scores');
  const tIntent = w('intent');
  const tRanks = w('ranks');
  const tReady = w('ready.');
  const ids = ['james', 'daniel', 'sarah', 'mei', 'omar'];
  const sorted = ['sarah', 'omar', 'james', 'daniel', 'mei'];
  return (
    <>
      <div style={{position: 'absolute', left: 170, top: 300}}>
        <Rise at={tScores - 6} dy={50}>
          <div style={{width: 560, padding: '40px 0', borderRadius: 40, background: T.surface, border: `1px solid ${T.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, fontFamily: BODY}}>
            <ScoreRing theme={T} value={92} size={300} start={tIntent - 4} dur={40} label="INTENT" color={T.hot} />
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <Avatar name="Sarah K." tone={0} size={52} />
              <div style={{fontWeight: 800, fontSize: 34, color: T.text}}>Sarah K.</div>
            </div>
            <div style={{fontWeight: 600, fontSize: 24, color: T.muted}}>4 visits · floor plans · pricing</div>
          </div>
        </Rise>
      </div>
      <div style={{position: 'absolute', left: 820, top: 300}}>
        <Rise at={tRanks - 10} dy={0} scale={1} blur={false}>
          <Queue
            theme={T} ids={ids} from={ids} to={sorted} at={tRanks + 6} width={920} rowH={116} gap={16} scoreAt={tRanks - 8} tierAt={tRanks + 30}
            focusIds={['sarah', 'omar']} focusAt={tReady - 4} dimAfter={2} dimAt={tReady - 4} enterAt={tRanks - 10}
          />
        </Rise>
      </div>
    </>
  );
};

// 6. Personal follow-up + the right agent alerted.
const FollowUp: React.FC = () => {
  const tMoment = w('moment');
  const tPersonally = w('personally,');
  const tAlerts = w('alerts');
  return (
    <>
      <div style={{position: 'absolute', left: 170, top: 300}}>
        <Rise at={w('and', 5) - 8} dy={60}>
          <ChatCard
            theme={T} width={860} name="Sarah K." tone={0} status="WhatsApp · personal, automatic" size={34} readAt={tAlerts}
            messages={[
              {from: 'us', text: 'Hi Sarah, lovely to see you back on Penthouse 42A. Would a private viewing this Saturday suit you?', at: tPersonally - 6, typing: 22},
              {from: 'them', text: 'Yes please, 11 AM?', at: tAlerts + 14, typing: 10},
            ]}
          />
        </Rise>
      </div>
      <div style={{position: 'absolute', left: 1090, top: 380}}>
        <Rise at={tAlerts - 4} dy={-40}>
          <Toast theme={T} at={tAlerts - 4} width={680} icon={<BellRing size={32} strokeWidth={2.4} />} title="Maya · hot lead" body="Sarah K. · 92 · wants a viewing" meta="now" color={T.hot} size={34} />
        </Rise>
      </div>
      <div style={{position: 'absolute', left: 1090, top: 560}}>
        <Rise at={tAlerts + 30} dy={30}>
          <Chip theme={T} icon={<CalendarCheck size={30} strokeWidth={2.4} />} text="Viewing booked" meta="· Sat 11:00" color={T.good} size={34} />
        </Rise>
      </div>
    </>
  );
};

// 7. Outcomes, in words only (no invented numbers).
const Outcomes: React.FC = () => {
  const lines: [number, React.ReactNode, string][] = [
    [w('fewer'), <Users key="u" size={50} strokeWidth={1.8} />, 'Fewer missed buyers.'],
    [w('faster'), <CalendarDays key="c" size={50} strokeWidth={1.8} />, 'Faster viewings.'],
    [w('a', 2), <BellRing key="b" size={50} strokeWidth={1.8} />, 'Always know who to call next.'],
  ];
  return (
    <div style={{position: 'absolute', left: 260, top: 280, display: 'flex', flexDirection: 'column', gap: 46}}>
      {lines.map(([t, icon, text]) => (
        <Rise key={text} at={t - 3} dy={40}>
          <div style={{display: 'flex', alignItems: 'center', gap: 40}}>
            <div style={{width: 110, height: 110, borderRadius: 32, border: `1.5px solid ${alpha(T.accent2, 0.5)}`, background: alpha(T.accent2, 0.1), color: T.accent2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{icon}</div>
            <div style={{fontFamily: SERIF, fontSize: 104, lineHeight: 1, color: T.text}}>{text}</div>
          </div>
        </Rise>
      ))}
    </div>
  );
};

export const W1: React.FC = () => {
  const tMost = w('most');
  const tFD = w('frontdesk');
  const tIt = w('it', 2);
  const tIt2 = w('it', 3);
  const tAnd = w('and', 5);
  const tFewer = w('fewer');
  const tFD2 = w('frontdesk', 2);
  const tBook = w('book');
  return (
    <AbsoluteFill>
      <Stage theme={T}>
        <Show to={tMost + 2}>
          <FadeOut at={tMost - 10}>
            <Browse />
          </FadeOut>
        </Show>
        <Show from={tMost - 8} to={tFD + 2}>
          <FadeOut at={tFD - 10}>
            <Cooling />
          </FadeOut>
        </Show>
        <Show from={tFD - 6} to={tIt + 4}>
          <FadeOut at={tIt - 8}>
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 60}}>
              <LogoLockup theme={T} start={tFD - 4} mark={200} word={72} />
            </div>
          </FadeOut>
        </Show>
        <Show from={tIt - 8} to={tIt2 + 4}>
          <FadeOut at={tIt2 - 8}>
            <Tracking />
          </FadeOut>
        </Show>
        <Show from={tIt2 - 8} to={tAnd + 4}>
          <FadeOut at={tAnd - 8}>
            <Ranking />
          </FadeOut>
        </Show>
        <Show from={tAnd - 8} to={tFewer + 2}>
          <FadeOut at={tFewer - 10}>
            <FollowUp />
          </FadeOut>
        </Show>
        <Show from={tFewer - 6} to={tFD2 + 2}>
          <FadeOut at={tFD2 - 10}>
            <Outcomes />
          </FadeOut>
        </Show>

        <SpokenHeadline
          theme={T} vo={V} size={58} y={70} width={1700} hideAfter={tFewer - 6} splitComma italicAccent skip={[]}
          emph={['browse.', 'compare.', 'midnight', 'never', 'cold.', 'every', 'intent', 'ready.', 'personally,']} emph2={['frontdesk', 'ai']}
        />
        <Sequence from={tFD2 - 6}>
          <EndCard
            theme={T} vertical={false} headline="Know which buyers are *ready.*" ctaAt={tBook - tFD2 + 6} cta="Book your free audit" sub="See where your buyers slip through" handle=""
            italicAccent icon={<CalendarCheck size={38} strokeWidth={2.4} />}
          />
        </Sequence>
      </Stage>
      <Soundtrack
        vo="w1" music="luxury" musicVol={0.3}
        cues={[
          [2, 'whoosh', 0.2], [w('browse.'), 'whoosh', 0.15], [w('compare.'), 'click'], [w('midnight') - 4, 'chime', 0.14],
          [tMost - 8, 'whoosh', 0.2], [w('wait,'), 'blips', 0.3], [w('cold.'), 'impact', 0.25],
          [tFD - 6, 'riser', 0.25], [tFD, 'sparkle'], [tIt - 8, 'whoosh', 0.2], [w('tracks') - 16, 'scan', 0.3], [w('visit,'), 'pop', 0.2], [w('click'), 'click'], [w('inquiry'), 'pop', 0.2], [w('campaigns.') - 12, 'blips', 0.3],
          [tIt2 - 8, 'whoosh', 0.2], [w('intent') - 4, 'blips', 0.3], [w('ranks') + 6, 'whoosh', 0.2], [w('ready.'), 'chime', 0.14],
          [tAnd - 8, 'whoosh', 0.2], [w('personally,') - 28, 'typing', 0.3], [w('personally,') - 6, 'send'], [w('alerts') - 4, 'chime', 0.16], [w('alerts') + 14, 'pop'], [w('alerts') + 30, 'pop', 0.2],
          [tFewer - 3, 'pop', 0.2], [w('faster') - 3, 'pop', 0.2], [w('a', 2) - 3, 'pop', 0.2],
          [tFD2 - 6, 'whoosh', 0.2], [tFD2 + 10, 'sparkle'], [tBook + 6, 'pop'],
        ]}
      />
    </AbsoluteFill>
  );
};
