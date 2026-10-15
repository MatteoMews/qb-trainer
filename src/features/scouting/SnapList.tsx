import { useEffect, useState } from "react";
import type { Snap } from "../../data/db";
import { deleteSnap, listSnaps } from "../../data/scoutingRepository";
import "./SnapList.css";

export interface SnapListProps {
  opponentId: number;
  refreshToken: number;
}

export function SnapList({ opponentId, refreshToken }: SnapListProps) {
  const [snaps, setSnaps] = useState<Snap[]>([]);

  useEffect(() => {
    let cancelled = false;
    listSnaps(opponentId).then((data) => {
      if (!cancelled) setSnaps(data);
    });
    return () => {
      cancelled = true;
    };
  }, [opponentId, refreshToken]);

  async function handleDelete(id: number) {
    await deleteSnap(id);
    setSnaps((prev) => prev.filter((s) => s.id !== id));
  }

  if (snaps.length === 0) {
    return <p className="snap-list__empty">Noch keine Snaps erfasst.</p>;
  }

  return (
    <ul className="snap-list">
      {snaps.map((snap) => (
        <li key={snap.id} className="snap-list__item">
          <span>
            {snap.down}. & {snap.distance} @ {snap.fieldPosition} ({snap.hash}) · {snap.defenseFront} / {snap.coverage}
            {snap.blitz && ` · Blitz${snap.blitzType ? ` (${snap.blitzType})` : ""}`} · {snap.result}
          </span>
          <button type="button" onClick={() => handleDelete(snap.id!)}>
            Löschen
          </button>
        </li>
      ))}
    </ul>
  );
}
