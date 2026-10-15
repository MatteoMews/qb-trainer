import { CONCEPTS, findConcept, type Concept } from "../data/concepts";
import { COVERAGES, findCoverage, type Coverage } from "../data/coverages";
import { FORMATIONS, findFormation, type Formation } from "../data/formations";
import { FRONTS, type Front } from "../data/fronts";
import type { Hash } from "../data/field";
import type { QuizQuestionType } from "../data/db";
import { applyConcept } from "./applyConcept";
import { generateProgression, type ProgressionStep } from "./readRules";
import { weightedPickByAccuracy } from "./adaptiveWeighting";

/**
 * Fragen werden aus den Daten-Bibliotheken generiert (Konzepte × Coverages × Formationen ×
 * Hash), nicht fest hinterlegt (siehe Projektauftrag 5.6). Jede generate*-Funktion ist deterministisch
 * bezüglich ihrer Eingaben; die Zufallsauswahl (welches Konzept/welche Coverage) erfolgt eine
 * Ebene darüber im Quiz-Store mittels engine/adaptiveWeighting.ts.
 */

const HASHES: readonly Hash[] = ["left", "middle", "right"];

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sampleDistinct<T>(items: readonly T[], count: number, exclude: T): T[] {
  const pool = items.filter((item) => item !== exclude);
  return shuffle(pool).slice(0, count);
}

export interface QuestionBase {
  id: string;
  type: QuizQuestionType;
  concept?: string;
  coverage?: string;
  prompt: string;
  explanation: string;
}

export interface PreSnapQuestion extends QuestionBase {
  type: "pre-snap";
  front: Front;
  coverageData: Coverage;
  hash: Hash;
  options: string[];
  correctAnswer: string;
}

export interface PostSnapReceiverQuestion extends QuestionBase {
  type: "post-snap-receiver";
  concept: string;
  coverage: string;
  conceptData: Concept;
  formation: Formation;
  front: Front;
  coverageData: Coverage;
  hash: Hash;
  correctRoleId: string;
}

export interface ProgressionOrderQuestion extends QuestionBase {
  type: "progression-order";
  concept: string;
  conceptData: Concept;
  formation: Formation;
  shuffledSteps: ProgressionStep[];
  correctOrder: string[];
}

export interface BeaterQuestion extends QuestionBase {
  type: "beater";
  coverage: string;
  coverageData: Coverage;
  options: string[];
  correctAnswer: string;
}

export interface DisguiseQuestion extends QuestionBase {
  type: "disguise";
  front: Front;
  preSnapCoverage: Coverage;
  actualCoverage: Coverage;
  hash: Hash;
  options: string[];
  correctAnswer: string;
}

export type QuizQuestion = PreSnapQuestion | PostSnapReceiverQuestion | ProgressionOrderQuestion | BeaterQuestion | DisguiseQuestion;

function pickDistractorNames(allItems: readonly { name: string }[], correct: { name: string; shell?: string }, count: number): string[] {
  const sameShell = correct.shell ? allItems.filter((item) => "shell" in item && (item as { shell?: string }).shell === correct.shell && item.name !== correct.name) : [];
  const preferred = shuffle(sameShell).slice(0, count);
  if (preferred.length >= count) return preferred.map((p) => p.name);
  const rest = allItems.filter((item) => item.name !== correct.name && !preferred.includes(item));
  const filler = shuffle(rest).slice(0, count - preferred.length);
  return [...preferred, ...filler].map((p) => p.name);
}

export function generatePreSnapQuestion(coverage: Coverage): PreSnapQuestion {
  const front = pickRandom(FRONTS);
  const hash = pickRandom(HASHES);
  const distractors = pickDistractorNames(COVERAGES, coverage, 3);
  const options = shuffle([coverage.name, ...distractors]);

  return {
    id: `pre-snap-${coverage.name}-${Date.now()}-${Math.random()}`,
    type: "pre-snap",
    coverage: coverage.name,
    coverageData: coverage,
    front,
    hash,
    options,
    correctAnswer: coverage.name,
    prompt: "Welche Coverage zeigt diese Pre-Snap-Aufstellung?",
    explanation: `${coverage.name}: ${coverage.description}`,
  };
}

export function generatePostSnapReceiverQuestion(concept: Concept, coverage: Coverage): PostSnapReceiverQuestion | null {
  const formation = pickRandom(FORMATIONS);
  const front = pickRandom(FRONTS);
  const hash = pickRandom(HASHES);
  const applied = applyConcept(concept, formation, hash).filter((a) => a.task.type === "route");
  const primary = applied.find((a) => a.task.type === "route" && a.task.progression === 1);
  if (!primary) return null;

  return {
    id: `post-snap-${concept.name}-${coverage.name}-${Date.now()}-${Math.random()}`,
    type: "post-snap-receiver",
    concept: concept.name,
    coverage: coverage.name,
    conceptData: concept,
    formation,
    front,
    coverageData: coverage,
    hash,
    correctRoleId: primary.id,
    prompt: `${concept.name} gegen ${coverage.name}: Klicke auf den Receiver, zu dem der Ball soll (Progression 1).`,
    explanation: `Der Primary-Read bei ${concept.name} ist ${primary.id}. ${concept.description}`,
  };
}

export function generateProgressionOrderQuestion(concept: Concept): ProgressionOrderQuestion | null {
  const formation = pickRandom(FORMATIONS);
  const hash: Hash = "middle";
  const steps = generateProgression(concept, formation, hash);
  if (steps.length < 2) return null;

  return {
    id: `progression-${concept.name}-${Date.now()}-${Math.random()}`,
    type: "progression-order",
    concept: concept.name,
    conceptData: concept,
    formation,
    shuffledSteps: shuffle(steps),
    correctOrder: steps.map((s) => s.role),
    prompt: `Bringe die Progression von "${concept.name}" in die richtige Reihenfolge (1 → ${steps.length}).`,
    explanation: steps.map((s) => `${s.progression}. ${s.role} (${s.routeName}): ${s.readRule}`).join(" "),
  };
}

export function generateBeaterQuestion(coverage: Coverage): BeaterQuestion | null {
  if (coverage.beaterConcepts.length === 0) return null;
  const correctAnswer = pickRandom(coverage.beaterConcepts);
  const distractors = sampleDistinct(
    CONCEPTS.map((c) => c.name).filter((name) => !coverage.beaterConcepts.includes(name)),
    3,
    correctAnswer,
  );

  return {
    id: `beater-${coverage.name}-${Date.now()}-${Math.random()}`,
    type: "beater",
    coverage: coverage.name,
    coverageData: coverage,
    options: shuffle([correctAnswer, ...distractors]),
    correctAnswer,
    prompt: `Der Gegner spielt ${coverage.name}. Welches Konzept rufst du?`,
    explanation: `${coverage.name} ist anfällig für: ${coverage.weaknesses.join(", ")}. "${correctAnswer}" nutzt das gezielt aus.`,
  };
}

export function generateDisguiseQuestion(): DisguiseQuestion | null {
  const preSnapCoverage = pickRandom(COVERAGES);
  const candidates = COVERAGES.filter((c) => c.shell !== preSnapCoverage.shell);
  if (candidates.length === 0) return null;
  const actualCoverage = pickRandom(candidates);
  const front = pickRandom(FRONTS);
  const hash = pickRandom(HASHES);

  const distractors = sampleDistinct(COVERAGES, 3, actualCoverage).map((c) => c.name);

  return {
    id: `disguise-${preSnapCoverage.name}-${actualCoverage.name}-${Date.now()}-${Math.random()}`,
    type: "disguise",
    coverage: actualCoverage.name,
    front,
    preSnapCoverage,
    actualCoverage,
    hash,
    options: shuffle([actualCoverage.name, ...distractors]),
    correctAnswer: actualCoverage.name,
    prompt: `Die Defense zeigt pre-snap "${preSnapCoverage.name}" und rotiert post-snap. Was ist die tatsächliche Coverage?`,
    explanation: `Pre-Snap-Shell: ${preSnapCoverage.name} (${preSnapCoverage.shell}). Nach der Rotation wird tatsächlich ${actualCoverage.name} gespielt: ${actualCoverage.description}`,
  };
}

export interface QuizFilter {
  coverageNames?: readonly string[];
  conceptNames?: readonly string[];
}

export function filteredCoverages(filter: QuizFilter): Coverage[] {
  if (!filter.coverageNames || filter.coverageNames.length === 0) return [...COVERAGES];
  return COVERAGES.filter((c) => filter.coverageNames!.includes(c.name));
}

export function filteredConcepts(filter: QuizFilter): Concept[] {
  if (!filter.conceptNames || filter.conceptNames.length === 0) return [...CONCEPTS];
  return CONCEPTS.filter((c) => filter.conceptNames!.includes(c.name));
}

export { findConcept, findCoverage, findFormation };

export type QuizAnswer = string | string[];

export function checkAnswer(question: QuizQuestion, answer: QuizAnswer): boolean {
  switch (question.type) {
    case "pre-snap":
    case "beater":
    case "disguise":
      return answer === question.correctAnswer;
    case "post-snap-receiver":
      return answer === question.correctRoleId;
    case "progression-order":
      return Array.isArray(answer) && answer.length === question.correctOrder.length && answer.every((role, i) => role === question.correctOrder[i]);
  }
}

/** Wählt zufällig (adaptiv gewichtet) einen Fragetyp + Konzept/Coverage und generiert daraus
 *  eine Frage. Manche Kombinationen liefern kein gültiges Ergebnis (z.B. eine Coverage ohne
 *  Beater-Konzepte für den "beater"-Fragetyp) - in dem Fall wird einfach neu gewürfelt. */
export function generateRandomQuestion(
  enabledTypes: readonly QuizQuestionType[],
  filter: QuizFilter,
  accuracyByCoverage: ReadonlyMap<string, number>,
  accuracyByConcept: ReadonlyMap<string, number>,
): QuizQuestion | null {
  const coverages = filteredCoverages(filter);
  const concepts = filteredConcepts(filter);
  if (enabledTypes.length === 0 || (coverages.length === 0 && concepts.length === 0)) return null;

  for (let attempt = 0; attempt < 25; attempt++) {
    const type = pickRandom(enabledTypes);
    const coverage = coverages.length > 0 ? weightedPickByAccuracy(coverages, (c) => c.name, accuracyByCoverage) : undefined;
    const concept = concepts.length > 0 ? weightedPickByAccuracy(concepts, (c) => c.name, accuracyByConcept) : undefined;

    let question: QuizQuestion | null = null;
    if (type === "pre-snap" && coverage) question = generatePreSnapQuestion(coverage);
    else if (type === "beater" && coverage) question = generateBeaterQuestion(coverage);
    else if (type === "disguise") question = generateDisguiseQuestion();
    else if (type === "post-snap-receiver" && concept && coverage) question = generatePostSnapReceiverQuestion(concept, coverage);
    else if (type === "progression-order" && concept) question = generateProgressionOrderQuestion(concept);

    if (question) return question;
  }
  return null;
}
