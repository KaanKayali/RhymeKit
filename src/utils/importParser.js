const LETTERS_ONLY = /[^\p{L}]/gu
const PHRASE_CHARACTERS = /[^\p{L}\s]/gu

const comparisonKey = (entry) => entry.toLocaleLowerCase('de-DE')

function cleanPhrase(value) {
  return value.replace(PHRASE_CHARACTERS, '').replace(/\s+/g, ' ').trim()
}

function cleanWord(value) {
  return value.replace(LETTERS_ONLY, '').trim()
}

/**
 * Converts raw imported text into entries. Parenthesized text remains one entry,
 * while every other whitespace-delimited token becomes its own entry.
 */
export function extractEntries(rawText) {
  const entries = []
  const parts = String(rawText).matchAll(/\(([^)]*)\)|([^\s]+)/g)

  for (const match of parts) {
    const entry = match[1] === undefined ? cleanWord(match[2]) : cleanPhrase(match[1])
    if (entry) entries.push(entry)
  }

  return entries
}

/**
 * Filters incoming entries against the active word list and the current batch.
 */
export function prepareImport(rawText, existingWordList) {
  const knownEntries = new Set(existingWordList.map(comparisonKey))
  const entriesToAdd = []
  let skippedDuplicatesCount = 0

  for (const entry of extractEntries(rawText)) {
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
  }
}
