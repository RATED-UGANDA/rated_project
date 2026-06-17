# Rated Uganda — Ugandan News Platform

A full-stack web application for publishing and consuming local news across Uganda. Built by Group 14 for the UCU Recess Bootcamp.

## Project Overview

Rated Uganda is a modern, secure news platform that brings together journalists, editors, and administrators to produce reliable local news. The system supports:

- Public browsing of published articles with category and district filtering
- User registration with admin approval and role-based access
- Journalists who write, upload media, and submit articles
- Editors who review articles (including LLM-assisted pre-checks)
- An automated RSS scraper that ingests and rewrites news from Ugandan outlets
- Stock image sourcing via Pexels for scraped articles
- Administrator dashboards for users, categories, districts, and scraper management

## Tech Stack

- **Frontend:** React 19 + Vite + React Router + Axios
- **Backend:** Node.js + Express 5
- **Database:** MySQL 8.0
- **Auth:** JWT (stateless)
- **LLM:** Ollama Cloud (`deepseek-v4-flash`) for article validation and rewrite
- **Images:** Pexels API for stock photo pool

## Team — Group 14

| Name | Registration No. | Role |
|---|---|---|
| Ms. Desire Kisakye | — | Product Owner |
| Mugabi Jeremy | S25B23/011 | Scrum Master |
| Obitre Warren & Ayebare Samuel | S25B23/041 / S25B23/029 | Frontend Developers |
| Buhamizo Elijah | S25B23/064 | Backend Developer |
| Atti Cindy Lynnette | S25B38/001 | Quality Assurance Tester |
| Mugisha Timothy Naabaasa | S25B38/041 | Documentation & UX Lead |

## Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+ running locally
- A free Pexels API key from https://www.pexels.com/api
- An Ollama Cloud API key (the project was tested with `deepseek-v4-flash`)

## Setup from a fresh clone

### 1. Database

Create the database and run the schema and seed files. If your `mysql` binary is not in PATH, use the full path to `mysql.exe`.

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ratedug CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
cd backend/db
mysql -u root -p ratedug < schema.sql
mysql -u root -p ratedug < seed.sql
```

### 2. Backend environment

```bash
cd backend
copy .env.example .env
```

Edit `.env` with your real values:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=ratedug
JWT_SECRET=any_long_random_string
JWT_EXPIRES_IN=7d
LLM_API_URL=https://api.ollama.com/api/chat
LLM_API_KEY=your_ollama_api_key
LLM_MODEL=deepseek-v4-flash
PEXELS_API_KEY=your_pexels_api_key
SCRAPE_INTERVAL_MINUTES=60
IMAGE_REFRESH_HOURS=24
```

Install dependencies and start:

```bash
npm install
npm run dev
```

The API will be available at `http://localhost:5000`. The health check endpoint is `GET http://localhost:5000/api/health`.

Expected response:
```json
{
  "status": "success",
  "message": "Rated Uganda API is running"
}
```

### 3. Frontend environment

In a new terminal:

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. Prepare images for demo

Before the first demo, log in as an administrator and visit **Admin > Scraper & Images**, then click **Refresh Stock Images**. This fills the `stock_images` pool so scraped articles get real thumbnails when approved.

## Demo credentials (seeded)

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@rateduganda.ug` | `Admin123!` |
| Plain Administrator | `demo.admin@rateduganda.ug` | `AdminPass123!` |
| Journalist | `demo.journalist@rateduganda.ug` | `DemoPass123!` |
| Editor | `demo.editor@rateduganda.ug` | `EditorPass123!` |

To promote a newly registered user to journalist or editor, log in as the super admin, go to **Admin > Manage Users**, and click the appropriate role button.

## How the scraper works

Six Ugandan news sources are configured in the database:

- Daily Monitor
- New Vision
- The Independent
- Nile Post
- PML Daily
- Chimp Reports

At build time, only **The Independent** exposed a working public RSS feed. The others are seeded as inactive with explanatory notes. You can toggle sources on/off from **Admin > Scraper & Images**. The scraper runs automatically every `SCRAPE_INTERVAL_MINUTES` and can also be triggered manually with the **Run Scrape Now** button.

## Running tests

```bash
cd backend
npm test
```

This runs:

- `tests/smoke.js` — end-to-end backend lifecycle
- `tests/llmValidation.test.js` — LLM validation pre-filter and real call
- `tests/scraper.test.js` — RSS ingestion, deduplication, and image refresh

## Project structure

```
rated_project/
├── backend/
│   ├── db/               -- schema.sql, seed.sql, README.md
│   ├── src/
│   │   ├── config/       -- db.js
│   │   ├── middleware/   -- auth.js, roleCheck.js, errorHandler.js, validate.js
│   │   ├── models/       -- one file per table
│   │   ├── controllers/  -- one file per resource
│   │   ├── routes/       -- one file per resource
│   │   ├── services/     -- auth, llmValidation, llmRewrite, stockImages
│   │   ├── scraper/      -- sources, fetchFeeds, scrapeRunner, scheduler, verifySources
│   │   ├── assets/       -- placeholder-cover.jpg
│   │   └── app.js
│   ├── tests/
│   ├── uploads/          -- media uploads (kept empty in git)
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/          -- axios modules per resource
│   │   ├── components/   -- Navbar, ArticleCard, RoleGuard
│   │   ├── context/      -- AuthContext
│   │   ├── pages/        -- Public, Auth, Journalist, Editor, Admin
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   └── package.json
├── README.md
└── .gitignore
```

## Known limitations

See `backend/tests/QA_REPORT.md` for the full QA report, including:

- Only one of six configured RSS sources is currently active.
- Ollama Cloud responses can be slow (10–25s); the LLM services fail open so submissions are never blocked.
- Pexels stock photography is globally generic despite Uganda-flavored search terms.
- No automated CI/CD or deployment pipeline is included.

## Methodology

This project follows the Agile software development methodology, using sprints, daily stand-ups, product backlogs, and retrospectives.

## Institution

Uganda Christian University  
Faculty of Engineering, Design and Technology  ²Department of Computing and Technology  
Mentor: Mr. Christopher Ssemambo
