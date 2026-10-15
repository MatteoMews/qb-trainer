import type { Hash } from "../data/field";
import type { Concept } from "../data/concepts";
import type { Formation } from "../data/formations";
import type { Play, PlayPlayer } from "../data/playSchema";
import { applyConcept } from "./applyConcept";

export interface BuildPlayOptions {
  name: string;
  formation: Formation;
  concept: Concept;
  hash: Hash;
  yardLine: number;
  dropback?: Play["offense"]["dropback"];
  tags?: string[];
}

/** Baut ein vollständiges Play-Objekt (Austauschformat) aus Formation + Konzept + Ballposition. */
export function buildPlay({
  name,
  formation,
  concept,
  hash,
  yardLine,
  dropback = "5-step",
  tags = [],
}: BuildPlayOptions): Play {
  const applied = applyConcept(concept, formation, hash);

  const players: PlayPlayer[] = applied.map((assignment) => ({
    id: assignment.id,
    position: assignment.position,
    start: assignment.start,
    task:
      assignment.task.type === "route"
        ? {
            type: "route",
            routeName: assignment.task.route,
            route: assignment.route ?? [],
            progression: assignment.task.progression,
          }
        : { type: "block" },
  }));

  return {
    schemaVersion: 1,
    type: "play",
    name,
    tags,
    ball: { hash, yardLine },
    offense: {
      formation: formation.name,
      personnel: formation.personnel,
      qbAlignment: formation.qbAlignment,
      dropback,
      concept: concept.name,
      players,
    },
  };
}
