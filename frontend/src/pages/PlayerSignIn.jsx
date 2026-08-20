import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';

export default function PlayerSignIn() {
  const [playerId, setPlayerId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.removeItem('hfa_player_dashboard');
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setBusy(true);

    try {
      const data = await api.playerSignIn(
        playerId.trim(),
        password
      );

      // Store player dashboard data
      sessionStorage.setItem(
        'hfa_player_dashboard',
        JSON.stringify(data)
      );

      navigate(
        `/player/${encodeURIComponent(
          playerId.trim()
        )
        }/dashboard`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="marquee-frame signin-card">
        <div className="ticket auth-card">
          <div className="signin-icon">
            🎟️
          </div>

          <h1 className="page-title signin-title">
            PLAYER SIGN IN
          </h1>

          <p className="page-subtitle signin-subtitle">
            Sign in to your player dashboard
          </p>

          {error && (
            <div className="error-banner signin-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="player-signin-id">
                Player ID
              </label>
              <input
                id="player-signin-id"
                type="text"
                placeholder="e.g. P-1001"
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                required
                disabled={busy}
                autoComplete="username"
              />
            </div>

            <div className="field">
              <label htmlFor="player-signin-password">
                Password
              </label>
              <input
                id="player-signin-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={busy}
                autoComplete="current-password"
              />
            </div>

            <button
              className="btn btn-primary btn-block signin-button"
              type="submit"
              disabled={busy}
            >
              {busy
                ? 'Signing In...'
                : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
