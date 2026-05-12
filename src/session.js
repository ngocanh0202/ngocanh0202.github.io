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
