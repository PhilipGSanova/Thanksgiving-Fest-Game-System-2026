const express = require('express');

const Item = require('../models/Items');
const { requireAuth, requireAdminAccess } = require('../middleware/auth');

const router = express.Router();


// ============================================================
// GET /api/items
// List all items
// ============================================================

router.get('/', requireAuth, async (req, res) => {
    try {
        const items = await Item.find().sort({
            createdAt: -1,
        });

        res.json({ items });
    } catch (err) {
        console.error('Failed to load items:', err);

        res.status(500).json({
            message: 'Failed to load items.',
            error: err.message,
        });
    }
});


// ============================================================
// POST /api/items
// Create a new item - Admin only
// ============================================================

router.post(
    '/',
    requireAuth,
    requireAdminAccess,
    async (req, res) => {
        try {
            const {
                name,
                value,
            } = req.body;

            // -----------------------------
            // Validate name
            // -----------------------------

            if (!name || !name.trim()) {
                return res.status(400).json({
                    message: 'Item name is required.',
                });
            }


            // -----------------------------
            // Validate value
            // -----------------------------

            const itemValue = Number(value);

            if (!itemValue || itemValue <= 0) {
                return res.status(400).json({
                    message: 'Item value must be greater than 0.',
                });
            }


            // -----------------------------
            // Check duplicate item name
            // -----------------------------

            const existing = await Item.findOne({
                name: name.trim(),
            });

            if (existing) {
                return res.status(409).json({
                    message:
                        'An item with that name already exists.',
                });
            }


            // -----------------------------
            // Create item
            // -----------------------------
            //
            // quantity starts at 0
            // isActive starts as true
            //

            const item = await Item.create({
                name: name.trim(),
                value: itemValue,
                quantity: 0,
                isActive: true,
            });


            // -----------------------------
            // Return created item
            // -----------------------------

            res.status(201).json({
                message: 'Item created successfully.',
                item,
            });

        } catch (err) {
            console.error('Failed to create item:', err);

            res.status(500).json({
                message: 'Failed to create item.',
                error: err.message,
            });
        }
    }
);

// ============================================================
// PUT /api/items/:id
// Update item - Admin only
// ============================================================

router.put(
    '/:id',
    requireAuth,
    requireAdminAccess,
    async (req, res) => {
        try {
            const { isActive } = req.body;

            if (typeof isActive !== 'boolean') {
                return res.status(400).json({
                    message:
                        'isActive must be true or false.',
                });
            }

            const item = await Item.findById(
                req.params.id
            );

            if (!item) {
                return res.status(404).json({
                    message: 'Item not found.',
                });
            }

            // Only change isActive.
            // Name, value and quantity remain unchanged.
            item.isActive = isActive;

            await item.save();

            res.json({
                message: 'Item updated successfully.',
                item,
            });

        } catch (err) {
            console.error(
                'Failed to update item:',
                err
            );

            res.status(500).json({
                message: 'Failed to update item.',
                error: err.message,
            });
        }
    }
);

module.exports = router;