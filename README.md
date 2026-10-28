# Real-Time Chat Application with Rooms

React + Vite, Node.js + Express, Socket.IO, MongoDB (Mongoose), JWT auth.

## Run locally

Requires Node 20+ and a running MongoDB (local or Atlas).

Backend
```
cd backend
copy .env.example .env
npm install
npm run dev
```

Frontend (new terminal)
```
cd frontend
copy .env.example .env
npm install
npm run dev
```

Open http://localhost:5173, create two accounts in two browsers, create a room, and chat.

## API

- POST /api/auth/signup
- POST /api/auth/login
- GET  /api/rooms
- POST /api/rooms
- GET  /api/rooms/:id/messages

Socket events: joinRoom, leaveRoom, sendMessage (client) and newMessage, userJoined, userLeft (server).

## Deploy

1. MongoDB Atlas: create a free cluster, add a database user, allow access from anywhere under Network Access, copy the connection string.
2. Push the project to GitHub.
3. Backend on Render: new Web Service, root directory `backend`, build `npm install`, start `npm start`. Environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (set after step 4). Check `/health` returns `ok`.
4. Frontend on Vercel: root directory `frontend`, framework Vite, environment variable `VITE_API_URL` set to the Render URL. Deploy and copy the URL.
5. Set `CLIENT_URL` on Render to the exact Vercel URL with no trailing slash, then redeploy.
