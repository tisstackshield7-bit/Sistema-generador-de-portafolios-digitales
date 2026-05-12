import { sanitizeRichText } from "../../utils/richText";

interface RichTextContentProps {
  value?: string | null;
  className?: string;
  fallback?: string;
}

export default function RichTextContent({ value, className = "", fallback = "" }: RichTextContentProps) {
  const html = sanitizeRichText(value?.trim() || fallback);

  if (!html) return null;

  return <div className={`rich-text-content ${className}`.trim()} dangerouslySetInnerHTML={{ __html: html }} />;
}
