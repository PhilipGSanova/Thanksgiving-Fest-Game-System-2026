const express = require('express');

const Player = require('../models/Player');
const Item = require('../models/Items');
const Stall = require('../models/Stall');
const TransactionHistory = require('../models/TransactionHistory');

const { requireAuth } = require('../middleware/auth');

const router = express.Router();


// POST /api/gift-counter/redeem
router.post('/redeem', requireAuth, async (req, res) => {
    try {
        const { playerId, items } = req.body;

        // -----------------------------
        // Validate request
        // -----------------------------

        if (!playerId) {
            return res.status(400).json({
                message: 'Player ID is required.',
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: 'Basket is empty.',
            });
        }


        // -----------------------------
        // Find player
        // -----------------------------

        const player = await Player.findOne({ playerId });

        if (!player) {
            return res.status(404).json({
                message: 'Player not found.',
            });
        }


        // -----------------------------
        // Calculate total points
        // -----------------------------

        let totalPoints = 0;

        const itemUpdates = [];

        for (const basketItem of items) {
            if (!basketItem.itemId) {
                return res.status(400).json({
                    message: 'Invalid item in basket.',
                });
            }

            const quantity = Number(basketItem.quantity);

            if (!quantity || quantity <= 0) {
                return res.status(400).json({
                    message: 'Invalid item quantity.',
                });
            }

            const item = await Item.findById(
                basketItem.itemId
            );

            if (!item) {
                return res.status(404).json({
                    message: 'One of the selected items was not found.',
                });
            }

            // Only active items can be redeemed
            if (!item.isActive) {
                return res.status(400).json({
                    message: `${item.name} is currently inactive.`,
                });
            }

            totalPoints += item.value * quantity;

            itemUpdates.push({
                item,
                quantity,
            });
        }


        // -----------------------------
        // Check player's points
        // -----------------------------

        if (player.totalPoints < totalPoints) {
            return res.status(400).json({
                message:
                    `${player.name} only has ` +
                    `${player.totalPoints} points. ` +
                    `Basket requires ${totalPoints} points.`,
            });
        }


        // -----------------------------
        // Deduct player points
        // -----------------------------

        player.totalPoints -= totalPoints;

        await player.save();

                // Record transaction history for the deduction (associate with a Gift Counter stall if available)
                const stall = await Stall.findOne({ stallType: 'Gift Counter' });
                const stallId = stall ? stall.stallId : null;
                await TransactionHistory.create({
                    playerId: player.playerId,
                    stallId,
                    points: -totalPoints
                });


        // -----------------------------
        // Update Items.quantity
        // -----------------------------
        //
        // IMPORTANT:
        //
        // quantity means NUMBER OF TIMES
        // THE ITEM HAS BEEN REDEEMED.
        //
        // Therefore:
        //
        // old quantity + redeemed quantity
        //

        for (const update of itemUpdates) {
            update.item.quantity += update.quantity;

            await update.item.save();
        }


        // -----------------------------
        // Success
        // -----------------------------

        res.json({
            message: 'Gift redeemed successfully.',
            player,
            totalPoints,
            items,
        });

    } catch (err) {
        console.error(
            'Gift redemption error:',
            err
        );

        res.status(500).json({
            message: 'Failed to redeem gift.',
            error: err.message,
        });
    }
});


module.exports = router;