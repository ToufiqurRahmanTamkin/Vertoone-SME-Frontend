import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'import.meta.env.VITE_BASENAME': JSON.stringify(process.env.VITE_BASENAME || ''),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("react-dom") || id.includes("react-router") || id.includes("node_modules/react/")) {
            return "vendor-react";
          }
          if (id.includes("@reduxjs") || id.includes("react-redux") || id.includes("redux-persist")) {
            return "vendor-redux";
          }
          if (id.includes("@tanstack")) {
            return "vendor-table";
          }
          if (id.includes("@radix-ui") || id.includes("/radix-ui/")) {
            return "vendor-radix";
          }
          return undefined;
        },
      },
    },
  },
})