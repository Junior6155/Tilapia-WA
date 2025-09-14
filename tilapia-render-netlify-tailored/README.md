# Tilapia Distribution Management System (Production-Ready Boilerplate)

A production-ready starter for your business system with:
- Node.js + Express API
- Prisma ORM (SQLite by default; switch to Postgres/MySQL easily)
- JWT Authentication + Role-based access (ADMIN, STAFF, ACCOUNTANT)
- Frontend SPA using your design, powered by API calls + Chart.js
- PWA (offline-ready service worker + manifest)
- Reports summary endpoint (Sales vs Expenses vs Profit)

## Quick Start

### 1) Backend
```bash
cd backend
cp .env.example .env   # set JWT_SECRET and admin credentials
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev    # API on http://localhost:$4000
```

### 2) Frontend
Serve the static frontend with any http server (e.g., VSCode Live Server, or Python):
```bash
cd frontend
# if you have python3:
python3 -m http.server 5173
# or use any static server to host index.html at http://localhost:5173
```
Open http://localhost:5173 and log in with the admin credentials from `.env`.

### Deploy
- **Railway/Render/Fly.io**: deploy backend, set env vars, mount persistent volume or use Postgres. Run `prisma migrate deploy` on startup.
- **Frontend**: host `frontend/` folder on Netlify/Vercel/Cloudflare Pages; set `localStorage.api_base` to your deployed API origin.

### Switch to Postgres (recommended for production)
- Set `DATABASE_URL` in `.env` (e.g., `postgresql://user:pass@host:5432/db`)
- Update `datasource db` provider in `prisma/schema.prisma` to `postgresql`
- Run: `npx prisma migrate deploy`

### Mobile Money / Accounting Integration
- Create a new route `routes/integrations.js` and use providers' SDKs/webhooks.
- Use middleware to verify signatures; store transaction references in `Payment` with `method="mobile_money"`.

### Security Notes
- Change JWT secret and admin password immediately.
- Configure proper CORS for your domains.
- Add HTTPS in production and rotate secrets regularly.
- Set up automated backups of the database.

### Next Steps
- Add charts by time series (daily/weekly).
- Add audit logs for edits/deletions.
- Add multi-user invites and password reset.
- Add CSV import for legacy data.

## Deployment Options

### A) Docker Compose (one machine, full stack)
```bash
docker compose up --build -d
# Frontend → http://localhost:8080
# Backend  → http://localhost:4000
# Adminer  → http://localhost:8081  (host: postgres, user: tilapia, pass: tilapia)
```
Update `CORS_ORIGIN` in `docker-compose.yml` with your real frontend URL(s).

### B) Render.com (backend) + Netlify (frontend)
1. Push this repo to GitHub.
2. **Backend on Render:**
   - New > Blueprint, connect repo, keep `render.yaml`.
   - Render provisions Postgres and builds the Docker image.
   - Set `CORS_ORIGIN` to your Netlify URL (e.g., `https://YOUR-SITE.netlify.app`).
3. **Frontend on Netlify:**
   - New site > Import from Git > set `Publish directory` = `frontend`, no build command.
   - After deploy, open your site and run in the console:
     ```js
     localStorage.setItem("api_base", "https://YOUR-RENDER-BACKEND.onrender.com");
     ```
   - Refresh and log in.

### C) Containers on any VPS
- Build images:
  ```bash
  docker build -t tilapia-backend -f backend/Dockerfile .
  docker build -t tilapia-frontend -f frontend/Dockerfile .
  ```
- Run Postgres (or use managed one), then run both containers. Ensure `DATABASE_URL` points to your DB.

### D) Cloudflare Pages / Vercel (frontend)
- **Cloudflare Pages**: set the project directory to `frontend`.  
- **Vercel**: create a static project from `frontend`.  
Then set `localStorage.api_base` to your backend URL.

### Environment
- For production, prefer **Postgres**. Set `DATABASE_URL` accordingly, e.g.:
  `postgresql://user:pass@host:5432/db`

### Security & Ops
- Rotate `JWT_SECRET` and change `ADMIN_PASSWORD` immediately.
- Enable HTTPS and set strict CORS.
- Schedule database backups.
- Consider adding a rate limiter and audit logs.
