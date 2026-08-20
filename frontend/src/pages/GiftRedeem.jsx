import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import { Avatar } from '../avatars';

export default function GiftRedeem() {
    const navigate = useNavigate();
    const location = useLocation();

    const player = location.state?.player;

    const [items, setItems] = useState([]);
    const [basket, setBasket] = useState([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [busy, setBusy] = useState(false);

    /*
     * Load items
     */
    useEffect(() => {
        if (!player) {
            navigate('/gift-counter', {
                replace: true,
            });

            return;
        }

        loadItems();
    }, [player, navigate]);

    async function loadItems() {
        setLoading(true);
        setError('');

        try {
            const data = await api.listItems();
            setItems(data.items || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    /*
     * Add one item to basket
     *
     * IMPORTANT:
     * item.quantity is the redemption counter
     * stored in the database.
     *
     * It is NOT stock.
     */
    function addToBasket(item) {
        setError('');
        setSuccess('');

        const existing = basket.find(
            (entry) => entry.itemId === item._id
        );

        if (existing) {
            setBasket((current) =>
                current.map((entry) =>
                    entry.itemId === item._id
                        ? {
                            ...entry,
                            quantity: entry.quantity + 1,
                        }
                        : entry
                )
            );
        } else {
            setBasket((current) => [
                ...current,
                {
                    itemId: item._id,
                    name: item.name,
                    value: item.value,
                    quantity: 1,
                },
            ]);
        }
    }

    /*
     * Remove one item from basket
     */
    function removeFromBasket(itemId) {
        setBasket((current) => {
            const existing = current.find(
                (entry) => entry.itemId === itemId
            );

            if (!existing) {
                return current;
            }

            if (existing.quantity === 1) {
                return current.filter(
                    (entry) => entry.itemId !== itemId
                );
            }

            return current.map((entry) =>
                entry.itemId === itemId
                    ? {
                        ...entry,
                        quantity: entry.quantity - 1,
                    }
                    : entry
            );
        });
    }

    /*
     * Clear entire basket
     */
    function clearBasket() {
        setBasket([]);
        setError('');
        setSuccess('');
    }

    /*
     * Calculate total points
     */
    const totalPoints = useMemo(() => {
        return basket.reduce(
            (total, item) =>
                total + item.value * item.quantity,
            0
        );
    }, [basket]);

    /*
     * Calculate total number of items
     */
    const totalItems = useMemo(() => {
        return basket.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );
    }, [basket]);

    /*
     * Confirm complete basket
     */
    async function handleConfirm() {
        setError('');
        setSuccess('');

        if (basket.length === 0) {
            setError('Your basket is empty.');
            return;
        }

        if (totalPoints > player.totalPoints) {
            setError(
                `${player.name} only has ${player.totalPoints} points.`
            );
            return;
        }

        setBusy(true);

        try {
            /*
             * Backend will:
             *
             * 1. Deduct total points from player.
             * 2. Increase Items.quantity for each
             *    redeemed item.
             */
            await api.confirmGiftRedemption(
                player.playerId,
                basket.map((item) => ({
                    itemId: item.itemId,
                    quantity: item.quantity,
                }))
            );

            setSuccess(
                `Gift redeemed successfully! ${totalPoints} points deducted.`
            );

            setBasket([]);

            /*
             * Return to Gift Counter after 2 seconds
             */
            setTimeout(() => {
                navigate('/gift-counter', {
                    replace: true,
                });
            }, 2000);

        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    }

    /*
     * Back to Gift Counter
     */
    function handleBack() {
        navigate('/gift-counter', {
            replace: true,
        });
    }

    if (!player) {
        return null;
    }

    const activeItems = items
        .filter((item) => item.isActive)
        .sort((a, b) => a.value - b.value);

    return (
        <div className="page">

            {/* BACK */}
            <button
                className="btn btn-ghost mt-8"
                onClick={handleBack}
                disabled={busy}
            >
                ← Back to Gift Counter
            </button>

            {/* TITLE */}
            <h1 className="page-title mt-16">
                🎁 REDEEM GIFT
            </h1>

            <p className="page-subtitle">
                Select prizes for this player
            </p>

            {/* PLAYER DETAILS */}
            <div className="ticket ticket--notched player-lookup-result mt-16">

                <div className="avatar-badge lg">
                    <Avatar id={player.avatarId} />
                </div>

                <div>
                    <div
                        style={{
                            fontWeight: 700,
                            fontSize: 18,
                        }}
                    >
                        {player.name}
                    </div>

                    <div className="help-text">
                        Player ID: {player.playerId}
                    </div>

                    <div className="big-points mt-8">
                        {player.totalPoints} pts
                    </div>
                </div>

            </div>

            {/* ERROR MESSAGE */}
            {error && (
                <div className="error-banner mt-16">
                    {error}
                </div>
            )}

            {/* SUCCESS MESSAGE */}
            {success && (
                <div className="success-banner mt-16">
                    {success}

                    <div
                        style={{
                            fontSize: 12,
                            marginTop: 6,
                            opacity: 0.8,
                        }}
                    >
                        Returning to Gift Counter...
                    </div>
                </div>
            )}

            {/* CONTENT */}
            {!success && (
                <>

                    {/* ============================= */}
                    {/* AVAILABLE PRIZES              */}
                    {/* ============================= */}

                    <div className="ticket mt-16">

                        <h3
                            style={{
                                fontSize: 14,
                                color: 'var(--amber)',
                                marginBottom: 16,
                            }}
                        >
                            AVAILABLE PRIZES
                        </h3>

                        {loading ? (
                            <div className="loading-state">
                                LOADING ITEMS...
                            </div>
                        ) : activeItems.length === 0 ? (
                            <div className="empty-state">
                                No active items available.
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns:
                                        'repeat(auto-fit, minmax(140px, 1fr))',
                                    gap: 12,
                                }}
                            >

                                {activeItems.map((item) => (
                                    <button
                                        key={item._id}
                                        type="button"
                                        className="btn btn-outline"
                                        disabled={busy}
                                        onClick={() =>
                                            addToBasket(item)
                                        }
                                        style={{
                                            minHeight: 80,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 5,
                                        }}
                                    >
                                        <strong>
                                            {item.name}
                                        </strong>
                                    </button>
                                ))}

                            </div>
                        )}

                    </div>


                    {/* ============================= */}
                    {/* BASKET                        */}
                    {/* ============================= */}

                    <div className="ticket mt-16">

                        <div className="flex-between">

                            <h3
                                style={{
                                    fontSize: 14,
                                    color: 'var(--amber)',
                                }}
                            >
                                🛒 BASKET
                            </h3>

                            <span className="badge">
                                {totalItems} item
                                {totalItems !== 1 ? 's' : ''}
                            </span>

                        </div>


                        {/* EMPTY BASKET */}
                        {basket.length === 0 ? (

                            <div
                                className="empty-state"
                                style={{
                                    marginTop: 16,
                                }}
                            >
                                No items selected.
                            </div>

                        ) : (

                            <div
                                style={{
                                    marginTop: 16,
                                }}
                            >

                                {/* BASKET ITEMS */}
                                {basket.map((item) => (

                                    <div
                                        key={item.itemId}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '12px 0',
                                            borderBottom:
                                                '1px solid var(--border)',
                                        }}
                                    >

                                        {/* ITEM NAME */}
                                        <div>

                                            <div
                                                style={{
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {item.name}
                                            </div>

                                            <div className="help-text">
                                                {item.value} ×{' '}
                                                {item.quantity}
                                            </div>

                                        </div>


                                        {/* ITEM CONTROLS */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                            }}
                                        >

                                            {/* MINUS */}
                                            <button
                                                type="button"
                                                className="btn btn-outline btn-sm"
                                                onClick={() =>
                                                    removeFromBasket(
                                                        item.itemId
                                                    )
                                                }
                                                disabled={busy}
                                            >
                                                −
                                            </button>


                                            {/* QUANTITY */}
                                            <strong>
                                                {item.quantity}
                                            </strong>


                                            {/* PLUS */}
                                            <button
                                                type="button"
                                                className="btn btn-outline btn-sm"
                                                onClick={() => {

                                                    const sourceItem =
                                                        items.find(
                                                            (source) =>
                                                                source._id ===
                                                                item.itemId
                                                        );

                                                    if (sourceItem) {
                                                        addToBasket(
                                                            sourceItem
                                                        );
                                                    }

                                                }}
                                                disabled={busy}
                                            >
                                                +
                                            </button>


                                            {/* ITEM TOTAL */}
                                            <strong
                                                style={{
                                                    minWidth: 80,
                                                    textAlign: 'right',
                                                }}
                                            >
                                                {item.value *
                                                    item.quantity}{' '}
                                                pts
                                            </strong>

                                        </div>

                                    </div>

                                ))}


                                {/* TOTAL */}
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginTop: 18,
                                        fontSize: 18,
                                        fontWeight: 700,
                                    }}
                                >

                                    <span>
                                        TOTAL
                                    </span>

                                    <span>
                                        {totalPoints} points
                                    </span>

                                </div>


                                {/* ACTION BUTTONS */}
                                <div
                                    className="flex gap-12"
                                    style={{
                                        marginTop: 18,
                                    }}
                                >

                                    {/* CLEAR */}
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={clearBasket}
                                        disabled={busy}
                                    >
                                        Clear
                                    </button>


                                    {/* CONFIRM */}
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={handleConfirm}
                                        disabled={
                                            busy ||
                                            basket.length === 0 ||
                                            totalPoints >
                                            player.totalPoints
                                        }
                                    >
                                        {busy
                                            ? 'Processing...'
                                            : `Confirm (${totalPoints} pts)`}
                                    </button>

                                </div>

                            </div>

                        )}

                    </div>

                </>

            )}

        </div>
    );
}