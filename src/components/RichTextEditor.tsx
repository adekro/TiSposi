import {
  Box,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { FormatBold as FormatBoldIcon } from "@mui/icons-material";
import { FormatItalic as FormatItalicIcon } from "@mui/icons-material";
import { FormatListBulleted as FormatListBulletedIcon } from "@mui/icons-material";
import { FormatListNumbered as FormatListNumberedIcon } from "@mui/icons-material";
import { Undo as UndoIcon } from "@mui/icons-material";
import { useEffect, useRef } from "react";

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

  return value;
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

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML === value) return;
    editorRef.current.innerHTML = value;
  }, [value]);

  const emitChange = () => {
    if (!editorRef.current) return;
    onChange(normalizeHtml(editorRef.current.innerHTML));
  };

  const runCommand = (command: string) => {
    if (disabled || !editorRef.current) return;

    editorRef.current.focus();
    document.execCommand(command, false);
    emitChange();
  };

  return (
    <Stack spacing={1}>
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
          sx={{
            px: 1,
            py: 0.75,
            borderBottom: "1px solid",
            borderColor: "divider",
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          }}
        >
          <IconButton
            size="small"
            onClick={() => runCommand("bold")}
            disabled={disabled}
            aria-label="Grassetto"
          >
            <FormatBoldIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => runCommand("italic")}
            disabled={disabled}
            aria-label="Corsivo"
          >
            <FormatItalicIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => runCommand("insertUnorderedList")}
            disabled={disabled}
            aria-label="Elenco puntato"
          >
            <FormatListBulletedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => runCommand("insertOrderedList")}
            disabled={disabled}
            aria-label="Elenco numerato"
          >
            <FormatListNumberedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => runCommand("removeFormat")}
            disabled={disabled}
            aria-label="Rimuovi formattazione"
          >
            <UndoIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Box
          ref={editorRef}
          component="div"
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={emitChange}
          onBlur={emitChange}
          data-placeholder={placeholder ?? ""}
          sx={{
            minHeight,
            px: 1.5,
            py: 1.25,
            outline: "none",
            color: disabled ? "text.disabled" : "text.primary",
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

      {helperText ? (
        <Typography variant="caption" color="text.secondary">
          {helperText}
        </Typography>
      ) : null}
    </Stack>
  );
}