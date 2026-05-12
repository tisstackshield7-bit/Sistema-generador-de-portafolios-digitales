const ALLOWED_TAGS = new Set(["A", "B", "BR", "DIV", "EM", "I", "LI", "OL", "P", "STRONG", "U", "UL"]);
const BLOCK_TAGS = new Set(["DIV", "P"]);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function plainTextToHtml(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function sanitizeNode(node: Node, documentRef: Document): Node | null {
  if (node.nodeType === Node.TEXT_NODE) {
    return documentRef.createTextNode(node.textContent || "");
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const element = node as HTMLElement;
  const tagName = element.tagName.toUpperCase();
  const safeTag = ALLOWED_TAGS.has(tagName) ? tagName.toLowerCase() : "span";
  const safeElement = documentRef.createElement(safeTag);

  if (tagName === "A") {
    const href = element.getAttribute("href") || "";
    const isSafeHref = /^(https?:\/\/|mailto:|tel:|#)/i.test(href);

    if (isSafeHref) {
      safeElement.setAttribute("href", href);

      if (!href.startsWith("#")) {
        safeElement.setAttribute("target", "_blank");
        safeElement.setAttribute("rel", "noreferrer");
      }
    }
  }

  Array.from(element.childNodes).forEach((child) => {
    const safeChild = sanitizeNode(child, documentRef);
    if (safeChild) safeElement.appendChild(safeChild);
  });

  return safeElement;
}

export function normalizeRichText(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return "";

  if (!/<[a-z][\s\S]*>/i.test(trimmed)) {
    return plainTextToHtml(trimmed);
  }

  return trimmed;
}

export function sanitizeRichText(value: string) {
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return value;
  }

  const normalizedValue = normalizeRichText(value);
  if (!normalizedValue) return "";

  const parser = new DOMParser();
  const parsed = parser.parseFromString(normalizedValue, "text/html");
  const wrapper = document.createElement("div");

  Array.from(parsed.body.childNodes).forEach((node) => {
    const safeNode = sanitizeNode(node, document);
    if (safeNode) wrapper.appendChild(safeNode);
  });

  return wrapper.innerHTML;
}

export function richTextToPlainText(value: string) {
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  const parser = new DOMParser();
  const parsed = parser.parseFromString(normalizeRichText(value), "text/html");

  parsed.body.querySelectorAll("br").forEach((node) => node.replaceWith("\n"));
  parsed.body.querySelectorAll(Array.from(BLOCK_TAGS).join(",")).forEach((node) => {
    node.append(document.createTextNode("\n"));
  });

  return (parsed.body.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
}

export function isRichTextEmpty(value: string) {
  return richTextToPlainText(value).length === 0;
}

export function limitRichText(value: string, maxPlainTextLength: number) {
  const plainText = richTextToPlainText(value);

  if (plainText.length <= maxPlainTextLength) {
    return sanitizeRichText(value);
  }

  return sanitizeRichText(plainText.slice(0, maxPlainTextLength));
}
