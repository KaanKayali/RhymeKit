import { useEffect } from 'react'

export default function LogicExplanationModal({ onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="explanation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="explanation-modal-title"
      >
        <div className="explanation-header">
          <h2 id="explanation-modal-title">Wie funktioniert RhymeKit?</h2>
          <button
            type="button"
            className="close-modal-button"
            onClick={onClose}
            aria-label="Schließen"
          >
            &times;
          </button>
        </div>

        <div className="explanation-body">
          <section className="explanation-section">
            <h3>1. Grundprinzip</h3>
            <p>
              RhymeKit analysiert Wörter rein phonetisch direkt in deinem Browser. Wortlisten und Suchbegriffe werden in ihre Vokalstrukturen und Auslaute zerlegt. Es werden keine Daten an externe Server übertragen.
            </p>
          </section>

          <section className="explanation-section">
            <h3>2. Doppelvokale &amp; Dehnungs-H vs. Diphthonge</h3>
            <p>
              Geschriebene Doppelvokale (<code>aa</code>, <code>ee</code>, <code>oo</code>) sowie Vokale mit Dehnungs-H (<code>ah</code>, <code>eh</code>, <code>oh</code>, <code>uh</code>, <code>ih</code>) werden phonetisch zu einfachen Langvokalen zusammengefasst. Echte Diphthonge (<code>ei</code>, <code>ai</code>, <code>au</code>, <code>eu</code> / <code>äu</code>, <code>ie</code>) bleiben als eigenständige Einheiten erhalten, wobei <code>äu</code> und <code>eu</code> phonetisch als identisch behandelt werden.
            </p>
            <ul className="explanation-list">
              <li><code>Haar</code> / <code>Staat</code> &rarr; Vokal: <code>[&quot;a&quot;]</code> (passt zu &quot;Rad&quot;, &quot;Tat&quot;)</li>
              <li><code>Reh</code> / <code>Schnee</code> &rarr; Vokal: <code>[&quot;e&quot;]</code> (passt zu &quot;See&quot;)</li>
              <li><code>Stein</code> &rarr; Diphthong: <code>[&quot;ei&quot;]</code> (passt zu &quot;Mai&quot;, &quot;Seil&quot;)</li>
              <li><code>Haus</code> &rarr; Diphthong: <code>[&quot;au&quot;]</code> (passt zu &quot;Baum&quot;)</li>
              <li><code>Bäume</code> / <code>Eule</code> &rarr; Diphthong: <code>[&quot;eu&quot;]</code> (<code>äu</code> = <code>eu</code> gleichbehandelt)</li>
            </ul>
          </section>

          <section className="explanation-section">
            <h3>3. Phonetische Regelsetzungs-Optionen</h3>
            <ul className="explanation-list">
              <li>
                <strong>&quot;er&quot;-Endung als &quot;a&quot; Vokal:</strong> Wandelt Wortenden auf <code>-er</code> phonetisch in ein unbetontes <code>a</code> um (z.&nbsp;B. <em>Mutter</em> &rarr; <em>Mutta</em>).
              </li>
              <li>
                <strong>Vokal-Toleranz (e=i=ä, u=o):</strong> Fasst ähnlich klingende Vokalgruppen zusammen (z.&nbsp;B. <em>Hände</em>, <em>Seelen</em>, <em>Lieder</em>).
              </li>
              <li>
                <strong>i = ie gleichbehandeln:</strong> Gleicht kurzes <code>i</code> und langes <code>ie</code> an (z.&nbsp;B. <em>Lid</em> = <em>Lied</em>).
              </li>
              <li>
                <strong>Kurze &amp; lange Vokale unterscheiden:</strong> Prüft die nachfolgende Konsonantenstruktur. Folgen auf einen Einzelvokal 2 oder mehr Konsonanten, gilt er als kurz (z.&nbsp;B. <em>Doppel</em> vs. <em>Dose</em>).
              </li>
            </ul>
          </section>

          <section className="explanation-section">
            <h3>4. Anglizismen-Engine</h3>
            <p>
              Erkennt englische Schreibweisen und übersetzt sie in die deutsche Phonetik:
            </p>
            <ul className="explanation-list">
              <li><code>ea</code> / <code>ee</code> &rarr; <code>ie</code> (z.&nbsp;B. <em>Team</em> &rarr; <em>Tiem</em>, <em>Speed</em> &rarr; <em>Spied</em>)</li>
              <li><code>oo</code> &rarr; <code>u</code> (z.&nbsp;B. <em>Cool</em> &rarr; <em>Kul</em>)</li>
              <li><code>ou</code> / <code>ow</code> &rarr; <code>au</code> (z.&nbsp;B. <em>Power</em> &rarr; <em>Pauer</em>)</li>
              <li><code>igh</code> / <code>y</code> &rarr; <code>ei</code> (z.&nbsp;B. <em>Night</em> &rarr; <em>Neit</em>, <em>Style</em> &rarr; <em>Steil</em>)</li>
            </ul>
          </section>

          <section className="explanation-section">
            <h3>5. Reimmodi &amp; Wort-Kombinationen</h3>
            <ul className="explanation-list">
              <li><strong>Vokalreim:</strong> Exakte Übereinstimmung der Vokalfolge.</li>
              <li><strong>Konsonantenreim / Endung:</strong> Übereinstimmung ab dem letzten Vokal.</li>
              <li><strong>Vokalreim + Endung:</strong> Reiner Reim (Vokalfolge + Endung übereinstimmend).</li>
              <li><strong>Rahmen-Vokalreim:</strong> Erster und letzter Vokal bei gleicher Vokalanzahl.</li>
              <li>
                <strong>Wort-Kombinationen:</strong> Zerlegt die Vokalfolge des Suchbegriffs in Teilsequenzen und findet Wortpaare aus deiner Liste, die zusammen den Vokalklang ergeben.
              </li>
            </ul>
          </section>
        </div>

        <div className="modal-actions">
          <button className="button button-primary" type="button" autoFocus onClick={onClose}>
            Verstanden
          </button>
        </div>
      </section>
    </div>
  )
}
