import { Alert, Box, Container, Stack } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useEventSettings } from "../hooks/useEventSettings";
import DashboardHeader from "../components/DashboardHeader";
import EventSettingsForm from "../components/EventSettingsForm";

export default function DashboardPage() {
  const { user, signOut, configError } = useAuth();
  const { handleSave, handleDownloadQr, ...formProps } = useEventSettings(
    user?.id ?? "",
    user?.email,
  );

  if (!user) {
    return null;
  }

  if (configError) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <Alert severity="error">{configError}</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #faf7f2 0%, #ffffff 100%)",
        py: 5,
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={3}>
          <DashboardHeader
            email={user.email ?? ""}
            onSignOut={() => void signOut()}
          />
          <EventSettingsForm
            {...formProps}
            onSave={handleSave}
            onDownloadQr={handleDownloadQr}
          />
        </Stack>
      </Container>
    </Box>
  );
}
