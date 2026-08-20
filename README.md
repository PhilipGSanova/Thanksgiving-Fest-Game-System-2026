# Harvest Fest Arcade 🎃🎟️

A full-stack points/leaderboard system for a harvest-fest arcade: stall staff sign in,
add points to players at Game stalls, deduct points at the Gift Counter, and everyone
can watch the live leaderboard. Built with **React + Vite** on the frontend and
**Node/Express + MongoDB (Mongoose)** on the backend.

```
harvest-fest-arcade/
├── backend/     Express API + MongoDB models
└── frontend/    React (Vite) single-page app
```

## 1. Prerequisites

- Node.js 18+
- A MongoDB instance (local `mongod`, or a free MongoDB Atlas cluster)

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI to your MongoDB connection string
# and JWT_SECRET to a long random string
npm run dev        # nodemon, or `npm start` for plain node
```

The API runs on `http://localhost:5000` by default. Health check: `GET /api/health`.

## 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173` and proxies `/api/*` to `http://localhost:5000`
(see `vite.config.js`). Open that URL in your browser.

## 4. Becoming an admin

There's no `isAdmin` flag anywhere anymore. Admin access is just stall assignment:

- **The very first account ever created** automatically gets a system stall called
  **"Administrator"** (`stallType: "Admin"`) created for them, and is assigned to it.
- Anyone else can be granted admin access later by an existing admin assigning them to
  the "Administrator" stall from the **Admin → Stalls** tab (Edit → check their name
  under "Assign Users").

Everyone signs in and lands on **Home**, which shows a button for every stall in their
`stallAssigned` list. Tapping a stall routes based on its `stallType`:

- `Admin` → Admin screen
- `Game` → Games screen (for that specific game)
- `Gift Counter` → Gift Counter screen

The Administrator stall can't be deleted (the backend blocks it), so there's always at
least one way back into the Admin screen.

## 5. How the data model works

### Users
`id, userId, avatarId, name, password (hashed with bcrypt), stallAssigned[]`

### Stalls
`id, stallId, name, stallType ("Game" | "Gift Counter" | "Admin"), userAssigned[]` — the
`"Admin"` type is only ever created automatically for the first user; the Admin screen's
"Create Stall" form only offers `"Game"` and `"Gift Counter"`.

### Players
`id, playerId, avatarId, name, totalPoints` — **plus a dynamic points column per Game
stall.** MongoDB collections don't have fixed columns, so this is implemented with a
Mongoose `Map` field called `gameScores`. Every time an admin creates a Stall with
`stallType: "Game"`, that stall's name is added as a key (default `0`) to every existing
Player document, and every new Player created afterwards is seeded with a `0` entry for
every Game stall that already exists — which is exactly the "new column per Game stall"
behavior described in the brief, just implemented the way MongoDB actually supports it.
Renaming or deleting a Game stall renames/removes that key across all players too.

## 6. Screens

| Screen | Route | Notes |
|---|---|---|
| Splash | `/` | Animated marquee title, redirects signed-in users automatically |
| Sign In | `/signin` | Name + password |
| Sign Up | `/signup` | Name + password + avatar picker |
| Home | `/home` | Welcome banner, edit profile, and one button per assigned stall (routes based on `stallType`) |
| Admin | `/admin` | Reached only via the "Administrator" stall — create/edit/delete Stalls & Players |
| Games | `/games` | Reached via a Game stall button — look up a player, add points |
| Gift Counter | `/gift-counter` | Reached via a Gift Counter stall button — look up a player, deduct points |
| Player Ranking | `/ranking` | Live leaderboard — route still exists but isn't linked from anywhere yet |

There's no top nav bar with tabs anymore — the navbar just shows the brand (click to go
Home), your avatar/name, and Sign Out. Admin, Games, and Gift Counter each have a
"← Back to Home" button since they're reached through stall buttons rather than tabs.

## 7. Design

The UI leans into the "harvest fest at night" arcade feel: a deep plum/night sky
background, a pixel "Press Start 2P" display face for titles and scores paired with
Space Grotesk for body text, glowing marquee-light gradient borders, and scalloped
"ticket stub" cards for player look-ups. Everything is built with fluid CSS (`clamp()`,
`grid`, flex-wrap) so it holds up from a phone in portrait up through a laptop screen.

## 8. Notes / assumptions

- `isAdmin` was added to the User model since the brief needed some way to route users
  to the Admin screen vs. Home after sign-in — see §4/§6 above.
- Passwords are hashed with bcrypt before being stored; a JWT is issued on sign in/up
  and stored in `localStorage` on the frontend.
- Avatars are a curated emoji set (`frontend/src/avatars.js`) rather than uploaded
  images, to keep the "choose an avatar" flow simple — easy to swap for real image
  uploads later if you want.
- Gift Counter deductions are clamped at 0 (can't go negative) and Games/Gift Counter
  screens both re-verify the player exists via `GET /api/players/lookup/:playerId`
  before allowing points to change.
