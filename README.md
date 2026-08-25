# Vertoone SME — Frontend

The super admin console for Vertoone SME. React 19 + TypeScript + Vite,
Redux Toolkit / RTK Query for data, Tailwind v4 + shadcn/ui for the interface.

There is exactly one kind of user: the **super admin**, whose credentials are
provisioned from the backend's environment. There is no registration, no
password reset, and no other role.

## Getting started

```bash
npm install
cp .env.example .env     # point VITE_SERVER_URL at your backend
npm run dev              # http://localhost:5173
```

| Script              | What it does                     |
| ------------------- | -------------------------------- |
| `npm run dev`       | Vite dev server                  |
| `npm run build`     | Type-check (`tsc -b`) then build |
| `npm run preview`   | Serve the production build       |
| `npm run typecheck` | Types only                       |
| `npm run lint`      | ESLint                           |

## Environment

| Variable          | Default                 | Notes                                        |
| ----------------- | ----------------------- | -------------------------------------------- |
| `VITE_SERVER_URL` | `http://localhost:5000` | With or without an `/api/v1` suffix — either works |
| `VITE_APP_NAME`   | `Vertoone SME`          | Shown in the sidebar and on the login screen  |
| `VITE_NODE_ENV`   | `development`           |                                              |

## Structure

```
src/
├── main.tsx                Root render: store → PersistGate → App
├── App.tsx                 ThemeProvider → BrowserRouter → routes → Toaster
├── config/
│   ├── env.ts              Parsed VITE_* values
│   └── navigation.ts       The five menu entries — single source of truth
├── components/
│   ├── router/             AppRouter (lazy routes) + ProtectedRoute/PublicRoute
│   ├── layouts/            DashboardLayout — sidebar + header + scroll area
│   ├── shared/             PageHeader, StatCard, EmptyState, PaginationBar,
│   │                       StatusBadge, form-fields
│   └── ui/                 shadcn primitives
├── hooks/                  Typed redux hooks, theme, debounce, list filters
├── lib/                    cn(), formatting, API error extraction
├── redux/
│   ├── baseApi.ts          Envelope unwrapping + single-flight 401 refresh
│   ├── apis/               One endpoint slice per backend module
│   ├── authSlice.ts        Session (persisted)
│   └── settingsSlice.ts    Theme + sidebar (persisted)
├── pages/                  One folder per screen
└── types/                  Shared API contracts
```

## Screens

| Route                  | Screen              | What it does                                       |
| ---------------------- | ------------------- | -------------------------------------------------- |
| `/login`               | Login               | The only public route                              |
| `/dashboard`           | Dashboard           | Revenue/subscription stats, 12-month trend, recent sales |
| `/system-config`       | System Config       | Platform-wide settings (branding, currency, maintenance) |
| `/subscription-plans`  | Subscription Plans  | Plan catalogue CRUD, searchable and filterable      |
| `/sold-subscriptions`  | Sold Subscriptions  | Sales/invoices CRUD, with a summary header          |
| `/user-guide`          | User Guide          | Help-article CRUD                                   |

Adding a screen means: a page component, a lazy `<Route>` in
`components/router/app-router.tsx`, and an entry in `config/navigation.ts`.

## Conventions

- **No page padding.** `DashboardLayout` owns the outer spacing; pages render
  their sections directly.
- **API shape.** `baseApi` strips the `{ success, message, data, meta }`
  envelope, so hooks return the payload directly — lists as `{ data, meta }`,
  everything else bare.
- **Errors.** Always surface them through `getApiErrorMessage(error)` into a
  `toast.error`, so the server's own message reaches the user.
- **Filters.** List screens use `useListFilters`, which resets to page 1 in the
  same update that changes a filter.
