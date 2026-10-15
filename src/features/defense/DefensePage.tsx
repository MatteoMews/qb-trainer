import { useState } from "react";
import { JsonImportPanel } from "../../components/JsonImportPanel";
import { parseDefenseJson, type Defense } from "../../data/defenseSchema";
import { saveDefense } from "../../data/defenseRepository";
import { DefenseEditor } from "./DefenseEditor";
import { DefenseBook } from "./DefenseBook";
import { DefensePreviewField } from "./DefensePreviewField";
import "./DefensePage.css";

export function DefensePage() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [showImport, setShowImport] = useState(false);

  async function handleImport(defense: Defense) {
    await saveDefense(defense);
    setRefreshToken((token) => token + 1);
  }

  return (
    <div className="defense-page">
      <DefenseEditor onSaved={() => setRefreshToken((token) => token + 1)} />
      <section className="defense-page__book">
        <div className="defense-page__book-header">
          <h2>Gespeicherte Defenses</h2>
          <button type="button" onClick={() => setShowImport((v) => !v)}>
            {showImport ? "Import schließen" : "Defense importieren"}
          </button>
        </div>
        {showImport && (
          <JsonImportPanel<Defense>
            title="Defense aus JSON importieren"
            parse={parseDefenseJson}
            renderPreview={(defense) => <DefensePreviewField defense={defense} />}
            onConfirm={handleImport}
            confirmLabel="Defense speichern"
          />
        )}
        <DefenseBook refreshToken={refreshToken} />
      </section>
    </div>
  );
}
