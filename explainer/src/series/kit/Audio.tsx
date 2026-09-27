import React from 'react';
import {Audio, Sequence, interpolate, staticFile, useVideoConfig} from 'remotion';

export type Sfx = 'whoosh' | 'pop' | 'click' | 'send' | 'chime' | 'typing' | 'scan' | 'impact' | 'riser' | 'blips' | 'sparkle';
export type Cue = [number, Sfx, number?]; // [frame, sound, volume]

// Default gains, balanced by ear against a voiceover at ~-20 dB mean.
const GAIN: Record<Sfx, number> = {
  whoosh: 0.32, pop: 0.3, click: 0.7, send: 0.55, chime: 0.22, typing: 0.45, scan: 0.38, impact: 0.42, riser: 0.3, blips: 0.45, sparkle: 0.9,
};

export const Soundtrack: React.FC<{
  vo?: string;
  voAt?: number;
  music: 'tech' | 'luxury' | 'social';
  musicVol: number;
  musicFrom?: number; // seconds into the track
  fadeIn?: number;
  fadeOut?: number;
  cues?: Cue[];
  sfxScale?: number;
}> = ({vo, voAt = 0, music, musicVol, musicFrom = 0, fadeIn = 12, fadeOut = 40, cues = [], sfxScale = 1}) => {
  const {durationInFrames, fps} = useVideoConfig();
  return (
    <>
      <Audio
        src={staticFile(`series/music/${music}.mp3`)}
        trimBefore={Math.round(musicFrom * fps)}
        volume={(f) =>
          musicVol * interpolate(f, [0, fadeIn, durationInFrames - fadeOut, durationInFrames - 2], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
        }
      />
      {vo ? (
        <Sequence from={voAt} layout="none">
          <Audio src={staticFile(`series/vo/${vo}.mp3`)} />
        </Sequence>
      ) : null}
      {cues.map(([at, sfx, vol], i) => (
        <Sequence key={i} from={Math.max(0, at)} durationInFrames={Math.round(4.2 * fps)} layout="none">
          <Audio src={staticFile(`series/sfx/${sfx}.mp3`)} volume={(vol ?? GAIN[sfx]) * sfxScale} />
        </Sequence>
      ))}
    </>
  );
};
