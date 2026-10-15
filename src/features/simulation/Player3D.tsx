import { Billboard, Text } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { PLAYER_HEIGHT_YD, type Vec3 } from "../../engine/coordinates3D";

const OFFENSE_COLOR = "#f4c430";
const DEFENSE_COLOR = "#6ea8ff";
const CORRECT_COLOR = "#3ddc84";
const WRONG_COLOR = "#ff5566";
const BODY_RADIUS_YD = 0.35;

export interface Player3DProps {
  id: string;
  team: "offense" | "defense";
  position: Vec3;
  /** Macht die Figur klickbar (z.B. Quiz: Klick-auf-Receiver in 3D). */
  onClick?: (id: string) => void;
  /** Überschreibt die Team-Farbe, z.B. um nach einer Quiz-Antwort richtig/falsch zu markieren. */
  highlight?: "correct" | "wrong" | null;
}

/** Ein Spieler als einfache Kapsel-Figur mit teamfarbener Materialisierung und einem stets zur
 *  Kamera ausgerichteten Label (Billboard) - bewusst simple Geometrie für 60-fps-Performance. */
export function Player3D({ id, team, position, onClick, highlight }: Player3DProps) {
  const color = highlight === "correct" ? CORRECT_COLOR : highlight === "wrong" ? WRONG_COLOR : team === "offense" ? OFFENSE_COLOR : DEFENSE_COLOR;

  function handleClick(event: ThreeEvent<MouseEvent>) {
    if (!onClick) return;
    event.stopPropagation();
    onClick(id);
  }

  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh position={[0, PLAYER_HEIGHT_YD / 2, 0]} castShadow onClick={onClick ? handleClick : undefined}>
        <capsuleGeometry args={[BODY_RADIUS_YD, PLAYER_HEIGHT_YD - BODY_RADIUS_YD * 2, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Billboard position={[0, PLAYER_HEIGHT_YD + 0.4, 0]}>
        <Text fontSize={0.45} color="#ffffff" outlineWidth={0.03} outlineColor="#000000" anchorX="center" anchorY="middle">
          {id}
        </Text>
      </Billboard>
    </group>
  );
}
