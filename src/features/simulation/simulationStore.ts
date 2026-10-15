import { create } from "zustand";
import type { SavedDefense, SavedPlay } from "../../data/db";
import { SIM_DURATION_S } from "../../engine/simulate";

export type PlaybackSpeed = 0.25 | 0.5 | 1;

interface SimulationState {
  play: SavedPlay | null;
  defense: SavedDefense | null;
  t: number;
  isPlaying: boolean;
  speed: PlaybackSpeed;
  showZones: boolean;
  showOpenIndicator: boolean;
  showLeverage: boolean;

  selectPlay(play: SavedPlay | null): void;
  selectDefense(defense: SavedDefense | null): void;
  setT(t: number): void;
  stepBy(deltaS: number): void;
  setPlaying(playing: boolean): void;
  setSpeed(speed: PlaybackSpeed): void;
  reset(): void;
  toggleShowZones(): void;
  toggleShowOpenIndicator(): void;
  toggleShowLeverage(): void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  play: null,
  defense: null,
  t: 0,
  isPlaying: false,
  speed: 1,
  showZones: true,
  showOpenIndicator: true,
  showLeverage: false,

  selectPlay: (play) => set({ play, t: 0, isPlaying: false }),
  selectDefense: (defense) => set({ defense, t: 0, isPlaying: false }),

  setT: (t) => set({ t: Math.min(SIM_DURATION_S, Math.max(0, t)) }),

  stepBy: (deltaS) =>
    set((state) => ({
      t: Math.min(SIM_DURATION_S, Math.max(0, state.t + deltaS)),
      isPlaying: false,
    })),

  setPlaying: (isPlaying) =>
    set((state) => {
      // Play nach dem Ende gedrückt -> von vorn beginnen, statt stehen zu bleiben.
      if (isPlaying && state.t >= SIM_DURATION_S) return { isPlaying: true, t: 0 };
      return { isPlaying };
    }),

  setSpeed: (speed) => set({ speed }),

  reset: () => set({ t: 0, isPlaying: false }),

  toggleShowZones: () => set((state) => ({ showZones: !state.showZones })),
  toggleShowOpenIndicator: () => set((state) => ({ showOpenIndicator: !state.showOpenIndicator })),
  toggleShowLeverage: () => set((state) => ({ showLeverage: !state.showLeverage })),
}));
