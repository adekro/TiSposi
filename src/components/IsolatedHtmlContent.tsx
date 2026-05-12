import { Box } from "@mui/material";
import DOMPurify from "dompurify";
import { useEffect, useMemo, useRef } from "react";
import type { SxProps, Theme } from "@mui/material/styles";

interface IsolatedHtmlContentProps {
  html: string | null;
  sx?: SxProps<Theme>;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeHtml(value: string | null) {
  if (!value?.trim()) {
    return "";
  }

  const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(value);
  const source = hasHtmlTags
    ? value
    : escapeHtml(value).replace(/\n/g, "<br />");

  return DOMPurify.sanitize(source, {
    ALLOWED_TAGS: [
      "style",
      "div",
      "span",
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "ul",
      "ol",
      "li",
      "a",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
    ],
    ALLOWED_ATTR: ["style", "class", "id", "href", "target", "rel"],
  });
}

const SHADOW_BASE_CSS = `
  :host {
    all: initial;
    display: block;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  .isolated-html-root {
    display: block;
  }
`;

export default function IsolatedHtmlContent({
  html,
  sx,
}: IsolatedHtmlContentProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sanitizedHtml = useMemo(() => sanitizeHtml(html), [html]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const shadowRoot = host.shadowRoot ?? host.attachShadow({ mode: "open" });

    shadowRoot.innerHTML = `
      <style>${SHADOW_BASE_CSS}</style>
      <div class="isolated-html-root">${sanitizedHtml}</div>
    `;
  }, [sanitizedHtml]);

  if (!sanitizedHtml) {
    return null;
  }

  return <Box ref={hostRef} sx={sx} />;
}