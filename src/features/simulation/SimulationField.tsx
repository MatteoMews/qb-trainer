import { useId, useMemo } from "react";
import { Field2D } from "../../components/Field2D";
import { findCoverage } from "../../data/coverages";
import { FIELD_SVG_WIDTH, playPointToSvg, PX_PER_YARD, yardLineToSvgY } from "../../engine/coordinates";
import { DL_POSITIONS, OL_POSITIONS, getFrameAt, type SimPlayer } from "../../engine/simulate";
import { PlayerToken } from "../editor/PlayerToken";
import { DefenderToken } from "../defense/DefenderToken";
import { useSimulationStore } from "./simulationStore";
import "./SimulationField.css";

const ZONE_RADIUS_YD = 6;
const OPEN_THRESHOLD_YD = 3.5;
const CONTESTED_THRESHOLD_YD = 1.8;

const SECONDARY_POSITIONS = new Set(["CB", "NB", "FS", "SS", "S"]);
const LB_POSITIONS = new Set(["OLB", "MLB", "ILB"]);
const ELIGIBLE_RECEIVER_POSITIONS = new Set(["WR", "TE", "RB", "FB"]);

function distance(a: SimPlayer, b: SimPlayer): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function openness(receiver: SimPlayer, defenders: SimPlayer[]): "open" | "contested" | "tight" {
  const nearest = Math.min(...defenders.map((d) => distance(receiver, d)));
  if (nearest >= OPEN_THRESHOLD_YD) return "open";
  if (nearest >= CONTESTED_THRESHOLD_YD) return "contested";
  return "tight";
}

export function SimulationField() {
  const { play, defense, t, showZones, showOpenIndicator, showLeverage, showLineplay } = useSimulationStore();
  const zoneClipId = useId();

  const frame = useMemo(() => {
    if (!play || !defense) return null;
    return getFrameAt(play.data, defense.data, t);
  }, [play, defense, t]);

  const coverage = defense ? findCoverage(defense.data.coverage) : undefined;
  const ballYardLine = play?.data.ball.yardLine ?? 50;

  if (!play || !defense || !frame) {
    return (
      <div className="simulation-field simulation-field--empty">
        <Field2D />
        <p className="simulation-field__hint">Wähle einen Spielzug und eine Defense, um die Simulation zu sehen.</p>
      </div>
    );
  }

  const nonRushDefenders = frame.defense.filter((d) => SECONDARY_POSITIONS.has(d.position) || LB_POSITIONS.has(d.position));
  const eligibleReceivers = frame.offense.filter((o) => ELIGIBLE_RECEIVER_POSITIONS.has(o.position));
  const visibleOffense = showLineplay ? frame.offense : frame.offense.filter((o) => !OL_POSITIONS.has(o.position));
  const visibleDefense = showLineplay ? frame.defense : frame.defense.filter((d) => !DL_POSITIONS.has(d.position));

  return (
    <div className="simulation-field">
      <Field2D>
        {showZones && coverage && coverage.coverageType !== "man" && (
          <>
            {/* Zonen-Kreise werden auf die Defense-Hälfte geclippt, damit sie nicht wie Spieler
                im eigenen Backfield wirken, nur weil ihr Radius über die Line of Scrimmage reicht. */}
            <clipPath id={zoneClipId}>
              <rect x={0} y={0} width={FIELD_SVG_WIDTH} height={yardLineToSvgY(ballYardLine)} />
            </clipPath>
            <g className="simulation-field__zones" clipPath={`url(#${zoneClipId})`}>
              {nonRushDefenders.map((d) => {
                const svg = playPointToSvg(d, ballYardLine);
                return <circle key={`zone-${d.id}`} cx={svg.x} cy={svg.y} r={ZONE_RADIUS_YD * PX_PER_YARD} className="simulation-field__zone" />;
              })}
            </g>
          </>
        )}

        {showLeverage && coverage?.coverageType === "man" &&
          nonRushDefenders.map((d) => {
            const nearestReceiver = eligibleReceivers.reduce<SimPlayer | undefined>((best, r) => {
              if (!best) return r;
              return distance(d, r) < distance(d, best) ? r : best;
            }, undefined);
            if (!nearestReceiver || distance(d, nearestReceiver) > 2.5) return null;
            const from = playPointToSvg(d, ballYardLine);
            const to = playPointToSvg(nearestReceiver, ballYardLine);
            return <line key={`leverage-${d.id}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="simulation-field__leverage" />;
          })}

        {visibleOffense.map((player) => {
          const svg = playPointToSvg(player, ballYardLine);
          const isReceiver = ELIGIBLE_RECEIVER_POSITIONS.has(player.position);
          const status = showOpenIndicator && isReceiver ? openness(player, nonRushDefenders) : null;
          return (
            <g key={player.id}>
              {status && <circle cx={svg.x} cy={svg.y} r={10} className={`simulation-field__status simulation-field__status--${status}`} />}
              <PlayerToken
                id={player.id}
                position={player.position as Parameters<typeof PlayerToken>[0]["position"]}
                x={svg.x}
                y={svg.y}
                selected={false}
                onPointerDown={() => {}}
              />
            </g>
          );
        })}

        {visibleDefense.map((player) => {
          const svg = playPointToSvg(player, ballYardLine);
          return (
            <DefenderToken
              key={player.id}
              id={player.id}
              position={player.position as Parameters<typeof DefenderToken>[0]["position"]}
              x={svg.x}
              y={svg.y}
              selected={false}
              onPointerDown={() => {}}
            />
          );
        })}
      </Field2D>
    </div>
  );
}
