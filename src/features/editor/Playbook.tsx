import { useEffect, useState } from "react";
import type { SavedPlay } from "../../data/db";
import { downloadNamedJson } from "../../data/downloadFile";
import {
  deletePlay,
  duplicatePlay,
  listPlays,
  mirrorSavedPlay,
  renamePlay,
} from "../../data/playbookRepository";
import { useEditorStore } from "./editorStore";
import "./Playbook.css";

export interface PlaybookProps {
  /** Hochgezählt vom Elternteil, wenn außerhalb (z.B. nach dem Speichern) neu geladen werden soll. */
  refreshToken: number;
}

export function Playbook({ refreshToken }: PlaybookProps) {
  const [plays, setPlays] = useState<SavedPlay[]>([]);
  const loadPlay = useEditorStore((state) => state.loadPlay);

  function refresh() {
    listPlays().then(setPlays);
  }

  useEffect(() => {
    let cancelled = false;
    listPlays().then((data) => {
      if (!cancelled) setPlays(data);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  async function handleRename(play: SavedPlay) {
    const name = window.prompt("Neuer Name:", play.data.name);
    if (!name) return;
    await renamePlay(play.id!, name);
    refresh();
  }

  async function handleDuplicate(play: SavedPlay) {
    await duplicatePlay(play.id!);
    refresh();
  }

  async function handleMirror(play: SavedPlay) {
    await mirrorSavedPlay(play.id!);
    refresh();
  }

  async function handleDelete(play: SavedPlay) {
    if (!window.confirm(`„${play.data.name}" wirklich löschen?`)) return;
    await deletePlay(play.id!);
    refresh();
  }

  if (plays.length === 0) {
    return <p className="playbook__empty">Noch keine Spielzüge gespeichert.</p>;
  }

  return (
    <ul className="playbook">
      {plays.map((play) => (
        <li key={play.id} className="playbook__item">
          <div className="playbook__meta">
            <span className="playbook__name">{play.data.name}</span>
            <span className="playbook__sub">
              {play.data.offense.formation} · {play.folder}
            </span>
          </div>
          <div className="playbook__actions">
            <button type="button" onClick={() => loadPlay(play.data)}>
              Laden
            </button>
            <button type="button" onClick={() => handleDuplicate(play)}>
              Duplizieren
            </button>
            <button type="button" onClick={() => handleMirror(play)}>
              Spiegeln
            </button>
            <button type="button" onClick={() => downloadNamedJson(play.data.name, play.data)}>
              Exportieren
            </button>
            <button type="button" onClick={() => handleRename(play)}>
              Umbenennen
            </button>
            <button type="button" onClick={() => handleDelete(play)}>
              Löschen
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
