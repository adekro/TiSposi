import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import type {
  LandingBlock,
  LandingBlockType,
  LandingConfig,
  LandingThemePreset,
} from "../types";
import RichTextEditor from "./RichTextEditor";
import { useLandingConfig } from "../hooks/useLandingConfig";
import { supabase } from "../lib/supabase";

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
  { value: "wallpaper_ivory", label: "Carta da parati Avorio" },
  { value: "eucalyptus_mint", label: "Eucalipto Soft" },
  { value: "blush_watercolor", label: "Acquerello Blush" },
];

const MENU_CTA_SLOT_LABELS = [
  "Bottone Gallery",
  "Bottone RSVP",
  "Bottone Lista nozze",
] as const;

function getMenuCtaHrefByIndex(index: number) {
  if (index === 0) return "/{publicId}/gallery";
  if (index === 1) return "/{publicId}/rsvp";
  if (index === 2) return "/{publicId}/listanozze";
  return "/{publicId}/gallery";
}

function getMenuCtaSlotLabel(index: number) {
  return MENU_CTA_SLOT_LABELS[index] ?? `Bottone ${index + 1}`;
}

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

function normalizeLandingConfigBeforeSave(config: LandingConfig): LandingConfig {
  return {
    ...config,
    blocks: normalizeOrders(config.blocks).map((block) => {
      if (block.type !== "menu_cta") {
        return block;
      }

      const items = block.content.items.map((item, index) => ({
        ...item,
        href: getMenuCtaHrefByIndex(index),
      }));

      return {
        ...block,
        content: {
          ...block.content,
          items,
        },
      };
    }),
  };
}

function getPreviewStorageKey(publicId: string) {
  return `landing-preview:${publicId}`;
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
  const [heroUploadMessage, setHeroUploadMessage] = useState("");
  const [heroUploadError, setHeroUploadError] = useState("");
  const [desktopUploading, setDesktopUploading] = useState(false);
  const [tabletUploading, setTabletUploading] = useState(false);
  const [mobileUploading, setMobileUploading] = useState(false);
  const [blockImageUploading, setBlockImageUploading] = useState<
    Record<string, boolean>
  >({});

  const desktopInputRef = useRef<HTMLInputElement>(null);
  const tabletInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const previewChannelRef = useRef<BroadcastChannel | null>(null);
  const latestConfigRef = useRef<LandingConfig | null>(null);

  useEffect(() => {
    if (landingHook.isLoading) return;
    setConfig(landingHook.landingConfig ?? createDefaultLandingConfig(spouses));
  }, [landingHook.isLoading, landingHook.landingConfig, spouses]);

  const sortedBlocks = useMemo(
    () => normalizeOrders(config?.blocks ?? []),
    [config?.blocks],
  );

  useEffect(() => {
    latestConfigRef.current = config ? normalizeLandingConfigBeforeSave(config) : null;
  }, [config]);

  useEffect(() => {
    if (!publicId.trim()) return;
    if (typeof window === "undefined") return;
    if (typeof BroadcastChannel === "undefined") return;

    const channelName = `landing-preview-${publicId}`;
    const channel = new BroadcastChannel(channelName);
    previewChannelRef.current = channel;

    const handleMessage = (event: MessageEvent) => {
      const payload = event.data as { type?: string } | null;
      if (!payload?.type) return;
      if (payload.type === "landing-config-request") {
        const snapshot = latestConfigRef.current;
        if (!snapshot) return;
        channel.postMessage({
          type: "landing-config-update",
          source: "builder",
          at: Date.now(),
          config: snapshot,
        });
      }
    };

    channel.addEventListener("message", handleMessage);

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
      previewChannelRef.current = null;
    };
  }, [publicId]);

  useEffect(() => {
    if (!publicId.trim()) return;
    if (!config) return;
    if (typeof window === "undefined") return;

    const normalized = normalizeLandingConfigBeforeSave(config);
    const payload = {
      at: Date.now(),
      config: normalized,
    };

    try {
      window.localStorage.setItem(getPreviewStorageKey(publicId), JSON.stringify(payload));
    } catch {
      // ignore storage quota errors in preview sync
    }

    previewChannelRef.current?.postMessage({
      type: "landing-config-update",
      source: "builder",
      ...payload,
    });
  }, [config, publicId]);

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
    const normalizedConfig = normalizeLandingConfigBeforeSave(config);
    await landingHook.save({
      eventId: landingHook.eventId,
      landingConfig: normalizedConfig,
    });
  };

  const getAccessToken = async () => {
    if (!supabase) {
      throw new Error("Supabase non configurato nel client.");
    }
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error || !session?.access_token) {
      throw new Error("Sessione scaduta. Rieffettua il login.");
    }
    return session.access_token;
  };

  const setHeroField = (
    key: "imageUrlDesktop" | "imageUrlTablet" | "imageUrlMobile",
    value: string | null,
  ) => {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            hero: {
              ...prev.hero,
              [key]: value,
            },
          }
        : prev,
    );
  };

  const uploadHeroImage = async (
    variant: "desktop" | "tablet" | "mobile",
    file: File,
  ) => {
    if (!landingHook.eventId) return;

    const map = {
      desktop: {
        endpoint: "/api/upload-landing-desktop-bg",
        key: "imageUrlDesktop" as const,
        setLoading: setDesktopUploading,
      },
      tablet: {
        endpoint: "/api/upload-landing-tablet-bg",
        key: "imageUrlTablet" as const,
        setLoading: setTabletUploading,
      },
      mobile: {
        endpoint: "/api/upload-landing-mobile-bg",
        key: "imageUrlMobile" as const,
        setLoading: setMobileUploading,
      },
    };

    const target = map[variant];
    target.setLoading(true);
    setHeroUploadError("");
    setHeroUploadMessage("");

    try {
      const token = await getAccessToken();
      const response = await fetch(target.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": file.type,
          Authorization: `Bearer ${token}`,
        },
        body: file,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Errore durante il caricamento");
      }

      const versionedUrl = `${target.endpoint}?eventId=${landingHook.eventId}&v=${Date.now()}`;
      setHeroField(target.key, versionedUrl);
      setHeroUploadMessage(
        `Immagine Hero ${variant} caricata. Ricorda di salvare la landing.`,
      );
    } catch (error) {
      setHeroUploadError(error instanceof Error ? error.message : "Errore sconosciuto");
    } finally {
      target.setLoading(false);
    }
  };

  const deleteHeroImage = async (variant: "desktop" | "tablet" | "mobile") => {
    const map = {
      desktop: {
        endpoint: "/api/upload-landing-desktop-bg",
        key: "imageUrlDesktop" as const,
        setLoading: setDesktopUploading,
      },
      tablet: {
        endpoint: "/api/upload-landing-tablet-bg",
        key: "imageUrlTablet" as const,
        setLoading: setTabletUploading,
      },
      mobile: {
        endpoint: "/api/upload-landing-mobile-bg",
        key: "imageUrlMobile" as const,
        setLoading: setMobileUploading,
      },
    };

    const target = map[variant];
    target.setLoading(true);
    setHeroUploadError("");
    setHeroUploadMessage("");

    try {
      const token = await getAccessToken();
      const response = await fetch(target.endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Errore durante la rimozione");
      }

      setHeroField(target.key, null);
      setHeroUploadMessage(
        `Immagine Hero ${variant} rimossa. Ricorda di salvare la landing.`,
      );
    } catch (error) {
      setHeroUploadError(error instanceof Error ? error.message : "Errore sconosciuto");
    } finally {
      target.setLoading(false);
    }
  };

  const setBlockImageLoading = (blockId: string, value: boolean) => {
    setBlockImageUploading((prev) => ({
      ...prev,
      [blockId]: value,
    }));
  };

  const uploadBlockImage = async (blockId: string, file: File) => {
    if (!landingHook.eventId) return;

    setBlockImageLoading(blockId, true);
    setHeroUploadError("");
    setHeroUploadMessage("");

    try {
      const token = await getAccessToken();
      const endpoint = `/api/upload-landing-block-image?blockId=${encodeURIComponent(blockId)}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": file.type,
          Authorization: `Bearer ${token}`,
        },
        body: file,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Errore durante il caricamento immagine blocco");
      }

      const imageUrl = `/api/upload-landing-block-image?eventId=${landingHook.eventId}&blockId=${encodeURIComponent(blockId)}&v=${Date.now()}`;

      updateBlock(blockId, (current) =>
        current.type === "image"
          ? {
              ...current,
              content: {
                ...current.content,
                imageUrl,
              },
            }
          : current,
      );

      setHeroUploadMessage("Immagine blocco caricata. Ricorda di salvare la landing.");
    } catch (error) {
      setHeroUploadError(error instanceof Error ? error.message : "Errore sconosciuto");
    } finally {
      setBlockImageLoading(blockId, false);
    }
  };

  const deleteBlockImage = async (blockId: string) => {
    setBlockImageLoading(blockId, true);
    setHeroUploadError("");
    setHeroUploadMessage("");

    try {
      const token = await getAccessToken();
      const endpoint = `/api/upload-landing-block-image?blockId=${encodeURIComponent(blockId)}`;
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Errore durante la rimozione immagine blocco");
      }

      updateBlock(blockId, (current) =>
        current.type === "image"
          ? {
              ...current,
              content: {
                ...current.content,
                imageUrl: "",
              },
            }
          : current,
      );

      setHeroUploadMessage("Immagine blocco rimossa. Ricorda di salvare la landing.");
    } catch (error) {
      setHeroUploadError(error instanceof Error ? error.message : "Errore sconosciuto");
    } finally {
      setBlockImageLoading(blockId, false);
    }
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
      {heroUploadError ? <Alert severity="error">{heroUploadError}</Alert> : null}
      {heroUploadMessage ? <Alert severity="success">{heroUploadMessage}</Alert> : null}
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

            <Stack spacing={1.2}>
              <Typography variant="subtitle2">Upload Hero desktop/tablet/mobile</Typography>
              <Typography variant="body2" color="text.secondary">
                Formati supportati: JPG, PNG, WebP (max 4 MB). L&apos;upload aggiorna in automatico il relativo campo URL.
              </Typography>

              <Stack direction={{ xs: "column", md: "row" }} spacing={1.2}>
                <input
                  ref={desktopInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    await uploadHeroImage("desktop", file);
                    if (desktopInputRef.current) {
                      desktopInputRef.current.value = "";
                    }
                  }}
                />

                <input
                  ref={tabletInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    await uploadHeroImage("tablet", file);
                    if (tabletInputRef.current) {
                      tabletInputRef.current.value = "";
                    }
                  }}
                />

                <input
                  ref={mobileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    await uploadHeroImage("mobile", file);
                    if (mobileInputRef.current) {
                      mobileInputRef.current.value = "";
                    }
                  }}
                />

                <Stack spacing={1} sx={{ width: "100%" }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button
                      variant="outlined"
                      startIcon={desktopUploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                      disabled={desktopUploading}
                      onClick={() => desktopInputRef.current?.click()}
                    >
                      Carica Desktop
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      disabled={desktopUploading || !config.hero.imageUrlDesktop}
                      onClick={() => void deleteHeroImage("desktop")}
                    >
                      Rimuovi Desktop
                    </Button>
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button
                      variant="outlined"
                      startIcon={tabletUploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                      disabled={tabletUploading}
                      onClick={() => tabletInputRef.current?.click()}
                    >
                      Carica Tablet
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      disabled={tabletUploading || !config.hero.imageUrlTablet}
                      onClick={() => void deleteHeroImage("tablet")}
                    >
                      Rimuovi Tablet
                    </Button>
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button
                      variant="outlined"
                      startIcon={mobileUploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                      disabled={mobileUploading}
                      onClick={() => mobileInputRef.current?.click()}
                    >
                      Carica Mobile
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      disabled={mobileUploading || !config.hero.imageUrlMobile}
                      onClick={() => void deleteHeroImage("mobile")}
                    >
                      Rimuovi Mobile
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
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
                                        {getMenuCtaSlotLabel(itemIndex)}
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
                              disabled={block.content.items.length >= 3}
                              onClick={() =>
                                updateBlock(block.id, (current) => {
                                  if (current.type !== "menu_cta") return current;
                                  if (current.content.items.length >= 3) return current;
                                  return {
                                    ...current,
                                    content: {
                                      ...current.content,
                                      items: [
                                        ...current.content.items,
                                        {
                                          id: createId("cta"),
                                          label: "Nuovo bottone",
                                          href: getMenuCtaHrefByIndex(
                                            current.content.items.length,
                                          ),
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
                            {block.content.items.length >= 3 ? (
                              <Typography variant="caption" color="text.secondary">
                                Limite raggiunto: il blocco CTA supporta 3 bottoni (Gallery, RSVP, Lista nozze).
                              </Typography>
                            ) : null}
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

                            <Typography variant="body2" color="text.secondary">
                              Upload diretto file (JPG, PNG, WebP - max 4 MB)
                            </Typography>

                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              <Button
                                component="label"
                                variant="outlined"
                                startIcon={
                                  blockImageUploading[block.id] ? (
                                    <CircularProgress size={16} />
                                  ) : (
                                    <CloudUploadIcon />
                                  )
                                }
                                disabled={Boolean(blockImageUploading[block.id])}
                              >
                                Carica file
                                <input
                                  hidden
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  onChange={async (event) => {
                                    const file = event.target.files?.[0];
                                    if (!file) return;
                                    await uploadBlockImage(block.id, file);
                                    event.currentTarget.value = "";
                                  }}
                                />
                              </Button>

                              <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                disabled={
                                  Boolean(blockImageUploading[block.id]) ||
                                  !block.content.imageUrl
                                }
                                onClick={() => void deleteBlockImage(block.id)}
                              >
                                Rimuovi file
                              </Button>
                            </Stack>

                            {block.content.imageUrl ? (
                              <Box
                                component="img"
                                src={block.content.imageUrl}
                                alt="Anteprima blocco immagine"
                                sx={{
                                  width: "100%",
                                  maxWidth: 360,
                                  height: 180,
                                  objectFit: "cover",
                                  borderRadius: 2,
                                  border: "1px solid",
                                  borderColor: "divider",
                                }}
                              />
                            ) : null}
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
        <Button
          variant="outlined"
          component="a"
          href={publicId ? `/${publicId}/landing?preview=builder` : "#"}
          target="_blank"
          rel="noreferrer"
          disabled={!publicId}
        >
          Apri anteprima live
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
