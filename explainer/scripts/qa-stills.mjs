// Bundle once, then render a list of frames as half-size PNGs for visual QA.
// usage: node scripts/qa-stills.mjs <CompositionId> 30 100 250 ...
import path from 'node:path';
import fs from 'node:fs';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';

const [id, ...rest] = process.argv.slice(2);
const frames = rest.map(Number);
const SHELL = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browserExecutable = process.env.REMOTION_BROWSER ?? (fs.existsSync(SHELL) ? SHELL : null);
const outDir = path.resolve('out/qa', id);
fs.mkdirSync(outDir, {recursive: true});

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browser = await openBrowser('chrome', {browserExecutable});
const composition = await selectComposition({serveUrl, id, puppeteerInstance: browser});
console.log(`${id}: ${composition.durationInFrames} frames`);
for (const frame of frames) {
  const output = path.join(outDir, `f${String(frame).padStart(4, '0')}.png`);
  await renderStill({composition, serveUrl, output, frame, scale: 0.5, puppeteerInstance: browser});
  console.log('wrote', output);
}
await browser.close({silent: true});
