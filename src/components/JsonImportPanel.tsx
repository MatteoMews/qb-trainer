import { useRef, useState, type ReactNode } from "react";
import "./JsonImportPanel.css";

export interface JsonParseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface JsonImportPanelProps<T> {
  title: string;
  parse: (raw: string) => JsonParseResult<T>;
  renderPreview: (data: T) => ReactNode;
  onConfirm: (data: T) => Promise<void>;
  confirmLabel: string;
}

/** Generisches Import-UI: Datei-Upload oder JSON einfügen, Validierung mit verständlicher
 *  Fehlermeldung, dann Vorschau, erst danach Speichern (Projektauftrag 5.8). */
export function JsonImportPanel<T>({ title, parse, renderPreview, onConfirm, confirmLabel }: JsonImportPanelProps<T>) {
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState<JsonParseResult<T> | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setRaw(text);
    setResult(null);
    setStatus(null);
  }

  function handleValidate() {
    setResult(parse(raw));
    setStatus(null);
  }

  async function handleConfirm() {
    if (!result?.success || !result.data) return;
    await onConfirm(result.data);
    setStatus("Gespeichert.");
    setRaw("");
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="json-import">
      <h2>{title}</h2>
      <label className="json-import__file">
        Datei auswählen
        <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleFile} />
      </label>
      <label className="json-import__textarea-label">
        …oder JSON einfügen
        <textarea
          className="json-import__textarea"
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            setResult(null);
            setStatus(null);
          }}
          rows={8}
          placeholder="{ ... }"
        />
      </label>

      <div className="json-import__actions">
        <button type="button" onClick={handleValidate} disabled={!raw.trim()}>
          Validieren
        </button>
        {result?.success && (
          <button type="button" onClick={handleConfirm}>
            {confirmLabel}
          </button>
        )}
      </div>

      {result && !result.success && <p className="json-import__error">{result.error}</p>}
      {status && <p className="json-import__status">{status}</p>}
      {result?.success && result.data && (
        <div className="json-import__preview">
          <h3>Vorschau</h3>
          {renderPreview(result.data)}
        </div>
      )}
    </div>
  );
}
