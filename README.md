# QB Trainer

American-Football-Taktik-App für Quarterbacks: Spielzüge entwerfen, gegen moderne Defenses simulieren, Reads lernen, Quiz trainieren und Gegner scouten. Läuft komplett im Browser (keine Server, keine KI-API), lässt sich als App installieren und funktioniert danach auch offline.

## Lokal starten

Benötigt Node.js 20.19+ oder 22.12+ (siehe `.nvmrc`).

```bash
npm install
npm run dev
```

## Tests, Lint, Build

```bash
npm run test    # Vitest
npm run lint    # ESLint
npm run build   # Typecheck + Produktions-Build
```

## Deployment

Push auf `main` baut die App per GitHub Actions und veröffentlicht sie auf GitHub Pages (`.github/workflows/deploy.yml`).

## Als App installieren / offline nutzen

QB Trainer ist eine PWA (Progressive Web App). Im Browser (z.B. Chrome/Edge über das
Installieren-Icon in der Adressleiste, Safari auf dem iPhone/iPad über "Zum Home-Bildschirm")
lässt sich die App installieren und startet danach wie eine native App in einem eigenen Fenster.

Nach dem ersten Laden cacht ein Service Worker die komplette App (HTML/CSS/JS/Icons), sodass sie
auch **ohne Internetverbindung** funktioniert - alle Daten liegen ohnehin nur lokal in der
IndexedDB des Browsers (siehe Backup-Workflow unten). Neue Versionen werden automatisch im
Hintergrund nachgeladen und beim nächsten Start aktiv.

## Tastenkürzel (Simulation)

Im Tab **Simulation** stehen folgende Kürzel zur Verfügung (sofern der Fokus nicht gerade in
einem Eingabefeld wie der Spielzug-/Defense-Auswahl liegt):

| Taste | Aktion |
| --- | --- |
| `Leertaste` | Play/Pause |
| `←` / `→` | Einen Frame zurück/vor |
| `R` | Reset auf den Snap (t = 0) |

## Backup-Workflow (Mac ↔ Windows)

Alle Daten liegen nur lokal im Browser (IndexedDB) und synchronisieren sich **nicht** automatisch
zwischen Geräten. Im Tab **Einstellungen**:

1. **Backup exportieren** lädt eine JSON-Datei mit allen Spielzügen, Defenses, Gegnern, Snaps und
   der Quiz-Statistik herunter.
2. Datei auf das andere Gerät übertragen (USB-Stick, Cloud-Ordner, AirDrop, …).
3. **Backup importieren** auf dem anderen Gerät führt die Datei additiv mit dem dortigen
   Datenbestand zusammen – bereits vorhandene Einträge werden erkannt und übersprungen, nichts
   wird überschrieben oder gelöscht.

Die Einstellungen-Seite zeigt an, wann zuletzt ein Backup exportiert wurde.

## Import-Workflow über Claude

Spielzüge lassen sich aus fotografierten Playbook-Seiten, Whiteboards oder Screenshots per
Claude-Chat importieren (siehe Projektauftrag 5.8):

1. Foto im Chat an Claude geben und bitten, daraus eine JSON-Datei im Play- oder
   Defense-Format zu erzeugen (Format und ein vollständiges Beispiel stehen in
   [`docs/import-format.md`](docs/import-format.md) – das Dokument kann direkt an Claude gegeben
   werden).
2. Im Playbook- bzw. Defenses-Tab auf **"Spielzug importieren"** / **"Defense importieren"**
   klicken, die JSON-Datei hochladen oder den Text einfügen.
3. Die App validiert das JSON und zeigt eine Fehlermeldung, falls etwas nicht passt - sonst eine
   Vorschau auf dem Feld.
4. Erst nach der Vorschau wird gespeichert.

Jeder gespeicherte Spielzug/jede Defense hat außerdem einen **"Exportieren"**-Button, der ihn im
selben Format wieder als Datei herunterlädt (z.B. um ihn Claude im Chat zu geben oder auf ein
anderes Gerät zu übertragen).

## Status

Alle 10 Phasen des Projektauftrags sind umgesetzt: Fundament, Editor, Defenses, Simulation 2D,
Reads, 3D-QB-Ansicht, Quiz, Scouting, Import/Export & Backup sowie Feinschliff (PWA/Offline,
Tastenkürzel, Performance).

## Offene Football-Check-Punkte

Football-Inhalte (Formationen, Routen, Fronts, Coverages, Konzepte, Pressures, Timing) wurden
nach bestem Wissen und mit plausiblen Richtwerten erstellt, folgen aber keinem einzelnen
offiziellen Playbook. An folgenden Stellen im Code markiert ein `// TODO(Football-Check)`-
Kommentar explizit, wo die Werte/Benennungen von dir als Football-Experte geprüft werden
sollten, weil sich Systeme/Teams/Quellen hier unterscheiden können:

- [`src/data/formations.ts`](src/data/formations.ts) - Splits/Tiefen/Abstände der Formationen
- [`src/data/fronts.ts`](src/data/fronts.ts) - Pre-Snap-Tiefe/-Breite der Front-7
- [`src/data/coverages.ts`](src/data/coverages.ts) - Alignment-Tiefen, Zonen-Landmarks, Benennung der Coverage-Varianten
- [`src/data/concepts.ts`](src/data/concepts.ts) - Progression (1-4) pro Passkonzept
- [`src/data/pressures.ts`](src/data/pressures.ts) - Rusher/Drop-Zuordnung je Blitz
- [`src/data/routeTree.ts`](src/data/routeTree.ts) - Nummerierung 0-9 des Route Trees
- [`src/engine/routeGenerator.ts`](src/engine/routeGenerator.ts) - Breite/Tiefe der Route-Breaks
- [`src/engine/simulate.ts`](src/engine/simulate.ts) - Geschwindigkeiten, Break-Pausen, Coverage-Lag/-Reaktionszeiten

Keine dieser Stellen ist bewusst falsch - es sind durchdachte, plausible Annahmen, aber eben
Annahmen, wo es in der Praxis keine einheitliche Antwort gibt.
