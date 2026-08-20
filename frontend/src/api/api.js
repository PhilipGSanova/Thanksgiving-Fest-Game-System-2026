const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('hfa_token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    /* no body */
  }

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong. Please try again.');
  }
  return data;
}

export const api = {
  // auth
  signIn: (name, password) => request('/auth/signin', { method: 'POST', body: { name, password }, auth: false }),
  signUp: (payload) => request('/auth/signup', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),
  updateMe: (payload) => request('/auth/me', { method: 'PUT', body: payload }),

  // stalls
  listStalls: () => request('/stalls'),
  createStall: (payload) => request('/stalls', { method: 'POST', body: payload }),
  updateStall: (id, payload) => request(`/stalls/${id}`, { method: 'PUT', body: payload }),
  deleteStall: (id) => request(`/stalls/${id}`, { method: 'DELETE' }),

  // players
  listPlayers: () => request('/players'),
  ranking: () => request('/players/ranking', { auth: false }),
  lookupPlayer: (playerId) => request(`/players/lookup/${encodeURIComponent(playerId)}`),
  createPlayer: (payload) => request('/players', { method: 'POST', body: payload }),
  updatePlayer: (id, payload) => request(`/players/${id}`, { method: 'PUT', body: payload }),
  deletePlayer: (id) => request(`/players/${id}`, { method: 'DELETE' }),
  deductPoints: (playerId, points) =>
    request(`/players/${encodeURIComponent(playerId)}/deduct`, { method: 'POST', body: { points } }),
  addPoints: (playerId, points, stallName) =>
    request(`/players/${encodeURIComponent(playerId)}/add-points`, {
      method: 'POST',
      body: { points, stallName }
    }),

  // player public signin/dashboard
  playerSignIn: (playerId, password) => request('/players/signin', { method: 'POST', body: { playerId, password }, auth: false }),
  playerDashboard: (playerId) => request(`/players/${encodeURIComponent(playerId)}/dashboard`, { method: 'GET', auth: false }),
  playerTransactions: (playerId, page = 1, limit = 10) => request(`/players/${encodeURIComponent(playerId)}/transactions?${new URLSearchParams({ page, limit })}`, { method: 'GET', auth: false }),
  playerSelfUpdate: (payload) => request('/players/self-update', { method: 'POST', body: payload, auth: false }),

  // users
  listUsers: () => request('/users'),

  // items / prizes
  listItems: () => request('/items'),

  createItem: (payload) =>
    request('/items', {
      method: 'POST',
      body: payload
    }),

  updateItem: (id, payload) =>
    request(`/items/${id}`, {
      method: 'PUT',
      body: payload
    }),

  confirmGiftRedemption: (playerId, items) =>
    request('/gift-counter/redeem', {
      method: 'POST',
      body: {
        playerId,
        items
      }
    })
};
