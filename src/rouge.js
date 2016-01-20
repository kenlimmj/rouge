import * as utils from './utils';

export function rougeN(cand, ref, opts = {
  n: 1,
  nGram: utils.nGram,
  tokenizer: utils.treeBankTokenize,
}) {
  const candGrams = opts.nGram(opts.tokenizer(cand), n);
  const refGrams = opts.nGram(opts.tokenizer(ref), n);

  const match = utils.intersection(candGrams, refGrams);
  return match.length / candGrams.length;
}

export function rougeS(cand, ref, opts = {
  beta: 0.5,
  skipBigram: utils.skipBigram,
  tokenizer: utils.treeBankTokenize,
}) {
  const candGrams = opts.skipBigram(opts.tokenizer(cand));
  const refGrams = opts.skipBigram(opts.tokenizer(ref));

  const skip2 = utils.intersection(candGrams, refGrams);
  const skip2Recall = skip2 / utils.comb2(ref.length);
  const skip2Prec = skip2 / utils.comb2(cand.length);

  return utils.fMeasure(skip2Prec, skip2Recall, opts.beta);
}

export function rougeL(cand, ref, opts = {
  beta: 0.5,
  lcs: utils.lcs,
  segmenter: utils.sentenceSegment,
  tokenizer: utils.treeBankTokenize,
}) {
  const candSents = opts.segmenter(cand);
  const refSents = opts.segmenter(ref);

  const candWords = opts.tokenizer(cand);
  const refWords = opts.tokenizer(ref);

  const lcsAcc = refSents.map(r => {
    const rTokens = opts.tokenizer(r);

    const lcsUnion = new Set(candSents.map(c => {
      const cTokens = opts.tokenizer(c);
      return opts.lcs(cTokens, rTokens);
    }));

    return lcsUnion.size;
  });

  const lcsSum = lcsAcc.reduce((x, y) => x + y);
  const lcsRecall = lcsSum / candWords.length;
  const lcsPrec = lcsSum / refWords.length;

  return utils.fMeasure(lcsPrec, lcsRecall, opts.beta);
}
