/**
* @license
* @Author: Lim Mingjie, Kenneth
* @Date:   2016-01-21T12:04:28-05:00
* @Email:  me@kenlimmj.com
* @Last modified by:   Lim Mingjie, Kenneth
* @Last modified time: 2016-01-26T23:29:05-05:00
*/

'use strict';

const assert = require('chai').assert;
const rouge = require('../dist/es5/rouge');
const parallel = require('mocha.parallel');

const deepEqual = assert.deepEqual;
const equal = assert.strictEqual;
const lengthOf = assert.lengthOf;
const sameMembers = assert.sameMembers;
const throws = assert.throw;

suite('Utility Functions', () => {
  parallel('fact', () => {
    const fact = rouge.fact;

    test('should throw RangeError for -1!', () => throws(() => fact(-1), RangeError));

    test('should return 1 for 0!', () => equal(fact(0), 1));
    test('should return 1 for 1!', () => equal(fact(1), 1));

    test('should return 120 for 5!', () => equal(fact(5), 120));
    test('should return 3628800 for 10!', () => equal(fact(10), 3628800));
    test('should return 2432902008176640000 for 20!', () => equal(fact(20), 2432902008176640000));
  });

  parallel('comb2', () => {
    const comb2 = rouge.comb2;

    test('should throw RangeError for C(1,2)', () => throws(() => comb2(1), RangeError));

    test('should return 1 for C(2,2)', () => equal(comb2(2), 1));
    test('should return 45 for C(10,2)', () => equal(comb2(10), 45));
    test('should return 499500 for C(1000,2)', () => equal(comb2(1000), 499500));
  });

  parallel('arithmeticMean', () => {
    test('should throw RangeError for empty array', () => throws(() => rouge.arithmeticMean([]), RangeError));

    test('should return singleton value of singleton array', () => equal(rouge.arithmeticMean([5]), 5));
    test('should return value of homogeneous array', () => equal(rouge.arithmeticMean([5, 5, 5]), 5));

    test('should return 2 for [1, 2, 3]', () => equal(rouge.arithmeticMean([1, 2, 3]), 2));
    test('should return 2.5 for [1, 2, 3, 4]', () => equal(rouge.arithmeticMean([1, 2, 3, 4]), 2.5));
  });

  parallel('lcs', () => {
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

  parallel('nGram', () => {

  });

  parallel('skipBigram', () => {

  });

  // Runs Golden Rule tests from https://github.com/diasks2/pragmatic_segmenter
  parallel('sentenceSegment', () => {
    const ss = rouge.sentenceSegment;

    test('should return empty array for empty input', () => deepEqual(ss(''), []));

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
    //
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

  parallel('treeBankTokenize', () => {

  });

  parallel('fMeasure', () => {
    const fm = rouge.fMeasure;

    test('should ignore precision when beta > 1', () => equal(fm(0.5, 0.75, Infinity), 0.75));
  });
});
