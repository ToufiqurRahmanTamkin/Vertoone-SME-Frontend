import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // The Cloudflare plugin emits Worker-specific output (an .assetsignore and a
  // worker entry) that a static host has no use for. Vercel and `npm run build`
  // produce a plain SPA; `--mode cloudflare` (what `npm run deploy` uses) opts
  // back in. Using the mode rather than an inline env prefix keeps the scripts
  // working on Windows shells too.
  const isCloudflareTarget =
    mode === "cloudflare" || env.VITE_DEPLOY_TARGET === "cloudflare";

  return {
    plugins: [react(), tailwindcss(), ...(isCloudflareTarget ? [cloudflare()] : [])],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'import.meta.env.VITE_BASENAME': JSON.stringify(env.VITE_BASENAME || ''),
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
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
            // The phone field carries libphonenumber metadata. Keep it in its own
            // chunk so it is fetched by the two pages that have a phone input,
            // rather than riding along in a shared chunk the login page pulls.
            if (id.includes("react-phone-number-input") || id.includes("libphonenumber-js")) {
              return "vendor-phone";
            }
            if (id.includes("@radix-ui") || id.includes("/radix-ui/")) {
              return "vendor-radix";
            }
            if (id.includes("socket.io-client") || id.includes("engine.io-client")) {
              return "vendor-socket";
            }
            return undefined;
          },
        },
      },
    },
  };
})
