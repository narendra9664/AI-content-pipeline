import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FileText, Phone as PhoneIcon, Repeat, Tag} from 'lucide-react';
import {BODY, CLAMP, THEMES, alpha} from '../theme';
import {VOData, at} from '../vo';
import vo3 from '../vo/v3.json';
import {Stage} from '../kit/Stage';
import {Label, SpokenHeadline} from '../kit/Text';
import {Chip, Cursor, Rise} from '../kit/Misc';
import {Avatar, Queue} from '../kit/Lead';
import {Toast} from '../kit/Chat';
import {EndCard} from '../kit/Logo';
import {Soundtrack} from '../kit/Audio';

const T = THEMES.coral;
const vo = vo3 as VOData;
export const V3_FRAMES = Math.ceil(vo.duration * 30) + 45;
const w = (word: string, n = 1) => at(vo, word, n);

// 50 fictional first names -> initials for the lead grid.
const NAMES = 'Ava Ben Cara Dev Ella Finn Gia Hugo Isla Jay Kai Lena Milo Nora Omar Pia Quinn Rosa Sami Tara Uma Vik Wren Xan Yara Zed Amir Bea Cole Dina Eli Fay Gus Hana Ivo Jade Kofi Lara Mateo Nia Otto Pooja Rafe Sofia Theo Una Vera Will Yusuf Zoe'.split(' ');
const COLS = 10;
const CELL = 88;
const GRID_X = (1080 - COLS * CELL) / 2;
const GRID_Y = 520;
const rand = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const LeadGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tSo = w('so');
  const tFD = w('frontdesk');
  const wobble = interpolate(frame, [tSo - 4, tSo + 6], [0, 1], CLAMP);
  return (
    <>
      {NAMES.map((n, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const tIn = 6 + Math.floor(rand(i) * 32);
        const p = spring({frame: frame - tIn, fps, config: {damping: 12, stiffness: 180}});
        const tOut = tFD - 6 + Math.floor(rand(i + 99) * 12);
        const out = interpolate(frame, [tOut, tOut + 10], [0, 1], CLAMP);
        const jx = Math.sin(frame / 3 + i) * 7 * wobble;
        const jy = Math.cos(frame / 4 + i * 2) * 7 * wobble;
        return (
          <div
            key={n}
            style={{
              position: 'absolute', left: GRID_X + col * CELL + 8 + jx, top: GRID_Y + row * CELL + 8 + jy,
              transform: `scale(${p * (1 - out)}) rotate(${Math.sin(frame / 5 + i) * 8 * wobble}deg)`, opacity: 1 - out,
            }}
          >
            <Avatar name={`${n} ${NAMES[(i * 7) % 50]}`} tone={i} size={72} />
          </div>
        );
      })}
    </>
  );
};

const CallSlots: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tTen = w('ten');
  const tFirst = w('first?');
  const tFD = w('frontdesk');
  const out = interpolate(frame, [tFD - 6, tFD + 6], [0, 1], CLAMP);
  const q = interpolate(frame, [tFirst - 4, tFirst + 6], [0, 1], CLAMP);
  if (frame < tTen - 10) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1030, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: 1 - out}}>
      <div style={{display: 'flex', gap: 14}}>
        {Array.from({length: 10}).map((_, i) => {
          const p = spring({frame: frame - (tTen - 8 + i * 2), fps, config: {damping: 13, stiffness: 170}});
          const first = i === 0;
          return (
            <div
              key={i}
              style={{
                width: 74, height: 74, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: first && q > 0 ? alpha(T.accent, 0.15 + 0.1 * Math.sin(frame / 3)) : T.surface,
                border: `2px solid ${first && q > 0 ? T.accent : alpha(T.accent, 0.35)}`, color: T.accent, transform: `scale(${p})`,
                fontFamily: BODY, fontWeight: 800, fontSize: 40,
              }}
            >
              {first && q > 0 ? '?' : <PhoneIcon size={30} strokeWidth={2.4} />}
            </div>
          );
        })}
      </div>
      <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 30, color: T.muted, opacity: spring({frame: frame - tTen, fps, config: {damping: 200}})}}>
        Time for <span style={{color: T.text}}>10 calls</span>. 40 leads wait.
      </div>
    </div>
  );
};

const SIGNALS: [string, React.ReactNode, string][] = [
  ['repeat', <Repeat key="r" size={34} strokeWidth={2.4} />, 'Repeat visits'],
  ['floor', <FileText key="f" size={34} strokeWidth={2.4} />, 'Floor plans'],
  ['pricing', <Tag key="p" size={34} strokeWidth={2.4} />, 'Pricing questions'],
];

export const V3: React.FC = () => {
  const frame = useCurrentFrame();
  const tSo = w('so');
  const tFD = w('frontdesk');
  const tRanks = w('ranks');
  const tRepeat = w('repeat');
  const tFloor = w('floor');
  const tPricing = w('pricing');
  const tThe = w('the');
  const tRise = w('rise');
  const tTop = w('top,');
  const tAgents = w('agents');
  const tStop = w('stop');
  const tDM = w('dm');
  const ids = ['daniel', 'james', 'sarah', 'mei', 'priya', 'omar'];
  const sorted = ['sarah', 'omar', 'priya', 'james', 'daniel', 'mei'];
  const secs = Math.max(0, Math.floor((frame - tAgents - 10) / 30));
  const signalAt = [tRepeat, tFloor, tPricing];
  return (
    <AbsoluteFill>
      <Stage theme={T}>
        <div style={{position: 'absolute', left: GRID_X + 8, top: GRID_Y - 70}}>
          <Rise at={4} exitAt={tFD - 8} dy={20}>
            <Label theme={T} size={24}>This week · 50 new leads</Label>
          </Rise>
        </div>
        <LeadGrid />
        <CallSlots />
        <Sequence durationInFrames={tFD + 2} layout="none">
          <Cursor
            path={[[tSo - 6, 700, 1400], [tSo + 6, 380, 720], [tSo + 16, 760, 640], [tSo + 26, 520, 880], [tSo + 36, 850, 820], [tSo + 46, 300, 900], [tFD - 4, 620, 760]]}
            color={T.accent}
          />
        </Sequence>

        {/* The ranked list */}
        <div style={{position: 'absolute', left: 90, top: 620}}>
          <Rise at={tFD + 2} exitAt={tStop - 10} dy={0} scale={1} blur={false}>
            <Queue
              theme={T} ids={ids} from={ids} to={sorted} at={tRise - 6} width={900} rowH={112} gap={14}
              scoreAt={tRanks} tierAt={tTop} focusId="sarah" focusAt={tTop} enterAt={tFD + 2} dimAfter={3}
              flash={{sarah: tRepeat, priya: tFloor, omar: tPricing}}
            />
          </Rise>
        </div>
        <div style={{position: 'absolute', left: 90, top: 540}}>
          <Rise at={tRanks - 2} exitAt={tRepeat - 6} dy={20}>
            <Label theme={T} size={24}>Scoring what each lead actually did</Label>
          </Rise>
        </div>
        {SIGNALS.map(([k, icon, text], i) => (
          <div key={k} style={{position: 'absolute', left: 0, right: 0, top: 500, display: 'flex', justifyContent: 'center'}}>
            <Rise at={signalAt[i] - 3} exitAt={i < 2 ? signalAt[i + 1] - 6 : tThe - 4} dy={30}>
              <Chip theme={T} icon={icon} text={text} meta={['+30', '+25', '+22'][i]} color={T.accent} size={40} />
            </Rise>
          </div>
        ))}
        <div style={{position: 'absolute', left: 0, right: 0, top: 510, display: 'flex', justifyContent: 'center'}}>
          <Rise at={tTop - 4} exitAt={tStop - 10} dy={30}>
            <Label theme={T} size={26} color={T.good}>Ready buyers first</Label>
          </Rise>
        </div>

        {/* An agent starts at the top */}
        <div style={{position: 'absolute', left: 90, top: 1090}}>
          <Rise at={tAgents - 2} exitAt={tStop - 10} dy={80}>
            <Toast
              theme={T} at={tAgents - 2} width={900} icon={<PhoneIcon size={34} strokeWidth={2.4} />} title="Maya is calling Sarah K."
              body="#1 on today's list · intent score 92" meta={`00:${String(secs).padStart(2, '0')}`} color={T.good} size={38}
            />
          </Rise>
        </div>

        <SpokenHeadline
          theme={T} vo={vo} size={76} y={170} width={960} hideAfter={tStop - 6}
          emph={['fifty', 'ten', 'first?', 'actually', 'repeat', 'floor', 'pricing', 'ready', 'top,', 'agents']} emph2={['frontdesk', 'ai']}
        />
        <Sequence from={tStop - 6}>
          <EndCard theme={T} headline="Stop guessing who's *serious.*" ctaAt={tDM - tStop + 4} />
        </Sequence>
      </Stage>
      <Soundtrack
        vo="v3" music="social" musicVol={0.14}
        cues={[
          [4, 'blips', 0.35], [12, 'pop', 0.2], [24, 'pop', 0.2], [w('ten') - 8, 'blips', 0.4], [tSo - 4, 'whoosh', 0.2],
          [tFD - 6, 'whoosh'], [tRanks, 'blips'], [tRepeat - 3, 'pop'], [tFloor - 3, 'pop'], [tPricing - 3, 'pop'],
          [tRise - 8, 'riser', 0.25], [tRise - 4, 'whoosh'], [tTop, 'chime', 0.18], [tAgents - 2, 'click'], [tAgents + 4, 'pop'],
          [tStop - 6, 'impact', 0.35], [tStop + 10, 'sparkle'], [tDM, 'pop'],
        ]}
      />
    </AbsoluteFill>
  );
};
