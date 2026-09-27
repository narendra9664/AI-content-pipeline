import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Check, Clock3, Columns2, Download, Inbox, Moon, Phone as PhoneIcon, Radio} from 'lucide-react';
import {BODY, CLAMP, THEMES, alpha} from '../theme';
import {VOData, at} from '../vo';
import vo from '../vo/h1.json';
import {Stage} from '../kit/Stage';
import {Captions} from '../kit/Text';
import {BrowserStack} from '../kit/Frames';
import {D, DESKTOP_OUTLINES, Signals, SiteDesktop, XRay} from '../kit/Site';
import {Cursor, Rise, Show} from '../kit/Misc';
import {Avatar, ScoreRing} from '../kit/Lead';
import {Toast} from '../kit/Chat';
import {EndCard} from '../kit/Logo';
import {Soundtrack} from '../kit/Audio';

const T = THEMES.teal;
const V = vo as VOData;
export const H1_FRAMES = Math.ceil(V.duration * 30) + 45;
const w = (word: string, n = 1) => at(V, word, n);

const WIN_W = 1400;
const K = WIN_W / 1280;
const LH = 760;
const X0 = (1920 - WIN_W) / 2;
const Y0 = 40;
// logical site coords -> composition coords (flat browser at X0, Y0)
const px = (x: number) => X0 + x * K;
const py = (y: number, scroll = 0) => Y0 + (54 + y - scroll) * K;

// Anonymous visitors drifting over the page; all but one leave without a word.
const Visitors: React.FC = () => {
  const frame = useCurrentFrame();
  const tFew = w('few');
  const tForm = w('form.');
  const paths: [number, number, number][][] = [
    [[0, 500, 300], [40, 700, 520], [80, 900, 400], [120, 820, 700], [160, 1000, 650]],
    [[4, 1500, 700], [44, 1300, 460], [84, 1100, 800], [124, 1400, 760], [164, 1500, 600]],
    [[8, 1200, 250], [48, 1350, 400], [88, 1600, 330], [128, 1300, 300]],
    [[2, 400, 850], [42, 600, 780], [82, 480, 700], [122, 700, 860]],
    [[6, 900, 900], [46, 1100, 880], [86, 1250, 820], [126, 1050, 900]],
    // the one who enquires
    [[0, 1700, 500], [40, 1450, 600], [90, 900, 560], [tFew, 520, 620], [tForm - 6, px(D.book.x + 90), py(D.book.y + 25)]],
  ];
  return (
    <>
      {paths.map((p, i) => {
        const last = i === paths.length - 1;
        const fade = last ? 1 : 1 - interpolate(frame, [tFew - 4, tFew + 8], [0, 1], CLAMP);
        if (fade <= 0) return null;
        return (
          <div key={i} style={{position: 'absolute', inset: 0, opacity: fade}}>
            <Cursor path={p} clicks={last ? [tForm - 4] : []} color={last ? T.accent : T.muted} size={30} />
          </div>
        );
      })}
    </>
  );
};

type FeedItem = {at: number; icon: React.ReactNode; title: string; sub: string; color?: string};

const Feed: React.FC<{items: FeedItem[]; x: number; identified: number; captured: number}> = ({items, x, identified, captured}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pulse = 0.5 + 0.5 * Math.sin(frame / 5);
  return (
    <div style={{position: 'absolute', left: x, top: 130, width: 560, fontFamily: BODY}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20}}>
        {frame >= identified ? <Avatar name="Sarah K." tone={0} size={52} /> : <div style={{width: 52, height: 52, borderRadius: 52, background: T.surface2, border: `1px dashed ${alpha(T.accent, 0.6)}`}} />}
        <div>
          <div style={{fontWeight: 800, fontSize: 28, color: T.text}}>{frame >= identified ? 'Sarah K.' : 'Visitor #A7F2'}</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 19, color: T.muted}}>
            <div style={{width: 10, height: 10, borderRadius: 10, background: T.good, boxShadow: `0 0 ${4 + 8 * pulse}px ${T.good}`}} /> Live signals
          </div>
        </div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
        {items.map((it) => {
          const p = spring({frame: frame - it.at, fps, config: {damping: 15, stiffness: 140}});
          if (frame < it.at) return null;
          const c = it.color ?? T.accent;
          const cap = frame >= captured;
          return (
            <div
              key={it.title}
              style={{
                display: 'flex', alignItems: 'center', gap: 18, padding: '20px 22px', borderRadius: 24, background: T.surface,
                border: `1.5px solid ${cap ? alpha(T.good, 0.6) : alpha(c, 0.5)}`, boxShadow: `0 18px 50px rgba(0,0,0,0.35), 0 0 30px ${alpha(c, 0.12)}`,
                opacity: p, transform: `translateX(${(1 - p) * 80}px)`,
              }}
            >
              <div style={{width: 58, height: 58, borderRadius: 18, background: alpha(c, 0.16), color: c, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{it.icon}</div>
              <div style={{flex: 1}}>
                <div style={{fontWeight: 800, fontSize: 27, color: T.text}}>{it.title}</div>
                <div style={{fontWeight: 500, fontSize: 21, color: T.muted}}>{it.sub}</div>
              </div>
              {cap ? (
                <div style={{width: 38, height: 38, borderRadius: 38, background: T.good, color: T.onAccent, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Check size={22} strokeWidth={3} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const H1: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tBut = w('but');
  const tForm = w('form.');
  const tLook = w('look');
  const tBeneath = w('beneath');
  const tEvery = w('every', 2);
  const tList = w('listings');
  const tCompare = w('compare.');
  const tFloor = w('floor');
  const tDownload = w('download.');
  const tNights = w('nights');
  const tBack = w('back');
  const tPrice = w('price.');
  const tFD = w('frontdesk');
  const tCaptures = w('captures');
  const tLive = w('live');
  const tTells = w('tells');
  const tWhen = w('when.');
  const tSee = w('see');
  const tDM = w('dm');

  const enter = spring({frame, fps, config: {damping: 20, stiffness: 80}});
  const sep = spring({frame: frame - (tBeneath - 8), fps, config: {damping: 20, stiffness: 55}});
  const back = spring({frame: frame - (tList - 22), fps, config: {damping: 20, stiffness: 70}});
  const s = sep * (1 - back);
  const shrink = spring({frame: frame - (tList - 14), fps, config: {damping: 20, stiffness: 70}});
  const leave = interpolate(frame, [tFD - 10, tFD + 14], [0, 1], {...CLAMP, easing: (x) => x * x});
  const scroll = interpolate(frame, [tFloor - 20, tFloor + 6], [0, 300], {...CLAMP, easing: (x) => x * x * (3 - 2 * x)});
  const siteOpacity = interpolate(back, [0, 0.35], [1, 0], CLAMP);
  const feedX = interpolate(frame, [tFD - 6, tFD + 22], [1300, 150], {...CLAMP, easing: (x) => 1 - Math.pow(1 - x, 3)});

  const tags = [
    {id: 'ph42a', text: 'Compared', icon: 'eye' as const, at: tCompare - 6, hot: true},
    {id: 'sv38c', text: 'Compared', icon: 'eye' as const, at: tCompare},
    {id: 'floorplan', text: 'Downloaded · floor-plans.pdf', icon: 'download' as const, at: tDownload, hot: true, dx: 250, dy: 30},
    {id: 'pricing', text: '3rd night · 11:48 PM', icon: 'clock' as const, at: tBack, hot: true, dx: 250, dy: 30},
  ];
  const feed: FeedItem[] = [
    {at: tCompare, icon: <Columns2 size={30} strokeWidth={2.4} />, title: 'Compared 42A and Sky Villa', sub: 'Switched back and forth 3 times'},
    {at: tDownload, icon: <Download size={30} strokeWidth={2.4} />, title: 'Downloaded floor plans', sub: 'Penthouse 42A · PDF'},
    {at: tPrice - 4, icon: <Moon size={30} strokeWidth={2.4} />, title: 'Came back 3 nights running', sub: 'Checked pricing at 11:48 PM', color: T.hot},
  ];

  return (
    <AbsoluteFill>
      <Stage theme={T}>
        {/* the website, then the layer beneath it */}
        <Show to={tFD + 16}>
          <div
            style={{
              position: 'absolute', left: X0, top: Y0, transformOrigin: '0 0',
              opacity: enter * (1 - leave),
              transform: `translate(${-shrink * (X0 - 70) - leave * 1400}px, ${(1 - enter) * 300 + shrink * 70}px) scale(${1 - shrink * 0.19})`,
            }}
          >
            <BrowserStack
              width={WIN_W} lh={LH} url="veloria-residences.com" rx={50 * s} rz={-18 * s} scale={1 - 0.22 * s} chromeOpacity={1 - s}
              layers={[
                {
                  key: 'x', z: 0, bg: T.surface,
                  shadow: s > 0.02 ? `0 0 0 2px ${alpha(T.accent, 0.7 * s)}, 0 0 90px ${alpha(T.accent, 0.35 * s)}` : undefined,
                  node: (
                    <XRay
                      theme={T} boxes={D} outlines={DESKTOP_OUTLINES} w={1280} h={LH} scroll={scroll} tags={tags} tagSize={16} gridSize={32}
                      heat={[{id: 'image', at: tBeneath + 20, r: 260}, {id: 'ph42a', at: tList}, {id: 'sv38c', at: tCompare}, {id: 'floorplan', at: tFloor + 6}, {id: 'pricing', at: tBack}]}
                      strong={{ph42a: frame >= tList ? 1 : 0, sv38c: frame >= tCompare ? 1 : 0, floorplan: frame >= tDownload ? 1 : 0, pricing: frame >= tBack ? 1 : 0}}
                      header={{text: 'Live · 38 visitors on site', at: tBeneath + 10}}
                    />
                  ),
                },
                {key: 's', z: 190 * s + 0.5, opacity: interpolate(sep, [0.15, 0.5], [0, 1], CLAMP) * (1 - back), node: <Signals theme={T} boxes={D} ids={['headline', 'image', 'book', 'ph42a', 'sv38c', 'r21b']} at={tBeneath + 6} />},
                {
                  key: 'site', z: 380 * s + 1, opacity: siteOpacity * (1 - 0.1 * s), bg: '#0D0E11',
                  shadow: s > 0.02 ? `0 80px 140px rgba(0,0,0,${0.55 * s})` : undefined,
                  node: <SiteDesktop scroll={scroll} glow={{book: frame >= tForm - 4 && frame < tLook ? 1 : 0}} />,
                },
              ]}
            />
          </div>
        </Show>
        <Show to={tLook - 4}>
          <Visitors />
          <div style={{position: 'absolute', right: X0 + 30, top: Y0 + 90}}>
            <Rise at={tForm} exitAt={tLook - 10} dy={-30}>
              <Toast theme={T} at={tForm} width={460} icon={<Inbox size={28} strokeWidth={2.4} />} title="1 new enquiry" body="Everyone else left without a word." meta="today" size={28} />
            </Rise>
          </div>
        </Show>

        {/* live signal feed */}
        <Show from={tCompare - 4} to={tSee - 2}>
          <FadeOutAt at={tSee - 12}>
            <Feed items={feed} x={feedX} identified={tCaptures} captured={tCaptures + 4} />
          </FadeOutAt>
        </Show>

        {/* score + who to call, and when */}
        <Show from={tLive - 20} to={tSee - 2}>
          <FadeOutAt at={tSee - 12}>
            <div style={{position: 'absolute', left: 900, top: 120}}>
              <Rise at={tLive - 14} dy={60}>
                <div
                  style={{
                    width: 860, display: 'flex', alignItems: 'center', gap: 44, padding: '34px 44px', borderRadius: 40, background: T.surface,
                    border: `1px solid ${T.line}`, boxShadow: '0 30px 90px rgba(0,0,0,0.45)', fontFamily: BODY,
                  }}
                >
                  <ScoreRing theme={T} value={92} size={250} start={tLive} dur={40} label="LIVE" color={T.hot} />
                  <div>
                    <div style={{fontWeight: 700, fontSize: 24, color: T.muted, letterSpacing: '0.12em'}}>INTENT SCORE</div>
                    <div style={{fontFamily: T.display, fontWeight: T.displayWeight, fontSize: 60, lineHeight: 1.02, color: T.text, letterSpacing: T.displayTracking, marginTop: 8}}>
                      Ready to <span style={{color: T.hot}}>buy</span>
                    </div>
                    <div style={{fontWeight: 600, fontSize: 24, color: T.muted, marginTop: 10}}>Updates with every visit</div>
                  </div>
                </div>
              </Rise>
            </div>
            <div style={{position: 'absolute', left: 900, top: 560}}>
              <Rise at={tTells - 2} dy={60}>
                <div
                  style={{
                    width: 860, padding: '30px 36px', borderRadius: 36, background: `linear-gradient(135deg, ${alpha(T.accent, 0.16)}, ${T.surface})`,
                    border: `1.5px solid ${alpha(T.accent, 0.5)}`, boxShadow: '0 30px 90px rgba(0,0,0,0.45)', fontFamily: BODY,
                  }}
                >
                  <div style={{display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 21, letterSpacing: '0.14em', color: T.accent}}>
                    <Radio size={22} strokeWidth={2.6} /> NEXT BEST ACTION
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 24, marginTop: 18}}>
                    <Avatar name="Sarah K." tone={0} size={80} />
                    <div style={{flex: 1}}>
                      <div style={{fontWeight: 800, fontSize: 40, color: T.text, letterSpacing: '-0.02em'}}>Call Sarah K.</div>
                      <div
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 8, padding: '8px 16px', borderRadius: 999, fontWeight: 700, fontSize: 25,
                          color: frame >= tWhen ? T.onAccent : T.accent2, background: frame >= tWhen ? T.accent2 : alpha(T.accent2, 0.12), transition: 'none',
                        }}
                      >
                        <Clock3 size={24} strokeWidth={2.6} /> Today, 10 to 11 AM
                      </div>
                    </div>
                    <div style={{width: 84, height: 84, borderRadius: 26, background: T.good, color: T.onAccent, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <PhoneIcon size={40} strokeWidth={2.4} />
                    </div>
                  </div>
                  <div style={{fontWeight: 500, fontSize: 23, color: T.muted, marginTop: 16}}>Most active late evenings · pricing is her open question</div>
                </div>
              </Rise>
            </div>
          </FadeOutAt>
        </Show>

        <Show to={tSee - 4}>
          <Captions theme={T} vo={V} y={968} size={40} maxWords={8} />
        </Show>
        <Sequence from={tSee - 6}>
          <EndCard theme={T} vertical={false} headline="See what your website has been *hiding.*" ctaAt={tDM - tSee + 8} />
        </Sequence>
      </Stage>
      <Soundtrack
        vo="h1" music="tech" musicVol={0.14}
        cues={[
          [2, 'whoosh', 0.22], [30, 'blips', 0.3], [w('few') - 4, 'whoosh', 0.15], [tForm - 4, 'click'], [tForm, 'pop'],
          [tBeneath - 30, 'riser', 0.22], [tBeneath - 4, 'scan'], [tBeneath, 'whoosh'], [tEvery, 'blips'],
          [tList - 20, 'whoosh', 0.2], [tCompare, 'pop'], [tFloor - 20, 'whoosh', 0.15], [tDownload - 2, 'click'], [tDownload, 'pop'], [tBack, 'chime', 0.14], [tPrice - 4, 'pop'],
          [tFD - 10, 'whoosh'], [tCaptures + 4, 'sparkle'], [tLive - 14, 'whoosh', 0.2], [tLive, 'blips'], [tTells - 2, 'pop'], [tWhen, 'chime', 0.18],
          [tSee - 6, 'impact', 0.35], [tSee + 10, 'sparkle'], [tDM + 8, 'pop'],
        ]}
      />
    </AbsoluteFill>
  );
};

const FadeOutAt: React.FC<{at: number; children: React.ReactNode}> = ({at: t, children}) => {
  const frame = useCurrentFrame();
  return <div style={{position: 'absolute', inset: 0, opacity: interpolate(frame, [t, t + 10], [1, 0], CLAMP)}}>{children}</div>;
};
