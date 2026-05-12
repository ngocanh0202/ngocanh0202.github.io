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
