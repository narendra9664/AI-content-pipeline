// Render post covers (9:16 Reels) and thumbnails (16:9) for the series.
// usage: node scripts/render-covers.mjs [ID ...]      -> out/series/covers/<ID>-cover.jpg
import path from 'node:path';
import fs from 'node:fs';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';

// [video, composition, frame in the video, title (markup: *accent*, | = line break), framing overrides]
const COVERS = [
  ['V1', 'CoverV', 175, "What's *beneath* your website?"],
  ['V2', 'CoverV', 440, 'The *11:48 PM* buyer'],
  ['V3', 'CoverV', 150, '50 leads. 10 calls. *Who first?*'],
  ['V4', 'CoverV', 230, 'The reply that came *too late.*'],
  ['V5', 'CoverV', 462, 'Track. Rank. | *Follow up.*'],
  ['H1', 'CoverH', 270, "What your website *isn't telling you*"],
  ['H2', 'CoverH', 558, 'Not every | lead is *equal.*', {scale: 0.78, x: 60}],
  ['H3', 'CoverH', 452, 'Follow-up that feels *personal.*', {scale: 0.6, x: 20}],
  ['H4', 'CoverH', 420, 'Monday, 9 AM. *One screen.*'],
  ['W1', 'CoverH', 560, 'Know which buyers are *ready.*'],
  // silent Instagram series
  ['IG01', 'CoverV', 360, 'Which lead *buys first?*', {y: 420, scale: 0.84}],
  ['IG02', 'CoverV', 520, '14 days. | *Zero* form fills.', {y: 330, scale: 0.86}],
  ['IG03', 'CoverV', 522, '3 signs a buyer | is *ready*', {y: 360, scale: 0.84}],
  ['IG04', 'CoverV', 500, 'Which one | *are you?*', {y: 360, scale: 0.84}],
  ['IG05', 'CoverV', 300, 'Your follow-up | is *leaking*', {y: 330, scale: 0.86}],
  ['IG06', 'CoverV', 510, 'The first | *60 seconds*', {y: 400, scale: 0.84}],
  ['IG07', 'CoverV', 520, 'The reply that | *books viewings*', {y: 330, scale: 0.84}],
  ['IG08', 'CoverV', 600, 'Never open | a call *blind*', {y: 300, scale: 0.84}],
  ['IG09', 'CoverV', 360, 'Take the | *8 PM test*', {y: 380, scale: 0.84}],
  ['IG10', 'CoverV', 260, 'Their 9 PM is | your *3 AM*', {y: 300, scale: 0.84}],
];

const only = process.argv.slice(2);
const SHELL = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browserExecutable = process.env.REMOTION_BROWSER ?? (fs.existsSync(SHELL) ? SHELL : null);
const outDir = path.resolve('out/series/covers');
fs.mkdirSync(outDir, {recursive: true});

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browser = await openBrowser('chrome', {browserExecutable});
for (const [id, comp, frame, title, framing = {}] of COVERS) {
  if (only.length && !only.includes(id)) continue;
  const inputProps = {id, frame, title, ...framing};
  const composition = await selectComposition({serveUrl, id: comp, inputProps, puppeteerInstance: browser});
  const output = path.join(outDir, `${id}-cover.jpg`);
  await renderStill({composition, serveUrl, output, inputProps, imageFormat: 'jpeg', jpegQuality: 90, puppeteerInstance: browser});
  console.log('wrote', output);
}
await browser.close({silent: true});
