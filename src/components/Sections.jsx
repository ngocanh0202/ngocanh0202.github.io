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
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'PF';
}
