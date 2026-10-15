import { create } from "zustand";
import type { Hash } from "../../data/field";
import { FRONTS, findFront, type Front } from "../../data/fronts";
import { COVERAGES, findCoverage, type Coverage } from "../../data/coverages";
import type { DefensePosition } from "../../data/positions";
import type { Defense } from "../../data/defenseSchema";
import type { Point } from "../../data/schemas";
import { placeDefense } from "../../engine/placeDefense";
import { buildDefense } from "../../engine/buildDefense";

export interface DefensePlayerState {
  id: string;
  position: DefensePosition;
  start: Point;
  group: "box" | "secondary";
}

interface DefenseState {
  defenseName: string;
  front: Front;
  coverage: Coverage;
  pressure: string | undefined;
  disguisedAsCoverage: Coverage | undefined;
  hash: Hash;
  players: DefensePlayerState[];
  selectedId: string | null;
  showingPreSnapDisguise: boolean;

  setDefenseName(name: string): void;
  loadFront(front: Front): void;
  loadCoverage(coverage: Coverage): void;
  setPressure(pressure: string | undefined): void;
  setDisguise(coverage: Coverage | undefined): void;
  setHash(hash: Hash): void;
  selectPlayer(id: string | null): void;
  movePlayer(id: string, point: Point): void;
  toggleDisguiseView(): void;
  toDefense(): Defense;
  loadDefense(defense: Defense): void;
}

const SECONDARY_POSITIONS = new Set<DefensePosition>(["CB", "NB", "FS", "SS", "S"]);

function computePlayers(front: Front, coverage: Coverage, hash: Hash): DefensePlayerState[] {
  return placeDefense(front, coverage, hash).map((p) => ({
    id: p.id,
    position: p.position,
    start: p.start,
    group: p.group,
  }));
}

export const useDefenseStore = create<DefenseState>((set, get) => ({
  defenseName: "Neue Defense",
  front: FRONTS[0],
  coverage: COVERAGES[0],
  pressure: undefined,
  disguisedAsCoverage: undefined,
  hash: "middle",
  players: computePlayers(FRONTS[0], COVERAGES[0], "middle"),
  selectedId: null,
  showingPreSnapDisguise: false,

  setDefenseName: (defenseName) => set({ defenseName }),

  loadFront: (front) =>
    set((state) => {
      const activeCoverage = state.showingPreSnapDisguise && state.disguisedAsCoverage ? state.disguisedAsCoverage : state.coverage;
      return { front, players: computePlayers(front, activeCoverage, state.hash), selectedId: null };
    }),

  loadCoverage: (coverage) =>
    set((state) => ({
      coverage,
      players: computePlayers(state.front, state.showingPreSnapDisguise && state.disguisedAsCoverage ? state.disguisedAsCoverage : coverage, state.hash),
      selectedId: null,
    })),

  setPressure: (pressure) => set({ pressure }),

  setDisguise: (disguisedAsCoverage) =>
    set((state) => ({
      disguisedAsCoverage,
      players: state.showingPreSnapDisguise
        ? computePlayers(state.front, disguisedAsCoverage ?? state.coverage, state.hash)
        : state.players,
    })),

  setHash: (hash) =>
    set((state) => {
      const activeCoverage = state.showingPreSnapDisguise && state.disguisedAsCoverage ? state.disguisedAsCoverage : state.coverage;
      return { hash, players: computePlayers(state.front, activeCoverage, hash), selectedId: null };
    }),

  selectPlayer: (id) => set({ selectedId: id }),

  movePlayer: (id, point) =>
    set((state) => ({
      players: state.players.map((p) => (p.id === id ? { ...p, start: point } : p)),
    })),

  toggleDisguiseView: () =>
    set((state) => {
      const next = !state.showingPreSnapDisguise;
      const activeCoverage = next && state.disguisedAsCoverage ? state.disguisedAsCoverage : state.coverage;
      return { showingPreSnapDisguise: next, players: computePlayers(state.front, activeCoverage, state.hash) };
    }),

  toDefense: () => {
    const state = get();
    return buildDefense({
      name: state.defenseName,
      front: state.front,
      coverage: state.coverage,
      hash: state.hash,
      pressure: state.pressure,
      disguisedAsCoverage: state.disguisedAsCoverage,
    });
  },

  loadDefense: (defense) => {
    const front = findFront(defense.front) ?? get().front;
    const coverage = findCoverage(defense.coverage) ?? get().coverage;
    const disguisedAsCoverage = defense.disguisedAsCoverage ? findCoverage(defense.disguisedAsCoverage) : undefined;

    set({
      defenseName: defense.name,
      front,
      coverage,
      pressure: defense.pressure,
      disguisedAsCoverage,
      selectedId: null,
      showingPreSnapDisguise: false,
      players: defense.players.map((p) => ({
        id: p.id,
        position: p.position as DefensePosition,
        start: p.start,
        group: SECONDARY_POSITIONS.has(p.position as DefensePosition) ? "secondary" : "box",
      })),
    });
  },
}));
