import { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function EventRedirectPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isRsvp = pathname.endsWith("/rsvp");

  useEffect(() => {
    if (!eventId) {
      navigate("/", { replace: true });
      return;
    }

    fetch(`/api/event-redirect?eventId=${encodeURIComponent(eventId)}`)
      .then((res) => (res.ok ? (res.json() as Promise<{ publicId: string }>) : Promise.reject()))
      .then((data) => {
        const target = isRsvp
          ? `/${data.publicId}/rsvp`
          : `/${data.publicId}/gallery`;
        navigate(target, { replace: true });
      })
      .catch(() => navigate("/", { replace: true }));
  }, [eventId, isRsvp, navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography color="text.secondary">Reindirizzamento…</Typography>
    </Box>
  );
}
