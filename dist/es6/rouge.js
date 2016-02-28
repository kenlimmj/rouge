/**
* 
* @license
* @Author: Lim Mingjie, Kenneth
* @Date:   2016-01-20T18:56:14-05:00
* @Email:  me@kenlimmj.com
* @Last modified by:   Astrianna
* @Last modified time: 2016-02-27T19:50:25-05:00
*/

import * as utils from './utils';
export * from './utils';

export function n(cand, ref, opts) {
  if (cand.length === 0) throw new RangeError('Candidate cannot be an empty string');
  if (ref.length === 0) throw new RangeError('Reference cannot be an empty string');

  opts = Object.assign({
    n: 1,
    nGram: utils.nGram,
    tokenizer: utils.treeBankTokenize
  }, opts);

  const candGrams = opts.nGram(opts.tokenizer(cand), opts.n);
  const refGrams = opts.nGram(opts.tokenizer(ref), opts.n);

  const match = utils.intersection(candGrams, refGrams);
  return match.length / refGrams.length;
}

export function s(cand, ref, opts) {
  if (cand.length === 0) throw new RangeError('Candidate cannot be an empty string');
  if (ref.length === 0) throw new RangeError('Reference cannot be an empty string');

  opts = Object.assign({
    beta: 0.5,
    skipBigram: utils.skipBigram,
    tokenizer: utils.treeBankTokenize
  }, opts);

  const candGrams = opts.skipBigram(opts.tokenizer(cand));
  const refGrams = opts.skipBigram(opts.tokenizer(ref));

  const skip2 = utils.intersection(candGrams, refGrams).length;

  if (skip2 === 0) {
    return 0;
  } else {
    const skip2Recall = skip2 / refGrams.length;
    const skip2Prec = skip2 / candGrams.length;

    return utils.fMeasure(skip2Prec, skip2Recall, opts.beta);
  }
}

export function l(cand, ref, opts) {
  if (cand.length === 0) throw new RangeError('Candidate cannot be an empty string');
  if (ref.length === 0) throw new RangeError('Reference cannot be an empty string');

  opts = Object.assign({
    beta: 0.5,
    lcs: utils.lcs,
    segmenter: utils.sentenceSegment,
    tokenizer: utils.treeBankTokenize
  }, opts);

  const candSents = opts.segmenter(cand);
  const refSents = opts.segmenter(ref);

  const candWords = opts.tokenizer(cand);
  const refWords = opts.tokenizer(ref);

  const lcsAcc = refSents.map(r => {
    const rTokens = opts.tokenizer(r);
    const lcsUnion = new Set(...candSents.map(c => opts.lcs(opts.tokenizer(c), rTokens)));

    return lcsUnion.size;
  });

  let lcsSum = 0;
  while (lcsAcc.length) lcsSum += lcsAcc.pop();

  const lcsRecall = lcsSum / candWords.length;
  const lcsPrec = lcsSum / refWords.length;

  return utils.fMeasure(lcsPrec, lcsRecall, opts.beta);
}
//# sourceMappingURL=rouge.js.map
