import { useMemo } from 'react'
import { extractVowelSequence } from '../utils/rhymeEngine'

export function sortWords(words, sortMode) {
  const sorted = [...words]
  const text = (entry) => (typeof entry === 'string' ? entry : entry.word)

  switch (sortMode) {
    case 'length_asc':
      return sorted.sort((a, b) => text(a).length - text(b).length)
    case 'length_desc':
      return sorted.sort((a, b) => text(b).length - text(a).length)
    case 'alpha_asc':
      return sorted.sort((a, b) => text(a).localeCompare(text(b), 'de', { sensitivity: 'base' }))
    case 'alpha_desc':
      return sorted.sort((a, b) => text(b).localeCompare(text(a), 'de', { sensitivity: 'base' }))
    case 'newest':
      return sorted.reverse()
    case 'oldest':
      return sorted
    case 'default':
    default:
      return sorted.reverse()
  }
}

function exportWordList(entries) {
  const content = entries.map((entry) => (typeof entry === 'string' ? entry : entry.word)).join('\n')
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'rhymekit-liste.txt'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export default function RightPanel({
  results,
  searchTerm = '',
  wordListCount,
  settings,
  selectedWords,
  onSelectedWordsChange,
  panelHeight,
  sortMode,
  onSortModeChange,
}) {
  const sortedResults = useMemo(() => sortWords(results, sortMode), [results, sortMode])

  const trimmedTerm = String(searchTerm || '').trim()
  const hasVowels = useMemo(
    () => Boolean(trimmedTerm) && extractVowelSequence(trimmedTerm, settings?.distinguishVowelLength).length > 0,
    [trimmedTerm, settings?.distinguishVowelLength],
  )
  const isRhymeSearchActive = trimmedTerm !== '' && hasVowels

  const headerLabel = isRhymeSearchActive
    ? `Gefundene Reime: ${sortedResults.length}`
    : `Anzahl Einträge: ${wordListCount ?? sortedResults.length}`

  const toggleWordSelection = (word, isCombination) => {
    if (isCombination) return
    onSelectedWordsChange((current) => (
      current.includes(word) ? current.filter((selectedWord) => selectedWord !== word) : [...current, word]
    ))
  }

  return (
    <section className="panel results-panel" aria-label="Reim-Ergebnisse" style={panelHeight ? { height: `${panelHeight}px` } : undefined}>
      <div className="results-heading">
        <h2>Passende Reime</h2>
        <div className="results-heading-actions">
          <button
            className="export-button"
            type="button"
            title="Liste als TXT-Datei herunterladen (aktuelle Reihenfolge)"
            aria-label="Liste als TXT-Datei herunterladen (aktuelle Reihenfolge)"
            disabled={sortedResults.length === 0}
            onClick={() => exportWordList(sortedResults)}
          >
            <svg className="export-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M7.5 11.5 12 16l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 19h14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
          <select className="sort-select" id="result-sort" value={sortMode} onChange={(event) => onSortModeChange(event.target.value)} aria-label="Ergebnisse sortieren">
            <option value="newest">Neuste zuerst</option>
            <option value="oldest">Älteste zuerst</option>
            <option value="length_asc">Kürzeste Wort zuerst</option>
            <option value="length_desc">Längstes Wort zuerst</option>
            <option value="alpha_asc">a - z</option>
            <option value="alpha_desc">z - a</option>
          </select>
        </div>
      </div>
      <div className="results-list" aria-live="polite">
        {sortedResults.length ? (
          <ul>
            {sortedResults.map((result, index) => (
              <li key={`${result.word}-${index}`} className={`${selectedWords.includes(result.word) ? 'is-selected' : ''} ${result.isCombination ? 'is-combination' : ''}`}>
                <button
                  className="result-row"
                  type="button"
                  disabled={result.isCombination}
                  aria-pressed={selectedWords.includes(result.word)}
                  onClick={() => toggleWordSelection(result.word, result.isCombination)}
                >
                  <span>{result.word}</span>
                  {result.isCombination && <span className="combination-badge">Kombination</span>}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">{isRhymeSearchActive ? 'Keine passenden Einträge gefunden.' : 'Deine Wortliste ist noch leer.'}</p>
        )}
      </div>
      <p className="entry-count">{headerLabel}</p>
    </section>
  )
}
