const PRESET_PATH = '/presets/Deutsche_Woerter_Preset_280.txt'

export default function FooterPresetSection() {
  return (
    <section className="preset-footer" aria-labelledby="preset-footer-title">
      <div className="preset-footer-copy">
        <h2 id="preset-footer-title">Start-Paket: Deutsche Wörter-Liste</h2>
        <p>
          Neu bei RhymeKit? Lade das vorgefertigte Paket mit 280 häufigen deutschen Wörtern (Nomen, Verben, Adjektive, Konjunktionen, Präpositionen) als <code>.txt</code>-Datei herunter. Lade die Datei anschliessend oben links über <strong>&apos;Liste hinzufügen&apos;</strong> hoch, um das Tool direkt auszuprobieren und den Umgang mit eigenen Wortlisten zu lernen.
        </p>
      </div>
      <a className="preset-download-button" href={PRESET_PATH} download="Deutsche_Woerter_Preset_280.txt">
        <span aria-hidden="true">↓</span>
        <span>Preset herunterladen (280 Wörter .txt)</span>
      </a>
    </section>
  )
}