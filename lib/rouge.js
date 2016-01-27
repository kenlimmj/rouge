/**
* @flow
* @license
* @Author: Lim Mingjie, Kenneth
* @Date:   2016-01-20T18:56:14-05:00
* @Email:  me@kenlimmj.com
* @Last modified by:   Lim Mingjie, Kenneth
* @Last modified time: 2016-01-22T15:33:26-05:00
*/

import * as utils from './utils';
export * from './utils';

/**
 * Computes the ROUGE-N score for a candidate summary.
 *
 * Configuration object schema and defaults:
 * ```
 * {
 * 	n: 1                            // The size of the ngram used
 * 	nGram: <inbuilt function>,      // The ngram generator function
 * 	tokenizer: <inbuilt function>   // The string tokenizer
 * }
 * ```
 *
 * `nGram` has a type signature of ((Array<string>, number) => Array<string>)
 * `tokenizer` has a type signature of ((string) => Array<string)
 *
 * @method n
 * @param  {string}     cand        The candidate summary to be evaluated
 * @param  {string}     ref         The reference summary to be evaluated against
 * @param  {Object}     opts        Configuration options (see example)
 * @return {number}                 The ROUGE-N score
 */
export function n(
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

/**
 * Computes the ROUGE-S score for a candidate summary.
 *
 * Configuration object schema and defaults:
 * ```
 * {
 * 	beta: 1                             // The beta value used for the f-measure
 * 	gapLength: 2                        // The skip window
 * 	skipBigram: <inbuilt function>,     // The skip-bigram generator function
 * 	tokenizer: <inbuilt function>       // The string tokenizer
 * }
 * ```
 *
 * `skipBigram` has a type signature of ((Array<string>, number) => Array<string>)
 * `tokenizer` has a type signature of ((string) => Array<string)
 *
 * @method s
 * @param  {string}     cand        The candidate summary to be evaluated
 * @param  {string}     ref         The reference summary to be evaluated against
 * @param  {Object}     opts        Configuration options (see example)
 * @return {number}                 The ROUGE-S score
 */
export function s(
  cand: string,
  ref: string,
  opts: {
    beta: number,
    gapLength: number,
    skipBigram: ((tokens: Array<string>, gapLength: number) => Array<string>),
    tokenizer: ((input: string) => Array<string>)
  } = {
    beta: 0.5,
    gapLength: 2,
    skipBigram: utils.skipBigram,
    tokenizer: utils.treeBankTokenize,
  }
): number {
  const candGrams = opts.skipBigram(opts.tokenizer(cand), opts.gapLength);
  const refGrams = opts.skipBigram(opts.tokenizer(ref), opts.gapLength);

  const skip2 = utils.intersection(candGrams, refGrams);
  const skip2Recall = skip2.length / utils.comb2(ref.length);
  const skip2Prec = skip2.length / utils.comb2(cand.length);

  return utils.fMeasure(skip2Prec, skip2Recall, opts.beta);
}

/**
 * Computes the ROUGE-L score for a candidate summary
 *
 * Configuration object schema and defaults:
 * ```
 * {
 * 	beta: 1                             // The beta value used for the f-measure
 * 	lcs: <inbuilt function>             // The least common subsequence function
 * 	segmenter: <inbuilt function>,      // The sentence segmenter
 * 	tokenizer: <inbuilt function>       // The string tokenizer
 * }
 * ```
 *
 * `lcs` has a type signature of ((Array<string>, Array<string>) => Array<string>)
 * `segmenter` has a type signature of ((string) => Array<string)
 * `tokenizer` has a type signature of ((string) => Array<string)
 *
 * @method l
 * @param  {string}     cand        The candidate summary to be evaluated
 * @param  {string}     ref         The reference summary to be evaluated against
 * @param  {Object}     opts        Configuration options (see example)
 * @return {number}                 The ROUGE-L score
 */
export function l(
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
