import curatedLoanwords from './englishLoanwords.json' with { type: 'json' }

const PRESET_VOWEL_REGEX = /(au|äu|eu|ei|ai|ie|[aeiouäöü])/gi

function derivePresetVowels(word) {
  const normalizedWord = String(word || '').toLowerCase()
    .replace(/äu/g, 'eu')
    .replace(/io/g, 'o')
    .replace(/aa/g, 'a|')
    .replace(/ee/g, 'e|')
    .replace(/oo/g, 'o|')
    .replace(/ah/g, 'a|')
    .replace(/eh/g, 'e|')
    .replace(/oh/g, 'o|')
    .replace(/uh/g, 'u|')
    .replace(/ih/g, 'i|')
    .replace(/y(?=$|[^aeiouäöü])/g, 'ei')

  return normalizedWord.split('|').flatMap((part) => (
    part.match(PRESET_VOWEL_REGEX)?.map((vowel) => vowel.toLowerCase()) || []
  ))
}

export const ENGLISH_LOANWORDS = new Proxy(Object.freeze(curatedLoanwords), {
  get(target, property) {
    if (typeof property !== 'string') return target[property]
    if (Object.prototype.hasOwnProperty.call(target, property)) return target[property]

    const derivedVowels = derivePresetVowels(property)
    return derivedVowels.length ? derivedVowels : undefined
  },
})
