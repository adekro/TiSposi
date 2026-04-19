import { useState } from "react";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import { Link as RouterLink, useLocation } from "react-router-dom";

interface Props {
  publicId: string;
  spouses?: string;
}

const NAV_ITEMS = [
  {
    label: "Benvenuto",
    icon: <HomeIcon fontSize="small" />,
    path: (id: string) => `/${id}/landing`,
  },
  {
    label: "Galleria & dediche",
    icon: <PhotoCameraIcon fontSize="small" />,
    path: (id: string) => `/${id}/gallery`,
  },
  {
    label: "RSVP — Conferma presenza",
    icon: <HowToRegIcon fontSize="small" />,
    path: (id: string) => `/${id}/rsvp`,
  },
  {
    label: "Lista nozze",
    icon: <CardGiftcardIcon fontSize="small" />,
    path: (id: string) => `/${id}/listanozze`,
  },
];

export default function GuestNavMenu({ publicId, spouses }: Props) {
  const theme = useTheme();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="Menu">
        <IconButton
          size="small"
          onClick={() => setOpen(true)}
          sx={{
            color: theme.palette.primary.main,
            background: `${theme.palette.background.paper}CC`,
            backdropFilter: "blur(4px)",
            border: `1px solid ${theme.palette.primary.main}33`,
            "&:hover": {
              background: `${theme.palette.primary.main}18`,
            },
          }}
          aria-label="Apri menu navigazione"
        >
          <MenuIcon />
        </IconButton>
      </Tooltip>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: theme.palette.background.default,
            borderLeft: `1px solid ${theme.palette.primary.main}22`,
          },
        }}
      >
        {/* Header cassetto */}
        <Box
          sx={{
            px: 3,
            py: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}18 0%, ${theme.palette.secondary.main}18 100%)`,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ color: theme.palette.text.secondary, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.7rem" }}
          >
            Matrimonio di
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontFamily: '"Playfair Display", serif', color: theme.palette.text.primary, mt: 0.25 }}
          >
            {spouses ?? ""}
          </Typography>
        </Box>

        <List sx={{ pt: 1 }}>
          {NAV_ITEMS.map((item) => {
            const href = item.path(publicId);
            const isActive = pathname === href;
            return (
              <ListItem key={href} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={href}
                  onClick={() => setOpen(false)}
                  selected={isActive}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    mb: 0.5,
                    "&.Mui-selected": {
                      background: `${theme.palette.primary.main}18`,
                      "& .MuiListItemIcon-root": { color: theme.palette.primary.main },
                      "& .MuiListItemText-primary": { color: theme.palette.primary.main, fontWeight: 700 },
                    },
                    "&:hover": { background: `${theme.palette.primary.main}10` },
                  }}
                >
                  <ListItemIcon
                    sx={{ minWidth: 36, color: isActive ? theme.palette.primary.main : theme.palette.text.secondary }}
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
