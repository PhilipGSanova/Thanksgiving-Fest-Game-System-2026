const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Player = require('../models/Player');
const Stall = require('../models/Stall');
const TransactionHistory = require('../models/TransactionHistory');
const bcrypt = require('bcryptjs');
const { requireAuth, requireAdminAccess } = require('../middleware/auth');

const router = express.Router();

// GET /api/players (list all)
router.get('/', requireAuth, async (req, res) => {
  const players = await Player.find().sort({ totalPoints: -1 });
  res.json({ players });
});

// GET /api/players/ranking (public leaderboard)
router.get('/ranking', async (req, res) => {
  const players = await Player.find().sort({ totalPoints: -1, name: 1 });
  const ranked = players.map((p, idx) => ({
    rank: idx + 1,
    id: p._id,
    playerId: p.playerId,
    name: p.name,
    avatarId: p.avatarId,
    totalPoints: p.totalPoints
  }));
  res.json({ players: ranked });
});

// GET /api/players/lookup/:playerId  (verify a player exists - used by Gift Counter & Games screens)
router.get('/lookup/:playerId', requireAuth, async (req, res) => {
  const player = await Player.findOne({ playerId: req.params.playerId.trim() });
  if (!player) return res.status(404).json({ message: 'No player found with that Player ID.' });
  res.json({ player });
});

// POST /api/players (admin only)
router.post('/', requireAuth, requireAdminAccess, async (req, res) => {
  try {
    const { name, playerId, avatarId, password } = req.body;
    if (!name || !playerId) {
      return res.status(400).json({ message: 'Name and Player ID are required.' });
    }

    const existing = await Player.findOne({ playerId: playerId.trim() });
    if (existing) return res.status(409).json({ message: 'That Player ID is already in use.' });

    const gameStalls = await Stall.find({ stallType: 'Game' });
    const gameScores = {};
    gameStalls.forEach((s) => {
      gameScores[s.name] = 0;
    });

    const rawPassword = password || 'welcome';
    const hashed = await bcrypt.hash(rawPassword, 10);

    const player = await Player.create({
      playerId: playerId.trim(),
      name: name.trim(),
      avatarId: avatarId || 'avatar_1',
      password: hashed,
      totalPoints: 0,
      gameScores
    });

    res.status(201).json({ player });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create player.', error: err.message });
  }
});

// PUT /api/players/:id  (admin only - edit name & playerId)
router.put('/:id', requireAuth, requireAdminAccess, async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ message: 'Player not found.' });

    const { name, playerId, password } = req.body;
    if (playerId && playerId.trim() !== player.playerId) {
      const dup = await Player.findOne({ playerId: playerId.trim(), _id: { $ne: player._id } });
      if (dup) return res.status(409).json({ message: 'That Player ID is already in use.' });
      player.playerId = playerId.trim();
    }
    if (name) player.name = name.trim();
    if (password) {
      player.password = await bcrypt.hash(password, 10);
    }

    await player.save();
    res.json({ player });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update player.', error: err.message });
  }
});

// DELETE /api/players/:id (admin only)
router.delete('/:id', requireAuth, requireAdminAccess, async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ message: 'Player not found.' });
    await player.deleteOne();
    res.json({ message: 'Player deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete player.', error: err.message });
  }
});

// POST /api/players/:playerId/deduct  (Gift Counter screen)
router.post('/:playerId/deduct', requireAuth, async (req, res) => {
  try {
    const { points } = req.body;
    const amount = Number(points);
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Enter a positive number of points to deduct.' });
    }

    const player = await Player.findOne({ playerId: req.params.playerId.trim() });
    if (!player) return res.status(404).json({ message: 'Player not found.' });

    const deducted = Math.min(amount, player.totalPoints);
    player.totalPoints = Math.max(0, player.totalPoints - amount);
    await player.save();

    // Attempt to associate with a Gift Counter stall if available
    let stall = await Stall.findOne({ stallType: 'Gift Counter' });
    const stallId = stall ? stall.stallId : null;

    await TransactionHistory.create({
      playerId: player.playerId,
      stallId,
      points: -deducted
    });

    res.json({ player });
  } catch (err) {
    res.status(500).json({ message: 'Failed to deduct points.', error: err.message });
  }
});

// POST /api/players/:playerId/add-points  (Games screen)
router.post('/:playerId/add-points', requireAuth, async (req, res) => {
  try {
    const { points, stallName } = req.body;
    const amount = Number(points);
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Enter a positive number of points to add.' });
    }
    if (!stallName) {
      return res.status(400).json({ message: 'Game stall name is required.' });
    }

    const player = await Player.findOne({ playerId: req.params.playerId.trim() });
    if (!player) return res.status(404).json({ message: 'Player not found.' });

    const current = player.gameScores.get(stallName) || 0;
    player.gameScores.set(stallName, current + amount);
    player.totalPoints = player.totalPoints + amount;
    await player.save();

    // Record transaction history
    const stall = await Stall.findOne({ name: stallName });
    const stallId = stall ? stall.stallId : null;
    await TransactionHistory.create({
      playerId: player.playerId,
      stallId,
      points: amount
    });

    res.json({ player });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add points.', error: err.message });
  }
});

module.exports = router;
// -----------------------------
// Player public signin / dashboard
// -----------------------------

// POST /api/players/signin
router.post('/signin', async (req, res) => {
  try {
    const { playerId, password } = req.body;
    if (!playerId || !password) return res.status(400).json({ message: 'Player ID and password required.' });

    const player = await Player.findOne({ playerId: playerId.trim() });
    if (!player) return res.status(404).json({ message: 'Player not found.' });

    const ok = await bcrypt.compare(password, player.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials.' });

    // transactions (most recent 50)
    const transactions = await TransactionHistory.find({ playerId: player.playerId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // ranking (all players sorted)
    const players = await Player.find().sort({ totalPoints: -1, name: 1 }).lean();
    const ranking = players.map((p, idx) => ({ rank: idx + 1, playerId: p.playerId, name: p.name, totalPoints: p.totalPoints }));

    // points breakdown by game stalls (exclude Gift Counter)
    const breakdown = await TransactionHistory.aggregate([
      { $match: { playerId: player.playerId } },
      { $lookup: { from: 'stalls', localField: 'stallId', foreignField: 'stallId', as: 'stall' } },
      { $unwind: { path: '$stall', preserveNullAndEmptyArrays: true } },
      { $match: { 'stall.stallType': { $ne: 'Gift Counter' } } },
      { $group: { _id: '$stall.name', points: { $sum: '$points' } } },
      { $sort: { points: -1 } }
    ]);

    res.json({ player: { playerId: player.playerId, name: player.name, avatarId: player.avatarId, totalPoints: player.totalPoints }, transactions, ranking, breakdown });
  } catch (err) {
    res.status(500).json({ message: 'Signin failed.', error: err.message });
  }
});

// GET /api/players/:playerId/dashboard
router.get('/:playerId/dashboard', async (req, res) => {
  try {
    const player = await Player.findOne({ playerId: req.params.playerId.trim() });
    if (!player) return res.status(404).json({ message: 'Player not found.' });

    const transactions = await TransactionHistory.find({ playerId: player.playerId }).sort({ createdAt: -1 }).limit(200).lean();
    const stallIds = transactions.map((transaction) => transaction.stallId).filter(Boolean);
    const stalls = await Stall.find({ stallId: { $in: stallIds } }).select('stallId name').lean();
    const stallNames = new Map(stalls.map((stall) => [stall.stallId, stall.name]));
    const transactionsWithStallNames = transactions.map((transaction) => ({
      ...transaction,
      stallName: stallNames.get(transaction.stallId) || null,
    }));
    const players = await Player.find().sort({ totalPoints: -1, name: 1 }).lean();
    const ranking = players.map((p, idx) => ({ rank: idx + 1, playerId: p.playerId, name: p.name, totalPoints: p.totalPoints }));

    const breakdown = await TransactionHistory.aggregate([
      { $match: { playerId: player.playerId } },
      { $lookup: { from: 'stalls', localField: 'stallId', foreignField: 'stallId', as: 'stall' } },
      { $unwind: { path: '$stall', preserveNullAndEmptyArrays: true } },
      { $match: { 'stall.stallType': { $ne: 'Gift Counter' } } },
      { $group: { _id: '$stall.name', points: { $sum: '$points' } } },
      { $sort: { points: -1 } }
    ]);

    res.json({ player: { playerId: player.playerId, name: player.name, avatarId: player.avatarId, totalPoints: player.totalPoints }, transactions: transactionsWithStallNames, ranking, breakdown });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load dashboard.', error: err.message });
  }
});

// GET /api/players/:playerId/transactions (paginated transaction history)
router.get('/:playerId/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const player = await Player.findOne({ playerId: req.params.playerId.trim() });
    if (!player) return res.status(404).json({ message: 'Player not found.' });

    const pageNum = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Math.min(50, Number(limit) || 10));
    const total = await TransactionHistory.countDocuments({ playerId: player.playerId });
    const transactions = await TransactionHistory.find({ playerId: player.playerId })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .lean();
    const stallIds = transactions.map((transaction) => transaction.stallId).filter(Boolean);
    const stalls = await Stall.find({ stallId: { $in: stallIds } }).select('stallId name').lean();
    const stallNames = new Map(stalls.map((stall) => [stall.stallId, stall.name]));
    const transactionsWithStallNames = transactions.map((transaction) => ({
      ...transaction,
      stallName: stallNames.get(transaction.stallId) || null,
    }));

    res.json({
      transactions: transactionsWithStallNames,
      page: pageNum,
      limit: pageSize,
      total,
      hasMore: pageNum * pageSize < total,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load transaction history.', error: err.message });
  }
});

// POST /api/players/self-update
router.post('/self-update', async (req, res) => {
  try {
    const { playerId, currentPassword, name, newPassword, avatarId } = req.body;
    if (!playerId || !currentPassword) return res.status(400).json({ message: 'Player ID and current password required.' });

    const player = await Player.findOne({ playerId: playerId.trim() });
    if (!player) return res.status(404).json({ message: 'Player not found.' });

    const ok = await bcrypt.compare(currentPassword, player.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials.' });

    if (name) player.name = name.trim();
    if (avatarId) player.avatarId = avatarId;
    if (newPassword) player.password = await bcrypt.hash(newPassword, 10);

    await player.save();

    res.json({ player: { playerId: player.playerId, name: player.name, avatarId: player.avatarId, totalPoints: player.totalPoints } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile.', error: err.message });
  }
});

