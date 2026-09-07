const APP_VERSION = 'v1.0.0'

export default function Header() {
  return (
    <header className="app-header">
      <h1>RhymeKit</h1>
      <div className="header-meta">
        <span>Von @KaanKayali</span>
        <span>{APP_VERSION}</span>
      </div>
    </header>
  )
}
