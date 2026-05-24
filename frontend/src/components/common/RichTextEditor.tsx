import { useEffect, useRef } from "react";
import { sanitizeRichText } from "../../utils/richText";

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
}

const TOOLBAR_ACTIONS = [
  { command: "bold", label: "B", title: "Negrita" },
  { command: "italic", label: "I", title: "Cursiva" },
  { command: "underline", label: "U", title: "Subrayado" },
  { command: "insertUnorderedList", label: "-", title: "Lista con vinetas" },
  { command: "insertOrderedList", label: "1.", title: "Lista numerada" },
];

export default function RichTextEditor({
  label,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastHtml = useRef("");

  useEffect(() => {
    const editor = editorRef.current;
    const safeValue = sanitizeRichText(value);

    if (editor && safeValue !== lastHtml.current && safeValue !== editor.innerHTML) {
      editor.innerHTML = safeValue;
      lastHtml.current = safeValue;
    }
  }, [value]);

  const emitChange = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const safeHtml = sanitizeRichText(editor.innerHTML);
    lastHtml.current = safeHtml;
    onChange(safeHtml);
  };

  const runCommand = (command: string, inputValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, inputValue);
    emitChange();
  };

  const insertLink = () => {
    const url = window.prompt("Pega el enlace");
    if (!url) return;

    const safeUrl = url.trim();
    if (!/^(https?:\/\/|mailto:|tel:)/i.test(safeUrl)) return;

    runCommand("createLink", safeUrl);
  };

  const clearFormat = () => {
    runCommand("removeFormat");
  };

  return (
    <div className="form-field rich-text-field">
      <label className="form-label">{label}</label>
      <div className={`rich-text-editor${error ? " error" : ""}`}>
        <div className="rich-text-toolbar" aria-label={`Herramientas de ${label}`}>
          {TOOLBAR_ACTIONS.map((action) => (
            <button
              key={action.command}
              type="button"
              className="rich-text-tool"
              title={action.title}
              aria-label={action.title}
              onClick={() => runCommand(action.command)}
            >
              {action.label}
            </button>
          ))}
          <button type="button" className="rich-text-tool link-tool" title="Insertar enlace externo" aria-label="Insertar enlace externo" onClick={insertLink}>
            ↗
          </button>
          <button type="button" className="rich-text-tool" title="Quitar enlace" aria-label="Quitar enlace" onClick={() => runCommand("unlink")}>
            X
          </button>
          <button type="button" className="rich-text-tool" title="Limpiar formato" aria-label="Limpiar formato" onClick={clearFormat}>
            Tx
          </button>
        </div>
        <div
          ref={editorRef}
          className="rich-text-input"
          contentEditable
          role="textbox"
          aria-multiline="true"
          data-placeholder={placeholder}
          onInput={emitChange}
          onBlur={() => {
            emitChange();
            onBlur?.();
          }}
          onPaste={(event) => {
            event.preventDefault();
            const text = event.clipboardData.getData("text/plain");
            document.execCommand("insertText", false, text);
            emitChange();
          }}
        />
      </div>
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}
