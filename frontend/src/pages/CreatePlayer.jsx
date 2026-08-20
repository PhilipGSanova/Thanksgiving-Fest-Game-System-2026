import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/api';

const EMPTY_FORM = {
    name: '',
    playerId: '',
    password: 'welcome'
};

export default function CreatePlayer() {
    const navigate = useNavigate();
    const location = useLocation();

    const editingPlayer = location.state?.player || null;

    const [form, setForm] = useState(
        editingPlayer
            ? {
                name: editingPlayer.name,
                playerId: editingPlayer.playerId,
            }
            : EMPTY_FORM
    );

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const isEditing = Boolean(editingPlayer);

    async function handleSubmit(e) {
        e.preventDefault();

        setError('');
        setBusy(true);

        try {
            if (isEditing) {
                await api.updatePlayer(
                    editingPlayer._id,
                    form
                );
            } else {
                await api.createPlayer(form);
            }

            navigate('/admin', {
                state: {
                    tab: 'players',
                    message: isEditing
                        ? 'Player updated successfully!'
                        : 'Player created successfully!',
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
                {isEditing
                    ? '✏️ EDIT PLAYER'
                    : '➕ CREATE PLAYER'}
            </h1>

            <p className="page-subtitle">
                {isEditing
                    ? 'Update player information'
                    : 'Add a new player to the fest'}
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
                    <label>Player Name</label>

                    <input
                        value={form.name}
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                name: e.target.value,
                            }))
                        }
                        placeholder="Enter player name"
                        required
                    />
                </div>

                <div className="field">
                    <label>Player ID</label>

                    <input
                        value={form.playerId}
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                playerId: e.target.value,
                            }))
                        }
                        placeholder="e.g. P-1001"
                        required
                    />
                </div>

                <div className="flex gap-12">
                    <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={busy}
                    >
                        {busy
                            ? 'Saving...'
                            : isEditing
                                ? 'Save Changes'
                                : 'Create Player'}
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => navigate('/admin')}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}