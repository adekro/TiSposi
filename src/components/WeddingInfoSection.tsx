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
  const hasInfo = Boolean(
    event.venueName || event.venueAddress || event.dresscode || event.schedule,
  );
  const hasMenu = Boolean(event.menu?.trim());

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
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {event.venueName && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="primary"
                      gutterBottom
                    >
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
                    <Typography
                      variant="subtitle2"
                      color="primary"
                      gutterBottom
                    >
                      Dress code
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.dresscode}
                    </Typography>
                  </Box>
                )}

                {event.schedule && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="primary"
                      gutterBottom
                    >
                      Programma
                    </Typography>
                    <PreformattedText text={event.schedule} />
                  </Box>
                )}
              </Box>
            )}

            {type === "menu" && event.menu && (
              <PreformattedText text={event.menu} />
            )}
          </TabPanel>
        ))}
      </Box>
    </Box>
  );
}
