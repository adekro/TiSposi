import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { DragIndicator as DragIndicatorIcon } from "@mui/icons-material";
import { Save as SaveIcon } from "@mui/icons-material";
import { Visibility as VisibilityIcon } from "@mui/icons-material";
import { VisibilityOff as VisibilityOffIcon } from "@mui/icons-material";
import type {
  LandingBlock,
  LandingBlockType,
  LandingConfig,
  LandingThemePreset,
} from "../types";
import RichTextEditor from "./RichTextEditor";
import { useLandingConfig } from "../hooks/useLandingConfig";

interface Props {
  userId: string;
  publicId: string;
  spouses?: string;
}

interface BlockTypeOption {
  type: LandingBlockType;
  label: string;
}

const BLOCK_OPTIONS: BlockTypeOption[] = [
  { type: "text", label: "Scritta" },
  { type: "menu_cta", label: "Menu CTA" },
  { type: "story", label: "La nostra storia" },
  { type: "event_info", label: "Info evento" },
  { type: "wedding_menu", label: "Menu matrimonio" },
  { type: "image", label: "Immagine" },
  { type: "gallery", label: "Galleria" },
];

const THEME_OPTIONS: Array<{ value: LandingThemePreset; label: string }> = [
  { value: "gold", label: "Gold" },
  { value: "rose", label: "Rose" },
  { value: "classic", label: "Classic" },
];

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createDefaultLandingConfig(spouses?: string): LandingConfig {
  return {
    headerFixed: true,
    theme: "gold",
    hero: {
      title: spouses?.trim() || "Benvenuti",
      subtitle: null,
      imageUrlDesktop: null,
      imageUrlTablet: null,
      imageUrlMobile: null,
      overlayOpacity: 0.45,
      textAlign: "center",
    },
    blocks: [
      {
        id: createId("menu"),
        type: "menu_cta",
        order: 0,
        visible: true,
        content: {
          title: "Scopri tutto",
          items: [
            {
              id: createId("cta"),
              label: "Galleria",
              href: "/{publicId}/gallery",
              variant: "contained",
            },
            {
              id: createId("cta"),
              label: "RSVP",
              href: "/{publicId}/rsvp",
              variant: "outlined",
            },
            {
              id: createId("cta"),
              label: "Lista nozze",
              href: "/{publicId}/listanozze",
              variant: "outlined",
            },
          ],
        },
      },
      {
        id: createId("event"),
        type: "event_info",
        order: 1,
        visible: true,
        content: {
          title: "Info evento",
        },
      },
    ],
  };
}

function createDefaultBlock(type: LandingBlockType, order: number): LandingBlock {
  switch (type) {
    case "text":
      return {
        id: createId("text"),
        type: "text",
        order,
        visible: true,
        content: {
          html: "<p>Nuovo blocco testo</p>",
        },
      };
    case "menu_cta":
      return {
        id: createId("menu"),
        type: "menu_cta",
        order,
        visible: true,
        content: {
          title: "Menu rapido",
          items: [
            {
              id: createId("cta"),
              label: "Nuovo bottone",
              href: "/{publicId}/landing",
              variant: "outlined",
            },
          ],
        },
      };
    case "story":
      return {
        id: createId("story"),
        type: "story",
        order,
        visible: true,
        content: {
          title: "La nostra storia",
          html: "<p>Raccontate qui la vostra storia.</p>",
        },
      };
    case "event_info":
      return {
        id: createId("event"),
        type: "event_info",
        order,
        visible: true,
        content: {
          title: "Info evento",
        },
      };
    case "wedding_menu":
      return {
        id: createId("wedding-menu"),
        type: "wedding_menu",
        order,
        visible: true,
        content: {
          title: "Menu matrimonio",
        },
      };
    case "image":
      return {
        id: createId("image"),
        type: "image",
        order,
        visible: true,
        content: {
          imageUrl: "",
          caption: null,
        },
      };
    case "gallery":
      return {
        id: createId("gallery"),
        type: "gallery",
        order,
        visible: true,
        content: {
          title: "Galleria",
          limit: 6,
        },
      };
    default:
      return {
        id: createId("text"),
        type: "text",
        order,
        visible: true,
        content: {
          html: "",
        },
      };
  }
}

function normalizeOrders(blocks: LandingBlock[]) {
  return [...blocks]
    .sort((a, b) => a.order - b.order)
    .map((block, index) => ({ ...block, order: index }));
}

function getTypeLabel(type: LandingBlockType) {
  return BLOCK_OPTIONS.find((option) => option.type === type)?.label ?? type;
}

export default function LandingBuilderTab({ userId, publicId, spouses }: Props) {
  const landingHook = useLandingConfig(userId);
  const [config, setConfig] = useState<LandingConfig | null>(null);
  const [newBlockType, setNewBlockType] = useState<LandingBlockType>("text");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (landingHook.isLoading) return;
    setConfig(landingHook.landingConfig ?? createDefaultLandingConfig(spouses));
  }, [landingHook.isLoading, landingHook.landingConfig, spouses]);

  const sortedBlocks = useMemo(
    () => normalizeOrders(config?.blocks ?? []),
    [config?.blocks],
  );

  const setBlocks = (updater: (prev: LandingBlock[]) => LandingBlock[]) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const updated = normalizeOrders(updater(prev.blocks));
      return {
        ...prev,
        blocks: updated,
      };
    });
  };

  const updateBlock = (id: string, updater: (block: LandingBlock) => LandingBlock) => {
    setBlocks((blocks) => blocks.map((block) => (block.id === id ? updater(block) : block)));
  };

  const removeBlock = (id: string) => {
    setBlocks((blocks) => blocks.filter((block) => block.id !== id));
  };

  const addBlock = () => {
    setBlocks((blocks) => [...blocks, createDefaultBlock(newBlockType, blocks.length)]);
  };

  const handleDropOn = (targetId: string) => {
    if (!draggingId || draggingId === targetId) return;
    setBlocks((blocks) => {
      const sourceIndex = blocks.findIndex((block) => block.id === draggingId);
      const targetIndex = blocks.findIndex((block) => block.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return blocks;
      const next = [...blocks];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDraggingId(null);
    setDropTargetId(null);
  };

  const handleSave = async () => {
    if (!config || !landingHook.eventId) return;
    await landingHook.save({
      eventId: landingHook.eventId,
      landingConfig: {
        ...config,
        blocks: normalizeOrders(config.blocks),
      },
    });
  };

  if (!userId.trim()) {
    return <Alert severity="warning">Utente non autenticato.</Alert>;
  }

  if (landingHook.isLoading || !config) {
    return <Alert severity="info">Caricamento configurazione landing...</Alert>;
  }

  if (!landingHook.eventId) {
    return (
      <Alert severity="warning">
        Salva prima la configurazione evento per creare la landing a blocchi.
      </Alert>
    );
  }

  const saveErrorMessage =
    landingHook.saveError instanceof Error
      ? landingHook.saveError.message
      : "";

  return (
    <Stack spacing={2.5}>
      {saveErrorMessage ? <Alert severity="error">{saveErrorMessage}</Alert> : null}

      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Stack spacing={2.2}>
            <Typography variant="h6">Impostazioni globali</Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                select
                label="Tema"
                value={config.theme}
                onChange={(e) => {
                  const theme = e.target.value as LandingThemePreset;
                  setConfig((prev) => (prev ? { ...prev, theme } : prev));
                }}
                fullWidth
              >
                {THEME_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Allineamento testo Hero"
                value={config.hero.textAlign}
                onChange={(e) => {
                  const textAlign = e.target.value as "left" | "center" | "right";
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          hero: {
                            ...prev.hero,
                            textAlign,
                          },
                        }
                      : prev,
                  );
                }}
                fullWidth
              >
                <MenuItem value="left">Sinistra</MenuItem>
                <MenuItem value="center">Centro</MenuItem>
                <MenuItem value="right">Destra</MenuItem>
              </TextField>
            </Stack>

            <FormControlLabel
              control={
                <Switch
                  checked={config.headerFixed}
                  onChange={(e) =>
                    setConfig((prev) =>
                      prev
                        ? {
                            ...prev,
                            headerFixed: e.target.checked,
                          }
                        : prev,
                    )
                  }
                />
              }
              label="Header fisso"
            />
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Stack spacing={2.2}>
            <Typography variant="h6">Hero</Typography>

            <TextField
              label="Titolo Hero"
              value={config.hero.title}
              onChange={(e) =>
                setConfig((prev) =>
                  prev
                    ? {
                        ...prev,
                        hero: {
                          ...prev.hero,
                          title: e.target.value,
                        },
                      }
                    : prev,
                )
              }
              fullWidth
            />

            <TextField
              label="Sottotitolo Hero"
              value={config.hero.subtitle ?? ""}
              onChange={(e) =>
                setConfig((prev) =>
                  prev
                    ? {
                        ...prev,
                        hero: {
                          ...prev.hero,
                          subtitle: e.target.value.trim() ? e.target.value : null,
                        },
                      }
                    : prev,
                )
              }
              fullWidth
            />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Immagine desktop (URL)"
                value={config.hero.imageUrlDesktop ?? ""}
                onChange={(e) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          hero: {
                            ...prev.hero,
                            imageUrlDesktop: e.target.value.trim() ? e.target.value : null,
                          },
                        }
                      : prev,
                  )
                }
                fullWidth
              />
              <TextField
                label="Immagine tablet (URL)"
                value={config.hero.imageUrlTablet ?? ""}
                onChange={(e) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          hero: {
                            ...prev.hero,
                            imageUrlTablet: e.target.value.trim() ? e.target.value : null,
                          },
                        }
                      : prev,
                  )
                }
                fullWidth
              />
              <TextField
                label="Immagine mobile (URL)"
                value={config.hero.imageUrlMobile ?? ""}
                onChange={(e) =>
                  setConfig((prev) =>
                    prev
                      ? {
                          ...prev,
                          hero: {
                            ...prev.hero,
                            imageUrlMobile: e.target.value.trim() ? e.target.value : null,
                          },
                        }
                      : prev,
                  )
                }
                fullWidth
              />
            </Stack>

            <TextField
              label="Overlay Hero (0 - 1)"
              type="number"
              value={config.hero.overlayOpacity}
              onChange={(e) => {
                const next = Number(e.target.value);
                const safe = Number.isFinite(next)
                  ? Math.max(0, Math.min(1, next))
                  : 0.45;
                setConfig((prev) =>
                  prev
                    ? {
                        ...prev,
                        hero: {
                          ...prev.hero,
                          overlayOpacity: safe,
                        },
                      }
                    : prev,
                );
              }}
              fullWidth
              inputProps={{ step: 0.05, min: 0, max: 1 }}
            />
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Stack spacing={2.2}>
            <Typography variant="h6">Blocchi pagina</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <TextField
                select
                label="Nuovo blocco"
                value={newBlockType}
                onChange={(e) => setNewBlockType(e.target.value as LandingBlockType)}
                fullWidth
              >
                {BLOCK_OPTIONS.map((option) => (
                  <MenuItem key={option.type} value={option.type}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={addBlock}>
                Aggiungi blocco
              </Button>
            </Stack>

            <Stack spacing={1.6}>
              {sortedBlocks.length === 0 ? (
                <Alert severity="info">Nessun blocco presente. Aggiungi il primo blocco.</Alert>
              ) : (
                sortedBlocks.map((block) => (
                  <Card
                    key={block.id}
                    draggable
                    onDragStart={() => setDraggingId(block.id)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDropTargetId(block.id);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDropOn(block.id);
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setDropTargetId(null);
                    }}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor:
                        dropTargetId === block.id ? "primary.main" : "divider",
                      opacity: draggingId === block.id ? 0.75 : 1,
                    }}
                  >
                    <CardContent>
                      <Stack spacing={1.6}>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          alignItems={{ xs: "flex-start", sm: "center" }}
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Stack direction="row" spacing={1.2} alignItems="center">
                            <DragIndicatorIcon color="action" />
                            <Typography fontWeight={700}>
                              {getTypeLabel(block.type)}
                            </Typography>
                            <Chip size="small" label={`#${block.order + 1}`} />
                            <Chip
                              size="small"
                              label={block.visible ? "Visibile" : "Nascosto"}
                              color={block.visible ? "success" : "default"}
                              variant="outlined"
                            />
                          </Stack>
                          <Stack direction="row" spacing={0.5}>
                            <IconButton
                              size="small"
                              onClick={() =>
                                updateBlock(block.id, (current) => ({
                                  ...current,
                                  visible: !current.visible,
                                }))
                              }
                            >
                              {block.visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeBlock(block.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
                        </Stack>

                        {block.type === "text" && (
                          <RichTextEditor
                            label="Contenuto"
                            value={block.content.html}
                            onChange={(value) =>
                              updateBlock(block.id, (current) =>
                                current.type === "text"
                                  ? {
                                      ...current,
                                      content: {
                                        ...current.content,
                                        html: value,
                                      },
                                    }
                                  : current,
                              )
                            }
                            minHeight={130}
                          />
                        )}

                        {block.type === "story" && (
                          <Stack spacing={1.2}>
                            <TextField
                              label="Titolo"
                              value={block.content.title ?? ""}
                              onChange={(e) =>
                                updateBlock(block.id, (current) =>
                                  current.type === "story"
                                    ? {
                                        ...current,
                                        content: {
                                          ...current.content,
                                          title: e.target.value.trim() ? e.target.value : null,
                                        },
                                      }
                                    : current,
                                )
                              }
                              fullWidth
                            />
                            <RichTextEditor
                              label="Testo storia"
                              value={block.content.html}
                              onChange={(value) =>
                                updateBlock(block.id, (current) =>
                                  current.type === "story"
                                    ? {
                                        ...current,
                                        content: {
                                          ...current.content,
                                          html: value,
                                        },
                                      }
                                    : current,
                                )
                              }
                              minHeight={130}
                            />
                          </Stack>
                        )}

                        {block.type === "menu_cta" && (
                          <Stack spacing={1.2}>
                            <TextField
                              label="Titolo blocco"
                              value={block.content.title ?? ""}
                              onChange={(e) =>
                                updateBlock(block.id, (current) =>
                                  current.type === "menu_cta"
                                    ? {
                                        ...current,
                                        content: {
                                          ...current.content,
                                          title: e.target.value.trim() ? e.target.value : null,
                                        },
                                      }
                                    : current,
                                )
                              }
                              fullWidth
                            />

                            <Stack spacing={1}>
                              {block.content.items.map((item, itemIndex) => (
                                <Card key={item.id} variant="outlined">
                                  <CardContent>
                                    <Stack spacing={1}>
                                      <Typography variant="subtitle2">
                                        Bottone {itemIndex + 1}
                                      </Typography>
                                      <TextField
                                        label="Label"
                                        value={item.label}
                                        onChange={(e) =>
                                          updateBlock(block.id, (current) => {
                                            if (current.type !== "menu_cta") return current;
                                            const nextItems = current.content.items.map((entry) =>
                                              entry.id === item.id
                                                ? { ...entry, label: e.target.value }
                                                : entry,
                                            );
                                            return {
                                              ...current,
                                              content: {
                                                ...current.content,
                                                items: nextItems,
                                              },
                                            };
                                          })
                                        }
                                        fullWidth
                                      />
                                      <TextField
                                        label="Link"
                                        value={item.href}
                                        onChange={(e) =>
                                          updateBlock(block.id, (current) => {
                                            if (current.type !== "menu_cta") return current;
                                            const nextItems = current.content.items.map((entry) =>
                                              entry.id === item.id
                                                ? { ...entry, href: e.target.value }
                                                : entry,
                                            );
                                            return {
                                              ...current,
                                              content: {
                                                ...current.content,
                                                items: nextItems,
                                              },
                                            };
                                          })
                                        }
                                        helperText="Usa /{publicId}/gallery oppure URL esterno https://..."
                                        fullWidth
                                      />
                                      <Stack direction="row" spacing={1}>
                                        <TextField
                                          select
                                          label="Stile"
                                          value={item.variant ?? "outlined"}
                                          onChange={(e) =>
                                            updateBlock(block.id, (current) => {
                                              if (current.type !== "menu_cta") return current;
                                              const nextItems = current.content.items.map((entry) =>
                                                entry.id === item.id
                                                  ? {
                                                      ...entry,
                                                      variant: e.target.value as "contained" | "outlined",
                                                    }
                                                  : entry,
                                              );
                                              return {
                                                ...current,
                                                content: {
                                                  ...current.content,
                                                  items: nextItems,
                                                },
                                              };
                                            })
                                          }
                                          fullWidth
                                        >
                                          <MenuItem value="outlined">Outlined</MenuItem>
                                          <MenuItem value="contained">Contained</MenuItem>
                                        </TextField>
                                        <Button
                                          color="error"
                                          variant="outlined"
                                          onClick={() =>
                                            updateBlock(block.id, (current) => {
                                              if (current.type !== "menu_cta") return current;
                                              return {
                                                ...current,
                                                content: {
                                                  ...current.content,
                                                  items: current.content.items.filter(
                                                    (entry) => entry.id !== item.id,
                                                  ),
                                                },
                                              };
                                            })
                                          }
                                        >
                                          Rimuovi
                                        </Button>
                                      </Stack>
                                    </Stack>
                                  </CardContent>
                                </Card>
                              ))}
                            </Stack>

                            <Button
                              variant="outlined"
                              startIcon={<AddIcon />}
                              onClick={() =>
                                updateBlock(block.id, (current) => {
                                  if (current.type !== "menu_cta") return current;
                                  return {
                                    ...current,
                                    content: {
                                      ...current.content,
                                      items: [
                                        ...current.content.items,
                                        {
                                          id: createId("cta"),
                                          label: "Nuovo bottone",
                                          href: "/{publicId}/landing",
                                          variant: "outlined",
                                        },
                                      ],
                                    },
                                  };
                                })
                              }
                            >
                              Aggiungi bottone
                            </Button>
                          </Stack>
                        )}

                        {block.type === "event_info" && (
                          <TextField
                            label="Titolo (opzionale)"
                            value={block.content.title ?? ""}
                            onChange={(e) =>
                              updateBlock(block.id, (current) =>
                                current.type === "event_info"
                                  ? {
                                      ...current,
                                      content: {
                                        ...current.content,
                                        title: e.target.value.trim() ? e.target.value : null,
                                      },
                                    }
                                  : current,
                              )
                            }
                            fullWidth
                          />
                        )}

                        {block.type === "wedding_menu" && (
                          <TextField
                            label="Titolo (opzionale)"
                            value={block.content.title ?? ""}
                            onChange={(e) =>
                              updateBlock(block.id, (current) =>
                                current.type === "wedding_menu"
                                  ? {
                                      ...current,
                                      content: {
                                        ...current.content,
                                        title: e.target.value.trim() ? e.target.value : null,
                                      },
                                    }
                                  : current,
                              )
                            }
                            fullWidth
                          />
                        )}

                        {block.type === "image" && (
                          <Stack spacing={1.2}>
                            <TextField
                              label="URL immagine"
                              value={block.content.imageUrl}
                              onChange={(e) =>
                                updateBlock(block.id, (current) =>
                                  current.type === "image"
                                    ? {
                                        ...current,
                                        content: {
                                          ...current.content,
                                          imageUrl: e.target.value,
                                        },
                                      }
                                    : current,
                                )
                              }
                              fullWidth
                            />
                            <TextField
                              label="Caption"
                              value={block.content.caption ?? ""}
                              onChange={(e) =>
                                updateBlock(block.id, (current) =>
                                  current.type === "image"
                                    ? {
                                        ...current,
                                        content: {
                                          ...current.content,
                                          caption: e.target.value.trim() ? e.target.value : null,
                                        },
                                      }
                                    : current,
                                )
                              }
                              fullWidth
                            />
                          </Stack>
                        )}

                        {block.type === "gallery" && (
                          <Stack spacing={1.2}>
                            <TextField
                              label="Titolo"
                              value={block.content.title ?? ""}
                              onChange={(e) =>
                                updateBlock(block.id, (current) =>
                                  current.type === "gallery"
                                    ? {
                                        ...current,
                                        content: {
                                          ...current.content,
                                          title: e.target.value.trim() ? e.target.value : null,
                                        },
                                      }
                                    : current,
                                )
                              }
                              fullWidth
                            />
                            <TextField
                              type="number"
                              label="Numero massimo foto"
                              value={block.content.limit}
                              onChange={(e) => {
                                const parsed = Number(e.target.value);
                                const safe = Number.isFinite(parsed)
                                  ? Math.max(1, Math.min(12, Math.round(parsed)))
                                  : 6;
                                updateBlock(block.id, (current) =>
                                  current.type === "gallery"
                                    ? {
                                        ...current,
                                        content: {
                                          ...current.content,
                                          limit: safe,
                                        },
                                      }
                                    : current,
                                );
                              }}
                              inputProps={{ min: 1, max: 12 }}
                              fullWidth
                            />
                          </Stack>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                ))
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Divider />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={landingHook.isSaving}
          onClick={() => void handleSave()}
        >
          {landingHook.isSaving ? "Salvataggio..." : "Salva landing"}
        </Button>
        <Button
          variant="outlined"
          component="a"
          href={publicId ? `/${publicId}/landing` : "#"}
          target="_blank"
          rel="noreferrer"
          disabled={!publicId}
        >
          Apri anteprima pubblica
        </Button>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="caption" color="text.secondary">
            Trascina i blocchi usando l&apos;icona per cambiarne l&apos;ordine.
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
}
