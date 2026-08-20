const mongoose = require('mongoose');

const TransactionHistorySchema = new mongoose.Schema(
  {
    playerId: { type: String, required: true },
    stallId: { type: String, default: null },
    points: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TransactionHistory', TransactionHistorySchema);
