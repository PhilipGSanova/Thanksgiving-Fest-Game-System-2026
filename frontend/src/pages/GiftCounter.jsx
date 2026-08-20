import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';

export default function GiftCounter() {
  const navigate = useNavigate();

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

    setBusy(true);

    try {
      // Verify player
      const data = await api.lookupPlayer(playerId.trim());

      // Player verified → go to Gift Redemption page
      navigate('/gift-counter/redeem', {
        state: {
          player: data.player,
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page gift-counter-page">
      <button
        className="btn btn-ghost mt-8"
        onClick={() => navigate('/home')}
      >
        ← Back to Home
      </button>

      <h1 className="page-title mt-16">
        🎁 GIFT COUNTER
      </h1>

      <p className="page-subtitle">
        Look up a player and redeem points for a gift
      </p>

      {error && (
        <div className="error-banner mt-16">
          {error}
        </div>
      )}

      <form
        className="ticket gift-counter-form mt-16"
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