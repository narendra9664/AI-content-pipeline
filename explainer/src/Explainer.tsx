import React from 'react';
import {AbsoluteFill} from 'remotion';
import {TransitionSeries, linearTiming, springTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {Background} from './components/Background';
import {Hook} from './scenes/Hook';
import {Problem} from './scenes/Problem';
import {Brand} from './scenes/Brand';
import {Track} from './scenes/Track';
import {Rank} from './scenes/Rank';
import {FollowUp} from './scenes/FollowUp';
import {Outro} from './scenes/Outro';
import {TRANSITIONS, durOf} from './timeline';

const step = (i: number) => springTiming({config: {damping: 200}, durationInFrames: TRANSITIONS[i]});

export const Explainer: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={durOf('hook')}>
        <Hook />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: TRANSITIONS[0]})} />
      <TransitionSeries.Sequence durationInFrames={durOf('problem')}>
        <Problem />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: TRANSITIONS[1]})} />
      <TransitionSeries.Sequence durationInFrames={durOf('brand')}>
        <Brand />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={step(2)} />
      <TransitionSeries.Sequence durationInFrames={durOf('track')}>
        <Track />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={step(3)} />
      <TransitionSeries.Sequence durationInFrames={durOf('rank')}>
        <Rank />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={step(4)} />
      <TransitionSeries.Sequence durationInFrames={durOf('followup')}>
        <FollowUp />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: TRANSITIONS[5]})} />
      <TransitionSeries.Sequence durationInFrames={durOf('outro')}>
        <Outro />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);
