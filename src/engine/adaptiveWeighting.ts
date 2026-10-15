/**
 * Einfaches Spaced-Repetition-Gewicht (siehe Projektauftrag 5.6): Items (Coverages/Konzepte),
 * die oft falsch beantwortet wurden, bekommen ein höheres Gewicht und erscheinen in Quiz-Fragen
 * häufiger. Ohne Verlauf (accuracy = undefined) bekommt ein Item neutrales Gewicht, damit neue
 * Coverages/Konzepte nicht benachteiligt werden.
 */

const MIN_WEIGHT = 0.15;
const NEUTRAL_WEIGHT = 1;

export function computeItemWeight(accuracy: number | undefined): number {
  if (accuracy === undefined) return NEUTRAL_WEIGHT;
  return Math.max(MIN_WEIGHT, 1 - accuracy);
}

/** Gewichtete Zufallsauswahl aus einer Liste. Fällt bei leerer Gewichtssumme auf uniforme
 *  Zufallsauswahl zurück. */
export function weightedRandomPick<T>(items: readonly T[], weights: readonly number[]): T {
  if (items.length === 0) throw new Error("weightedRandomPick: leere Liste");
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (total <= 0) return items[Math.floor(Math.random() * items.length)];

  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/** Wählt ein Item gewichtet nach seiner (inversen) Trefferquote aus `accuracyByKey`. */
export function weightedPickByAccuracy<T>(items: readonly T[], keyOf: (item: T) => string, accuracyByKey: ReadonlyMap<string, number>): T {
  const weights = items.map((item) => computeItemWeight(accuracyByKey.get(keyOf(item))));
  return weightedRandomPick(items, weights);
}
