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
