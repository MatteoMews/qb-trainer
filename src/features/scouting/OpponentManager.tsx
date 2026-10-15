import { useEffect, useState } from "react";
import type { Opponent } from "../../data/db";
import { createOpponent, deleteOpponent, listOpponents, updateOpponent } from "../../data/scoutingRepository";
import { useScoutingStore } from "./scoutingStore";
import "./OpponentManager.css";

export function OpponentManager() {
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [name, setName] = useState("");
  const [league, setLeague] = useState("");
  const [notes, setNotes] = useState("");
  const { selectedOpponentId, setSelectedOpponentId } = useScoutingStore();

  function refresh() {
    listOpponents().then(setOpponents);
  }

  useEffect(() => {
    let cancelled = false;
    listOpponents().then((data) => {
      if (!cancelled) setOpponents(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const id = await createOpponent(name.trim(), league.trim(), notes.trim());
    setName("");
    setLeague("");
    setNotes("");
    refresh();
    setSelectedOpponentId(id);
  }

  async function handleRename(opponent: Opponent) {
    const next = window.prompt("Neuer Name:", opponent.name);
    if (!next) return;
    await updateOpponent(opponent.id!, { name: next });
    refresh();
  }

  async function handleDelete(opponent: Opponent) {
    if (!window.confirm(`„${opponent.name}" inkl. aller erfassten Snaps wirklich löschen?`)) return;
    await deleteOpponent(opponent.id!);
    if (selectedOpponentId === opponent.id) setSelectedOpponentId(null);
    refresh();
  }

  return (
    <div className="opponent-manager">
      <form className="opponent-manager__form" onSubmit={handleCreate}>
        <h2>Neuer Gegner</h2>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Liga
          <input value={league} onChange={(e) => setLeague(e.target.value)} />
        </label>
        <label>
          Notizen
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </label>
        <button type="submit">Anlegen</button>
      </form>

      <ul className="opponent-manager__list">
        {opponents.map((opponent) => (
          <li
            key={opponent.id}
            className={opponent.id === selectedOpponentId ? "opponent-manager__item opponent-manager__item--active" : "opponent-manager__item"}
          >
            <button type="button" className="opponent-manager__select" onClick={() => setSelectedOpponentId(opponent.id!)}>
              <strong>{opponent.name}</strong>
              {opponent.league && <span className="opponent-manager__league"> · {opponent.league}</span>}
            </button>
            <div className="opponent-manager__actions">
              <button type="button" onClick={() => handleRename(opponent)}>
                Umbenennen
              </button>
              <button type="button" onClick={() => handleDelete(opponent)}>
                Löschen
              </button>
            </div>
          </li>
        ))}
        {opponents.length === 0 && <p className="opponent-manager__empty">Noch keine Gegner angelegt.</p>}
      </ul>
    </div>
  );
}
