import { useState } from "react";
import { JsonImportPanel } from "../../components/JsonImportPanel";
import { parsePlayJson, type Play } from "../../data/playSchema";
import { savePlay } from "../../data/playbookRepository";
import { PlayEditor } from "./PlayEditor";
import { Playbook } from "./Playbook";
import { PlayPreviewField } from "./PlayPreviewField";
import "./EditorPage.css";

export function EditorPage() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [showImport, setShowImport] = useState(false);

  async function handleImport(play: Play) {
    await savePlay(play);
    setRefreshToken((token) => token + 1);
  }

  return (
    <div className="editor-page">
      <PlayEditor onSaved={() => setRefreshToken((token) => token + 1)} />
      <section className="editor-page__playbook">
        <div className="editor-page__playbook-header">
          <h2>Playbook</h2>
          <button type="button" onClick={() => setShowImport((v) => !v)}>
            {showImport ? "Import schließen" : "Spielzug importieren"}
          </button>
        </div>
        {showImport && (
          <JsonImportPanel<Play>
            title="Spielzug aus JSON importieren"
            parse={parsePlayJson}
            renderPreview={(play) => <PlayPreviewField play={play} />}
            onConfirm={handleImport}
            confirmLabel="Spielzug speichern"
          />
        )}
        <Playbook refreshToken={refreshToken} />
      </section>
    </div>
  );
}
