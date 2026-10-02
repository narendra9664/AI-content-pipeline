import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Building2, Instagram, Search, TrendingUp} from 'lucide-react';
import {BODY, CLAMP, THEMES, alpha} from '../theme';
import {VOData, at} from '../vo';
import data from '../vo/ig05.json';
import {Stage} from '../kit/Stage';
import {SpokenHeadline} from '../kit/Text';
import {Chip, Rise, Strike} from '../kit/Misc';
import {EndCard, FDMark} from '../kit/Logo';
import {Soundtrack} from '../kit/Audio';
import {FadeOut} from '../kit/Social';

// IG05 "Your ads are working. Your follow-up isn't.": a leaking bucket of leads.
const T = THEMES.coral;
const vo = data as VOData;
export const IG05_FRAMES = Math.ceil(vo.duration * 30) + 60;
const w = (word: string, n = 1) => at(vo, word, n);

const tAds = w('ads', 1);
const tWorking = w('working.');
const tFollow = w('follow-up', 1);
const tPour = w('pour');
const tLeak = w('leak');
const tLate = w('late');
const tNo1 = w('no', 1);
const tNo2 = w('no', 2);
const tMore = w('more');
const tEvery = w('every');
const tSeconds = w('seconds.');
const tFix = w('fix', 2);
const tDM = w('dm');

// bucket geometry
const TOP = 700;
const BOT = 1230;
const TW = 330; // half width at the rim
const BW = 225; // half width at the base
const CX = 540;
const wallX = (y: number, side: -1 | 1) => CX + side * (BW + ((TW - BW) * (BOT - y)) / (BOT - TOP));
const HOLES = [
  {x: wallX(960, -1), y: 960, vx: -4.2, vy: 0, at: tLeak + 2, patch: tEvery + 4, label: 'Late replies', lx: 24, ly: 1150, show: tLate},
  {x: wallX(1040, 1), y: 1040, vx: 4.2, vy: 0, at: tLeak + 8, patch: tEvery + 12, label: 'No replies', lx: 790, ly: 1222, show: tNo1},
  {x: CX, y: BOT + 8, vx: 0, vy: 2.2, at: tLeak + 14, patch: tEvery + 20, label: 'No second message', lx: 0, ly: 1420, show: tNo2},
];

const rand = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const COLORS = ['#FF8A5B', '#7B61FF', '#00C9A7', '#FFB300', '#F472B6', '#3DDC97', '#60A5FA'];
const SRC_X = [250, 540, 830];
const SRC_Y = 540;
const FALL = 24;
const SPAWN: number[] = [];
for (let t = tPour; t < IG05_FRAMES; t += t >= tMore ? 2 : 4) SPAWN.push(t);

const level = (f: number) =>
  interpolate(f, [tPour, tLeak, tEvery, tEvery + 70], [0.04, 0.34, 0.34, 0.9], {...CLAMP, easing: (x) => x * x * (3 - 2 * x)}) -
  (f > tLeak && f < tEvery + 10 ? 0.025 * Math.sin(f / 7) : 0);

const Bucket: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: frame - tFollow + 4, fps, config: {damping: 16, stiffness: 110}});
  const L = level(frame);
  const yL = BOT - L * (BOT - TOP);
  const xl = wallX(yL, -1) + 6;
  const xr = wallX(yL, 1) - 6;
  const pts: string[] = [];
  for (let i = 0; i <= 24; i++) {
    const x = xl + ((xr - xl) * i) / 24;
    pts.push(`${x},${yL + 7 * Math.sin(x / 38 + frame / 5)}`);
  }
  const liquid = `M ${pts.join(' L ')} L ${wallX(BOT, 1) - 6},${BOT - 4} L ${wallX(BOT, -1) + 6},${BOT - 4} Z`;
  const fixed = interpolate(frame, [tEvery + 20, tEvery + 40], [0, 1], CLAMP);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: enter, transform: `translateY(${(1 - enter) * 80}px)`}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="ig05liquid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={T.accent} />
            <stop offset="1" stopColor={T.accent2} />
          </linearGradient>
          <linearGradient id="ig05wall" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.95} />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.55} />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity={0.9} />
          </linearGradient>
        </defs>
        {/* back of the rim */}
        <ellipse cx={CX} cy={TOP} rx={TW} ry={46} fill={alpha(T.text, 0.06)} stroke={alpha(T.text, 0.25)} strokeWidth={4} />
        <path d={`M ${CX - TW},${TOP} L ${CX - BW},${BOT} A ${BW} 34 0 0 0 ${CX + BW},${BOT} L ${CX + TW},${TOP} Z`} fill="url(#ig05wall)" stroke="none" />
        <path d={liquid} fill="url(#ig05liquid)" opacity={0.92} />
        <path d={`M ${CX - TW},${TOP} L ${CX - BW},${BOT} A ${BW} 34 0 0 0 ${CX + BW},${BOT} L ${CX + TW},${TOP}`} fill="none" stroke={alpha(T.text, 0.55)} strokeWidth={5} strokeLinejoin="round" />
        <path d={`M ${CX - TW},${TOP} A ${TW} 46 0 0 0 ${CX + TW},${TOP}`} fill="none" stroke={alpha(T.text, 0.55)} strokeWidth={5} />
        {HOLES.map((h, i) => {
          const o = interpolate(frame, [h.at, h.at + 6], [0, 1], CLAMP);
          return <ellipse key={i} cx={h.x} cy={h.y} rx={i === 2 ? 26 : 13} ry={i === 2 ? 9 : 22} fill={T.text} opacity={o * (1 - fixed * 0)} />;
        })}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: BOT - 250, display: 'flex', justifyContent: 'center', fontFamily: BODY, fontWeight: 800, fontSize: 38, letterSpacing: '0.14em', color: '#FFFFFF', opacity: interpolate(L, [0.62, 0.72], [0, 1], CLAMP)}}>
        BOOKED VIEWINGS
      </div>
    </div>
  );
};

// Leads falling in from the ad channels.
const Inflow: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {SPAWN.map((s, i) => {
        const u = (frame - s) / FALL;
        if (u < 0 || u > 1.25) return null;
        const src = i % 3;
        const tx = CX + (rand(i) * 2 - 1) * (TW - 70);
        const ty = TOP + 10 + rand(i + 7) * 30;
        const k = Math.min(1, u);
        const x = SRC_X[src] + (tx - SRC_X[src]) * k;
        const y = SRC_Y + (ty - SRC_Y) * k * k;
        const sink = u > 1 ? 1 - (u - 1) / 0.25 : 1;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: x - 15, top: y - 15, width: 30, height: 30, borderRadius: 30, background: COLORS[i % COLORS.length],
              border: '3px solid #fff', boxShadow: '0 6px 14px rgba(60,30,20,0.18)', transform: `scale(${sink})`,
            }}
          />
        );
      })}
    </>
  );
};

// Leads escaping through the holes until each one is patched.
const Leaks: React.FC = () => {
  const frame = useCurrentFrame();
  const out: React.ReactNode[] = [];
  HOLES.forEach((h, hi) => {
    for (let s = h.at; s < h.patch; s += 4) {
      const t = frame - s;
      if (t < 0 || t > 30) continue;
      const j = rand(hi * 100 + s);
      const x = h.x + h.vx * t + (hi === 2 ? (j - 0.5) * 3 * t : 0);
      const y = h.y + h.vy * t + 0.22 * t * t;
      out.push(
        <div
          key={`${hi}-${s}`}
          style={{
            position: 'absolute', left: x - 13, top: y - 13, width: 26, height: 26, borderRadius: 26, background: COLORS[(s + hi) % COLORS.length],
            border: '3px solid #fff', opacity: interpolate(t, [0, 4, 22, 30], [0, 1, 1, 0], CLAMP),
          }}
        />,
      );
    }
  });
  return <>{out}</>;
};

const Patches: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <>
      {HOLES.map((h, i) => {
        const p = spring({frame: frame - h.patch, fps, config: {damping: 11, stiffness: 180}});
        if (frame < h.patch) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: h.x - 40, top: h.y - 40, width: 80, height: 80, borderRadius: 80, background: '#fff',
              border: `4px solid ${T.accent2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`,
              boxShadow: `0 10px 30px ${alpha(T.accent2, 0.4)}`,
            }}
          >
            <FDMark size={38} color={T.accent2} color2={T.accent} />
          </div>
        );
      })}
    </>
  );
};

const Sources: React.FC = () => {
  const frame = useCurrentFrame();
  const more = interpolate(frame, [tMore, tMore + 8], [0, 1], CLAMP);
  const items: [React.ReactNode, string][] = [
    [<Instagram key="i" size={30} strokeWidth={2.4} />, 'Instagram'],
    [<Search key="s" size={30} strokeWidth={2.4} />, 'Google'],
    [<Building2 key="b" size={30} strokeWidth={2.4} />, 'Portals'],
  ];
  return (
    <>
      {items.map(([icon, label], i) => (
        <div key={label} style={{position: 'absolute', left: SRC_X[i] - 160, width: 320, top: 440, display: 'flex', justifyContent: 'center'}}>
          <Rise at={tAds - 4 + i * 5} dy={30}>
            <div style={{transform: `scale(${1 + more * 0.06 * Math.sin(frame / 3 + i)})`}}>
              <Chip theme={T} icon={icon} text={label} meta={frame >= tWorking ? <TrendingUp size={28} strokeWidth={2.8} style={{verticalAlign: 'middle'}} /> : undefined} color={T.accent} size={30} />
            </div>
          </Rise>
        </div>
      ))}
    </>
  );
};

export const IG05: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Stage theme={T}>
        <FadeOut at={tFix - 14}>
          <Sources />
          <Bucket />
          <Inflow />
          <Leaks />
          <Patches />
          {HOLES.map((h, i) => (
            <div key={i} style={{position: 'absolute', left: i === 2 ? 0 : h.lx, right: i === 2 ? 0 : undefined, top: h.ly, display: 'flex', justifyContent: 'center'}}>
              <Rise at={h.show} dy={24}>
                <div
                  style={{
                    padding: '14px 24px', borderRadius: 999, background: '#fff', border: `2px solid ${alpha(frame >= h.patch ? T.muted : T.bad, 0.6)}`,
                    color: frame >= h.patch ? T.muted : T.bad, fontFamily: BODY, fontWeight: 800, fontSize: 36, boxShadow: '0 12px 30px rgba(60,30,20,0.12)',
                  }}
                >
                  <Strike at={h.patch + 4} color={T.accent2} thickness={5}>
                    {h.label}
                  </Strike>
                </div>
              </Rise>
            </div>
          ))}
        </FadeOut>
        <SpokenHeadline theme={T} vo={vo} size={78} y={196} width={960} hideAfter={tFix - 6} emph={["isn't.", 'leak', 'out.', 'late', 'no', 'leaking', 'bucket.']} emph2={['working.', 'seconds.', 'every']} />
        <Sequence from={tFix - 6}>
          <EndCard theme={T} headline="Fix the follow-up *first.*" ctaAt={tDM - tFix + 4} />
        </Sequence>
      </Stage>
      <Soundtrack
        music="social" musicVol={0.42} musicFrom={20} sfxScale={0.75}
        cues={[
          [tAds - 4, 'pop', 0.2], [tAds + 1, 'pop', 0.2], [tAds + 6, 'pop', 0.2], [tWorking, 'chime', 0.15], [tFollow - 4, 'whoosh'],
          [tPour, 'blips', 0.3], [tLeak, 'impact', 0.3], [tLate, 'pop'], [tNo1, 'pop'], [tNo2, 'pop'], [tMore, 'riser', 0.22],
          [HOLES[0].patch, 'click', 0.55], [HOLES[1].patch, 'click', 0.55], [HOLES[2].patch, 'click', 0.55], [tSeconds, 'chime', 0.2],
          [tFix - 6, 'whoosh'], [tFix + 10, 'sparkle'], [tDM, 'pop'],
        ]}
      />
    </AbsoluteFill>
  );
};
