import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Splash() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/home', { replace: true });
    }
  }, [loading, user, navigate]);

  return (
    <div className="splash">
      <div className="splash-glow" />
      <div style={{ fontSize: 'clamp(40px, 10vw, 72px)' }}>🎡🎃🎟️</div>
      <h1 className="splash-title">THANKSGIVING FEST GAMES</h1>
      <p className="splash-subtitle">
        Play the stalls, rack up points, and climb the leaderboard. One ticket, endless fun.
      </p>
      <button className="btn btn-primary splash-cta" onClick={() => navigate('/signin')}>
        ▶ PRESS START
      </button>
    </div>
  );
}
