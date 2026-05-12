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
