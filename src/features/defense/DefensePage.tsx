import { useState } from "react";
import { DefenseEditor } from "./DefenseEditor";
import { DefenseBook } from "./DefenseBook";
import "./DefensePage.css";

export function DefensePage() {
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <div className="defense-page">
      <DefenseEditor onSaved={() => setRefreshToken((token) => token + 1)} />
      <section className="defense-page__book">
        <h2>Gespeicherte Defenses</h2>
        <DefenseBook refreshToken={refreshToken} />
      </section>
    </div>
  );
}
