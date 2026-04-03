# 🐄 FarmWise — AI Farm Assistant

A mobile-first React + Vite app with an Express/MongoDB backend and Anthropic AI.

---

## Project Structure

```
farmwise/
├── src/                    ← React frontend (Vite)
│   ├── components/         ← CameraPage, FeedPage, DiaryPage, ProgressPage
│   ├── hooks/              ← useAnimals, useMilk, useLocation, useOnlineStatus
│   ├── services/
│   │   ├── api.js          ← All HTTP calls to the backend
│   │   └── db.js           ← IndexedDB offline cache (idb)
│   ├── App.jsx
│   └── main.jsx
├── server/                 ← Express backend
│   ├── models/             ← Mongoose schemas (Animal, MilkRecord, HealthScan)
│   ├── routes/             ← animals, milk, health (AI), feed (AI)
│   ├── index.js            ← Entry point
│   └── seed.js             ← Seed 14 starter animals
├── index.html
├── vite.config.js
└── package.json
```

---

## Prerequisites

- **Node.js** v18+
- **MongoDB** running locally (`mongod`) OR a MongoDB Atlas URI
- **Anthropic API key** — get one at https://console.anthropic.com

---

## 1. Install Frontend

```bash
# In the project root
npm install
```

## 2. Configure Frontend

```bash
cp .env.example .env
# .env already has: VITE_API_BASE_URL=http://localhost:3001
# No changes needed for local dev
```

## 3. Install Backend

```bash
cd server
npm install
```

## 4. Configure Backend

```bash
cp .env.example .env
```

Edit `server/.env`:

```env
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE
MONGODB_URI=mongodb://localhost:27017/farmwise
PORT=3001
```

## 5. Seed the Database

```bash
# From the project root
node server/seed.js
```

This creates 14 animals (7 cows, 3 bulls, 4 calves) in MongoDB.

---

## 6. Run the App

Open **two terminals**:

**Terminal 1 — Backend**
```bash
cd server
npm run dev
# → Server running on http://localhost:3001
```

**Terminal 2 — Frontend**
```bash
# In project root
npm run dev
# → Vite dev server on http://localhost:5173
```

Open http://localhost:5173 in your browser (or on your phone's browser on the same Wi-Fi).

---

## API Endpoints

| Method | Path                          | Description                      |
|--------|-------------------------------|----------------------------------|
| GET    | /api/animals                  | List all animals                 |
| POST   | /api/animals                  | Add new animal                   |
| PUT    | /api/animals/:id              | Update animal                    |
| DELETE | /api/animals/:id              | Remove animal                    |
| GET    | /api/milk/:animalId           | All milk records for animal      |
| GET    | /api/milk/:animalId/last7     | Last 7 days of milk records      |
| POST   | /api/milk                     | Save/upsert milk record          |
| POST   | /api/health/scan              | Upload photo → AI vet report     |
| GET    | /api/health/history/:animalId | Scan history for one animal      |
| GET    | /api/health/recent            | Recent scans across herd         |
| POST   | /api/feed/advice              | AI feeding advice                |

---

## Offline Support

- The app works without internet using **IndexedDB** (via the `idb` library).
- Milk records saved offline are queued and **auto-synced** when connectivity returns.
- Animal data is cached locally after the first load.

---

## Build for Production

```bash
# Frontend build
npm run build
# Output in dist/

# Serve with any static host (Vercel, Netlify, etc.)
# Point VITE_API_BASE_URL to your deployed backend URL
```
