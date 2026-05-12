import { useEffect, useMemo, useState } from 'react';
import { appConfig } from './config.js';
import { loadOwnerPortfolio, loadPublicPortfolio } from './api/portfolioApi.js';
import { clearSession, loadSession } from './session.js';
import { resolvePortfolioTarget } from './portfolioTarget.js';
import BootScreen from './components/BootScreen.jsx';
import Header from './components/Header.jsx';
import AuthPanel from './components/AuthPanel.jsx';
import { FilesSection, ImagesSection, PostsSection, ProfileSection, ProjectsSection } from './components/Sections.jsx';

const sections = ['identity', 'systems', 'archive', 'library', 'transmissions'];

export default function App() {
  const [session, setSession] = useState(() => loadSession());
  const [activeSection, setActiveSection] = useState('identity');
  const [authOpen, setAuthOpen] = useState(false);
  const [portfolio, setPortfolio] = useState(null);
  const [status, setStatus] = useState({ state: 'loading', message: '' });

  const target = useMemo(() => resolvePortfolioTarget({
    pathname: window.location.pathname,
    hasSession: Boolean(session?.access_token),
    userDefault: appConfig.user_default,
  }), [session]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (target.mode === 'missing-default') {
        setPortfolio(null);
        setStatus({ state: 'config', message: 'Set user_default in src/config.js to load the default portfolio.' });
        return;
      }

      setStatus({ state: 'loading', message: 'Loading portfolio data' });

      try {
        const data = target.mode === 'owner'
          ? await loadOwnerPortfolio({ baseUrl: appConfig.api_base_url, token: session.access_token })
          : await loadPublicPortfolio({ baseUrl: appConfig.api_base_url, userId: target.userId });

        if (!cancelled) {
          setPortfolio(data);
          setStatus({ state: 'ready', message: '' });
        }
      } catch (error) {
        if (target.mode === 'owner') {
          clearSession();
          setSession(null);
        }
        if (!cancelled) {
          setPortfolio(null);
          setStatus({ state: 'error', message: error.message });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [session, target.mode, target.userId]);

  function handleLogout() {
    clearSession();
    setSession(null);
    window.history.pushState({}, '', '/');
  }

  return (
    <>
      <BootScreen />
      <div id="app" className="visible">
        <Header
          activeSection={activeSection}
          isAuthenticated={Boolean(session?.access_token)}
          onAuthOpen={() => setAuthOpen(true)}
          onLogout={handleLogout}
          onSectionChange={setActiveSection}
          sections={sections}
        />
        {authOpen && <AuthPanel onClose={() => setAuthOpen(false)} onSession={setSession} />}
        <main>
          {status.state === 'loading' && <div className="box state-box">Loading portfolio data...</div>}
          {status.state === 'config' && <div className="box state-box">{status.message}</div>}
          {status.state === 'error' && <div className="box state-box">Unable to load portfolio: {status.message}</div>}
          {portfolio && (
            <>
              <ProfileSection active={activeSection === 'identity'} portfolio={portfolio} />
              <ProjectsSection active={activeSection === 'systems'} projects={portfolio.projects} />
              <PostsSection active={activeSection === 'archive'} posts={portfolio.posts} />
              <ImagesSection active={activeSection === 'library'} images={portfolio.images} />
              <FilesSection active={activeSection === 'transmissions'} files={portfolio.files} />
            </>
          )}
        </main>
        <footer>
          <div className="footer-text">Personal Portfolio // API connected</div>
          <div className="footer-dec">Portfolio Client // v1.0.0</div>
        </footer>
      </div>
    </>
  );
}
