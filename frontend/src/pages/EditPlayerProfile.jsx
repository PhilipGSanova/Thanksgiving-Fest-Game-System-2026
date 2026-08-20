import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import { AVATARS, Avatar } from '../avatars';

function readPlayerSession() {
  try {
    const cached = sessionStorage.getItem('hfa_player_dashboard');
    return cached ? JSON.parse(cached) : null;
  } catch {
    sessionStorage.removeItem('hfa_player_dashboard');
    return null;
  }
}

export default function EditPlayerProfile() {
  const navigate = useNavigate();
  const session = readPlayerSession();
  const player = session?.player;
  const [name, setName] = useState(player?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatarId, setAvatarId] = useState(player?.avatarId || 'avatar_1');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSave(event) {
    event.preventDefault();
    if (!player || !session) return;

    setError('');
    setBusy(true);

    try {
      const payload = { playerId: player.playerId, currentPassword, name, avatarId };
      if (newPassword) payload.newPassword = newPassword;

      const response = await api.playerSelfUpdate(payload);
      const updatedSession = { ...session, player: response.player };
      sessionStorage.setItem('hfa_player_dashboard', JSON.stringify(updatedSession));
      navigate(`/player/${player.playerId}/dashboard`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!player) {
    return (
      <div className="page page-narrow">
        <div className="ticket empty-state">Player session not found.</div>
      </div>
    );
  }

  return (
    <div className="page page-narrow edit-profile-page">
      <div className="flex-between edit-profile-heading">
        <div>
          <h1 className="page-title">EDIT PLAYER PROFILE</h1>
          <p className="page-subtitle">Update your arcade player details.</p>
        </div>
        <button className="btn btn-outline" type="button" onClick={() => navigate(`/player/${player.playerId}/dashboard`)}>
          Cancel
        </button>
      </div>

      <div className="ticket edit-profile-card">
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSave}>
          <div className="field">
            <label htmlFor="player-profile-name">Name</label>
            <input id="player-profile-name" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>

          <div className="field">
            <label htmlFor="player-current-password">Current Password</label>
            <input
              id="player-current-password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="player-new-password">New Password (leave blank to keep current)</label>
            <input
              id="player-new-password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
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
