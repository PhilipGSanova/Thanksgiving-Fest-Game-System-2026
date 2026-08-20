import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/api';

const PAGE_SIZE = 10;

export default function TransactionHistory() {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await api.playerTransactions(playerId, page, PAGE_SIZE);
        setTransactions(data.transactions || []);
        setHasMore(data.hasMore || false);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [playerId, page]);

  const pageLabel = useMemo(() => `Page ${page}`, [page]);

  return (
    <div className="page">
      <div className="flex-between">
        <div>
          <h1 className="page-title">TRANSACTION HISTORY</h1>
          <p className="page-subtitle">Browse the last 10 records for your account.</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading history...</div>
      ) : (
        <div className="ticket mt-16">
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <div className="help-text">Showing {transactions.length} record{transactions.length === 1 ? '' : 's'}</div>
            <div className="help-text">{pageLabel}</div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Stall</th>
                <th className="amount">Points</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id}>
                  <td>{new Date(t.createdAt).toLocaleString()}</td>
                  <td>{t.stallName || t.stallId || '—'}</td>
                  <td className={`transaction-value ${t.points > 0 ? 'positive' : t.points < 0 ? 'negative' : ''}`}>
                    {t.points > 0 ? `+${t.points}` : t.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex gap-12" style={{ marginTop: 18, justifyContent: 'flex-end' }}>
            <button className="btn btn-outline btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => setPage((p) => p + 1)} disabled={!hasMore}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
