import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Download, Flame, Inbox, Moon, Repeat} from 'lucide-react';
import {CLAMP, THEMES, alpha} from '../theme';
import {VOData, at} from '../vo';
import vo1 from '../vo/v1.json';
import {Stage} from '../kit/Stage';
import {Label, SpokenHeadline} from '../kit/Text';
import {PhoneStack, phoneHeight} from '../kit/Frames';
import {M, MOBILE_OUTLINES, Signals, SiteMobile, XRay} from '../kit/Site';
import {Chip, Rise} from '../kit/Misc';
import {LEADS, LeadCard, Queue, lead} from '../kit/Lead';
import {ChatCard} from '../kit/Chat';
import {EndCard} from '../kit/Logo';
import {Soundtrack} from '../kit/Audio';

const T = THEMES.midnight;
const vo = vo1 as VOData;
export const V1_FRAMES = Math.ceil(vo.duration * 30) + 45;

const W = 540; // phone width
const PX = (1080 - W) / 2;
const PY = 470;

// "This is your website... but beneath it, every buyer is leaving clues."
const PhoneScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tBeneath = at(vo, 'beneath');
  const tPent = at(vo, 'penthouse');
  const tOpened = at(vo, 'opened');
  const tFloor = at(vo, 'floor');
  const tDown = at(vo, 'downloaded');
  const tMid = at(vo, 'midnight');
  const tFD = at(vo, 'frontdesk');

  const enter = spring({frame, fps, config: {damping: 18, stiffness: 90}});
  const sep = spring({frame: frame - (tBeneath - 8), fps, config: {damping: 20, stiffness: 55}});
  const back = spring({frame: frame - (tPent - 16), fps, config: {damping: 20, stiffness: 70}});
  const s = sep * (1 - back);
  const exit = interpolate(frame, [tFD - 14, tFD + 4], [0, 1], CLAMP);

  // Scroll: gentle drift on "Beautiful", then to the penthouse card, then to the floor plans.
  const scroll =
    interpolate(frame, [at(vo, 'beautiful'), at(vo, 'beautiful') + 50], [0, 110], {...CLAMP, easing: (t) => t * (2 - t)}) +
    interpolate(frame, [tPent - 20, tPent + 6], [0, 150], CLAMP) +
    interpolate(frame, [tFloor - 12, tFloor + 14], [0, 560], {...CLAMP, easing: (t) => t * t * (3 - 2 * t)});

  const siteOpacity = interpolate(back, [0, 0.35], [1, 0], CLAMP);
  const tags = [
    {id: 'hero', text: 'Hero · 42s', icon: 'eye' as const, at: tBeneath + 22, dy: 120},
    {id: 'plans', text: 'Tapped', icon: 'tap' as const, at: tBeneath + 34, dx: 0, dy: -30},
    {id: 'sv38c', text: 'Viewed', icon: 'eye' as const, at: tBeneath + 46},
    {id: 'ph42a', text: 'Opened', icon: 'repeat' as const, at: tOpened, hot: true, count: {from: 1, to: 4, every: 4}},
    {id: 'floorplan', text: 'Downloaded', icon: 'download' as const, at: tDown, hot: true, dy: -14},
  ];
  return (
    <div
      style={{
        position: 'absolute', left: PX, top: PY,
        opacity: enter * (1 - exit), transform: `translateY(${(1 - enter) * 300 + exit * 200 + 190 * s}px) scale(${1 - exit * 0.1})`,
      }}
    >
      <PhoneStack
        width={W}
        rx={52 * s}
        rz={-34 * s}
        scale={1 - 0.16 * s}
        islandOpacity={interpolate(s, [0, 0.08], [1, 0], CLAMP)}
        layers={[
          {
            key: 'x', z: 0, bg: T.surface,
            shadow: s > 0.02 ? `0 0 0 2px ${alpha(T.accent, 0.7 * s)}, 0 0 80px ${alpha(T.accent, 0.4 * s)}` : undefined,
            node: (
              <XRay
                theme={T} boxes={M} outlines={MOBILE_OUTLINES} w={390} h={844} scroll={scroll} tags={tags}
                heat={[{id: 'hero', at: tBeneath + 20, r: 160}, {id: 'ph42a', at: tPent}, {id: 'floorplan', at: tFloor + 10}]}
                strong={{ph42a: interpolate(frame, [tPent, tPent + 10], [0, 1], CLAMP), floorplan: interpolate(frame, [tDown, tDown + 10], [0, 1], CLAMP)}}
                rail={{at: tBeneath + 20, to: 0.92}} header={{text: 'Live · returning visitor · visit 4', at: tBeneath + 14}}
              />
            ),
          },
          {
            key: 'xl', z: 0.25,
            node: <LayerTag text="What they do" y={700} opacity={interpolate(s, [0.6, 0.95], [0, 1], CLAMP)} color={T.accent2} />,
          },
          {key: 's', z: 270 * s + 0.5, opacity: interpolate(sep, [0.15, 0.5], [0, 1], CLAMP), node: <Signals theme={T} boxes={M} ids={['hero', 'plans', 'ph42a', 'sv38c', 'floorplan']} scroll={scroll} at={tBeneath + 10} />},
          {
            key: 'site', z: 540 * s + 1, opacity: siteOpacity * (1 - 0.12 * s), bg: '#0D0E11',
            shadow: s > 0.02 ? `0 60px 120px rgba(0,0,0,${0.55 * s})` : undefined,
            node: (
              <>
                <SiteMobile scroll={scroll} />
                <LayerTag text="What they see" y={112} opacity={interpolate(s, [0.5, 0.9], [0, 1], CLAMP)} color="#FFFFFF" />
              </>
            ),
          },
        ]}
      />
      {/* "Quiet." Nobody has actually enquired. */}
      <div style={{position: 'absolute', left: 0, width: W, top: phoneHeight(W) * 0.8, display: 'flex', justifyContent: 'center'}}>
        <Rise at={at(vo, 'quiet') - 2} exitAt={tBeneath - 12} dy={30}>
          <Chip theme={T} icon={<Inbox size={30} strokeWidth={2.4} />} text="New enquiries today" meta="0" color={T.muted} size={32} />
        </Rise>
      </div>
    </div>
  );
};

// Label printed on a layer of the 3D stack (logical 390px space).
const LayerTag: React.FC<{text: string; y: number; opacity: number; color: string}> = ({text, y, opacity, color}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity}}>
    <div
      style={{
        padding: '9px 18px', borderRadius: 999, background: 'rgba(5,8,20,0.82)', border: `1.5px solid ${color}`, color,
        fontFamily: 'Inter', fontWeight: 800, fontSize: 19, letterSpacing: '0.16em', textTransform: 'uppercase', boxShadow: `0 0 24px ${alpha(color, 0.5)}`,
      }}
    >
      {text}
    </div>
  </div>
);

const Callouts: React.FC = () => {
  const frame = useCurrentFrame();
  const tOpened = at(vo, 'opened');
  const n = Math.min(4, 1 + Math.floor(Math.max(0, frame - tOpened) / 4));
  const tDown = at(vo, 'downloaded');
  const tMid = at(vo, 'midnight');
  const tFloor = at(vo, 'floor');
  const tFD = at(vo, 'frontdesk');
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 790, display: 'flex', justifyContent: 'center'}}>
        <Rise at={tOpened - 4} exitAt={tFloor - 10} dy={40}>
          <Chip theme={T} icon={<Repeat size={34} strokeWidth={2.4} />} text="Opened Penthouse 42A" meta={`×${n}`} color={T.hot} size={40} />
        </Rise>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
        <Rise at={tDown - 2} exitAt={tFD - 14} dy={40}>
          <Chip theme={T} icon={<Download size={34} strokeWidth={2.4} />} text="Downloaded the floor plans" size={40} />
        </Rise>
        <Rise at={tMid - 2} exitAt={tFD - 12} dy={40}>
          <Chip theme={T} icon={<Moon size={34} strokeWidth={2.4} />} text="12:04 AM" color={T.hot} solid size={40} />
        </Rise>
      </div>
    </>
  );
};

const Brain: React.FC = () => {
  const tFD = at(vo, 'frontdesk');
  const tRanks = at(vo, 'ranks');
  const sarah = lead('sarah');
  return (
    <>
    <div style={{position: 'absolute', left: 0, right: 0, top: 1210, display: 'flex', justifyContent: 'center'}}>
      <Rise at={tFD + 62} exitAt={tRanks - 8} dy={30}>
        <Chip theme={T} icon={<Flame size={34} strokeWidth={2.4} />} text="Ready to buy" meta="· call today" color={T.hot} size={40} />
      </Rise>
    </div>
    <div style={{position: 'absolute', left: 90, top: 640}}>
      <Rise at={tFD} exitAt={tRanks - 8} dy={80}>
        <LeadCard
          theme={T} l={sarah} width={900} scoreAt={tFD + 26} source="Website enquiry · visit 4"
          signals={[
            {text: 'Opened Penthouse 42A · 4×', at: tFD + 10, pts: '+30'},
            {text: 'Downloaded floor plans · 12:04 AM', at: tFD + 18, pts: '+28'},
            {text: 'Viewed pricing 3×', at: tFD + 26, pts: '+20'},
            {text: 'Returned 4 times this week', at: tFD + 34, pts: '+14'},
          ]}
        />
      </Rise>
    </div>
    </>
  );
};

const Ranking: React.FC = () => {
  const tRanks = at(vo, 'ranks');
  const tReady = at(vo, 'ready');
  const tFollows = at(vo, 'follows');
  const ids = ['james', 'daniel', 'sarah', 'mei', 'omar', 'aisha'];
  const sorted = [...ids].sort((a, b) => lead(b).score - lead(a).score);
  return (
    <>
      <div style={{position: 'absolute', left: 90, top: 498}}>
        <Rise at={tRanks - 4} exitAt={tFollows - 10} dy={20}>
          <Label theme={T} size={24}>Ranked by buying intent · live</Label>
        </Rise>
      </div>
      <div style={{position: 'absolute', left: 90, top: 580}}>
        <Rise at={tRanks - 6} exitAt={tFollows - 8} dy={0} scale={1} blur={false}>
          <Queue theme={T} ids={ids} from={ids} to={sorted} at={tReady - 8} width={900} rowH={118} scoreAt={tRanks - 2} tierAt={tReady + 12} focusId="sarah" focusAt={tReady + 4} enterAt={tRanks - 6} dimAfter={3} />
        </Rise>
      </div>
    </>
  );
};

const FollowUp: React.FC = () => {
  const tFollows = at(vo, 'follows');
  const tWant = at(vo, 'want');
  return (
    <div style={{position: 'absolute', left: 90, top: 590}}>
      <Rise at={tFollows - 6} exitAt={tWant - 8} dy={80}>
        <ChatCard
          theme={T} width={900} name="Sarah K." tone={LEADS[0].tone} status="WhatsApp · sent automatically" size={34} readAt={tFollows + 40}
          messages={[
            {from: 'us', text: 'Hi Sarah, saw you liked Penthouse 42A. Want the payment plan, or a private viewing this week?', at: tFollows + 8, typing: 12},
            {from: 'them', text: 'Viewing this Saturday?', at: tFollows + 44, typing: 12},
            {from: 'system', text: 'Viewing booked · Sat 10:30 AM', at: tFollows + 62},
          ]}
        />
      </Rise>
    </div>
  );
};

export const V1: React.FC = () => {
  const tWant = at(vo, 'want');
  const tDM = at(vo, 'dm');
  const f = (w: string, n = 1) => at(vo, w, n);
  return (
    <AbsoluteFill>
      <Stage theme={T}>
        <PhoneScene />
        <Callouts />
        <Brain />
        <Ranking />
        <FollowUp />
        <SpokenHeadline
          theme={T} vo={vo} size={80} y={190} width={940} hideAfter={tWant - 6} splitComma
          emph={['beneath', 'clues.', 'four', 'midnight.', 'signal,', 'ready', 'cold.']} emph2={['frontdesk', 'AI']}
        />
        <Sequence from={tWant - 6}>
          <EndCard theme={T} headline="What's *beneath* yours?" ctaAt={tDM - tWant + 4} />
        </Sequence>
      </Stage>
      <Soundtrack
        vo="v1" music="tech" musicVol={0.15}
        cues={[
          [0, 'whoosh'], [f('quiet') - 2, 'pop'], [f('beneath') - 30, 'riser', 0.22], [f('beneath') - 4, 'scan'], [f('beneath'), 'whoosh'],
          [f('beneath') + 22, 'blips'], [f('penthouse') - 16, 'whoosh', 0.2], [f('opened'), 'click'], [f('opened') + 4, 'pop', 0.18], [f('opened') + 8, 'pop', 0.18], [f('opened') + 12, 'pop', 0.22],
          [f('floor') - 12, 'whoosh', 0.2], [f('downloaded'), 'click'], [f('midnight') - 2, 'chime', 0.16],
          [f('frontdesk') - 6, 'whoosh'], [f('frontdesk') + 10, 'pop', 0.2], [f('frontdesk') + 18, 'pop', 0.2], [f('frontdesk') + 26, 'pop', 0.2], [f('frontdesk') + 34, 'pop', 0.2], [f('frontdesk') + 60, 'sparkle'],
          [f('ranks') - 6, 'whoosh', 0.22], [f('ready') - 8, 'blips'], [f('ready') + 6, 'chime', 0.14],
          [f('follows') - 4, 'typing', 0.35], [f('follows') + 8, 'send'], [f('follows') + 44, 'pop'], [f('follows') + 62, 'chime', 0.18],
          [tWant - 6, 'impact', 0.35], [tWant + 10, 'sparkle'], [tDM - 2, 'pop'],
        ]}
      />
    </AbsoluteFill>
  );
};
