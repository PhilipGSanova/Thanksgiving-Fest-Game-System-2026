import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import { Avatar } from '../avatars';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = {
    name: '',
    stallType: 'Game',
    userAssigned: [],
};

export default function CreateStall() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const editingStall = location.state?.stall || null;

    const [users, setUsers] = useState([]);
    const [form, setForm] = useState(
        editingStall
            ? {
                name: editingStall.name,
                stallType: editingStall.stallType,
                userAssigned: editingStall.userAssigned || [],
            }
            : EMPTY_FORM
    );

    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const isEditing = Boolean(editingStall);

    useEffect(() => {
        async function loadUsers() {
            try {
                const data = await api.listUsers();
                setUsers(data.users);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadUsers();
    }, []);

    function toggleUser(userId) {
        setForm((current) => ({
            ...current,

            userAssigned: current.userAssigned.includes(userId)
                ? current.userAssigned.filter(
                    (id) => id !== userId
                )
                : [...current.userAssigned, userId],
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setError('');
        setBusy(true);

        try {
            if (isEditing) {
                await api.updateStall(
                    editingStall._id,
                    form
                );
            } else {
                await api.createStall(form);
            }

            // Go back to Admin after successful creation/update
            navigate('/admin', {
                state: {
                    tab: 'stalls',
                    message: isEditing
                        ? 'Stall updated successfully!'
                        : 'Stall created successfully!',
                },
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="page create-stall-page">
            <div className="create-stall-shell">
                <header className="create-stall-header">
                    <div className="create-stall-brand">
                        <span className="brand-dot" />
                        <span>HARVEST FEST ARCADE</span>
                    </div>

                    <div className="create-stall-user">
                        <span className="avatar-badge sm"><Avatar id={user?.avatarId || 'avatar_1'} /></span>
                        <span>{user?.name || 'Admin'}</span>
                    </div>
                </header>

                <button
                    className="btn btn-ghost create-stall-back"
                    onClick={() => navigate('/admin')}
                >
                    ← Back to Admin
                </button>

                <h1 className="page-title create-stall-title">
                    {isEditing
                        ? '✏️ EDIT STALL'
                        : 'CREATE STALL'}
                </h1>

                <p className="page-subtitle create-stall-subtitle">
                    {isEditing
                        ? 'Update the stall details'
                        : 'Create a new fest stall'}
                </p>

                {error && (
                    <div className="error-banner mt-16">
                        {error}
                    </div>
                )}

                <form
                    className="ticket create-stall-form"
                    onSubmit={handleSubmit}
                >
                    <div className="field">
                        <label>Stall Name</label>

                        <input
                            value={form.name}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    name: e.target.value,
                                }))
                            }
                            placeholder="Enter stall name"
                            required
                        />
                    </div>

                    <div className="field">
                        <label>Stall Type</label>

                        {form.stallType === 'Admin' ? (
                            <>
                                <span
                                    className="badge badge-admin"
                                    style={{ width: 'fit-content' }}
                                >
                                    Admin
                                </span>

                                <span className="help-text">
                                    This is the system Administrator stall.
                                </span>
                            </>
                        ) : (
                            <select
                                value={form.stallType}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        stallType: e.target.value,
                                    }))
                                }
                            >
                                <option value="Game">Game</option>
                                <option value="Gift Counter">
                                    Gift Counter
                                </option>
                            </select>
                        )}
                    </div>

                    <div className="field create-stall-assignment">
                        <label>Assign Users</label>

                        <div className="checkbox-list create-stall-user-list">
                            {loading ? (
                                <span className="help-text">
                                    Loading users...
                                </span>
                            ) : users.length === 0 ? (
                                <span className="help-text">
                                    No users yet.
                                </span>
                            ) : (
                                users.map((userItem) => (
                                    <label
                                        className="checkbox-row create-stall-user-row"
                                        key={userItem.userId}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={form.userAssigned.includes(
                                                userItem.userId
                                            )}
                                            onChange={() =>
                                                toggleUser(userItem.userId)
                                            }
                                        />

                                        <span className="create-stall-user-avatar">
                                            <Avatar id={userItem.avatarId} />
                                        </span>

                                        <span className="create-stall-user-name">
                                            {userItem.name}
                                        </span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex gap-12 create-stall-actions">
                        <button
                            className="btn btn-primary btn-block"
                            type="submit"
                            disabled={busy || loading}
                        >
                            {busy
                                ? 'Saving...'
                                : isEditing
                                    ? 'Save Changes'
                                    : 'Create Stall'}
                        </button>
                    </div>

                    <button
                        type="button"
                        className="btn btn-ghost create-stall-cancel"
                        onClick={() => navigate('/admin')}
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
}