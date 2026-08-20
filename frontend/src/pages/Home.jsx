import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STALL_ICON = { Admin: '🛠️', Game: '🎮', 'Gift Counter': '🎁' };

export default function Home() {
  const { user, stalls, refresh } = useAuth();
  const navigate = useNavigate();
  const isJovi = user?.name?.trim().toLowerCase() === 'jovi';

  useEffect(() => {
    refresh();
  }, [refresh]);

  function goToStall(stall) {
    if (stall.stallType === 'Admin') navigate('/admin');
    else if (stall.stallType === 'Game') navigate('/games', { state: { stallId: stall._id } });
    else if (stall.stallType === 'Gift Counter') navigate('/gift-counter');
  }
  return (
    <div className="page">
      {isJovi && (
        <h1 className="page-title mt-24" style={{ fontSize: 20 }}>
          WELCOME DARLING
        </h1>
      )}
      <h2 className="page-title mt-24" style={{ fontSize: 15 }}>
        YOUR STALLS
      </h2>
      <p className="page-subtitle">Tap a stall to open it</p>

      {stalls.length === 0 ? (
        <div className="ticket empty-state">
          <div style={{ fontSize: 34, marginBottom: 10 }}>🎪</div>
          No stalls assigned yet. Check with an admin to get set up!
        </div>
      ) : (
        <div className="grid grid-cols-auto home-stalls">
          {stalls.map((s) => (
            <button className="stall-card stall-card-btn" key={s._id} onClick={() => goToStall(s)}>
              <span
                className={`badge ${
                  s.stallType === 'Game' ? 'badge-game' : s.stallType === 'Admin' ? 'badge-admin' : 'badge-gift'
                }`}
              >
                {STALL_ICON[s.stallType]} {s.stallType}
              </span>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{s.name}</div>
              <div className="help-text">Stall ID: {s.stallId}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
