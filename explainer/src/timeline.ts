import timeline from './timeline.json';

export const FPS = timeline.fps;
export const WIDTH = timeline.width;
export const HEIGHT = timeline.height;
export const SCENES = timeline.scenes;
export const TRANSITIONS = timeline.transitions;

// Scenes overlap by the transition length, so a scene starts at
// (sum of previous durations) - (sum of previous transitions).
export const sceneStart = (index: number) =>
  SCENES.slice(0, index).reduce((a, s) => a + s.dur, 0) -
  TRANSITIONS.slice(0, index).reduce((a, t) => a + t, 0);

export const TOTAL_FRAMES = sceneStart(SCENES.length - 1) + SCENES[SCENES.length - 1].dur;

export const durOf = (id: string) => {
  const s = SCENES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scene ${id}`);
  return s.dur;
};
