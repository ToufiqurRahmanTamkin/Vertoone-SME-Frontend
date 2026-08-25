import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (
            id.includes("react-dom") ||
            id.includes("react-router") ||
            id.includes("node_modules/react/")
          ) {
            return "vendor-react";
          }
          if (
            id.includes("@reduxjs") ||
            id.includes("react-redux") ||
            id.includes("redux-persist")
          ) {
            return "vendor-redux";
          }
          if (id.includes("recharts") || id.includes("/d3-")) {
            return "vendor-charts";
          }
          if (id.includes("@radix-ui") || id.includes("/radix-ui/")) {
            return "vendor-radix";
          }
          return undefined;
        },
      },
    },
  },
});
