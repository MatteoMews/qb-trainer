import type { Hash } from "../data/field";
import type { Coverage } from "../data/coverages";
import type { Front } from "../data/fronts";
import type { Defense, DefensePlayer } from "../data/defenseSchema";
import { placeDefense } from "./placeDefense";

export interface BuildDefenseOptions {
  name: string;
  front: Front;
  coverage: Coverage;
  hash: Hash;
  pressure?: string;
  disguisedAsCoverage?: Coverage;
  tags?: string[];
}

/** Baut ein vollständiges Defense-Objekt (Austauschformat) aus Front + Coverage.
 *  Spieler-Rollen (z.B. "Deep Third (Mitte)") werden aus coverage.zones übernommen, wenn vorhanden. */
export function buildDefense({
  name,
  front,
  coverage,
  hash,
  pressure,
  disguisedAsCoverage,
  tags = [],
}: BuildDefenseOptions): Defense {
  const placed = placeDefense(front, coverage, hash);
  const zoneByRole = new Map(coverage.zones.map((zone) => [zone.role, zone.label]));

  const players: DefensePlayer[] = placed.map((player) => ({
    id: player.id,
    position: player.position,
    start: player.start,
    role: zoneByRole.get(player.id),
  }));

  return {
    schemaVersion: 1,
    type: "defense",
    name,
    tags,
    front: front.name,
    coverage: coverage.name,
    pressure,
    disguisedAsCoverage: disguisedAsCoverage?.name,
    players,
  };
}
