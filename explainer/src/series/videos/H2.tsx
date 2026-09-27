import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CalendarCheck, Download, Eye, Flame, MessageCircle, Phone as PhoneIcon, Repeat, Sprout, Tag, ThermometerSun} from 'lucide-react';
import {BODY, CLAMP, THEMES, alpha} from '../theme';
import {VOData, at} from '../vo';
import vo from '../vo/h2.json';
import {Stage} from '../kit/Stage';
import {SpokenHeadline} from '../kit/Text';
import {Beam, Rise, Show} from '../kit/Misc';
import {Avatar, LeadCard, LeadRow, ScoreRing, lead} from '../kit/Lead';
import {FDMark, EndCard} from '../kit/Logo';
import {Soundtrack} from '../kit/Audio';

const T = THEMES.lilac;
const V = vo as VOData;
export const H2_FRAMES = Math.ceil(V.duration * 30) + 45;
const w = (word: string, n = 1) => at(V, word, n);

// "Not every lead is equal": = becomes ≠
const NotEqual: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tEqual = w('equal.');
  const p = spring({frame: frame - 4, fps, config: {damping: 14}});
  const s = interpolate(frame, [tEqual, tEqual + 8], [0, 1], CLAMP);
  return (
    <div style={{position: 'absolute', left: 900, top: 400, width: 120, height: 120, transform: `scale(${p * 1.2})`}}>
      <div style={{position: 'absolute', left: 14, top: 36, width: 92, height: 14, borderRadius: 8, background: s > 0 ? T.accent : T.muted}} />
      <div style={{position: 'absolute', left: 14, top: 70, width: 92, height: 14, borderRadius: 8, background: s > 0 ? T.accent : T.muted}} />
      <div style={{position: 'absolute', left: 54, top: 6, width: 14, height: 108 * s, borderRadius: 8, background: T.accent2, transform: 'rotate(28deg)', transformOrigin: '50% 0'}} />
    </div>
  );
};

const SIGNALS: {icon: React.ReactNode; text: string; weight: number}[] = [
  {icon: <Eye size={30} strokeWidth={2.4} />, text: 'Page views', weight: 0.35},
  {icon: <Repeat size={30} strokeWidth={2.4} />, text: 'Return visits', weight: 0.8},
  {icon: <Download size={30} strokeWidth={2.4} />, text: 'Floor plan downloads', weight: 0.7},
  {icon: <Tag size={30} strokeWidth={2.4} />, text: 'Pricing questions', weight: 0.9},
  {icon: <MessageCircle size={30} strokeWidth={2.4} />, text: 'WhatsApp replies', weight: 0.75},
  {icon: <CalendarCheck size={30} strokeWidth={2.4} />, text: 'Viewing requests', weight: 0.95},
];
const CHIP_X = 150;
const CHIP_W = 640;
const CHIP_Y = 280;
const CHIP_GAP = 108;
const ENGINE = {x: 1110, y: 600};

const Engine: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tWeighs = w('weighs');
  const tPage = w('page');
  const tWA = w('whatsapp');
  const tTurns = w('turns');
  const tIntent = w('intent');
  const glow = interpolate(frame, [tTurns - 10, tTurns + 10], [0.3, 1], CLAMP);
  const tFD = w('frontdesk');
  const ring = spring({frame: frame - (tFD - 2), fps, config: {damping: 16}});
  const hl = (i: number) => (i === 0 ? interpolate(frame, [tPage, tPage + 6, tPage + 30], [0, 1, 0.2], CLAMP) : i === 4 ? interpolate(frame, [tWA, tWA + 6, tWA + 30], [0, 1, 0.2], CLAMP) : 0);
  return (
    <>
      {SIGNALS.map((sg, i) => {
        const t = tFD + 6 + i * 6;
        const p = spring({frame: frame - t, fps, config: {damping: 15, stiffness: 140}});
        const bar = interpolate(frame, [t + 8, t + 30], [0, sg.weight], {...CLAMP, easing: (x) => 1 - Math.pow(1 - x, 3)});
        const h = hl(i);
        const y = CHIP_Y + i * CHIP_GAP;
        return (
          <React.Fragment key={sg.text}>
            <Beam x1={CHIP_X + CHIP_W + 6} y1={y + 44} x2={ENGINE.x - 130} y2={ENGINE.y} at={t + 14} color={T.accent} width={3} dur={16} />
            <div
              style={{
                position: 'absolute', left: CHIP_X, top: y, width: CHIP_W, height: 88, borderRadius: 24, padding: '0 26px', display: 'flex', alignItems: 'center', gap: 18,
                background: T.surface, border: `1.5px solid ${h > 0.05 ? alpha(T.accent2, 0.4 + 0.6 * h) : T.line}`,
                boxShadow: `0 14px 40px rgba(40,20,90,0.08), 0 0 ${40 * h}px ${alpha(T.accent2, 0.5 * h)}`,
                opacity: p, transform: `translateX(${(1 - p) * -80}px) scale(${1 + h * 0.04})`, fontFamily: BODY,
              }}
            >
              <div style={{width: 54, height: 54, borderRadius: 16, background: alpha(T.accent, 0.12), color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{sg.icon}</div>
              <div style={{flex: 1, fontWeight: 700, fontSize: 30, color: T.text}}>{sg.text}</div>
              <div style={{width: 120, height: 10, borderRadius: 6, background: alpha(T.accent, 0.12)}}>
                <div style={{width: `${bar * 100}%`, height: '100%', borderRadius: 6, background: `linear-gradient(90deg, ${T.accent}, ${T.accent2})`}} />
              </div>
            </div>
          </React.Fragment>
        );
      })}
      {/* the engine */}
      <div style={{position: 'absolute', left: ENGINE.x - 130, top: ENGINE.y - 130, width: 260, height: 260, transform: `scale(${ring})`}}>
        <div style={{position: 'absolute', inset: -40, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(T.accent, 0.35 * glow)} 0%, rgba(0,0,0,0) 70%)`}} />
        <svg width={260} height={260} style={{position: 'absolute', inset: 0, transform: `rotate(${frame * 1.2}deg)`}}>
          <circle cx={130} cy={130} r={120} fill="none" stroke={T.accent} strokeWidth={4} strokeDasharray="10 14" opacity={0.7} />
        </svg>
        <svg width={260} height={260} style={{position: 'absolute', inset: 0, transform: `rotate(${-frame * 0.8}deg)`}}>
          <circle cx={130} cy={130} r={98} fill="none" stroke={T.accent2} strokeWidth={3} strokeDasharray="60 30" opacity={0.6} />
        </svg>
        <div
          style={{
            position: 'absolute', left: 50, top: 50, width: 160, height: 160, borderRadius: '50%', background: T.surface, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 20px 60px ${alpha(T.accent, 0.35)}`,
          }}
        >
          <FDMark size={78} color={T.accent} color2={T.accent2} />
        </div>
      </div>
      <Beam x1={ENGINE.x + 130} y1={ENGINE.y} x2={1440} y2={ENGINE.y} at={tTurns} color={T.accent2} width={4} dur={14} />
      <div style={{position: 'absolute', left: 1450, top: ENGINE.y - 220}}>
        <Rise at={tTurns + 6} dy={40}>
          <div
            style={{
              width: 380, padding: '36px 0 30px', borderRadius: 36, background: T.surface, border: `1px solid ${T.line}`, boxShadow: '0 30px 80px rgba(40,20,90,0.12)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, fontFamily: BODY,
            }}
          >
            <ScoreRing theme={T} value={88} size={250} start={tIntent - 4} label="INTENT" color={T.hot} />
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <Avatar name="Omar R." tone={1} size={46} />
              <div style={{fontWeight: 800, fontSize: 30, color: T.text}}>Omar R.</div>
            </div>
          </div>
        </Rise>
      </div>
    </>
  );
};

const COLS: {key: 'hot' | 'warm' | 'nurture'; title: string; icon: React.ReactNode; ids: string[]; word: string}[] = [
  {key: 'hot', title: 'Hot', icon: <Flame size={30} strokeWidth={2.6} />, ids: ['sarah', 'omar', 'priya'], word: 'hot,'},
  {key: 'warm', title: 'Warming up', icon: <ThermometerSun size={30} strokeWidth={2.6} />, ids: ['james', 'aisha'], word: 'warming'},
  {key: 'nurture', title: 'Nurture', icon: <Sprout size={30} strokeWidth={2.6} />, ids: ['daniel', 'mei', 'rahul'], word: 'nurturing.'},
];

const Columns: React.FC<{focusHot: number}> = ({focusHot}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tSees = w('sees');
  return (
    <>
      {COLS.map((c, ci) => {
        const colP = spring({frame: frame - (tSees - 6 + ci * 4), fps, config: {damping: 16}});
        const color = c.key === 'hot' ? T.hot : c.key === 'warm' ? T.accent : T.muted;
        const t0 = w(c.word);
        const dim = c.key === 'hot' ? 0 : focusHot;
        return (
          <div
            key={c.key}
            style={{
              position: 'absolute', left: 130 + ci * 570, top: 270, width: 520, height: 700, borderRadius: 34, padding: 22,
              background: alpha(T.surface, 0.7), border: `1.5px solid ${c.key === 'hot' && focusHot > 0 ? alpha(T.hot, 0.4 + 0.6 * focusHot) : T.line}`,
              boxShadow: c.key === 'hot' && focusHot > 0 ? `0 0 ${70 * focusHot}px ${alpha(T.hot, 0.3 * focusHot)}` : '0 20px 60px rgba(40,20,90,0.07)',
              opacity: colP * (1 - dim * 0.55), transform: `translateY(${(1 - colP) * 60}px) scale(${1 + (c.key === 'hot' ? focusHot * 0.03 : 0)})`,
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '4px 8px 20px', color, fontFamily: BODY, fontWeight: 800, fontSize: 32, letterSpacing: '-0.01em'}}>
              {c.icon}
              {c.title}
              <div style={{marginLeft: 'auto', fontSize: 26, color: T.muted}}>{c.ids.length}</div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
              {c.ids.map((id, k) => {
                const p = spring({frame: frame - (t0 - 4 + k * 5), fps, config: {damping: 14, stiffness: 150}});
                return (
                  <div key={id} style={{opacity: p, transform: `translateY(${(1 - p) * -50}px) scale(${0.9 + 0.1 * p})`}}>
                    <LeadRow theme={T} l={lead(id)} width={476} h={104} showTier={false} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
};

const AgentDay: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tAgents = w('agents');
  const rows = [
    ['10:00', 'Call Sarah K.', 'Penthouse 42A · 4 visits', 'sarah'],
    ['11:30', 'Private viewing · Omar R.', 'Asked about payment plans', 'omar'],
    ['14:00', 'Call Priya M.', 'Downloaded floor plans', 'priya'],
  ];
  return (
    <div
      style={{
        position: 'absolute', left: 1000, top: 290, width: 800, padding: 34, borderRadius: 36, background: T.surface, border: `1px solid ${T.line}`,
        boxShadow: '0 30px 80px rgba(40,20,90,0.12)', fontFamily: BODY,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 26}}>
        <Avatar name="Maya S." tone={4} size={70} />
        <div>
          <div style={{fontWeight: 800, fontSize: 34, color: T.text}}>Maya&apos;s day</div>
          <div style={{fontWeight: 500, fontSize: 24, color: T.muted}}>Senior sales · Hot leads first</div>
        </div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        {rows.map(([time, title, sub, id], i) => {
          const p = spring({frame: frame - (tAgents + i * 7), fps, config: {damping: 15, stiffness: 140}});
          return (
            <div
              key={time}
              style={{
                display: 'flex', alignItems: 'center', gap: 22, padding: '20px 22px', borderRadius: 22, background: T.surface2,
                opacity: p, transform: `translateX(${(1 - p) * 60}px)`,
              }}
            >
              <div style={{width: 92, fontWeight: 800, fontSize: 30, color: T.accent}}>{time}</div>
              <div style={{flex: 1}}>
                <div style={{fontWeight: 700, fontSize: 30, color: T.text}}>{title}</div>
                <div style={{fontWeight: 500, fontSize: 23, color: T.muted}}>{sub}</div>
              </div>
              <div style={{fontWeight: 800, fontSize: 32, color: T.hot}}>{lead(id).score}</div>
              <div style={{width: 52, height: 52, borderRadius: 16, background: T.good, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <PhoneIcon size={26} strokeWidth={2.6} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const H2: React.FC = () => {
  const frame = useCurrentFrame();
  const tViewed = w('viewed');
  const tFour = w('four');
  const tDown = w('downloaded');
  const tPay = w('payment');
  const tFD = w('frontdesk');
  const tYour = w('your');
  const tSo = w('so');
  const tAgents = w('agents');
  const tDeals = w('deals');
  const tDM = w('dm');
  const focusHot = interpolate(frame, [tSo - 4, tSo + 10], [0, 1], CLAMP);
  const colsX = interpolate(frame, [tSo - 2, tSo + 16], [0, 1], {...CLAMP, easing: (x) => x * x * (3 - 2 * x)});
  return (
    <AbsoluteFill>
      <Stage theme={T}>
        {/* A vs B */}
        <div style={{position: 'absolute', left: 110, top: 300}}>
          <Rise at={4} exitAt={tFD - 12} dy={50}>
            <LeadCard theme={T} l={lead('mei')} width={780} scoreAt={tPay + 16} source="Website · 1 visit" signals={[{text: 'Viewed a listing, once', at: tViewed}]} />
          </Rise>
        </div>
        <div style={{position: 'absolute', left: 1030, top: 300}}>
          <Rise at={8} exitAt={tFD - 10} dy={50}>
            <LeadCard
              theme={T} l={lead('omar')} width={780} scoreAt={tPay + 16} source="Website · returning visitor"
              signals={[
                {text: 'Came back 4 times', at: tFour, pts: '+20'},
                {text: 'Downloaded the floor plan', at: tDown, pts: '+18'},
                {text: 'Asked about payment plans', at: tPay, pts: '+22'},
              ]}
            />
          </Rise>
        </div>
        <Show to={tFD - 6}>
          <Rise at={0} exitAt={tFD - 16} dy={0}>
            <NotEqual />
          </Rise>
        </Show>

        {/* scoring engine */}
        <Show from={tFD - 6} to={tYour + 4}>
          <FadeOut at={tYour - 8}>
            <Engine />
          </FadeOut>
        </Show>

        {/* hot / warming / nurture, then an agent's day */}
        <Show from={tYour - 6} to={tDeals + 6}>
          <FadeOut at={tDeals - 8}>
            <div style={{position: 'absolute', inset: 0, transform: `translateX(${-colsX * 1900}px)`, opacity: 1 - colsX}}>
              <Columns focusHot={focusHot} />
            </div>
            <div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - colsX) * 900}px)`, opacity: colsX}}>
              <AgentDay />
            </div>
            <div style={{position: 'absolute', left: 150 + (1 - colsX) * -300, top: 330, width: 780, opacity: colsX}}>
              <div style={{fontFamily: T.display, fontWeight: T.displayWeight, fontSize: 76, lineHeight: 1.02, letterSpacing: T.displayTracking, color: T.text}}>
                Your agents start with the <span style={{color: T.hot}}>hottest</span> buyers.
              </div>
              <div style={{marginTop: 26, fontFamily: BODY, fontWeight: 600, fontSize: 30, color: T.muted}}>Warm leads keep getting nurtured automatically.</div>
            </div>
          </FadeOut>
        </Show>

        <SpokenHeadline
          theme={T} vo={V} size={64} y={80} width={1700} hideAfter={tDeals - 6} splitComma
          emph={['equal.', 'once.', 'four', 'downloaded', 'payment', 'intent', 'score.', 'hot,', 'deals']} emph2={['frontdesk', 'ai']}
        />
        <Sequence from={tDeals - 6}>
          <EndCard theme={T} vertical={false} headline="Spend time where the *deals* are." ctaAt={tDM - tDeals + 12} />
        </Sequence>
      </Stage>
      <Soundtrack
        vo="h2" music="tech" musicVol={0.14}
        cues={[
          [4, 'whoosh', 0.25], [w('equal.'), 'pop'], [tViewed, 'pop', 0.22], [tFour, 'pop', 0.22], [tDown, 'pop', 0.22], [tPay, 'pop', 0.22], [tPay + 16, 'blips', 0.35],
          [tFD - 8, 'whoosh'], [w('weighs') - 6, 'blips'], [w('page'), 'click'], [w('whatsapp'), 'click'], [w('turns'), 'riser', 0.25], [w('intent') - 4, 'impact', 0.3], [w('intent') + 30, 'chime', 0.16],
          [tYour - 6, 'whoosh'], [w('hot,') - 4, 'pop'], [w('warming') - 4, 'pop'], [w('nurturing.') - 4, 'pop'], [tSo - 2, 'whoosh'], [tAgents, 'blips', 0.35],
          [tDeals - 6, 'impact', 0.35], [tDeals + 10, 'sparkle'], [tDM + 12, 'pop'],
        ]}
      />
    </AbsoluteFill>
  );
};

const FadeOut: React.FC<{at: number; children: React.ReactNode}> = ({at: t, children}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [t, t + 10], [1, 0], CLAMP);
  return <div style={{position: 'absolute', inset: 0, opacity: o}}>{children}</div>;
};
