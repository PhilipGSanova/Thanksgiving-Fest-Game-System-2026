const express = require('express');
const User = require('../models/User');
const { requireAuth, requireAdminAccess } = require('../middleware/auth');

const router = express.Router();

// GET /api/users (admin only - used to assign stalls to users)
router.get('/', requireAuth, requireAdminAccess, async (req, res) => {
  const users = await User.find().select('-password').sort({ name: 1 });
  res.json({ users });
});

module.exports = router;
