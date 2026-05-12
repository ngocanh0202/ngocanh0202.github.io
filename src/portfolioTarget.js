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
