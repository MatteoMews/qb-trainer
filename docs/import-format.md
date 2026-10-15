# Import-Format

QB Trainer speichert alles lokal im Browser (IndexedDB) und synchronisiert sich **nicht**
automatisch zwischen Geräten (siehe Projektauftrag Abschnitt 5.9). Dieses Dokument beschreibt
die drei JSON-Formate, mit denen Daten zwischen Geräten oder aus einem Claude-Chat (z.B. aus
einem fotografierten Playbook, siehe Abschnitt 5.8) in die App gebracht werden:

1. **Play** (`"type": "play"`) – ein einzelner Spielzug
2. **Defense** (`"type": "defense"`) – eine einzelne Defense
3. **Backup** (`"type": "qb-trainer-backup"`) – ein Komplett-Export aller Daten

Alle drei sind versioniert (`schemaVersion`). Die App validiert jede Import-Datei mit einem
Zod-Schema und zeigt bei ungültigem JSON eine verständliche Fehlermeldung statt etwas zu
erraten.

## Koordinatensystem

Siehe Projektauftrag Abschnitt 4: ein Play-Koordinatenpunkt `{ "x": number, "y": number }` hat
`x` als seitliche Position (0 bis 53.33 Yards, von der linken zur rechten Seitenlinie aus
Offense-Sicht) und `y` als Abstand zur Line of Scrimmage (0 = auf der Linie, negativ =
Backfield, positiv = Richtung Verteidigung). Die Ballposition eines Plays
(`ball.yardLine`, 0-100) ist davon unabhängig: 0 = eigene Torlinie, 100 = gegnerische.

## 1. Play-Format

Importierbar im Playbook-Tab ("Spielzug importieren"): Datei hochladen oder JSON einfügen, dann
erst Validierung + Vorschau auf dem Feld, dann Speichern.

```json
{
  "schemaVersion": 1,
  "type": "play",
  "name": "Trips Right Stick",
  "tags": [],
  "ball": { "hash": "left", "yardLine": 35 },
  "offense": {
    "formation": "Trips Right (3x1)",
    "personnel": "11",
    "qbAlignment": "shotgun",
    "dropback": "5-step",
    "concept": "Stick",
    "players": [
      {
        "id": "H",
        "position": "WR",
        "start": { "x": 30, "y": -1 },
        "task": {
          "type": "route",
          "routeName": "Sit",
          "route": [
            { "x": 30, "y": 6 },
            { "x": 29, "y": 6 }
          ],
          "progression": 1
        }
      },
      {
        "id": "RB",
        "position": "RB",
        "start": { "x": 18.5, "y": -5.3 },
        "task": {
          "type": "route",
          "routeName": "Flat",
          "route": [
            { "x": 18.5, "y": 1 },
            { "x": 12.5, "y": 2 }
          ],
          "progression": 2
        }
      },
      {
        "id": "Z",
        "position": "WR",
        "start": { "x": 44, "y": -1 },
        "task": {
          "type": "route",
          "routeName": "Go",
          "route": [
            { "x": 44, "y": 12 },
            { "x": 46, "y": 22 }
          ],
          "progression": 3
        }
      },
      {
        "id": "X",
        "position": "WR",
        "start": { "x": 0, "y": -1 },
        "task": {
          "type": "route",
          "routeName": "Slant",
          "route": [
            { "x": 0, "y": 2 },
            { "x": 5, "y": 4 }
          ],
          "progression": 4
        }
      }
    ]
  },
  "notes": "Optional: Coaching-Punkte"
}
```

### Felder

| Feld | Pflicht | Beschreibung |
| --- | --- | --- |
| `schemaVersion` | ja | immer `1` |
| `type` | ja | immer `"play"` |
| `name` | ja | Anzeigename |
| `tags` | nein | freie Tags, Standard `[]` |
| `ball.hash` | ja | `"left"` \| `"middle"` \| `"right"` |
| `ball.yardLine` | ja | 0-100 |
| `offense.formation` | ja | Formationsname (muss nicht in formations.ts existieren - nur für die Anzeige) |
| `offense.personnel` | ja | z.B. `"11"` |
| `offense.qbAlignment` | ja | `"under-center"` \| `"shotgun"` \| `"pistol"` |
| `offense.dropback` | ja | `"quick"` \| `"3-step"` \| `"5-step"` \| `"7-step"` \| `"play-action"` \| `"rpo"` |
| `offense.concept` | nein | Name aus concepts.ts, falls zutreffend (steuert u.a. den Quiz-Filter "nur meine Spielzüge") |
| `offense.players[].id` | ja | Alignment-Label (X, Z, H, Y, F, RB, …) |
| `offense.players[].position` | ja | Positions-Label (WR, TE, RB, …) |
| `offense.players[].start` | ja | Play-Koordinate bei Snap |
| `offense.players[].task` | ja | `{ "type": "route", "routeName", "route": [Punkte...], "progression"? }` oder `{ "type": "block" }` |
| `notes` | nein | Freitext |

Nur Spieler mit einer Route oder einer Block-Zuweisung müssen aufgeführt werden (Linemen/QB
werden nicht einzeln gelistet).

## 2. Defense-Format

Importierbar im Defenses-Tab, gleiches Prinzip (Datei/Paste → Validierung → Vorschau → Speichern).

```json
{
  "schemaVersion": 1,
  "type": "defense",
  "name": "Nickel Cover 3 Sky",
  "tags": [],
  "front": "Nickel 4-2-5",
  "coverage": "Cover 3 Sky",
  "pressure": "Fire Zone (3-Under/3-Deep)",
  "disguisedAsCoverage": "Cover 2 Zone",
  "players": [
    { "id": "DE1", "position": "DE", "start": { "x": 15, "y": 0.7 } },
    { "id": "DT1", "position": "DT", "start": { "x": 18.5, "y": 0.5 } },
    { "id": "DT2", "position": "DT", "start": { "x": 21.5, "y": 0.5 } },
    { "id": "DE2", "position": "DE", "start": { "x": 25, "y": 0.7 } },
    { "id": "WLB", "position": "OLB", "start": { "x": 17, "y": 4 } },
    { "id": "MLB", "position": "MLB", "start": { "x": 23, "y": 4 } },
    { "id": "CB1", "position": "CB", "start": { "x": 0, "y": 10 }, "role": "Deep Third (links)" },
    { "id": "CB2", "position": "CB", "start": { "x": 40, "y": 10 }, "role": "Deep Third (rechts)" },
    { "id": "FS", "position": "S", "start": { "x": 20, "y": 14 }, "role": "Deep Third (Mitte)" },
    { "id": "SS", "position": "SS", "start": { "x": 29, "y": 4 }, "role": "Flat/Force (Sky-Rotation)" },
    { "id": "NB", "position": "NB", "start": { "x": 10, "y": 3 } }
  ],
  "notes": "Optional"
}
```

### Felder

| Feld | Pflicht | Beschreibung |
| --- | --- | --- |
| `front` | ja | Frontname (z.B. aus fronts.ts) |
| `coverage` | ja | Coveragename (z.B. aus coverages.ts) |
| `pressure` | nein | Pressure-Name, falls angesagt |
| `disguisedAsCoverage` | nein | Pre-Snap-Shell, falls die Defense rotiert (Disguise) |
| `players[].role` | nein | Zonen-/Technik-Beschreibung, nur zur Anzeige |

Alle elf Spieler werden gelistet (im Gegensatz zum Play-Format, wo nur zugewiesene Spieler
nötig sind), da eine Defense keine "unbeteiligten" Linemen hat.

## 3. Backup-Format (Komplett-Export)

Im Einstellungen-Tab: "Backup exportieren" lädt eine Datei mit allen Spielzügen, Defenses,
Gegnern, Snaps und der Quiz-Statistik herunter. "Backup importieren" führt eine Datei additiv
mit dem vorhandenen Datenbestand zusammen (Duplikate werden über Inhaltsvergleich erkannt und
übersprungen, keine Daten werden beim Import gelöscht oder überschrieben).

```json
{
  "schemaVersion": 1,
  "type": "qb-trainer-backup",
  "exportedAt": "2026-10-15T20:00:00.000Z",
  "plays": [{ "data": { "...": "ein Play-Objekt wie oben" }, "folder": "Unsortiert", "createdAt": "...", "updatedAt": "..." }],
  "defenses": [{ "data": { "...": "ein Defense-Objekt wie oben" }, "folder": "Unsortiert", "createdAt": "...", "updatedAt": "..." }],
  "opponents": [{ "name": "Riverside Hawks", "league": "", "notes": "", "createdAt": "...", "updatedAt": "..." }],
  "snaps": [
    {
      "opponentRef": 0,
      "down": 3,
      "distance": 8,
      "fieldPosition": 50,
      "hash": "middle",
      "defenseFront": "4-3 Over",
      "coverage": "Cover 3 Buzz",
      "blitz": false,
      "result": "Incomplete",
      "createdAt": "..."
    }
  ],
  "quizAttempts": [
    { "timestamp": "...", "questionType": "beater", "coverage": "Cover 3 Buzz", "correct": true, "timedOut": false, "reactionTimeMs": 4200 }
  ]
}
```

`snaps[].opponentRef` ist der **Index** (0-basiert) in das `opponents`-Array dieser Datei, nicht
die rohe Datenbank-ID des Ursprungsgeräts – IDs sind zwischen zwei Browser-Datenbanken nicht
stabil, Indizes innerhalb derselben Datei schon.

## Export eines einzelnen Spielzugs/einer Defense

Im Playbook bzw. in den Defenses gibt es pro gespeichertem Eintrag einen "Exportieren"-Button,
der genau das Play- bzw. Defense-Format oben als Datei herunterlädt – z.B. um es per Copy/Paste
in einen Claude-Chat zu geben oder auf dem anderen Gerät zu importieren.
