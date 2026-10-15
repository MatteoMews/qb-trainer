import "./MultipleChoiceOptions.css";

export interface MultipleChoiceOptionsProps {
  options: string[];
  selected: string | null;
  correctAnswer?: string;
  disabled: boolean;
  onSelect: (option: string) => void;
}

/** Mehrfachauswahl-Buttons, gemeinsam genutzt von Pre-Snap-, Beater- und Disguise-Fragen.
 *  Nach der Antwort (disabled=true) wird die richtige Option grün, eine falsch gewählte rot. */
export function MultipleChoiceOptions({ options, selected, correctAnswer, disabled, onSelect }: MultipleChoiceOptionsProps) {
  return (
    <div className="mc-options">
      {options.map((option) => {
        const isCorrect = disabled && option === correctAnswer;
        const isWrongPick = disabled && option === selected && option !== correctAnswer;
        const classes = ["mc-options__button"];
        if (isCorrect) classes.push("mc-options__button--correct");
        if (isWrongPick) classes.push("mc-options__button--wrong");
        if (!disabled && option === selected) classes.push("mc-options__button--selected");

        return (
          <button key={option} type="button" className={classes.join(" ")} disabled={disabled} onClick={() => onSelect(option)}>
            {option}
          </button>
        );
      })}
    </div>
  );
}
