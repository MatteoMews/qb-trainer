import { create } from "zustand";

interface ScoutingState {
  selectedOpponentId: number | null;
  setSelectedOpponentId: (id: number | null) => void;
}

export const useScoutingStore = create<ScoutingState>((set) => ({
  selectedOpponentId: null,
  setSelectedOpponentId: (id) => set({ selectedOpponentId: id }),
}));
