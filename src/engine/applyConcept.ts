import type { Hash } from "../data/field";
import type { Concept, ConceptAssignment } from "../data/concepts";
import type { Formation } from "../data/formations";
import type { OffensePosition } from "../data/positions";
import type { Point } from "../data/schemas";
import { placeFormation } from "./formationPlacement";
import { generateRoute, type FieldSide } from "./routeGenerator";

export interface AppliedAssignment {
  id: string;
  position: OffensePosition;
  start: Point;
  task: ConceptAssignment["task"];
  /** Nur gesetzt, wenn task.type === "route". */
  route?: Point[];
}

/** Wendet ein Konzept auf eine Formation an einem bestimmten Hash an: löst Rollen (X/Z/H/Y/F/RB)
 *  zu platzierten Spielern auf und generiert die Routen. Rollen, die es in der gewählten
 *  Formation nicht gibt, werden stillschweigend übersprungen (das Konzept passt dann nur
 *  teilweise zu dieser Formation). */
export function applyConcept(concept: Concept, formation: Formation, hash: Hash): AppliedAssignment[] {
  const placed = placeFormation(formation, hash);
  const placedById = new Map(placed.map((player) => [player.id, player]));
  const formationById = new Map(formation.players.map((player) => [player.id, player]));

  const applied: AppliedAssignment[] = [];
  for (const assignment of concept.assignments) {
    const placedPlayer = placedById.get(assignment.role);
    const formationPlayer = formationById.get(assignment.role);
    if (!placedPlayer || !formationPlayer) continue;

    if (assignment.task.type === "block") {
      applied.push({ id: placedPlayer.id, position: placedPlayer.position, start: placedPlayer.start, task: assignment.task });
      continue;
    }

    const side: FieldSide = formationPlayer.offset.dx < 0 ? "left" : "right";
    const route = generateRoute(assignment.task.route, { startX: placedPlayer.start.x, side });
    applied.push({ id: placedPlayer.id, position: placedPlayer.position, start: placedPlayer.start, task: assignment.task, route });
  }
  return applied;
}
