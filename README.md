# RhymeKit

Eine vollständig clientseitige React-Anwendung zum Finden von Reimen. RhymeKit nutzt Vite und enthält eine kleine Platzhalter-Wortliste, die sich per TXT-Datei erweitern lässt.

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
