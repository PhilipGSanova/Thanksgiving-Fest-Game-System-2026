import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';

export default function CreateItem() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        value: '',
    });

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();

        setError('');

        const value = Number(form.value);

        if (!form.name.trim()) {
            setError('Item name is required.');
            return;
        }

        if (!value || value <= 0) {
            setError('Item value must be greater than 0.');
            return;
        }

        setBusy(true);

        try {
            await api.createItem({
                name: form.name.trim(),
                value,
            });

            navigate('/admin', {
                state: {
                    tab: 'items',
                    message: 'Item created successfully!',
                },
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="page">

            <button
                className="btn btn-ghost mt-8"
                onClick={() => navigate('/admin')}
            >
                ← Back to Admin
            </button>

            <h1 className="page-title mt-16">
                ➕ CREATE ITEM
            </h1>

            <p className="page-subtitle">
                Add a new prize item
            </p>

            {error && (
                <div className="error-banner mt-16">
                    {error}
                </div>
            )}

            <form
                className="ticket mt-16"
                onSubmit={handleSubmit}
                style={{ maxWidth: 480 }}
            >

                <div className="field">
                    <label>Item Name</label>

                    <input
                        type="text"
                        value={form.name}
                        placeholder="e.g. 5 Points"
                        onChange={(e) =>
                            setForm((current) => ({
                                ...current,
                                name: e.target.value,
                            }))
                        }
                        required
                    />
                </div>

                <div className="field">
                    <label>Value</label>

                    <input
                        type="number"
                        min="1"
                        value={form.value}
                        placeholder="e.g. 5"
                        onChange={(e) =>
                            setForm((current) => ({
                                ...current,
                                value: e.target.value,
                            }))
                        }
                        required
                    />

                    <span className="help-text">
                        Number of player points required to redeem
                        this item.
                    </span>
                </div>

                <div className="field">
                    <label>Initial Quantity</label>

                    <input
                        type="number"
                        value="0"
                        disabled
                    />

                    <span className="help-text">
                        Quantity starts at 0 and increases whenever
                        this item is redeemed.
                    </span>
                </div>

                <div className="field">
                    <label>Status</label>

                    <span
                        className="badge badge-game"
                        style={{
                            width: 'fit-content',
                        }}
                    >
                        Active
                    </span>

                    <span className="help-text">
                        New items are active by default.
                    </span>
                </div>

                <div className="flex gap-12">

                    <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={busy}
                    >
                        {busy
                            ? 'Creating...'
                            : 'Create Item'}
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

            </form>
        </div>
    );
}