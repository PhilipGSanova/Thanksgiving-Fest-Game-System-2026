const mongoose = require('mongoose');

// MongoDB collections are schema-flexible, so the "one column per Game stall"
// requirement is implemented with a Map field. Every time a Stall with
// stallType = 'Game' is created, its `name` is added as a key to this map
// (default 0) on every existing Player, and every newly created Player gets
// a key for every Game stall that already exists. This achieves the same
// end result as a dynamic column while staying queryable and indexable.
const PlayerSchema = new mongoose.Schema(
  {
    playerId: { type: String, required: true, unique: true },
    avatarId: { type: String, default: 'avatar_1' },
    name: { type: String, required: true, trim: true },
    password: { type: String, default: 'welcome' },
    totalPoints: { type: Number, default: 0 },
    gameScores: {
      type: Map,
      of: { type: Number, default: 0 },
      default: {}
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Player', PlayerSchema);
