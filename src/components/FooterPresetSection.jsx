import { useEffect, useState } from 'react'

const PRESETS = [
  {
    title: 'Start-Paket: Deutsche Wörter-Liste',
    description: 'Ein umfangreiches deutsches Paket mit 737 häufigen Wörtern aus den Bereichen Menschen, Alltag, Natur, Gesellschaft, Körper, Verben, Eigenschaften und Verbindungswörter.',
    path: '/presets/Deutsche_Woerter_Preset_1000.txt',
    filename: 'Deutsche_Woerter_Preset_1000.txt',
    label: 'Deutsches Preset herunterladen',
    className: 'preset-download-button preset-download-german',
  },
  {
    title: 'English Starter Pack',
    description: 'A complete English companion preset with a broad vocabulary for rhyme experiments, covering people, everyday life, nature, society, body, verbs, adjectives and connecting words.',
    path: '/presets/English_Words_Preset_1000.txt',
    filename: 'English_Words_Preset_1000.txt',
    label: 'Englisches Preset herunterladen',
    className: 'preset-download-button preset-download-english',
  },
]

export default function FooterPresetSection() {
  const [activeLegalPage, setActiveLegalPage] = useState(null)

  useEffect(() => {
    if (!activeLegalPage) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setActiveLegalPage(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeLegalPage])

  return (
    <section className="preset-footer" aria-labelledby="preset-footer-title">
      <div className="preset-footer-intro">
        <h2 id="preset-footer-title">Wortlisten zum Ausprobieren</h2>
        <p>
          Neu bei RhymeKit? Lade ein vorgefertigtes Paket als <code>.txt</code>-Datei herunter und importiere es oben links über <strong>&apos;Liste hinzufügen&apos;</strong>.
        </p>
      </div>
      <div className="preset-options">
        {PRESETS.map((preset) => (
          <article className="preset-option" key={preset.path}>
            <div className="preset-footer-copy">
              <h3>{preset.title}</h3>
              <p>{preset.description}</p>
            </div>
            <a className={preset.className} href={preset.path} download={preset.filename}>
              <span aria-hidden="true">↓</span>
              <span>{preset.label}</span>
            </a>
          </article>
        ))}
      </div>
      <nav className="legal-links" aria-label="Rechtliche Informationen">
        <button type="button" onClick={() => setActiveLegalPage('imprint')}>Impressum</button>
        <span aria-hidden="true">|</span>
        <button type="button" onClick={() => setActiveLegalPage('privacy')}>Datenschutz</button>
      </nav>

      {activeLegalPage && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setActiveLegalPage(null)
        }}>
          <section
            className="legal-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-modal-title"
          >
            <div className="explanation-header">
              <h2 id="legal-modal-title">{activeLegalPage === 'imprint' ? 'Impressum' : 'Datenschutz'}</h2>
              <button
                type="button"
                className="close-modal-button"
                onClick={() => setActiveLegalPage(null)}
                aria-label="Schließen"
              >
                &times;
              </button>
            </div>
            <div className="legal-modal-body">
              {activeLegalPage === 'imprint' ? (
                <dl className="legal-details">
                  <dt>Name</dt>
                  <dd>Kaan Kayali</dd>
                  <dt>Adresse</dt>
                  <dd>*****</dd>
                  <dt>E-Mail</dt>
                  <dd>20kaan05@gmail.com</dd>
                </dl>
              ) : (
                <p>Alle Daten bleiben zu 100 % lokal in deinem Browser und werden nicht an externe Server übertragen.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </section>
  )
}