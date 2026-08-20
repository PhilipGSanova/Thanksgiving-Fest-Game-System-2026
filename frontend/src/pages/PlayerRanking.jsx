import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/api';
import { Avatar } from '../avatars';

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function PlayerRanking() {
  const [players, setPlayers] = useState([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const PAGE_SIZE = 10;

  const filteredPlayers = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) => (p.name || '').toLowerCase().includes(q) || (p.playerId || '').toLowerCase().includes(q));
  }, [players, query]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredPlayers.length / PAGE_SIZE)), [filteredPlayers]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredPlayers.slice(start, start + PAGE_SIZE);
  }, [filteredPlayers, page]);

  async function load() {
    setLoading(true);
    try {
      const data = await api.ranking();
      setPlayers(data.players);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000); // auto-refresh leaderboard
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page page-narrow">
      <div className="flex-between">
        <div>
          <h1 className="page-title">🏆 PLAYER RANKINGS</h1>
          <p className="page-subtitle">Live leaderboard, updated as points come in</p>
        </div>
        <div className="flex gap-12" style={{ alignItems: 'right' }}>
          <input
            className="field"
            placeholder="Search name or player ID"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            style={{
              padding: '8px 12px',
              minWidth: 220,
              background: 'transparent',
              border: '1px solid #ccc', // optional, keeps it visible
              color: '#fff'             // adjust text color for contrast
            }}
          />
          <button className="btn btn-outline btn-sm" onClick={load}>
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">LOADING SCORES...</div>
      ) : players.length === 0 ? (
        <div className="ticket empty-state">
          <div style={{ fontSize: 34, marginBottom: 10 }}>🏆</div>
          No players yet. Check back once the fest kicks off!
        </div>
      ) : (
        <div>
          <div className="rank-list">
            {pageItems.map((p) => (
              <div key={p.id} className={`rank-row${p.rank <= 3 ? ` top-${p.rank}` : ''}`}>
                <div className="rank-number">{MEDAL[p.rank] || `#${p.rank}`}</div>
                <div className="avatar-badge sm"><Avatar id={p.avatarId} /></div>
                <div className="rank-name">
                  <div className="name">{p.name}</div>
                  <div className="pid">{p.playerId}</div>
                </div>
                <div className="rank-points">{p.totalPoints} pts</div>
              </div>
            ))}
          </div>

          <div className="flex gap-12" style={{ justifyContent: 'center', marginTop: 18 }}>
            <button className="btn btn-outline btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </button>
            <div className="help-text" style={{ alignSelf: 'center' }}>
              Page {page} of {totalPages}
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
