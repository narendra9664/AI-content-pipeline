import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Building2, Check, Moon, Plane} from 'lucide-react';
import {BODY, CLAMP, THEMES, alpha} from '../theme';
import {VOData, at} from '../vo';
import data from '../vo/ig10.json';
import {Stage} from '../kit/Stage';
import {SpokenHeadline} from '../kit/Text';
import {Clock} from '../kit/Misc';
import {EndCard, FDMark} from '../kit/Logo';
import {Soundtrack} from '../kit/Audio';
import {FadeOut} from '../kit/Social';

// IG10 "Your buyer's 9 PM is your 3 AM": a 24-hour dial of enquiries vs. office hours.
const T = THEMES.brand;
const vo = data as VOData;
export const IG10_FRAMES = Math.ceil(vo.duration * 30) + 60;
const w = (word: string, n = 1) => at(vo, word, n);
const SERIF = T.display;

const tOverseas = w('overseas');
const tTeam = w('team');
const tOther = w('other');
const tEnquiries = w('enquiries');
const tSo = w('so');
const tFD = w('frontdesk');
const tSeconds = w('seconds.');
const tOpen = w('open');
const tDM = w('dm');

const CX = 540;
const CY = 1010;
const R = 320;
const ang = (h: number) => ((h / 24) * 360 - 90) * (Math.PI / 180);
const pt = (h: number, r: number) => ({x: CX + Math.cos(ang(h)) * r, y: CY + Math.sin(ang(h)) * r});
const arc = (h0: number, h1: number, r: number) => {
  if (h1 - h0 <= 0.001) return '';
  const a = pt(h0, r);
  const b = pt(h1, r);
  const large = h1 - h0 > 12 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`;
};
const OPEN = 9;
const CLOSE = 19;
const inOffice = (h: number) => h >= OPEN && h < CLOSE;
// enquiries by local hour of your office; most land outside office hours
const DOTS = [0.4, 1.3, 2.1, 3.0, 4.2, 5.4, 6.6, 7.7, 10.4, 12.8, 15.6, 17.3, 19.6, 20.5, 21.3, 22.1, 22.9, 23.6].map((h, i) => ({h, at: tOverseas + 4 + i * 3}));
const SWEEP0 = tFD - 4;
const SWEEP1 = tSeconds + 6;
const sweepH = (f: number) => CLOSE + interpolate(f, [SWEEP0, SWEEP1], [0, 24], {...CLAMP, easing: (x) => x * x * (3 - 2 * x)});

const ClockCard: React.FC<{x: number; label: string; time: string; ampm: string; icon: React.ReactNode; sub: string; dim?: boolean; at: number}> = ({x, label, time, ampm, icon, sub, dim, at: t}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - t, fps, config: {damping: 16, stiffness: 110}});
  const col = dim ? T.muted : T.accent2;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: 452, width: 455, height: 330, borderRadius: 40, background: dim ? alpha('#000000', 0.35) : T.surface,
        border: `1px solid ${dim ? T.line : alpha(T.accent2, 0.5)}`, boxShadow: dim ? undefined : `0 30px 80px rgba(0,0,0,0.5), 0 0 50px ${alpha(T.accent2, 0.15)}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, fontFamily: BODY,
        opacity: p, transform: `translateY(${(1 - p) * 60}px)`,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 10, color: col, fontWeight: 800, fontSize: 22, letterSpacing: '0.16em'}}>
        {icon} {label}
      </div>
      <Clock theme={T} time={time} ampm={ampm} size={118} color={dim ? alpha(T.text, 0.45) : T.text} />
      <div style={{fontWeight: 600, fontSize: 24, color: T.muted}}>{sub}</div>
    </div>
  );
};

const Dial: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: frame - tOverseas + 6, fps, config: {damping: 18, stiffness: 90}});
  const office = interpolate(frame, [tTeam, tTeam + 22], [OPEN, CLOSE], {...CLAMP, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const off = interpolate(frame, [tOther, tOther + 22], [CLOSE, CLOSE + 14], {...CLAMP, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const sw = sweepH(frame);
  const sweeping = frame >= SWEEP0;
  const leave = interpolate(frame, [tSo, tSo + 26], [0, 1], CLAMP);
  const wait = interpolate(frame, [tEnquiries, tEnquiries + 8], [0, 1], CLAMP);
  const pulse = 0.5 + 0.5 * Math.sin(frame / 4);
  const labels: [number, string][] = [[0, '12 AM'], [6, '6 AM'], [12, '12 PM'], [18, '6 PM']];
  const passed = (h: number) => sweeping && ((h >= CLOSE && h <= sw) || (h < CLOSE && h + 24 <= sw));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: enter, transform: `scale(${0.85 + 0.15 * enter})`, transformOrigin: `${CX}px ${CY}px`}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={alpha(T.text, 0.08)} strokeWidth={34} />
        {Array.from({length: 24}).map((_, h) => {
          const a = pt(h, R - 40);
          const b = pt(h, R - (h % 6 === 0 ? 62 : 52));
          return <line key={h} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={alpha(T.text, h % 6 === 0 ? 0.5 : 0.22)} strokeWidth={h % 6 === 0 ? 4 : 2} strokeLinecap="round" />;
        })}
        <path d={arc(OPEN, office, R)} fill="none" stroke={T.accent2} strokeWidth={34} strokeLinecap="butt" style={{filter: `drop-shadow(0 0 14px ${alpha(T.accent2, 0.6)})`}} />
        <path d={arc(CLOSE, off, R)} fill="none" stroke={T.bad} strokeWidth={34} strokeDasharray="10 12" opacity={sweeping ? 0.35 : 0.9} />
        {sweeping ? <path d={arc(CLOSE, sw, R)} fill="none" stroke={T.accent} strokeWidth={34} style={{filter: `drop-shadow(0 0 16px ${alpha(T.accent, 0.8)})`}} /> : null}
        {sweeping && frame < SWEEP1 + 6 ? (
          <line x1={CX} y1={CY} x2={pt(sw, R + 30).x} y2={pt(sw, R + 30).y} stroke={T.accent} strokeWidth={5} strokeLinecap="round" style={{filter: `drop-shadow(0 0 10px ${T.accent})`}} />
        ) : null}
      </svg>
      {labels.map(([h, l]) => {
        const p = pt(h, R - 104);
        return (
          <div key={l} style={{position: 'absolute', left: p.x - 70, top: p.y - 18, width: 140, textAlign: 'center', fontFamily: BODY, fontWeight: 700, fontSize: 26, color: T.muted}}>
            {l}
          </div>
        );
      })}
      {DOTS.map((d, i) => {
        const s = spring({frame: frame - d.at, fps, config: {damping: 11, stiffness: 180}});
        if (frame < d.at) return null;
        const inside = inOffice(d.h);
        const judged = frame >= tTeam + 10;
        const lost = !inside && judged ? leave : 0;
        const saved = passed(d.h);
        const r = R + 66 + lost * 70 * (saved ? 0 : 1);
        const p = pt(d.h, r);
        const col = saved || (inside && judged) ? T.good : judged ? T.bad : T.accent2;
        const op = saved ? 1 : 1 - lost * 0.8;
        const ring = !inside && judged && !saved ? wait * (1 - lost) : 0;
        return (
          <div key={i} style={{position: 'absolute', left: p.x - 22, top: p.y - 22, width: 44, height: 44, opacity: op, transform: `scale(${s})`}}>
            {ring > 0 ? <div style={{position: 'absolute', inset: -8 - pulse * 8, borderRadius: '50%', border: `2px solid ${alpha(T.bad, ring * (1 - pulse) * 0.9)}`}} /> : null}
            <div style={{position: 'absolute', inset: 0, borderRadius: 44, background: col, boxShadow: `0 0 18px ${alpha(col, 0.8)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.bg}}>
              {saved || (inside && judged) ? <Check size={26} strokeWidth={3.4} /> : null}
            </div>
          </div>
        );
      })}
      {/* centre readout */}
      <div style={{position: 'absolute', left: CX - 220, top: CY - 120, width: 440, height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: BODY, textAlign: 'center'}}>
        {frame < tTeam ? (
          <>
            <div style={{fontWeight: 800, fontSize: 24, letterSpacing: '0.18em', color: T.muted}}>ENQUIRIES BY HOUR</div>
            <div style={{fontFamily: SERIF, fontSize: 86, lineHeight: 1, color: T.text, marginTop: 8}}>Your day</div>
          </>
        ) : frame < tOther ? (
          <>
            <div style={{fontWeight: 800, fontSize: 24, letterSpacing: '0.18em', color: T.accent2}}>OFFICE HOURS</div>
            <div style={{fontFamily: SERIF, fontSize: 110, lineHeight: 1, color: T.text, marginTop: 4}}>10 h</div>
          </>
        ) : !sweeping ? (
          <>
            <div style={{fontWeight: 800, fontSize: 24, letterSpacing: '0.18em', color: T.bad}}>NOBODY ANSWERS</div>
            <div style={{fontFamily: SERIF, fontSize: 110, lineHeight: 1, color: T.text, marginTop: 4}}>14 h</div>
          </>
        ) : (
          <>
            <FDMark size={64} color={T.accent} color2={T.accent2} glow={0.6} />
            <div style={{fontFamily: SERIF, fontSize: 110, lineHeight: 1, color: T.text, marginTop: 10}}>24 h</div>
          </>
        )}
      </div>
    </div>
  );
};

export const IG10: React.FC = () => {
  const frame = useCurrentFrame();
  const hookOut = interpolate(frame, [tOverseas - 10, tOverseas], [0, 1], CLAMP);
  return (
    <AbsoluteFill>
      <Stage theme={T}>
        <FadeOut at={tOpen - 14}>
          {hookOut < 1 ? (
            <div style={{position: 'absolute', inset: 0, opacity: 1 - hookOut, transform: `translateY(${-hookOut * 40}px)`}}>
              <ClockCard x={70} at={8} label="YOUR BUYER, ABROAD" time="9:00" ampm="PM" icon={<Plane size={24} strokeWidth={2.4} />} sub="Browsing after dinner" />
              <ClockCard x={555} at={tOverseas - 60} label="YOUR OFFICE" time="3:00" ampm="AM" icon={<Building2 size={24} strokeWidth={2.4} />} sub="Lights off, phones off" dim />
              <div style={{position: 'absolute', left: 555, width: 455, top: 830, display: 'flex', justifyContent: 'center', opacity: interpolate(frame, [52, 64], [0, 1], CLAMP)}}>
                <Moon size={60} color={T.muted} strokeWidth={1.8} />
              </div>
            </div>
          ) : null}
          {frame >= tOverseas - 8 ? <Dial /> : null}
        </FadeOut>
        <SpokenHeadline theme={T} vo={vo} size={92} y={186} width={980} hideAfter={tOpen - 6} emph={['9', 'pm', '3', 'am.', 'clock,', 'seconds.']} emph2={['14', 'hours?', 'wait.', 'buyers.']} italicAccent />
        <Sequence from={tOpen - 6}>
          <EndCard theme={T} headline="Open all *24 hours.*" ctaAt={tDM - tOpen + 4} italicAccent headSize={120} />
        </Sequence>
      </Stage>
      <Soundtrack
        music="luxury" musicVol={0.75} musicFrom={40} sfxScale={0.7}
        cues={[
          [8, 'whoosh', 0.2], [tOverseas - 60, 'pop', 0.25], [tOverseas - 8, 'whoosh', 0.22], [tOverseas + 4, 'blips', 0.3], [tTeam, 'chime', 0.18],
          [tOther, 'impact', 0.25], [tEnquiries, 'blips', 0.25], [tSo, 'whoosh', 0.18], [SWEEP0, 'riser', 0.22], [SWEEP0 + 4, 'scan', 0.3],
          [SWEEP1 - 6, 'sparkle', 0.8], [tOpen - 6, 'whoosh'], [tOpen + 10, 'sparkle'], [tDM, 'pop'],
        ]}
      />
    </AbsoluteFill>
  );
};
