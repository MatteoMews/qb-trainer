import { lazy, Suspense, useState } from "react";
import { EditorPage } from "./features/editor/EditorPage";
import { DefensePage } from "./features/defense/DefensePage";
import { SimulationPage } from "./features/simulation/SimulationPage";
import { ReadsPage } from "./features/reads/ReadsPage";
import "./App.css";

// Three.js/R3F (für die Post-Snap-3D-Frage) nur laden, wenn der Quiz-Tab wirklich geöffnet wird.
const QuizPage = lazy(() => import("./features/quiz/QuizPage").then((m) => ({ default: m.QuizPage })));

const TABS = [
  { id: "playbook", label: "Playbook" },
  { id: "defenses", label: "Defenses" },
  { id: "simulation", label: "Simulation" },
  { id: "reads", label: "Reads" },
  { id: "quiz", label: "Quiz" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("playbook");

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
    </main>
  );
}

export default App;
