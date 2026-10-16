import { PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Field3D } from "../simulation/Field3D";
import { Player3D } from "../simulation/Player3D";
import { buildDefense } from "../../engine/buildDefense";
import { buildPlay } from "../../engine/buildPlay";
import { playPointToWorld, type Vec3 } from "../../engine/coordinates3D";
import { DL_POSITIONS, OL_POSITIONS, getFrameAt, SIM_DURATION_S } from "../../engine/simulate";
import type { PostSnapReceiverQuestion } from "../../engine/quizGenerators";
import "./PostSnapReceiverQuestionView.css";

/** Leicht erhöhte, zurückgesetzte QB-Kamera statt reiner Augenhöhe: aus genauer Augenhöhe
 *  verdecken die eigenen Linemen fast das gesamte Spielfeld, wodurch sich kein Receiver
 *  anklicken ließe. Diese Variante bleibt nah an der QB-Perspektive, zeigt aber die Routes. */
function QuizQbCamera({ qbPosition }: { qbPosition: Vec3 }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.set(qbPosition.x, qbPosition.y + 3.5, qbPosition.z + 2);
    camera.lookAt(qbPosition.x, qbPosition.y + 0.5, qbPosition.z - 20);
  });
  return null;
}

export interface PostSnapReceiverQuestionViewProps {
  question: PostSnapReceiverQuestion;
  disabled: boolean;
  selectedId: string | null;
  onSelect: (roleId: string) => void;
}

const DISPLAY_YARD_LINE = 50;

/** Spielt die Simulation aus QB-Augenhöhe ab; der Nutzer klickt den Receiver an, zu dem der
 *  Ball soll ("Post-Snap im 3D-Modus", Projektauftrag 5.6). */
/** Der Elternteil muss bei jeder neuen Frage `key={question.id}` vergeben, damit Play/Defense/
 *  Animation sauber neu starten (statt sie per Effekt zurückzusetzen). */
export function PostSnapReceiverQuestionView({ question, disabled, selectedId, onSelect }: PostSnapReceiverQuestionViewProps) {
  const play = useMemo(
    () => buildPlay({ name: "Quiz", formation: question.formation, concept: question.conceptData, hash: question.hash, yardLine: DISPLAY_YARD_LINE }),
    [question],
  );
  const defense = useMemo(() => buildDefense({ name: "Quiz", front: question.front, coverage: question.coverageData, hash: question.hash }), [question]);

  const [t, setT] = useState(0);
  const lastFrame = useRef<number | null>(null);

  useEffect(() => {
    lastFrame.current = null;
    let raf: number;
    function tick(now: number) {
      if (lastFrame.current !== null) {
        const deltaS = (now - lastFrame.current) / 1000;
        setT((prev) => Math.min(SIM_DURATION_S, prev + deltaS));
      }
      lastFrame.current = now;
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const frame = useMemo(() => getFrameAt(play, defense, t), [play, defense, t]);
  const ballYardLine = play.ball.yardLine;
  const qb = frame.offense.find((p) => p.id === "QB");
  const qbWorld = qb ? playPointToWorld(qb, ballYardLine) : { x: 0, y: 0, z: 0 };
  // O-Line/D-Line immer ausgeblendet: hier geht es nur ums Anklicken des richtigen Receivers,
  // und die unbewegte Line (kein simuliertes Blocking) versperrt sonst unnötig die Sicht.
  const visibleOffense = frame.offense.filter((p) => !OL_POSITIONS.has(p.position));
  const visibleDefense = frame.defense.filter((p) => !DL_POSITIONS.has(p.position));

  function highlightFor(id: string): "correct" | "wrong" | null {
    if (!disabled) return null;
    if (id === question.correctRoleId) return "correct";
    if (id === selectedId) return "wrong";
    return null;
  }

  return (
    <div className="post-snap-question">
      <Canvas shadows dpr={[1, 1.5]}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[20, 30, 10]} intensity={1.1} castShadow />
        <Field3D />
        {visibleOffense.map((player) => (
          <Player3D
            key={player.id}
            id={player.id}
            team="offense"
            position={playPointToWorld(player, ballYardLine)}
            onClick={disabled || player.id === "QB" ? undefined : () => onSelect(player.id)}
            highlight={highlightFor(player.id)}
          />
        ))}
        {visibleDefense.map((player) => (
          <Player3D key={player.id} id={player.id} team="defense" position={playPointToWorld(player, ballYardLine)} />
        ))}
        <PerspectiveCamera makeDefault fov={75} near={0.1} far={300} />
        <QuizQbCamera qbPosition={qbWorld} />
      </Canvas>
    </div>
  );
}
