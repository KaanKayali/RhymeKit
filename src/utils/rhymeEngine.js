// Replace or expand this small starter list with your own dictionary data.
export const DEFAULT_WORD_LIST = ['Haus', 'Maus', 'Laus', 'Blau', 'Schlau']

const normalized = (word) => word.trim().toLocaleLowerCase('de-DE')

/**
 * Browser-only rhyme solver. Keep dictionary and phoneme logic in this module
 * so the UI stays independent of the way you choose to match words.
 */
export function findRhymes({ searchTerm, rhymeType, language, wordList }) {
  const term = normalized(searchTerm || '')
  const uniqueWords = [...new Set(wordList.map((word) => word.trim()).filter(Boolean))]
  // An empty search is useful as a compact view of the complete active list.
  if (!term) return uniqueWords

  // `language` is intentionally passed through for future language-specific rules.
  void language

  switch (rhymeType) {
    case 'vowel':
      // TODO: Add vowel-rhyme / assonance matching and German phoneme rules here.
      return uniqueWords.filter((word) => normalized(word).at(-1) === term.at(-1))

    case 'perfect':
      // TODO: Replace this suffix comparison with a dictionary/phoneme perfect-rhyme rule.
      return uniqueWords.filter((word) => {
        const candidate = normalized(word)
        const suffixLength = Math.min(2, term.length, candidate.length)
        return candidate !== term && candidate.slice(-suffixLength) === term.slice(-suffixLength)
      })

    case 'end':
      // TODO: Add your end-rhyme matching strategy here.
      return uniqueWords.filter((word) => normalized(word).endsWith(term.slice(-1)))

    default:
      return []
  }
}
