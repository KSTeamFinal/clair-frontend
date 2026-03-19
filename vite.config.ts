import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Clair Contract Analyzer",
        short_name: "Clair",
        start_url: "/",
        display: "standalone",
        background_color: "#f4f1ea",
        theme_color: "#2b3a42",
        icons: []
      }
    })
  ]
});
