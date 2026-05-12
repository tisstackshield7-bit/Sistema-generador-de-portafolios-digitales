import { useEffect, useRef } from "react";
import { sanitizeRichText } from "../../utils/richText";

export interface RichTextLinkSuggestion {
  label: string;
  href: string;
}

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  linkSuggestions?: RichTextLinkSuggestion[];
}

const TOOLBAR_ACTIONS = [
  { command: "bold", label: "B", title: "Negrita" },
  { command: "italic", label: "I", title: "Cursiva" },
  { command: "underline", label: "U", title: "Subrayado" },
  { command: "insertUnorderedList", label: "-", title: "Lista con vinetas" },
  { command: "insertOrderedList", label: "1.", title: "Lista numerada" },
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isInsideLink(node: Node) {
  let current: Node | null = node.parentNode;

  while (current) {
    if (current.nodeType === Node.ELEMENT_NODE && (current as HTMLElement).tagName === "A") {
      return true;
    }

    current = current.parentNode;
  }

  return false;
}

export default function RichTextEditor({
  label,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  linkSuggestions = [],
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
    if (!/^(https?:\/\/|mailto:|tel:|#)/i.test(safeUrl)) return;

    runCommand("createLink", safeUrl);
  };

  const insertInternalLink = () => {
    if (!linkSuggestions.length) return;

    const options = linkSuggestions
      .slice(0, 20)
      .map((suggestion, index) => `${index + 1}. ${suggestion.label}`)
      .join("\n");
    const selectedOption = window.prompt(`Elige la habilidad a vincular:\n${options}`);
    const optionIndex = Number(selectedOption) - 1;
    const suggestion = linkSuggestions[optionIndex];

    if (!suggestion) return;

    runCommand("createLink", suggestion.href);
  };

  const autoLinkSuggestions = () => {
    const editor = editorRef.current;
    if (!editor || !linkSuggestions.length) return;

    const suggestions = [...linkSuggestions]
      .filter((suggestion) => suggestion.label.trim().length >= 3)
      .sort((first, second) => second.label.length - first.label.length);
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];

    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      if (!isInsideLink(node) && node.textContent?.trim()) {
        textNodes.push(node);
      }
    }

    textNodes.forEach((node) => {
      let text = node.textContent || "";
      const fragment = document.createDocumentFragment();
      let changed = false;

      while (text) {
        const match = suggestions
          .map((suggestion) => {
            const regex = new RegExp(`\\b${escapeRegExp(suggestion.label)}\\b`, "i");
            const result = regex.exec(text);
            return result ? { suggestion, index: result.index, text: result[0] } : null;
          })
          .filter((result): result is { suggestion: RichTextLinkSuggestion; index: number; text: string } => Boolean(result))
          .sort((first, second) => first.index - second.index)[0];

        if (!match) {
          fragment.appendChild(document.createTextNode(text));
          break;
        }

        if (match.index > 0) {
          fragment.appendChild(document.createTextNode(text.slice(0, match.index)));
        }

        const link = document.createElement("a");
        link.setAttribute("href", match.suggestion.href);
        link.textContent = match.text;
        fragment.appendChild(link);
        text = text.slice(match.index + match.text.length);
        changed = true;
      }

      if (changed) {
        node.parentNode?.replaceChild(fragment, node);
      }
    });

    emitChange();
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
          {linkSuggestions.length ? (
            <>
              <button
                type="button"
                className="rich-text-tool"
                title="Vincular seleccion con habilidad"
                aria-label="Vincular seleccion con habilidad"
                onClick={insertInternalLink}
              >
                H
              </button>
              <button
                type="button"
                className="rich-text-auto-button"
                title="Detectar habilidades mencionadas"
                onClick={autoLinkSuggestions}
              >
                Auto
              </button>
            </>
          ) : null}
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
