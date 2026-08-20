import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/api';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

export default function PlayerDashboard() {
  const { playerId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(() => {
    const cached = sessionStorage.getItem('hfa_player_dashboard');
    return cached ? JSON.parse(cached) : null;
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      setBusy(true);
      setError('');

      try {
        const res = await api.playerDashboard(playerId);
        setData(res);
        sessionStorage.setItem('hfa_player_dashboard', JSON.stringify(res));
      } catch (err) {
        setError(err.message);
      } finally {
        setBusy(false);
      }
    }

    load();
  }, [playerId]);

  if (!data) {
    return (
      <div className="page">
        <div className="marquee-frame mt-8" style={{ maxWidth: 900, width: '100%' }}>
          {busy ? 'Loading...' : error || 'No data.'}
        </div>
      </div>
    );
  }

  const breakdown = data.breakdown || [];
  const ranking = data.ranking || [];
  const recentTransactions = (data.transactions || []).slice(0, 5);
  const currentRank = ranking.findIndex((r) => r.playerId === data.player.playerId) + 1;

  const chartData = {
    labels: breakdown.map((b) => b._id || 'Unknown'),
    datasets: [
      {
        data: breakdown.map((b) => Math.max(0, b.points)),
        backgroundColor: ['#4dc9f6', '#f67019', '#f53794', '#537bc4', '#acc236', '#166a8f'],
      },
    ],
  };

  return (
    <div className="page">
      <div className="flex-between player-dashboard-heading">
        <div>
          <h1 className="page-title">WELCOME {data.player.name}</h1>
          <p className="page-subtitle">
            You can view your points, ranking, transaction history and stall analytics.
          </p>
        </div>

      </div>

      <div className="grid grid-cols-auto mt-24 player-dashboard-grid">
        <div className="stall-card dashboard-card">
          <div className="dashboard-card-header">Total Points</div>
          <div className="hero-number">{data.player.totalPoints || 0}</div>
          <div className="help-text muted">Keep stacking points across games to rise higher.</div>
        </div>

        <div className="stall-card dashboard-card">
          <div className="dashboard-card-header">Current Rank</div>
          <div className="hero-number">{currentRank > 0 ? `#${currentRank}` : '-'}</div>
          <div className="help-text muted">Top 5 leaderboard access is one tap away.</div>
        </div>
      </div>

      <div className="grid grid-cols-auto mt-16 player-dashboard-grid">
        {breakdown.length > 0 && (
          <div className="stall-card dashboard-card">
            <div className="dashboard-card-header">Points by Stall</div>
            <Pie data={chartData} />
          </div>
        )}

        <button
          type="button"
          className="stall-card stall-card-btn dashboard-card leaderboard-card"
          onClick={() => navigate('/ranking')}
        >
          <div className="dashboard-card-header">
            Leaderboard
          </div>

          <div className="leaderboard-table">

            {/* Table Header */}
            <div className="leaderboard-row leaderboard-header">
              <span>Rank</span>
              <span>Player</span>
              <span>Points</span>
            </div>

            {/* Players */}
            {ranking.slice(0, 5).map((r, index) => (
              <div
                key={r.playerId}
                className="leaderboard-row"
              >
                <span className="leaderboard-rank">
                  {index + 1}
                </span>

                <strong className="leaderboard-player">
                  {r.name}
                </strong>

                <strong className="leaderboard-score">
                  {r.totalPoints}
                </strong>
              </div>
            ))}

          </div>

          <div
            className="help-text muted"
            style={{ marginTop: 12 }}
          >
            Tap to view the full ranking board.
          </div>
        </button>
      </div>

      <button
        type="button"
        className="stall-card stall-card-btn dashboard-card transaction-preview-card"
        onClick={() => navigate(`/player/${playerId}/transactions`)}
      >
        <div className="dashboard-card-header">Transaction History</div>
        {recentTransactions.length === 0 ? (
          <div className="help-text muted">No transactions yet.</div>
        ) : (
          <div className="transaction-preview-list">
            {recentTransactions.map((transaction) => (
              <div className="transaction-preview-row" key={transaction._id}>
                <div>
                  <strong>{transaction.stallName || transaction.stallId || 'Unknown stall'}</strong>
                  <div className="help-text">{new Date(transaction.createdAt).toLocaleDateString()}</div>
                </div>
                <strong
                  className={`transaction-value ${
                    transaction.points > 0 ? 'positive' : transaction.points < 0 ? 'negative' : ''
                  }`}
                >
                  {transaction.points > 0 ? `+${transaction.points}` : transaction.points}
                </strong>
              </div>
            ))}
          </div>
        )}
        <div className="help-text muted transaction-preview-footer">Tap to view full transaction history.</div>
      </button>

    </div>
  );
}


