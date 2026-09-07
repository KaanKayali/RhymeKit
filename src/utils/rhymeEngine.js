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

/**
 * Browser-only rhyme solver. All comparisons use lowercase strings, while the
 * original dictionary entry is returned for display in the UI.
 */
export function findRhymes({ searchTerm, rhymeType, language, wordList }) {
  if (!searchTerm || !wordList) return []

  const cleanInput = searchTerm.trim().toLowerCase()
  if (!cleanInput) return []

  const inputVowels = extractVowelSequence(cleanInput).join('-')
  const inputEnding = extractEndingFromLastVowel(cleanInput)

  // Reserved for future language-specific phoneme rules.
  void language

  return wordList.filter((entry) => {
    const cleanEntry = String(entry || '').trim().toLowerCase()

    // Never display the searched word itself, even if its capitalization differs.
    if (!cleanEntry || cleanEntry === cleanInput) return false

    const entryVowels = extractVowelSequence(cleanEntry).join('-')
    const entryEnding = extractEndingFromLastVowel(cleanEntry)

    switch (rhymeType) {
      case 'vowel':
        return inputVowels.length > 0 && inputVowels === entryVowels

      case 'consonant':
        return inputEnding.length > 0 && inputEnding === entryEnding

      case 'vowel_ending':
        return (
          inputVowels.length > 0 &&
          inputVowels === entryVowels &&
          inputEnding.length > 0 &&
          inputEnding === entryEnding
        )

      default:
        return false
    }
  })
}
