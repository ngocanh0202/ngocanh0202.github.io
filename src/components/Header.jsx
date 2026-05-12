import { useEffect, useState } from 'react';

const labels = {
  identity: 'IDENTITY',
  systems: 'SYSTEMS',
  archive: 'ARCHIVE',
  library: 'LIBRARY',
  transmissions: 'TRANSMISSIONS',
};

export default function Header({ activeSection, isAuthenticated, onAuthOpen, onLogout, onSectionChange, sections }) {
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 8));

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toTimeString().slice(0, 8)), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header>
      <div className="nav-inner">
        <div className="nav-brand">
          <span>PERSONAL PORTFOLIO</span>
          <span>Profile // Online</span>
        </div>
        <nav aria-label="Portfolio sections">
          {sections.map((section) => (
            <button
              className={activeSection === section ? 'active' : ''}
              key={section}
              onClick={() => onSectionChange(section)}
              type="button"
            >
              {labels[section]}
            </button>
          ))}
        </nav>
        <div className="nav-status">
          <div className="status-dot" />
          <span>{time}</span>
          {isAuthenticated ? (
            <button className="auth-link" onClick={onLogout} type="button">Logout</button>
          ) : (
            <button className="auth-link" onClick={onAuthOpen} type="button">Login</button>
          )}
        </div>
      </div>
    </header>
  );
}
