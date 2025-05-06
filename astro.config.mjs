// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  experimental: {
    session: true,
  },
  integrations: [react(), sitemap()],
  server: { port: 3000 },
  vite: {
    resolve: {
      // Użyj react-dom/server.edge zamiast react-dom/server.browser dla React 19.
      // Bez tego MessageChannel z node:worker_threads musi być polyfillowany.
      alias: import.meta.env.PROD
        ? {
            "react-dom/server": "react-dom/server.edge",
          }
        : undefined,
    },
    plugins: [tailwindcss()],
  },
});
