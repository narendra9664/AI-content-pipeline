// Lay the music bed + SFX cues (from src/timeline.json) under the silent render,
// then loudness-normalise to -16 LUFS (social/web standard).
// usage: FFMPEG=/path/to/ffmpeg node scripts/mix-audio.mjs out/explainer-silent.mp4 out/explainer.mp4
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';

const [input = 'out/explainer-silent.mp4', output = 'out/explainer.mp4'] = process.argv.slice(2);
const ffmpeg = process.env.FFMPEG || 'ffmpeg';
const tl = JSON.parse(fs.readFileSync('src/timeline.json', 'utf8'));

const starts = {};
let acc = 0;
tl.scenes.forEach((s, i) => {
  starts[s.id] = acc;
  acc += s.dur - (tl.transitions[i] ?? 0);
});
const last = tl.scenes[tl.scenes.length - 1];
const total = (starts[last.id] + last.dur) / tl.fps;

const args = ['-y', '-hide_banner', '-loglevel', 'error', '-i', input, '-i', `public/${tl.music.file}`];
const filters = [
  `[1:a]atrim=0:${total},asetpts=N/SR/TB,volume=${tl.music.gainDb}dB,` +
    `afade=t=in:st=0:d=${tl.music.fadeInSec},afade=t=out:st=${(total - tl.music.fadeOutSec).toFixed(3)}:d=${tl.music.fadeOutSec}[m]`,
];
const labels = ['[m]'];
tl.sfx.forEach((cue, k) => {
  const ms = Math.round(((starts[cue.scene] + cue.at) / tl.fps) * 1000);
  args.push('-i', `public/audio/${cue.file}.mp3`);
  filters.push(`[${k + 2}:a]adelay=delays=${ms}:all=1,volume=${cue.gainDb}dB[s${k}]`);
  labels.push(`[s${k}]`);
});
filters.push(`${labels.join('')}amix=inputs=${labels.length}:normalize=0:duration=first[mix]`);
filters.push(`[mix]loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[out]`);

args.push(
  '-filter_complex', filters.join(';'),
  '-map', '0:v', '-map', '[out]',
  '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart',
  output,
);
const r = spawnSync(ffmpeg, args, {stdio: 'inherit'});
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(`mixed ${tl.sfx.length} SFX cues + music -> ${output} (${total.toFixed(2)}s)`);
