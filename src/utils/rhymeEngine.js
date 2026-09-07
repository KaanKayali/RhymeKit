// Replace or expand this small starter list with your own dictionary data.
export const DEFAULT_WORD_LIST = ['Haus', 'Maus', 'Laus', 'Blau', 'Schlau']

// Diphthongs must be listed before single vowels so they are extracted as units.
const VOWEL_REGEX = /(au|äu|eu|ei|ai|ie|[aeiouäöü])/gi

/**
 * Returns the ordered German vowel/diphthong sounds in a word.
 * All extraction is deliberately case-insensitive.
 */
export function extractVowelSequence(word) {
  return String(word || '').toLowerCase().match(VOWEL_REGEX) || []
}

/**
 * Returns the substring beginning at the final vowel or diphthong in a word.
 */
export function extractEndingFromLastVowel(word) {
  const cleanWord = String(word || '').toLowerCase()
  const vowelMatches = [...cleanWord.matchAll(VOWEL_REGEX)]
  const lastVowel = vowelMatches.at(-1)

  return lastVowel?.index === undefined ? '' : cleanWord.slice(lastVowel.index)
}

function applyGermanErRule(word, language, treatErAsA) {
  if (language !== 'de' || !treatErAsA) return word

  // Replace every word-final "er" sound in a phrase before phonetic analysis.
  return word.replace(/er(?=\s|$)/g, 'a')
}

/**
 * Browser-only rhyme solver. All comparisons use lowercase strings, while the
 * original dictionary entry is returned for display in the UI.
 */
export function findRhymes({ searchTerm, rhymeType, language, wordList, treatErAsA = false }) {
  if (!wordList) return []

  const uniqueWordList = []
  const seenEntries = new Set()
  for (const entry of wordList) {
    const cleanEntry = String(entry || '').trim().toLowerCase()
    if (cleanEntry && !seenEntries.has(cleanEntry)) {
      seenEntries.add(cleanEntry)
      uniqueWordList.push(entry)
    }
  }

  const cleanInput = String(searchTerm || '').trim().toLowerCase()
  // With no active search, show every unique loaded entry unchanged.
  if (!cleanInput) return uniqueWordList

  const phoneticInput = applyGermanErRule(cleanInput, language, treatErAsA)
  const inputVowels = extractVowelSequence(phoneticInput)
  const inputVowelKey = inputVowels.join('-')
  const inputEnding = extractEndingFromLastVowel(phoneticInput)

  // Reserved for future language-specific phoneme rules.
  void language

  return uniqueWordList.filter((entry) => {
    const cleanEntry = String(entry || '').trim().toLowerCase()

    // Never display the searched word itself, even if its capitalization differs.
    if (!cleanEntry || cleanEntry === cleanInput) return false

    const phoneticEntry = applyGermanErRule(cleanEntry, language, treatErAsA)
    const entryVowels = extractVowelSequence(phoneticEntry)
    const entryVowelKey = entryVowels.join('-')
    const entryEnding = extractEndingFromLastVowel(phoneticEntry)

    switch (rhymeType) {
      case 'vowel':
        return inputVowelKey.length > 0 && inputVowelKey === entryVowelKey

      case 'consonant':
        return inputEnding.length > 0 && inputEnding === entryEnding

      case 'vowel_ending':
        return (
          inputVowelKey.length > 0 &&
          inputVowelKey === entryVowelKey &&
          inputEnding.length > 0 &&
          inputEnding === entryEnding
        )

      case 'frame_vowel':
        return (
          inputVowels.length > 0 &&
          entryVowels.length > 0 &&
          inputVowels.length === entryVowels.length &&
          inputVowels[0] === entryVowels[0] &&
          inputVowels.at(-1) === entryVowels.at(-1)
        )

      default:
        return false
    }
  })
}
