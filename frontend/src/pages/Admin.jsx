import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import { Avatar } from '../avatars';

const ADMIN_PAGE_SIZE = 10;

function Pagination({ currentPage, totalItems, onPageChange }) {
  const totalPages = Math.ceil(totalItems / ADMIN_PAGE_SIZE);

  if (totalPages <= 1) return null;

  return (
    <div className="admin-pagination" aria-label="Pagination">
      <button
        className="btn btn-outline btn-sm"
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>

      <span className="admin-pagination-status">
        Page {currentPage} of {totalPages}
      </span>

      <button
        className="btn btn-outline btn-sm"
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('stalls');
  const navigate = useNavigate();

  return (
    <div className="page admin-page">
      <button
        className="btn btn-ghost mt-8"
        onClick={() => navigate('/home')}
      >
        ← Back to Home
      </button>

      <h1 className="page-title mt-16">🛠️ ADMIN CONTROL BOOTH</h1>
      <p className="page-subtitle">
        Manage stalls and players for the fest
      </p>

      <div className="admin-tabs" role="tablist">
        <button
          className={`nav-tab${tab === 'stalls' ? ' active' : ''}`}
          onClick={() => setTab('stalls')}
        >
          Stalls
        </button>

        <button
          className={`nav-tab${tab === 'players' ? ' active' : ''}`}
          onClick={() => setTab('players')}
        >
          Players
        </button>

        <button
          className={`nav-tab${tab === 'items' ? ' active' : ''}`}
          onClick={() => setTab('items')}
        >
          Items
        </button>
      </div>

      {tab === 'stalls' ? (
        <StallsPanel />
      ) : tab === 'players' ? (
        <PlayersPanel />
      ) : (
        <ItemsPanel />
      )}
    </div>
  );
}


/* ============================== STALLS ============================== */

function StallsPanel() {
  const [stalls, setStalls] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  async function loadAll() {
    setLoading(true);
    setError('');

    try {
      const [stallData, userData] = await Promise.all([
        api.listStalls(),
        api.listUsers(),
      ]);

      setStalls(stallData.stalls);
      setUsers(userData.users);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function openEdit(stall) {
    navigate('/admin/stalls/edit', {
      state: {
        stall,
        users,
      },
    });
  }

  async function handleDelete(stall) {
    if (
      !window.confirm(
        `Delete stall "${stall.name}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setError('');

    try {
      await api.deleteStall(stall._id);
      setSuccess('Stall deleted.');
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  function userName(userId) {
    return (
      users.find((u) => u.userId === userId)?.name || userId
    );
  }

  const visibleStalls = stalls.slice(
    (currentPage - 1) * ADMIN_PAGE_SIZE,
    currentPage * ADMIN_PAGE_SIZE
  );

  return (
    <div>
      <div className="flex-between admin-panel-toolbar mt-16">
        <h2 style={{ fontSize: 14, color: 'var(--amber)' }}>
          ALL STALLS
        </h2>

        <button
          className="btn btn-primary btn-sm admin-toolbar-action"
          onClick={() => navigate('/admin/stalls/create')}
        >
          + Create Stall
        </button>
      </div>

      {error && (
        <div className="error-banner mt-16">
          {error}
        </div>
      )}

      {success && (
        <div className="success-banner mt-16">
          {success}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          LOADING...
        </div>
      ) : stalls.length === 0 ? (
        <div className="ticket empty-state mt-16">
          No stalls yet. Create one to get started!
        </div>
      ) : (
        <div
          className="ticket mt-16"
          style={{ overflowX: 'auto' }}
        >
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Assigned</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {visibleStalls.map((s) => (
                <tr key={s._id}>
                  <td style={{ fontWeight: 600 }}>
                    {s.name}
                  </td>

                  <td>
                    <span
                      className={`badge ${s.stallType === 'Game'
                        ? 'badge-game'
                        : s.stallType === 'Admin'
                          ? 'badge-admin'
                          : 'badge-gift'
                        }`}
                    >
                      {s.stallType}
                    </span>
                  </td>

                  <td className="text-muted">
                    {s.userAssigned?.length
                      ? s.userAssigned.map(userName).join(', ')
                      : '—'}
                  </td>

                  <td>
                    <div className="flex gap-8 admin-row-actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => openEdit(s)}
                      >
                        Edit
                      </button>

                      {s.stallType !== 'Admin' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(s)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalItems={stalls.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}


/* ============================== PLAYERS ============================== */

function PlayersPanel() {
  const [players, setPlayers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  const navigate = useNavigate();

  async function loadAll() {
    setLoading(true);
    setError('');

    try {
      const data = await api.listPlayers();
      setPlayers(data.players);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function openEdit(player) {
    navigate('/admin/players/edit', {
      state: {
        player,
      },
    });
  }

  async function handleDelete(player) {
    if (
      !window.confirm(
        `Delete player "${player.name}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setError('');

    try {
      await api.deletePlayer(player._id);
      setSuccess('Player deleted.');
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  // Search by Player ID OR Player Name
  const filteredPlayers = players.filter((player) => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return true;
    }

    const playerName = String(player.name || '').toLowerCase();
    const playerId = String(player.playerId || '').toLowerCase();

    return (
      playerName.includes(searchText) ||
      playerId.includes(searchText)
    );
  });

  const visiblePlayers = filteredPlayers.slice(
    (currentPage - 1) * ADMIN_PAGE_SIZE,
    currentPage * ADMIN_PAGE_SIZE
  );

  return (
    <div>
      <div className="flex-between admin-panel-toolbar mt-16">
        <h2 style={{ fontSize: 14, color: 'var(--amber)' }}>
          ALL PLAYERS
        </h2>

        <button
          className="btn btn-primary btn-sm admin-toolbar-action"
          onClick={() => navigate('/admin/players/create')}
        >
          + Create Player
        </button>
      </div>

      {/* SEARCH PLAYER */}
      <div className="ticket mt-16 admin-search-card">
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Search Player</label>

          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by Player ID or Player Name..."
          />
        </div>
      </div>

      {search && (
        <div className="text-muted mt-16">
          Showing {filteredPlayers.length} player
          {filteredPlayers.length !== 1 ? 's' : ''} matching "
          {search}"
        </div>
      )}

      {error && (
        <div className="error-banner mt-16">
          {error}
        </div>
      )}

      {success && (
        <div className="success-banner mt-16">
          {success}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          LOADING...
        </div>
      ) : players.length === 0 ? (
        <div className="ticket empty-state mt-16">
          No players yet. Create one to get started!
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="ticket empty-state mt-16">
          No players found for "{search}".
        </div>
      ) : (
        <div
          className="ticket mt-16"
          style={{ overflowX: 'auto' }}
        >
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Player ID</th>
                <th>Total Points</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {visiblePlayers.map((p) => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 600 }}>
                    <span className="admin-player-name"><Avatar id={p.avatarId} /> {p.name}</span>
                  </td>

                  <td className="text-muted">
                    {p.playerId}
                  </td>

                  <td>
                    {p.totalPoints}
                  </td>

                  <td>
                    <div className="flex gap-8 admin-row-actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => openEdit(p)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(p)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredPlayers.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}

/* ============================== ITEMS ============================== */

function ItemsPanel() {
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  async function loadItems() {
    setLoading(true);
    setError('');

    try {
      const data = await api.listItems();
      setItems(data.items || []);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  function openEdit(item) {
    navigate('/admin/items/edit', {
      state: {
        item,
      },
    });
  }

  const visibleItems = items.slice(
    (currentPage - 1) * ADMIN_PAGE_SIZE,
    currentPage * ADMIN_PAGE_SIZE
  );

  return (
    <div>
      <div className="flex-between admin-panel-toolbar mt-16">
        <h2
          style={{
            fontSize: 14,
            color: 'var(--amber)',
          }}
        >
          ALL ITEMS
        </h2>

        <button
          className="btn btn-primary btn-sm admin-toolbar-action"
          onClick={() => navigate('/admin/items/create')}
        >
          + Create Item
        </button>
      </div>

      {error && (
        <div className="error-banner mt-16">
          {error}
        </div>
      )}

      {success && (
        <div className="success-banner mt-16">
          {success}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          LOADING...
        </div>
      ) : items.length === 0 ? (
        <div className="ticket empty-state mt-16">
          No items yet. Create one to get started!
        </div>
      ) : (
        <div
          className="ticket mt-16"
          style={{ overflowX: 'auto' }}
        >
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Value</th>
                <th>Quantity</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {visibleItems.map((item) => (
                <tr key={item._id}>
                  <td
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    {item.name}
                  </td>

                  <td>
                    {item.value}
                  </td>

                  <td>
                    {item.quantity}
                  </td>

                  <td>
                    <span
                      className={`badge ${item.isActive
                        ? 'badge-game'
                        : 'badge-admin'
                        }`}
                    >
                      {item.isActive
                        ? 'Active'
                        : 'Inactive'}
                    </span>
                  </td>

                  <td>
                    <div className="flex gap-8 admin-row-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(item)}>Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalItems={items.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}