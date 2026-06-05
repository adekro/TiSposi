import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import weddingTheme from "./theme";
import { registerSW } from "virtual:pwa-register";

// Registra il Service Worker PWA con aggiornamento automatico silenzioso
if (import.meta.env.PROD) {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      // Applica subito il nuovo SW quando disponibile.
      void updateSW(true);
    },
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;

      // Forza un check periodico, utile per recepire prima manifest/icona aggiornati.
      setInterval(
        () => {
          void registration.update();
        },
        60 * 60 * 1000,
      );
    },
  });

  const iconVersion = import.meta.env.VITE_ICON_VERSION ?? "1";
  const iconVersionKey = "pwa-icon-version";
  const previousVersion = localStorage.getItem(iconVersionKey);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true;

  if (
    isIOS &&
    isStandalone &&
    previousVersion &&
    previousVersion !== iconVersion
  ) {
    setTimeout(() => {
      window.alert(
        "Icona app aggiornata: su iPhone potrebbe servire rimuovere e reinstallare la PWA dalla Home per vedere la nuova icona.",
      );
    }, 1200);
  }

  localStorage.setItem(iconVersionKey, iconVersion);
}

// In sviluppo forziamo la rimozione di SW/cache per evitare bundle stantii.
if (import.meta.env.DEV && "serviceWorker" in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      void registration.unregister();
    });
  });
  if ("caches" in window) {
    void caches.keys().then((keys) => {
      keys.forEach((key) => {
        void caches.delete(key);
      });
    });
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider theme={weddingTheme}>
            <CssBaseline />
            <App />
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>,
);
