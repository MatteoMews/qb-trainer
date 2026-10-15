import { lazy, Suspense } from "react";
import { EditorPage } from "./features/editor/EditorPage";
import { DefensePage } from "./features/defense/DefensePage";
import { SimulationPage } from "./features/simulation/SimulationPage";
import { ReadsPage } from "./features/reads/ReadsPage";
import { SettingsPage } from "./features/settings/SettingsPage";
import { TABS, useNavStore } from "./app/navStore";
import "./App.css";

// Three.js/R3F (für die Post-Snap-3D-Frage) nur laden, wenn der Quiz-Tab wirklich geöffnet wird.
const QuizPage = lazy(() => import("./features/quiz/QuizPage").then((m) => ({ default: m.QuizPage })));
const ScoutingPage = lazy(() => import("./features/scouting/ScoutingPage").then((m) => ({ default: m.ScoutingPage })));

function App() {
  const activeTab = useNavStore((state) => state.activeTab);
  const setActiveTab = useNavStore((state) => state.setActiveTab);

  return (
    <main className="app">
      <h1>QB Trainer</h1>
      <nav className="app__nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.id === activeTab ? "app__nav-item app__nav-item--active" : "app__nav-item"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      {activeTab === "playbook" && <EditorPage />}
      {activeTab === "defenses" && <DefensePage />}
      {activeTab === "simulation" && <SimulationPage />}
      {activeTab === "reads" && <ReadsPage />}
      {activeTab === "quiz" && (
        <Suspense fallback={<p>Quiz wird geladen…</p>}>
          <QuizPage />
        </Suspense>
      )}
      {activeTab === "scouting" && (
        <Suspense fallback={<p>Scouting wird geladen…</p>}>
          <ScoutingPage />
        </Suspense>
      )}
      {activeTab === "settings" && <SettingsPage />}
    </main>
  );
}

export default App;
