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
import {Cover, CoverProps} from './series/Covers';
import {CASE_STUDY_DEFAULTS, CASE_STUDY_FRAMES, CaseStudy} from './series/videos/CaseStudy';

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
    {/* video 11: case-study template, filled via --props with real client numbers */}
    <Composition id="CaseStudy" component={CaseStudy} durationInFrames={CASE_STUDY_FRAMES} fps={30} width={1080} height={1920} defaultProps={CASE_STUDY_DEFAULTS} />
    {/* website stills */}
    <Composition id="StillBeneath" component={StillBeneath} durationInFrames={120} fps={30} width={1600} height={1000} />
    <Composition id="StillDashboard" component={StillDashboard} durationInFrames={600} fps={30} width={1600} height={1000} />
    <Composition id="StillQueue" component={StillQueue} durationInFrames={120} fps={30} width={1200} height={1000} />
    <Composition id="StillFollowUp" component={StillFollowUp} durationInFrames={120} fps={30} width={1200} height={900} />
    {/* post covers / thumbnails (scripts/render-covers.mjs passes the props) */}
    <Composition id="CoverV" component={Cover} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{id: 'V1', frame: 175, title: "What's *beneath* your website?"} as CoverProps} />
    <Composition id="CoverH" component={Cover} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{id: 'H1', frame: 270, title: "What your website *isn't telling you*"} as CoverProps} />
  </>
);
