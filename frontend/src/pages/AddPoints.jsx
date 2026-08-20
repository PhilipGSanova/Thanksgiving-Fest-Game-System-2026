import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import { Avatar } from '../avatars';

export default function AddPoints() {
    const navigate = useNavigate();
    const location = useLocation();

    const player = location.state?.player;
    const stall = location.state?.stall;

    const [points, setPoints] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!player || !stall) {
            navigate('/games', { replace: true });
        }
    }, [player, stall, navigate]);

    async function handleAddPoints(e) {
        e.preventDefault();

        setError('');
        setSuccess('');

        const amount = Number(points);

        if (!amount || amount <= 0) {
            setError('Enter a positive number of points.');
            return;
        }

        if (!player || !stall) {
            setError('Player or stall information is missing.');
            return;
        }

        setBusy(true);

        try {
            const data = await api.addPoints(
                player.playerId,
                amount,
                stall.name
            );

            setSuccess(
                `+${amount} points added to ${data.player.name}!`
            );

            setPoints('');

            setTimeout(() => {
                navigate('/games', {
                    replace: true,
                    state: {
                        stallId: stall._id,
                    },
                });
            }, 2000);
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    }

    function handleBack() {
        navigate('/games', {
            replace: true,
            state: {
                stallId: stall?._id,
            },
        });
    }

    if (!player || !stall) {
        return null;
    }

    return (
        <div className="page">
            <button
                className="btn btn-ghost mt-8"
                onClick={handleBack}
            >
                ← Back to Games
            </button>

            <h1 className="page-title mt-16">
                🎯 ADD POINTS
            </h1>

            <p className="page-subtitle">
                {stall.name}
            </p>

            {error && (
                <div className="error-banner mt-16">
                    {error}
                </div>
            )}

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
                        Returning to Games...
                    </div>
                </div>
            )}

            {/* VERIFIED PLAYER */}
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
                        {player.totalPoints} pts total
                    </div>
                </div>
            </div>

            {/* ADD POINTS */}
            {!success && (
                <form
                    className="ticket mt-16"
                    onSubmit={handleAddPoints}
                >
                    <div className="field">
                        <label>Points to Add</label>

                        <input
                            type="number"
                            min="1"
                            placeholder="e.g. 10"
                            value={points}
                            onChange={(e) =>
                                setPoints(e.target.value)
                            }
                            autoFocus
                            disabled={busy}
                        />
                    </div>

                    <div className="flex gap-12">
                        <button
                            className="btn btn-leaf"
                            type="submit"
                            disabled={busy}
                        >
                            {busy ? 'Adding...' : '+ Add Points'}
                        </button>

                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={handleBack}
                            disabled={busy}
                        >
                            Back
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}