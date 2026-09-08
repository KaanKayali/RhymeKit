import { useEffect, useState } from 'react'

const GERMAN_VOWEL = /[aeiouäöü]/i
const GERMAN_VOWEL_AT_END = /[aeiouäöü]$/i

/**
 * Commits a search value only after it contains a German vowel.
 * If the last character is a vowel, the commit is delayed so diphthongs can finish.
 * Consonant-only input leaves the previous committed value unchanged.
 */
export function useVowelDebounce(value, delay = 1000) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    if (!String(value).trim()) {
      setDebouncedValue(value)
      return undefined
    }

    if (!GERMAN_VOWEL.test(value)) {
      return undefined
    }

    if (!GERMAN_VOWEL_AT_END.test(value)) {
      setDebouncedValue(value)
      return undefined
    }

    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timeoutId)
  }, [value, delay])

  return debouncedValue
}
