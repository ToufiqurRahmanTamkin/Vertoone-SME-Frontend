# Vertoone SME — Frontend

React 19 + Vite + TypeScript super admin console for the Vertoone SME platform.

This is the shared Vertoone console template. It ships with the theme system,
the colour system and super admin authentication wired end to end, plus a
console module for every backend module.

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

## Modules

| Route                  | Backend module      | What it does                                                     |
| ---------------------- | ------------------- | ---------------------------------------------------------------- |
| `/dashboard`           | `dashboard`         | Revenue, subscription, plan and guide stats; 12-month revenue chart; top plans; recent sales |
| `/subscription-plans`  | `subscriptionPlan`  | Full CRUD. Price, cycle, features, limits, trial, active/popular  |
| `/sold-subscriptions`  | `soldSubscription`  | Full CRUD + summary tiles. Invoice, customer, term, payment state |
| `/user-guides`         | `userGuide`         | Full CRUD. Category, audience, tags, draft/published              |
| `/system-config`       | `systemConfig`      | The single GLOBAL config document                                 |
| `/settings/account`    | `auth`              | Profile and change password                                       |

Notes that matter when extending these:

- **Pagination** comes back as `meta` (`page`/`limit`/`total`/`totalPages`),
  not `pagination`. `DataTable` wants `pages`, so pass `pages: meta.totalPages`.
- **Boolean list filters** (`isActive`, `isPublished`) are validated server-side
  as the literal strings `"true"`/`"false"`, so they are forwarded as-is from the
  URL rather than coerced. `buildQuery` drops empty values — sending `?status=`
  would be a 400, not "no filter".
- **Selling a plan** pre-fills price, currency and end date from the plan's
  billing cycle, mirroring the server's own defaults. On update the server
  ignores `planId`, `planName` and `invoiceNumber`, so the form locks the plan.
- **Deleting a plan** with sales returns 409; the page surfaces the server's
  message rather than a generic failure.
- **Form number fields** use plain `z.number()`, not `z.coerce.number()` —
  `FormInput` already emits numbers, and `coerce` types its input as `unknown`,
  which breaks `zodResolver`'s generic.

## Phone numbers

`FormPhone` (used by the customer phone on a sale and the support phone in
system config) pairs a searchable country picker — flag, name and dial code —
with the number input, and stores the result as E.164 (`+8801711223344`), so the
dial code travels with the number and the backend needs no country column.
`optionalPhone` in `validations/phone.ts` allows an empty value but rejects a
half-entered one. It defaults to Bangladesh; pass `defaultCountry` to change it.

The libphonenumber metadata it needs is split into its own `vendor-phone` chunk
so it is only fetched by the pages that have a phone field.

## Modals

Every dialog must clear its panel edges equally on both sides:

- Put fields in `<DialogBody>` — `DialogContent` itself has no padding. Keep
  `<DialogFooter>` a sibling of the body so its top border spans the panel.
- `DialogContent` and `AlertDialogContent` set
  `scrollbar-gutter: stable both-edges`, so a scrolling dialog reserves the
  scrollbar track on both edges instead of stealing it from the right padding.

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
