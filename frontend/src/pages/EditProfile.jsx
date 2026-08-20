import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AVATARS, Avatar } from '../avatars';

export default function EditProfile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [avatarId, setAvatarId] = useState(user?.avatarId || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSave(event) {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      const payload = { name, avatarId };
      if (password) payload.password = password;
      await updateProfile(payload);
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page page-narrow edit-profile-page">
      <div className="flex-between edit-profile-heading">
        <div>
          <h1 className="page-title">EDIT PROFILE</h1>
          <p className="page-subtitle">Update your arcade profile details.</p>
        </div>
        <button className="btn btn-outline" type="button" onClick={() => navigate('/home')}>
          Cancel
        </button>
      </div>

      <div className="ticket edit-profile-card">
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSave}>
          <div className="field">
            <label htmlFor="profile-name">Name</label>
            <input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>

          <div className="field">
            <label htmlFor="profile-password">New Password (leave blank to keep current)</label>
            <input
              id="profile-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div className="field">
            <label>Avatar</label>
            <div className="avatar-grid">
              {Object.entries(AVATARS).map(([id]) => (
                <button
                  type="button"
                  key={id}
                  className={`avatar-option${avatarId === id ? ' selected' : ''}`}
                  onClick={() => setAvatarId(id)}
                  aria-label={`Select ${id} avatar`}
                  aria-pressed={avatarId === id}
                >
                  <Avatar id={id} />
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary edit-profile-save" type="submit" disabled={busy}>
            {busy ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
