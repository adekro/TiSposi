import { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import { Link as RouterLink, useLocation } from "react-router-dom";

interface NavItemDef {
  label: string;
  icon: React.ReactElement;
  path: (id: string) => string;
  requiresWeddingList?: boolean;
}

const NAV_ITEMS: NavItemDef[] = [
  {
    label: "Benvenuto",
    icon: <HomeIcon fontSize="small" />,
    path: (id) => `/${id}/landing`,
  },
  {
    label: "Galleria",
    icon: <PhotoCameraIcon fontSize="small" />,
    path: (id) => `/${id}/gallery`,
  },
  {
    label: "RSVP",
    icon: <HowToRegIcon fontSize="small" />,
    path: (id) => `/${id}/rsvp`,
  },
  {
    label: "Lista nozze",
    icon: <CardGiftcardIcon fontSize="small" />,
    path: (id) => `/${id}/listanozze`,
    requiresWeddingList: true,
  },
];

interface Props {
  publicId: string;
  spouses?: string;
  hasWeddingList?: boolean;
}

export default function GuestNavbar({
  publicId,
  spouses,
  hasWeddingList = true,
}: Props) {
  const theme = useTheme();
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.requiresWeddingList || hasWeddingList,
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: `${theme.palette.background.paper}EE`,
          backdropFilter: "blur(8px)",
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar
          sx={{ minHeight: { xs: 52, sm: 56 }, px: { xs: 2, sm: 3 } }}
          disableGutters
        >
          {/* Logo */}
          <Typography
            component={RouterLink}
            to={`/${publicId}/landing`}
            variant="h6"
            sx={{
              fontFamily: '"Playfair Display", serif',
              color: theme.palette.primary.main,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: { xs: "1.1rem", sm: "1.2rem" },
              letterSpacing: "0.03em",
              flexShrink: 0,
              px: { xs: 2, sm: 3 },
            }}
          >
            TiSposi
          </Typography>

          {spouses && (
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontStyle: "italic",
                fontSize: "0.75rem",
                display: { xs: "none", sm: "block" },
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 200,
              }}
            >
              {spouses}
            </Typography>
          )}

          <Box sx={{ flex: 1 }} />

          {/* Desktop nav */}
          <Box
            sx={{ display: { xs: "none", md: "flex" }, gap: 0.5, pr: { sm: 2 } }}
          >
            {visibleItems.map((item) => {
              const href = item.path(publicId);
              const isActive = pathname === href;
              return (
                <Button
                  key={href}
                  component={RouterLink}
                  to={href}
                  size="small"
                  startIcon={item.icon}
                  sx={{
                    color: isActive
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                    fontWeight: isActive ? 700 : 400,
                    fontSize: "0.8rem",
                    borderBottom: isActive
                      ? `2px solid ${theme.palette.primary.main}`
                      : "2px solid transparent",
                    borderRadius: 0,
                    px: 1.5,
                    py: 1,
                    minWidth: 0,
                    "&:hover": {
                      background: `${theme.palette.primary.main}10`,
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          {/* Mobile hamburger */}
          <IconButton
            size="small"
            onClick={() => setDrawerOpen(true)}
            sx={{
              display: { xs: "flex", md: "none" },
              color: theme.palette.primary.main,
              mr: 1,
            }}
            aria-label="Apri menu navigazione"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: theme.palette.background.default,
            borderLeft: `1px solid ${theme.palette.primary.main}22`,
          },
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}18 0%, ${theme.palette.secondary.main}18 100%)`,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontSize: "0.7rem",
            }}
          >
            Matrimonio di
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Playfair Display", serif',
              color: theme.palette.text.primary,
              mt: 0.25,
            }}
          >
            {spouses ?? "TiSposi"}
          </Typography>
        </Box>

        <List sx={{ pt: 1 }}>
          {visibleItems.map((item) => {
            const href = item.path(publicId);
            const isActive = pathname === href;
            return (
              <ListItem key={href} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={href}
                  onClick={() => setDrawerOpen(false)}
                  selected={isActive}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    mb: 0.5,
                    "&.Mui-selected": {
                      background: `${theme.palette.primary.main}18`,
                      "& .MuiListItemIcon-root": {
                        color: theme.palette.primary.main,
                      },
                      "& .MuiListItemText-primary": {
                        color: theme.palette.primary.main,
                        fontWeight: 700,
                      },
                    },
                    "&:hover": { background: `${theme.palette.primary.main}10` },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: isActive
                        ? theme.palette.primary.main
                        : theme.palette.text.secondary,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ mt: "auto", mx: 2 }} />
        <Box sx={{ px: 3, py: 2 }}>
          <Typography variant="caption" color="text.secondary">
            TiSposi — La vostra giornata speciale
          </Typography>
        </Box>
      </Drawer>
    </>
  );
}
