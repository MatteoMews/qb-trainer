import { Billboard, Text } from "@react-three/drei";
import { PLAYER_HEIGHT_YD, type Vec3 } from "../../engine/coordinates3D";

const OFFENSE_COLOR = "#f4c430";
const DEFENSE_COLOR = "#6ea8ff";
const BODY_RADIUS_YD = 0.35;

export interface Player3DProps {
  id: string;
  team: "offense" | "defense";
  position: Vec3;
}

/** Ein Spieler als einfache Kapsel-Figur mit teamfarbener Materialisierung und einem stets zur
 *  Kamera ausgerichteten Label (Billboard) - bewusst simple Geometrie für 60-fps-Performance. */
export function Player3D({ id, team, position }: Player3DProps) {
  const color = team === "offense" ? OFFENSE_COLOR : DEFENSE_COLOR;

  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh position={[0, PLAYER_HEIGHT_YD / 2, 0]} castShadow>
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
