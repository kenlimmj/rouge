export function fact(x, acc) {
  return x === 1 ? acc : fact(x - 1, x * acc);
}

export function* skipBigram(tokens, gapLength = 2) {
  for (let idx = 0; idx < (tokens.length - gapLength); idx++) {
    yield [tokens[idx], token[idx + gapLength]];
  }
}

export function* ngram(tokens, n = 2) {
  for (let idx = 0; idx < (tokens.length - n); idx++) {
    yield tokens.slice(idx, idx + n);
  }
}

export function jackKnife(candidate, references, evalMethod) {
  const pairs = references.map(r => evalMethod(candidate, r));
  const numPairs = pairs.length;

  let acc = 0;
  for (let idx = 0; idx < numPairs; idx++) {
    let sample = pairs.splice(idx, 1);
    acc += Math.max(...sample);
  }

  return acc / numPairs;
}

export function fMeasure(r, p, beta) {
  return ((1 + beta * beta) * r * p) / (r + beta * beta * p);
}
