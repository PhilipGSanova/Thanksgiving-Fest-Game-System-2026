const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Stall = require('../models/Stall');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user._id, userId: user.userId, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    userId: user.userId,
    avatarId: user.avatarId,
    name: user.name,
    stallAssigned: user.stallAssigned
  };
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, password, avatarId } = req.body;
    if (!name || !password || !avatarId) {
      return res.status(400).json({ message: 'Name, password and avatar are required.' });
    }

    const existing = await User.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ message: 'That name is already taken.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const isFirstUser = (await User.countDocuments()) === 0;

    const user = await User.create({
      userId: `USR-${uuidv4().slice(0, 8).toUpperCase()}`,
      name: name.trim(),
      password: hashed,
      avatarId,
      stallAssigned: []
    });

    // The very first account ever created automatically gets an
    // "Administrator" stall (stallType: 'Admin') created for them, and is
    // assigned to it — this is what gives them access to the Admin screen.
    // Anyone else can be granted admin access later by being assigned to
    // this same stall from the Admin screen.
    if (isFirstUser) {
      const adminStall = await Stall.create({
        stallId: `STL-${uuidv4().slice(0, 8).toUpperCase()}`,
        name: 'Administrator',
        stallType: 'Admin',
        userAssigned: [user.userId]
      });
      user.stallAssigned = [adminStall.stallId];
      await user.save();
    }

    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Sign up failed.', error: err.message });
  }
});

// POST /api/auth/signin
router.post('/signin', async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).json({ message: 'Name and password are required.' });
    }

    const user = await User.findOne({ name: name.trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid name or password.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid name or password.' });
    }

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Sign in failed.', error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  const stalls = await Stall.find({ stallId: { $in: user.stallAssigned } });
  res.json({ user: publicUser(user), stalls });
});

// PUT /api/auth/me  (edit name, password, avatar)
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { name, password, avatarId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (name && name.trim() !== user.name) {
      const dup = await User.findOne({ name: name.trim(), _id: { $ne: user._id } });
      if (dup) return res.status(409).json({ message: 'That name is already taken.' });
      user.name = name.trim();
    }
    if (avatarId) user.avatarId = avatarId;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Update failed.', error: err.message });
  }
});

module.exports = router;
