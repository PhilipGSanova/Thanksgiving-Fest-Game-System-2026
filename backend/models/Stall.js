const mongoose = require('mongoose');

const StallSchema = new mongoose.Schema(
  {
    stallId: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true, trim: true },
    stallType: { type: String, required: true, enum: ['Game', 'Gift Counter', 'Admin'] },
    userAssigned: [{ type: String, default: [] }] // array of userId
  },
  { timestamps: true }
);

module.exports = mongoose.model('Stall', StallSchema);
