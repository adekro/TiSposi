import { Box, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function LegalFooter() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        mt: 4,
        textAlign: "center",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        <Link
          component={RouterLink}
          to="/privacy"
          color="inherit"
          underline="hover"
        >
          Privacy Policy
        </Link>
        {" · "}
        <Link
          component={RouterLink}
          to="/cookie"
          color="inherit"
          underline="hover"
        >
          Cookie Policy
        </Link>
        {" · "}
        <Link
          component={RouterLink}
          to="/termini"
          color="inherit"
          underline="hover"
        >
          Termini e Condizioni
        </Link>
      </Typography>
    </Box>
  );
}
