import { create } from "zustand";

export const TABS = [
  { id: "playbook", label: "Playbook" },
  { id: "defenses", label: "Defenses" },
  { id: "simulation", label: "Simulation" },
  { id: "reads", label: "Reads" },
  { id: "quiz", label: "Quiz" },
  { id: "scouting", label: "Scouting" },
  { id: "settings", label: "Einstellungen" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

interface NavState {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

/** Geteilter Navigations-Zustand, damit ein Feature (z.B. Scouting: "Trainiere gegen Gegner X")
 *  gezielt zu einem anderen Tab wechseln kann, ohne App.tsx-Props durchzureichen. */
export const useNavStore = create<NavState>((set) => ({
  activeTab: "playbook",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
