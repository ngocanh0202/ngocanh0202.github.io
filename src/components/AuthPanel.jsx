import { useState } from 'react';
import { appConfig } from '../config.js';
import { loginPortfolio, registerPortfolio } from '../api/portfolioApi.js';
import { saveSession } from '../session.js';

export default function AuthPanel({ onClose, onSession }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    try {
      if (mode === 'register') {
        await registerPortfolio({ baseUrl: appConfig.api_base_url, email, password });
        setMessage('Registration submitted. Wait for approval before login.');
        return;
      }

      const tokens = await loginPortfolio({ baseUrl: appConfig.api_base_url, email, password });
      saveSession(tokens);
      onSession(tokens);
      onClose();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="modal-backdrop">
      <form className="auth-panel box" data-code="AUTH" onSubmit={handleSubmit}>
        <div className="auth-header">
          <strong>{mode === 'login' ? 'Portfolio Login' : 'Portfolio Register'}</strong>
          <button aria-label="Close auth panel" onClick={onClose} type="button">x</button>
        </div>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
        </label>
        {message && <p className="auth-message">{message}</p>}
        <button className="primary-btn" type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
        <button className="ghost-btn" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} type="button">
          {mode === 'login' ? 'Create account' : 'Use existing account'}
        </button>
      </form>
    </div>
  );
}
