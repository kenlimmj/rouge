/**
* 
* @license
* @Author: Lim Mingjie, Kenneth
* @Date:   2016-01-20T18:56:22-05:00
* @Email:  me@kenlimmj.com
* @Last modified by:   Astrianna
* @Last modified time: 2016-02-27T19:55:12-05:00
*/

import { GATE_SUBSTITUTIONS, GATE_EXCEPTIONS, TREEBANK_CONTRACTIONS } from './constants';

export function treeBankTokenize(input) {
  if (input.length === 0) return [];

  let parse = input.replace(/^\"/, ' `` ').replace(/([ (\[{<])"/g, '$1 `` ').replace(/\.\.\.*/g, ' ... ').replace(/[;@#$%&]/g, ' $& ').replace(/([^\.])(\.)([\]\)}>"\']*)\s*$/g, '$1 $2$3 ').replace(/[,?!]/g, ' $& ').replace(/[\]\[\(\)\{\}<>]/g, ' $& ').replace(/---*/g, ' -- ');

  parse = ` ${ parse } `;

  parse = parse.replace(/"/g, ' \'\' ').replace(/([^'])' /g, '$1 \' ').replace(/'([sSmMdD]) /g, ' \'$1 ').replace(/('ll|'LL|'re|'RE|'ve|'VE|n't|N'T) /g, ' $1 ');

  let iterator = -1;
  while (iterator++ < TREEBANK_CONTRACTIONS.length) {
    parse = parse.replace(TREEBANK_CONTRACTIONS[iterator], ' $1 $2 ');
  }

  parse = parse.replace(/\ \ +/g, ' ').replace(/^\ |\ $/g, '');

  return parse.split(' ');
}

export function sentenceSegment(input) {
  if (input.length === 0) return [];

  const abbrvReg = new RegExp('\\b(' + GATE_SUBSTITUTIONS.join('|') + ')[.!?] ?$', 'i');
  const acronymReg = new RegExp(/[ |.][A-Z].?$/, 'i');
  const breakReg = new RegExp(/[\r\n]+/, 'g');
  const ellipseReg = new RegExp(/\.\.\.*$/);
  const excepReg = new RegExp('\\b(' + GATE_EXCEPTIONS.join('|') + ')[.!?] ?$', 'i');

  let chunks = input.split(/(\S.+?[.?!])(?=\s+|$|")/g);
  console.log(chunks);
  let acc = [];
  for (let idx = 0; idx < chunks.length; idx++) {
    if (chunks[idx]) {
      chunks[idx] = chunks[idx].replace(/(^ +| +$)/g, '');

      if (breakReg.test(chunks[idx])) {
        if (chunks[idx + 1] && strIsTitleCase(chunks[idx])) {
          chunks[idx + 1] = (chunks[idx].trim() || '') + ' ' + (chunks[idx + 1] || '').replace(/ +/g, ' ');
        } else {
          acc.push(...chunks[idx].trim().split('\n'));
        }
      } else if (chunks[idx + 1] && abbrvReg.test(chunks[idx])) {
        const nextChunk = chunks[idx + 1];
        if (nextChunk.trim() && strIsTitleCase(nextChunk) && !excepReg.test(chunks[idx])) {
          acc.push(chunks[idx]);
          chunks[idx] = '';
        } else {
          chunks[idx + 1] = (chunks[idx] || '') + ' ' + (nextChunk || '').replace(/ +/g, ' ');
        }
      } else if (chunks[idx].length > 1 && chunks[idx + 1] && acronymReg.test(chunks[idx])) {
        const words = chunks[idx].split(' ');
        const lastWord = words[words.length - 1];

        if (lastWord === lastWord.toLowerCase()) {
          chunks[idx + 1] = chunks[idx + 1] = (chunks[idx] || '') + ' ' + (chunks[idx + 1] || '').replace(/ +/g, ' ');
        } else if (chunks[idx + 2]) {
          if (strIsTitleCase(words[words.length - 2]) && strIsTitleCase(chunks[idx + 2])) {
            chunks[idx + 2] = (chunks[idx] || '') + (chunks[idx + 1] || '').replace(/ +/g, ' ') + (chunks[idx + 2] || '');
          } else {
            acc.push(chunks[idx]);
            chunks[idx] = '';
          }
        }
      } else if (chunks[idx + 1] && ellipseReg.test(chunks[idx])) {
        chunks[idx + 1] = (chunks[idx] || '') + (chunks[idx + 1] || '').replace(/ +/g, ' ');
      } else if (chunks[idx] && chunks[idx].length > 0) {
        acc.push(chunks[idx]);
        chunks[idx] = '';
      }
    }
  }

  return acc.length === 0 ? [input] : acc;
}

export function strIsTitleCase(input) {
  const firstChar = input.trim().slice(0, 1);
  return charIsUpperCase(firstChar);
}

export function charIsUpperCase(input) {
  if (input.length !== 1) throw new RangeError('Input should be a single character');

  const char = input.charCodeAt(0);
  return char >= 65 && char <= 90;
}

function memoize(func, Store = Map) {
  return (() => {
    let cache = new Store();

    return n => {
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

function factRec(x, acc = 1) {
  if (x < 0) throw RangeError('Input must be a positive number');
  return x < 2 ? acc : factRec(x - 1, x * acc);
}

export const fact = memoize(factRec);

export function skipBigram(tokens) {
  if (tokens.length < 2) throw new RangeError('Input must have at least two words');

  let acc = [];
  for (let baseIdx = 0; baseIdx < tokens.length - 1; baseIdx++) {
    for (let sweepIdx = baseIdx + 1; sweepIdx < tokens.length; sweepIdx++) {
      acc.push(`${ tokens[baseIdx] } ${ tokens[sweepIdx] }`);
    }
  }

  return acc;
}

export const NGRAM_DEFAULT_OPTS = { start: false, end: false, val: '<S>' };

export function nGram(tokens, n = 2, pad = {}) {
  if (n < 1) throw new RangeError('ngram size cannot be smaller than 1');

  if (tokens.length < n) {
    throw new RangeError('ngram size cannot be larger than the number of tokens available');
  }

  if (pad !== {}) {
    const config = Object.assign({}, NGRAM_DEFAULT_OPTS, pad);

    let tempTokens = tokens.slice(0);

    if (config.start) for (let i = 0; i < n - 1; i++) tempTokens.unshift(config.val);
    if (config.end) for (let i = 0; i < n - 1; i++) tempTokens.push(config.val);

    tokens = tempTokens;
  }

  let acc = [];
  for (let idx = 0; idx < tokens.length - n + 1; idx++) {
    acc.push(tokens.slice(idx, idx + n).join(' '));
  }

  return acc;
}

export function comb2(val) {
  if (val < 2) throw new RangeError('Input must be greater than 2');
  return 0.5 * val * (val - 1);
}

export function arithmeticMean(input) {
  if (input.length < 1) throw new RangeError('Input array must have at least 1 element');
  return input.reduce((x, y) => x + y) / input.length;
}

export function jackKnife(cands, ref, func, test = arithmeticMean) {
  if (cands.length < 2) {
    throw new RangeError('Candidate array must contain more than one element');
  }

  const pairs = cands.map(c => func(c, ref));

  let acc = [];
  for (let idx = 0; idx < pairs.length; idx++) {
    let leaveOneOut = pairs.slice(0);
    leaveOneOut.splice(idx, 1);

    acc.push(Math.max(...leaveOneOut));
  }

  return test(acc);
}

export function fMeasure(p, r, beta = 0.5) {
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

export function intersection(a, b) {
  const test = new Set(a);
  const ref = new Set(b);

  return Array.from(test).filter(elem => ref.has(elem));
}

export function lcs(a, b) {
  if (a.length === 0 || b.length === 0) return [];

  let start = [];
  let end = [];

  let startIdx = 0;
  let aEndIdx = a.length - 1;
  let bEndIdx = b.length - 1;

  while (a[startIdx] && b[startIdx] && a[startIdx] === b[startIdx]) {
    start.push(a[startIdx]);
    startIdx++;
  }

  while (a[aEndIdx] && b[bEndIdx] && a[aEndIdx] === b[bEndIdx]) {
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
//# sourceMappingURL=utils.js.map
