/**
* @flow
* @license
* @Author: Lim Mingjie, Kenneth
* @Date:   2016-01-20T18:56:22-05:00
* @Email:  me@kenlimmj.com
* @Last modified by:   Lim Mingjie, Kenneth
* @Last modified time: 2016-01-23T16:15:32-05:00
*/

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
 * Adapted from Titus Wormer's port of the Penn Treebank Tokenizer
 * found at https://gist.github.com/wooorm/8504606
 *
 *
 * @method treeBankTokenize
 * @param  {string}           input     The sentence to be tokenized
 * @return {Array<string>}              An array of word tokens
 */
export function treeBankTokenize(input: string): Array<string> {
  if (input.length === 0) return [];

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
 * Adapted from Spencer Mountain's nlp_compromise library
 * found at https://github.com/spencermountain/nlp_compromise/
 *
 * @method sentenceSegment
 * @param  {string}         input     The document to be segmented
 * @return {Array<string>}            An array of sentences
 */
export function sentenceSegment(input: string): Array<string> {
  if (input.length === 0) return [];

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
 * Memoizes a function using a Map
 *
 * @method memoize
 * @param  {Function} func    The function to be memoized
 * @param  {Function} Store   The data store constructor. Defaults to the ES6-inbuilt Map function.
 *                            A store should implement `has`, `get`, and `set` methods.
 * @return {Function}         A closure of the memoization cache
 *                            and the original function
 */
function memoize(func: Function, Store: Function = Map): Function {
  return (() => {
    let cache = new Store();

    return (n) => {
      if (cache.has(n)) {
        return cache.get(n);
      } else {
        let result = func(n);
        cache.set(n, result);
        return result;
      }
    };
  })();
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
 * @method factRec
 * @param  {number} x     The number for which the factorial is to be computed
 * @param  {number} acc   The starting value for the computation. Defaults to 1.
 * @return {number}       The factorial result
 */
function factRec(
  x: number,
  acc: number = 1
): number {
  if (x < 0) throw RangeError('Input must be a positive number');
  return x < 2 ? acc : factRec(x - 1, x * acc);
}

export const fact = memoize(factRec);

/**
 * Returns the skip bigrams for an array of word tokens.
 *
 * @method skipBigram
 * @param  {Array<string>}    tokens      An array of word tokens
 * @param  {number}           gapLength   The number of tokens to 'skip' over. Defaults to 2.
 * @return {Array<string>}                An array of skip bigram strings
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
 * @param  {Array<string>}          tokens    An array of word tokens
 * @param  {number}                 n         The size of the n-gram. Defaults to 2.
 * @param  {Object}                 pad       String padding options. See example.
 * @return {Array<string>}                    An array of n-gram strings
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
 * @param  {number} val     The total number of items to choose from
 * @return {number}         The number of ways in which 2 items can be chosen from `val`
 */
export function comb2(val: number): number {
  if (val < 2) throw new RangeError('Input must be greater than 2');
  return 0.5 * val * (val - 1);
}

/**
 * Computes the arithmetic mean of an array
 * @method arithmeticMean
 * @param  {Array<number>}   input    Data distribution
 * @return {number}                   The mean of the distribution
 */
export function arithmeticMean(input: Array<number>): number {
  if (input.length < 1) throw new RangeError('Input array must have at least 1 element');
  return input.reduce((x, y) => x + y) / input.length;
}

/**
 * Evaluates the jackknife resampling result for a set of
 * candidate summaries vs. a reference summary.
 *
 * @method jackKnife
 * @param  {Array<string>}  cands      An array of candidate summaries to be evaluated
 * @param  {string}         ref        The reference summary to be evealuated against
 * @param  {Function}       func       The function used to evaluate a candidate against a reference.
 *                                     Should be of the type signature (string, string) => number
 * @param  {Function}       test       The function used to compute the test statistic.
 *                                     Defaults to the arithmetic mean.
 *                                     Should be of the type signature (Array<number>) => number
 * @return {number}                    The result computed by applying `test` to the resampled data
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
 * DUC evaluation favors precision by setting beta to an
 * arbitary large number. To replicate this, set beta to
 * any value larger than 1.
 *
 * @method fMeasure
 * @param  {number}     p       Precision score
 * @param  {number}     r       Recall score
 * @param  {number}     beta    Weighing value (precision vs. recall).
 *                              Defaults to 0.5, i.e. mean f-score
 * @return {number}             Computed f-score
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
 * @param  {Array<string>}    a     The first array
 * @param  {Array<string>}    b     The second array
 * @return {Array<string>}          Elements common to both the first and second array
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
 * @param  {Array<string>}    a     The first array
 * @param  {Array<string>}    b     The second array
 * @return {Array<string>}          The longest common subsequence between the first and second array
 */
export function lcs(a: Array<string>, b: Array<string>): Array<string> {
  if (a.length === 0 || b.length === 0) return [];

  let start = [];
  let end = [];

  let startIdx = 0;
  let aEndIdx = a.length - 1;
  let bEndIdx = b.length - 1;

  while (a[startIdx] && b[startIdx] && (a[startIdx] === b[startIdx])) {
    start.push(a[startIdx]);
    startIdx++;
  }

  while (a[aEndIdx] && b[bEndIdx] && (a[aEndIdx] === b[bEndIdx])) {
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
