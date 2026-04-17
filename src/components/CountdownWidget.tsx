import { useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(weddingDate: string): TimeLeft | null {
  const target = new Date(weddingDate);
  // Set to start of day in local timezone
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

interface Props {
  weddingDate: string; // ISO date string YYYY-MM-DD
  spouses: string;
}

export default function CountdownWidget({ weddingDate, spouses }: Props) {
  const theme = useTheme();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(
    calcTimeLeft(weddingDate),
  );

  useEffect(() => {
    const tick = setInterval(() => {
      setTimeLeft(calcTimeLeft(weddingDate));
    }, 1000);
    return () => clearInterval(tick);
  }, [weddingDate]);

  if (!timeLeft) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 3,
          px: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}18 0%, ${theme.palette.secondary.main}18 100%)`,
          borderRadius: 4,
          border: `1px solid ${theme.palette.primary.main}33`,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontFamily: '"Playfair Display", serif',
            color: theme.palette.primary.main,
            fontStyle: "italic",
          }}
        >
          🎉 Congratulazioni {spouses}!
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Che il vostro amore duri per sempre.
        </Typography>
      </Box>
    );
  }

  const units = [
    { label: "giorni", value: timeLeft.days },
    { label: "ore", value: timeLeft.hours },
    { label: "min", value: timeLeft.minutes },
    { label: "sec", value: timeLeft.seconds },
  ];

  return (
    <Box
      sx={{
        textAlign: "center",
        py: 3,
        px: 2,
        background: `linear-gradient(135deg, ${theme.palette.primary.main}18 0%, ${theme.palette.secondary.main}18 100%)`,
        borderRadius: 4,
        border: `1px solid ${theme.palette.primary.main}33`,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          color: theme.palette.primary.main,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          mb: 2,
          fontWeight: 600,
        }}
      >
        Manca ancora...
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: { xs: 2, sm: 3 },
        }}
      >
        {units.map(({ label, value }) => (
          <Box key={label} sx={{ minWidth: 52, textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: '"Playfair Display", serif',
                color: theme.palette.text.primary,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {String(value).padStart(2, "0")}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
