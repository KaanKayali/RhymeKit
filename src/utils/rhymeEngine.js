// Replace or expand this small starter list with your own dictionary data.
export const DEFAULT_WORD_LIST = ['Haus', 'Maus', 'Laus', 'Blau', 'Schlau']

const VOWEL_REGEX = /(au|äu|eu|ei|ai|ie|[aeiouäöü])/gi
const MAX_COMBINATION_RESULTS = 100

export function extractVowelSequence(word) {
  return String(word || '').toLowerCase().match(VOWEL_REGEX) || []
}

export function extractEndingFromLastVowel(word) {
  const cleanWord = String(word || '').toLowerCase()
  const vowelMatches = [...cleanWord.matchAll(VOWEL_REGEX)]
  const lastVowel = vowelMatches.at(-1)
  return lastVowel?.index === undefined ? '' : cleanWord.slice(lastVowel.index)
}

function applyGermanErRule(word, language, treatErAsA) {
  if (language !== 'de' || !treatErAsA) return word
  return word.replace(/er(?=\s|$)/g, 'a')
}

export function normalizeAnglicismPhonetics(word) {
  let normalizedWord = String(word || '').toLowerCase()
  normalizedWord = normalizedWord.replace(/ea/g, 'ie')
  normalizedWord = normalizedWord.replace(/ee/g, 'ie')
  normalizedWord = normalizedWord.replace(/oo/g, 'u')
  normalizedWord = normalizedWord.replace(/(ou|ow)/g, 'au')
  normalizedWord = normalizedWord.replace(/igh/g, 'ei')
  normalizedWord = normalizedWord.replace(/y(?=$|[^aeiouäöü])/g, 'ei')
  return normalizedWord
}

function normalizeVowels(vowels, vowelTolerance, treatIAsIe) {
  return vowels.map((vowel) => {
    // When both options are active, the linked groups form one equivalence set.
    if (vowelTolerance && (vowel === 'e' || vowel === 'i' || vowel === 'ä' || (treatIAsIe && vowel === 'ie'))) return 'E'
    if (treatIAsIe && (vowel === 'i' || vowel === 'ie')) return 'I'
    if (vowelTolerance && (vowel === 'u' || vowel === 'o')) return 'O'
    return vowel
  })
}

function preparePhoneticWord(word, language, treatErAsA, normalizeAnglicisms) {
  const withAnglicismsNormalized = language === 'de' && normalizeAnglicisms
    ? normalizeAnglicismPhonetics(word)
    : word
  return applyGermanErRule(withAnglicismsNormalized, language, treatErAsA)
}

function vowelKey(word, language, treatErAsA, vowelTolerance, treatIAsIe, normalizeAnglicisms) {
  const phoneticWord = preparePhoneticWord(word, language, treatErAsA, normalizeAnglicisms)
  return normalizeVowels(extractVowelSequence(phoneticWord), vowelTolerance, treatIAsIe)
}

function toResult(word, isCombination = false) {
  return { word, isCombination }
}

/**
 * Builds two-word results through indexed vowel partitions, avoiding a scan of
 * every possible pair. Only 100 generated combinations are retained.
 */
function findTwoWordCombinations({ uniqueWordList, targetVowels, language, treatErAsA, vowelTolerance, treatIAsIe, normalizeAnglicisms }) {
  if (targetVowels.length < 2) return []

  const wordsByVowelKey = new Map()
  for (const entry of uniqueWordList) {
    const word = String(entry).trim()
    if (/\s/.test(word)) continue

    const key = vowelKey(word.toLowerCase(), language, treatErAsA, vowelTolerance, treatIAsIe, normalizeAnglicisms).join('-')
    if (!key) continue
    const matches = wordsByVowelKey.get(key) || []
    matches.push(word)
    wordsByVowelKey.set(key, matches)
  }

  const combinations = []
  const seenCombinations = new Set()
  for (let splitIndex = 1; splitIndex < targetVowels.length && combinations.length < MAX_COMBINATION_RESULTS; splitIndex += 1) {
    const firstWords = wordsByVowelKey.get(targetVowels.slice(0, splitIndex).join('-')) || []
    const secondWords = wordsByVowelKey.get(targetVowels.slice(splitIndex).join('-')) || []

    for (const firstWord of firstWords) {
      for (const secondWord of secondWords) {
        const combination = `${firstWord} ${secondWord}`
        const comparisonKey = combination.toLowerCase()
        if (!seenCombinations.has(comparisonKey)) {
          seenCombinations.add(comparisonKey)
          combinations.push(toResult(combination, true))
        }
        if (combinations.length >= MAX_COMBINATION_RESULTS) return combinations
      }
    }
  }

  return combinations
}

/**
 * Browser-only rhyme solver. It preserves a dictionary word's casing for UI
 * rendering while carrying metadata for generated two-word combinations.
 */
export function findRhymes({
  searchTerm,
  rhymeType,
  language,
  wordList,
  treatErAsA = false,
  vowelTolerance = false,
  treatIAsIe = false,
  normalizeAnglicisms = false,
  includeCombinations = false,
}) {
  if (!wordList) return []

  const uniqueWordList = []
  const seenEntries = new Set()
  for (const entry of wordList) {
    const cleanEntry = String(entry || '').trim().toLowerCase()
    if (cleanEntry && !seenEntries.has(cleanEntry)) {
      seenEntries.add(cleanEntry)
      uniqueWordList.push(String(entry).trim())
    }
  }

  const cleanInput = String(searchTerm || '').trim().toLowerCase()
  if (!cleanInput) return uniqueWordList.map((entry) => toResult(entry))

  const phoneticInput = preparePhoneticWord(cleanInput, language, treatErAsA, normalizeAnglicisms)
  const inputVowels = normalizeVowels(extractVowelSequence(phoneticInput), vowelTolerance, treatIAsIe)
  const inputVowelKey = inputVowels.join('-')
  const inputEnding = extractEndingFromLastVowel(phoneticInput)

  const directMatches = uniqueWordList.filter((entry) => {
    const cleanEntry = entry.toLowerCase()
    if (cleanEntry === cleanInput) return false

    const phoneticEntry = preparePhoneticWord(cleanEntry, language, treatErAsA, normalizeAnglicisms)
    const entryVowels = normalizeVowels(extractVowelSequence(phoneticEntry), vowelTolerance, treatIAsIe)
    const entryVowelKey = entryVowels.join('-')
    const entryEnding = extractEndingFromLastVowel(phoneticEntry)

    switch (rhymeType) {
      case 'vowel':
        return inputVowelKey.length > 0 && inputVowelKey === entryVowelKey
      case 'consonant':
        return inputEnding.length > 0 && inputEnding === entryEnding
      case 'vowel_ending':
        return inputVowelKey.length > 0 && inputVowelKey === entryVowelKey && inputEnding.length > 0 && inputEnding === entryEnding
      case 'frame_vowel':
        return inputVowels.length > 0 && entryVowels.length > 0 && inputVowels.length === entryVowels.length && inputVowels[0] === entryVowels[0] && inputVowels.at(-1) === entryVowels.at(-1)
      default:
        return false
    }
  }).map((entry) => toResult(entry))

  if (!includeCombinations) return directMatches

  return [
    ...directMatches,
    ...findTwoWordCombinations({ uniqueWordList, targetVowels: inputVowels, language, treatErAsA, vowelTolerance, treatIAsIe, normalizeAnglicisms }),
  ]
}
