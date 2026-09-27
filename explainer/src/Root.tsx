import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import './series/fonts';
import {Explainer} from './Explainer';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './timeline';
import {V1, V1_FRAMES} from './series/videos/V1';
import {V2, V2_FRAMES} from './series/videos/V2';
import {V3, V3_FRAMES} from './series/videos/V3';
import {V4, V4_FRAMES} from './series/videos/V4';
import {V5, V5_FRAMES} from './series/videos/V5';
import {H1, H1_FRAMES} from './series/videos/H1';
import {H2, H2_FRAMES} from './series/videos/H2';
import {H3, H3_FRAMES} from './series/videos/H3';
import {H4, H4_FRAMES} from './series/videos/H4';
import {W1, W1_FRAMES} from './series/videos/W1';
import {StillBeneath, StillDashboard, StillFollowUp, StillQueue} from './series/Stills';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Explainer" component={Explainer} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="V1" component={V1} durationInFrames={V1_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="V2" component={V2} durationInFrames={V2_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="V3" component={V3} durationInFrames={V3_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="V4" component={V4} durationInFrames={V4_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="V5" component={V5} durationInFrames={V5_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="H1" component={H1} durationInFrames={H1_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="H2" component={H2} durationInFrames={H2_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="H3" component={H3} durationInFrames={H3_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="H4" component={H4} durationInFrames={H4_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="W1" component={W1} durationInFrames={W1_FRAMES} fps={30} width={1920} height={1080} />
    {/* website stills */}
    <Composition id="StillBeneath" component={StillBeneath} durationInFrames={120} fps={30} width={1600} height={1000} />
    <Composition id="StillDashboard" component={StillDashboard} durationInFrames={600} fps={30} width={1600} height={1000} />
    <Composition id="StillQueue" component={StillQueue} durationInFrames={120} fps={30} width={1200} height={1000} />
    <Composition id="StillFollowUp" component={StillFollowUp} durationInFrames={120} fps={30} width={1200} height={900} />
  </>
);
