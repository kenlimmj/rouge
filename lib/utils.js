/* @flow */

import {
  GATE_SUBSTITUTIONS,
  TREEBANK_CONTRACTIONS,
} from './constants';

/**
 * Splits a sentence into an array of word tokens
 * in accordance with the Penn Treebank guidelines.
 *
 * NOTE: This method assumes that the input is a single
 * sentence only. Providing multiple sentences within a
 * single string can trigger edge cases which have not
 * been accounted for.
 *
 * Adapted from Titus Wormer's [port](https://gist.github.com/wooorm/8504606) of the Penn Treebank Tokenizer
 *
 * @method treeBankTokenize
 * @param  {string}           input [description]
 * @return {Array<string>}          [description]
 */
export function treeBankTokenize(input: string): Array<string> {
  // Does the following things in order of appearance by line:
  // 1. Replace quotes at the sentence start position with double ticks
  // 2. Wrap spaces around a double quote preceded by opening brackets
  // 3. Wrap spaces around a non-unicode ellipsis
  // 4. Wrap spaces around some punctuation signs (;@#$%&)
  // 5. Wrap spaces around a period and zero or more closing brackets
  //    (or quotes), when not preceded by a period and when followed
  //    by the end of the string. Only splits final periods because
  //    sentence tokenization is assumed as a preprocessing step
  // 6. Wrap spaces around all exclamation marks and question marks
  // 7. Wrap spaces around opening and closing brackets
  // 8. Wrap spaces around en-dashes
  let parse = input.replace(/^\"/, '``')
                   .replace(/([ (\[{<])"/g, '$1 `` ')
                   .replace(/\.\.\./g, ' ... ')
                   .replace(/[;@#$%&]/g, ' $& ')
                   .replace(/([^\.])(\.)([\]\)}>"\']*)\s*$/g, '$1 $2$3 ')
                   .replace(/[?!]/g, ' $& ')
                   .replace(/[\]\[\(\)\{\}<>]/g, ' $& ')
                   .replace(/--/g, ' -- ');

  // Wrap spaces at the start and end of the sentence for consistency
  // i.e. reduce the number of Regex matches required
  parse = ` ${parse} `;

  // Does the following things in order of appearance by line:
  // 1. Replace double quotes with a pair of single quotes wrapped with spaces
  // 2. Wrap possessive or closing single quotes
  // 3. Add a space before single quotes followed by `s`, `m`, or `d` and a space
  // 4. Add a space before occurrences of `'ll`, `'re`, `'ve` or `n't`
  parse = parse.replace(/"/g, ' \'\' ')
               .replace(/([^'])' /g, '$1 \' ')
               .replace(/'([sSmMdD]) /g, ' \'$1 ')
               .replace(/('ll|'LL|'re|'RE|'ve|'VE|n't|N'T) /g, ' $1 ');

  let iterator = -1;
  while (iterator++ < TREEBANK_CONTRACTIONS.length) {
    // Break uncommon contractions with a space and wrap-in spaces
    parse = parse.replace(TREEBANK_CONTRACTIONS[iterator], ' $1 $2 ');
  }

  // Concatenate double spaces and remove start/end spaces
  parse = parse.replace(/\ \ +/g, ' ')
               .replace(/^\ |\ $/g, '');

  // Split on spaces (original and inserted) to return the tokenized result
  return parse.split(' ');
}

/**
 * Splits a body of text into an array of sentences
 * using a rule-based segmentation approach.
 *
 * Adapted from Spencer Mountain's [nlp_compromise](https://github.com/spencermountain/nlp_compromise/) library
 *
 * @method sentenceSegment
 * @param  {String}         input [description]
 * @return {Array<String>}        [description]
 */
export function sentenceSegment(input: string): Array<string> {
  const abbrvReg = new RegExp('\\b(' + GATE_SUBSTITUTIONS.join('|') + ')[.!?] ?$', 'i');
  const acronymReg = new RegExp('[ |\.][A-Z]\.?$', 'i');
  const ellipseReg = new RegExp('\\.\\.\\.*$');

  // Split sentences naively based on common terminals (.?!")
  let chunks = input.split(/(\S.+?[.\?!])(?=\s+|$|")/g);

  let acc = [];
  for (let idx = 0; idx < chunks.length; idx++) {
    if (chunks[idx]) {
      // Trim whitespace
      chunks[idx] = chunks[idx].replace(/^\s+|\s+$/g, '');

      if (chunks[idx + 1] &&
          chunks[idx].match(abbrvReg) ||
          chunks[idx].match(acronymReg) ||
          chunks[idx].match(ellipseReg)) {
        // Merge chunks that match known contractions/abbreviations back together
        chunks[idx + 1] = (chunks[idx] || '') + ' ' + (chunks[idx + 1] || '').replace(/ +/g, ' ');
      } else if (chunks[idx] && chunks[idx].length > 0) {
        acc.push(chunks[idx]);
        chunks[idx] = '';
      }
    }
  }

  // If no matches were found, return the input treated as a single sentence
  return acc.length === 0 ? [input] : acc;
}

/**
 * Computes the factorial of a number.
 *
 * This function uses a tail-recursive call to avoid
 * blowing the stack when computing inputs with a large
 * recursion depth.
 *
 * If this function will be called repeatedly within
 * the same scope, it is highly recommended that the
 * user memoize the function (e.g. lodash.memoize).
 *
 * @method fact
 * @param  {Number} x   [description]
 * @param  {Number} acc [description]
 * @return {Number}     [description]
 */
export function fact(
  x: number,
  acc: number = 1
): number {
  return x === 1 ? acc : fact(x - 1, x * acc);
}

/**
 * Returns the skip bigrams for an array of word tokens.
 *
 * @method skipBigram
 * @param  {Array<String>}          tokens    [description]
 * @param  {Number}                 gapLength [description]
 * @return {Array<Array<String>>}             [description]
 */
export function skipBigram(
  tokens: Array<string>,
  gapLength: number = 2
): Array<string> {
  if (gapLength < 1) {
    throw new RangeError('Gap length must be greater than 0');
  }

  if (tokens.length < (gapLength + 1)) {
    throw new RangeError('Gap length cannot be larger than the number of tokens available');
  }

  let acc = [];
  for (let idx = 0; idx < (tokens.length - gapLength); idx++) {
    acc.push(`${tokens[idx]} ${tokens[idx + gapLength]}`);
  }

  return acc;
}

/**
 * Returns n-grams for an array of word tokens.
 *
 * @method nGram
 * @param  {Array<String>}          tokens [description]
 * @param  {Number}                 n      [description]
 * @param  {Object}                 pad    [description]
 * @return {Array<Array<String>>}          [description]
 */
export function nGram(
  tokens: Array<string>,
  n: number = 2,
  pad: { start: boolean, end: boolean, val: string } = { start: false, end: false, val: '<S>' }
): Array<string> {
  if (tokens.length < n) {
    throw new RangeError('Gram size cannot be larger than the number of tokens available');
  }

  if (pad.start) {
    for (let i = 0; i < n - 1; i++) tokens.unshift(pad.val);
  }

  if (pad.end) {
    for (let i = 0; i < n - 1; i++) tokens.push(pad.val);
  }

  let acc = [];
  for (let idx = 0; idx < (tokens.length - n); idx++) {
    acc.push(tokens.slice(idx, idx + n).join(' '));
  }

  return acc;
}

/**
 * Calculates C(val, 2), i.e. the number of ways 2
 * items can be chosen from `val` items.
 *
 * @method comb2
 * @param  {Number} val [description]
 * @return {Number}     [description]
 */
export function comb2(val: number): number {
  if (val < 2) throw new RangeError('Input must be greater than 2');
  return 0.5 * val * (val - 1);
}

/**
 * Computes the arithmetic mean of an array
 * @method arithmeticMean
 * @param  {Array<number}   input [description]
 * @return {number}               [description]
 */
export function arithmeticMean(input: Array<number>): number {
  return input.reduce((x, y) => x + y) / input.length;
}

/**
 * Evaluates the jackknife resampling result for a set of
 * candidate summaries vs. a reference summary.
 *
 * @method jackKnife
 * @param  {Array<any>}  cands      [description]
 * @param  {String}         ref        [description]
 * @param  {Function}       func       [description]
 * @param  {Function}       test       [description]
 * @return {Number}                    [description]
 */
export function jackKnife(
  cands: Array<string>,
  ref: string,
  func: ((x: string, y: string) => number),
  test: ((x: Array<number>) => number) = arithmeticMean
): number {
  if (cands.length < 2) {
    throw new RangeError('Candidate array must contain more than one element');
  }

  const pairs = cands.map(c => func(c, ref));

  let acc = [];
  for (let idx = 0; idx < pairs.length; idx++) {
    let sample = pairs.splice(idx, 1);
    acc.push(Math.max(...sample));
  }

  return test(acc);
}

/**
 * Calculates the ROUGE f-measure for a given precision
 * and recall score.
 *
 * The default value of beta is 0.5, which is equivalent
 * to the mean-averaged f-score. However, DUC evaluation
 * methods favor precision by setting beta to an arbitary
 * large number. To replicate this, set beta to any value
 * larger than 1.
 *
 * @method fMeasure
 * @param  {Number} p    [description]
 * @param  {Number} r    [description]
 * @param  {Number} beta [description]
 * @return {Number}      [description]
 */
export function fMeasure(
  p: number,
  r: number,
  beta: number = 0.5
): number {
  if (beta < 0) {
    throw new RangeError('beta value must be greater than 0');
  } else if (0 <= beta && beta <= 1) {
    return ((1 + beta * beta) * r * p) / (r + beta * beta * p);
  } else {
    return r;
  }
}

/**
 * Computes the set intersection of two arrays
 *
 * @method intersection
 * @param  {Array<T>}     a [description]
 * @param  {Array<T>}     b [description]
 * @return {Array<T>}          [description]
 */
export function intersection(a: Array<string>, b: Array<string>): Array<string> {
  const test = new Set(a);
  const ref = new Set(b);

  return Array.from(test).filter(elem => ref.has(elem));
}

/**
 * Computes the longest common subsequence for two arrays.
 * This function returns the elements from the two arrays
 * that form the LCS, in order of their appearance.
 *
 * For speed, the search-space is prunned by eliminating
 * common entities at the start and end of both input arrays.
 *
 * @method lcs
 * @param  {Array<T>} a [description]
 * @param  {Array<T>} b [description]
 * @return {Array<T>}   [description]
 */
export function lcs(a: Array<string>, b: Array<string>): Array<string> {
  let start = [];
  let end = [];

  let startIdx = 0;
  let aEndIdx = a.length - 1;
  let bEndIdx = b.length - 1;

  while (a[startIdx] === b[startIdx]) {
    start.push(a[startIdx]);
    startIdx++;
  }

  while (a[aEndIdx] === b[bEndIdx]) {
    end.push(a[aEndIdx]);
    aEndIdx--;
    bEndIdx--;
  }

  let trimmedA = a.slice(startIdx, aEndIdx + 1);
  let trimmedB = b.slice(startIdx, bEndIdx + 1);

  for (let bIdx = 0; bIdx < trimmedB.length; bIdx++) {
    for (let aIdx = 0; aIdx < trimmedA.length; aIdx++) {
      if (trimmedB[bIdx] === trimmedA[aIdx]) start.push(trimmedA[aIdx]);
    }
  }

  return start.concat(end);
}
