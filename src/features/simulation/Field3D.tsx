import { Text } from "@react-three/drei";
import {
  END_ZONE_DEPTH_YD,
  FIELD_WIDTH_YD,
  HASH_FROM_SIDELINE_YD,
  PLAYING_FIELD_LENGTH_YD,
  YARD_NUMBER_LINES,
} from "../../data/field";

const FIELD_LENGTH_YD = PLAYING_FIELD_LENGTH_YD + 2 * END_ZONE_DEPTH_YD;
const FIELD_CENTER_Z = -(PLAYING_FIELD_LENGTH_YD / 2);
const LINE_WIDTH_YD = 0.15;
const MAJOR_LINE_WIDTH_YD = 0.25;

const YARD_LINES = Array.from({ length: 21 }, (_, i) => i * 5);

/** 3D-Football-Feld: Grasfläche, Endzonen, Yard-Linien, Hash-Ticks und Yard-Zahlen (flach auf
 *  dem Boden, siehe engine/coordinates3D.ts für die Koordinatenkonvention). */
export function Field3D() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, FIELD_CENTER_Z]} receiveShadow>
        <planeGeometry args={[FIELD_WIDTH_YD, FIELD_LENGTH_YD]} />
        <meshStandardMaterial color="#0e5c2f" />
      </mesh>

      {[1, -1].map((side) => (
        <mesh
          key={`endzone-${side}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.001, side > 0 ? END_ZONE_DEPTH_YD / 2 : -(PLAYING_FIELD_LENGTH_YD + END_ZONE_DEPTH_YD / 2)]}
        >
          <planeGeometry args={[FIELD_WIDTH_YD, END_ZONE_DEPTH_YD]} />
          <meshStandardMaterial color="#0b4a25" />
        </mesh>
      ))}

      {YARD_LINES.map((yardLine) => (
        <mesh key={`line-${yardLine}`} position={[0, 0.002, -yardLine]}>
          <boxGeometry args={[FIELD_WIDTH_YD, 0.01, yardLine % 10 === 0 ? MAJOR_LINE_WIDTH_YD : LINE_WIDTH_YD]} />
          <meshStandardMaterial color="#ffffff" opacity={0.85} transparent />
        </mesh>
      ))}

      {YARD_LINES.map((yardLine) =>
        [1, -1].map((side) => (
          <mesh
            key={`hash-${yardLine}-${side}`}
            position={[side * (FIELD_WIDTH_YD / 2 - HASH_FROM_SIDELINE_YD), 0.002, -yardLine]}
          >
            <boxGeometry args={[1, 0.01, LINE_WIDTH_YD]} />
            <meshStandardMaterial color="#ffffff" opacity={0.8} transparent />
          </mesh>
        )),
      )}

      {YARD_NUMBER_LINES.map((yardLine) => {
        const label = String(yardLine <= 50 ? yardLine : 100 - yardLine);
        return [1, -1].map((side) => (
          <Text
            key={`number-${yardLine}-${side}`}
            position={[side * (FIELD_WIDTH_YD / 2 - 12), 0.01, -yardLine]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={3}
            color="#ffffff"
            fillOpacity={0.85}
            anchorX="center"
            anchorY="middle"
          >
            {label}
          </Text>
        ));
      })}
    </group>
  );
}
