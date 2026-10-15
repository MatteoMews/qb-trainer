# QB Trainer

American-Football-Taktik-App für Quarterbacks: Spielzüge entwerfen, gegen moderne Defenses simulieren, Reads lernen, Quiz trainieren und Gegner scouten. Läuft komplett im Browser (keine Server, keine KI-API). PWA-Installierbarkeit/Offline-Nutzung ist für Phase 10 geplant, aktuell noch nicht umgesetzt.

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

Phasen 1-9 (Fundament, Editor, Defenses, Simulation 2D, Reads, 3D-QB-Ansicht, Quiz, Scouting,
Import/Export & Backup) sind umgesetzt. Phase 10 bringt noch: PWA/Offline-Installierbarkeit
(aktuell **noch nicht** vorhanden - die App läuft nur online über GitHub Pages), Tastenkürzel,
Performance-Feinschliff.
