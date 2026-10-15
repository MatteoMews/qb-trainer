import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import { playPointToWorld } from "../../engine/coordinates3D";
import { getFrameAt } from "../../engine/simulate";
import { CameraRig } from "./CameraRig";
import { Field3D } from "./Field3D";
import { Player3D } from "./Player3D";
import { useSimulationStore } from "./simulationStore";
import "./Simulation3D.css";

export function Simulation3D() {
  const { play, defense, t, cameraMode } = useSimulationStore();

  const frame = useMemo(() => {
    if (!play || !defense) return null;
    return getFrameAt(play.data, defense.data, t);
  }, [play, defense, t]);

  if (!play || !defense || !frame) {
    return (
      <div className="simulation-3d simulation-3d--empty">
        <p>Wähle einen Spielzug und eine Defense, um die 3D-Ansicht zu sehen.</p>
      </div>
    );
  }

  const ballYardLine = play.data.ball.yardLine;
  const qb = frame.offense.find((p) => p.id === "QB");
  const qbWorld = qb ? playPointToWorld(qb, ballYardLine) : { x: 0, y: 0, z: 0 };

  return (
    <div className="simulation-3d">
      <Canvas shadows dpr={[1, 1.5]}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[20, 30, 10]} intensity={1.1} castShadow />
        <Field3D />
        {frame.offense.map((player) => (
          <Player3D key={player.id} id={player.id} team="offense" position={playPointToWorld(player, ballYardLine)} />
        ))}
        {frame.defense.map((player) => (
          <Player3D key={player.id} id={player.id} team="defense" position={playPointToWorld(player, ballYardLine)} />
        ))}
        <CameraRig mode={cameraMode} qbPosition={qbWorld} />
      </Canvas>
    </div>
  );
}
