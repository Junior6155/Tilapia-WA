# Tailored Deployment: Render (API) + Netlify (Frontend)

This project is pre-configured so your **frontend** calls `/api/...` in production, and **Netlify** proxies that to your **Render** backend.

---

## 1) Backend on Render (Docker + Managed Postgres)

1. Push this repo to GitHub.
2. In Render, choose **New → Blueprint** and select your repo.
3. Render will detect `render.yaml`:
   - Provisions a **Postgres** database (`tilapia-db`).
   - Builds and runs the **backend** Dockerfile.
4. After first deploy, set environment variable:
   - `CORS_ORIGIN` → `https://YOUR-NETLIFY-SITE.netlify.app`
5. Wait for the backend to be live. Copy its URL, e.g.:
   - `https://tilapia-backend-xxxx.onrender.com`

> Prisma migrations are auto-run via the container entrypoint.
> The seed user is set with `ADMIN_EMAIL`/`ADMIN_PASSWORD` in Render env.

---

## 2) Frontend on Netlify (Static site + API proxy)

1. In Netlify, click **Add new site → Import from Git** (same repo).
2. Build settings:
   - **Publish directory**: `frontend`
   - **Build command**: *(leave empty)*
3. In your repo, open `netlify.toml` and set the proxy target:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://YOUR-RENDER-BACKEND.onrender.com/:splat"
     status = 200
     force = true
   ```
4. Deploy the site. The frontend will:
   - Use **`/api`** as `api_base` automatically (see `frontend/script.js`).
   - Netlify proxies `/api/*` → your Render backend.

Open your Netlify URL and log in with the admin you configured in Render.

---

## 3) Local development

- **Backend**: `cd backend && cp .env.example .env && npm i && npx prisma generate && npx prisma migrate dev && npm run seed && npm run dev`
- **Frontend**: `cd frontend && python3 -m http.server 5173`
- Go to http://localhost:5173

---

## 4) Security must-dos

- Change `ADMIN_PASSWORD` immediately in Render env.
- Set a strong `JWT_SECRET` in Render env.
- Restrict `CORS_ORIGIN` to your exact Netlify domain.
- Add HTTPS custom domains if possible.
- Schedule Postgres backups in Render.

---

## 5) Optional Enhancements

- Add MoMo integration routes in `backend/src/routes/`.
- Add audit logs (new Prisma model) for updates/deletes.
- Add timeseries `/reports` endpoints and charts.
