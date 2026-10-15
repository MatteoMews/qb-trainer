import type { Concept } from "../../data/concepts";
import type { Coverage } from "../../data/coverages";
import type { ReadExplanation } from "../../engine/readRules";
import "./ReadsExplanation.css";

const DROPBACK_LABELS: Record<string, string> = {
  quick: "Quick Game",
  "3-step": "3-Step",
  "5-step": "5-Step",
  "7-step": "7-Step",
  "play-action": "Play-Action",
  rpo: "RPO",
};

export interface ReadsExplanationProps {
  concept: Concept;
  coverage: Coverage;
  explanation: ReadExplanation;
}

export function ReadsExplanation({ concept, coverage, explanation }: ReadsExplanationProps) {
  const { keyDefender, progression, dropback, hotRoute, rating, preSnap } = explanation;

  return (
    <div className="reads-explanation">
      <section className="reads-explanation__section">
        <h2>Pre-Snap-Read</h2>
        <ul className="reads-explanation__list">
          {preSnap.map((item) => (
            <li key={item.label}>
              <strong>{item.label}:</strong> {item.detail}
            </li>
          ))}
        </ul>
      </section>

      <section className="reads-explanation__section">
        <h2>Key Defender (Post-Snap)</h2>
        {keyDefender.source === "unresolved" ? (
          <p className="reads-explanation__honest-gap">
            Für „{concept.name}" gegen „{coverage.name}" lässt sich kein eindeutiger Key Defender aus den hinterlegten Daten ableiten.
          </p>
        ) : (
          <p>
            <strong>{keyDefender.id}</strong> – {keyDefender.label}
            <span className="reads-explanation__source"> ({sourceLabel(keyDefender.source)})</span>
          </p>
        )}
      </section>

      <section className="reads-explanation__section">
        <h2>Progression 1 → {progression.length}</h2>
        <ol className="reads-explanation__progression">
          {progression.map((step) => (
            <li key={step.role}>
              <strong>
                {step.progression}. {step.role} – {step.routeName}
              </strong>
              <p>{step.readRule}</p>
            </li>
          ))}
        </ol>
        {progression.length === 0 && (
          <p className="reads-explanation__honest-gap">
            Dieses Konzept passt nicht zur gewählten Formation – keine passenden Rollen gefunden.
          </p>
        )}
      </section>

      <section className="reads-explanation__section">
        <h2>Timing</h2>
        <p>
          Empfohlener Dropback: <strong>{DROPBACK_LABELS[dropback] ?? dropback}</strong>, abgeleitet aus der Tiefe des Progression-1-Reads.
        </p>
        {hotRoute && (
          <p>
            Hot/Sight-Adjust gegen Blitz: <strong>{hotRoute.role}</strong> läuft statt seiner Route einen schnellen{" "}
            <strong>{hotRoute.routeName}</strong> (flachste Route im Konzept).
          </p>
        )}
      </section>

      <section className="reads-explanation__section">
        <h2>Bewertung</h2>
        <p className="reads-explanation__stars" aria-label={`${rating.stars} von 5 Sternen`}>
          {"★".repeat(rating.stars)}
          {"☆".repeat(5 - rating.stars)}
          <span className="reads-explanation__tier"> ({rating.tier === "explicit" ? "explizit hinterlegt" : "generische Einschätzung"})</span>
        </p>
        <ul className="reads-explanation__list">
          {rating.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function sourceLabel(source: "zone-label" | "position" | "man-match" | "unresolved"): string {
  switch (source) {
    case "zone-label":
      return "aus Coverage-Zone abgeleitet";
    case "position":
      return "aus Positions-Konvention abgeleitet";
    case "man-match":
      return "nächster Verteidiger zum Primary-Receiver";
    case "unresolved":
      return "nicht ermittelbar";
  }
}
