import { useState } from "react";
import { EditorPage } from "./features/editor/EditorPage";
import { DefensePage } from "./features/defense/DefensePage";
import "./App.css";

const TABS = [
  { id: "playbook", label: "Playbook" },
  { id: "defenses", label: "Defenses" },
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
    </main>
  );
}

export default App;
