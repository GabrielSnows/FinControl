import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "pwa-192x192.png",
        "pwa-512x512.png",
      ],

      manifest: {
        name: "FinControl",
        short_name: "FinControl",

        description:
          "Controle pessoal de contas, movimentações, dívidas e objetivos financeiros.",

        theme_color: "#0f172a",
        background_color: "#0f172a",

        display: "standalone",

        start_url: "/",
        scope: "/",

        orientation: "portrait-primary",

        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },

      workbox: {
        navigateFallback: "index.html",

        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,woff2}",
        ],

        cleanupOutdatedCaches: true,

        clientsClaim: true,
        skipWaiting: true,
      },

      devOptions: {
        enabled: true,
      },
    }),
  ],
});