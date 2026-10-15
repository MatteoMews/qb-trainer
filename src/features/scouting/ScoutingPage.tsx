import { useEffect, useState } from "react";
import type { Opponent } from "../../data/db";
import { getOpponent } from "../../data/scoutingRepository";
import { OpponentManager } from "./OpponentManager";
import { ScoutingAnalysisView } from "./ScoutingAnalysisView";
import { SnapEntryForm } from "./SnapEntryForm";
import { SnapList } from "./SnapList";
import { useScoutingStore } from "./scoutingStore";
import "./ScoutingPage.css";

const SUB_TABS = [
  { id: "opponents", label: "Gegner" },
  { id: "capture", label: "Snaps erfassen" },
  { id: "analysis", label: "Auswertung" },
] as const;

type SubTab = (typeof SUB_TABS)[number]["id"];

export function ScoutingPage() {
  const [subTab, setSubTab] = useState<SubTab>("opponents");
  const [refreshToken, setRefreshToken] = useState(0);
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const selectedOpponentId = useScoutingStore((s) => s.selectedOpponentId);

  useEffect(() => {
    let cancelled = false;
    const load = selectedOpponentId === null ? Promise.resolve(null) : getOpponent(selectedOpponentId);
    load.then((data) => {
      if (!cancelled) setOpponent(data ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedOpponentId, refreshToken]);

  return (
    <div className="scouting-page">
      <nav className="scouting-page__tabs">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.id === subTab ? "scouting-page__tab scouting-page__tab--active" : "scouting-page__tab"}
            onClick={() => setSubTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {subTab === "opponents" && <OpponentManager />}

      {subTab === "capture" &&
        (opponent ? (
          <div className="scouting-page__capture">
            <h2>Snaps für {opponent.name}</h2>
            <SnapEntryForm opponentId={opponent.id!} onSaved={() => setRefreshToken((t) => t + 1)} />
            <SnapList opponentId={opponent.id!} refreshToken={refreshToken} />
          </div>
        ) : (
          <p className="scouting-page__hint">Wähle zuerst einen Gegner im Tab „Gegner".</p>
        ))}

      {subTab === "analysis" &&
        (opponent ? (
          <ScoutingAnalysisView opponent={opponent} refreshToken={refreshToken} />
        ) : (
          <p className="scouting-page__hint">Wähle zuerst einen Gegner im Tab „Gegner".</p>
        ))}
    </div>
  );
}
