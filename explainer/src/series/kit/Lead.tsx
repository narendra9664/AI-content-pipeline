import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Flame, TrendingUp} from 'lucide-react';
import {BODY, CLAMP, Theme, alpha} from '../theme';

export type Lead = {id: string; name: string; tone: number; score: number; signal: string; tier: 'hot' | 'warm' | 'nurture'};

// Fictional buyers used across the series.
export const LEADS: Lead[] = [
  {id: 'sarah', name: 'Sarah K.', tone: 0, score: 92, signal: 'Penthouse 42A · 4 visits', tier: 'hot'},
  {id: 'omar', name: 'Omar R.', tone: 1, score: 88, signal: 'Asked about payment plans', tier: 'hot'},
  {id: 'priya', name: 'Priya M.', tone: 2, score: 81, signal: 'Downloaded floor plans', tier: 'hot'},
  {id: 'james', name: 'James L.', tone: 3, score: 64, signal: 'Viewed pricing twice', tier: 'warm'},
  {id: 'aisha', name: 'Aisha N.', tone: 4, score: 57, signal: 'Watched video tour', tier: 'warm'},
  {id: 'daniel', name: 'Daniel W.', tone: 5, score: 41, signal: 'Opened brochure', tier: 'nurture'},
  {id: 'mei', name: 'Mei T.', tone: 6, score: 33, signal: 'One visit, 40 seconds', tier: 'nurture'},
  {id: 'rahul', name: 'Rahul S.', tone: 7, score: 22, signal: 'Newsletter sign-up', tier: 'nurture'},
];
export const lead = (id: string) => LEADS.find((l) => l.id === id)!;

const GRADS = [
  ['#FF8A5B', '#FF4E8A'],
  ['#00A3FF', '#7C4DFF'],
  ['#00C9A7', '#00A3FF'],
  ['#FFB300', '#FF6A3D'],
  ['#9B6BFF', '#FF5AC8'],
  ['#3DDC97', '#1E9BFF'],
  ['#F472B6', '#FB923C'],
  ['#60A5FA', '#34D399'],
];

export const initials = (name: string) =>
  name
    .replace('.', '')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);

export const Avatar: React.FC<{name: string; tone: number; size: number; ring?: string}> = ({name, tone, size, ring}) => {
  const [a, b] = GRADS[tone % GRADS.length];
  return (
    <div
      style={{
        width: size, height: size, borderRadius: size, flexShrink: 0,
        background: `linear-gradient(135deg, ${a}, ${b})`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: BODY, fontWeight: 700, fontSize: size * 0.38, color: '#fff', letterSpacing: '-0.02em',
        boxShadow: ring ? `0 0 0 ${size * 0.06}px ${ring}` : undefined,
      }}
    >
      {initials(name)}
    </div>
  );
};

export const tierColor = (t: Theme, tier: Lead['tier']) => (tier === 'hot' ? t.hot : tier === 'warm' ? t.accent : t.muted);
export const tierLabel = (tier: Lead['tier']) => (tier === 'hot' ? 'HOT' : tier === 'warm' ? 'WARM' : 'NURTURE');

export const TierBadge: React.FC<{theme: Theme; tier: Lead['tier']; size: number}> = ({theme, tier, size}) => {
  const c = tierColor(theme, tier);
  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: size * 0.3, padding: `${size * 0.28}px ${size * 0.6}px`, borderRadius: 999,
        background: alpha(c, tier === 'hot' ? 0.2 : 0.12), color: c, fontFamily: BODY, fontWeight: 800, fontSize: size, letterSpacing: '0.08em',
        border: `1px solid ${alpha(c, 0.5)}`,
      }}
    >
      {tier === 'hot' ? <Flame size={size * 1.1} strokeWidth={2.6} /> : null}
      {tierLabel(tier)}
    </div>
  );
};

// Circular intent score that fills and counts up from `start`.
export const ScoreRing: React.FC<{theme: Theme; value: number; size: number; start?: number; dur?: number; color?: string; label?: string}> = ({
  theme, value, size, start = 0, dur = 36, color, label,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + dur], [0, 1], {...CLAMP, easing: (t) => 1 - Math.pow(1 - t, 3)});
  const v = Math.round(value * p);
  const r = size / 2 - size * 0.07;
  const circ = 2 * Math.PI * r;
  const col = color ?? (v >= 80 ? theme.hot : theme.accent);
  return (
    <div style={{position: 'relative', width: size, height: size, flexShrink: 0}}>
      <svg width={size} height={size} style={{transform: 'rotate(-90deg)'}}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={alpha(col, 0.16)} strokeWidth={size * 0.08} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={size * 0.08} strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`} strokeDashoffset={circ * (1 - (value / 100) * p)}
          style={{filter: `drop-shadow(0 0 ${size * 0.06}px ${alpha(col, 0.8)})`}}
        />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: BODY}}>
        <div style={{fontWeight: 800, fontSize: size * 0.34, color: p > 0 ? theme.text : theme.muted, letterSpacing: '-0.04em', lineHeight: 1}}>{p > 0 ? v : '–'}</div>
        {label ? <div style={{fontWeight: 700, fontSize: size * 0.1, color: theme.muted, letterSpacing: '0.14em', marginTop: size * 0.03}}>{label}</div> : null}
      </div>
    </div>
  );
};

export const LeadRow: React.FC<{
  theme: Theme;
  l: Lead;
  rank?: number;
  width: number;
  h: number;
  scoreP?: number; // 0..1 how much of the score is revealed
  showTier?: boolean;
  focus?: number; // 0..1 highlight
  rising?: number; // 0..1 shows the "moved up" arrow
  dim?: number;
}> = ({theme, l, rank, width, h, scoreP = 1, showTier = true, focus = 0, rising = 0, dim = 0}) => {
  const s = h / 100;
  const col = tierColor(theme, l.tier);
  return (
    <div
      style={{
        width, height: h, borderRadius: 22 * s, display: 'flex', alignItems: 'center', gap: 20 * s, padding: `0 ${26 * s}px`,
        background: focus > 0 ? `linear-gradient(90deg, ${alpha(col, 0.16 * focus)}, ${theme.surface})` : theme.surface,
        border: `1px solid ${focus > 0 ? alpha(col, 0.3 + 0.6 * focus) : theme.line}`,
        boxShadow: focus > 0 ? `0 ${16 * s}px ${50 * s}px ${alpha(col, 0.25 * focus)}` : `0 ${10 * s}px ${30 * s}px rgba(0,0,0,${theme.mode === 'dark' ? 0.25 : 0.06})`,
        opacity: 1 - dim * 0.55, fontFamily: BODY,
      }}
    >
      {rank !== undefined ? (
        <div style={{width: 40 * s, fontWeight: 800, fontSize: 30 * s, color: rank <= 3 ? col : theme.muted, letterSpacing: '-0.03em'}}>{rank}</div>
      ) : null}
      <Avatar name={l.name} tone={l.tone} size={62 * s} />
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontWeight: 700, fontSize: 30 * s, color: theme.text, letterSpacing: '-0.02em', whiteSpace: 'nowrap'}}>{l.name}</div>
        <div style={{fontWeight: 500, fontSize: 22 * s, color: theme.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{l.signal}</div>
      </div>
      {rising > 0 ? (
        <div style={{opacity: rising, color: theme.good, display: 'flex'}}>
          <TrendingUp size={30 * s} strokeWidth={2.6} />
        </div>
      ) : null}
      {showTier ? <TierBadge theme={theme} tier={l.tier} size={17 * s} /> : null}
      <div style={{width: 64 * s, textAlign: 'right', fontWeight: 800, fontSize: 36 * s, color: l.score >= 80 ? col : theme.text, letterSpacing: '-0.04em', opacity: scoreP > 0 ? 1 : 0.25}}>
        {scoreP > 0 ? Math.round(l.score * scoreP) : '--'}
      </div>
    </div>
  );
};

// Ranked list that re-sorts itself: rows glide from order `from` to order `to` starting at `at`.
export const Queue: React.FC<{
  theme: Theme;
  ids: string[];
  from: string[];
  to: string[];
  at: number;
  width: number;
  rowH: number;
  gap?: number;
  scoreAt?: number;
  tierAt?: number;
  focusId?: string;
  focusAt?: number;
  enterAt?: number;
  ranks?: boolean;
  dimAfter?: number; // rank after which rows dim once sorted
  dimAt?: number;
  flash?: Record<string, number>; // brief highlight of a row at a frame
  focusIds?: string[];
}> = ({theme, ids, from, to, at, width, rowH, gap = 16, scoreAt = at - 30, tierAt = at + 20, focusId, focusAt = at + 10, enterAt = 0, ranks = true, dimAfter, dimAt = at + 25, flash = {}, focusIds = []}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sortP = spring({frame: frame - at, fps, config: {damping: 18, stiffness: 70, mass: 1}});
  const scoreP = interpolate(frame, [scoreAt, scoreAt + 24], [0, 1], CLAMP);
  return (
    <div style={{position: 'relative', width, height: ids.length * (rowH + gap) - gap}}>
      {ids.map((id, k) => {
        const l = lead(id);
        const a = from.indexOf(id);
        const b = to.indexOf(id);
        const y = interpolate(sortP, [0, 1], [a, b]) * (rowH + gap);
        const moving = Math.sin(Math.PI * Math.min(1, sortP)) * (a !== b ? 1 : 0);
        const enter = spring({frame: frame - enterAt - k * 3, fps, config: {damping: 16, stiffness: 120}});
        const fl = flash[id] === undefined ? 0 : interpolate(frame, [flash[id], flash[id] + 6, flash[id] + 26], [0, 1, 0], CLAMP);
        const focus = Math.max(fl, focusId === id || focusIds.includes(id) ? interpolate(frame, [focusAt, focusAt + 10], [0, 1], CLAMP) : 0);
        const rank = sortP > 0.5 ? b + 1 : a + 1;
        const dim = dimAfter !== undefined && b + 1 > dimAfter ? interpolate(frame, [dimAt, dimAt + 15], [0, 1], CLAMP) : 0;
        return (
          <div
            key={id}
            style={{
              position: 'absolute', left: 0, top: y, zIndex: b < a ? 10 + (a - b) : 1,
              transform: `translateX(${(1 - enter) * 60 + (b < a ? -moving * 18 : moving * 8)}px) scale(${1 + (b < a ? moving * 0.03 : 0)})`,
              opacity: enter,
            }}
          >
            <LeadRow
              theme={theme} l={l} rank={ranks ? rank : undefined} width={width} h={rowH} scoreP={scoreP}
              showTier={frame >= tierAt} focus={focus} rising={b < a ? interpolate(sortP, [0.1, 0.4], [0, 1], CLAMP) * (1 - interpolate(frame, [at + 50, at + 60], [0, 1], CLAMP)) : 0} dim={dim}
            />
          </div>
        );
      })}
    </div>
  );
};

// Profile card for one buyer: avatar, score ring, and the signals that produced it.
export const LeadCard: React.FC<{
  theme: Theme;
  l: Lead;
  width: number;
  signals: {text: string; at: number; pts?: string}[];
  scoreAt: number;
  source?: string;
}> = ({theme, l, width, signals, scoreAt, source = 'Website enquiry'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = width / 800;
  return (
    <div
      style={{
        width, borderRadius: 36 * s, padding: 40 * s, background: theme.surface, border: `1px solid ${theme.line}`,
        boxShadow: `0 ${30 * s}px ${90 * s}px rgba(0,0,0,${theme.mode === 'dark' ? 0.45 : 0.12})`, fontFamily: BODY,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 26 * s}}>
        <Avatar name={l.name} tone={l.tone} size={104 * s} />
        <div style={{flex: 1}}>
          <div style={{fontWeight: 800, fontSize: 46 * s, color: theme.text, letterSpacing: '-0.03em'}}>{l.name}</div>
          <div style={{fontWeight: 500, fontSize: 26 * s, color: theme.muted}}>{source}</div>
        </div>
        <ScoreRing theme={theme} value={l.score} size={150 * s} start={scoreAt} label="INTENT" />
      </div>
      <div style={{height: 1, background: theme.line, margin: `${30 * s}px 0 ${24 * s}px`}} />
      <div style={{display: 'flex', flexDirection: 'column', gap: 16 * s}}>
        {signals.map((sg, i) => {
          const p = spring({frame: frame - sg.at, fps, config: {damping: 16, stiffness: 140}});
          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 16 * s, opacity: p, transform: `translateX(${(1 - p) * 40}px)`,
                fontSize: 29 * s, fontWeight: 600, color: theme.text,
              }}
            >
              <div style={{width: 12 * s, height: 12 * s, borderRadius: 12, background: theme.accent, boxShadow: `0 0 12px ${theme.accent}`}} />
              <div style={{flex: 1}}>{sg.text}</div>
              {sg.pts ? <div style={{color: theme.good, fontWeight: 800}}>{sg.pts}</div> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
