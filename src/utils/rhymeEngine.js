// Replace or expand this small starter list with your own dictionary data.
export const DEFAULT_WORD_LIST = ['Haus', 'Maus', 'Laus', 'Blau', 'Schlau']

const VOWEL_REGEX = /(au|äu|eu|ei|ai|ie|[aeiouäöü])/gi
const MAX_COMBINATION_RESULTS = 100

export function extractVowelSequence(word, distinguishVowelLength = false) {
  if (!word) return []

  let clean = String(word).toLowerCase()
  clean = clean.replace(/äu/g, 'eu')
  clean = clean.replace(/io/g, 'o')

  if (!distinguishVowelLength) {
    // 1. Collapse double vowels (geminates) and stretching H to single vowel representation
    clean = clean.replace(/aa/g, 'a')
    clean = clean.replace(/ee/g, 'e')
    clean = clean.replace(/oo/g, 'o')

    clean = clean.replace(/ah/g, 'a')
    clean = clean.replace(/eh/g, 'e')
    clean = clean.replace(/oh/g, 'o')
    clean = clean.replace(/uh/g, 'u')
    clean = clean.replace(/ih/g, 'i')

    // 2. Extract true diphthongs and remaining single vowels in exact order
    const matches = clean.match(VOWEL_REGEX)
    return matches ? matches.map((v) => v.toLowerCase()) : []
  }

  // When distinguishVowelLength is true:
  const TOKEN_REGEX = /(au|äu|eu|ei|ai|ie|aa|ee|oo|ah|eh|oh|uh|ih|[aeiouäöü])/gi
  const matches = [...clean.matchAll(TOKEN_REGEX)]
  if (!matches.length) return []

  const results = []
  for (const match of matches) {
    const v = match[0].toLowerCase()
    const matchIndex = match.index

    if (['ei', 'ai', 'au', 'eu', 'äu', 'ie'].includes(v)) {
      results.push(v)
    } else if (['aa', 'ah'].includes(v)) {
      results.push('a:long')
    } else if (['ee', 'eh'].includes(v)) {
      results.push('e:long')
    } else if (['oo', 'oh'].includes(v)) {
      results.push('o:long')
    } else if (v === 'uh') {
      results.push('u:long')
    } else if (v === 'ih') {
      results.push('i:long')
    } else {
      const afterVowel = clean.slice(matchIndex + v.length)
      const consonantMatch = afterVowel.match(/^[bcdfghjklmnpqrstvwxyz]+/i)
      const consonantCount = consonantMatch ? consonantMatch[0].length : 0

      if (consonantCount >= 2) {
        results.push(`${v}:short`)
      } else {
        results.push(`${v}:long`)
      }
    }
  }

  return results
}

export function extractEndingFromLastVowel(word) {
  if (!word) return ''

  let cleanWord = String(word).toLowerCase()
  cleanWord = cleanWord.replace(/äu/g, 'eu')
  cleanWord = cleanWord.replace(/io/g, 'o')
  cleanWord = cleanWord.replace(/aa/g, 'a')
  cleanWord = cleanWord.replace(/ee/g, 'e')
  cleanWord = cleanWord.replace(/oo/g, 'o')

  cleanWord = cleanWord.replace(/ah/g, 'a')
  cleanWord = cleanWord.replace(/eh/g, 'e')
  cleanWord = cleanWord.replace(/oh/g, 'o')
  cleanWord = cleanWord.replace(/uh/g, 'u')
  cleanWord = cleanWord.replace(/ih/g, 'i')

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

function vowelsAreCompatible(firstVowel, secondVowel, vowelTolerance, treatIAsIe, allowTolerance = true) {
  const [firstBase, firstTag] = firstVowel.split(':')
  const [secondBase, secondTag] = secondVowel.split(':')
  if (firstTag !== secondTag) return false
  if (firstBase === secondBase) return true
  if (treatIAsIe && ((firstBase === 'i' && secondBase === 'ie') || (firstBase === 'ie' && secondBase === 'i'))) return true
  if (!vowelTolerance || !allowTolerance) return false

  return (firstBase === 'e' && (secondBase === 'i' || secondBase === 'ä'))
    || (secondBase === 'e' && (firstBase === 'i' || firstBase === 'ä'))
    || ((firstBase === 'u' && secondBase === 'o') || (firstBase === 'o' && secondBase === 'u'))
}

function vowelSequencesMatch(firstSequence, secondSequence, vowelTolerance, treatIAsIe, strictLastSyllable = false) {
  return firstSequence.length === secondSequence.length
    && firstSequence.every((vowel, index) => vowelsAreCompatible(
      vowel,
      secondSequence[index],
      vowelTolerance,
      treatIAsIe,
      !strictLastSyllable || index < firstSequence.length - 1,
    ))
}

function preparePhoneticWord(word, language, treatErAsA, normalizeUmlauts, normalizeAnglicisms) {
  const withAnglicismsNormalized = language === 'de' && normalizeAnglicisms
    ? normalizeAnglicismPhonetics(word)
    : word
  const withUmlautsNormalized = language === 'de' && normalizeUmlauts
    ? withAnglicismsNormalized.replace(/ö/g, 'o').replace(/ü/g, 'u')
    : withAnglicismsNormalized
  return applyGermanErRule(withUmlautsNormalized, language, treatErAsA)
}

function vowelKey(word, language, treatErAsA, normalizeUmlauts, vowelTolerance, treatIAsIe, normalizeAnglicisms, distinguishVowelLength) {
  const phoneticWord = preparePhoneticWord(word, language, treatErAsA, normalizeUmlauts, normalizeAnglicisms)
  return extractVowelSequence(phoneticWord, distinguishVowelLength)
}

function toResult(word, isCombination = false) {
  return { word, isCombination }
}

/**
 * Builds two-word results through indexed vowel partitions, avoiding a scan of
 * every possible pair. Only 100 generated combinations are retained.
 */
function findTwoWordCombinations({ uniqueWordList, targetVowels, language, treatErAsA, normalizeUmlauts, vowelTolerance, strictLastSyllable, treatIAsIe, normalizeAnglicisms, distinguishVowelLength }) {
  if (targetVowels.length < 2) return []

  const wordsWithVowels = []
  for (const entry of uniqueWordList) {
    const word = String(entry).trim()
    if (/\s/.test(word)) continue

    const vowels = vowelKey(word.toLowerCase(), language, treatErAsA, normalizeUmlauts, vowelTolerance, treatIAsIe, normalizeAnglicisms, distinguishVowelLength)
    if (vowels.length) wordsWithVowels.push({ word, vowels })
  }

  const combinations = []
  const seenCombinations = new Set()
  for (let splitIndex = 1; splitIndex < targetVowels.length && combinations.length < MAX_COMBINATION_RESULTS; splitIndex += 1) {
    const firstTarget = targetVowels.slice(0, splitIndex)
    const secondTarget = targetVowels.slice(splitIndex)
    const firstWords = wordsWithVowels
      .filter(({ vowels }) => vowelSequencesMatch(vowels, firstTarget, vowelTolerance, treatIAsIe, strictLastSyllable))
    const secondWords = wordsWithVowels
      .filter(({ vowels }) => vowelSequencesMatch(vowels, secondTarget, vowelTolerance, treatIAsIe, strictLastSyllable))

    for (const { word: firstWord } of firstWords) {
      for (const { word: secondWord } of secondWords) {
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
  normalizeUmlauts = false,
  vowelTolerance = false,
  strictLastSyllable = false,
  treatIAsIe = false,
  normalizeAnglicisms = false,
  includeCombinations = false,
  distinguishVowelLength = false,
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

  const phoneticInput = preparePhoneticWord(cleanInput, language, treatErAsA, normalizeUmlauts, normalizeAnglicisms)
  const inputVowels = extractVowelSequence(phoneticInput, distinguishVowelLength)
  const inputEnding = extractEndingFromLastVowel(phoneticInput)

  const directMatches = uniqueWordList.filter((entry) => {
    const cleanEntry = entry.toLowerCase()
    if (cleanEntry === cleanInput) return false

    const phoneticEntry = preparePhoneticWord(cleanEntry, language, treatErAsA, normalizeUmlauts, normalizeAnglicisms)
    const entryVowels = extractVowelSequence(phoneticEntry, distinguishVowelLength)
    const entryEnding = extractEndingFromLastVowel(phoneticEntry)

    switch (rhymeType) {
      case 'vowel':
        return inputVowels.length > 0 && vowelSequencesMatch(inputVowels, entryVowels, vowelTolerance, treatIAsIe, strictLastSyllable)
      case 'consonant':
        return inputEnding.length > 0 && inputEnding === entryEnding
      case 'vowel_ending':
        return inputVowels.length > 0 && vowelSequencesMatch(inputVowels, entryVowels, vowelTolerance, treatIAsIe, strictLastSyllable) && inputEnding.length > 0 && inputEnding === entryEnding
      case 'frame_vowel':
        return inputVowels.length > 0 && entryVowels.length > 0 && inputVowels.length === entryVowels.length
          && vowelsAreCompatible(inputVowels[0], entryVowels[0], vowelTolerance, treatIAsIe)
          && vowelsAreCompatible(inputVowels.at(-1), entryVowels.at(-1), vowelTolerance, treatIAsIe, !strictLastSyllable)
      default:
        return false
    }
  }).map((entry) => toResult(entry))

  if (!includeCombinations) return directMatches

  return [
    ...directMatches,
    ...findTwoWordCombinations({ uniqueWordList, targetVowels: inputVowels, language, treatErAsA, normalizeUmlauts, vowelTolerance, strictLastSyllable, treatIAsIe, normalizeAnglicisms, distinguishVowelLength }),
  ]
}
