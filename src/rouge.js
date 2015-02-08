/*
 * @Author: Lim Mingjie, Kenneth
 * @Date:   2014-12-21 01:48:14
 * @Last Modified by:   Astrianna
 * @Last Modified time: 2015-01-14 17:08:24
 *
 * @flow
 */

'use strict';

(function(window) {
    var rouge = (function() {
        // Specify lodash as a dependency if running in a Node environment
        if (typeof(module) === 'object' && module && typeof(module.exports) === 'object') {
            var _ = require('lodash-node');
        }

        /**
         * Returns the factorial of a number. For speed, this uses a memoized
         * recursive function with a fixed point at n = 0.
         * @param  Number n The number for which the factorial should be calculated
         * @return Number   The factorial of n
         */
        var fact = _.memoize(function(n) {
            return n === 0 ? 1 : n * fact(n - 1);
        });

        /**
         * Returns the length of the longest common subsequence of a pair of strings.
         * Depending on how one wishes to use this, the inputs may be character arrays
         * (corresponding to the LCS for words) or word arrays (corresponding to the
         * LCS for sentences). For speed, this uses a dynamic programming approach
         * with search-space pruning for an average case of O(mn).
         * @param  Array candidate An array of strings to be compared.
         *                         This array must be sensitive to ordering.
         * @param  Array reference An array of strings to be compared.
         *                         This array must be sensitive to ordering.
         * @return Number          The length of the longest common subsequence
         *                         between the candidate and reference strings.
         */
        var lcs = function(candidate, reference) {
            // Normalize both inputs by converting them to lowercase. Failing
            // to do so means comparing 'A' and 'a' is falsey. Modify as appropriate.
            var candidate = _.invoke(candidate, String.prototype.toLowerCase),
                reference = _.invoke(reference, String.prototype.toLowerCase);

            // Initialize pointers for moving through the search space
            var startIdx = 0,
                candidateEndIdx = candidate.length - 1,
                referenceEndIdx = reference.length - 1,
                similarityCount = 0;

            // If the first two entries are identical, ignore them in the final
            // comparison, but bump the count
            while (candidate[startIdx] === reference[startIdx]) {
                startIdx++;

                similarityCount++;
            }

            // If the last two entries are identical, ignore them in the final
            // comparison, but bump the count
            while (candidate[candidateEndIdx] === reference[referenceEndIdx]) {
                candidateEndIdx--;
                referenceEndIdx--;

                similarityCount++;
            }

            // Slice the original arrays with the new indices
            var trimmedCandidate = candidate.slice(startIdx, candidateEndIdx + 1),
                trimmedReference = reference.slice(startIdx, referenceEndIdx + 1);

            // Preallocate an update table
            var cTable = [];

            // Zero-fill the table. The number of columns corresponds to the length
            // of the reference input, and the number of rows corresponds to
            // the length of the candidate input.
            for (var i = 0; i <= trimmedReference.length; i++) {
                cTable.push(Uint8Array(trimmedCandidate.length + 1));
            }

            // Perform the Bellman-Ford Update by looping through the update table.
            // If entries match, increment the current value in the table. Otherwise,
            // propagate the previous value. Note that this table is triangular.
            for (var i = 1; i <= trimmedReference.length; i++) {
                for (var j = 1; j <= trimmedCandidate.length; j++) {
                    if (trimmedReference[i - 1] === trimmedCandidate[j - 1]) {
                        cTable[i][j] = cTable[i - 1][j - 1] + 1;
                    } else {
                        cTable[i][j] = Math.max(cTable[i][j - 1], cTable[i - 1][j]);
                    }
                }
            }

            // The last value in the update table is the length of the LCS for the
            // reduced search space. Add that to the original number of matches
            // to get the final result
            return cTable[trimmedReference.length][trimmedCandidate.length] + similarityCount;
        }

        /**
         * Returns the skip bigrams for an input.
         * @param  Array wordArr An array of strings
         * @return Array         An array of skip bigrams
         */
        var skipBigram = function(wordArr) {
            // Sanity check: If there's less than two words, no way we're
            // going to produce a skip bigram
            if (wordArr.length < 2) {
                return null;
            } else {
                // Loop through every word
                return wordArr.reduce(function(acc, currWord, index, wordBank) {
                    // Take every word after the first one and pair them up
                    for (var i = index + 1; i < wordBank.length; i++) {
                        acc.push(currWord + wordBank[i]);
                    }

                    return acc;
                }, []);
            }
        }

        /**
         * Returns the n-grams for an input, for the provided n.
         * @param  Array wordArr An array of strings
         * @param  Number n      The size of the gram to be returned
         * @return Array         An array of n-grams
         */
        var extractGram = function(wordArr, n) {
            // Sanity checks. This one's kind of obvious
            if (n === 0 || n > wordArr.length) {
                return null;
            } else if (n === 1) {
                // Short circuit if unigrams are requested
                return wordArr;
            } else {
                // Loop through every word
                return wordArr.reduce(function(acc, _, index, wordBank) {
                    // So long there's still room for the sliding window to fit,
                    // we can create a gram
                    if (index + n <= wordBank.length) {
                        var currGram = '';

                        // Straightforward string concatenation
                        for (var i = index; i < index + n; i++) {
                            currGram += wordBank[i].toString();
                        }

                        return acc.concat([currGram]);
                    } else {
                        return acc;
                    }
                }, []);
            }
        }

        /**
         * Evaluates a candidate against a set of references using the specified
         * method by averaging over n-1 comparisons in a leave-one-out approach.
         * This is the standard statistical jackknifing method for approximating
         * human responses.
         * @param  Array candidate      An array of strings to be compared
         * @param  Array references     An array of string arrays to be compared.
         * @param  Function evalMethod  A lambda or function handle which accepts
         *                              two inputs and returns a numerical output
         * @return Number               The average of the argmax for each set of results
         */
        var evalJackKnife = function(candidate, references, evalMethod) {
            // Preallocate an array to hold the results of performing
            // pairwise comparisons
            var pairwiseResults = [];

            for (var i = 0; i < references.length; i++) {
                // Go through each reference in order
                var result = references.reduce(function(acc, currRef, index) {
                    // Exclude the current reference as we go through, effectively
                    // performing a leave-one-out comparison
                    if (index !== i) {
                        acc.push(evalMethod(candidate, currRef));
                    }

                    return acc;
                }, []);

                // Only consider the argmax for the current set of results
                pairwiseResults.push(_.max(result));
            }

            // Average all the pairwise results
            var sumResult = pairwiseResults.reduce(function(acc, currResult) {
                return acc + currResult;
            }, 0);

            return sumResult / pairwiseResults.length;
        }

        /**
         * Returns the ROUGE-N metric for a candidate and a set of references.
         * @param  Array candidate      An array of strings to be compared
         * @param  Array reference      An array of string arrays to be compared
         * @param  Number n             The number of grams to use
         * @param  Boolean jackKnife    Flag for whether jackknifing should be used
         * @return Number               The calculated ROUGE-N value
         */
        var evalNGram = function(candidate, reference, n, jackKnife) {
            // Tokenize the candidate input and extract grams
            var candidateWords = candidate.match(/\w+/g),
                candidateGrams = extractGram(candidateWords, n);

            // Case where only one reference is provided
            if (typeof(reference) === 'string' || (_.isArray(reference) && reference.length === 1)) {
                // Tokenize the reference
                if (typeof(reference) === 'string') {
                    var referenceWords = reference.match(/\w+/g);
                } else {
                    var referenceWords = reference[0].match(/\w+/g);
                }

                // Extract grams from the tokenized reference
                var referenceGrams = extractGram(referenceWords, n),
                    referenceGramCount = referenceGrams.length;

                // Find the number of matching grams by taking the intersection
                // of the two arrays
                var matchedGrams = _.intersection(candidateGrams, referenceGrams),
                    matchedGramCount = matchedGrams.length;

                return matchedGramCount / referenceGramCount;
            // Case where multiple references are provided
            } else if (_.isArray(reference) && reference.length > 1) {
                if (jackKnife) {
                    // Here we pass in an anonymous function that wraps the
                    // current function (a la mode recursive), except we turn off
                    // jackknifing because it does not matter - only one reference
                    return evalJackKnife(candidate, reference, function(x, y) {
                        return evalNGram(x, y, n, false);
                    });
                } else {
                    // Extract grams from each of the references, but maintain
                    // the overall hierarchy (i.e. we're not concatenating all
                    // the grams into one giant array)
                    var referenceGramCount = 0,
                        referenceGrams = reference.reduce(function(acc, currRef) {
                            var words = currRef.match(/\w+/g),
                                grams = extractGram(words, n);

                            referenceGramCount += grams.length;

                            return acc.concat([grams]);
                        }, []);

                    var matchCount = 0;

                    // Go through each set of reference grams and sum the results
                    referenceGrams.forEach(function(ref) {
                        var matchedGrams = _.intersection(candidateGrams, ref);

                        matchCount += matchedGrams.length;
                    });

                    return matchCount / referenceGramCount;
                }
            } else {
                return null;
            }
        }

        /**
         * Returns the ROUGE-L metric for a candidate and a set of references
         * @param  Array candidate      An array of strings to be compared
         * @param  Array reference      An array of string arrays to be compared
         * @param  Boolean jackKnife    Flag for whether jackknifing should be used
         * @return Number               The calculated ROUGE-L value
         */
        var evalLCS = function(candidate, reference) {
            // Tokenize the candidate input to sentences
            var candidateSentences = candidate.split(/[\.!\?]\s/),
                candidateWordCount = candidate.match(/\w+/g).length;

            // Case where only one reference is provided
            if (typeof(reference) === 'string' || (_.isArray(reference) && reference.length === 1)) {
                // Tokenize the ference
                if (typeof(reference) === 'string') {
                    var referenceSentences = reference.split(/[\.!\?]\s/),
                        referenceWordCount = reference.match(/\w+/g).length;
                } else {
                    var referenceSentences = reference[0].split(/[\.!\?]\s/),
                        referenceWordCount = reference[0].match(/\w+/g).length;
                }

                var lcsSum = referenceSentences.reduce(function(acc, reference) {
                    // Find the LCS length for each sentence pair
                    var lcsArr = candidateSentences.map(function(candidate) {
                        return lcs(candidate, reference);
                    });

                    // Union sum across all results
                    return acc + _.union(lcsArr).length;
                }, 0);

                // Do math.
                var r = lcsSum / referenceWordCount,
                    p = lcsSum / candidateWordCount,
                    beta = p / r; // Note that DUC forces beta to 1.

                var fMeasure = ((1 + beta * beta) * r * p) / (r + beta * beta * p);

                return fMeasure;
            // Case where multiple references are provided
            } else if (_.isArray(reference) && reference.length > 1) {
                return evalJackKnife(candidate, reference, evalLCS);
            } else {
                return null;
            }
        }

        /**
         * Returns the ROUGE-S metric for a candidate and a set of references
         * @param  Array candidate      An array of strings to be compared
         * @param  Array reference      An array of string arrays to be compared
         * @param  Boolean jackKnife    Flag for whether jackknifing should be used
         * @return Number               The calculated ROUGE-S value
         */
        var evalSkipBigram = function(candidate, reference) {
            // Tokenize the candidate input and generate skip bigrams
            var candidateWords = candidate.match(/\w+/g),
                candidateWordCount = candidateWords.length,
                candidateSkipBigrams = skipBigram(candidateWords),
                candidateCombs = fact(candidateWordCount) / (2 * fact(candidateWordCount - 2));

            // Case where only one reference is provided
            if (typeof(reference) === 'string' || (_.isArray(reference) && reference.length === 1)) {
                // Tokenize the reference input
                if (typeof(reference) === 'string') {
                    var referenceWords = reference.match(/\w+/g);
                } else {
                    var referenceWords = reference[0].match(/\w+/g);
                }

                // Generate skip bigrams for the reference
                var referenceWordCount = referenceWords.length,
                    referenceSkipBigrams = skipBigram(referenceWords),
                    referenceCombs = fact(referenceWordCount) / (2 * fact(referenceWordCount - 2));

                // Do math
                var r = candidateSkipBigrams / candidateCombs,
                    p = referenceSkipBigrams / referenceCombs,
                    beta = p / r; // Note that DUC forces beta to 1

                var fMeasure = ((1 + beta * beta) * r * p) / (r + beta * beta * p);

                return fMeasure;
            // Case where multiple references are provided
            } else if (_.isArray(reference) && reference.length > 1) {
                return evalJackKnife(candidate, reference, evalSkipBigram);
            }
        }

        return {
            n: evalNGram,
            l: evalLCS,
            s: evalSkipBigram,
            _fact: fact,
            _lcs: lcs,
            _extractGram: extractGram,
            _skipBigram: skipBigram
        }
    })(rouge || {});

    // Logic to inject the function into the appropriate environment.
    // Supports browser loading, Node.JS requires, and AMD.
    if (typeof(module) === 'object' && module && typeof(module.exports) === 'object') {
        module.exports = rouge;
    } else {
        if (typeof(define) === 'function' && define.amd) {
            return rouge;
        } else {
            window.rouge = rouge;
        }
    }
})(this);
