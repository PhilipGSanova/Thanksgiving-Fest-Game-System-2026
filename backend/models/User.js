const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    avatarId: { type: String, required: true },
    name: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true }, // hashed
    stallAssigned: [{ type: String, default: [] }] // array of stallId
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);