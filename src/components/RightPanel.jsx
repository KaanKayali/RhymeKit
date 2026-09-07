export default function RightPanel({ results, hasSearchTerm }) {
  return (
    <section className="panel results-panel" aria-label="Reim-Ergebnisse">
      <div className="results-heading">
        <h2>Passende Reime</h2>
      </div>
      <div className="results-list" aria-live="polite">
        {results.length ? (
          <ul>{results.map((word) => <li key={word}>{word}</li>)}</ul>
        ) : (
          <p className="empty-state">{hasSearchTerm ? 'Keine passenden Einträge gefunden.' : 'Deine Treffer erscheinen hier.'}</p>
        )}
      </div>
      <p className="entry-count">Anzahl Einträge: {results.length}</p>
    </section>
  )
}
