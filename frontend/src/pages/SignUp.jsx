import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AVATARS, Avatar } from '../avatars';

export default function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [avatarId, setAvatarId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!avatarId) {
      setError('Pick an avatar to continue.');
      return;
    }
    setBusy(true);
    try {
      await signUp({ name, password, avatarId });
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="marquee-frame" style={{ maxWidth: 460, width: '100%' }}>
        <div className="ticket auth-card">
          <div className="auth-header">
            <div style={{ fontSize: 36 }}>🎫</div>
            <h1 className="page-title" style={{ fontSize: 16, marginTop: 10 }}>
              GET YOUR PASS
            </h1>
            <p className="page-subtitle" style={{ marginBottom: 0 }}>
              Create an account to run the fest
            </p>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Choose an avatar</label>
              <div className="avatar-grid">
                {Object.entries(AVATARS).map(([id]) => (
                  <button
                    type="button"
                    key={id}
                    className={`avatar-option${avatarId === id ? ' selected' : ''}`}
                    onClick={() => setAvatarId(id)}
                    aria-label={id}
                  >
                    <Avatar id={id} />
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
              {busy ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="auth-switch">
            Already have a pass? <button onClick={() => navigate('/signin')}>Sign in</button>
          </div>
        </div>
      </div>
    </div>
  );
}
