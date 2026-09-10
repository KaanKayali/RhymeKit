import { useEffect, useRef, useState } from 'react'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { prepareImport } from '../utils/importParser'
import ImportOptionsModal from './ImportOptionsModal'
import InfoTooltip from './InfoTooltip'

GlobalWorkerOptions.workerSrc = pdfWorkerUrl

export default function LeftPanel({
  panelRef,
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
  selectedWords,
  onDeleteSelection,
}) {
  const fileInputRef = useRef(null)
  const [fileMessage, setFileMessage] = useState('')
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [importState, setImportState] = useState(null)
  const [pendingFiles, setPendingFiles] = useState(null)

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

  const readPdfFile = async (file, onPageProgress) => {
    const fileBuffer = await file.arrayBuffer()
    const pdf = await getDocument({ data: new Uint8Array(fileBuffer) }).promise
    const pages = []

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      const content = await page.getTextContent()
      pages.push(content.items.map((item) => item.str).join(' '))
      onPageProgress(pageNumber / pdf.numPages)
    }

    return pages.join('\n')
  }

  const handleFileSelect = (event) => {
    const files = [...(event.target.files || [])]
    if (!files.length) return
    event.target.value = ''
    setPendingFiles(files)
  }

  const executeImport = async (selectedDelimiters) => {
    const files = pendingFiles
    setPendingFiles(null)
    if (!files || !files.length) return

    const updateProgress = (progressPercent, status) => setImportState((current) => ({ ...current, progressPercent, status }))
    setFileMessage('')
    setImportState({ phase: 'loading', progressPercent: 0, status: 'Dateien werden vorbereitet …' })

    try {
      const rawTexts = []

      for (const [index, file] of files.entries()) {
        const fileStart = Math.round((index / files.length) * 70)
        const fileEnd = Math.round(((index + 1) / files.length) * 70)
        updateProgress(fileStart, `Datei ${index + 1} von ${files.length} wird gelesen …`)

        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
        const rawText = isPdf
          ? await readPdfFile(file, (pageFraction) => updateProgress(
            Math.round(fileStart + (fileEnd - fileStart) * pageFraction),
            `PDF ${index + 1} von ${files.length} wird extrahiert …`,
          ))
          : await readTextFile(file)

        rawTexts.push(rawText)
        updateProgress(fileEnd, `Datei ${index + 1} von ${files.length} verarbeitet …`)
      }

      updateProgress(72, 'Phrasen werden extrahiert …')
      await new Promise((resolve) => window.setTimeout(resolve, 120))
      updateProgress(87, 'Einträge werden auf Duplikate geprüft …')
      const result = prepareImport(rawTexts.join('\n'), existingWords, selectedDelimiters)
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
    <section ref={panelRef} className="panel controls-panel" aria-label="Reim-Einstellungen">
      <label className="field-label" htmlFor="search-word">Suchwort</label>
      <input
        id="search-word"
        className="text-input"
        type="text"
        value={searchTerm}
        onChange={(event) => onSearchTermChange(event.target.value)}
        placeholder="Wort eingeben …"
        autoComplete="off"
        title="Gib ein Wort ein, um passende Reime aus deiner Liste zu finden."
      />
      <p className="search-hint">Gib ein Suchwort ein, um Reime zu finden.</p>

      {language === 'de' && (
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input type="checkbox" checked={settings.vowelTolerance} onChange={(e) => onSettingChange('vowelTolerance', e.target.checked)} />
            <span>Vokal-Toleranz (e mit i/ä, u mit o)</span>
            <InfoTooltip text="Gleicht ungleiche Vokale an, die phonetisch ähnlich klingen (z. B. 'Wenden', 'Winden', 'Wänden')." />
          </label>
          <label className="checkbox-label checkbox-suboption">
            <input
              type="checkbox"
              checked={settings.strictLastSyllable}
              disabled={!settings.vowelTolerance}
              onChange={(e) => onSettingChange('strictLastSyllable', e.target.checked)}
            />
            <span>Letzte Silbe von der Vokal-Toleranz ausnehmen</span>
            <InfoTooltip text="Die letzte Vokal-Silbe jedes Wortes muss exakt übereinstimmen; die Vokal-Toleranz bleibt für frühere Silben aktiv." />
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={settings.treatIAsIe} onChange={(e) => onSettingChange('treatIAsIe', e.target.checked)} />
            <span>"i" = "ie" gleichbehandeln</span>
            <InfoTooltip text="Behandelt kurzes 'i' und langes 'ie' als identischen Vokal (z. B. 'Lid' = 'Lied')." />
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={settings.treatErAsA} onChange={(e) => onSettingChange('treatErAsA', e.target.checked)} />
            <span>"er"-Endung als "a" Vokal behandeln</span>
            <InfoTooltip text="Behandelt auslautendes '-er' phonetisch als 'a' (z. B. 'Mutter' klingt wie 'Mutta')." />
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={settings.distinguishVowelLength} onChange={(e) => onSettingChange('distinguishVowelLength', e.target.checked)} />
            <span>Kurze &amp; lange Vokale unterscheiden</span>
            <InfoTooltip text="Prüft, ob nach einem Vokal 2+ Konsonanten folgen (kurzer Vokal, z. B. 'Doppel' vs. 'Dose')." />
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={settings.normalizeAnglicisms} onChange={(e) => onSettingChange('normalizeAnglicisms', e.target.checked)} />
            <span>Englische Aussprache (Anglizismen) anpassen</span>
            <InfoTooltip text="Wandelt englische Buchstabenfolgen in deutsche Lautschrift um (z. B. 'Team' -> 'Tiem', 'Speed' -> 'Spied')." />
          </label>
          <div className="combination-option">
            <label className="checkbox-label">
              <input type="checkbox" checked={settings.additionalWords} onChange={(e) => onSettingChange('additionalWords', e.target.checked)} />
              <strong>Wort-Kombinationen</strong>
              <span className="option-badge">Neu</span>
              <InfoTooltip text="Sucht nach Kombinationen aus 2 oder 3 Wörtern aus deiner Liste, die zusammen den Reim ergeben." />
            </label>
          </div>
        </div>
      )}

      <label className="field-label" htmlFor="rhyme-mode">Reimmodus</label>
      <select
        id="rhyme-mode"
        value={rhymeType}
        onChange={(event) => onRhymeTypeChange(event.target.value)}
        title="Wähle das Reimschema (z. B. Vokalreim, Konsonantenreim oder Rahmen-Vokalreim)."
      >
        <option value="vowel">Vokalreim</option>
        <option value="consonant">Konsonantenreim / Endung</option>
        <option value="vowel_ending">Vokalreim + Endung</option>
        <option value="frame_vowel">Rahmen-Vokalreim (Erster &amp; Letzter Vokal)</option>
      </select>

      <label className="field-label" htmlFor="language">Sprache</label>
      <select id="language" value={language} onChange={(event) => onLanguageChange(event.target.value)}>
        <option value="de">Deutsch</option>
      </select>

      <input ref={fileInputRef} className="visually-hidden" type="file" multiple accept=".txt,.pdf,text/plain,application/pdf" onChange={handleFileSelect} />
      <div className="button-stack">
        <button
          className="button button-primary"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Mehrere .txt oder .pdf Dateien gleichzeitig auswählen und importieren."
        >
          Liste hinzufügen (txt/PDF)
        </button>
        <div className="button-row">
          <button
            className="button button-outline"
            type="button"
            disabled={existingWords.length === 0}
            title={existingWords.length === 0 ? 'Die Wortliste ist bereits leer.' : 'Löscht die gesamte geladene Wortliste nach Bestätigung (ausgewählte Wörter bleiben erhalten).'}
            onClick={() => setShowDeleteConfirmation(true)}
          >
            Liste löschen
          </button>
          <button
            className="button button-outline"
            type="button"
            disabled={selectedWords.length === 0 || settings.additionalWords}
            title={settings.additionalWords ? 'Die Auswahl kann während der Wort-Kombinationssuche nicht gelöscht werden.' : undefined}
            onClick={() => onDeleteSelection(selectedWords)}
          >
            Auswahl löschen
          </button>
        </div>
      </div>
      {fileMessage && <p className="file-message" role="status">{fileMessage}</p>}

      {pendingFiles && (
        <ImportOptionsModal
          onCancel={() => setPendingFiles(null)}
          onConfirm={executeImport}
        />
      )}

      {showDeleteConfirmation && (
        <div className="modal-backdrop" role="presentation">
          <section className="delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-list-title" aria-describedby="delete-list-description">
            <h2 id="delete-list-title">Liste wirklich löschen?</h2>
            <p id="delete-list-description">Du bist dabei, {existingWords.length} Wörter aus deiner Liste zu löschen. Dieser Vorgang kann nicht rückgängig gemacht werden.</p>
            <div className="modal-actions">
              <button className="button button-outline" type="button" onClick={() => setShowDeleteConfirmation(false)}>Abbrechen</button>
              <button
                className="button button-danger"
                type="button"
                autoFocus
                onClick={() => {
                  onClearList()
                  setShowDeleteConfirmation(false)
                }}
              >
                Löschen
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
                  <p><strong>{importState.addedCount}</strong> neue Einträge insgesamt hinzugefügt.</p>
                  <p><strong>{importState.skippedDuplicatesCount}</strong> Duplikate insgesamt übersprungen.</p>
                  {importState.skippedInvalidCount > 0 && (
                    <p><strong>{importState.skippedInvalidCount}</strong> Einträge übersprungen (zu kurz oder ohne Vokal).</p>
                  )}
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
