import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FileText, Repeat, Tag, Timer} from 'lucide-react';
import {BODY, CLAMP, THEMES, alpha} from '../theme';
import {VOData, at} from '../vo';
import data from '../vo/ig01.json';
import {Stage} from '../kit/Stage';
import {Label, SpokenHeadline} from '../kit/Text';
import {Avatar} from '../kit/Lead';
import {EndCard} from '../kit/Logo';
import {Soundtrack} from '../kit/Audio';
import {CommentPrompt, FadeOut, LogRow, Ring, Stamp} from '../kit/Social';

// IG01 "Guess who buys": three leads, the viewer guesses, the quiet one wins.
const T = THEMES.lilac;
const vo = data as VOData;
export const IG01_FRAMES = Math.ceil(vo.duration * 30) + 60;
const w = (word: string, n = 1) => at(vo, word, n);

const tA = w('a', 1);
const tB = w('b', 1);
const tC = w('c', 1);
const tComment = w('comment');
const tCA = w('a', 3);
const tCB = w('b', 2);
const tCC = w('c', 2);
const tIts = w("it's");
const tFour = w('4');
const tFloor = w('floor');
const tPrice = w('price');
const tAq = w('a', 4);
const tGone = w('gone');
const tSee = w('see');
const tDM = w('dm');
const tCount = tCC + 10; // 3-2-1 countdown runs from here until the reveal

const CARD_X = 70;
const CARD_W = 940;
const CARD_H = 236;
const ease = (x: number) => 1 - Math.pow(1 - x, 3);

type Q = {k: 'A' | 'B' | 'C'; name: string; tone: number; line: string; tag: string; tagColor: string; at: number; y: number; pulse: number};
const QS: Q[] = [
  {k: 'A', name: 'Daniel W.', tone: 5, line: 'Form: “Send me the brochure”', tag: 'NEW · TODAY', tagColor: T.accent2, at: tA, y: 500, pulse: tCA},
  {k: 'B', name: 'Sarah K.', tone: 0, line: 'Went quiet 3 weeks ago', tag: 'NO REPLY SINCE', tagColor: T.muted, at: tB, y: 766, pulse: tCB},
  {k: 'C', name: 'Mei T.', tone: 6, line: 'Opened your newsletter', tag: 'OPENED', tagColor: T.accent, at: tC, y: 1032, pulse: tCC},
];

const QuizCard: React.FC<{q: Q; right?: React.ReactNode; rightAt?: number; grey?: number; glow?: number}> = ({q, right, rightAt, grey = 0, glow = 0}) => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [q.at - 2, q.at + 8], [0, 1], CLAMP);
  const pulse = interpolate(frame, [q.pulse, q.pulse + 5, q.pulse + 16], [0, 1, 0], CLAMP);
  const swap = rightAt === undefined ? 0 : interpolate(frame, [rightAt, rightAt + 10], [0, 1], CLAMP);
  const tile = grey > 0 ? `linear-gradient(135deg, ${alpha(T.muted, 0.55)}, ${alpha(T.muted, 0.35)})` : `linear-gradient(135deg, ${T.accent}, ${T.accent2})`;
  return (
    <div
      style={{
        position: 'relative', width: CARD_W, height: CARD_H, borderRadius: 40, background: T.surface,
        border: `${glow > 0 ? 2 : 1}px solid ${glow > 0 ? alpha(T.hot, 0.35 + 0.5 * glow) : T.line}`,
        boxShadow: glow > 0 ? `0 30px 80px ${alpha(T.hot, 0.25 * glow)}` : '0 24px 60px rgba(40,20,90,0.10)',
        display: 'flex', alignItems: 'center', gap: 28, padding: '0 34px', fontFamily: BODY,
      }}
    >
      <div
        style={{
          width: 150, height: 150, borderRadius: 40, background: tile, color: '#fff', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.display, fontWeight: 800, fontSize: 98,
          transform: `scale(${1 + pulse * 0.14})`, boxShadow: `0 ${12 + pulse * 10}px ${30 + pulse * 30}px ${alpha(T.accent, 0.3 * (1 - grey))}`,
        }}
      >
        {q.k}
      </div>
      <div style={{flex: 1, position: 'relative', height: 140, marginRight: right ? 170 : 0}}>
        <div style={{position: 'absolute', inset: 0, opacity: 1 - fill, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18}}>
          <div style={{width: 250, height: 26, borderRadius: 13, background: alpha(T.text, 0.08)}} />
          <div style={{width: 430, height: 20, borderRadius: 10, background: alpha(T.text, 0.06)}} />
        </div>
        <div style={{position: 'absolute', inset: 0, opacity: fill, transform: `translateY(${(1 - fill) * 14}px)`, display: 'flex', alignItems: 'center', gap: 20}}>
          <Avatar name={q.name} tone={q.tone} size={80} />
          <div style={{minWidth: 0}}>
            <div style={{fontWeight: 800, fontSize: 44, color: T.text, letterSpacing: '-0.02em'}}>{q.name}</div>
            <div style={{fontWeight: 500, fontSize: 29, color: T.muted, whiteSpace: 'nowrap'}}>{q.line}</div>
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'absolute', right: 26, top: 24, opacity: fill * (1 - swap), padding: '8px 18px', borderRadius: 999,
          background: alpha(q.tagColor, 0.12), border: `1px solid ${alpha(q.tagColor, 0.45)}`, color: q.tagColor,
          fontWeight: 800, fontSize: 21, letterSpacing: '0.12em',
        }}
      >
        {q.tag}
      </div>
      {right ? <div style={{position: 'absolute', right: 30, top: 0, bottom: 0, display: 'flex', alignItems: 'center', opacity: swap, transform: `scale(${0.8 + 0.2 * swap})`}}>{right}</div> : null}
    </div>
  );
};

// B's intent score climbs one signal at a time.
const StepScore: React.FC = () => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [tFour, tFour + 14, tFloor, tFloor + 14, tPrice, tPrice + 14], [0, 38, 38, 66, 66, 92], {...CLAMP, easing: ease});
  const col = v >= 80 ? T.hot : T.accent;
  return (
    <Ring size={168} stroke={14} p={v / 100} color={col} track={alpha(col, 0.15)}>
      <div style={{fontFamily: BODY, fontWeight: 800, fontSize: 56, color: T.text, letterSpacing: '-0.04em', lineHeight: 1}}>{Math.round(v)}</div>
      <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 16, color: T.muted, letterSpacing: '0.14em', marginTop: 4}}>INTENT</div>
    </Ring>
  );
};

const Countdown: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < tCount || frame >= tIts + 4) return null;
  const span = tIts - tCount;
  const k = Math.min(2, Math.floor(((frame - tCount) / span) * 3));
  const n = 3 - k;
  const tick = tCount + (k * span) / 3;
  const pop = spring({frame: frame - tick, fps, config: {damping: 12, stiffness: 200}});
  const enter = spring({frame: frame - tCount, fps, config: {damping: 14}});
  return (
    <div style={{transform: `scale(${enter})`}}>
      <Ring size={124} stroke={10} p={1 - (frame - tCount) / span} color={T.accent2} track={alpha(T.accent2, 0.15)}>
        <div style={{fontFamily: T.display, fontWeight: 800, fontSize: 64, color: T.text, transform: `scale(${0.6 + 0.4 * pop})`, lineHeight: 1}}>{n}</div>
      </Ring>
    </div>
  );
};

export const IG01: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const reveal = interpolate(frame, [tIts, tIts + 16], [0, 1], {...CLAMP, easing: ease});
  const bUp = spring({frame: frame - tIts - 4, fps, config: {damping: 18, stiffness: 90}});
  const aBack = spring({frame: frame - tAq, fps, config: {damping: 18, stiffness: 110}});
  const hot = interpolate(frame, [tPrice + 8, tPrice + 20], [0, 1], CLAMP);
  const skeleton = (i: number) => spring({frame: frame - 6 - i * 4, fps, config: {damping: 16, stiffness: 120}});
  const [qa, qb, qc] = QS;
  return (
    <AbsoluteFill>
      <Stage theme={T}>
        <FadeOut at={tSee - 14}>
        <div style={{position: 'absolute', left: CARD_X + 6, top: 432}}>
          <Label theme={T} size={24} style={{opacity: interpolate(frame, [4, 14], [0, 1], CLAMP) * (1 - reveal)}}>Your inbox · 3 new leads</Label>
        </div>

        {/* A: leaves at the reveal, comes back at "A?" */}
        {frame < tIts + 16 ? (
          <div style={{position: 'absolute', left: CARD_X - reveal * 1100, top: qa.y, opacity: skeleton(0) * (1 - reveal), transform: `translateY(${(1 - skeleton(0)) * 80}px)`}}>
            <QuizCard q={qa} />
          </div>
        ) : null}
        {frame >= tAq - 2 ? (
          <div style={{position: 'absolute', left: CARD_X - (1 - aBack) * 1100, top: 1196}}>
            <QuizCard
              q={qa} grey={1} rightAt={tGone - 2}
              right={
                <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 999, background: alpha(T.bad, 0.1), border: `1.5px solid ${alpha(T.bad, 0.5)}`, color: T.bad, fontWeight: 800, fontSize: 30}}>
                  <Timer size={30} strokeWidth={2.6} /> 0:40
                </div>
              }
            />
          </div>
        ) : null}

        {/* B: the answer */}
        <div style={{position: 'absolute', left: CARD_X, top: interpolate(bUp, [0, 1], [qb.y, 486]), opacity: skeleton(1), transform: `translateY(${(1 - skeleton(1)) * 80}px) scale(${1 + 0.03 * Math.sin(Math.PI * Math.min(1, bUp))})`, zIndex: 5}}>
          <QuizCard q={qb} rightAt={tIts + 8} right={<StepScore />} glow={hot} />
        </div>

        {/* C: leaves at the reveal */}
        {frame < tIts + 16 ? (
          <div style={{position: 'absolute', left: CARD_X + reveal * 1100, top: qc.y, opacity: skeleton(2) * (1 - reveal), transform: `translateY(${(1 - skeleton(2)) * 80}px)`}}>
            <QuizCard q={qc} />
          </div>
        ) : null}

        {/* the guess */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 1330, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30}}>
          <CommentPrompt theme={T} at={tComment} text="My guess is…" exitAt={tIts - 2} width={660} size={44} />
          <Countdown />
        </div>

        {/* what B actually did */}
        <div style={{position: 'absolute', left: CARD_X, top: 752, display: 'flex', flexDirection: 'column', gap: 20}}>
          <LogRow theme={T} at={tFour} width={CARD_W} size={38} icon={<Repeat size={38} strokeWidth={2.4} />} title="4 visits this week" sub="Penthouse 42A, every time" meta="+38" color={T.accent} />
          <LogRow theme={T} at={tFloor} width={CARD_W} size={38} icon={<FileText size={38} strokeWidth={2.4} />} title="Downloaded the floor plans" sub="floor-plans-42A.pdf" meta="+28" color={T.accent} />
          <LogRow theme={T} at={tPrice} width={CARD_W} size={38} icon={<Tag size={38} strokeWidth={2.4} />} title="Opened the price list" sub="Read for 3 minutes" meta="+26" color={T.hot} active={hot} />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1236, display: 'flex', justifyContent: 'center'}}>
          <Stamp theme={T} at={tPrice + 12} text="READY TO BUY" color={T.hot} size={70} rotate={-6} exitAt={tAq - 6} />
        </div>
        </FadeOut>

        <SpokenHeadline
          theme={T} vo={vo} size={78} y={196} width={960} hideAfter={tSee - 6}
          emph={['first?', 'today.', 'quiet', 'newsletter.', 'visits', 'floor', 'price', 'gone', '40']} emph2={['comment']}
        />
        <Sequence from={tSee - 6}>
          <EndCard theme={T} headline="See what your inbox *can't.*" ctaAt={tDM - tSee + 4} />
        </Sequence>
      </Stage>
      <Soundtrack
        music="social" musicVol={0.42} musicFrom={4} sfxScale={0.75}
        cues={[
          [4, 'pop', 0.2], [8, 'whoosh', 0.2], [tA, 'pop'], [tB, 'pop'], [tC, 'pop'], [tComment, 'typing', 0.3],
          [tCA, 'click', 0.45], [tCB, 'click', 0.45], [tCC, 'click', 0.45],
          [tCount, 'blips', 0.3], [tCount + Math.round((tIts - tCount) / 3), 'blips', 0.3], [tCount + Math.round((2 * (tIts - tCount)) / 3), 'blips', 0.3],
          [tIts - 2, 'impact', 0.35], [tIts + 2, 'whoosh'], [tFour, 'pop'], [tFloor, 'pop'], [tPrice, 'pop'], [tPrice + 12, 'impact', 0.3], [tPrice + 16, 'chime', 0.2],
          [tAq, 'whoosh', 0.22], [tGone, 'blips', 0.3], [tSee - 6, 'whoosh'], [tSee + 10, 'sparkle'], [tDM, 'pop'],
        ]}
      />
    </AbsoluteFill>
  );
};
