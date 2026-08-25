# Vertoone SME — Frontend

React 19 + Vite + TypeScript super admin console for the Vertoone SME platform.

This is the shared Vertoone console template. It ships with the theme system,
the colour system and super admin authentication wired end to end; every
business module is built on top of it.

## Running it

```bash
npm install
cp .env.example .env    # VITE_SERVER_URL must match the backend
npm run dev             # http://localhost:5173
```

Sign in with the `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` from the
backend's `.env`. The backend re-seeds that account on every boot, so those
credentials always work.

| Script          | What it does                       |
| --------------- | ---------------------------------- |
| `npm run dev`   | Vite dev server                    |
| `npm run build` | Typecheck (`tsc -b`) + prod bundle |
| `npm run lint`  | ESLint over the repo               |

## What's in the box

### 1. Theme configuration

`redux/settingsSlice.ts` is the single source of truth and is persisted to
localStorage, so a reload restores exactly what the user picked:

- colour mode — `light` / `dark` / `system` (`components/theme-provider.tsx`)
- corner radius, base font size, animation speed, glassmorphism header
- sidebar variant / collapsible mode / side (`contexts/sidebar-context.tsx`)

The **Customizer** (the gear in the navbar, `components/theme-customizer/`)
drives all of it, and its Reset restores the documented defaults.

### 2. Colour configuration

Every colour is a CSS custom property on `:root`, so nothing is hard-coded in a
component. `hooks/use-theme-manager.ts` writes a preset's variables onto the
document element and `AppRouter` re-applies the active preset on load and on
every mode change.

- `utils/tweakcn-theme-presets.ts` — the advanced presets (default:
  **Starry Night**)
- `utils/shadcn-ui-theme-presets.ts` — the standard shadcn presets
- `index.css` — the token contract (`--primary`, `--sidebar`, `--chart-*`, …)
  and its light/dark baseline

To add a palette, add an entry to one of the preset files — it appears in the
Customizer automatically.

### 3. Super admin login

`POST /auth/login` → the session lands in `redux/authSlice.ts` (persisted).
`redux/baseApi.ts` attaches the bearer token, unwraps the backend's
`{ success, message, data, meta? }` envelope, and on a 401 refreshes once
behind a mutex before replaying the request — falling back to a logout and a
bounce to `/login`. `ProtectedRoute` gates every private route and
`PublicRoute` keeps a signed-in user off `/login`.

## Adding a module

1. Add the endpoints in `src/redux/apis/`, and its cache tag to
   `ALL_TAG_TYPES` in `redux/baseApi.ts`.
2. Add the page under `src/app/`.
3. Register the route in `config/routes.tsx`.
4. Add the sidebar entry in `config/navigation.ts` — `MENU_ITEMS` feeds both
   the sidebar and the `ProtectedRoute` access check, so that one entry is
   what makes the page reachable.

## Layout

Pages render inside `BaseLayout`'s padded `<main>`, so a page component must
not add its own outer padding.

## Brand assets

All three live in `public/` and are wired up in `config/branding.ts`:

| File                | What it is                | Used for                    |
| ------------------- | ------------------------- | --------------------------- |
| `brand-logo.png`    | the V mark                | favicon, PWA, sidebar, navbar |
| `brand-company.png` | stacked mark + wordmark   | login screen                |
| `company-logo.png`  | horizontal wordmark       | footers, "powered by"       |
