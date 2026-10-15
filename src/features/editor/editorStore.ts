import { create } from "zustand";
import { hashX, type Hash } from "../../data/field";
import { FORMATIONS, findFormation, type Formation } from "../../data/formations";
import type { Concept } from "../../data/concepts";
import type { OffensePosition } from "../../data/positions";
import type { RouteName } from "../../data/routeTree";
import type { Play } from "../../data/playSchema";
import type { Point } from "../../data/schemas";
import { applyConcept } from "../../engine/applyConcept";
import { placeFormation } from "../../engine/formationPlacement";
import { generateRoute, type FieldSide } from "../../engine/routeGenerator";

export type EditorTask =
  | { type: "route"; routeName: RouteName; points: Point[] }
  | { type: "block" }
  | { type: "none" };

export interface EditorPlayer {
  id: string;
  position: OffensePosition;
  start: Point;
  task: EditorTask;
}

interface EditorState {
  playName: string;
  formation: Formation;
  hash: Hash;
  yardLine: number;
  dropback: Play["offense"]["dropback"];
  tags: string[];
  players: EditorPlayer[];
  selectedId: string | null;
  isDrawingRoute: boolean;
  /** Konzept, das zuletzt unverändert angewendet wurde (für den Quiz-Filter "nur meine
   *  Spielzüge", siehe engine/quizGenerators.ts). Wird bei manuellen Anpassungen gelöscht. */
  lastAppliedConcept: string | undefined;

  setPlayName(name: string): void;
  loadFormation(formation: Formation): void;
  setHash(hash: Hash): void;
  setYardLine(yardLine: number): void;
  applyConceptToField(concept: Concept): void;
  selectPlayer(id: string | null): void;
  movePlayer(id: string, point: Point): void;
  assignRoute(id: string, routeName: RouteName): void;
  setBlock(id: string): void;
  clearAssignment(id: string): void;
  startDrawingRoute(id: string): void;
  addRouteWaypoint(point: Point): void;
  finishDrawingRoute(): void;
  mirrorAll(): void;
  toPlay(): Play;
  loadPlay(play: Play): void;
}

function sideOf(point: Point, ballX: number): FieldSide {
  return point.x >= ballX ? "right" : "left";
}

function playersFromFormation(formation: Formation, hash: Hash): EditorPlayer[] {
  return placeFormation(formation, hash).map((player) => ({
    id: player.id,
    position: player.position,
    start: player.start,
    task: { type: "none" },
  }));
}

export const useEditorStore = create<EditorState>((set, get) => ({
  playName: "Neuer Spielzug",
  formation: FORMATIONS[0],
  hash: "middle",
  yardLine: 50,
  dropback: "5-step",
  tags: [],
  players: playersFromFormation(FORMATIONS[0], "middle"),
  selectedId: null,
  isDrawingRoute: false,
  lastAppliedConcept: undefined,

  setPlayName: (playName) => set({ playName }),

  loadFormation: (formation) =>
    set((state) => ({
      formation,
      players: playersFromFormation(formation, state.hash),
      selectedId: null,
      isDrawingRoute: false,
      lastAppliedConcept: undefined,
    })),

  setHash: (hash) =>
    set((state) => ({
      hash,
      players: playersFromFormation(state.formation, hash),
      selectedId: null,
      isDrawingRoute: false,
    })),

  setYardLine: (yardLine) => set({ yardLine: Math.min(100, Math.max(0, yardLine)) }),

  applyConceptToField: (concept) =>
    set((state) => {
      const applied = applyConcept(concept, state.formation, state.hash);
      const appliedById = new Map(applied.map((a) => [a.id, a]));
      return {
        players: state.players.map((player) => {
          const match = appliedById.get(player.id);
          if (!match) return player;
          const task: EditorTask =
            match.task.type === "block"
              ? { type: "block" }
              : { type: "route", routeName: match.task.route, points: match.route ?? [] };
          return { ...player, start: match.start, task };
        }),
        lastAppliedConcept: concept.name,
      };
    }),

  selectPlayer: (id) => set({ selectedId: id, isDrawingRoute: false }),

  movePlayer: (id, point) =>
    set((state) => ({
      players: state.players.map((player) => (player.id === id ? { ...player, start: point } : player)),
      lastAppliedConcept: undefined,
    })),

  assignRoute: (id, routeName) =>
    set((state) => {
      const ballX = hashX(state.hash);
      const player = state.players.find((p) => p.id === id);
      if (!player) return state;
      const points = generateRoute(routeName, { startX: player.start.x, side: sideOf(player.start, ballX) });
      return {
        players: state.players.map((p) => (p.id === id ? { ...p, task: { type: "route", routeName, points } } : p)),
        lastAppliedConcept: undefined,
      };
    }),

  setBlock: (id) =>
    set((state) => ({
      players: state.players.map((p) => (p.id === id ? { ...p, task: { type: "block" } } : p)),
      lastAppliedConcept: undefined,
    })),

  clearAssignment: (id) =>
    set((state) => ({
      players: state.players.map((p) => (p.id === id ? { ...p, task: { type: "none" } } : p)),
      lastAppliedConcept: undefined,
    })),

  startDrawingRoute: (id) =>
    set((state) => ({
      selectedId: id,
      isDrawingRoute: true,
      players: state.players.map((p) => (p.id === id ? { ...p, task: { type: "route", routeName: "Go", points: [] } } : p)),
      lastAppliedConcept: undefined,
    })),

  addRouteWaypoint: (point) =>
    set((state) => {
      if (!state.isDrawingRoute || !state.selectedId) return state;
      return {
        players: state.players.map((p) =>
          p.id === state.selectedId && p.task.type === "route"
            ? { ...p, task: { ...p.task, points: [...p.task.points, point] } }
            : p,
        ),
      };
    }),

  finishDrawingRoute: () => set({ isDrawingRoute: false }),

  mirrorAll: () =>
    set((state) => {
      const ballX = hashX(state.hash);
      const mirrorX = (x: number) => 2 * ballX - x;
      return {
        players: state.players.map((player) => ({
          ...player,
          start: { x: mirrorX(player.start.x), y: player.start.y },
          task:
            player.task.type === "route"
              ? { ...player.task, points: player.task.points.map((pt) => ({ x: mirrorX(pt.x), y: pt.y })) }
              : player.task,
        })),
        // Eine gespiegelte Formation passt weiterhin zum Konzept (Rollen bleiben gleich),
        // daher bleibt lastAppliedConcept hier bewusst erhalten.
      };
    }),

  toPlay: () => {
    const state = get();
    return {
      schemaVersion: 1,
      type: "play",
      name: state.playName,
      tags: state.tags,
      ball: { hash: state.hash, yardLine: state.yardLine },
      offense: {
        formation: state.formation.name,
        personnel: state.formation.personnel,
        qbAlignment: state.formation.qbAlignment,
        dropback: state.dropback,
        concept: state.lastAppliedConcept,
        players: state.players
          .filter((p) => p.task.type !== "none")
          .map((p) => ({
            id: p.id,
            position: p.position,
            start: p.start,
            task:
              p.task.type === "route"
                ? { type: "route" as const, routeName: p.task.routeName, route: p.task.points, progression: undefined }
                : { type: "block" as const },
          })),
      },
    };
  },

  loadPlay: (play) => {
    const formation = findFormation(play.offense.formation) ?? get().formation;
    const basePlayers = playersFromFormation(formation, play.ball.hash);
    const savedById = new Map(play.offense.players.map((p) => [p.id, p]));

    set({
      playName: play.name,
      formation,
      hash: play.ball.hash,
      yardLine: play.ball.yardLine,
      dropback: play.offense.dropback,
      tags: play.tags,
      selectedId: null,
      isDrawingRoute: false,
      lastAppliedConcept: play.offense.concept,
      players: basePlayers.map((player) => {
        const saved = savedById.get(player.id);
        if (!saved) return player;
        const task: EditorTask =
          saved.task.type === "route"
            ? { type: "route", routeName: saved.task.routeName as RouteName, points: saved.task.route }
            : { type: "block" };
        return { ...player, start: saved.start, task };
      }),
    });
  },
}));
