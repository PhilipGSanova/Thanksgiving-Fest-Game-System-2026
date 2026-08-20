import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../avatars';

function readPlayerSession() {
  try {
    const cached = sessionStorage.getItem('hfa_player_dashboard');
    return cached ? JSON.parse(cached) : null;
  } catch {
    sessionStorage.removeItem('hfa_player_dashboard');
    return null;
  }
}

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [playerData, setPlayerData] = useState(() => readPlayerSession());

  const isPlayerRoute = location.pathname.startsWith('/player/');
  const isPlayerSignIn = location.pathname === '/player/signin';
  const profile = user || (isPlayerRoute && !isPlayerSignIn ? playerData?.player : null);
  const isPlayer = !user && Boolean(playerData?.player) && isPlayerRoute && !isPlayerSignIn;

  useEffect(() => {
    setPlayerData(readPlayerSession());
    setProfileOpen(false);
  }, [location.pathname, user]);

  if (!profile || isPlayerSignIn) return null;

  function handleSignOut() {
    if (isPlayer) {
      sessionStorage.removeItem('hfa_player_dashboard');
      navigate('/player/signin');
    } else {
      signOut();
      navigate('/signin');
    }
  }

  function openEditProfile() {
    setProfileOpen(false);
    if (isPlayer) {
      navigate('/player/edit-profile');
    } else {
      navigate('/edit-profile');
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <button
          className="brand"
          style={{ background: 'none', border: 'none', padding: 0 }}
          onClick={() => navigate('/home')}
        >
          <span className="brand-dot" />
          THANKSGIVING FEST GAMES
        </button>

        <div className="nav-user">
          <div className="nav-user-info">
            <button
              className="nav-avatar-trigger"
              type="button"
              onClick={() => setProfileOpen(true)}
              aria-label="Open profile"
              aria-expanded={profileOpen}
            >
              <div className="avatar-badge sm"><Avatar id={profile.avatarId} /></div>
            </button>
            <span className="text-muted" style={{ fontSize: 13 }}>
              {profile.name}
            </span>
          </div>
        </div>
      </div>

      {profileOpen && (
        <>
          <button
            className="profile-panel-backdrop"
            type="button"
            aria-label="Close profile panel"
            onClick={() => setProfileOpen(false)}
          />
          <aside className="profile-panel" aria-label="Profile panel">
            <div className="profile-panel-header">
              <h2>PROFILE</h2>
            </div>
            <div className="profile-panel-identity">
              <div className="avatar-badge lg"><Avatar id={profile.avatarId} /></div>
              <div>
                <h3>{profile.name}</h3>
                <div className="help-text">ID: {profile.userId || profile.playerId}</div>
              </div>
            </div>
            <button className="btn btn-primary profile-panel-edit" type="button" onClick={openEditProfile}>
              Edit Profile
            </button>
            <button className="btn btn-danger profile-panel-signout" type="button" onClick={handleSignOut}>
              Sign Out
            </button>
          </aside>
        </>
      )}
    </nav>
  );
}
