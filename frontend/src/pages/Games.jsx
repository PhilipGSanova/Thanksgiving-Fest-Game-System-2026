import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/api';

export default function Games() {
  const { stalls } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const gameStalls = useMemo(
    () => stalls.filter((s) => s.stallType === 'Game'),
    [stalls]
  );

  const preselectedId = location.state?.stallId;

  const [activeStallId, setActiveStallId] = useState(
    (
      preselectedId &&
        gameStalls.some((s) => s._id === preselectedId)
        ? preselectedId
        : gameStalls[0]?._id
    ) || ''
  );

  const activeStall =
    gameStalls.find((s) => s._id === activeStallId) ||
    gameStalls[0];

  const [playerId, setPlayerId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleLookup(e) {
    e.preventDefault();

    setError('');

    if (!playerId.trim()) {
      setError('Enter a Player ID.');
      return;
    }

    if (!activeStall) {
      setError('No game stall selected.');
      return;
    }

    setBusy(true);

    try {
      // Verify player first
      const data = await api.lookupPlayer(playerId.trim());

      // Player verified → navigate to Add Points screen
      navigate('/games/add-points', {
        state: {
          player: data.player,
          stall: activeStall,
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (gameStalls.length === 0) {
    return (
      <div className="page">
        <button
          className="btn btn-ghost mt-8"
          onClick={() => navigate('/home')}
        >
          ← Back to Home
        </button>

        <h1 className="page-title mt-16">🎮 GAMES</h1>

        <div className="ticket mt-16">
          <div
            style={{
              fontSize: 34,
              marginBottom: 10,
            }}
          >
            🎮
          </div>

          <div>
            You aren't assigned to any Game stalls yet.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <button
        className="btn btn-ghost mt-8"
        onClick={() => navigate('/home')}
      >
        ← Back to Home
      </button>

      <h1 className="page-title mt-16">
        🎮 {activeStall?.name?.toUpperCase()}
      </h1>

      <p className="page-subtitle">
        Add points for players at this game stall
      </p>



      {error && (
        <div className="error-banner mt-16">
          {error}
        </div>
      )}

      <form
        className="ticket mt-16"
        onSubmit={handleLookup}
      >
        <div className="field">
          <label>Player ID</label>

          <input
            placeholder="Enter Player ID"
            value={playerId}
            onChange={(e) =>
              setPlayerId(e.target.value)
            }
            autoFocus
          />
        </div>

        <button
          className="btn btn-primary btn-block"
          type="submit"
          disabled={busy}
        >
          {busy ? 'Checking...' : 'Find Player'}
        </button>
      </form>
    </div>
  );
}