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
