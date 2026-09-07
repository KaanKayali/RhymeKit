import { useEffect, useState } from 'react'

const GERMAN_VOWEL_AT_END = /[aeiouäöü]$/i

/**
 * Delays a value only when its final character is a German vowel.
 * A new keystroke clears the pending vowel delay automatically.
 */
export function useVowelDebounce(value, delay = 1000) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    if (!GERMAN_VOWEL_AT_END.test(value)) {
      setDebouncedValue(value)
      return undefined
    }

    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timeoutId)
  }, [value, delay])

  return debouncedValue
}
