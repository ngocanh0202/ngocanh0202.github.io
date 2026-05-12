import { render, screen } from '@testing-library/react';
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
    expect(screen.getByText('PERSONAL PORTFOLIO')).toBeInTheDocument();
    expect(screen.getByText('Profile // Online')).toBeInTheDocument();
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
