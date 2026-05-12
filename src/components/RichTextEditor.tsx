import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { FormatBold as FormatBoldIcon } from "@mui/icons-material";
import { FormatUnderlined as FormatUnderlinedIcon } from "@mui/icons-material";
import { FormatItalic as FormatItalicIcon } from "@mui/icons-material";
import { FormatListBulleted as FormatListBulletedIcon } from "@mui/icons-material";
import { FormatListNumbered as FormatListNumberedIcon } from "@mui/icons-material";
import { FormatAlignLeft as FormatAlignLeftIcon } from "@mui/icons-material";
import { FormatAlignCenter as FormatAlignCenterIcon } from "@mui/icons-material";
import { Link as LinkIcon } from "@mui/icons-material";
import { LinkOff as LinkOffIcon } from "@mui/icons-material";
import { FontDownload as FontDownloadIcon } from "@mui/icons-material";
import { Palette as PaletteIcon } from "@mui/icons-material";
import { Preview as PreviewIcon } from "@mui/icons-material";
import { Title as TitleIcon } from "@mui/icons-material";
import { Subject as SubjectIcon } from "@mui/icons-material";
import { Undo as UndoIcon } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import IsolatedHtmlContent from "./IsolatedHtmlContent";
import {
  RICH_TEXT_COLOR_OPTIONS,
  RICH_TEXT_FONT_OPTIONS,
} from "./richTextOptions";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
}

function normalizeHtml(value: string) {
  const trimmed = value.trim();

  if (!trimmed || trimmed === "<br>" || trimmed === "<div><br></div>") {
    return "";
  }

  if (typeof document === "undefined") {
    return value;
  }

  const container = document.createElement("div");
  container.innerHTML = value;

  container.querySelectorAll("font").forEach((fontNode) => {
    const span = document.createElement("span");
    const color = fontNode.getAttribute("color");
    const face = fontNode.getAttribute("face");

    if (color) {
      span.style.color = color;
    }

    if (face) {
      span.style.fontFamily = face;
    }

    span.innerHTML = fontNode.innerHTML;
    fontNode.replaceWith(span);
  });

  container.querySelectorAll("div").forEach((block) => {
    const paragraph = document.createElement("p");
    const blockHtml = block.innerHTML.trim();

    Array.from(block.attributes).forEach((attribute) => {
      paragraph.setAttribute(attribute.name, attribute.value);
    });

    paragraph.innerHTML = !blockHtml || blockHtml === "<br>" ? "<br>" : block.innerHTML;
    block.replaceWith(paragraph);
  });

  const normalized = container.innerHTML.trim();

  if (!normalized || normalized === "<br>" || normalized === "<p><br></p>") {
    return "";
  }

  return normalized;
}

export default function RichTextEditor({
  value,
  onChange,
  label,
  helperText,
  placeholder,
  disabled = false,
  minHeight = 160,
}: RichTextEditorProps) {
  const theme = useTheme();
  const editorRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<Range | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [selectedFont, setSelectedFont] = useState<string>(
    RICH_TEXT_FONT_OPTIONS[0].value,
  );
  const [selectedTextColor, setSelectedTextColor] = useState<string>(
    RICH_TEXT_COLOR_OPTIONS[0].value,
  );

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML === value) return;
    editorRef.current.innerHTML = value;
  }, [value]);

  const saveSelection = () => {
    if (!editorRef.current || typeof window === "undefined") return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;

    selectionRef.current = range.cloneRange();
  };

  const restoreSelection = () => {
    if (typeof window === "undefined" || !selectionRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;

    selection.removeAllRanges();
    selection.addRange(selectionRef.current);
  };

  const emitChange = () => {
    if (!editorRef.current) return;
    onChange(normalizeHtml(editorRef.current.innerHTML));
  };

  const runCommand = (command: string, commandValue?: string) => {
    if (disabled || !editorRef.current) return;

    editorRef.current.focus();
    restoreSelection();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(command, false, commandValue);
    emitChange();
    saveSelection();
  };

  const applyFontFamily = (fontValue: string) => {
    const fontOption = RICH_TEXT_FONT_OPTIONS.find(
      (option) => option.value === fontValue,
    );

    if (!fontOption) return;

    setSelectedFont(fontValue);
    runCommand("fontName", fontOption.commandValue);
  };

  const applyTextColor = (colorValue: string) => {
    setSelectedTextColor(colorValue);
    runCommand("foreColor", colorValue);
  };

  const runBlockCommand = (tagName: "p" | "h2" | "h3") => {
    runCommand("formatBlock", `<${tagName}>`);
  };

  const getSelectedLink = () => {
    if (typeof window === "undefined") return null;

    const selection = window.getSelection();
    const anchorNode = selection?.anchorNode;

    if (!anchorNode) return null;
    if (anchorNode instanceof Element) return anchorNode.closest("a");

    return anchorNode.parentElement?.closest("a") ?? null;
  };

  const normalizeLinkUrl = (rawValue: string) => {
    const trimmed = rawValue.trim();
    if (!trimmed) return "";

    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("mailto:") ||
      trimmed.startsWith("tel:") ||
      trimmed.startsWith("/") ||
      trimmed.startsWith("#")
    ) {
      return trimmed;
    }

    return `https://${trimmed}`;
  };

  const openLinkDialog = () => {
    if (disabled || !editorRef.current) return;

    saveSelection();
    setLinkUrl(getSelectedLink()?.getAttribute("href") ?? "");
    setLinkDialogOpen(true);
  };

  const applyLink = () => {
    if (disabled || !editorRef.current) return;

    const normalizedUrl = normalizeLinkUrl(linkUrl);
    if (!normalizedUrl) {
      setLinkDialogOpen(false);
      setLinkUrl("");
      return;
    }

    editorRef.current.focus();
    restoreSelection();

    const selection = typeof window !== "undefined" ? window.getSelection() : null;
    const hasSelection = selection && !selection.isCollapsed;

    if (hasSelection) {
      document.execCommand("createLink", false, normalizedUrl);
    } else {
      const link = document.createElement("a");
      link.href = normalizedUrl;
      link.target = "_blank";
      link.rel = "noreferrer noopener";
      link.textContent = normalizedUrl;
      document.execCommand("insertHTML", false, link.outerHTML);
    }

    const selectedLink = getSelectedLink();
    if (selectedLink instanceof HTMLAnchorElement) {
      selectedLink.target = "_blank";
      selectedLink.rel = "noreferrer noopener";
    }

    emitChange();
    saveSelection();
    setLinkDialogOpen(false);
    setLinkUrl("");
  };

  return (
    <Stack spacing={1.5}>
      {label ? (
        <Typography variant="body2" fontWeight={600} color="text.primary">
          {label}
        </Typography>
      ) : null}

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          borderColor: "divider",
          backgroundColor: disabled ? alpha(theme.palette.action.disabledBackground, 0.4) : "background.paper",
        }}
      >
        <Stack
          direction="row"
          spacing={0.5}
          useFlexGap
          flexWrap="wrap"
          sx={{
            px: 1,
            py: 0.75,
            borderBottom: "1px solid",
            borderColor: "divider",
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          }}
        >
          <Tooltip title="Grassetto">
            <span>
              <IconButton
                size="small"
                onClick={() => runCommand("bold")}
                disabled={disabled}
                aria-label="Grassetto"
              >
                <FormatBoldIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Corsivo">
            <span>
              <IconButton
                size="small"
                onClick={() => runCommand("italic")}
                disabled={disabled}
                aria-label="Corsivo"
              >
                <FormatItalicIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Sottolineato">
            <span>
              <IconButton
                size="small"
                onClick={() => runCommand("underline")}
                disabled={disabled}
                aria-label="Sottolineato"
              >
                <FormatUnderlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Paragrafo">
            <span>
              <IconButton
                size="small"
                onClick={() => runBlockCommand("p")}
                disabled={disabled}
                aria-label="Paragrafo"
              >
                <SubjectIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Titolo">
            <span>
              <IconButton
                size="small"
                onClick={() => runBlockCommand("h2")}
                disabled={disabled}
                aria-label="Titolo"
              >
                <TitleIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Sottotitolo">
            <span>
              <IconButton
                size="small"
                onClick={() => runBlockCommand("h3")}
                disabled={disabled}
                aria-label="Sottotitolo"
              >
                <TitleIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Elenco puntato">
            <span>
              <IconButton
                size="small"
                onClick={() => runCommand("insertUnorderedList")}
                disabled={disabled}
                aria-label="Elenco puntato"
              >
                <FormatListBulletedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Elenco numerato">
            <span>
              <IconButton
                size="small"
                onClick={() => runCommand("insertOrderedList")}
                disabled={disabled}
                aria-label="Elenco numerato"
              >
                <FormatListNumberedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Allinea a sinistra">
            <span>
              <IconButton
                size="small"
                onClick={() => runCommand("justifyLeft")}
                disabled={disabled}
                aria-label="Allinea a sinistra"
              >
                <FormatAlignLeftIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Centra testo">
            <span>
              <IconButton
                size="small"
                onClick={() => runCommand("justifyCenter")}
                disabled={disabled}
                aria-label="Centra testo"
              >
                <FormatAlignCenterIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Inserisci o modifica link">
            <span>
              <IconButton
                size="small"
                onClick={openLinkDialog}
                disabled={disabled}
                aria-label="Inserisci link"
              >
                <LinkIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Rimuovi link">
            <span>
              <IconButton
                size="small"
                onClick={() => runCommand("unlink")}
                disabled={disabled}
                aria-label="Rimuovi link"
              >
                <LinkOffIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <TextField
            select
            size="small"
            value={selectedFont}
            onChange={(event) => applyFontFamily(event.target.value)}
            disabled={disabled}
            sx={{ minWidth: 180 }}
            aria-label="Seleziona font"
            InputProps={{
              startAdornment: (
                <FontDownloadIcon
                  sx={{ color: "text.secondary", fontSize: 18, mr: 1 }}
                />
              ),
            }}
          >
            {RICH_TEXT_FONT_OPTIONS.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                sx={{ fontFamily: option.value }}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{ px: 0.5 }}
          >
            <PaletteIcon sx={{ color: "text.secondary", fontSize: 18 }} />
            <Box
              component="input"
              type="color"
              value={selectedTextColor}
              onChange={(event) => applyTextColor(event.target.value)}
              disabled={disabled}
              aria-label="Colore testo"
              sx={{
                width: 32,
                height: 32,
                p: 0,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "transparent",
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            />
            {RICH_TEXT_COLOR_OPTIONS.map((option) => (
              <Tooltip key={option.value} title={option.label}>
                <Box
                  component="button"
                  type="button"
                  onClick={() => applyTextColor(option.value)}
                  disabled={disabled}
                  aria-label={`Usa colore ${option.label}`}
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    border: option.value === selectedTextColor
                      ? `2px solid ${theme.palette.text.primary}`
                      : `1px solid ${alpha(theme.palette.text.primary, 0.18)}`,
                    backgroundColor: option.value,
                    cursor: disabled ? "not-allowed" : "pointer",
                    p: 0,
                  }}
                />
              </Tooltip>
            ))}
          </Stack>
          <Tooltip title="Rimuovi formattazione">
            <span>
              <IconButton
                size="small"
                onClick={() => runCommand("removeFormat")}
                disabled={disabled}
                aria-label="Rimuovi formattazione"
              >
                <UndoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Button
            size="small"
            startIcon={<PreviewIcon fontSize="small" />}
            onClick={() => setPreviewOpen((current) => !current)}
            disabled={disabled && !value}
            sx={{ ml: "auto" }}
          >
            {previewOpen ? "Nascondi anteprima" : "Anteprima isolata"}
          </Button>
        </Stack>

        <Box
          ref={editorRef}
          component="div"
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={emitChange}
          onBlur={emitChange}
          onMouseUp={saveSelection}
          onKeyUp={saveSelection}
          data-placeholder={placeholder ?? ""}
          sx={{
            minHeight,
            px: 1.5,
            py: 1.25,
            outline: "none",
            color: disabled ? "text.disabled" : "text.primary",
            fontFamily: "'Montserrat', sans-serif",
            cursor: disabled ? "not-allowed" : "text",
            '&[contenteditable="true"]:focus': {
              boxShadow: `inset 0 0 0 2px ${alpha(theme.palette.primary.main, 0.18)}`,
            },
            "&:empty:before": {
              content: "attr(data-placeholder)",
              color: "text.disabled",
            },
            "& p": {
              my: 0,
            },
            "& ul, & ol": {
              my: 0,
              pl: 3,
            },
            "& strong": {
              fontWeight: 700,
            },
            "& em": {
              fontStyle: "italic",
            },
          }}
        />
      </Paper>

      {previewOpen ? (
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3,
            p: 2,
            borderColor: "divider",
            backgroundColor: alpha(theme.palette.secondary.main, 0.03),
          }}
        >
          <Stack spacing={1.5}>
            <Typography variant="body2" fontWeight={600} color="text.primary">
              Anteprima isolata
            </Typography>
            {value.trim() ? (
              <IsolatedHtmlContent html={value} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nessun contenuto da mostrare nell&apos;anteprima.
              </Typography>
            )}
          </Stack>
        </Paper>
      ) : null}

      {helperText ? (
        <Typography variant="caption" color="text.secondary">
          {helperText}
        </Typography>
      ) : null}

      <Dialog
        open={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Inserisci link</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="URL"
            placeholder="https://esempio.it"
            fullWidth
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            helperText="Se manca il protocollo verrà aggiunto https://"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setLinkDialogOpen(false);
              setLinkUrl("");
            }}
          >
            Annulla
          </Button>
          <Button onClick={applyLink} variant="contained">
            Applica
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}