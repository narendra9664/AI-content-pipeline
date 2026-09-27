import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {THEMES, Theme, alpha} from './theme';
import {HideSpoken, parse, colorFor} from './kit/Text';
import {FDMark, Wordmark} from './kit/Logo';
import {V1} from './videos/V1';
import {V2} from './videos/V2';
import {V3} from './videos/V3';
import {V4} from './videos/V4';
import {V5} from './videos/V5';
import {H1} from './videos/H1';
import {H2} from './videos/H2';
import {H3} from './videos/H3';
import {H4} from './videos/H4';
import {W1} from './videos/W1';

// Post covers / thumbnails: a frame from the video itself, with a big hook title laid over a
// scrim that hides the burned-in headline. Rendered by scripts/render-covers.mjs.
// Title markup: *accent*, and a lone | forces a line break.

export const VIDEOS: Record<string, {C: React.FC; theme: Theme}> = {
  V1: {C: V1, theme: THEMES.midnight},
  V2: {C: V2, theme: THEMES.emerald},
  V3: {C: V3, theme: THEMES.coral},
  V4: {C: V4, theme: THEMES.volt},
  V5: {C: V5, theme: THEMES.ivory},
  H1: {C: H1, theme: THEMES.teal},
  H2: {C: H2, theme: THEMES.lilac},
  H3: {C: H3, theme: THEMES.sand},
  H4: {C: H4, theme: THEMES.aurora},
  W1: {C: W1, theme: THEMES.brand},
};

export type CoverProps = {id: string; frame: number; title: string; x?: number; y?: number; scale?: number};

const Title: React.FC<{theme: Theme; text: string; size: number; width: number; align: 'left' | 'center'}> = ({theme, text, size, width, align}) => {
  const serif = theme.displayWeight === 400;
  return (
    <div
      style={{
        width, display: 'flex', flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : 'flex-start', columnGap: size * 0.24,
        fontFamily: theme.display, fontWeight: theme.displayWeight, letterSpacing: theme.displayTracking, fontSize: size, lineHeight: serif ? 0.98 : 1.02,
      }}
    >
      {parse(text).map((t, i) =>
        t.w === '|' ? (
          <span key={i} style={{flexBasis: '100%', height: 0}} />
        ) : (
          <span key={i} style={{color: colorFor(theme, t.mode), fontStyle: serif && t.mode !== 'n' ? 'italic' : undefined}}>
            {t.w}
          </span>
        ),
      )}
    </div>
  );
};

export const Cover: React.FC<CoverProps> = ({id, frame, title, x, y, scale}) => {
  const {width, height} = useVideoConfig();
  const {C, theme} = VIDEOS[id];
  const vertical = height > width;
  const bg = theme.bg;
  // Where the video frame sits under the title (tuned per format; overridable per cover).
  const vx = x ?? (vertical ? 0 : 60);
  const vy = y ?? (vertical ? 330 : 0);
  const vs = scale ?? (vertical ? 0.84 : 0.8);
  return (
    <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transformOrigin: vertical ? '50% 0' : '100% 50%', transform: `translate(${vx}px, ${vy}px) scale(${vs})`}}>
        <HideSpoken.Provider value>
          <Sequence from={-frame} layout="none">
            <C />
          </Sequence>
        </HideSpoken.Provider>
      </div>
      {vertical ? (
        <AbsoluteFill style={{background: `linear-gradient(180deg, ${bg} 0%, ${bg} 36%, ${alpha(bg, 0.85)} 44%, ${alpha(bg, 0)} 56%)`}} />
      ) : (
        <AbsoluteFill style={{background: `linear-gradient(90deg, ${bg} 0%, ${bg} 32%, ${alpha(bg, 0.8)} 42%, ${alpha(bg, 0)} 58%)`}} />
      )}
      {vertical ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <FDMark size={52} color={theme.accent} color2={theme.accent2} />
            <Wordmark theme={theme} size={34} />
          </div>
          <Title theme={theme} text={title} size={theme.displayWeight === 400 ? 124 : 106} width={940} align="center" />
        </div>
      ) : (
        <div style={{position: 'absolute', left: 96, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 36}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <FDMark size={50} color={theme.accent} color2={theme.accent2} />
            <Wordmark theme={theme} size={32} />
          </div>
          <Title theme={theme} text={title} size={theme.displayWeight === 400 ? 118 : 100} width={760} align="left" />
        </div>
      )}
    </AbsoluteFill>
  );
};
