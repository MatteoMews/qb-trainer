import { describe, expect, it } from "vitest";
import { findConcept } from "../data/concepts";
import { findCoverage } from "../data/coverages";
import {
  checkAnswer,
  generateBeaterQuestion,
  generateDisguiseQuestion,
  generatePostSnapReceiverQuestion,
  generatePreSnapQuestion,
  generateProgressionOrderQuestion,
  generateRandomQuestion,
} from "./quizGenerators";

describe("generatePreSnapQuestion", () => {
  it("includes the correct coverage among 4 unique options", () => {
    const coverage = findCoverage("Cover 3 Sky")!;
    const question = generatePreSnapQuestion(coverage);

    expect(question.options).toContain(coverage.name);
    expect(new Set(question.options).size).toBe(question.options.length);
    expect(question.correctAnswer).toBe(coverage.name);
  });
});

describe("generatePostSnapReceiverQuestion", () => {
  it("points to the concept's progression-1 role as the correct receiver", () => {
    const concept = findConcept("Stick")!;
    const coverage = findCoverage("Cover 3 Sky")!;

    let question = null;
    for (let i = 0; i < 20 && !question; i++) {
      question = generatePostSnapReceiverQuestion(concept, coverage);
    }

    expect(question).not.toBeNull();
    expect(question!.correctRoleId.length).toBeGreaterThan(0);
  });
});

describe("generateProgressionOrderQuestion", () => {
  it("shuffles the steps but keeps the same roles as the correct order", () => {
    const concept = findConcept("Stick")!;
    const question = generateProgressionOrderQuestion(concept)!;

    expect(question.correctOrder.length).toBeGreaterThanOrEqual(2);
    expect(question.shuffledSteps.map((s) => s.role).sort()).toEqual([...question.correctOrder].sort());
  });
});

describe("generateBeaterQuestion", () => {
  it("picks a real beater concept as the correct answer with distinct distractors", () => {
    const coverage = findCoverage("Cover 3 Buzz")!;
    const question = generateBeaterQuestion(coverage)!;

    expect(coverage.beaterConcepts).toContain(question.correctAnswer);
    expect(question.options).toContain(question.correctAnswer);
    expect(new Set(question.options).size).toBe(question.options.length);
    expect(question.options.filter((o) => coverage.beaterConcepts.includes(o))).toEqual([question.correctAnswer]);
  });
});

describe("generateDisguiseQuestion", () => {
  it("shows a pre-snap shell that differs from the actual (rotated) coverage", () => {
    const question = generateDisguiseQuestion()!;

    expect(question.preSnapCoverage.shell).not.toBe(question.actualCoverage.shell);
    expect(question.correctAnswer).toBe(question.actualCoverage.name);
    expect(question.options).toContain(question.actualCoverage.name);
  });

  it("restricts the actual (correct) coverage to a given pool, e.g. a scouted opponent's tendencies", () => {
    const pool = [findCoverage("Cover 3 Buzz")!];
    for (let i = 0; i < 10; i++) {
      const question = generateDisguiseQuestion(pool)!;
      expect(question.actualCoverage.name).toBe("Cover 3 Buzz");
    }
  });
});

describe("checkAnswer", () => {
  it("accepts the correct string answer and rejects a wrong one", () => {
    const question = generateBeaterQuestion(findCoverage("Cover 3 Buzz")!)!;
    expect(checkAnswer(question, question.correctAnswer)).toBe(true);
    expect(checkAnswer(question, "definitely-not-an-option")).toBe(false);
  });

  it("checks progression order answers element-by-element", () => {
    const question = generateProgressionOrderQuestion(findConcept("Stick")!)!;
    expect(checkAnswer(question, question.correctOrder)).toBe(true);
    expect(checkAnswer(question, [...question.correctOrder].reverse())).toBe(false);
  });
});

describe("generateRandomQuestion", () => {
  it("generates a question from the enabled types without crashing", () => {
    const accuracy = new Map<string, number>();
    for (let i = 0; i < 10; i++) {
      const question = generateRandomQuestion(
        ["pre-snap", "beater", "disguise", "post-snap-receiver", "progression-order"],
        {},
        accuracy,
        accuracy,
      );
      expect(question).not.toBeNull();
    }
  });

  it("returns null when no question types are enabled", () => {
    expect(generateRandomQuestion([], {}, new Map(), new Map())).toBeNull();
  });
});
