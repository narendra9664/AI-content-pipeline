// Voiceover timing helpers. vo/*.json holds real per-word times from forced alignment
// (scripts/align_vo.py), so visuals can be keyed to the exact spoken word.
export type VOWord = {w: string; s: number; e: number};
export type VOData = {id: string; duration: number; text: string; words: VOWord[]};

export const FPS = 30;
export const f = (sec: number) => Math.round(sec * FPS);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, '');

const find = (vo: VOData, word: string, nth: number) => {
  let k = 0;
  for (const w of vo.words) {
    if (norm(w.w) === norm(word) && ++k === nth) return w;
  }
  throw new Error(`"${word}" #${nth} not found in ${vo.id}`);
};

/** Frame where the nth occurrence of `word` starts. */
export const at = (vo: VOData, word: string, nth = 1) => f(find(vo, word, nth).s);
/** Frame where the nth occurrence of `word` ends. */
export const endOf = (vo: VOData, word: string, nth = 1) => f(find(vo, word, nth).e);

export type Sentence = {i0: number; i1: number; s: number; e: number};

// Splits the script into display chunks: sentences, or also clauses when `comma` is set.
export const sentences = (vo: VOData, comma = false): Sentence[] => {
  const out: Sentence[] = [];
  let i0 = 0;
  // a closing quote after the punctuation still ends the sentence: for?”
  const end = comma ? /[.?!,]['"”’]?$/ : /[.?!]['"”’]?$/;
  vo.words.forEach((w, i) => {
    if (end.test(w.w) || i === vo.words.length - 1) {
      out.push({i0, i1: i, s: vo.words[i0].s, e: w.e});
      i0 = i + 1;
    }
  });
  return out;
};
