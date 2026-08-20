const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Stall = require('../models/Stall');
const User = require('../models/User');
const Player = require('../models/Player');
const { requireAuth, requireAdminAccess } = require('../middleware/auth');

const router = express.Router();

// GET /api/stalls  (list all - any signed in user)
router.get('/', requireAuth, async (req, res) => {
  const stalls = await Stall.find().sort({ createdAt: -1 });
  res.json({ stalls });
});

// POST /api/stalls  (admin only)
router.post('/', requireAuth, requireAdminAccess, async (req, res) => {
  try {
    const { name, stallType, userAssigned = [] } = req.body;
    if (!name || !stallType) {
      return res.status(400).json({ message: 'Name and stall type are required.' });
    }
    if (!['Game', 'Gift Counter'].includes(stallType)) {
      return res.status(400).json({ message: "Stall type must be 'Game' or 'Gift Counter'." });
    }

    const existing = await Stall.findOne({ name: name.trim() });
    if (existing) return res.status(409).json({ message: 'A stall with that name already exists.' });

    const stall = await Stall.create({
      stallId: `STL-${uuidv4().slice(0, 8).toUpperCase()}`,
      name: name.trim(),
      stallType,
      userAssigned
    });

    // Keep Users.stallAssigned in sync
    if (userAssigned.length) {
      await User.updateMany(
        { userId: { $in: userAssigned } },
        { $addToSet: { stallAssigned: stall.stallId } }
      );
    }

    // Dynamic column: every Game stall becomes a key on every Player, default 0
    if (stallType === 'Game') {
      await Player.updateMany(
        {},
        { $set: { [`gameScores.${stall.name}`]: 0 } }
      );
    }

    res.status(201).json({ stall });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create stall.', error: err.message });
  }
});

// PUT /api/stalls/:id  (admin only - edit name, stallType, userAssigned)
router.put('/:id', requireAuth, requireAdminAccess, async (req, res) => {
  try {
    const stall = await Stall.findById(req.params.id);
    if (!stall) return res.status(404).json({ message: 'Stall not found.' });

    const { name, stallType, userAssigned } = req.body;
    const oldName = stall.name;
    const oldType = stall.stallType;
    const oldAssigned = stall.userAssigned || [];

    if (name && name.trim() !== stall.name) {
      const dup = await Stall.findOne({ name: name.trim(), _id: { $ne: stall._id } });
      if (dup) return res.status(409).json({ message: 'A stall with that name already exists.' });
      stall.name = name.trim();
    }
    if (stallType && ['Game', 'Gift Counter'].includes(stallType)) {
      stall.stallType = stallType;
    }
    if (Array.isArray(userAssigned)) {
      stall.userAssigned = userAssigned;
    }

    await stall.save();

    // Sync user.stallAssigned: remove stall from users no longer assigned, add to new ones
    const removed = oldAssigned.filter((u) => !stall.userAssigned.includes(u));
    const added = stall.userAssigned.filter((u) => !oldAssigned.includes(u));
    if (removed.length) {
      await User.updateMany({ userId: { $in: removed } }, { $pull: { stallAssigned: stall.stallId } });
    }
    if (added.length) {
      await User.updateMany({ userId: { $in: added } }, { $addToSet: { stallAssigned: stall.stallId } });
    }

    // Sync dynamic Player column if the stall's name changed or its type changed
    const nameChanged = oldName !== stall.name;
    const typeChanged = oldType !== stall.stallType;

    if (typeChanged && stall.stallType === 'Game') {
      // became a Game stall: add column
      await Player.updateMany({}, { $set: { [`gameScores.${stall.name}`]: 0 } });
    } else if (typeChanged && oldType === 'Game') {
      // stopped being a Game stall: remove column
      await Player.updateMany({}, { $unset: { [`gameScores.${oldName}`]: '' } });
    } else if (nameChanged && stall.stallType === 'Game') {
      // rename column, keep values
      const players = await Player.find({ [`gameScores.${oldName}`]: { $exists: true } });
      for (const p of players) {
        const val = p.gameScores.get(oldName) || 0;
        p.gameScores.delete(oldName);
        p.gameScores.set(stall.name, val);
        await p.save();
      }
    }

    res.json({ stall });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update stall.', error: err.message });
  }
});

// DELETE /api/stalls/:id  (admin only)
router.delete('/:id', requireAuth, requireAdminAccess, async (req, res) => {
  try {
    const stall = await Stall.findById(req.params.id);
    if (!stall) return res.status(404).json({ message: 'Stall not found.' });

    if (stall.stallType === 'Admin') {
      return res.status(400).json({ message: 'The Administrator stall cannot be deleted.' });
    }

    await User.updateMany(
      { userId: { $in: stall.userAssigned } },
      { $pull: { stallAssigned: stall.stallId } }
    );

    if (stall.stallType === 'Game') {
      await Player.updateMany({}, { $unset: { [`gameScores.${stall.name}`]: '' } });
    }

    await stall.deleteOne();
    res.json({ message: 'Stall deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete stall.', error: err.message });
  }
});

module.exports = router;
