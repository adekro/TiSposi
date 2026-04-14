import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // heic2any è un lazy import, non impatta il bundle iniziale
    chunkSizeWarningLimit: 1500,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons/*.png"],
      manifest: {
        name: "TiSposi",
        short_name: "TiSposi",
        description:
          "Landing, dashboard e galleria fotografica per eventi privati",
        theme_color: "#C9A76C",
        background_color: "#FAF7F2",
        display: "standalone",
        scope: "/",
        start_url: "/",
        orientation: "portrait",
        icons: [
          {
            src: "icons/pwa-192x192.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            // API gallery pubblica: sempre dalla rete, fallback cache
            urlPattern: /^https?:\/\/.*\/api\/gallery/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-gallery-cache",
              expiration: { maxEntries: 1, maxAgeSeconds: 60 },
              networkTimeoutSeconds: 5,
            },
          },
          {
            // Immagini CDN Google Drive (lh3.googleusercontent.com)
            urlPattern: /^https:\/\/lh3\.googleusercontent\.com\//,
            handler: "CacheFirst",
            options: {
              cacheName: "drive-images-cache",
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
});
