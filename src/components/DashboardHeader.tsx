import { Box, Button, Typography } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

interface Props {
  email: string;
  onSignOut: () => void;
}

export default function DashboardHeader({ email, onSignOut }: Props) {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      flexDirection={{ xs: "column", sm: "row" }}
      gap={2}
    >
      <Box>
        <Typography
          variant="overline"
          sx={{
            letterSpacing: "0.2em",
            color: "primary.main",
            fontWeight: 700,
          }}
        >
          Area riservata
        </Typography>
        <Typography variant="h3">Configura il tuo evento</Typography>
        <Typography color="text.secondary">Account: {email}</Typography>
      </Box>
      <Button color="inherit" startIcon={<LogoutIcon />} onClick={onSignOut}>
        Esci
      </Button>
    </Box>
  );
}
