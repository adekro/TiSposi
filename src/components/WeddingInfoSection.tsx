import { useState } from "react";
import { Box, Tab, Tabs, Typography, useTheme, Button } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import type { PublicEventSummary } from "../types";

interface Props {
  event: PublicEventSummary;
}

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  if (value !== index) return null;
  return <Box sx={{ pt: 2, px: 1 }}>{children}</Box>;
}

function PreformattedText({ text }: { text: string }) {
  const theme = useTheme();
  return (
    <Typography
      component="pre"
      variant="body2"
      sx={{
        whiteSpace: "pre-wrap",
        fontFamily: "inherit",
        color: theme.palette.text.secondary,
        lineHeight: 1.8,
        m: 0,
      }}
    >
      {text}
    </Typography>
  );
}

export default function WeddingInfoSection({ event }: Props) {
  const theme = useTheme();
  const [tab, setTab] = useState(0);

  const hasCoupleStory = Boolean(event.coupleStory?.trim());

  const hasCeremony = Boolean(
    event.ceremonyVenueName || event.ceremonyVenueAddress || event.ceremonyTime,
  );
  const hasReception = Boolean(
    event.receptionVenueName ||
      event.receptionVenueAddress ||
      event.receptionTime,
  );
  const hasLegacyVenue = Boolean(
    event.venueName || event.venueAddress || event.dresscode || event.schedule,
  );
  const hasInfo =
    hasCeremony || hasReception || hasLegacyVenue;

  // Menu strutturato (Fase 7) o fallback testo libero
  const menuCourses = [
    { label: "Antipasto", value: event.menuAntipasto },
    { label: "Primo piatto", value: event.menuPrimo },
    { label: "Secondo piatto", value: event.menuSecondo },
    { label: "Contorno", value: event.menuContorno },
    { label: "Dolce", value: event.menuDolce },
    { label: "Bevande e vini", value: event.menuBevande },
  ].filter((c) => c.value?.trim());
  const hasStructuredMenu = menuCourses.length > 0;
  const hasMenu = hasStructuredMenu || Boolean(event.menu?.trim());

  const tabs: Array<{ label: string; emoji: string }> = [];
  if (hasCoupleStory) tabs.push({ label: "La nostra storia", emoji: "💑" });
  if (hasInfo) tabs.push({ label: "Info evento", emoji: "📍" });
  if (hasMenu) tabs.push({ label: "Menu", emoji: "🍽️" });

  if (tabs.length === 0) return null;

  // Map visible tab index to content type
  const tabContent = [
    hasCoupleStory ? "story" : null,
    hasInfo ? "info" : null,
    hasMenu ? "menu" : null,
  ].filter(Boolean) as string[];

  return (
    <Box
      sx={{
        borderRadius: 4,
        border: `1px solid ${theme.palette.primary.main}33`,
        overflow: "hidden",
        background: theme.palette.background.paper,
      }}
    >
      <Tabs
        value={tab}
        onChange={(_, v: number) => setTab(v)}
        variant="fullWidth"
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          "& .MuiTab-root": { fontSize: "0.8rem", fontWeight: 600 },
        }}
      >
        {tabs.map((t) => (
          <Tab key={t.label} label={`${t.emoji} ${t.label}`} />
        ))}
      </Tabs>

      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {tabContent.map((type, i) => (
          <TabPanel key={type} value={tab} index={i}>
            {type === "story" && event.coupleStory && (
              <PreformattedText text={event.coupleStory} />
            )}

            {type === "info" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {/* Blocco Cerimonia */}
                {hasCeremony && (
                  <Box>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      🕍 Cerimonia
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                      {event.ceremonyVenueName && (
                        <Typography variant="body2">
                          {event.ceremonyVenueName}
                        </Typography>
                      )}
                      {event.ceremonyVenueAddress && (
                        <Typography variant="body2" color="text.secondary">
                          {event.ceremonyVenueAddress}
                        </Typography>
                      )}
                      {event.ceremonyTime && (
                        <Typography variant="body2" color="text.secondary">
                          ⏰ {event.ceremonyTime}
                        </Typography>
                      )}
                      {event.ceremonyVenueMapsUrl && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<LocationOnIcon />}
                          href={event.ceremonyVenueMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ mt: 0.5, alignSelf: "flex-start" }}
                        >
                          Apri in Maps
                        </Button>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Blocco Ricevimento */}
                {hasReception && (
                  <Box>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      🎉 Ricevimento
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                      {event.receptionVenueName && (
                        <Typography variant="body2">
                          {event.receptionVenueName}
                        </Typography>
                      )}
                      {event.receptionVenueAddress && (
                        <Typography variant="body2" color="text.secondary">
                          {event.receptionVenueAddress}
                        </Typography>
                      )}
                      {event.receptionTime && (
                        <Typography variant="body2" color="text.secondary">
                          ⏰ {event.receptionTime}
                        </Typography>
                      )}
                      {event.receptionVenueMapsUrl && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<LocationOnIcon />}
                          href={event.receptionVenueMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ mt: 0.5, alignSelf: "flex-start" }}
                        >
                          Apri in Maps
                        </Button>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Fallback legacy: solo venue_name senza i nuovi campi */}
                {!hasCeremony && !hasReception && event.venueName && (
                  <Box>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Location
                    </Typography>
                    <Typography variant="body2">{event.venueName}</Typography>
                    {event.venueAddress && (
                      <Typography variant="body2" color="text.secondary">
                        {event.venueAddress}
                      </Typography>
                    )}
                    {event.venueMapsUrl && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<LocationOnIcon />}
                        href={event.venueMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ mt: 1 }}
                      >
                        Apri in Maps
                      </Button>
                    )}
                  </Box>
                )}

                {event.dresscode && (
                  <Box>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Dress code
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.dresscode}
                    </Typography>
                  </Box>
                )}

                {event.schedule && (
                  <Box>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Programma
                    </Typography>
                    <PreformattedText text={event.schedule} />
                  </Box>
                )}
              </Box>
            )}

            {type === "menu" && (
              <>
                {hasStructuredMenu ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {menuCourses.map((course) => (
                      <Box key={course.label}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          {course.label}
                        </Typography>
                        <PreformattedText text={course.value!} />
                      </Box>
                    ))}
                    {event.menu?.trim() && (
                      <Box>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          Note
                        </Typography>
                        <PreformattedText text={event.menu} />
                      </Box>
                    )}
                  </Box>
                ) : (
                  event.menu && <PreformattedText text={event.menu} />
                )}
              </>
            )}
          </TabPanel>
        ))}
      </Box>
    </Box>
  );
}
