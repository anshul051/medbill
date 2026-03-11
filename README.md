# 💊 MedBill AI — MERN Stack

A full-stack medical bill & prescription analyzer powered by **Groq AI** (free, no quota issues).

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| AI | Groq API (Llama 4 Scout Vision + Llama 3.3 70B) |
| Auth | JWT + bcrypt |

## 📁 Project Structure

```
medbill-mern/
├── server/
│   ├── index.js              # Express entry point
│   ├── models/
│   │   ├── User.js           # User schema (auth + groq key)
│   │   ├── Analysis.js       # Medical analysis schema
│   │   └── Reminder.js       # Medicine reminder schema
│   ├── routes/
│   │   ├── auth.js           # Register, login, profile
│   │   ├── analysis.js       # Upload + analyze + chat
│   │   ├── reminders.js      # CRUD reminders
│   │   └── share.js          # Generate & load share codes
│   └── middleware/
│       └── auth.js           # JWT auth middleware
└── client/
    └── src/
        ├── pages/
        │   ├── Login.js
        │   ├── Register.js
        │   ├── Dashboard.js      # Upload + history
        │   ├── AnalysisView.js   # Full result with tabs
        │   └── SharedView.js     # Public share code view
        ├── components/
        │   ├── TopNav.js
        │   ├── MedCard.js        # Medicine card
        │   ├── LabCard.js        # Lab result card
        │   ├── ChatTab.js        # AI chat
        │   ├── RemindersTab.js   # Reminder toggles
        │   └── ShareTab.js       # Share code generator
        ├── context/
        │   └── AuthContext.js    # Auth state + API key
        └── utils/
            └── api.js            # Axios instance
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com) free tier)
- [Groq API Key](https://console.groq.com/keys) (free)

### 1. Clone & Install

```bash
git clone <repo>
cd medbill-mern
npm run install-all
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medbill
JWT_SECRET=your_very_secret_key_here
GROQ_API_KEY=gsk_your_groq_key_here   # optional fallback
NODE_ENV=development
```

### 3. Run Development

```bash
# From root — starts both server (5000) & client (3000)
npm run dev
```

Open http://localhost:3000

### 4. Build for Production

```bash
npm run build
# Serve with:
cd server && NODE_ENV=production node index.js
```

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/api-key` | Save Groq API key |

### Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analysis/analyze` | Upload & analyze (multipart/form-data) |
| POST | `/api/analysis/chat` | Chat about an analysis |
| GET | `/api/analysis` | List user's analyses |
| GET | `/api/analysis/:id` | Get single analysis |
| DELETE | `/api/analysis/:id` | Delete analysis |

### Reminders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reminders` | List user's reminders |
| POST | `/api/reminders` | Create reminder |
| PUT | `/api/reminders/:id/toggle` | Toggle active state |
| DELETE | `/api/reminders/:id` | Delete reminder |

### Share (public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/share/generate/:analysisId` | Generate share code |
| GET | `/api/share/:code` | Load shared analysis |

## 🌟 Features

- **Multi-document support**: Prescriptions, Lab Reports, Blood Tests, Discharge Summaries, Medical Bills
- **AI-powered analysis**: Extracts medicines, dosages, lab values, vitals, diagnosis
- **Abnormal lab detection**: Highlights low/high values with interpretation
- **AI Chat**: Ask questions about your medicines or results
- **Medicine Reminders**: Browser notifications + in-app alerts
- **Share codes**: 6-character codes to share analyses with family
- **History**: All past analyses saved to MongoDB per user
- **Auth**: JWT-based user accounts with secure password hashing

## 🔒 Security Notes

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens expire in 30 days
- API keys stored per-user in DB (consider encrypting in production)
- File upload capped at 10MB
- Only image/PDF MIME types accepted

## 🚢 Deployment (Render / Railway)

1. Push to GitHub
2. Create a **Web Service** for `server/` (Node env)
3. Create a **Static Site** for `client/` (Build: `npm run build`, Publish: `build/`)
4. Or deploy fullstack: set `NODE_ENV=production` and serve React from Express

### MongoDB Atlas (free)
1. Create cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Get connection string
3. Set `MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/medbill`
