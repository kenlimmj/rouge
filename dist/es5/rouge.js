'use strict';

var babelHelpers = {};

babelHelpers.toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

babelHelpers;

/**
* @Author: Lim Mingjie, Kenneth
* @Date:   2016-01-20T19:03:19-05:00
* @Email:  me@kenlimmj.com
* @Last modified by:   Lim Mingjie, Kenneth
* @Last modified time: 2016-01-26T23:22:24-05:00
*/

var TREEBANK_CONTRACTIONS = [/\b(can)(not)\b/i, /\b(d)('ye)\b/i, /\b(gim)(me)\b/i, /\b(gon)(na)\b/i, /\b(got)(ta)\b/i, /\b(lem)(me)\b/i, /\b(more)('n)\b/i, /\b(wan)(na) /i, /\ ('t)(is)\b/i, /\ ('t)(was)\b/i];

var HONORIFICS = ['jr', 'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'sen', 'corp', 'rep', 'gov', 'atty', 'supt', 'det', 'rev', 'col', 'gen', 'lt', 'cmdr', 'adm', 'capt', 'sgt', 'cpl', 'maj', 'miss', 'misses', 'mister', 'sir', 'esq', 'mstr', 'phd', 'adj', 'adv', 'asst', 'bldg', 'brig', 'comdr', 'hon', 'messrs', 'mlle', 'mme', 'op', 'ord', 'pvt', 'reps', 'res', 'sens', 'sfc', 'surg'];

var ABBR_COMMON = ['arc', 'al', 'exp', 'rd', 'st', 'dist', 'mt', 'fy', 'pd', 'pl', 'plz', 'tce', 'llb', 'md', 'bl', 'ma', 'ba', 'lit', 'ex', 'e.g', 'i.e', 'circa', 'ca', 'cca', 'v.s', 'etc', 'esp', 'ft', 'b.c', 'a.d'];

var ABBR_ORGANIZATIONS = ['co', 'corp', 'yahoo', 'joomla', 'jeopardy', 'dept', 'univ', 'assn', 'bros', 'inc', 'ltd'];

var ABBR_PLACES = ['ala', 'ariz', 'ark', 'cal', 'calif', 'col', 'colo', 'conn', 'del', 'fed', 'fla', 'fl', 'ga', 'ida', 'ind', 'ia', 'la', 'kan', 'kans', 'ken', 'ky', 'la', 'md', 'mich', 'minn', 'mont', 'neb', 'nebr', 'nev', 'okla', 'penna', 'penn', 'pa', 'dak', 'tenn', 'tex', 'ut', 'vt', 'va', 'wash', 'wis', 'wisc', 'wy', 'wyo', 'usafa', 'alta', 'ont', 'que', 'sask', 'yuk', 'ave', 'blvd', 'cl', 'ct', 'cres', 'hwy', 'U.S', 'U.S.A', 'E.U', 'N°'];

var ABBR_TIME = ['a.m', 'p.m'];

var ABBR_DATES = ['jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'sept', 'sep'];

var GATE_EXCEPTIONS = ['ex', 'e.g', 'i.e', 'circa', 'ca', 'cca', 'v.s', 'esp', 'ft', 'st', 'mt'].concat(HONORIFICS);

var GATE_SUBSTITUTIONS = [].concat(ABBR_COMMON, ABBR_DATES, ABBR_ORGANIZATIONS, ABBR_PLACES, ABBR_TIME, HONORIFICS);

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
function treeBankTokenize(input) {
  if (input.length === 0) return [];

  // Does the following things in order of appearance by line:
  // 1. Replace quotes at the sentence start position with double ticks
  // 2. Wrap spaces around a double quote preceded by opening brackets
  // 3. Wrap spaces around a non-unicode ellipsis
  // 4. Wrap spaces around some punctuation signs (,;@#$%&)
  // 5. Wrap spaces around a period and zero or more closing brackets
  //    (or quotes), when not preceded by a period and when followed
  //    by the end of the string. Only splits final periods because
  //    sentence tokenization is assumed as a preprocessing step
  // 6. Wrap spaces around all exclamation marks and question marks
  // 7. Wrap spaces around opening and closing brackets
  // 8. Wrap spaces around en and em-dashes
  var parse = input.replace(/^\"/, ' `` ').replace(/([ (\[{<])"/g, '$1 `` ').replace(/\.\.\.*/g, ' ... ').replace(/[;@#$%&]/g, ' $& ').replace(/([^\.])(\.)([\]\)}>"\']*)\s*$/g, '$1 $2$3 ').replace(/[,?!]/g, ' $& ').replace(/[\]\[\(\)\{\}<>]/g, ' $& ').replace(/---*/g, ' -- ');

  // Wrap spaces at the start and end of the sentence for consistency
  // i.e. reduce the number of Regex matches required
  parse = ' ' + parse + ' ';

  // Does the following things in order of appearance by line:
  // 1. Replace double quotes with a pair of single quotes wrapped with spaces
  // 2. Wrap possessive or closing single quotes
  // 3. Add a space before single quotes followed by `s`, `m`, or `d` and a space
  // 4. Add a space before occurrences of `'ll`, `'re`, `'ve` or `n't`
  parse = parse.replace(/"/g, ' \'\' ').replace(/([^'])' /g, '$1 \' ').replace(/'([sSmMdD]) /g, ' \'$1 ').replace(/('ll|'LL|'re|'RE|'ve|'VE|n't|N'T) /g, ' $1 ');

  var iterator = -1;
  while (iterator++ < TREEBANK_CONTRACTIONS.length) {
    // Break uncommon contractions with a space and wrap-in spaces
    parse = parse.replace(TREEBANK_CONTRACTIONS[iterator], ' $1 $2 ');
  }

  // Concatenate double spaces and remove start/end spaces
  parse = parse.replace(/\ \ +/g, ' ').replace(/^\ |\ $/g, '');

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
function sentenceSegment(input) {
  if (input.length === 0) return [];

  var abbrvReg = new RegExp('\\b(' + GATE_SUBSTITUTIONS.join('|') + ')[.!?] ?$', 'i');
  var acronymReg = new RegExp(/[ |.][A-Z].?$/, 'i');
  var breakReg = new RegExp(/[\r\n]+/, 'g');
  var ellipseReg = new RegExp(/\.\.\.*$/);
  var excepReg = new RegExp('\\b(' + GATE_EXCEPTIONS.join('|') + ')[.!?] ?$', 'i');

  // Split sentences naively based on common terminals (.?!")
  var chunks = input.split(/(\S.+?[.?!])(?=\s+|$|")/g);
  console.log(chunks);
  var acc = [];
  for (var idx = 0; idx < chunks.length; idx++) {
    if (chunks[idx]) {
      // Trim only whitespace (i.e. preserve line breaks/carriage feeds)
      chunks[idx] = chunks[idx].replace(/(^ +| +$)/g, '');

      if (breakReg.test(chunks[idx])) {
        if (chunks[idx + 1] && strIsTitleCase(chunks[idx])) {
          // Catch line breaks embedded within valid sentences
          // i.e. sentences that start with a capital letter
          // and merge them with a delimiting space
          chunks[idx + 1] = (chunks[idx].trim() || '') + ' ' + (chunks[idx + 1] || '').replace(/ +/g, ' ');
        } else {
          // Assume that all other embedded line breaks are
          // valid sentence breakpoints
          acc.push.apply(acc, babelHelpers.toConsumableArray(chunks[idx].trim().split('\n')));
        }
      } else if (chunks[idx + 1] && abbrvReg.test(chunks[idx])) {
        var nextChunk = chunks[idx + 1];
        if (nextChunk.trim() && strIsTitleCase(nextChunk) && !excepReg.test(chunks[idx])) {
          // Catch abbreviations followed by a capital letter and treat as a boundary.
          // FIXME: This causes named entities like `Mt. Fuji` or `U.S. Government` to fail.
          acc.push(chunks[idx]);
          chunks[idx] = '';
        } else {
          // Catch common abbreviations and merge them with a delimiting space
          chunks[idx + 1] = (chunks[idx] || '') + ' ' + (nextChunk || '').replace(/ +/g, ' ');
        }
      } else if (chunks[idx].length > 1 && chunks[idx + 1] && acronymReg.test(chunks[idx])) {
        var words = chunks[idx].split(' ');
        var lastWord = words[words.length - 1];

        if (lastWord === lastWord.toLowerCase()) {
          // Catch small-letter abbreviations and merge them.
          chunks[idx + 1] = chunks[idx + 1] = (chunks[idx] || '') + ' ' + (chunks[idx + 1] || '').replace(/ +/g, ' ');
        } else if (chunks[idx + 2]) {
          if (strIsTitleCase(words[words.length - 2]) && strIsTitleCase(chunks[idx + 2])) {
            // Catch name abbreviations (e.g. Albert I. Jones) by checking if
            // the previous and next words are all capitalized.
            chunks[idx + 2] = (chunks[idx] || '') + (chunks[idx + 1] || '').replace(/ +/g, ' ') + (chunks[idx + 2] || '');
          } else {
            // Assume that remaining entities are indeed end-of-sentence markers.
            acc.push(chunks[idx]);
            chunks[idx] = '';
          }
        }
      } else if (chunks[idx + 1] && ellipseReg.test(chunks[idx])) {
        // Catch mid-sentence ellipses (and their derivatives) and merge them
        chunks[idx + 1] = (chunks[idx] || '') + (chunks[idx + 1] || '').replace(/ +/g, ' ');
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
 * Checks if a string is titlecase
 * @method strIsTitleCase
 * @param  {string}   input       The string to be checked
 * @return {boolean}              True if the string is titlecase and false otherwise
 */
function strIsTitleCase(input) {
  var firstChar = input.trim().slice(0, 1);
  return charIsUpperCase(firstChar);
}

/**
 * Checks if a character is uppercase
 * @method charIsUpperCase
 * @param  {string}   input     The character to be tested
 * @return {boolean}            True if the character is uppercase and false otherwise.
 */
function charIsUpperCase(input) {
  if (input.length !== 1) throw new RangeError('Input should be a single character');

  var char = input.charCodeAt(0);
  return char >= 65 && char <= 90;
}

/**
 * Memoizes a function using a Map
 *
 * @method memoize
 * @param  {Function} func    The function to be memoized
 * @param  {Function} Store   The data store constructor. Defaults to the ES6-inbuilt Map function.
 *                            A store should implement `has`, `get`, and `set` methods.
 * @return {Function}         A closure of the memoization cache and the original function
 */
function memoize(func) {
  var Store = arguments.length <= 1 || arguments[1] === undefined ? Map : arguments[1];

  return function () {
    var cache = new Store();

    return function (n) {
      if (cache.has(n)) {
        return cache.get(n);
      } else {
        var result = func(n);
        cache.set(n, result);
        return result;
      }
    };
  }();
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
function factRec(x) {
  var acc = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

  if (x < 0) throw RangeError('Input must be a positive number');
  return x < 2 ? acc : factRec(x - 1, x * acc);
}

var fact = memoize(factRec);

/**
 * Returns the skip bigrams for an array of word tokens.
 *
 * @method skipBigram
 * @param  {Array<string>}    tokens      An array of word tokens
 * @return {Array<string>}                An array of skip bigram strings
 */
function skipBigram(tokens) {
  if (tokens.length < 2) throw new RangeError('Input must have at least two words');

  var acc = [];
  for (var baseIdx = 0; baseIdx < tokens.length - 1; baseIdx++) {
    for (var sweepIdx = baseIdx + 1; sweepIdx < tokens.length; sweepIdx++) {
      acc.push(tokens[baseIdx] + ' ' + tokens[sweepIdx]);
    }
  }

  return acc;
}

var NGRAM_DEFAULT_OPTS = { start: false, end: false, val: '<S>' };

/**
 * Returns n-grams for an array of word tokens.
 *
 * @method nGram
 * @param  {Array<string>}          tokens    An array of word tokens
 * @param  {number}                 n         The size of the n-gram. Defaults to 2.
 * @param  {Object}                 pad       String padding options. See example.
 * @return {Array<string>}                    An array of n-gram strings
 */
function nGram(tokens) {
  var n = arguments.length <= 1 || arguments[1] === undefined ? 2 : arguments[1];
  var pad = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  if (n < 1) throw new RangeError('ngram size cannot be smaller than 1');

  if (tokens.length < n) {
    throw new RangeError('ngram size cannot be larger than the number of tokens available');
  }

  if (pad !== {}) {
    var config = Object.assign({}, NGRAM_DEFAULT_OPTS, pad);

    // Clone the input token array to avoid mutating the source data
    var tempTokens = tokens.slice(0);

    if (config.start) for (var i = 0; i < n - 1; i++) {
      tempTokens.unshift(config.val);
    }if (config.end) for (var i = 0; i < n - 1; i++) {
      tempTokens.push(config.val);
    }tokens = tempTokens;
  }

  var acc = [];
  for (var idx = 0; idx < tokens.length - n + 1; idx++) {
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
function comb2(val) {
  if (val < 2) throw new RangeError('Input must be greater than 2');
  return 0.5 * val * (val - 1);
}

/**
 * Computes the arithmetic mean of an array
 * @method arithmeticMean
 * @param  {Array<number>}   input    Data distribution
 * @return {number}                   The mean of the distribution
 */
function arithmeticMean(input) {
  if (input.length < 1) throw new RangeError('Input array must have at least 1 element');
  return input.reduce(function (x, y) {
    return x + y;
  }) / input.length;
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
function jackKnife(cands, ref, func) {
  var test = arguments.length <= 3 || arguments[3] === undefined ? arithmeticMean : arguments[3];

  if (cands.length < 2) {
    throw new RangeError('Candidate array must contain more than one element');
  }

  var pairs = cands.map(function (c) {
    return func(c, ref);
  });

  var acc = [];
  for (var idx = 0; idx < pairs.length; idx++) {
    var _Math;

    // Clone the array and remove one element
    var leaveOneOut = pairs.slice(0);
    leaveOneOut.splice(idx, 1);

    acc.push((_Math = Math).max.apply(_Math, babelHelpers.toConsumableArray(leaveOneOut)));
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
function fMeasure(p, r) {
  var beta = arguments.length <= 2 || arguments[2] === undefined ? 0.5 : arguments[2];

  if (p < 0 || p > 1) throw new RangeError('Precision value p must have bounds 0 ≤ p ≤ 1');
  if (r < 0 || r > 1) throw new RangeError('Recall value r must have bounds 0 ≤ r ≤ 1');

  if (beta < 0) {
    throw new RangeError('beta value must be greater than 0');
  } else if (0 <= beta && beta <= 1) {
    return (1 + beta * beta) * r * p / (r + beta * beta * p);
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
function intersection(a, b) {
  var test = new Set(a);
  var ref = new Set(b);

  return Array.from(test).filter(function (elem) {
    return ref.has(elem);
  });
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
function lcs(a, b) {
  if (a.length === 0 || b.length === 0) return [];

  var start = [];
  var end = [];

  var startIdx = 0;
  var aEndIdx = a.length - 1;
  var bEndIdx = b.length - 1;

  while (a[startIdx] && b[startIdx] && a[startIdx] === b[startIdx]) {
    start.push(a[startIdx]);
    startIdx++;
  }

  while (a[aEndIdx] && b[bEndIdx] && a[aEndIdx] === b[bEndIdx]) {
    end.push(a[aEndIdx]);
    aEndIdx--;
    bEndIdx--;
  }

  var trimmedA = a.slice(startIdx, aEndIdx + 1);
  var trimmedB = b.slice(startIdx, bEndIdx + 1);

  for (var bIdx = 0; bIdx < trimmedB.length; bIdx++) {
    for (var aIdx = 0; aIdx < trimmedA.length; aIdx++) {
      if (trimmedB[bIdx] === trimmedA[aIdx]) start.push(trimmedA[aIdx]);
    }
  }

  return start.concat(end);
}

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
function n(cand, ref, opts) {
  if (cand.length === 0) throw new RangeError('Candidate cannot be an empty string');
  if (ref.length === 0) throw new RangeError('Reference cannot be an empty string');

  // Merge user-provided configuration with defaults
  opts = Object.assign({
    n: 1,
    nGram: nGram,
    tokenizer: treeBankTokenize
  }, opts);

  var candGrams = opts.nGram(opts.tokenizer(cand), opts.n);
  var refGrams = opts.nGram(opts.tokenizer(ref), opts.n);

  var match = intersection(candGrams, refGrams);
  return match.length / refGrams.length;
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
function s(cand, ref, opts) {
  if (cand.length === 0) throw new RangeError('Candidate cannot be an empty string');
  if (ref.length === 0) throw new RangeError('Reference cannot be an empty string');

  // Merge user-provided configuration with defaults
  opts = Object.assign({
    beta: 0.5,
    skipBigram: skipBigram,
    tokenizer: treeBankTokenize
  }, opts);

  var candGrams = opts.skipBigram(opts.tokenizer(cand));
  var refGrams = opts.skipBigram(opts.tokenizer(ref));

  var skip2 = intersection(candGrams, refGrams).length;

  if (skip2 === 0) {
    return 0;
  } else {
    var skip2Recall = skip2 / refGrams.length;
    var skip2Prec = skip2 / candGrams.length;

    return fMeasure(skip2Prec, skip2Recall, opts.beta);
  }
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
function l(cand, ref, opts) {
  if (cand.length === 0) throw new RangeError('Candidate cannot be an empty string');
  if (ref.length === 0) throw new RangeError('Reference cannot be an empty string');

  // Merge user-provided configuration with defaults
  opts = Object.assign({
    beta: 0.5,
    lcs: lcs,
    segmenter: sentenceSegment,
    tokenizer: treeBankTokenize
  }, opts);

  var candSents = opts.segmenter(cand);
  var refSents = opts.segmenter(ref);

  var candWords = opts.tokenizer(cand);
  var refWords = opts.tokenizer(ref);

  var lcsAcc = refSents.map(function (r) {
    var rTokens = opts.tokenizer(r);
    var lcsUnion = new (Function.prototype.bind.apply(Set, [null].concat(babelHelpers.toConsumableArray(candSents.map(function (c) {
      return opts.lcs(opts.tokenizer(c), rTokens);
    })))))();

    return lcsUnion.size;
  });

  // Sum the array as quickly as we can
  var lcsSum = 0;
  while (lcsAcc.length) {
    lcsSum += lcsAcc.pop();
  }var lcsRecall = lcsSum / candWords.length;
  var lcsPrec = lcsSum / refWords.length;

  return fMeasure(lcsPrec, lcsRecall, opts.beta);
}

exports.n = n;
exports.s = s;
exports.l = l;
exports.treeBankTokenize = treeBankTokenize;
exports.sentenceSegment = sentenceSegment;
exports.strIsTitleCase = strIsTitleCase;
exports.charIsUpperCase = charIsUpperCase;
exports.fact = fact;
exports.skipBigram = skipBigram;
exports.NGRAM_DEFAULT_OPTS = NGRAM_DEFAULT_OPTS;
exports.nGram = nGram;
exports.comb2 = comb2;
exports.arithmeticMean = arithmeticMean;
exports.jackKnife = jackKnife;
exports.fMeasure = fMeasure;
exports.intersection = intersection;
exports.lcs = lcs;
//# sourceMappingURL=rouge.js.map
