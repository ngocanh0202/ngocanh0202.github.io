# React Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React/Vite portfolio app from the current `index.html` layout, backed by the portfolio API and configurable default user id.

**Architecture:** Use Vite with React components and a small API client. Keep routing and session decisions in pure helpers so they can be tested without a browser, then wire those helpers into `App.jsx` for public profile, owner profile, login, logout, and URL id behavior.

**Tech Stack:** React, Vite, Vitest, Testing Library, jsdom, Fetch API, localStorage.

---

## Scope Check

This plan covers one working application: a React portfolio client. It does not add owner CRUD screens for creating or editing portfolio resources, because the approved spec asks for display, login, URL profile selection, and API-backed rendering.

## File Structure

- Create `package.json`: npm scripts and dependencies.
- Create `vite.config.js`: Vite React config and Vitest jsdom setup.
- Modify `index.html`: Vite mount point and neutral portfolio title.
- Create `src/main.jsx`: React entry point.
- Create `src/setupTests.js`: Testing Library matchers.
- Create `src/config.js`: `api_base_url` and `user_default`.
- Create `src/portfolioTarget.js`: pure URL/default/auth target resolution.
- Create `src/session.js`: localStorage token persistence.
- Create `src/api/portfolioApi.js`: API calls and response error handling.
- Create `src/api/normalizers.js`: robust mapping from backend resource fields to view data.
- Create `src/components/BootScreen.jsx`: neutral boot sequence.
- Create `src/components/Header.jsx`: navigation, active section, auth actions, clock.
- Create `src/components/AuthPanel.jsx`: login/register form.
- Create `src/components/Sections.jsx`: profile, projects, posts, images, files sections.
- Create `src/App.jsx`: app state, route target, data loading, section switching.
- Create `src/styles.css`: migrated styling from the existing layout with personal portfolio copy.
- Create tests beside behavior modules:
  - `src/portfolioTarget.test.js`
  - `src/session.test.js`
  - `src/api/portfolioApi.test.js`
  - `src/api/normalizers.test.js`
  - `src/App.test.jsx`

## Commands Used Throughout

- Install: `npm install`
- Test one file: `npm test -- src/portfolioTarget.test.js`
- Test suite: `npm test`
- Production build: `npm run build`
- Dev server: `npm run dev -- --host 127.0.0.1 --port 5173`

### Task 1: Create React Test Harness

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Modify: `index.html`
- Create: `src/main.jsx`
- Create: `src/setupTests.js`

- [ ] **Step 1: Create npm and Vite config files**

Create `package.json`:

```json
{
  "name": "ngocanh0202-portfolio",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "vite": "^7.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/react": "^16.0.0",
    "jsdom": "^26.0.0",
    "vitest": "^3.0.0"
  }
}
```

Create `vite.config.js`:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    globals: true,
  },
});
```

- [ ] **Step 2: Replace root HTML with Vite mount point**

Replace `index.html` with:

```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Personal Portfolio</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@300;400;500;600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create test setup**

Create `src/setupTests.js`:

```js
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Create temporary React entry**

Create `src/main.jsx`:

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Create `src/App.jsx`:

```jsx
export default function App() {
  return <div>Personal Portfolio</div>;
}
```

Create `src/styles.css`:

```css
:root {
  --beige: #d7ceb2;
  --dark: #1a1a18;
}

body {
  margin: 0;
  background: var(--dark);
  color: var(--beige);
}
```

- [ ] **Step 5: Install dependencies**

Run: `npm install`

Expected: npm creates `package-lock.json` and exits with code 0.

- [ ] **Step 6: Verify scaffold**

Run: `npm run build`

Expected: Vite builds `dist/` successfully.

- [ ] **Step 7: Commit scaffold**

```bash
git add package.json package-lock.json vite.config.js index.html src/main.jsx src/setupTests.js src/App.jsx src/styles.css
git commit -m "feat: scaffold React portfolio app"
```

### Task 2: Resolve Portfolio Target

**Files:**
- Create: `src/config.js`
- Create: `src/portfolioTarget.js`
- Test: `src/portfolioTarget.test.js`

- [ ] **Step 1: Write failing target tests**

Create `src/portfolioTarget.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { extractUrlUserId, resolvePortfolioTarget } from './portfolioTarget.js';

describe('extractUrlUserId', () => {
  it('reads a public profile id from /u/:userId', () => {
    expect(extractUrlUserId('/u/abc123')).toBe('abc123');
  });

  it('ignores empty or unrelated paths', () => {
    expect(extractUrlUserId('/')).toBe('');
    expect(extractUrlUserId('/systems')).toBe('');
  });
});

describe('resolvePortfolioTarget', () => {
  it('uses URL id before the stored session', () => {
    const result = resolvePortfolioTarget({
      pathname: '/u/public-user',
      hasSession: true,
      userDefault: 'default-user',
    });

    expect(result).toEqual({ mode: 'public', userId: 'public-user', reason: 'url' });
  });

  it('uses owner mode when logged in and URL has no id', () => {
    const result = resolvePortfolioTarget({
      pathname: '/',
      hasSession: true,
      userDefault: 'default-user',
    });

    expect(result).toEqual({ mode: 'owner', userId: '', reason: 'session' });
  });

  it('uses configured default user when logged out', () => {
    const result = resolvePortfolioTarget({
      pathname: '/',
      hasSession: false,
      userDefault: 'default-user',
    });

    expect(result).toEqual({ mode: 'public', userId: 'default-user', reason: 'default' });
  });

  it('reports configuration required when no id is available', () => {
    const result = resolvePortfolioTarget({
      pathname: '/',
      hasSession: false,
      userDefault: '',
    });

    expect(result).toEqual({ mode: 'missing-default', userId: '', reason: 'config' });
  });
});
```

- [ ] **Step 2: Run target tests to verify failure**

Run: `npm test -- src/portfolioTarget.test.js`

Expected: FAIL because `src/portfolioTarget.js` does not exist.

- [ ] **Step 3: Implement target resolution**

Create `src/config.js`:

```js
export const appConfig = {
  api_base_url: 'http://localhost:8000',
  user_default: '',
};
```

Create `src/portfolioTarget.js`:

```js
export function extractUrlUserId(pathname) {
  const match = pathname.match(/^\/u\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : '';
}

export function resolvePortfolioTarget({ pathname, hasSession, userDefault }) {
  const urlUserId = extractUrlUserId(pathname);

  if (urlUserId) {
    return { mode: 'public', userId: urlUserId, reason: 'url' };
  }

  if (hasSession) {
    return { mode: 'owner', userId: '', reason: 'session' };
  }

  if (userDefault) {
    return { mode: 'public', userId: userDefault, reason: 'default' };
  }

  return { mode: 'missing-default', userId: '', reason: 'config' };
}
```

- [ ] **Step 4: Run target tests to verify pass**

Run: `npm test -- src/portfolioTarget.test.js`

Expected: PASS.

- [ ] **Step 5: Commit target resolution**

```bash
git add src/config.js src/portfolioTarget.js src/portfolioTarget.test.js
git commit -m "feat: resolve portfolio display target"
```

### Task 3: Add Session Persistence

**Files:**
- Create: `src/session.js`
- Test: `src/session.test.js`

- [ ] **Step 1: Write failing session tests**

Create `src/session.test.js`:

```js
import { beforeEach, describe, expect, it } from 'vitest';
import { clearSession, loadSession, saveSession } from './session.js';

describe('session storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores and loads access and refresh tokens', () => {
    saveSession({ access_token: 'access', refresh_token: 'refresh' });

    expect(loadSession()).toEqual({ access_token: 'access', refresh_token: 'refresh' });
  });

  it('returns null when no token is stored', () => {
    expect(loadSession()).toBeNull();
  });

  it('clears stored token data', () => {
    saveSession({ access_token: 'access', refresh_token: 'refresh' });
    clearSession();

    expect(loadSession()).toBeNull();
  });

  it('ignores corrupted storage content', () => {
    localStorage.setItem('portfolio.auth.tokens', '{bad json');

    expect(loadSession()).toBeNull();
  });
});
```

- [ ] **Step 2: Run session tests to verify failure**

Run: `npm test -- src/session.test.js`

Expected: FAIL because `src/session.js` does not exist.

- [ ] **Step 3: Implement session persistence**

Create `src/session.js`:

```js
const TOKEN_KEY = 'portfolio.auth.tokens';

export function saveSession(tokens) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export function loadSession() {
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed.access_token) return null;
    return parsed;
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
}
```

- [ ] **Step 4: Run session tests to verify pass**

Run: `npm test -- src/session.test.js`

Expected: PASS.

- [ ] **Step 5: Commit session persistence**

```bash
git add src/session.js src/session.test.js
git commit -m "feat: persist portfolio auth session"
```

### Task 4: Add API Client And Normalizers

**Files:**
- Create: `src/api/portfolioApi.js`
- Create: `src/api/normalizers.js`
- Test: `src/api/portfolioApi.test.js`
- Test: `src/api/normalizers.test.js`

- [ ] **Step 1: Write failing normalizer tests**

Create `src/api/normalizers.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { normalizeFile, normalizeImage, normalizePost, normalizeProject } from './normalizers.js';

describe('portfolio normalizers', () => {
  it('normalizes projects from API fields', () => {
    expect(normalizeProject({
      _id: 'p1',
      name: 'API Project',
      description: 'Backend service',
      tech_stack: ['FastAPI', 'MongoDB'],
      github_url: 'https://github.com/example/repo',
      demo_url: 'https://example.com',
    })).toEqual({
      id: 'p1',
      name: 'API Project',
      description: 'Backend service',
      techStack: ['FastAPI', 'MongoDB'],
      githubUrl: 'https://github.com/example/repo',
      demoUrl: 'https://example.com',
    });
  });

  it('converts post HTML content to a readable excerpt', () => {
    expect(normalizePost({
      id: 'post1',
      title: 'Launch',
      content: '<article><h1>Hello</h1><p>Portfolio content</p></article>',
      created_at: '2026-05-12T10:00:00',
    })).toMatchObject({
      id: 'post1',
      title: 'Launch',
      excerpt: 'Hello Portfolio content',
      date: '2026-05-12',
    });
  });

  it('normalizes media urls and names', () => {
    expect(normalizeImage({ id: 'i1', url: '/img.png', filename: 'img.png' })).toMatchObject({
      id: 'i1',
      url: '/img.png',
      label: 'img.png',
    });

    expect(normalizeFile({ _id: 'f1', file_url: '/cv.pdf', original_name: 'cv.pdf' })).toMatchObject({
      id: 'f1',
      url: '/cv.pdf',
      title: 'cv.pdf',
    });
  });
});
```

- [ ] **Step 2: Write failing API tests**

Create `src/api/portfolioApi.test.js`:

```js
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadOwnerPortfolio, loadPublicPortfolio, loginPortfolio } from './portfolioApi.js';

describe('portfolio API client', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('loads public portfolio resources for a target user', async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse({ name: 'Public User', bio: 'Bio' }))
      .mockResolvedValueOnce(jsonResponse([{ id: 'post1', title: 'Post' }]))
      .mockResolvedValueOnce(jsonResponse([{ id: 'project1', name: 'Project' }]))
      .mockResolvedValueOnce(jsonResponse([{ id: 'image1', url: '/image.png' }]))
      .mockResolvedValueOnce(jsonResponse([{ id: 'file1', file_url: '/file.pdf' }]));

    const result = await loadPublicPortfolio({ baseUrl: 'http://api.test', userId: 'user123' });

    expect(fetch).toHaveBeenNthCalledWith(1, 'http://api.test/api/portfolio/profile/public/user123', expect.any(Object));
    expect(result.profile.name).toBe('Public User');
    expect(result.posts).toHaveLength(1);
    expect(result.projects).toHaveLength(1);
    expect(result.images).toHaveLength(1);
    expect(result.files).toHaveLength(1);
  });

  it('loads owner resources with bearer token', async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse({ name: 'Owner User' }))
      .mockResolvedValueOnce(jsonResponse([{ platform: 'github', url: 'https://github.com/example' }]))
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse([]));

    await loadOwnerPortfolio({ baseUrl: 'http://api.test', token: 'abc' });

    expect(fetch).toHaveBeenNthCalledWith(1, 'http://api.test/api/portfolio/profile/', {
      headers: { Authorization: 'Bearer abc' },
    });
  });

  it('logs in against portfolio auth endpoint', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ access_token: 'access', refresh_token: 'refresh' }));

    const result = await loginPortfolio({
      baseUrl: 'http://api.test',
      email: 'user@example.com',
      password: 'password123',
    });

    expect(fetch).toHaveBeenCalledWith('http://api.test/api/portfolio/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com', password: 'password123' }),
    });
    expect(result.access_token).toBe('access');
  });

  it('throws backend detail text for failed requests', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ detail: 'Invalid credentials' }, 401));

    await expect(loginPortfolio({
      baseUrl: 'http://api.test',
      email: 'bad@example.com',
      password: 'wrong',
    })).rejects.toThrow('Invalid credentials');
  });
});

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}
```

- [ ] **Step 3: Run API tests to verify failure**

Run: `npm test -- src/api/normalizers.test.js src/api/portfolioApi.test.js`

Expected: FAIL because API modules do not exist.

- [ ] **Step 4: Implement normalizers**

Create `src/api/normalizers.js`:

```js
export function normalizeProject(project) {
  return {
    id: project.id || project._id || project.name,
    name: project.name || 'Untitled Project',
    description: project.description || '',
    techStack: Array.isArray(project.tech_stack) ? project.tech_stack : [],
    githubUrl: project.github_url || '',
    demoUrl: project.demo_url || '',
  };
}

export function normalizePost(post) {
  const dateSource = post.created_at || post.updated_at || '';
  return {
    id: post.id || post._id || post.title,
    title: post.title || 'Untitled Post',
    content: post.content || '',
    excerpt: stripHtml(post.content || '').slice(0, 180),
    date: dateSource ? dateSource.slice(0, 10) : '',
  };
}

export function normalizeImage(image) {
  const url = image.url || image.file_url || image.image_url || '';
  return {
    id: image.id || image._id || url,
    url,
    label: image.label || image.filename || image.original_name || 'Portfolio image',
  };
}

export function normalizeFile(file) {
  const url = file.url || file.file_url || '';
  return {
    id: file.id || file._id || url,
    url,
    title: file.title || file.filename || file.original_name || 'Portfolio file',
    category: file.category || 'File',
    project: file.project || 'Portfolio',
  };
}

export function normalizeSocial(link) {
  return {
    id: link.id || link._id || link.platform || link.url,
    platform: link.platform || 'link',
    url: link.url || '',
  };
}

function stripHtml(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
```

- [ ] **Step 5: Implement API client**

Create `src/api/portfolioApi.js`:

```js
import { normalizeFile, normalizeImage, normalizePost, normalizeProject, normalizeSocial } from './normalizers.js';

export async function loginPortfolio({ baseUrl, email, password }) {
  return request(baseUrl, '/api/portfolio/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function registerPortfolio({ baseUrl, email, password }) {
  return request(baseUrl, '/api/portfolio/auth/register', {
    method: 'POST',
    body: { email, password },
  });
}

export async function loadPublicPortfolio({ baseUrl, userId }) {
  const encoded = encodeURIComponent(userId);
  const [profile, posts, projects, images, files] = await Promise.all([
    request(baseUrl, `/api/portfolio/profile/public/${encoded}`),
    request(baseUrl, `/api/portfolio/posts/public/${encoded}`),
    request(baseUrl, `/api/portfolio/projects/public/${encoded}`),
    request(baseUrl, `/api/portfolio/images/public/${encoded}`),
    request(baseUrl, `/api/portfolio/files/public/${encoded}`),
  ]);

  return {
    profile,
    socials: [],
    posts: posts.map(normalizePost),
    projects: projects.map(normalizeProject),
    images: images.map(normalizeImage),
    files: files.map(normalizeFile),
  };
}

export async function loadOwnerPortfolio({ baseUrl, token }) {
  const [profile, socials, posts, projects, images, files] = await Promise.all([
    request(baseUrl, '/api/portfolio/profile/', { token }),
    request(baseUrl, '/api/portfolio/social/', { token }),
    request(baseUrl, '/api/portfolio/posts/', { token }),
    request(baseUrl, '/api/portfolio/projects/', { token }),
    request(baseUrl, '/api/portfolio/images/', { token }),
    request(baseUrl, '/api/portfolio/files/', { token }),
  ]);

  return {
    profile,
    socials: socials.map(normalizeSocial),
    posts: posts.map(normalizePost),
    projects: projects.map(normalizeProject),
    images: images.map(normalizeImage),
    files: files.map(normalizeFile),
  };
}

async function request(baseUrl, path, options = {}) {
  const headers = {};
  if (options.body) headers['Content-Type'] = 'application/json';
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.detail || `Request failed with status ${response.status}`);
  }

  return payload;
}
```

- [ ] **Step 6: Run API tests to verify pass**

Run: `npm test -- src/api/normalizers.test.js src/api/portfolioApi.test.js`

Expected: PASS.

- [ ] **Step 7: Commit API client**

```bash
git add src/api/normalizers.js src/api/normalizers.test.js src/api/portfolioApi.js src/api/portfolioApi.test.js
git commit -m "feat: add portfolio API client"
```

### Task 5: Build App Data Flow

**Files:**
- Modify: `src/App.jsx`
- Test: `src/App.test.jsx`

- [ ] **Step 1: Write failing App behavior tests**

Create `src/App.test.jsx`:

```jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.jsx';
import * as api from './api/portfolioApi.js';
import { clearSession, saveSession } from './session.js';

vi.mock('./config.js', () => ({
  appConfig: {
    api_base_url: 'http://api.test',
    user_default: 'default-user',
  },
}));

describe('App data flow', () => {
  beforeEach(() => {
    clearSession();
    window.history.pushState({}, '', '/');
    vi.restoreAllMocks();
  });

  it('loads default public portfolio when logged out', async () => {
    vi.spyOn(api, 'loadPublicPortfolio').mockResolvedValue(samplePortfolio('Default User'));
    vi.spyOn(api, 'loadOwnerPortfolio').mockResolvedValue(samplePortfolio('Owner User'));

    render(<App />);

    await screen.findByText('Default User');
    expect(api.loadPublicPortfolio).toHaveBeenCalledWith({ baseUrl: 'http://api.test', userId: 'default-user' });
    expect(api.loadOwnerPortfolio).not.toHaveBeenCalled();
  });

  it('loads URL public profile before session profile', async () => {
    saveSession({ access_token: 'access', refresh_token: 'refresh' });
    window.history.pushState({}, '', '/u/public-user');
    vi.spyOn(api, 'loadPublicPortfolio').mockResolvedValue(samplePortfolio('Public User'));
    vi.spyOn(api, 'loadOwnerPortfolio').mockResolvedValue(samplePortfolio('Owner User'));

    render(<App />);

    await screen.findByText('Public User');
    expect(api.loadPublicPortfolio).toHaveBeenCalledWith({ baseUrl: 'http://api.test', userId: 'public-user' });
  });

  it('loads owner profile when logged in and no URL id exists', async () => {
    saveSession({ access_token: 'access', refresh_token: 'refresh' });
    vi.spyOn(api, 'loadOwnerPortfolio').mockResolvedValue(samplePortfolio('Owner User'));

    render(<App />);

    await screen.findByText('Owner User');
    expect(api.loadOwnerPortfolio).toHaveBeenCalledWith({ baseUrl: 'http://api.test', token: 'access' });
  });

  it('clears session and returns to public default after logout', async () => {
    saveSession({ access_token: 'access', refresh_token: 'refresh' });
    vi.spyOn(api, 'loadOwnerPortfolio').mockResolvedValue(samplePortfolio('Owner User'));
    vi.spyOn(api, 'loadPublicPortfolio').mockResolvedValue(samplePortfolio('Default User'));

    render(<App />);

    await screen.findByText('Owner User');
    await userEvent.click(screen.getByRole('button', { name: /logout/i }));

    await screen.findByText('Default User');
    expect(api.loadPublicPortfolio).toHaveBeenCalledWith({ baseUrl: 'http://api.test', userId: 'default-user' });
  });

  it('does not render game-specific copy', async () => {
    vi.spyOn(api, 'loadPublicPortfolio').mockResolvedValue(samplePortfolio('Default User'));

    render(<App />);

    await screen.findByText('Default User');
    expect(document.body).not.toHaveTextContent(/YoRHa|NieR|2B/i);
  });
});

function samplePortfolio(name) {
  return {
    profile: { name, bio: 'Developer portfolio', avatar_url: '' },
    socials: [{ id: 'github', platform: 'github', url: 'https://github.com/example' }],
    projects: [{ id: 'project1', name: 'Portfolio API', description: 'API client', techStack: ['React'] }],
    posts: [{ id: 'post1', title: 'Build Log', excerpt: 'React portfolio', date: '2026-05-12' }],
    images: [{ id: 'image1', url: '/image.png', label: 'Screenshot' }],
    files: [{ id: 'file1', url: '/cv.pdf', title: 'CV.pdf', category: 'PDF', project: 'Portfolio' }],
  };
}
```

- [ ] **Step 2: Install user-event test helper**

Run: `npm install -D @testing-library/user-event`

Expected: npm updates `package.json` and `package-lock.json`.

- [ ] **Step 3: Run App tests to verify failure**

Run: `npm test -- src/App.test.jsx`

Expected: FAIL because `App.jsx` only renders the temporary scaffold.

- [ ] **Step 4: Implement App data flow**

Replace `src/App.jsx` with:

```jsx
import { useEffect, useMemo, useState } from 'react';
import { appConfig } from './config.js';
import { loadOwnerPortfolio, loadPublicPortfolio } from './api/portfolioApi.js';
import { clearSession, loadSession } from './session.js';
import { resolvePortfolioTarget } from './portfolioTarget.js';
import BootScreen from './components/BootScreen.jsx';
import Header from './components/Header.jsx';
import AuthPanel from './components/AuthPanel.jsx';
import { FilesSection, ImagesSection, PostsSection, ProfileSection, ProjectsSection } from './components/Sections.jsx';

const sections = ['identity', 'systems', 'archive', 'library', 'transmissions'];

export default function App() {
  const [session, setSession] = useState(() => loadSession());
  const [activeSection, setActiveSection] = useState('identity');
  const [authOpen, setAuthOpen] = useState(false);
  const [portfolio, setPortfolio] = useState(null);
  const [status, setStatus] = useState({ state: 'loading', message: '' });

  const target = useMemo(() => resolvePortfolioTarget({
    pathname: window.location.pathname,
    hasSession: Boolean(session?.access_token),
    userDefault: appConfig.user_default,
  }), [session]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (target.mode === 'missing-default') {
        setPortfolio(null);
        setStatus({ state: 'config', message: 'Set user_default in src/config.js to load the default portfolio.' });
        return;
      }

      setStatus({ state: 'loading', message: 'Loading portfolio data' });

      try {
        const data = target.mode === 'owner'
          ? await loadOwnerPortfolio({ baseUrl: appConfig.api_base_url, token: session.access_token })
          : await loadPublicPortfolio({ baseUrl: appConfig.api_base_url, userId: target.userId });

        if (!cancelled) {
          setPortfolio(data);
          setStatus({ state: 'ready', message: '' });
        }
      } catch (error) {
        if (target.mode === 'owner') {
          clearSession();
          setSession(null);
        }
        if (!cancelled) {
          setPortfolio(null);
          setStatus({ state: 'error', message: error.message });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [session, target.mode, target.userId]);

  function handleLogout() {
    clearSession();
    setSession(null);
    window.history.pushState({}, '', '/');
  }

  return (
    <>
      <BootScreen />
      <div id="app" className="visible">
        <Header
          activeSection={activeSection}
          isAuthenticated={Boolean(session?.access_token)}
          onAuthOpen={() => setAuthOpen(true)}
          onLogout={handleLogout}
          onSectionChange={setActiveSection}
          sections={sections}
        />
        {authOpen && <AuthPanel onClose={() => setAuthOpen(false)} onSession={setSession} />}
        <main>
          {status.state === 'loading' && <div className="box state-box">Loading portfolio data...</div>}
          {status.state === 'config' && <div className="box state-box">{status.message}</div>}
          {status.state === 'error' && <div className="box state-box">Unable to load portfolio: {status.message}</div>}
          {portfolio && (
            <>
              <ProfileSection active={activeSection === 'identity'} portfolio={portfolio} />
              <ProjectsSection active={activeSection === 'systems'} projects={portfolio.projects} />
              <PostsSection active={activeSection === 'archive'} posts={portfolio.posts} />
              <ImagesSection active={activeSection === 'library'} images={portfolio.images} />
              <FilesSection active={activeSection === 'transmissions'} files={portfolio.files} />
            </>
          )}
        </main>
        <footer>
          <div className="footer-text">Personal Portfolio // API connected</div>
          <div className="footer-dec">Portfolio Client // v1.0.0</div>
        </footer>
      </div>
    </>
  );
}
```

- [ ] **Step 5: Run App tests to see component import failure**

Run: `npm test -- src/App.test.jsx`

Expected: FAIL because component files are not created yet.

### Task 6: Implement Components And Auth Panel

**Files:**
- Create: `src/components/BootScreen.jsx`
- Create: `src/components/Header.jsx`
- Create: `src/components/AuthPanel.jsx`
- Create: `src/components/Sections.jsx`
- Modify: `src/App.jsx`
- Test: `src/App.test.jsx`

- [ ] **Step 1: Create BootScreen**

Create `src/components/BootScreen.jsx`:

```jsx
import { useEffect, useState } from 'react';

const bootLines = [
  'Initializing personal portfolio',
  'Loading profile module',
  'Loading projects module',
  'Loading writing archive',
  'Loading media library',
  'Preparing shared files',
  'Interface ready',
];

export default function BootScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div id="boot-screen">
      <div id="boot-logo">PERSONAL PORTFOLIO</div>
      <div id="boot-log">
        {bootLines.map((line) => (
          <div className="boot-line ok" key={line}>{`> ${line}`}</div>
        ))}
      </div>
      <div id="boot-bar-wrap"><div id="boot-bar" style={{ width: '100%' }} /></div>
    </div>
  );
}
```

- [ ] **Step 2: Create Header**

Create `src/components/Header.jsx`:

```jsx
import { useEffect, useState } from 'react';

const labels = {
  identity: 'IDENTITY',
  systems: 'SYSTEMS',
  archive: 'ARCHIVE',
  library: 'LIBRARY',
  transmissions: 'TRANSMISSIONS',
};

export default function Header({ activeSection, isAuthenticated, onAuthOpen, onLogout, onSectionChange, sections }) {
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 8));

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toTimeString().slice(0, 8)), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header>
      <div className="nav-inner">
        <div className="nav-brand">
          <span>PERSONAL PORTFOLIO</span>
          <span>Profile // Online</span>
        </div>
        <nav aria-label="Portfolio sections">
          {sections.map((section) => (
            <button
              className={activeSection === section ? 'active' : ''}
              key={section}
              onClick={() => onSectionChange(section)}
              type="button"
            >
              {labels[section]}
            </button>
          ))}
        </nav>
        <div className="nav-status">
          <div className="status-dot" />
          <span>{time}</span>
          {isAuthenticated ? (
            <button className="auth-link" onClick={onLogout} type="button">Logout</button>
          ) : (
            <button className="auth-link" onClick={onAuthOpen} type="button">Login</button>
          )}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Create AuthPanel**

Create `src/components/AuthPanel.jsx`:

```jsx
import { useState } from 'react';
import { appConfig } from '../config.js';
import { loginPortfolio, registerPortfolio } from '../api/portfolioApi.js';
import { saveSession } from '../session.js';

export default function AuthPanel({ onClose, onSession }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    try {
      if (mode === 'register') {
        await registerPortfolio({ baseUrl: appConfig.api_base_url, email, password });
        setMessage('Registration submitted. Wait for approval before login.');
        return;
      }

      const tokens = await loginPortfolio({ baseUrl: appConfig.api_base_url, email, password });
      saveSession(tokens);
      onSession(tokens);
      onClose();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="modal-backdrop">
      <form className="auth-panel box" data-code="AUTH" onSubmit={handleSubmit}>
        <div className="auth-header">
          <strong>{mode === 'login' ? 'Portfolio Login' : 'Portfolio Register'}</strong>
          <button aria-label="Close auth panel" onClick={onClose} type="button">x</button>
        </div>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
        </label>
        {message && <p className="auth-message">{message}</p>}
        <button className="primary-btn" type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
        <button className="ghost-btn" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} type="button">
          {mode === 'login' ? 'Create account' : 'Use existing account'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Create section components**

Create `src/components/Sections.jsx`:

```jsx
export function ProfileSection({ active, portfolio }) {
  const { profile, socials, projects, posts, files } = portfolio;
  const initials = getInitials(profile.name);

  return (
    <section className={`section ${active ? 'active' : ''}`}>
      <SectionHeader number="001" title="IDENTITY" subtitle="PERSONAL PROFILE & SOCIAL" />
      <div className="identity-grid">
        <div className="box profile-box" data-code="PROFILE">
          <div className="avatar-frame">
            {profile.avatar_url ? <img alt="" src={profile.avatar_url} /> : <span>{initials}</span>}
          </div>
          <div className="profile-name">{profile.name || 'Unnamed Portfolio'}</div>
          <div className="profile-role">// DEVELOPER & CREATOR</div>
          <hr className="profile-divider" />
          <div className="profile-bio">{profile.bio || 'Portfolio profile has not been configured.'}</div>
        </div>
        <div className="identity-side">
          <div className="box social-box" data-code="SOCIAL">
            <div className="social-title">// SOCIAL LINKS</div>
            <div className="social-grid">
              {socials.length ? socials.map((social) => (
                <a className="social-item" href={social.url} key={social.id} rel="noreferrer" target="_blank">
                  <div className="social-icon">{social.platform.slice(0, 2).toUpperCase()}</div>
                  <div className="social-info">
                    <div className="social-name">{social.platform}</div>
                    <div className="social-handle">{social.url}</div>
                  </div>
                  <div className="social-arrow">open</div>
                </a>
              )) : <div className="empty-inline">No public social links.</div>}
            </div>
          </div>
          <div className="stats-row">
            <StatBox value={projects.length} label="SYSTEMS" />
            <StatBox value={posts.length} label="ARCHIVE" />
            <StatBox value={files.length} label="FILES" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProjectsSection({ active, projects }) {
  return (
    <section className={`section ${active ? 'active' : ''}`}>
      <SectionHeader number="002" title="SYSTEMS" subtitle="SOFTWARE & APPLICATIONS" />
      <div className="products-grid">
        {projects.length ? projects.map((project) => (
          <article className="product-card box" data-code={`SYS:${project.id}`} key={project.id}>
            <div className="product-icon">PR</div>
            <div className="product-name">{project.name}</div>
            <div className="product-desc">{project.description}</div>
            <div className="tag-cloud">{project.techStack.map((tech) => <span className="tag" key={tech}>{tech}</span>)}</div>
            <div className="product-links">
              {project.demoUrl && <a href={project.demoUrl} rel="noreferrer" target="_blank">Demo</a>}
              {project.githubUrl && <a href={project.githubUrl} rel="noreferrer" target="_blank">GitHub</a>}
            </div>
          </article>
        )) : <EmptyBox text="No public projects." />}
      </div>
    </section>
  );
}

export function PostsSection({ active, posts }) {
  return (
    <section className={`section ${active ? 'active' : ''}`}>
      <SectionHeader number="003" title="ARCHIVE" subtitle="WRITING & DEVELOPMENT LOGS" />
      <div className="posts-list">
        {posts.length ? posts.map((post) => (
          <article className="post-item box" data-code={`POST:${post.date}`} key={post.id}>
            <div className="post-meta"><span>{post.date}</span><span className="post-tag">POST</span></div>
            <div className="post-title">{post.title}</div>
            <div className="post-excerpt">{post.excerpt}</div>
          </article>
        )) : <EmptyBox text="No public posts." />}
      </div>
    </section>
  );
}

export function ImagesSection({ active, images }) {
  return (
    <section className={`section ${active ? 'active' : ''}`}>
      <SectionHeader number="004" title="LIBRARY" subtitle="IMAGE ARCHIVE" />
      <div className="gallery-grid">
        {images.length ? images.map((image) => (
          <a className="gallery-item" href={image.url} key={image.id} rel="noreferrer" target="_blank">
            {image.url ? <img alt={image.label} src={image.url} /> : <div className="gallery-empty">NO IMAGE</div>}
            <div className="gallery-item-label">{image.label}</div>
          </a>
        )) : <EmptyBox text="No public images." />}
      </div>
    </section>
  );
}

export function FilesSection({ active, files }) {
  return (
    <section className={`section ${active ? 'active' : ''}`}>
      <SectionHeader number="005" title="TRANSMISSIONS" subtitle="SHARED FILES" />
      <table className="resources-table">
        <thead>
          <tr><th>Title</th><th>Category</th><th>Project</th><th>Action</th></tr>
        </thead>
        <tbody>
          {files.length ? files.map((file) => (
            <tr key={file.id}>
              <td>{file.title}</td>
              <td><span className="res-tag">{file.category}</span></td>
              <td>{file.project}</td>
              <td><a className="res-btn" href={file.url} rel="noreferrer" target="_blank">Open</a></td>
            </tr>
          )) : <tr><td className="no-results" colSpan="4">No public files.</td></tr>}
        </tbody>
      </table>
    </section>
  );
}

function SectionHeader({ number, title, subtitle }) {
  return (
    <div className="section-header">
      <span className="section-num">// {number}</span>
      <h1 className="section-title">{title}</h1>
      <span className="section-title-en">{subtitle}</span>
    </div>
  );
}

function StatBox({ value, label }) {
  return (
    <div className="stat-box box" data-code="">
      <span className="stat-num">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function EmptyBox({ text }) {
  return <div className="box empty-box">{text}</div>;
}

function getInitials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('') || 'PF';
}
```

- [ ] **Step 5: Run App tests to verify pass**

Run: `npm test -- src/App.test.jsx`

Expected: PASS.

- [ ] **Step 6: Run full tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 7: Commit app components**

```bash
git add package.json package-lock.json src/App.jsx src/App.test.jsx src/components/BootScreen.jsx src/components/Header.jsx src/components/AuthPanel.jsx src/components/Sections.jsx
git commit -m "feat: render API-backed portfolio layout"
```

### Task 7: Migrate Styling From Existing Layout

**Files:**
- Modify: `src/styles.css`
- Test: `src/App.test.jsx`

- [ ] **Step 1: Add style regression assertion**

Add this assertion to the existing `does not render game-specific copy` test in `src/App.test.jsx`:

```jsx
expect(screen.getByText('PERSONAL PORTFOLIO')).toBeInTheDocument();
expect(screen.getByText('Profile // Online')).toBeInTheDocument();
```

- [ ] **Step 2: Run App test to verify pass before CSS migration**

Run: `npm test -- src/App.test.jsx`

Expected: PASS. This confirms copy is still neutral before CSS migration.

- [ ] **Step 3: Replace CSS with migrated layout styles**

Replace `src/styles.css` with a React-safe version of the current `index.html` CSS. Keep these required changes:

```css
:root {
  --beige: #d7ceb2;
  --beige-dim: #b8af97;
  --beige-faint: #ede8da;
  --dark: #1a1a18;
  --dark-mid: #2c2c2a;
  --dark-card: #222220;
  --accent: #c8ba96;
  --accent-glow: rgba(200, 186, 150, 0.18);
  --red: #8b3a3a;
  --mono: 'Share Tech Mono', monospace;
  --sans: 'Rajdhani', sans-serif;
  --border: 1px solid rgba(215, 206, 178, 0.25);
  --border-hover: 1px solid rgba(215, 206, 178, 0.7);
}

*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--dark);
  color: var(--beige);
  font-family: var(--mono);
  font-size: 13px;
  min-height: 100vh;
  overflow-x: hidden;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.04) 2px, rgba(0, 0, 0, 0.04) 4px);
  pointer-events: none;
}
```

Continue migrating the existing layout classes from `index.html` for:

- boot screen
- header and nav
- `.box`
- identity grid
- social grid
- stats row
- products grid
- posts list
- gallery grid
- resources table
- modal auth panel
- responsive rules for 768px and below

During migration, ensure the CSS contains no `YoRHa`, `NieR`, or `2B` generated content. Use `.avatar-frame span` for initials and `.avatar-frame img` for real avatars.

- [ ] **Step 4: Run full tests after CSS migration**

Run: `npm test`

Expected: PASS.

- [ ] **Step 5: Build production bundle**

Run: `npm run build`

Expected: PASS and `dist/` is generated.

- [ ] **Step 6: Commit styling**

```bash
git add src/styles.css src/App.test.jsx
git commit -m "style: migrate portfolio interface theme"
```

### Task 8: Browser Verification

**Files:**
- No source files unless verification reveals a visible issue.

- [ ] **Step 1: Start dev server**

Run: `npm run dev -- --host 127.0.0.1 --port 5173`

Expected: Vite prints a local URL such as `http://127.0.0.1:5173/`.

- [ ] **Step 2: Open desktop viewport**

Use Playwright to open `http://127.0.0.1:5173/` at `1366x768`.

Expected:
- Header fits in one row.
- No visible `YoRHa`, `NieR`, or `2B` text.
- If `user_default` is empty, the configuration message is visible and framed.
- Login button opens the auth panel.

- [ ] **Step 3: Open mobile viewport**

Use Playwright to open `http://127.0.0.1:5173/` at `390x844`.

Expected:
- Navigation scrolls or wraps without text overlap.
- Identity section is one column.
- Auth panel fits viewport width.

- [ ] **Step 4: Verify URL id route**

Open `http://127.0.0.1:5173/u/example-user`.

Expected:
- App calls public API URLs for `example-user`.
- If backend is not running, the error message names the failed load without crashing the app.

- [ ] **Step 5: Stop dev server**

Stop the Vite process after screenshots and checks are complete.

### Task 9: Final Verification And Commit

**Files:**
- Modify only files needed for fixes found in Task 8.

- [ ] **Step 1: Run tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 3: Check git status**

Run: `git status --short`

Expected: only intentional React app files are modified or untracked.

- [ ] **Step 4: Commit verification fixes if any source changed after Task 8**

```bash
git add index.html package.json package-lock.json vite.config.js src
git commit -m "fix: polish portfolio app verification issues"
```

If no files changed after Task 8, skip this commit.

## Self-Review Notes

- Spec coverage: target resolution, default config, API endpoints, auth, section mapping, copy replacement, error/loading states, tests, build, and browser checks are covered.
- No missing module names: every imported module is created in a task before final full-suite verification.
- Type consistency: portfolio objects use `{ profile, socials, projects, posts, images, files }`; project fields use `techStack`, `githubUrl`, and `demoUrl`; session objects use `access_token` and `refresh_token`.
