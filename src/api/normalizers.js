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
