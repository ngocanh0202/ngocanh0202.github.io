# React Portfolio Design

Date: 2026-05-12

## Goal

Build a React portfolio app from the current `index.html` layout. The visual style remains close to the existing dark mono beige interface, but all NieR Automata, YoRHa, 2B, unit, and game-lore wording is replaced with personal portfolio wording.

The app uses the portfolio API documented in `docs/api/portfolio.md`, auth behavior from `docs/api/auth-admin.md`, and base/system behavior from `docs/api/README.md` and `docs/api/system.md`. The implementation intentionally ignores `docs/api/japanese-learning-game.md` and `docs/api/notes.md`.

## User Selection Rules

The app decides whose portfolio to show in this order:

1. If the URL contains a profile id, show that public portfolio.
2. If the visitor is logged in and no explicit URL id is selected, show the logged-in user's owner portfolio.
3. Otherwise show the public portfolio for `user_default`.

`user_default` lives in a config module. Preferred file name is `src/config.js`. If the React scaffold or local conventions already use that name for another purpose, use `src/portfolio.config.js`.

Example config shape:

```js
export const appConfig = {
  api_base_url: 'http://localhost:8000',
  user_default: '',
};
```

The committed default value is an empty string because the backend user id is deployment-specific. When `user_default` is empty and no URL id or logged-in owner data is available, the app shows a clear configuration-required state instead of calling an invalid public profile URL.

## Routing

The app is a single page app. It supports deep links for public profiles through a URL id, using a simple route such as `/u/:userId` or a query string fallback if static hosting needs it.

Default route behavior:

- `/` renders `user_default` unless a valid portfolio token is already stored.
- `/u/:userId` renders that public user regardless of login state.
- A visible action can return the user to the default profile.

## Auth

Auth uses the portfolio auth endpoints:

- Register: `POST /api/portfolio/auth/register`
- Login: `POST /api/portfolio/auth/login`

The access token is stored in `localStorage` for this client. Logout removes stored tokens and returns to the public default profile.

The API docs do not expose `/api/portfolio/auth/me`, so the UI should not depend on a current-user metadata endpoint. After login, owner endpoints are used to load the logged-in user's data. If the backend cannot infer ownership only from token responses for display labels, the UI can show a generic authenticated state until profile data loads.

## Data Mapping

Existing layout sections map to portfolio API resources:

- `IDENTITY`: owner/public profile, social links when owner data is available, public stats.
- `SYSTEMS`: projects.
- `ARCHIVE`: posts.
- `LIBRARY`: images.
- `TRANSMISSIONS`: files.

Public mode uses public endpoints:

- `GET /api/portfolio/profile/public/{target_user_id}`
- `GET /api/portfolio/posts/public/{target_user_id}`
- `GET /api/portfolio/projects/public/{target_user_id}`
- `GET /api/portfolio/images/public/{target_user_id}`
- `GET /api/portfolio/files/public/{target_user_id}`

Owner mode uses authenticated owner endpoints:

- `GET /api/portfolio/profile/`
- `GET /api/portfolio/social/`
- `GET /api/portfolio/posts/`
- `GET /api/portfolio/projects/`
- `GET /api/portfolio/images/`
- `GET /api/portfolio/files/`

## Interface Copy

The theme remains inspired by the existing file: dark background, beige text, mono headings, framed boxes, boot sequence, section navigation, and subtle glitch/scanline treatment.

Required copy replacement:

- Replace `YoRHa` with portfolio/app wording such as `Personal Portfolio`.
- Replace `NieR:Edition` with a neutral app version label.
- Replace `2B` avatar placeholder with initials or a neutral profile placeholder.
- Replace `Unit Active`, `Personal System Hub`, and game-like boot messages with personal portfolio loading messages.
- Keep section names if useful, but supporting text must describe portfolio content rather than game fiction.

## Components

The React app should be split into focused components:

- `App`: routing, boot visibility, auth/session state, selected profile id.
- `config`: API base URL and default user id.
- `api/portfolioApi`: typed or structured fetch helpers for auth and portfolio resources.
- `components/Header`: nav, session status, login/logout actions.
- `components/AuthPanel`: login/register form and error display.
- `components/BootScreen`: existing boot sequence rewritten with neutral copy.
- `components/SectionNav`: section switching.
- `components/ProfileSection`: identity/profile/social/stats.
- `components/ProjectsSection`: projects grid.
- `components/PostsSection`: posts list and metadata.
- `components/ImagesSection`: public/owner image gallery.
- `components/FilesSection`: file/resource table with search/filter.

## Error And Loading States

Each major data load has loading, empty, and error states:

- Loading states should preserve the framed layout to avoid large layout shifts.
- Public profile not found should show a clear not-found message and a control to return to default profile.
- Auth failures should show the backend `detail` message when available.
- Token failures on owner endpoints should clear the session and fall back to the public default profile.

## Testing

Use React tests for behavior that matters:

- Default route loads `user_default` public data when unauthenticated.
- URL id overrides `user_default`.
- Successful login stores tokens and loads owner endpoints.
- Logout clears tokens and returns to default public data.
- API error states render meaningful messages.
- NieR/YoRHa/2B-specific copy is not present in rendered app text.

## Build And Verification

The project should build with React/Vite. Verification includes:

- Install dependencies if needed.
- Run unit tests.
- Run production build.
- Start local dev server and inspect the app in browser.
- Check desktop and mobile viewport screenshots for non-overlapping text and preserved layout.
