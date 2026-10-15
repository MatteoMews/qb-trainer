/** Route-Tree-Vorlagen (Metadaten). Tatsächliche Wegpunkt-Generierung: src/engine/routeGenerator.ts.
 *
 * // TODO(Football-Check): Die Zuordnung der Ziffern 0-9 zum Route Tree ist in der Praxis
 * // nicht einheitlich (unterschiedliche Systeme/Playbooks nummerieren anders, z.B. wird
 * // "Go" bei manchen Teams als 9 statt 8 geführt). Die Nummern hier folgen der Reihenfolge
 * // aus dem Projektauftrag und sollten von dir geprüft/angepasst werden, falls dein System
 * // eine andere Konvention nutzt. Ebenso sind alle defaultDepthYd-Werte Richtwerte.
 */

export type RouteName =
  | "Flat"
  | "Slant"
  | "Comeback"
  | "Curl"
  | "Hitch"
  | "Out"
  | "Dig"
  | "Corner"
  | "Post"
  | "Go"
  | "Whip"
  | "Option"
  | "Choice"
  | "Seam"
  | "Wheel"
  | "Shallow"
  | "Sit"
  | "Angle"
  | "Texas"
  | "Swing";

export type BreakDirection = "sideline" | "ball" | "upfield-sideline" | "upfield-ball" | "none" | "varies";

export interface RouteTreeEntry {
  name: RouteName;
  treeNumber?: number;
  aliases?: string[];
  defaultDepthYd: number;
  breaksToward: BreakDirection;
  description: string;
}

export const ROUTE_TREE: readonly RouteTreeEntry[] = [
  {
    name: "Flat",
    treeNumber: 0,
    aliases: ["Arrow"],
    defaultDepthYd: 2,
    breaksToward: "sideline",
    description: "Schneller, flacher Release Richtung Seitenlinie. Von RB/TE oft 'Arrow' genannt.",
  },
  {
    name: "Slant",
    treeNumber: 1,
    defaultDepthYd: 3,
    breaksToward: "ball",
    description: "Kurzer, scharfer Einbruch Richtung Mitte nach 2-3 yd Stem.",
  },
  {
    name: "Comeback",
    treeNumber: 2,
    defaultDepthYd: 14,
    breaksToward: "sideline",
    description: "Vertikaler Stem, dann Comeback-Schritt zurück und Richtung Seitenlinie.",
  },
  {
    name: "Curl",
    treeNumber: 3,
    aliases: ["Hitch (tief)"],
    defaultDepthYd: 11,
    breaksToward: "ball",
    description: "Vertikaler Stem, dreht sich im Zonenfenster zum QB (Hook/Curl).",
  },
  {
    name: "Hitch",
    treeNumber: 3,
    defaultDepthYd: 5,
    breaksToward: "ball",
    description: "Kurze Variante des Curl: Stem, kurzer Stopp, Gesicht zum QB.",
  },
  {
    name: "Out",
    treeNumber: 4,
    defaultDepthYd: 10,
    breaksToward: "sideline",
    description: "Vertikaler Stem, scharfer 90°-Break Richtung Seitenlinie.",
  },
  {
    name: "Dig",
    treeNumber: 5,
    aliases: ["In"],
    defaultDepthYd: 13,
    breaksToward: "ball",
    description: "Vertikaler Stem, scharfer 90°-Break Richtung Mitte, quer durchs Feld.",
  },
  {
    name: "Corner",
    treeNumber: 6,
    defaultDepthYd: 11,
    breaksToward: "upfield-sideline",
    description: "Vertikaler Stem, 45°-Break Richtung Seitenlinie und weiter upfield.",
  },
  {
    name: "Post",
    treeNumber: 7,
    defaultDepthYd: 11,
    breaksToward: "upfield-ball",
    description: "Vertikaler Stem, 45°-Break Richtung Mitte und weiter upfield.",
  },
  {
    name: "Go",
    treeNumber: 8,
    aliases: ["Fly", "Fade"],
    defaultDepthYd: 22,
    breaksToward: "none",
    description: "Vertikaler Sprint ohne Break, ggf. leichte Fade-Drift zur Seitenlinie.",
  },
  {
    name: "Seam",
    defaultDepthYd: 22,
    breaksToward: "none",
    description: "Wie Go, aber entlang der Hash-Marke/Seam ausgerichtet (typ. TE/Slot).",
  },
  {
    name: "Whip",
    defaultDepthYd: 6,
    breaksToward: "varies",
    description: "Kurzer Stem nach außen, dann scharfer Pivot zurück nach innen (Snap-back).",
  },
  {
    name: "Option",
    defaultDepthYd: 6,
    breaksToward: "varies",
    description:
      "Read-Route: Receiver entscheidet post-snap anhand des Leverages des Verteidigers (innen/außen/vertikal). Dargestellter Break ist nur ein Default.",
  },
  {
    name: "Choice",
    defaultDepthYd: 8,
    breaksToward: "varies",
    description:
      "Wie Option, meist von Außen-WR gegen Off-Coverage: Hitch, Out oder Go je nach Leverage/Cushion. Dargestellter Break ist nur ein Default.",
  },
  {
    name: "Wheel",
    defaultDepthYd: 18,
    breaksToward: "upfield-sideline",
    description: "Release Richtung Flat, dann Umkehr vertikal die Seitenlinie entlang.",
  },
  {
    name: "Shallow",
    aliases: ["Drag"],
    defaultDepthYd: 3,
    breaksToward: "ball",
    description: "Sehr flache Cross-Route quer durchs Feld, knapp hinter der Line.",
  },
  {
    name: "Sit",
    defaultDepthYd: 6,
    breaksToward: "ball",
    description: "Setzt sich im Zonenfenster ab, Gesicht zum QB, ohne ausgeprägten Richtungswechsel.",
  },
  {
    name: "Angle",
    defaultDepthYd: 5,
    breaksToward: "ball",
    description: "RB-Route: Release nach außen, dann scharfer 45°-Break nach innen/upfield (Man-Beater).",
  },
  {
    name: "Texas",
    defaultDepthYd: 8,
    breaksToward: "ball",
    description: "Verzögerte, tiefere Variante des Angle-Route aus dem Backfield.",
  },
  {
    name: "Swing",
    defaultDepthYd: 1,
    breaksToward: "sideline",
    description: "Weicher Bogen aus dem Backfield Richtung Flat, ohne harten Break.",
  },
];

export function findRoute(name: RouteName): RouteTreeEntry {
  const entry = ROUTE_TREE.find((route) => route.name === name);
  if (!entry) {
    throw new Error(`Unbekannte Route: ${name}`);
  }
  return entry;
}
