const APP_VERSION = 'v1.0.0'

export default function Header({ onOpenExplanation }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <img className="brand-logo" src="/assets/Rhymekit512x512.png" alt="RhymeKit Logo" />
        <div className="brand-copy">
          <h1>RhymeKit</h1>
          <div className="header-meta">
            <span>Von @KaanKayali</span>
            <span>{APP_VERSION}</span>
          </div>
        </div>
      </div>

      <div className="header-right">
        {onOpenExplanation && (
          <button
            type="button"
            className="help-button"
            title="Erklärung der Reim-Engine &amp; Regeln öffnen"
            onClick={onOpenExplanation}
          >
            <span className="help-icon">?</span>
            <span>Wie funktioniert RhymeKit?</span>
          </button>
        )}
        <p className="header-disclaimer">
          Hinweis: Phonetische Näherungswerte – Bezieht sich auf Standardsprache. Abweichungen durch Dialekt oder Akzentuation sind naturbedingt.
        </p>
      </div>
    </header>
  )
}
