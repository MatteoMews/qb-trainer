import { Field2D } from "../../components/Field2D";
import type { Concept } from "../../data/concepts";
import type { Formation } from "../../data/formations";
import type { Front } from "../../data/fronts";
import type { Coverage } from "../../data/coverages";
import type { Hash } from "../../data/field";
import { applyConcept } from "../../engine/applyConcept";
import { playPointToSvg } from "../../engine/coordinates";
import { placeDefense } from "../../engine/placeDefense";
import { PlayerToken } from "../editor/PlayerToken";
import { RoutePath } from "../editor/RoutePath";
import { DefenderToken } from "../defense/DefenderToken";
import "./ReadsField.css";

const DISPLAY_YARD_LINE = 50;

export interface ReadsFieldProps {
  concept: Concept;
  formation: Formation;
  hash: Hash;
  front?: Front;
  coverage?: Coverage;
  highlightDefenderId?: string;
}

export function ReadsField({ concept, formation, hash, front, coverage, highlightDefenderId }: ReadsFieldProps) {
  const applied = applyConcept(concept, formation, hash);
  const defenders = front && coverage ? placeDefense(front, coverage, hash) : [];

  return (
    <div className="reads-field">
      <Field2D>
        {applied.map(
          (assignment) =>
            assignment.task.type === "route" && (
              <RoutePath
                key={`route-${assignment.id}`}
                start={assignment.start}
                waypoints={assignment.route ?? []}
                ballYardLine={DISPLAY_YARD_LINE}
                selected={false}
              />
            ),
        )}

        {defenders.map((defender) => {
          const svg = playPointToSvg(defender.start, DISPLAY_YARD_LINE);
          return (
            <DefenderToken
              key={defender.id}
              id={defender.id}
              position={defender.position}
              x={svg.x}
              y={svg.y}
              selected={defender.id === highlightDefenderId}
              onPointerDown={() => {}}
            />
          );
        })}

        {applied.map((assignment) => {
          const svg = playPointToSvg(assignment.start, DISPLAY_YARD_LINE);
          const progression = assignment.task.type === "route" ? assignment.task.progression : undefined;
          return (
            <g key={assignment.id}>
              <PlayerToken
                id={assignment.id}
                position={assignment.position}
                x={svg.x}
                y={svg.y}
                selected={false}
                onPointerDown={() => {}}
              />
              {progression !== undefined && (
                <g transform={`translate(${svg.x + 9}, ${svg.y - 9})`}>
                  <circle r={6} className="reads-field__progression-badge" />
                  <text className="reads-field__progression-label" textAnchor="middle" dominantBaseline="middle">
                    {progression}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </Field2D>
    </div>
  );
}
