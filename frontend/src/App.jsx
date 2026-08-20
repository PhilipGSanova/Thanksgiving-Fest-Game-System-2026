import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import {
  RequireAuth,
  RequireAdmin,
  RequireGuest,
} from './components/RouteGuards';

import Splash from './pages/Splash';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import EditProfile from './pages/EditProfile';
import Admin from './pages/Admin';
import CreateStall from './pages/CreateStall';
import CreatePlayer from './pages/CreatePlayer';
import GiftCounter from './pages/GiftCounter';
import Games from './pages/Games';
import PlayerRanking from './pages/PlayerRanking';
import TransactionHistory from './pages/TransactionHistory';
import AddPoints from './pages/AddPoints';
import GiftRedeem from './pages/GiftRedeem';
import CreateItem from './pages/CreateItem';
import EditItem from './pages/EditItem';
import PlayerSignIn from './pages/PlayerSignIn';
import PlayerDashboard from './pages/PlayerDashboard';
import EditPlayerProfile from './pages/EditPlayerProfile';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user } = useAuth();
  const isJovi = user?.name?.trim().toLowerCase() === 'jovi';

  return (
    <div>
      {isJovi && (
        <div className="jovi-heartfield" aria-hidden="true">
          <span>♥</span>
          <span>♥</span>
          <span>♥</span>
          <span>♥</span>
          <span>♥</span>
          <span>♥</span>
        </div>
      )}
      <Navbar />

      <Routes>

        {/* ================= HOME / SPLASH ================= */}

        <Route
          path="/"
          element={<Splash />}
        />

        {/* ================= AUTH ================= */}

        <Route
          path="/signin"
          element={
            <RequireGuest>
              <SignIn />
            </RequireGuest>
          }
        />

        <Route
          path="/player/signin"
          element={<PlayerSignIn />}
        />

        <Route
          path="/player/:playerId/dashboard"
          element={<PlayerDashboard />}
        />

        <Route
          path="/player/edit-profile"
          element={<EditPlayerProfile />}
        />

        <Route
          path="/player/:playerId/transactions"
          element={<TransactionHistory />}
        />

        <Route
          path="/signup"
          element={
            <RequireGuest>
              <SignUp />
            </RequireGuest>
          }
        />

        {/* ================= USER PAGES ================= */}

        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />

        <Route
          path="/edit-profile"
          element={
            <RequireAuth>
              <EditProfile />
            </RequireAuth>
          }
        />

        <Route
          path="/games"
          element={
            <RequireAuth>
              <Games />
            </RequireAuth>
          }
        />

        <Route
          path="/gift-counter"
          element={
            <RequireAuth>
              <GiftCounter />
            </RequireAuth>
          }
        />

        <Route
          path="/ranking"
          element={
            <PlayerRanking />
          }
        />

        {/* ================= ADMIN ================= */}

        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <Admin />
            </RequireAdmin>
          }
        />

        {/* ================= CREATE STALL ================= */}

        <Route
          path="/admin/stalls/create"
          element={
            <RequireAdmin>
              <CreateStall />
            </RequireAdmin>
          }
        />

        {/* ================= EDIT STALL ================= */}

        <Route
          path="/admin/stalls/edit"
          element={
            <RequireAdmin>
              <CreateStall />
            </RequireAdmin>
          }
        />

        {/* ================= CREATE PLAYER ================= */}

        <Route
          path="/admin/players/create"
          element={
            <RequireAdmin>
              <CreatePlayer />
            </RequireAdmin>
          }
        />

        {/* ================= EDIT PLAYER ================= */}

        <Route
          path="/admin/players/edit"
          element={
            <RequireAdmin>
              <CreatePlayer />
            </RequireAdmin>
          }
        />

        {/* ================= ADD POINTS TO A PLAYER ================= */}
        <Route
          path="/games/add-points"
          element={
            <RequireAuth>
              <AddPoints />
            </RequireAuth>
          }
        />

        {/* ================= GIFT REDEEM ================= */}
        <Route
          path="/gift-counter/redeem"
          element={
            <RequireAuth>
              <GiftRedeem />
            </RequireAuth>
          }
        />

        {/* ================= CREATE ITEMS ================= */}
        <Route
          path="/admin/items/create"
          element={
            <RequireAdmin>
              <CreateItem />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/items/edit"
          element={
            <RequireAdmin>
              <EditItem />
            </RequireAdmin>
          }
        />
        {/* ================= INVALID ROUTE ================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </div>
  );
}