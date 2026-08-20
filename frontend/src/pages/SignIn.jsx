import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setBusy(true);

    try {
      await signIn(name, password);
      navigate('/home');
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
          {/* Icon */}
          <div className="signin-icon">
            🎟️
          </div>

          {/* Heading */}
          <h1 className="page-title signin-title">
            WELCOME BACK
          </h1>

          <p className="page-subtitle signin-subtitle">
            Sign in to your arcade pass
          </p>

          {/* Error */}
          {error && (
            <div className="error-banner signin-error">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>

            {/* Name */}
            <div className="field">
              <label htmlFor="signin-name">
                Name
              </label>

              <input
                id="signin-name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
                disabled={busy}
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div className="field">
              <label htmlFor="signin-password">
                Password
              </label>

              <input
                id="signin-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                disabled={busy}
                autoComplete="current-password"
              />
            </div>

            {/* Sign In */}
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

          {/* Sign Up */}
          <div className="auth-switch signin-switch">
            <span>New here?</span>

            <button
              type="button"
              onClick={() =>
                navigate('/signup')
              }
              disabled={busy}
            >
              Create an account
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}