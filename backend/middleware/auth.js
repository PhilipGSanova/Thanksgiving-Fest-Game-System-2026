const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Stall = require('../models/Stall');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, userId, name }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// Admin access is not a stored flag on the User anymore — it's derived from
// whether the user is assigned to the system "Administrator" Stall
// (stallType: 'Admin'), which is auto-created for the very first user ever
// signed up, and can be extended to other users by assigning them to that
// stall from the Admin screen.
async function requireAdminAccess(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: 'User not found.' });

    const adminStall = await Stall.findOne({
      stallType: 'Admin',
      stallId: { $in: user.stallAssigned }
    });

    if (!adminStall) {
      return res.status(403).json({ message: 'Admin access required.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Authorization check failed.', error: err.message });
  }
}

module.exports = { requireAuth, requireAdminAccess };
