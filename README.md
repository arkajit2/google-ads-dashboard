# Google Ads Performance Dashboard Web App

A full-stack replica of the **Google Ads Web Dashboard** built with **Python (FastAPI)**, **React 19 (Vite + Tailwind CSS)**, and configured for seamless deployment to **GitHub** and **Cloudflare Pages**. 

Users can sign in using their **Google profile** via Google OAuth 2.0, view real-time advertising KPIs, analyze dual-axis campaign charts, manage campaign budgets, and apply AI-driven optimization recommendations.

---

## ✨ Features

- **Google Ads Header Navigation**:
  - Official Google Ads branding, multi-account switcher, universal search (`Ctrl + /`), tools & settings, billing shortcuts, and notification center.
  - Google profile avatar menu displaying authenticated user details, customer ID, and sign-out actions.
- **Collapsible Sidebar**:
  - Full and compact modes covering *Overview*, *Recommendations* (with live score pill), *Insights & reports*, *Campaigns*, *Ad groups*, *Ads & assets*, *Landing pages*, *Keywords*, *Audiences*, and *Settings*.
- **Live Scorecards Ribbon**:
  - Clicks, Impressions, Avg. CPC, Cost, Conversions, and Cost / conv.
  - Real-time comparison delta (+% vs. previous period) and clickable dual-metric selection that dynamically controls chart series.
- **Interactive Dual-Axis Time-Series Chart**:
  - Google Ads style multi-series graph (Primary blue vs. Secondary red line), custom date tooltips, and time granularity controls (Daily / Weekly / Monthly).
- **Campaigns Data Table**:
  - Filter by search keywords, campaign types (Search, Performance Max, Display, Video), and status (Enabled / Paused).
  - Live status toggle dot (active green / pause) connected to the backend.
  - Summary totals footer calculating aggregate impressions, clicks, cost, and conversions.
  - One-click **Export to CSV**.
- **Optimization Score & AI Recommendations**:
  - Animated circular progress indicator showing account optimization score (e.g., 88.4%).
  - Actionable recommendation cards with instant score lift application.
- **Google Profile Sign-In**:
  - Real Google OAuth 2.0 login integration powered by `@react-oauth/google`.
  - Built-in instant demo personas (Agency & E-commerce) for immediate testing without requiring API keys.

---

## 🏗️ Project Architecture

```
cool-bell/
├── frontend/                     # React + Vite + Tailwind CSS (Deployable to Cloudflare Pages)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Google Ads top navigation & profile dropdown
│   │   │   ├── Sidebar.jsx       # Expandable navigation menu
│   │   │   ├── MetricCards.jsx   # Performance scorecards
│   │   │   ├── PerformanceChart.jsx # Dual-axis time series chart (Recharts)
│   │   │   ├── CampaignsTable.jsx   # Campaigns table with live toggle & CSV export
│   │   │   ├── RecommendationsCard.jsx # 88% optimization score ring & suggestions
│   │   │   ├── DateRangePicker.jsx  # Google Ads date range selector popover
│   │   │   └── AuthModal.jsx     # Google OAuth sign-in modal
│   │   ├── services/
│   │   │   └── api.js            # FastAPI client with offline fallback support
│   │   ├── App.jsx               # Application coordinator
│   │   ├── main.jsx              # GoogleOAuthProvider wrapper
│   │   └── index.css             # Google design system & Roboto styling
│   ├── public/
│   │   └── _redirects            # Cloudflare Pages SPA rewrite rule
│   ├── package.json
│   ├── vite.config.js
│   └── wrangler.toml             # Cloudflare Pages config
├── backend/                      # Python FastAPI Application
│   ├── main.py                   # Google OAuth verification & campaign metrics endpoints
│   ├── requirements.txt          # fastapi, uvicorn, google-auth, pydantic
│   └── .env.example
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI/CD: Tests backend, builds frontend & deploys to Cloudflare Pages
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### 1. Run the Python Backend

```bash
cd backend
# Create virtual environment (if not already created)
python -m venv .venv

# Activate virtual environment
# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --reload --port 8000
```
Backend API will be running at `http://127.0.0.1:8000` (Interactive docs: `http://127.0.0.1:8000/docs`).

### 2. Run the React Frontend

In a new terminal:
```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Setting Up Google OAuth (Sign in with Google)

To allow visitors to sign in with their real personal or business Google accounts:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services** > **Credentials**.
4. Click **Create Credentials** > **OAuth client ID**.
5. Select **Web application** for Application type.
6. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173` (for local development)
   - `https://your-project.pages.dev` (your Cloudflare Pages URL)
7. Copy the generated **Client ID**.
8. In `frontend`, create a `.env` file:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   VITE_API_URL=http://localhost:8000
   ```
9. In `backend/.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```

---

## 🌐 Deployment to Cloudflare Pages & GitHub

### Method A: Cloudflare Pages Git Integration (Recommended)

1. Push your repository to **GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: complete Google Ads replica web app"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
2. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
3. Navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
4. Select your GitHub repository.
5. Configure Build settings:
   - **Framework preset**: `Vite`
   - **Root directory**: `frontend`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. Add Environment Variables:
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
   - `VITE_API_URL`: Your deployed Python backend URL (e.g. `https://api.yourdomain.com` or Render/Railway URL)
7. Click **Save and Deploy**. Cloudflare Pages will build and deploy your site to `https://<your-project>.pages.dev` within seconds with instant worldwide CDN caching and automatic SSL.

### Method B: GitHub Actions Automated Workflow

The repository includes a ready-to-run GitHub Actions workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

To enable automated deployments on every `git push`:
1. In your GitHub repository, go to **Settings** > **Secrets and variables** > **Actions**.
2. Add the following secrets:
   - `CLOUDFLARE_API_TOKEN`: Cloudflare API token with `Cloudflare Pages: Edit` permissions.
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID (found on your Cloudflare dashboard overview).
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.
   - `VITE_API_URL`: Your backend URL.
3. Every push to `main` will automatically build and deploy the frontend.

### Method C: Deploying the Python Backend

You can deploy the FastAPI backend on any modern host:
- **Render.com**: Connect the GitHub repo, select Web Service, Root Directory: `backend`, Build Command: `pip install -r requirements.txt`, Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
- **Railway.app**: Select GitHub repo, set root directory to `/backend`.
- **Fly.io**: Run `fly launch` inside `backend/`.

---

## 📊 Summary of REST Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `POST` | `/api/auth/google/verify` | Verifies Google ID tokens & returns user profile |
| `GET` | `/api/metrics/summary` | Aggregated Clicks, Impressions, Cost, Avg CPC, Conversions, CTR |
| `GET` | `/api/metrics/timeseries?days=30` | Daily time series data for dual-axis chart |
| `GET` | `/api/campaigns` | Lists all active & paused campaigns |
| `PATCH` | `/api/campaigns/{id}/status` | Toggles campaign status (`ENABLED` / `PAUSED`) |
| `GET` | `/api/recommendations` | Account optimization recommendations & score lift |
