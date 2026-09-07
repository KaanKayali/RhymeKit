import { useMemo, useState } from 'react'

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

export default function RightPanel({ results, hasSearchTerm, selectedWords, onSelectedWordsChange, panelHeight }) {
  const [sortMode, setSortMode] = useState('newest')
  const sortedResults = useMemo(() => sortWords(results, sortMode), [results, sortMode])

  const toggleWordSelection = (word) => {
    onSelectedWordsChange((current) => (
      current.includes(word) ? current.filter((selectedWord) => selectedWord !== word) : [...current, word]
    ))
  }

  return (
    <section className="panel results-panel" aria-label="Reim-Ergebnisse" style={panelHeight ? { height: `${panelHeight}px` } : undefined}>
      <div className="results-heading">
        <h2>Passende Reime</h2>
        <select className="sort-select" id="result-sort" value={sortMode} onChange={(event) => setSortMode(event.target.value)} aria-label="Ergebnisse sortieren">
          <option value="newest">Neuste zuerst</option>
          <option value="oldest">Älteste zuerst</option>
          <option value="length_asc">Kürzeste Wort zuerst</option>
          <option value="length_desc">Längstes Wort zuerst</option>
          <option value="alpha_asc">a - z</option>
          <option value="alpha_desc">z - a</option>
        </select>
      </div>
      <div className="results-list" aria-live="polite">
        {sortedResults.length ? (
          <ul>
            {sortedResults.map((result, index) => (
              <li key={`${result.word}-${index}`} className={`${selectedWords.includes(result.word) ? 'is-selected' : ''} ${result.isCombination ? 'is-combination' : ''}`}>
                <label className="result-row">
                  <input
                    className="result-checkbox"
                    type="checkbox"
                    checked={selectedWords.includes(result.word)}
                    disabled={result.isCombination}
                    onChange={() => toggleWordSelection(result.word)}
                  />
                  <span>{result.word}</span>
                  {result.isCombination && <span className="combination-badge">Kombination</span>}
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">{hasSearchTerm ? 'Keine passenden Einträge gefunden.' : 'Deine Wortliste ist noch leer.'}</p>
        )}
      </div>
      <p className="entry-count">Anzahl Einträge: {sortedResults.length}</p>
    </section>
  )
}
