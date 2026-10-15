import { useState } from "react";
import { JsonImportPanel } from "../../components/JsonImportPanel";
import {
  downloadBackup,
  getLastBackupAt,
  importBackup,
  parseBackup,
  type ImportSummary,
} from "../../data/backupRepository";
import type { Backup } from "../../data/backupSchema";
import "./SettingsPage.css";

function formatDate(iso: string | null): string {
  if (!iso) return "noch nie";
  return new Date(iso).toLocaleString("de-DE");
}

function parseBackupJson(raw: string) {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { success: false, error: "Ungültiges JSON: Die Datei/der Text lässt sich nicht als JSON lesen." };
  }
  const result = parseBackup(json);
  if (!result.success) return { success: false, error: result.error };
  return { success: true, data: result.backup };
}

function BackupPreview({ backup }: { backup: Backup }) {
  return (
    <ul className="settings-page__backup-summary">
      <li>{backup.plays.length} Spielzüge</li>
      <li>{backup.defenses.length} Defenses</li>
      <li>{backup.opponents.length} Gegner</li>
      <li>{backup.snaps.length} Snaps</li>
      <li>{backup.quizAttempts.length} Quiz-Versuche</li>
      <li>Exportiert am: {formatDate(backup.exportedAt)}</li>
    </ul>
  );
}

export function SettingsPage() {
  const [lastBackupAt, setLastBackupAt] = useState(getLastBackupAt());
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);

  async function handleExport() {
    await downloadBackup();
    setLastBackupAt(getLastBackupAt());
  }

  async function handleImportConfirm(backup: Backup) {
    const summary = await importBackup(backup);
    setImportSummary(summary);
  }

  return (
    <div className="settings-page">
      <section className="settings-page__section">
        <h2>Komplett-Backup</h2>
        <p className="settings-page__hint">
          Alles liegt nur lokal im Browser (IndexedDB) und synchronisiert sich nicht automatisch zwischen Mac und Windows. Exportiere
          regelmäßig ein Backup und importiere es auf dem anderen Gerät.
        </p>
        <p className="settings-page__last-backup">Letztes Backup: {formatDate(lastBackupAt)}</p>
        <button type="button" onClick={handleExport}>
          Backup exportieren
        </button>
      </section>

      <section className="settings-page__section">
        <JsonImportPanel<Backup>
          title="Backup importieren (zusammenführen)"
          parse={parseBackupJson}
          renderPreview={(backup) => <BackupPreview backup={backup} />}
          onConfirm={handleImportConfirm}
          confirmLabel="Zusammenführen"
        />
        {importSummary && (
          <ul className="settings-page__import-result">
            <li>
              Spielzüge: {importSummary.playsAdded} neu, {importSummary.playsSkipped} bereits vorhanden
            </li>
            <li>
              Defenses: {importSummary.defensesAdded} neu, {importSummary.defensesSkipped} bereits vorhanden
            </li>
            <li>
              Gegner: {importSummary.opponentsAdded} neu, {importSummary.opponentsMatched} zugeordnet
            </li>
            <li>
              Snaps: {importSummary.snapsAdded} neu, {importSummary.snapsSkipped} bereits vorhanden
            </li>
            <li>
              Quiz-Versuche: {importSummary.quizAttemptsAdded} neu, {importSummary.quizAttemptsSkipped} bereits vorhanden
            </li>
          </ul>
        )}
      </section>
    </div>
  );
}
