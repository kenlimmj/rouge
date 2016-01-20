/* @flow */

import * as utils from './utils';

export function rougeN(
  cand: string,
  ref: string,
  opts: {
    n: number,
    nGram: ((tokens: Array<string>, n: number) => Array<string>),
    tokenizer: ((input: string) => Array<string>)
  } = {
    n: 1,
    nGram: utils.nGram,
    tokenizer: utils.treeBankTokenize,
  }
): number {
  const candGrams = opts.nGram(opts.tokenizer(cand), opts.n);
  const refGrams = opts.nGram(opts.tokenizer(ref), opts.n);

  const match = utils.intersection(candGrams, refGrams);
  return match.length / candGrams.length;
}

export function rougeS(
  cand: string,
  ref: string,
  opts: {
    beta: number,
    skipBigram: ((tokens: Array<string>) => Array<string>),
    tokenizer: ((input: string) => Array<string>)
  } = {
    beta: 0.5,
    skipBigram: utils.skipBigram,
    tokenizer: utils.treeBankTokenize,
  }
): number {
  const candGrams = opts.skipBigram(opts.tokenizer(cand));
  const refGrams = opts.skipBigram(opts.tokenizer(ref));

  const skip2 = utils.intersection(candGrams, refGrams);
  const skip2Recall = skip2.length / utils.comb2(ref.length);
  const skip2Prec = skip2.length / utils.comb2(cand.length);

  return utils.fMeasure(skip2Prec, skip2Recall, opts.beta);
}

export function rougeL(
  cand: string,
  ref: string,
  opts: {
    beta: number,
    lcs: ((a: Array<string>, b: Array<string>) => Array<string>),
    segmenter: ((input: string) => Array<string>),
    tokenizer: ((input: string) => Array<string>)
  } = {
    beta: 0.5,
    lcs: utils.lcs,
    segmenter: utils.sentenceSegment,
    tokenizer: utils.treeBankTokenize,
  }
): number {
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
