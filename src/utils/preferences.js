const PREFERENCES_STORAGE_KEY = 'rhymekit_preferences'

export const DEFAULT_SETTINGS = {
  vowelTolerance: false,
  additionalWords: false,
  treatErAsA: false,
  treatIAsIe: false,
  normalizeAnglicisms: false,
}

const RHYME_TYPES = new Set(['vowel', 'consonant', 'vowel_ending', 'frame_vowel'])
const LANGUAGES = new Set(['de'])
const SORT_MODES = new Set(['newest', 'oldest', 'length_asc', 'length_desc', 'alpha_asc', 'alpha_desc'])

export const DEFAULT_PREFERENCES = {
  rhymeType: 'vowel',
  language: 'de',
  sortMode: 'newest',
  settings: DEFAULT_SETTINGS,
}

function isBoolean(value) {
  return typeof value === 'boolean'
}

export function loadPreferences() {
  try {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES
    const rawPreferences = window.localStorage.getItem(PREFERENCES_STORAGE_KEY)
    if (!rawPreferences) return DEFAULT_PREFERENCES

    const parsedPreferences = JSON.parse(rawPreferences)
    const settings = parsedPreferences?.settings && typeof parsedPreferences.settings === 'object'
      ? parsedPreferences.settings
      : {}

    return {
      rhymeType: RHYME_TYPES.has(parsedPreferences.rhymeType) ? parsedPreferences.rhymeType : DEFAULT_PREFERENCES.rhymeType,
      language: LANGUAGES.has(parsedPreferences.language) ? parsedPreferences.language : DEFAULT_PREFERENCES.language,
      sortMode: SORT_MODES.has(parsedPreferences.sortMode) ? parsedPreferences.sortMode : DEFAULT_PREFERENCES.sortMode,
      settings: {
        vowelTolerance: isBoolean(settings.vowelTolerance) ? settings.vowelTolerance : DEFAULT_SETTINGS.vowelTolerance,
        additionalWords: isBoolean(settings.additionalWords) ? settings.additionalWords : DEFAULT_SETTINGS.additionalWords,
        treatErAsA: isBoolean(settings.treatErAsA) ? settings.treatErAsA : DEFAULT_SETTINGS.treatErAsA,
        treatIAsIe: isBoolean(settings.treatIAsIe) ? settings.treatIAsIe : DEFAULT_SETTINGS.treatIAsIe,
        normalizeAnglicisms: isBoolean(settings.normalizeAnglicisms) ? settings.normalizeAnglicisms : DEFAULT_SETTINGS.normalizeAnglicisms,
      },
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export function savePreferences(preferences) {
  try {
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    // The app remains usable when browser storage is unavailable.
  }
}
