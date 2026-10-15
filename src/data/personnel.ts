/** Personnel-Gruppierungen: erste Ziffer = Anzahl RB, zweite Ziffer = Anzahl TE.
 *  Die restlichen Spieler (bis 5, ohne QB/OL) sind WR. */

export interface PersonnelGroup {
  code: string;
  runningBacks: number;
  tightEnds: number;
  wideReceivers: number;
  label: string;
}

function personnel(code: string, runningBacks: number, tightEnds: number, label: string): PersonnelGroup {
  return { code, runningBacks, tightEnds, wideReceivers: 5 - runningBacks - tightEnds, label };
}

export const PERSONNEL_GROUPS: readonly PersonnelGroup[] = [
  personnel("00", 0, 0, "5 WR, Empty"),
  personnel("10", 1, 0, "1 RB, 4 WR"),
  personnel("11", 1, 1, "1 RB, 1 TE, 3 WR"),
  personnel("12", 1, 2, "1 RB, 2 TE, 2 WR"),
  personnel("20", 2, 0, "2 RB, 3 WR"),
  personnel("21", 2, 1, "2 RB, 1 TE, 2 WR (klassisches I-Form-Personnel)"),
  personnel("22", 2, 2, "2 RB, 2 TE, 1 WR"),
];

export function findPersonnel(code: string): PersonnelGroup | undefined {
  return PERSONNEL_GROUPS.find((group) => group.code === code);
}
