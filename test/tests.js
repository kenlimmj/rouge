/**
* @license
* @Author: Lim Mingjie, Kenneth
* @Date:   2016-01-21T12:04:28-05:00
* @Email:  me@kenlimmj.com
* @Last modified by:   Astrianna
* @Last modified time: 2016-02-27T21:28:52-05:00
*/

'use strict';

const assert = require('chai').assert;
const rouge = require('../dist/es5/rouge');

const deepEqual = assert.deepEqual;
const equal = assert.strictEqual;
const lengthOf = assert.lengthOf;
const sameMembers = assert.sameMembers;
const throws = assert.throw;

suite('Utility Functions', () => {
  suite('fact', () => {
    const fact = rouge.fact;

    test('should throw RangeError for -1!', () => throws(() => fact(-1), RangeError));

    test('should return 1 for 0!', () => equal(fact(0), 1));
    test('should return 1 for 1!', () => equal(fact(1), 1));

    test('should return 120 for 5!', () => equal(fact(5), 120));
    test('should return 3628800 for 10!', () => equal(fact(10), 3628800));
    test('should return 2432902008176640000 for 20!', () => equal(fact(20), 2432902008176640000));
    test('should return 2432902008176640000 for 20! using cache', () => equal(fact(20), 2432902008176640000));
  });

  suite('comb2', () => {
    const comb2 = rouge.comb2;

    test('should throw RangeError for C(1,2)', () => throws(() => comb2(1), RangeError));

    test('should return 1 for C(2,2)', () => equal(comb2(2), 1));
    test('should return 45 for C(10,2)', () => equal(comb2(10), 45));
    test('should return 499500 for C(1000,2)', () => equal(comb2(1000), 499500));
  });

  suite('arithmeticMean', () => {
    const am = rouge.arithmeticMean;

    test('should throw RangeError for empty array', () => throws(() => am([]), RangeError));

    test('should return singleton value of singleton array', () => equal(am([5]), 5));
    test('should return value of homogeneous array', () => equal(am([5, 5, 5]), 5));

    test('should return 2 for [1, 2, 3]', () => equal(am([1, 2, 3]), 2));
    test('should return 2.5 for [1, 2, 3, 4]', () => equal(am([1, 2, 3, 4]), 2.5));
  });

  suite('intersection', () => {
    const ins = rouge.intersection;

    test('should return empty array for two empty inputs', () => deepEqual(ins([], []), []));
    test('should return empty array for first empty input', () => deepEqual(ins([], [2]), []));
    test('should return empty array for second empty input', () => deepEqual(ins([2], []), []));

    test('should return singleton value of singleton array', () => sameMembers(ins([2], [2]), [2]));
    test('should return identical value of identical arrays', () => sameMembers(ins([1, 2, 3], [1, 2, 3]), [1, 2, 3]));

    test('should return [2] for [1, 2, 3] and [2, 4, 6]', () => sameMembers(ins([1, 2, 3], [2, 4, 6]), [2]));
    test('should return [2, 3] for [1, 2, 3] and [2, 3, 6]', () => sameMembers(ins([1, 2, 3], [2, 3, 6]), [2, 3]));
    test('should return [1, 2, 3] for [1, 2, 3] and [1, 2, 3, 6]', () => sameMembers(ins([1, 2, 3], [1, 2, 3, 6]), [1, 2, 3]));
  });

  suite('lcs', () => {
    const lcs = rouge.lcs;

    test('should return empty array for empty first input', () => deepEqual(lcs([], [1]), []));
    test('should return empty array for empty second input', () => deepEqual(lcs([1], []), []));
    test('should return empty array for unique inputs', () => deepEqual(lcs([1], [2]), []));
    test('should return singleton value for singleton inputs', () => sameMembers(lcs([1], [1]), [1]));

    test('should return [1, 1] for [1, 1] and [2, 1, 1, 3]', () => sameMembers(lcs([1, 1], [2, 1, 1, 3]), [1, 1]));
    test('should return [2, 3] for [1, 2, 3] and [2, 3, 5]', () => sameMembers(lcs([1, 2, 3], [2, 3, 5]), [2, 3]));
    test('should return [w1, w3, w5] for [w1, w2, w3, w4, w5] and [w1, w3, w8, w9, w5]', () => {
      return sameMembers(lcs(['w1', 'w2', 'w3', 'w4', 'w5'], ['w1', 'w3', 'w8', 'w9', 'w5']), ['w1', 'w3', 'w5']);
    });
  });

  suite('nGram', () => {
    const nGram = rouge.nGram;
    const data = ['a', 'b', 'c', 'd'];

    test('should throw RangeError for ngram size < 1', () => throws(() => nGram(data, 0)), RangeError);
    test('should throw RangeError for invalid ngram size', () => throws(() => nGram(data, 5)), RangeError);

    test(`should return ['a', 'b', 'c', 'd'] for n = 1`, () => sameMembers(nGram(data, 1), ['a', 'b', 'c', 'd']));
    test(`should return ['a b', 'b c', 'c d'] for n = 2`, () => sameMembers(nGram(data), ['a b', 'b c', 'c d']));
    test(`should return ['a b c', 'b c d'] for n = 3`, () => sameMembers(nGram(data, 3), ['a b c', 'b c d']));
    test(`should return ['a b c d'] for n = 4`, () => sameMembers(nGram(data, 4), ['a b c d']));

    test('should pad only the start of the string',
         () => sameMembers(nGram(data, 4, { start: true }),
                           ['<S> <S> <S> a', '<S> <S> a b', '<S> a b c', 'a b c d']));
    test('should pad only the end of the string',
         () => sameMembers(nGram(data, 4, { end: true }),
                           ['a b c d', 'b c d <S>', 'c d <S> <S>', 'd <S> <S> <S>']));
    test('should pad both the start and end of the string',
         () => sameMembers(nGram(data, 4, { start: true, end: true }),
                           ['<S> <S> <S> a', '<S> <S> a b', '<S> a b c', 'a b c d', 'b c d <S>', 'c d <S> <S>', 'd <S> <S> <S>']));
    test('should change the padding word',
         () => sameMembers(nGram(data, 4, { start: true, val: '<UNK>' }),
                           ['<UNK> <UNK> <UNK> a', '<UNK> <UNK> a b', '<UNK> a b c', 'a b c d']));
  });

  suite('skipBigram', () => {
    const sb = rouge.skipBigram;

    const data = ['a', 'b', 'c', 'd'];
    const result = ['a b', 'a c', 'a d', 'b c', 'b d', 'c d'];

    test('should throw RangeError for inputs with insufficient words', () => throws(() => sb(['a'])), RangeError);

    test('should return the correct result', () => sameMembers(sb(data), result));
  });

  suite('sentenceSegment', () => {
    const ss = rouge.sentenceSegment;

    test('should return empty array for empty input', () => deepEqual(ss(''), []));

    // Golden Rule tests from https://github.com/diasks2/pragmatic_segmenter
    // =====================================================================

    test('should split simple periods', () => {
      return deepEqual(ss('Hello World. My name is Jonas.'), ['Hello World.', 'My name is Jonas.']);
    });

    test('should split end-of-sentence question marks', () => {
      return deepEqual(ss('What is your name? My name is Jonas.'), ['What is your name?', 'My name is Jonas.']);
    });

    test('should split end-of-sentence exclamation marks', () => {
      return deepEqual(ss('There it is! I found it.'), ['There it is!', 'I found it.']);
    });

    test('should not split singleton uppercase abbreviations', () => {
      return deepEqual(ss('My name is Jonas E. Smith.'), ['My name is Jonas E. Smith.']);
    });

    test('should not split singleton lowercase abbreviations', () => {
      return deepEqual(ss('Please turn to p. 55.'), ['Please turn to p. 55.']);
    });

    test('should not split two letter lowercase abbreviations in the middle of a sentence', () => {
      return deepEqual(ss('Were Jane and co. at the party?'),
                         ['Were Jane and co. at the party?']);
    });

    test('should not split two letter uppercase abbreviations in the middle of a sentence', () => {
      return deepEqual(ss('They closed the deal with Pitt, Briggs & Co. at noon.'),
                         ['They closed the deal with Pitt, Briggs & Co. at noon.']);
    });

    test('should split two letter lowercase abbreviations at the end of a sentence', () => {
      return deepEqual(ss('Let\'s ask Jane and co. They should know.'),
                         ['Let\'s ask Jane and co.', 'They should know.']);
    });

    test('should split two letter uppercase abbreviations at the end of a sentence', () => {
      return deepEqual(ss('They closed the deal with Pitt, Briggs & Co. It closed yesterday.'),
                         ['They closed the deal with Pitt, Briggs & Co.', 'It closed yesterday.']);
    });

    test('should not split two letter (prepositive) abbreviations', () => {
      return deepEqual(ss('I can see Mt. Fuji from here.'),
                         ['I can see Mt. Fuji from here.']);
    });

    test('should not split two letter (prepositive & postpositive) abbreviations', () => {
      return deepEqual(ss('St. Michael\'s Church is on 5th st. near the light.'),
                         ['St. Michael\'s Church is on 5th st. near the light.']);
    });

    test('should not split possesive two letter abbreviations', () => {
      return deepEqual(ss('That is JFK Jr.\'s book.'),
                         ['That is JFK Jr.\'s book.']);
    });

    test('should not split multi-period abbreviations in the middle of a sentence', () => {
      return deepEqual(ss('I visited the U.S.A. last year.'),
                         ['I visited the U.S.A. last year.']);
    });

    test('should not split multi-period abbreviations at the end of a sentence', () => {
      return deepEqual(ss('I live in the E.U. How about you?'),
                         ['I live in the E.U.', 'How about you?']);
    });

    test('should split U.S. as sentence boundary', () => {
      return deepEqual(ss('I live in the U.S. How about you?'),
                         ['I live in the U.S.', 'How about you?']);
    });

    // test('should not split U.S. as non-sentence boundary with next word capitalized', () => {
    //   return deepEqual(ss('I work for the U.S. Government in Virginia.'),
    //                      ['I work for the U.S. Government in Virginia.']);
    // });

    test('should not split U.S. as non-sentence boundary', () => {
      return deepEqual(ss('I have lived in the U.S. for 20 years.'),
                         ['I have lived in the U.S. for 20 years.']);
    });

    // test('should handle A.M. / P.M. as non-sentence boundary and sentence boundary', () => {
    //   return deepEqual(ss('At 5 a.m. Mr. Smith went to the bank. He left the bank at 6 P.M. Mr. Smith then went to the store.'),
    //                      ['At 5 a.m. Mr. Smith went to the bank.', 'He left the bank at 6 P.M.', 'Mr. Smith then went to the store.']);
    // });

    test('should not split numbers as a non-sentence boundary', () => {
      return deepEqual(ss('She has $100.00 in her bag.'),
                         ['She has $100.00 in her bag.']);
    });

    test('should split numbers as a sentence boundary', () => {
      return deepEqual(ss('She has $100.00. It is in her bag.'),
                         ['She has $100.00.', 'It is in her bag.']);
    });

    test('should not split parenthetical inside sentence', () => {
      return deepEqual(ss('He teaches science (He previously worked for 5 years as an engineer.) at the local University.'),
                         ['He teaches science (He previously worked for 5 years as an engineer.) at the local University.']);
    });

    test('should split email addresses as a sentence boundary', () => {
      return deepEqual(ss('Her email is Jane.Doe@example.com. I sent her an email.'),
                         ['Her email is Jane.Doe@example.com.', 'I sent her an email.']);
    });

    test('should split web addresses as a sentence boundary', () => {
      return deepEqual(ss('The site is: https://www.example.50.com/new-site/awesome_content.html. Please check it out.'),
                         ['The site is: https://www.example.50.com/new-site/awesome_content.html.', 'Please check it out.']);
    });

    test('should not split single quotations inside sentence', () => {
      return deepEqual(ss('She turned to him, \'This is great.\' she said.'),
                         ['She turned to him, \'This is great.\' she said.']);
    });

    // test('should not split double quotations inside sentence', () => {
    //   return deepEqual(ss('She turned to him, \"This is great.\" she said.'),
    //                       ['She turned to him, \"This is great.\" she said.']);
    // });

    test('should split double exclamation points', () => {
      return deepEqual(ss('Hello!! Long time no see.'),
                         ['Hello!!', 'Long time no see.']);
    });

    test('should split double question marks', () => {
      return deepEqual(ss('Hello?? Who is there?'),
                         ['Hello??', 'Who is there?']);
    });

    test('should split double punctuation (exclamation point + question mark)', () => {
      return deepEqual(ss('Hello!? Is that you?'),
                         ['Hello!?', 'Is that you?']);
    });

    test('should split double punctuation (question mark + exclamation point)', () => {
      return deepEqual(ss('Hello?! Is that you?'),
                         ['Hello?!', 'Is that you?']);
    });

    test('should not split errant newlines in the middle of sentences (PDF)', () => {
      return deepEqual(ss('This is a sentence\ncut off in the middle because pdf.'),
                          ['This is a sentence cut off in the middle because pdf.']);
    });

    test('should not split errant newlines in the middle of sentences', () => {
      return deepEqual(ss('It was a cold \nnight in the city.'),
                         ['It was a cold night in the city.']);
    });

    test('should split lower case list separated by newline', () => {
      return deepEqual(ss('features\ncontact manager\nevents, activities\n'),
                         ['features', 'contact manager', 'events, activities']);
    });

    test('should split geo-coordinate as a sentence boundary', () => {
      return deepEqual(ss('You can find it at N°. 1026.253.553. That is where the treasure is.'),
                         ['You can find it at N°. 1026.253.553.', 'That is where the treasure is.']);
    });

    test('should not split named entities with an exclamation point', () => {
      return deepEqual(ss('She works at Yahoo! in the accounting department.'),
                         ['She works at Yahoo! in the accounting department.']);
    });

    test('should correctly handle I as a sentence boundary and I as an abbreviation', () => {
      return deepEqual(ss('We make a good team, you and I. Did you see Albert I. Jones yesterday?'),
                         ['We make a good team, you and I.', 'Did you see Albert I. Jones yesterday?']);
    });

    test('should not split ellipsis at end of quotation', () => {
      return deepEqual(ss('Thoreau argues that by simplifying one’s life, \"the laws of the universe will appear less complex....\"'),
                         ['Thoreau argues that by simplifying one’s life, \"the laws of the universe will appear less complex....\"']);
    });

    test('should not split ellipsis with square brackets', () => {
      return deepEqual(ss('\"Bohr [...] used the analogy of parallel stairways [...]\" (Smith 55).'),
                         ['\"Bohr [...] used the analogy of parallel stairways [...]\" (Smith 55).']);
    });
  });

  suite('treeBankTokenize', () => {
    const tbt = rouge.treeBankTokenize;

    test('should return empty array for empty input', () => deepEqual(tbt(''), []));

    test('should split \'ll contractions',
        () => sameMembers(tbt('They\'ll save and invest more.'),
        ['They', '\'ll', 'save', 'and', 'invest', 'more', '.']));

    test('should split n\'t contractions and trailing commas',
        () => sameMembers(tbt('hi, my name can\'t hello,'),
        ['hi', ',', 'my', 'name', 'ca', 'n\'t', 'hello', ',']));

    test('should handle special symbols',
        () => sameMembers(tbt('Good muffins cost $3.88 in New York.'),
        ['Good', 'muffins', 'cost', '$', '3.88', 'in', 'New', 'York', '.']));

    test('should handle double quotation marks',
        () => sameMembers(tbt('\"We beat some pretty good teams to get here,\" Slocum said.'),
        ['``', 'We', 'beat', 'some', 'pretty', 'good', 'teams', 'to', 'get', 'here', ',', '\'\'', 'Slocum', 'said', '.']));
  });

  suite('jackKnife', () => {
    const jk = rouge.jackKnife;

    const cands = ['a', 'ab', 'abc', 'abcd'];
    const ref = 'abcd';

    const evalFunc = (a, b) => a.length + b.length;
    const statTest = (input) => input.reduce((a, b) => a + b);

    test('should throw RangeError when less than 2 candidates are provided', () => throws(() => jk(['a'], ref, evalFunc)));

    test('should return the correct result using default statistical test', () => equal(jk(cands, ref, evalFunc), 7.75));
    test('should return the correct result using alternative test', () => equal(jk(cands, ref, evalFunc, statTest), 31));
  });

  suite('fMeasure', () => {
    const fm = rouge.fMeasure;

    test('should throw RangeError for OOB precision input', () => throws(() => fm(10, 0.5), RangeError));
    test('should throw RangeError for OOB recall input', () => throws(() => fm(0.5, 10), RangeError));
    test('should throw RangeError for OOB beta input', () => throws(() => fm(0.5, 0.75, -1), RangeError));

    test('should ignore precision when beta > 1', () => equal(fm(0.5, 0.75, Infinity), 0.75));
    test('should correctly compute DUC score', () => equal(fm(0.5, 0.75, 1), 0.6));
  });

  suite('charIsUpperCase', () => {
    const isUpper = rouge.charIsUpperCase;

    test('should throw RangeError for non-character input', () => throws(() => isUpper('abcd')), RangeError);
    test('should throw RangeError for empty input', () => throws(() => isUpper('')), RangeError);

    test('should return true for uppercase input', () => equal(isUpper('A'), true));
    test('should return false for lowercase input', () => equal(isUpper('a'), false));
    test('should return false for non-alphabetical input', () => equal(isUpper('1'), false));
  });

  suite('strIsTitleCase', () => {
    const isTitle = rouge.strIsTitleCase;

    test('should return true for titlecase input', () => equal(isTitle('Abcd'), true));
    test('should return false for all lowercase input', () => equal(isTitle('abcd'), false));
    test('should return false for lowercase input with interspesed capitals', () => equal(isTitle('aBcD'), false));
  });
});

suite('Core Functions', () => {
  suite('ROUGE-N', () => {
    const n = rouge.n;

    const cand = 'pulses may ease schizophrenic voices';
    const refs = [
      'magnetic pulse series sent through brain may ease schizophrenic voices',
      'yale finds magnetic stimulation some relief to schizophrenics imaginary voices',
    ];

    test('should throw RangeError for empty candidate', () => throws(() => n('', refs[0]), RangeError));
    test('should throw RangeError for empty ref', () => throws(() => n(cand, ''), RangeError));

    test('should correctly compute ROUGE-N score for ref 1', () => equal(n(cand, refs[0]), 0.4));
    test('should correctly compute ROUGE-N score for ref 2', () => equal(n(cand, refs[1]), 0.1));

    test('should correctly compute ROUGE-N score for ref 1 with different opts', () => equal(n(cand, refs[0], { n: 2 }), 1 / 3));
    test('should correctly compute ROUGE-N score for ref 2 with different opts', () => equal(n(cand, refs[1], { n: 2 }), 0));
  });

  suite('ROUGE-S', () => {
    const s = rouge.s;

    const ref = 'police killed the gunman';
    const cands = [
      'police kill the gunman',
      'the gunman kill police',
      'the gunman police killed',
    ];

    test('should throw RangeError for empty candidate', () => throws(() => s('', ref), RangeError));
    test('should throw RangeError for empty ref', () => throws(() => s(cands[0], ''), RangeError));

    test('should return 0 for summaries with zero overlap', () => equal(s('banana yoghurt', ref), 0));

    test('should correctly compute ROUGE-S score for cand 1 with different opts', () => equal(s(cands[0], ref, { beta: 1 }), 1 / 2));
    test('should correctly compute ROUGE-S score for cand 2 with different opts', () => equal(s(cands[1], ref, { beta: 1 }), 1 / 6));
    test('should correctly compute ROUGE-S score for cand 3 with different opts', () => equal(s(cands[2], ref, { beta: 1 }), 1 / 3));
  });

  suite('ROUGE-L', () => {
    const l = rouge.l;

    const ref = 'police killed the gunman';
    const cands = [
      'police kill the gunman',
      'the gunman kill police',
      'the gunman police killed',
    ];

    test('should throw RangeError for empty candidate', () => throws(() => l('', ref), RangeError));
    test('should throw RangeError for empty ref', () => throws(() => l(cands[0], ''), RangeError));

    test('should correctly compute ROUGE-L score for cand 1 with different opts', () => equal(l(cands[0], ref, { beta: 1 }), 3 / 4));
    test('should correctly compute ROUGE-L score for cand 2 with different opts', () => equal(l(cands[1], ref, { beta: 1 }), 3 / 4));
    test('should correctly compute ROUGE-L score for cand 3 with different opts', () => equal(l(cands[2], ref, { beta: 1 }), 4 / 4));
  });
});
