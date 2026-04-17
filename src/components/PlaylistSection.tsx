import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import type { MusicRequest } from "../types";

interface PlaylistSectionProps {
  items: MusicRequest[];
  loading: boolean;
}

export default function PlaylistSection({
  items,
  loading,
}: PlaylistSectionProps) {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <MusicNoteIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          La playlist è ancora vuota.
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Usa il tasto 🎵 per suggerire una canzone!
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5}>
      {items.map((item) => {
        const query = encodeURIComponent(
          [item.song, item.artist].filter(Boolean).join(" "),
        );
        const spotifyUrl = `https://open.spotify.com/search/${query}`;

        return (
          <Card
            key={item.id}
            elevation={0}
            sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
          >
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                py: "12px !important",
                px: 2,
              }}
            >
              <MusicNoteIcon color="primary" sx={{ flexShrink: 0 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body1"
                  fontWeight={600}
                  noWrap
                  title={item.song}
                >
                  {item.song}
                </Typography>
                {item.artist && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {item.artist}
                  </Typography>
                )}
                {item.requestedBy && (
                  <Typography variant="caption" color="text.disabled">
                    suggerita da {item.requestedBy}
                  </Typography>
                )}
              </Box>
              <Link
                href={spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#1DB954",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                Spotify
                <OpenInNewIcon sx={{ fontSize: 14 }} />
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
