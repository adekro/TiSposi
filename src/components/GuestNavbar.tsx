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
import { Link as RouterLink, useLocation } from "react-router-dom";

import {Home as HomeIcon} from "@mui/icons-material";
import { Celebration as CelebrationIcon } from "@mui/icons-material";
import { Edit as EditIcon } from "@mui/icons-material";
import { PhotoCamera as PhotoCameraIcon } from "@mui/icons-material";


interface NavItemDef {
  label: string;
  icon: React.ReactElement;
  path: (id: string) => string;
  requiresWeddingList?: boolean;
}

const NAV_ITEMS: NavItemDef[] = [
  {
    label: "Benvenuto",
    icon: <HomeIcon color="primary" />,
    path: (id) => `/${id}/landing`,
  },
  {
    label: "Galleria",
    icon: <PhotoCameraIcon color="primary" />,
    path: (id) => `/${id}/gallery`,
  },
  {
    label: "RSVP",
    icon: <EditIcon color="primary" />,
    path: (id) => `/${id}/rsvp`,
  },
  {
    label: "Lista nozze",
    icon:  <CelebrationIcon color="primary" />,
    path: (id) => `/${id}/listanozze`,
    requiresWeddingList: true,
  },
];

interface Props {
  publicId: string;
  spouses?: string;
  hasWeddingList?: boolean;
}

function getCoupleInitials(spouses?: string) {
  if (!spouses) return "T + S";

  const letterPattern = /\p{L}/u;
  const segments = spouses
    .split(/\s*(?:&|\+|\/|\be\b|\band\b)\s*/iu)
    .map((segment) => segment.trim())
    .filter(Boolean);

  const names =
    segments.length >= 2
      ? segments.slice(0, 2)
      : spouses
          .split(/\s+/)
          .map((segment) => segment.trim())
          .filter(Boolean);

  const initials = names
    .map((name) => Array.from(name).find((char) => letterPattern.test(char)))
    .filter((char): char is string => Boolean(char))
    .slice(0, 2)
    .map((char) => char.toUpperCase());

  if (initials.length === 2) return `${initials[0]} + ${initials[1]}`;
  if (initials.length === 1) return initials[0];

  return "T + S";
}

interface CoupleHeartBadgeProps {
  initials: string;
  gradientId: string;
  size?: {
    xs: number;
    sm: number;
  };
  textSize?: {
    xs: string;
    sm: string;
  };
}

function CoupleHeartBadge({
  initials,
  gradientId,
  size = { xs: 66, sm: 82 },
  textSize = { xs: "0.82rem", sm: "0.98rem" },
}: CoupleHeartBadgeProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "relative",
        width: size,
        height: { xs: Math.round(size.xs * 0.88), sm: Math.round(size.sm * 0.88) },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        filter: "drop-shadow(0 6px 14px rgba(201,160,176,0.22))",
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 100 90"
        aria-hidden="true"
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9DDE5" />
            <stop offset="100%" stopColor="#F6E7CF" />
          </linearGradient>
        </defs>
        <path
          d="M50 78C45 74 38 68 29 60C18 50 10 42 10 28C10 17 18 9 29 9C37 9 44 13 50 20C56 13 63 9 71 9C82 9 90 17 90 28C90 42 82 50 71 60C62 68 55 74 50 78Z"
          fill={`url(#${gradientId})`}
          stroke={theme.palette.secondary.dark}
          strokeWidth="2.5"
        />
      </Box>

      <Typography
        component="span"
        sx={{
          position: "relative",
          zIndex: 1,
          fontFamily: '"Great Vibes", "Playfair Display", serif',
          fontSize: {
            xs: `calc(${textSize.xs} + 0.42rem)`,
            sm: `calc(${textSize.sm} + 0.5rem)`,
          },
          fontWeight: 400,
          letterSpacing: "0.02em",
          color: theme.palette.text.primary,
          textAlign: "center",
          lineHeight: 1,
          transform: "translateY(4px)",
          whiteSpace: "nowrap",
        }}
      >
        {initials}
      </Typography>
    </Box>
  );
}

export default function GuestNavbar({
  publicId,
  spouses,
  hasWeddingList = true,
}: Props) {
  const theme = useTheme();
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const coupleInitials = getCoupleInitials(spouses);

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
          sx={{
            position: "relative",
            minHeight: { xs: 64, sm: 72 },
            px: { xs: 2, sm: 3 },
          }}
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

          <Box
            sx={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            <CoupleHeartBadge initials={coupleInitials} gradientId="guest-navbar-heart" />
          </Box>

          <Box sx={{ flex: 1 }} />

          {/* Desktop nav */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 0.5,
              pr: { sm: 2 },
              position: "relative",
              zIndex: 1,
            }}
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
              position: "relative",
              zIndex: 1,
            }}
            aria-label="Apri menu navigazione"
          >
            <Box component="span" sx={{ fontSize: 20, lineHeight: 1 }}>
              ☰
            </Box>
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
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
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
          <Box sx={{ mt: 1, mb: 1.25 }}>
            <CoupleHeartBadge
              initials={coupleInitials}
              gradientId="guest-drawer-heart"
              size={{ xs: 78, sm: 90 }}
              textSize={{ xs: "0.96rem", sm: "1.05rem" }}
            />
          </Box>
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
