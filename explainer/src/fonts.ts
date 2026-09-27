import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Inter is bundled locally (from @fontsource/inter) so renders never depend on a font CDN.
for (const weight of ['400', '500', '600', '700', '800']) {
  loadFont({
    family: 'Inter',
    url: staticFile(`fonts/inter-latin-${weight}-normal.woff2`),
    weight,
  });
}
