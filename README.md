# QB Trainer

American-Football-Taktik-App für Quarterbacks: Spielzüge entwerfen, gegen moderne Defenses simulieren, Reads lernen, Quiz trainieren und Gegner scouten. Läuft komplett im Browser (keine Server, keine KI-API), installierbar als PWA.

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

## Status

Phase 1 (Fundament) ist in Arbeit. Weitere Abschnitte (Als App installieren, Backup-Workflow, Import-Workflow über Claude) folgen, sobald die jeweiligen Features gebaut sind.
