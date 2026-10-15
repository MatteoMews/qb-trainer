import { useState } from "react";
import { PlayEditor } from "./PlayEditor";
import { Playbook } from "./Playbook";
import "./EditorPage.css";

export function EditorPage() {
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <div className="editor-page">
      <PlayEditor onSaved={() => setRefreshToken((token) => token + 1)} />
      <section className="editor-page__playbook">
        <h2>Playbook</h2>
        <Playbook refreshToken={refreshToken} />
      </section>
    </div>
  );
}
