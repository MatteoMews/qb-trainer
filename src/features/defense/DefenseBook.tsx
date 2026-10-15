import { useEffect, useState } from "react";
import type { SavedDefense } from "../../data/db";
import { deleteDefense, duplicateDefense, listDefenses, renameDefense } from "../../data/defenseRepository";
import { useDefenseStore } from "./defenseStore";
import "./DefenseBook.css";

export interface DefenseBookProps {
  refreshToken: number;
}

export function DefenseBook({ refreshToken }: DefenseBookProps) {
  const [defenses, setDefenses] = useState<SavedDefense[]>([]);
  const loadDefense = useDefenseStore((state) => state.loadDefense);

  function refresh() {
    listDefenses().then(setDefenses);
  }

  useEffect(() => {
    let cancelled = false;
    listDefenses().then((data) => {
      if (!cancelled) setDefenses(data);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  async function handleRename(defense: SavedDefense) {
    const name = window.prompt("Neuer Name:", defense.data.name);
    if (!name) return;
    await renameDefense(defense.id!, name);
    refresh();
  }

  async function handleDuplicate(defense: SavedDefense) {
    await duplicateDefense(defense.id!);
    refresh();
  }

  async function handleDelete(defense: SavedDefense) {
    if (!window.confirm(`„${defense.data.name}" wirklich löschen?`)) return;
    await deleteDefense(defense.id!);
    refresh();
  }

  if (defenses.length === 0) {
    return <p className="defense-book__empty">Noch keine Defenses gespeichert.</p>;
  }

  return (
    <ul className="defense-book">
      {defenses.map((defense) => (
        <li key={defense.id} className="defense-book__item">
          <div className="defense-book__meta">
            <span className="defense-book__name">{defense.data.name}</span>
            <span className="defense-book__sub">
              {defense.data.front} · {defense.data.coverage}
            </span>
          </div>
          <div className="defense-book__actions">
            <button type="button" onClick={() => loadDefense(defense.data)}>
              Laden
            </button>
            <button type="button" onClick={() => handleDuplicate(defense)}>
              Duplizieren
            </button>
            <button type="button" onClick={() => handleRename(defense)}>
              Umbenennen
            </button>
            <button type="button" onClick={() => handleDelete(defense)}>
              Löschen
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
