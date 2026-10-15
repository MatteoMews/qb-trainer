import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { QB_EYE_HEIGHT_YD, type Vec3 } from "../../engine/coordinates3D";

export type CameraMode = "qb" | "free" | "endzone";

export interface CameraRigProps {
  mode: CameraMode;
  qbPosition: Vec3;
  /** Punkt, zu dem die QB-Kamera blickt (z.B. gerade downfield). Nur für mode="qb" relevant. */
  lookTarget?: Vec3;
}

function QbCamera({ qbPosition, lookTarget }: { qbPosition: Vec3; lookTarget: Vec3 }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.set(qbPosition.x, qbPosition.y + QB_EYE_HEIGHT_YD, qbPosition.z);
    camera.lookAt(lookTarget.x, lookTarget.y + QB_EYE_HEIGHT_YD * 0.6, lookTarget.z);
  });
  return null;
}

/** Steuert die 3D-Kamera je nach Modus: "qb" folgt der QB-Position auf Augenhöhe (siehe
 *  Projektauftrag 5.4), "free" ist eine frei drehbare Übersichtskamera, "endzone" startet hinter
 *  der Endzone für die Nachanalyse. Free/Endzone erlauben Drag/Zoom via OrbitControls. */
export function CameraRig({ mode, qbPosition, lookTarget }: CameraRigProps) {
  if (mode === "qb") {
    const target = lookTarget ?? { x: qbPosition.x, y: 0, z: qbPosition.z - 20 };
    return (
      <>
        <PerspectiveCamera makeDefault fov={70} near={0.1} far={300} />
        <QbCamera qbPosition={qbPosition} lookTarget={target} />
      </>
    );
  }

  const startPosition: [number, number, number] = mode === "endzone" ? [0, 12, 25] : [0, 16, qbPosition.z + 25];
  const startTarget: [number, number, number] = mode === "endzone" ? [0, 2, -70] : [qbPosition.x, 1, qbPosition.z - 10];

  return (
    <group key={mode}>
      <PerspectiveCamera makeDefault position={startPosition} fov={55} near={0.1} far={300} />
      <OrbitControls target={startTarget} maxPolarAngle={Math.PI / 2 - 0.02} />
    </group>
  );
}
