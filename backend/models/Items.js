const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    value: {
        type: Number,
        required: true,
        min: 0,
    },

    quantity: {
        type: Number,
        default: 0,
        min: 0,
    },

    isActive: {
        type: Boolean,
        default: true,
    },
});

module.exports = mongoose.model("Item", itemSchema);