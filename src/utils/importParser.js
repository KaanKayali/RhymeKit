const LETTERS = /\p{L}/gu
const GERMAN_VOWEL = /[aeiouäöü]/i

const DELIMITER_MAP = {
  newline: '\\r\\n',
  space: '\\s',
  comma: ',',
  dot: '\\.',
  dash: '\\-',
  question: '\\?',
  ampersand: '&',
  percent: '%',
  angleBrackets: '<>',
  slashPipe: '\\/\\|',
  semicolonColon: ';:',
  plusStarHash: '\\+\\*#',
}

const comparisonKey = (entry) => entry.toLocaleLowerCase('de-DE')

export function isImportableWord(entry) {
  const letters = String(entry || '').match(LETTERS) || []
  return letters.length > 1 && letters.some((letter) => GERMAN_VOWEL.test(letter))
}

function cleanPhrase(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function cleanWord(value) {
  return String(value || '').trim()
}

/**
 * Converts raw imported text into entries.
 * Parenthesized text ((...)) remains one protected entry regardless of active delimiters.
 * Remaining text is split by user-selected active delimiters.
 */
export function extractEntries(rawText, selectedDelimiters = ['newline', 'space']) {
  const activeKeys = Array.isArray(selectedDelimiters) && selectedDelimiters.length > 0
    ? selectedDelimiters
    : ['newline', 'space']

  const delimiterPattern = activeKeys.map((key) => DELIMITER_MAP[key] || '').join('')
  const escapedPattern = delimiterPattern || '\\s\\r\\n'

  const regex = new RegExp(`\\(([^)]+)\\)|([^${escapedPattern}]+)`, 'g')
  const entries = []
  const matches = String(rawText).matchAll(regex)

  for (const match of matches) {
    if (match[1] !== undefined) {
      // Step 1: Parenthesized expression -> extract intact phrase without outer parens
      const cleaned = cleanPhrase(match[1])
      if (cleaned) entries.push(cleaned)
    } else if (match[2] !== undefined) {
      // Step 2: Remaining text -> split by active delimiters
      const cleaned = cleanWord(match[2])
      if (cleaned) entries.push(cleaned)
    }
  }

  return entries
}

/**
 * Filters incoming entries against the active word list and the current batch.
 */
export function prepareImport(rawText, existingWordList, selectedDelimiters = ['newline', 'space']) {
  const knownEntries = new Set(existingWordList.map(comparisonKey))
  const entriesToAdd = []
  let skippedDuplicatesCount = 0
  let skippedInvalidCount = 0

  for (const entry of extractEntries(rawText, selectedDelimiters)) {
    if (!isImportableWord(entry)) {
      skippedInvalidCount += 1
      continue
    }

    const key = comparisonKey(entry)
    if (knownEntries.has(key)) {
      skippedDuplicatesCount += 1
      continue
    }

    knownEntries.add(key)
    entriesToAdd.push(entry)
  }

  return {
    entriesToAdd,
    addedCount: entriesToAdd.length,
    skippedDuplicatesCount,
    skippedInvalidCount,
  }
}
