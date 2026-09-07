import { useEffect, useRef, useState } from 'react'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { prepareImport } from '../utils/importParser'

GlobalWorkerOptions.workerSrc = pdfWorkerUrl

export default function LeftPanel({
  searchTerm,
  onSearchTermChange,
  rhymeType,
  onRhymeTypeChange,
  language,
  onLanguageChange,
  settings,
  onSettingChange,
  onAddWords,
  onClearList,
  existingWords,
}) {
  const fileInputRef = useRef(null)
  const [fileMessage, setFileMessage] = useState('')
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [importState, setImportState] = useState(null)

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setShowDeleteConfirmation(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  const readTextFile = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Die Datei konnte nicht gelesen werden.'))
    reader.readAsText(file)
  })

  const readPdfFile = async (file, setProgress) => {
    const fileBuffer = await file.arrayBuffer()
    const pdf = await getDocument({ data: new Uint8Array(fileBuffer) }).promise
    const pages = []

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      const content = await page.getTextContent()
      pages.push(content.items.map((item) => item.str).join(' '))
      setProgress(Math.round(20 + (pageNumber / pdf.numPages) * 45))
    }

    return pages.join('\n')
  }

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    event.target.value = ''

    const updateProgress = (progressPercent, status) => setImportState((current) => ({ ...current, progressPercent, status }))
    setFileMessage('')
    setImportState({ phase: 'loading', progressPercent: 5, status: 'Datei wird gelesen …' })

    try {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      const rawText = isPdf
        ? await readPdfFile(file, (progressPercent) => updateProgress(progressPercent, 'PDF-Text wird extrahiert …'))
        : await readTextFile(file)

      updateProgress(72, 'Phrasen werden extrahiert …')
      await new Promise((resolve) => window.setTimeout(resolve, 120))
      updateProgress(87, 'Einträge werden auf Duplikate geprüft …')
      const result = prepareImport(rawText, existingWords)
      onAddWords(result.entriesToAdd)
      setImportState({ phase: 'summary', progressPercent: 100, ...result })
    } catch (error) {
      setImportState({
        phase: 'error',
        message: error instanceof Error ? error.message : 'Der Import ist fehlgeschlagen.',
      })
    }
  }

  return (
    <section className="panel controls-panel" aria-label="Reim-Einstellungen">
      <label className="field-label" htmlFor="search-word">Suchwort</label>
      <input
        id="search-word"
        className="text-input"
        type="text"
        value={searchTerm}
        onChange={(event) => onSearchTermChange(event.target.value)}
        placeholder="Wort eingeben …"
        autoComplete="off"
      />
      <p className="search-hint">Gib ein Suchwort ein, um Reime zu finden.</p>

      <div className="checkbox-group">
        <label className="checkbox-label">
          <input type="checkbox" checked={settings.perfectRhymes} onChange={(e) => onSettingChange('perfectRhymes', e.target.checked)} />
          Perfekte Reime
        </label>
        <label className="checkbox-label">
          <input type="checkbox" checked={settings.additionalWords} onChange={(e) => onSettingChange('additionalWords', e.target.checked)} />
          Zusätzliche Wörter
        </label>
      </div>

      <label className="field-label" htmlFor="rhyme-mode">Reimmodus</label>
      <select id="rhyme-mode" value={rhymeType} onChange={(event) => onRhymeTypeChange(event.target.value)}>
        <option value="vowel">Vokalreim</option>
        <option value="consonant">Konsonantenreim / Endung</option>
        <option value="vowel_ending">Vokalreim + Endung</option>
      </select>

      <label className="field-label" htmlFor="language">Sprache</label>
      <select id="language" value={language} onChange={(event) => onLanguageChange(event.target.value)}>
        <option value="de">Deutsch</option>
      </select>

      <input ref={fileInputRef} className="visually-hidden" type="file" accept=".txt,.pdf,text/plain,application/pdf" onChange={handleFile} />
      <div className="button-stack">
        <button className="button button-primary" type="button" onClick={() => fileInputRef.current?.click()}>
          Liste hinzufügen (txt/PDF)
        </button>
        <button
          className="button button-outline"
          type="button"
          onClick={() => setShowDeleteConfirmation(true)}
        >
          Liste löschen
        </button>
      </div>
      {fileMessage && <p className="file-message" role="status">{fileMessage}</p>}

      {showDeleteConfirmation && (
        <div className="modal-backdrop" role="presentation">
          <section className="delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-list-title" aria-describedby="delete-list-description">
            <h2 id="delete-list-title">Liste löschen?</h2>
            <p id="delete-list-description">Möchtest du die gesamte Wortliste wirklich löschen? Dieser Schritt kann nicht rückgängig gemacht werden.</p>
            <div className="modal-actions">
              <button className="button button-outline" type="button" onClick={() => setShowDeleteConfirmation(false)}>Abbrechen</button>
              <button
                className="button button-danger"
                type="button"
                autoFocus
                onClick={() => {
                  onClearList()
                  setFileMessage('Wortliste gelöscht.')
                  setShowDeleteConfirmation(false)
                }}
              >
                Liste löschen
              </button>
            </div>
          </section>
        </div>
      )}

      {importState && (
        <div className="modal-backdrop" role="presentation">
          {importState.phase === 'loading' ? (
            <section className="import-modal" role="dialog" aria-modal="true" aria-labelledby="import-progress-title">
              <h2 id="import-progress-title">Liste wird importiert</h2>
              <p>{importState.status}</p>
              <div className="progress-track" aria-label={`${importState.progressPercent}% abgeschlossen`}>
                <div className="progress-bar" style={{ width: `${importState.progressPercent}%` }} />
              </div>
              <strong className="progress-label">{importState.progressPercent}%</strong>
            </section>
          ) : (
            <section className="import-modal" role="dialog" aria-modal="true" aria-labelledby="import-result-title">
              <h2 id="import-result-title">{importState.phase === 'summary' ? 'Import Successful' : 'Import fehlgeschlagen'}</h2>
              {importState.phase === 'summary' ? (
                <div className="import-metrics">
                  <p><strong>{importState.addedCount}</strong> neue Einträge hinzugefügt.</p>
                  <p><strong>{importState.skippedDuplicatesCount}</strong> doppelte Einträge übersprungen.</p>
                </div>
              ) : <p>{importState.message}</p>}
              <div className="modal-actions">
                <button className="button button-primary" type="button" autoFocus onClick={() => setImportState(null)}>Fertig</button>
              </div>
            </section>
          )}
        </div>
      )}
    </section>
  )
}
