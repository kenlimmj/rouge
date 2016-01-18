import {
  GATE_SUBSTITUTIONS,
  TREEBANK_CONTRACTIONS,
} from './constants';

export function treeBankTokenize(input) {
  let parse = input.replace(/^\"/, '``')
                   .replace(/([ (\[{<])"/g, '$1 `` ')
                   .replace(/\.\.\./g, ' ... ')
                   .replace(/[;@#$%&]/g, ' $& ')
                   .replace(/([^\.])(\.)([\]\)}>"\']*)\s*$/g, '$1 $2$3 ')
                   .replace(/[?!]/g, ' $& ')
                   .replace(/[\]\[\(\)\{\}<>]/g, ' $& ')
                   .replace(/--/g, ' -- ');

  parse = ` ${parse} `;

  parse = parse.replace(/"/g, ' \'\' ')
               .replace(/([^'])' /g, '$1 \' ')
               .replace(/'([sSmMdD]) /g, ' \'$1 ')
               .replace(/('ll|'LL|'re|'RE|'ve|'VE|n't|N'T) /g, ' $1 ');

  let iterator = -1;
  while (iterator++ < TREEBANK_CONTRACTIONS.length) {
    parse = parse.replace(TREEBANK_CONTRACTIONS[iterator], ' $1 $2 ');
  }

  parse = parse.replace(/\ \ +/g, ' ')
               .replace(/^\ |\ $/g, '');

  return parse.split(' ');
}

export function sentenceSegment(input) {
  const abbrvReg = new RegExp('\\b(' + GATE_SUBSTITUTIONS.join('|') + ')[.!?] ?$', 'i');
  const acronymReg = new RegExp('[ |\.][A-Z]\.?$', 'i');
  const ellipseReg = new RegExp('\\.\\.\\.*$');

  let chunks = input.split(/(\S.+?[.\?!])(?=\s+|$|")/g);

  let acc = [];
  for (let idx = 0; idx < chunks.length; i++) {
    if (chunks[idx]) {
      chunks[idx] = chunks[idx].replace(/^\s+|\s+$/g, '');

      if (chunks[idx + 1] &&
          chunks[idx].match(abbrvReg) ||
          chunks[idx].match(acronymReg) ||
          chunks[idx].match(ellipseReg)) {
        chunks[idx + 1] = (chunks[idx] || '') + ' ' + (chunks[idx + 1] || '').replace(/ +/g, ' ');
      } else if (chunks[idx] && chunks[idx].length > 0) {
        acc.push(chunks[idx]);
        chunks[idx] = '';
      }
    }
  }

  return acc.length === 0 ? [input] : acc;
}

export function fact(x, acc = 1) {
  return x === 1 ? acc : fact(x - 1, x * acc);
}

export function* skipBigram(tokens, gapLength = 2) {
  if (gapLength < 1) {
    throw new RangeError('Gap length must be greater than 0');
  }

  if (tokens.length < (gapLength + 1)) {
    throw new RangeError('Gap length cannot be larger than the number of tokens available');
  }

  for (let idx = 0; idx < (tokens.length - gapLength); idx++) {
    yield [tokens[idx], token[idx + gapLength]];
  }
}

export function* nGram(tokens, n = 2) {
  if (tokens.length < n) {
    throw new RangeError('Gram size cannot be larger than the number of tokens available');
  }

  if (n === 1) {
    yield* tokens;
  } else {
    // TODO(Kenneth): Add padding options

    for (let idx = 0; idx < (tokens.length - n); idx++) {
      yield tokens.slice(idx, idx + n);
    }
  }
}

export function comb2(val) {
  if (val < 2) {
    throw new RangeError('Input must be greater than 2');
  }

  return 0.5 * val * (val - 1);
}

export function jackKnife(cands, ref, evalMethod) {
  if (cands.length < 2) {
    throw new RangeError('Candidate array must contain more than one element');
  }

  const pairs = cands.map(c => evalMethod(c, rref));
  const numPairs = pairs.length;

  let acc = 0;
  for (let idx = 0; idx < numPairs; idx++) {
    let sample = pairs.splice(idx, 1);
    acc += Math.max(...sample);
  }

  return acc / numPairs;
}

export function fMeasure(p, r, beta = 0.5) {
  return ((1 + beta * beta) * r * p) / (r + beta * beta * p);
}

export function intersection(a, b) {
  const test = new Set(a);
  const ref = new Set(b);

  return [...test].filter(elem => ref.has(elem));
}

export function lcs(a, b) {
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
