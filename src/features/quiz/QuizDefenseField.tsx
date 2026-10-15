import { Field2D } from "../../components/Field2D";
import type { Coverage } from "../../data/coverages";
import type { Front } from "../../data/fronts";
import type { Hash } from "../../data/field";
import { playPointToSvg } from "../../engine/coordinates";
import { placeDefense } from "../../engine/placeDefense";
import { DefenderToken } from "../defense/DefenderToken";

const DISPLAY_YARD_LINE = 50;

export interface QuizDefenseFieldProps {
  front: Front;
  coverage: Coverage;
  hash: Hash;
}

/** Statische Pre-Snap-Darstellung einer Front+Coverage, für Pre-Snap- und Disguise-Quizfragen. */
export function QuizDefenseField({ front, coverage, hash }: QuizDefenseFieldProps) {
  const defenders = placeDefense(front, coverage, hash);

  return (
    <Field2D>
      {defenders.map((defender) => {
        const svg = playPointToSvg(defender.start, DISPLAY_YARD_LINE);
        return (
          <DefenderToken
            key={defender.id}
            id={defender.id}
            position={defender.position}
            x={svg.x}
            y={svg.y}
            selected={false}
            onPointerDown={() => {}}
          />
        );
      })}
    </Field2D>
  );
}
