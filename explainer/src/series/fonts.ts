import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// All fonts are bundled locally so renders never depend on a font CDN.
const FILES: [string, string, string, 'normal' | 'italic'][] = [
  ['Instrument Serif', 'instrument-serif-latin-400-normal', '400', 'normal'],
  ['Instrument Serif', 'instrument-serif-latin-400-italic', '400', 'italic'],
  ['Space Grotesk', 'space-grotesk-latin-500-normal', '500', 'normal'],
  ['Space Grotesk', 'space-grotesk-latin-600-normal', '600', 'normal'],
  ['Space Grotesk', 'space-grotesk-latin-700-normal', '700', 'normal'],
  ['Manrope', 'manrope-latin-500-normal', '500', 'normal'],
  ['Manrope', 'manrope-latin-600-normal', '600', 'normal'],
  ['Manrope', 'manrope-latin-700-normal', '700', 'normal'],
  ['Manrope', 'manrope-latin-800-normal', '800', 'normal'],
  ['Sora', 'sora-latin-500-normal', '500', 'normal'],
  ['Sora', 'sora-latin-600-normal', '600', 'normal'],
  ['Sora', 'sora-latin-700-normal', '700', 'normal'],
  ['DM Serif Display', 'dm-serif-display-latin-400-normal', '400', 'normal'],
  ['DM Serif Display', 'dm-serif-display-latin-400-italic', '400', 'italic'],
];

for (const [family, file, weight, style] of FILES) {
  loadFont({family, url: staticFile(`series/fonts/${file}.woff2`), weight, style});
}
for (const weight of ['400', '500', '600', '700', '800']) {
  loadFont({family: 'Inter', url: staticFile(`fonts/inter-latin-${weight}-normal.woff2`), weight});
}
