## SlotSwapper

A lightweight app to manage your calendar slots and swap them with others in real time. Create events, mark them swappable, browse others’ swappable slots, and send/respond to swap requests. Auth uses JWT (httpOnly cookies) and realtime updates are via Socket.IO.


## Live Demo & Deployment

- **[View Deployed App](https://slot-swapper-blue.vercel.app/)** (Vercel)
- Backend: deployed on Render (cold starts possible on free tier; first request may be slow).


## Local Setup and Running

### Prerequisites
- Node.js 18+ and npm
- MongoDB database (Atlas or local)

### 1) Clone and install
```bash
clone the repo
cd SlotSwapper

# Server deps
cd server
npm install

# Client deps
cd ../client
npm install
```

### 2) Environment variables

Create `server/.env` with:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Create `client/.env` with:
```env
VITE_API_URL=http://localhost:5000/api
```

Notes
- CORS and Socket.IO are restricted to `CLIENT_URL`.
- The client Axios instance uses `withCredentials: true` so the httpOnly cookie is sent.

### 3) Start the apps
In two terminals:
```bash
# Terminal 1
cd server
npm run dev

# Terminal 2
cd client
npm run dev
```

Default URLs:
- Server: `http://localhost:5000`
- Client: `http://localhost:5173`

## Tech Stack
- Frontend: React (with Vite), Tailwind CSS
- Backend/API: Node.js, Express.js, Mongoose
- Database: MongoDB
- Auth: JWT, Bcrypt
- Websockets: Socket.io
- Other Tools: Axios, Dotenv, CORS

## API Reference

Base URL (local): `http://localhost:5000/api`

### Auth

| Method | Path         | Body                         | Notes |
|-------:|--------------|------------------------------|-------|
| POST   | `/auth/signup` | `{ name, email, password }`   | Sets `jwt` cookie; returns user info |
| POST   | `/auth/login`  | `{ email, password }`         | Sets `jwt` cookie; returns user info |
| POST   | `/auth/logout` | —                            | Clears cookie |
| GET    | `/auth/me`     | —                            | Returns `{ user }` |

### Events (auth required)

| Method | Path             | Body                                 | Notes |
|-------:|------------------|--------------------------------------|-------|
| GET    | `/events/`       | —                                    | List my events |
| POST   | `/events/`       | `{ title, startTime, endTime }`      | Create event |
| PUT    | `/events/:id`    | Any of `title, startTime, endTime, status` | Broadcasts `newSwappableSlot` if status becomes `SWAPPABLE` |
| DELETE | `/events/:id`    | —                                    | Delete event |

### Marketplace & Swaps (auth required)

| Method | Path               | Body                          | Notes |
|-------:|--------------------|-------------------------------|-------|
| GET    | `/swappable-slots` | —                             | Others’ swappable events |
| POST   | `/swap-request`    | `{ mySlotId, theirSlotId }`   | Sets both to `SWAP_PENDING`, notifies receiver |

### Swap Requests (auth required)

| Method | Path                         | Body                    | Notes |
|-------:|------------------------------|-------------------------|-------|
| GET    | `/incoming`                  | —                       | My pending incoming requests |
| GET    | `/outgoing`                  | —                       | My pending outgoing requests |
| POST   | `/swap-response/:requestId`  | `{ accepted: boolean }` | Accept swaps users and sets both `BUSY`; reject sets both `SWAPPABLE` and notifies both |
| GET    | `/history`                   | —                       | Accepted/rejected history with `type` |


## Realtime (Socket.IO)
- On connect, client emits `register` with the authenticated user id.
- Server emits: `newSwappableSlot`, `newSwapRequest`, `swapResponseUpdate`.
- Production: CORS origin must match `CLIENT_URL`. On Render, enable WebSockets. With `NODE_ENV=production`, cookies use `SameSite=None; Secure`.


## Frontend Notes
- Dev server: `http://localhost:5173`.
- Axios is configured with `VITE_API_URL` and `withCredentials: true`.

Bonus features
- Real-time notifications (Socket.IO)
- Deployed frontend on Vercel; backend on Render (cold starts possible)


## Assumptions
- Swaps occur between whole events (no partial times).
- Only the owner manages their events; server enforces authorization.
- Slot states are one of `BUSY`, `SWAPPABLE`, `SWAP_PENDING`.


## Challenge
- **Real-time UI**: Implementing real-time notifications and slot swapping without refreshing the UI using `socket.io`, ensuring that event updates and swap responses instantly reflect on all connected users’ calendars. Managing socket connections and state updates in React to keep the UI consistent.



