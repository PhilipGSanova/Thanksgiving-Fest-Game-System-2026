import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/api';

export default function EditItem() {
    const navigate = useNavigate();
    const location = useLocation();

    const item = location.state?.item;

    const [isActive, setIsActive] = useState(
        item?.isActive ?? true
    );

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!item) {
        return (
            <div className="page">
                <button
                    className="btn btn-ghost mt-8"
                    onClick={() => navigate('/admin')}
                >
                    ← Back to Admin
                </button>

                <div className="error-banner mt-16">
                    Item information was not found.
                </div>
            </div>
        );
    }

    async function handleSave() {
        setError('');
        setSuccess('');
        setBusy(true);

        try {
            await api.updateItem(item._id, {
                isActive,
            });

            setSuccess(
                `Item "${item.name}" updated successfully.`
            );

            setTimeout(() => {
                navigate('/admin', {
                    replace: true,
                    state: {
                        tab: 'items',
                    },
                });
            }, 1000);

        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    }

    return (
        <div className="page">

            {/* BACK */}
            <button
                className="btn btn-ghost mt-8"
                onClick={() => navigate('/admin')}
                disabled={busy}
            >
                ← Back to Items
            </button>

            {/* TITLE */}
            <h1 className="page-title mt-16">
                ✏️ EDIT ITEM
            </h1>

            <p className="page-subtitle">
                Manage item availability
            </p>

            {/* ERROR */}
            {error && (
                <div className="error-banner mt-16">
                    {error}
                </div>
            )}

            {/* SUCCESS */}
            {success && (
                <div className="success-banner mt-16">
                    {success}
                </div>
            )}

            <div
                className="ticket mt-16"
                style={{ maxWidth: 500 }}
            >

                {/* ITEM NAME */}
                <div className="field">
                    <label>Item Name</label>

                    <input
                        type="text"
                        value={item.name}
                        disabled
                    />
                </div>

                {/* VALUE */}
                <div className="field">
                    <label>Value</label>

                    <input
                        type="text"
                        value={`${item.value}`}
                        disabled
                    />
                </div>

                {/* QUANTITY */}
                <div className="field">
                    <label>Redeemed Quantity</label>

                    <input
                        type="text"
                        value={item.quantity}
                        disabled
                    />

                    <span className="help-text">
                        This value records how many times this item
                        has been redeemed.
                    </span>
                </div>

                {/* ACTIVE TOGGLE */}
                <div className="field">

                    <label>Item Status</label>

                    <button
                        type="button"
                        className={
                            isActive
                                ? 'btn btn-leaf'
                                : 'btn btn-outline'
                        }
                        onClick={() =>
                            setIsActive((current) => !current)
                        }
                        disabled={busy}
                        style={{
                            minWidth: 150,
                        }}
                    >
                        {isActive
                            ? '✓ Active'
                            : '✕ Inactive'}
                    </button>

                    <span className="help-text">
                        {isActive
                            ? 'This item will be available for players to redeem.'
                            : 'This item will not be shown to players.'}
                    </span>

                </div>

                {/* ACTIONS */}
                <div className="flex gap-12 mt-16">

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={busy}
                    >
                        {busy
                            ? 'Saving...'
                            : 'Save Changes'}
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => navigate('/admin')}
                        disabled={busy}
                    >
                        Cancel
                    </button>

                </div>

            </div>

        </div>
    );
}