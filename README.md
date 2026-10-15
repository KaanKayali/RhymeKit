# RhymeKit

Eine clientseitige React-Anwendung zum Finden von Reimen. RhymeKit nutzt Vite und enthält eine kleine Platzhalter-Wortliste, die sich per TXT-Datei erweitern lässt.

<img alt="alt_text" width="128px" src="public/assets/Rhymekit512x512.png" />

![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)

## Was macht RhymeKit?

Viele Reimlexika suchen nach exakten Buchstaben-Endungen. RhymeKit hingegen arbeitet mit einer **phonetischen Vokal-Engine**, die Wörter klangbasiert zerlegt und vergleicht:

- **Phonetische Vokal-Analyse:** Erkennt Diphthonge (`ei`, `ai`, `au`, `eu`, `äu`), glättet Doppelvokale (`aa` → `a`) und Dehnungs-H (`eh` → `e`).
- **4 flexible Reim-Modi:**
  - **Vokalreim (Assonanz):** Vergleicht die reine Vokalfolge für moderne Mehrsilben-Reime.
  - **Konsonantenreim / Endung:** Findet Reime ab dem letzten Vokal samt folgendem Auslaut.
  - **Vokalreim + Endung:** Klassischer, reiner Reim (identische Vokalfolge + übereinstimmende Endung).
  - **Rahmen-Vokalreim:** Vergleicht den ersten und letzten Vokal bei gleicher Silbenanzahl.
- **Feinjustierbare Klang-Regeln:**
  - *Vokal-Toleranz:* Erkennt nahe beieinanderliegende Vokale (z. B. `e` mit `i`/`ä`, `u` mit `o`).
  - *Letzte Silbe schützen:* Behält strenge Endreime bei, erlaubt aber unreine Vor-Silben.
  - *"-er" als "a":* Behandelt umgangssprachliche Endungen phonetisch (z. B. *Jäger* → *Jäga*).
  - *Anglizismen-Engine:* Übersetzt englische Schreibweisen in die deutsche Lautung (*Team* → *Tiem*, *Speed* → *Spied*, *Cool* → *Kul*).
  - *Vokallängen-Unterscheidung:* Erkennt kurze und lange Vokale anhand nachfolgender Konsonanten.
- **Wort-Kombinationen:** Findet automatisch Wortpaare aus deiner Liste, die zusammen den gewünschten Vokalklang ergeben.
- **Import aus Text & PDF:** Eigene Wortlisten einfach per Drag & Drop oder Dateiauswahl laden – inklusive flexibler Trennzeichenwahl und Klammerungsschutz `(...)` für feste Phrasen.
- **Integrierte Presets:** Vorgefertigte Starter-Pakete für Deutsch und Englisch zum direkten Download und Import.
- **Export & Privatsphäre:** Ergebnisse als `.txt` oder formatiertes `.pdf` exportieren. **Alle Daten bleiben im Browser** (im `localStorage`). Es wird nichts an externe Server übertragen!

## Voraussetzungen

- [Node.js](https://nodejs.org/) (empfohlen: aktuelle LTS-Version)
- npm (wird normalerweise zusammen mit Node.js installiert)

## Lokal starten

Installiere zunächst die Abhängigkeiten:

```bash
npm install
```

Starte anschließend den Entwicklungsserver:

```bash
npm run dev
```

Öffne danach die im Terminal angezeigte Adresse – normalerweise `http://localhost:5173`.

## Optional: pnpm verwenden

Falls du lieber pnpm nutzen möchtest, installiere es einmalig global und verwende danach die entsprechenden Befehle:

```bash
npm install --global pnpm
pnpm install
pnpm dev
```

## Produktions-Build

```bash
npm run build
```

Der fertige Build wird im Ordner `dist/` abgelegt.

## Projektstruktur

```
src/
├── components/     # Header sowie Ein- und Ausgabe-Panels
├── hooks/          # Vokal-basierter Debounce-Hook
├── utils/          # Erweiterbare Reim-Engine
├── App.jsx
├── main.jsx
└── index.css
```

Die eigentliche Reimlogik kann in `src/utils/rhymeEngine.js` erweitert werden. Dort sind bewusst klar markierte TODO-Stellen für eigene Wörterbücher und Phonemregeln vorhanden.

## Lizenz

Dieses Projekt ist für private sowie kreative Zwecke frei nutzbar.  
&copy; 2026 Kaan Kayali. Alle Rechte vorbehalten.