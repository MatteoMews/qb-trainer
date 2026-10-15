import { useEffect, useState } from "react";
import "./QuestionTimer.css";

export interface QuestionTimerProps {
  seconds: number;
  onExpire: () => void;
}

/** Countdown-Balken für den Zeitdruck-Modus. Der Elternteil muss bei jeder neuen Frage einen
 *  neuen `key` (z.B. die Frage-ID) vergeben, damit die Komponente sauber neu startet. */
export function QuestionTimer({ seconds, onExpire }: QuestionTimerProps) {
  const [fraction, setFraction] = useState(1);

  useEffect(() => {
    const start = Date.now();
    let expired = false;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const remaining = Math.max(0, 1 - elapsed / seconds);
      setFraction(remaining);
      if (remaining <= 0 && !expired) {
        expired = true;
        clearInterval(interval);
        onExpire();
      }
    }, 100);
    return () => clearInterval(interval);
  }, [seconds, onExpire]);

  return (
    <div className="question-timer">
      <div className="question-timer__bar" style={{ width: `${fraction * 100}%` }} />
    </div>
  );
}
