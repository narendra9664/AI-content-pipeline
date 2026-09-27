import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {Explainer} from './Explainer';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './timeline';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Explainer"
    component={Explainer}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
