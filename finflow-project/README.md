# 💼 FinFlow — Personal Financial Secretary

A smart personal finance assistant for app developers. Track income, expenses, and get AI-powered insights about your app revenue.

![FinFlow Dashboard](./docs/screenshot.png)

## ✨ Features

- **Dashboard** — Total income, expenses, net profit, weekly bar charts, top apps
- **Income Tracking** — Log App Store / Play Store revenue by app & category
- **Expense Tracking** — Ads, servers, tools, subscriptions with recurring support
- **AI Assistant** — Chat with Claude about your finances in Thai or English
- **Reports** — Monthly summaries with CSV export
- **Auth** — JWT-based register/login

---

## 🗂 Project Structure

```
finflow/
├── backend/
│   ├── server.js          # Express API (auth, income, expenses, AI)
│   ├── db/database.js     # SQLite setup with better-sqlite3
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/         # Dashboard, Income, Expense, Assistant, Reports
│   │   ├── components/    # Sidebar, Topbar, Charts, Modal
│   │   ├── hooks/         # useFinancialData.js
│   │   └── context/       # AuthContext, DataContext
│   ├── package.json
│   └── .env.example
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Anthropic API key → https://console.anthropic.com

---

### 1. Clone & Setup Backend

```bash
cd finflow/backend

# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env
# Edit .env — set ANTHROPIC_API_KEY and JWT_SECRET

# Start backend
npm run dev
# ✅ Running on http://localhost:4000
```

---

### 2. Setup Frontend

```bash
cd finflow/frontend

# Install dependencies
npm install

# Copy env
cp .env.example .env
# VITE_API_URL=http://localhost:4000/api (default, no change needed)

# Start dev server
npm run dev
# ✅ Running on http://localhost:3000
```

---

### 3. Open the App

Go to **http://localhost:3000**

- Click **"ลองใช้งาน Demo"** to explore without registering
- Or register a new account

---

## 🔑 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/income?month=2025-04` | Get income |
| POST | `/api/income` | Add income entry |
| DELETE | `/api/income/:id` | Delete income |
| GET | `/api/expenses?month=2025-04` | Get expenses |
| POST | `/api/expenses` | Add expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/summary?month=2025-04` | Get monthly summary |
| POST | `/api/assistant` | Chat with AI |
| GET | `/api/export/csv?month=2025-04` | Export CSV |

---

## 🤖 AI Assistant Examples

Ask in Thai or English:
- `"เดือนนี้กำไรเท่าไหร่?"` → Monthly profit breakdown
- `"แอปไหนทำเงินดีที่สุด?"` → Top performing apps
- `"ค่าใช้จ่ายสูงสุดคืออะไร?"` → Highest expense categories
- `"ควรลดค่าใช้จ่ายอะไร?"` → Cost optimization advice

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Charts | Recharts |
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| AI | Anthropic Claude (claude-sonnet-4-20250514) |
| Auth | JWT + bcryptjs |

---

## 🚢 Production Deployment

```bash
# Build frontend
cd frontend && npm run build

# Serve static files via Express
# Add to server.js:
app.use(express.static('../frontend/dist'));

# Set production env
NODE_ENV=production
JWT_SECRET=<long-random-secret>
ANTHROPIC_API_KEY=<your-key>
```

Or deploy to:
- **Frontend** → Vercel / Netlify (set `VITE_API_URL` to your backend URL)
- **Backend** → Railway / Render / Fly.io (set all env vars)

---

## 📝 License

MIT
