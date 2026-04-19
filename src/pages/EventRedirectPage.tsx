import { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function EventRedirectPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const getSuffix = () => {
    if (pathname.endsWith("/rsvp")) return "/rsvp";
    if (pathname.endsWith("/landing")) return "/landing";
    if (pathname.endsWith("/listanozze")) return "/listanozze";
    return "/gallery";
  };

  useEffect(() => {
    if (!eventId) {
      navigate("/", { replace: true });
      return;
    }

    fetch(`/api/event-redirect?eventId=${encodeURIComponent(eventId)}`)
      .then((res) => (res.ok ? (res.json() as Promise<{ publicId: string }>) : Promise.reject()))
      .then((data) => {
        navigate(`/${data.publicId}${getSuffix()}`, { replace: true });
      })
      .catch(() => navigate("/", { replace: true }));
  }, [eventId, navigate, pathname]);

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
