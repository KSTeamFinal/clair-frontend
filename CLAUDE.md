# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
```

There are no configured test or lint scripts.

## Architecture

**Stack:** React 18 + TypeScript + Vite, React Router 7, Tailwind CSS v4, MUI + Radix UI (shadcn-style primitives)

**Entry point:** `src/main.tsx` renders a `RouterProvider`. All routes are defined in `src/app/routes.tsx`.

**Screens** live in `src/app/screens/` — each is a full-page component mapped 1:1 to a route. State is local (`useState`/`useEffect`); there is no global state manager.

**UI components** live in two places:
- `src/app/components/ui/` — shadcn/Radix primitives (button, card, dialog, etc.)
- MUI components are used directly from `@mui/material` in screens

## API Layer

All HTTP calls go through `src/api/client.ts` (Axios instance):
- Base URL: `VITE_API_URL` env var, fallback `http://127.0.0.1:8000`
- Auth: Bearer token read from `localStorage.getItem('accessToken')`, injected via request interceptor
- 401 handler: redirects to `/login` except for contract polling (`/loading/`) and share (`/share/`) routes
- API paths follow `/api/v1/*`

`src/api/axiosInstance.js` is a legacy file; prefer `client.ts`.

## Path Aliases

`@` maps to `src/` (configured in both `tsconfig.json` and `vite.config.ts`).

## Styling Conventions

- Tailwind v4 is the primary styling approach
- Emotion is available via MUI but not used for custom styles
- Theme variables are in `src/styles/theme.css`; global styles in `src/styles/index.css`
- Use `clsx` + `tailwind-merge` (`cn` utility) for conditional class merging
