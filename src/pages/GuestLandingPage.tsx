import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Chip,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { PhotoCamera as PhotoCameraIcon } from "@mui/icons-material";
import { Checklist as ChecklistIcon } from "@mui/icons-material";
import { CardGiftcard as CardGiftcardIcon } from "@mui/icons-material";
import { RestaurantMenu as RestaurantMenuIcon } from "@mui/icons-material";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useParams, Link as RouterLink, useSearchParams } from "react-router-dom";
import { useGallery } from "../hooks/useGallery";
import LegalFooter from "../components/LegalFooter";
import PWAInstallBanner from "../components/PWAInstallBanner";
import GuestNavbar from "../components/GuestNavbar";
import WeddingInfoSection from "../components/WeddingInfoSection";
import IsolatedHtmlContent from "../components/IsolatedHtmlContent";
import type {
  LandingBlock,
  LandingConfig,
  PublicEventSummary,
} from "../types";
import {
  type LandingThemeView,
  resolveLandingTheme,
} from "../lib/landingTheme";
import WeddingDecorativeOverlay, { WeddingDecorativeDivider } from "../components/WeddingDecorativeOverlay";

function isNonEmpty(value: string | null | undefined) {
  return Boolean(value && value.trim().length > 0);
}

function buildLegacyLandingConfig(event: PublicEventSummary): LandingConfig {
  const hasStory = isNonEmpty(event.coupleStory);
  const hasMenu =
    isNonEmpty(event.menu) ||
    isNonEmpty(event.menuAntipasto) ||
    isNonEmpty(event.menuPrimo) ||
    isNonEmpty(event.menuSecondo) ||
    isNonEmpty(event.menuContorno) ||
    isNonEmpty(event.menuDolce) ||
    isNonEmpty(event.menuBevande);

  const blocks: LandingBlock[] = [
    {
      id: "legacy-menu-cta",
      type: "menu_cta",
      order: 0,
      visible: true,
      content: {
        title: "Scopri tutto quello che abbiamo preparato per voi",
        items: [
          {
            id: "legacy-cta-gallery",
            label: "Galleria foto & dediche",
            href: "/{publicId}/gallery",
            variant: "contained",
          },
          {
            id: "legacy-cta-rsvp",
            label: "Conferma la tua presenza (RSVP)",
            href: "/{publicId}/rsvp",
            variant: "outlined",
          },
          {
            id: "legacy-cta-wl",
            label: "Lista nozze",
            href: "/{publicId}/listanozze",
            variant: "outlined",
          },
        ],
      },
    },
    {
      id: "legacy-event-info",
      type: "event_info",
      order: 1,
      visible: true,
      content: {
        title: null,
      },
    },
  ];

  if (hasStory) {
    blocks.push({
      id: "legacy-story",
      type: "story",
      order: 2,
      visible: true,
      content: {
        title: "La nostra storia",
        html: event.coupleStory ?? "",
      },
    });
  }

  if (hasMenu) {
    blocks.push({
      id: "legacy-menu",
      type: "wedding_menu",
      order: 3,
      visible: true,
      content: {
        title: "Menu",
      },
    });
  }

  return {
    headerFixed: true,
    theme: "gold",
    hero: {
      title: event.spouses || "Benvenuti",
      subtitle: event.weddingDate ?? null,
      imageUrlDesktop: event.landingBgUrl ?? null,
      imageUrlTablet: null,
      imageUrlMobile: null,
      overlayOpacity: 0.45,
      textAlign: "center",
    },
    blocks,
  };
}

function resolveLandingPath(rawHref: string, publicId: string) {
  const href = rawHref.trim();
  if (!href) return `/${publicId}/landing`;
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  return href.replaceAll("{publicId}", publicId);
}

function formatDisplayDate(dateStr?: string | null) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getPreviewStorageKey(publicId: string) {
  return `landing-preview:${publicId}`;
}

function renderWeddingMenu(event: PublicEventSummary, palette: LandingThemeView) {
  const sections = [
    { label: "Antipasto", value: event.menuAntipasto },
    { label: "Primo piatto", value: event.menuPrimo },
    { label: "Secondo piatto", value: event.menuSecondo },
    { label: "Contorno", value: event.menuContorno },
    { label: "Dolce", value: event.menuDolce },
    { label: "Bevande e vini", value: event.menuBevande },
  ].filter((item) => isNonEmpty(item.value));

  if (sections.length === 0 && !isNonEmpty(event.menu)) {
    return null;
  }

  return (
    <Card
      sx={{
        borderRadius: 4,
        background: palette.cardBackground,
        boxShadow: `0 8px 22px ${alpha(palette.accent, 0.16)}`,
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 2 }}>
          <RestaurantMenuIcon sx={{ color: palette.accent }} />
          <Typography
            variant="h5"
            sx={{
              fontFamily: palette.titleFont,
              color: palette.textColor,
            }}
          >
            Menu
          </Typography>
        </Stack>

        {sections.length > 0 ? (
          <Stack spacing={1.4}>
            {sections.map((section) => (
              <Box key={section.label}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    color: palette.accent,
                    letterSpacing: "0.02em",
                  }}
                >
                  {section.label}
                </Typography>
                <Typography
                  sx={{
                    whiteSpace: "pre-line",
                    color: palette.textColor,
                  }}
                >
                  {section.value}
                </Typography>
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography sx={{ whiteSpace: "pre-line", color: palette.textColor }}>
            {event.menu}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function GuestLandingPage() {
  const { publicId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const { data, isLoading, error } = useGallery(publicId);
  const event = data?.event;
  const [previewConfig, setPreviewConfig] = useState<LandingConfig | null>(null);
  const [previewUpdatedAt, setPreviewUpdatedAt] = useState<number | null>(null);

  const isBuilderPreview = searchParams.get("preview") === "builder";
  const previewChannelName = useMemo(
    () => (publicId ? `landing-preview-${publicId}` : ""),
    [publicId],
  );

  useEffect(() => {
    if (!isBuilderPreview) {
      setPreviewConfig(null);
      setPreviewUpdatedAt(null);
    }
  }, [isBuilderPreview]);

  useEffect(() => {
    if (!isBuilderPreview || !publicId || typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(getPreviewStorageKey(publicId));
      if (!raw) return;
      const parsed = JSON.parse(raw) as { at?: number; config?: LandingConfig };
      if (parsed?.config) {
        setPreviewConfig(parsed.config);
      }
      if (typeof parsed?.at === "number") {
        setPreviewUpdatedAt(parsed.at);
      }
    } catch {
      // ignore malformed preview payload
    }
  }, [isBuilderPreview, publicId]);

  useEffect(() => {
    if (!isBuilderPreview || !publicId || typeof window === "undefined") return;
    if (typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel(previewChannelName);

    const handleMessage = (
      eventMessage: MessageEvent<{ type?: string; at?: number; config?: LandingConfig }>,
    ) => {
      if (eventMessage.data?.type !== "landing-config-update") return;
      if (!eventMessage.data.config) return;
      setPreviewConfig(eventMessage.data.config);
      setPreviewUpdatedAt(eventMessage.data.at ?? Date.now());
    };

    channel.addEventListener("message", handleMessage);
    channel.postMessage({ type: "landing-config-request", source: "landing" });

    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, [isBuilderPreview, previewChannelName, publicId]);

  useEffect(() => {
    if (!isBuilderPreview || !publicId || typeof window === "undefined") return;

    const storageKey = getPreviewStorageKey(publicId);
    const handleStorage = (eventStorage: StorageEvent) => {
      if (eventStorage.key !== storageKey || !eventStorage.newValue) return;
      try {
        const parsed = JSON.parse(eventStorage.newValue) as {
          at?: number;
          config?: LandingConfig;
        };
        if (parsed?.config) {
          setPreviewConfig(parsed.config);
        }
        if (typeof parsed?.at === "number") {
          setPreviewUpdatedAt(parsed.at);
        }
      } catch {
        // ignore malformed preview payload
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [isBuilderPreview, publicId]);

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: theme.palette.background.default,
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error || !event) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: theme.palette.background.default,
        }}
      >
        <Typography color="text.secondary">Evento non trovato.</Typography>
      </Box>
    );
  }

  const fallbackConfig = buildLegacyLandingConfig(event);
  const persistedConfig = event.landingConfig ?? fallbackConfig;
  const landingConfig = isBuilderPreview ? previewConfig ?? persistedConfig : persistedConfig;
  const palette = resolveLandingTheme(landingConfig.theme);
  const hasWeddingList = Boolean(event.weddingListDescription);

  const heroDesktop = landingConfig.hero.imageUrlDesktop ?? event.landingBgUrl ?? null;
  const heroTablet = landingConfig.hero.imageUrlTablet ?? heroDesktop;
  const heroMobile = landingConfig.hero.imageUrlMobile ?? heroTablet;
  const hasHeroImage = Boolean(heroDesktop || heroTablet || heroMobile);
  const orderedBlocks = [...landingConfig.blocks]
    .filter((block) => block.visible)
    .sort((a, b) => a.order - b.order);

  const align = landingConfig.hero.textAlign;

  const renderBlock = (block: LandingBlock) => {
    switch (block.type) {
      case "text":
        return (
          <Card
            key={block.id}
            sx={{
              borderRadius: 4,
              background: palette.cardBackground,
              boxShadow: `0 8px 22px ${alpha(palette.accent, 0.16)}`,
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <IsolatedHtmlContent html={block.content.html} />
            </CardContent>
          </Card>
        );

      case "menu_cta":
        return (
          <Card
            key={block.id}
            sx={{
              borderRadius: 4,
              background: palette.cardBackground,
              boxShadow: `0 8px 22px ${alpha(palette.accent, 0.16)}`,
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              {isNonEmpty(block.content.title) && (
                <Typography
                  variant="h5"
                  sx={{
                    mb: 2,
                    color: palette.textColor,
                    fontFamily: palette.titleFont,
                    textAlign: "center",
                  }}
                >
                  {block.content.title}
                </Typography>
              )}
              <Stack spacing={1.5}>
                {block.content.items.map((item) => {
                  const href = resolveLandingPath(item.href, publicId);
                  const isExternal = href.startsWith("http://") || href.startsWith("https://");
                  const variant = item.variant ?? "outlined";

                  if (isExternal) {
                    return (
                      <Button
                        key={item.id}
                        component="a"
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        variant={variant}
                        size="large"
                        sx={{
                          py: 1.6,
                          borderRadius: 3,
                          fontFamily: palette.bodyFont,
                          ...(variant === "contained"
                            ? {
                                backgroundColor: palette.accent,
                                color: "#fff",
                                "&:hover": {
                                  backgroundColor: palette.accentAlt,
                                },
                              }
                            : {
                                borderColor: palette.accent,
                                color: palette.accent,
                              }),
                        }}
                      >
                        {item.label}
                      </Button>
                    );
                  }

                  return (
                    <Button
                      key={item.id}
                      component={RouterLink}
                      to={href}
                      variant={variant}
                      size="large"
                      sx={{
                        py: 1.6,
                        borderRadius: 3,
                        fontFamily: palette.bodyFont,
                        ...(variant === "contained"
                          ? {
                              backgroundColor: palette.accent,
                              color: "#fff",
                              "&:hover": {
                                backgroundColor: palette.accentAlt,
                              },
                            }
                          : {
                              borderColor: palette.accent,
                              color: palette.accent,
                            }),
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        );

      case "story":
        return (
          <Card
            key={block.id}
            sx={{
              borderRadius: 4,
              background: palette.cardBackground,
              boxShadow: `0 8px 22px ${alpha(palette.accent, 0.16)}`,
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              {isNonEmpty(block.content.title) && (
                <Typography
                  variant="h5"
                  sx={{
                    mb: 1.5,
                    color: palette.textColor,
                    fontFamily: palette.titleFont,
                  }}
                >
                  {block.content.title}
                </Typography>
              )}
              <IsolatedHtmlContent html={block.content.html} />
            </CardContent>
          </Card>
        );

      case "event_info":
        return (
          <Box key={block.id}>
            <WeddingInfoSection event={event} />
          </Box>
        );

      case "wedding_menu":
        return <Box key={block.id}>{renderWeddingMenu(event, palette)}</Box>;

      case "image":
        return (
          <Card
            key={block.id}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              background: palette.cardBackground,
              boxShadow: `0 8px 22px ${alpha(palette.accent, 0.16)}`,
            }}
          >
            <Box
              component="img"
              src={block.content.imageUrl}
              alt={block.content.caption ?? "Immagine landing"}
              sx={{
                width: "100%",
                maxHeight: { xs: 300, sm: 420 },
                objectFit: "cover",
                display: "block",
              }}
            />
            {isNonEmpty(block.content.caption) && (
              <CardContent>
                <Typography sx={{ color: palette.mutedTextColor }}>
                  {block.content.caption}
                </Typography>
              </CardContent>
            )}
          </Card>
        );

      case "gallery": {
        const maxItems = Math.max(1, Math.min(12, block.content.limit || 6));
        const photos = (data?.items ?? [])
          .filter((item) => item.type === "photo" && item.url)
          .slice(0, maxItems);

        return (
          <Card
            key={block.id}
            sx={{
              borderRadius: 4,
              background: palette.cardBackground,
              boxShadow: `0 8px 22px ${alpha(palette.accent, 0.16)}`,
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: palette.textColor,
                    fontFamily: palette.titleFont,
                  }}
                >
                  {block.content.title || "Galleria"}
                </Typography>
                <Button
                  component={RouterLink}
                  to={`/${publicId}/gallery`}
                  size="small"
                  startIcon={<PhotoCameraIcon />}
                  sx={{ color: palette.accent }}
                >
                  Apri
                </Button>
              </Stack>

              {photos.length === 0 ? (
                <Typography sx={{ color: palette.mutedTextColor }}>
                  La galleria verrà popolata presto.
                </Typography>
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gap: 1.2,
                    gridTemplateColumns: {
                      xs: "repeat(2, minmax(0, 1fr))",
                      sm: "repeat(3, minmax(0, 1fr))",
                    },
                  }}
                >
                  {photos.map((photo) => (
                    <Box
                      key={photo.id}
                      component="img"
                      src={photo.url}
                      alt="Anteprima galleria"
                      loading="lazy"
                      sx={{
                        width: "100%",
                        height: { xs: 110, sm: 130 },
                        borderRadius: 2,
                        objectFit: "cover",
                      }}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        );
      }

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: palette.pageBackground,
        backgroundImage: palette.pagePattern,
        backgroundSize: "220px 220px",
        backgroundPosition: "center",
      }}
    >
      {isBuilderPreview ? (
        <Box
          sx={{
            position: "fixed",
            top: { xs: 74, sm: 86 },
            right: { xs: 12, sm: 20 },
            zIndex: 1600,
            width: { xs: "calc(100% - 24px)", sm: 340 },
            p: 2,
            borderRadius: 3,
            border: "1px solid",
            borderColor: alpha(palette.accent, 0.35),
            bgcolor: alpha("#111111", 0.78),
            backdropFilter: "blur(8px)",
            color: "#fff",
            boxShadow: `0 12px 28px ${alpha("#000", 0.28)}`,
          }}
        >
          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Anteprima live landing
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Le modifiche dal Landing Builder vengono mostrate in tempo reale qui.
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
              <Chip
                size="small"
                color={previewConfig ? "success" : "default"}
                label={previewConfig ? "Sync attiva" : "In attesa"}
              />
              {previewUpdatedAt ? (
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  Aggiornata alle {new Date(previewUpdatedAt).toLocaleTimeString("it-IT")}
                </Typography>
              ) : null}
            </Stack>
          </Stack>
        </Box>
      ) : null}

      <PWAInstallBanner />
      <GuestNavbar
        publicId={publicId}
        spouses={event.spouses}
        hasWeddingList={hasWeddingList}
      />

      {/* ── Hero ── */}
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: "70vh", sm: "80vh" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: hasHeroImage ? undefined : palette.heroFallback,
        }}
      >
        {/* Ornamenti botanici sugli angoli dell'hero */}
        <WeddingDecorativeOverlay
          color={hasHeroImage ? "#ffffff" : palette.accent}
          intensity={hasHeroImage ? 0.30 : 0.40}
        />
        {hasHeroImage && (
          <picture
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              display: "block",
            }}
          >
            {heroMobile && <source media="(max-width: 599px)" srcSet={heroMobile} />}
            {heroTablet && <source media="(max-width: 1023px)" srcSet={heroTablet} />}
            <img
              src={heroDesktop ?? heroTablet ?? heroMobile ?? ""}
              alt="Sfondo hero"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </picture>
        )}

        {/* Overlay semi-trasparente */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: hasHeroImage
              ? `rgba(0,0,0,${Math.max(0, Math.min(1, landingConfig.hero.overlayOpacity))})`
              : `linear-gradient(180deg, ${alpha(palette.pageBackground, 0)} 0%, ${alpha(palette.pageBackground, 0.72)} 100%)`,
          }}
        />

        {/* Contenuto hero */}
        <Container
          maxWidth="sm"
          sx={{
            position: "relative",
            textAlign: align,
            py: { xs: 6, sm: 8 },
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: hasHeroImage ? "rgba(255,255,255,0.88)" : palette.accent,
              letterSpacing: "0.18em",
              fontWeight: 600,
              fontSize: "0.75rem",
              fontFamily: palette.bodyFont,
            }}
          >
            Benvenuti al matrimonio di
          </Typography>

          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontFamily: palette.titleFont,
              color: hasHeroImage ? "#ffffff" : palette.textColor,
              fontSize: { xs: "2.4rem", sm: "3.2rem" },
              lineHeight: 1.15,
              mt: 1,
              mb: 1.5,
              textShadow: hasHeroImage ? "0 2px 12px rgba(0,0,0,0.55)" : "none",
            }}
          >
            {landingConfig.hero.title || event.spouses}
          </Typography>

          {isNonEmpty(landingConfig.hero.subtitle) ? (
            <Typography
              variant="h6"
              sx={{
                color: hasHeroImage ? "rgba(255,255,255,0.92)" : palette.accent,
                fontWeight: 400,
                fontStyle: "italic",
                fontSize: { xs: "1rem", sm: "1.15rem" },
                textShadow: hasHeroImage ? "0 1px 6px rgba(0,0,0,0.45)" : "none",
                fontFamily: palette.bodyFont,
              }}
            >
              {landingConfig.hero.subtitle}
            </Typography>
          ) : (
            event.weddingDate && (
              <Typography
                variant="h6"
                sx={{
                  color: hasHeroImage ? "rgba(255,255,255,0.92)" : palette.accent,
                  fontWeight: 400,
                  fontStyle: "italic",
                  fontSize: { xs: "1rem", sm: "1.15rem" },
                  textShadow: hasHeroImage ? "0 1px 6px rgba(0,0,0,0.45)" : "none",
                  fontFamily: palette.bodyFont,
                }}
              >
                {formatDisplayDate(event.weddingDate)}
              </Typography>
            )
          )}

          {event.title && event.title !== event.spouses && (
            <Typography
              variant="subtitle1"
              sx={{
                mt: 1,
                color: hasHeroImage ? "rgba(255,255,255,0.78)" : palette.mutedTextColor,
                fontStyle: "italic",
                fontFamily: palette.bodyFont,
              }}
            >
              {event.title}
            </Typography>
          )}
        </Container>
      </Box>

      {/* ── Navigazione ── */}
      <Box
        sx={{
          background: palette.pageBackground,
          pt: 5,
          pb: 6,
          flex: 1,
        }}
      >
        <Container maxWidth="sm">
          <Stack spacing={0}>
            {orderedBlocks.length > 0 ? (
              orderedBlocks.map((block, i) => (
                <Fragment key={block.id}>
                  {i > 0 && <WeddingDecorativeDivider color={palette.accent} />}
                  <Box sx={{ pb: 3.2 }}>
                    {renderBlock(block)}
                  </Box>
                </Fragment>
              ))
            ) : (
              <Card
                sx={{
                  borderRadius: 4,
                  background: palette.cardBackground,
                  boxShadow: `0 8px 22px ${alpha(palette.accent, 0.16)}`,
                }}
              >
                <CardContent>
                  <Typography sx={{ color: palette.mutedTextColor }}>
                    Questa landing e ancora in preparazione.
                  </Typography>
                </CardContent>
              </Card>
            )}

            <WeddingDecorativeDivider color={palette.accent} />

            <Box sx={{ pt: 0, pb: 3.2 }}>
              <Card
                sx={{
                  borderRadius: 4,
                  background: palette.cardBackground,
                  boxShadow: `0 8px 22px ${alpha(palette.accent, 0.16)}`,
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PhotoCameraIcon sx={{ color: palette.accent }} />
                    <ChecklistIcon sx={{ color: palette.accent }} />
                    <CardGiftcardIcon sx={{ color: palette.accentAlt }} />
                    <Typography sx={{ color: palette.mutedTextColor, ml: 1 }}>
                      Contenuti aggiornabili dagli sposi con editor a blocchi.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Stack>

          <Box
            sx={{
              mt: 5,
              color: alpha(theme.palette.text.secondary, 0.86),
              textAlign: "center",
            }}
          >
            <Typography variant="caption" sx={{ fontFamily: palette.bodyFont }}>
              Tema attivo: {landingConfig.theme}
            </Typography>
          </Box>
        </Container>
      </Box>

      <LegalFooter />
    </Box>
  );
}
