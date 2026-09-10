import { useEffect, useMemo, useState } from 'react'
import { jsPDF } from 'jspdf'
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

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function exportWordList(entries, format) {
  const content = entries.map((entry) => (typeof entry === 'string' ? entry : entry.word)).join('\n')
  if (format === 'pdf') {
    const documentPdf = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageWidth = documentPdf.internal.pageSize.getWidth()
    const pageHeight = documentPdf.internal.pageSize.getHeight()
    const leftMargin = 48
    const lineHeight = 18
    let y = 54

    documentPdf.setFontSize(16)
    documentPdf.text('RhymeKit - Export', leftMargin, y)
    y += 28
    documentPdf.setFontSize(11)

    for (const entry of content.split('\n')) {
      if (y > pageHeight - 48) {
        documentPdf.addPage()
        y = 54
      }
      const lines = documentPdf.splitTextToSize(entry, pageWidth - leftMargin * 2)
      documentPdf.text(lines, leftMargin, y)
      y += Math.max(lineHeight, lines.length * lineHeight)
    }

    documentPdf.save('rhymekit-liste.pdf')
    return
  }

  downloadBlob(new Blob([content], { type: 'text/plain;charset=utf-8' }), 'rhymekit-liste.txt')
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
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportFormat, setExportFormat] = useState('txt')
  const sortedResults = useMemo(() => sortWords(results, sortMode), [results, sortMode])

  useEffect(() => {
    if (!showExportDialog) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setShowExportDialog(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [showExportDialog])

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
            title="Exportformat für die aktuelle Liste wählen"
            aria-label="Exportformat für die aktuelle Liste wählen"
            disabled={sortedResults.length === 0}
            onClick={() => setShowExportDialog(true)}
          >
            <svg className="export-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M7.5 11.5 12 16l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 19h14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
          <select
            className="sort-select"
            id="result-sort"
            value={sortMode}
            onChange={(event) => onSortModeChange(event.target.value)}
            aria-label="Ergebnisse sortieren"
            title="Ändere die Sortierung der angezeigten Reime (z. B. Neuste zuerst, Kürzeste Wort zuerst)."
          >
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

      {showExportDialog && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="export-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-modal-title"
            aria-describedby="export-modal-description"
          >
            <h2 id="export-modal-title">Liste herunterladen</h2>
            <p id="export-modal-description">
              Exportiert die aktuell angezeigten {sortedResults.length} Einträge in der gewählten Reihenfolge.
            </p>
            <fieldset className="export-format-options">
              <legend>Format wählen</legend>
              <label className="export-format-option">
                <input type="radio" name="export-format" value="txt" checked={exportFormat === 'txt'} onChange={() => setExportFormat('txt')} />
                <span><strong>TXT</strong><small>Eine einfache Textdatei mit einem Eintrag pro Zeile.</small></span>
              </label>
              <label className="export-format-option">
                <input type="radio" name="export-format" value="pdf" checked={exportFormat === 'pdf'} onChange={() => setExportFormat('pdf')} />
                <span><strong>PDF</strong><small>Eine druckfreundliche Datei mit der aktuellen Eintragsliste.</small></span>
              </label>
            </fieldset>
            <div className="modal-actions">
              <button className="button button-outline" type="button" onClick={() => setShowExportDialog(false)}>Abbrechen</button>
              <button
                className="button button-primary"
                type="button"
                autoFocus
                onClick={() => {
                  exportWordList(sortedResults, exportFormat)
                  setShowExportDialog(false)
                }}
              >
                Herunterladen
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
