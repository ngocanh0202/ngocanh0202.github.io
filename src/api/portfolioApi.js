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
  const [profile, socials, posts, projects, images, files] = await Promise.all([
    request(baseUrl, `/api/portfolio/profile/public/${encoded}`),
    request(baseUrl, `/api/portfolio/social/public/${encoded}`),
    request(baseUrl, `/api/portfolio/posts/public/${encoded}`),
    request(baseUrl, `/api/portfolio/projects/public/${encoded}`),
    request(baseUrl, `/api/portfolio/images/public/${encoded}`),
    request(baseUrl, `/api/portfolio/files/public/${encoded}`),
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
  const requestOptions = {};
  const headers = {};

  if (options.method) requestOptions.method = options.method;
  if (options.body) headers['Content-Type'] = 'application/json';
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (Object.keys(headers).length) requestOptions.headers = headers;
  if (options.body) requestOptions.body = JSON.stringify(options.body);

  const response = await fetch(`${baseUrl}${path}`, requestOptions);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.detail || `Request failed with status ${response.status}`);
  }

  return payload;
}
