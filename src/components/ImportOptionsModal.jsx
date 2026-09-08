import { useEffect, useState } from 'react'

export const DELIMITER_LIST = [
  { id: 'newline', label: 'ENTER / Zeilenumbruch', defaultChecked: true },
  { id: 'space', label: 'Leertaste (Space)', defaultChecked: true },
  { id: 'comma', label: 'Komma (,)', defaultChecked: false },
  { id: 'dot', label: 'Punkt (.)', defaultChecked: false },
  { id: 'dash', label: 'Bindestrich (-)', defaultChecked: false },
  { id: 'question', label: 'Fragezeichen (?)', defaultChecked: false },
  { id: 'ampersand', label: 'Ampersand (&)', defaultChecked: false },
  { id: 'percent', label: 'Prozent (%)', defaultChecked: false },
  { id: 'angleBrackets', label: 'Spitze Klammern (<, >)', defaultChecked: false },
  { id: 'slashPipe', label: 'Schrägstrich / Pipe (/, |)', defaultChecked: false },
  { id: 'semicolonColon', label: 'Semikolon / Doppelpunkt (;, :)', defaultChecked: false },
  { id: 'plusStarHash', label: 'Plus / Stern / Raute (+, *, #)', defaultChecked: false },
]

export default function ImportOptionsModal({ onCancel, onConfirm }) {
  const [selectedDelimiters, setSelectedDelimiters] = useState(() => (
    DELIMITER_LIST.filter((item) => item.defaultChecked).map((item) => item.id)
  ))

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  const toggleDelimiter = (id) => {
    setSelectedDelimiters((current) => (
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onConfirm(selectedDelimiters)
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="import-options-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-options-title"
        aria-describedby="import-options-description"
      >
        <h2 id="import-options-title">Trennzeichen für Import wählen</h2>
        <p id="import-options-description" className="modal-description">
          Wähle, welche Zeichen als Trennzeichen zum Aufteilen der Texte in einzelne Wörter verwendet werden sollen.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="delimiter-grid">
            {DELIMITER_LIST.map((item) => (
              <label key={item.id} className="checkbox-label delimiter-item">
                <input
                  type="checkbox"
                  checked={selectedDelimiters.includes(item.id)}
                  onChange={() => toggleDelimiter(item.id)}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>

          <div className="parentheses-notice-box" role="note">
            <div className="notice-header">
              <svg className="notice-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <strong>Hinweis zur Klammerung:</strong>
            </div>
            <p>
              Wörter oder Ausdrücke in Klammern <code>(...)</code> werden <strong>IMMER</strong> als ein einziger, zusammenhängender Eintrag übernommen – selbst wenn sie die oben ausgewählten Trennzeichen enthalten.
            </p>
            <p className="example-text">
              <em>Beispiel:</em> <code>([Brad, : Pitt)</code> wird als ein einzelner Eintrag <code>&quot;[Brad, : Pitt&quot;</code> in die Liste übernommen.
            </p>
          </div>

          <div className="modal-actions">
            <button className="button button-outline" type="button" onClick={onCancel}>
              Abbrechen
            </button>
            <button className="button button-primary" type="submit" autoFocus>
              Importieren
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
