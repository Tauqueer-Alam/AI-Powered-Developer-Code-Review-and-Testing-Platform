# CodeLens

CodeLens is a browser-based AI developer workspace for reviewing Python code, generating starter tests, explaining logic, checking likely bugs, estimating complexity, suggesting optimizations, and scoring code quality.

The project is intentionally beginner-friendly: a user paste code in the frontend, choose an action, and receive a clear response from the FastAPI backend. The backend handles auth, database access, AI integration, and local fallback analysis logic.

## Overview

```text
Browser UI (HTML + CSS + JS)
        |
        | API calls
        v
FastAPI backend
        |
        +-- Gemini API, when configured
        +-- Local fallback analyzers for reviews/tests/explanations
        +-- SQLite by default or PostgreSQL when DATABASE_URL is set
```

The frontend runs as a static site from the repo root. The backend is served from `backend/main.py` and exposes a JSON API for code review and workspace tasks.

## Features

- AI code review using Gemini when a valid `GEMINI_API_KEY` is present
- Local fallback review logic when the external API is unavailable
- Starter unit test generation for Python functions
- Beginner-friendly code explanations
- Bug verification and likely edge-case checks
- Static analysis for simple code-health signals
- Complexity estimation for time and space usage
- Optimization suggestions for clearer or faster code
- Quality score generation from 0 to 100
- Email/password auth with standard HS256 JWTs
- Project/review history in the browser (stored locally for guest and logged-in users)
- Optional local Python execution via the `/api/run` endpoint

## Project Structure

```text
.
├── index.html              Frontend shell and page layout
├── script.js               Browser-side logic and API calls
├── styles.css              UI styling and responsive layout
├── backend/
│   ├── main.py             FastAPI app, auth, analysis endpoints, DB setup
│   ├── requirements.txt    Python dependencies
│   └── test_main.py        Backend regression tests
├── .env.example            Sample environment configuration
├── .env                    Local environment values (not committed)
├── Dockerfile              Container config for the API
├── docker-compose.yml      Local Docker startup setup
├── render.yaml             Render deployment configuration
├── vercel.json             Static hosting configuration
└── README.md               Project documentation
```

## API Overview

The backend exposes the following routes:

- `GET /` — API metadata
- `GET /api/health` — health check
- `POST /api/auth/register` — register a user
- `POST /api/auth/login` — log in a user
- `GET /api/auth/me` — check current auth token
- `POST /api/review` — review code
- `POST /api/generate-tests` — generate starter tests
- `POST /api/explain-code` — explain code in beginner or technical detail
- `POST /api/bug-verification` — report likely bugs
- `POST /api/static-analysis` — static analysis summary
- `POST /api/complexity-analysis` — complexity explanation
- `POST /api/optimize-code` — improvement suggestions
- `POST /api/quality-score` — compute a quality score
- `POST /api/run` — execute submitted Python code locally

Interactive docs are available at `/docs` when the app is running.

## Local Development

### 1) Backend setup

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload --port 8000
```

The API defaults to `http://localhost:8000`.

### 2) Frontend setup

Serve the project root locally with a static web server. A simple option is:

```powershell
python -m http.server 5500
```

Then open `http://localhost:5500` in a browser. The frontend falls back to `http://localhost:8000` if the API URL is not overridden.

### 3) Run tests

```powershell
python -m pytest backend/test_main.py -q
```

## Environment Variables

Copy `.env.example` to a local `.env` file before running the project:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.6-flash
DATABASE_URL=postgresql+psycopg://username:password@localhost:5432/codelens
AUTH_SECRET=replace-with-a-long-random-secret
FRONTEND_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
ENABLE_CODE_EXECUTION=false
```

Notes:

- `DATABASE_URL` enables PostgreSQL. If it is unset, the app falls back to SQLite in `backend/app.db`.
- `AUTH_SECRET` signs HS256 JWTs and should be a stable, private production secret.
- `FRONTEND_ORIGINS` must match the browser origin exactly.
- `ENABLE_CODE_EXECUTION` should stay `false` on public deployments unless sandboxing is properly implemented.
- `GEMINI_API_KEY` is optional; the app still returns local fallback analysis when it is missing.

## Database

The backend creates a `users` table at startup and supports PostgreSQL connection strings using `postgres://`, `postgresql://`, and `postgresql+psycopg://` formats. It also repairs older user tables by adding missing `password_salt` and `created_at` fields when needed.

## Deployment

The project is designed for a simple static frontend + API backend pattern:

```text
Vercel / static hosting
        |
        v
Render / Docker backend
        |
        +--> Postgres (optional in production)
        +--> Gemini API (optional)
```

### Render

The repo includes a Docker setup and a Render config. The backend can be launched with:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

Typical environment variables:

```env
DATABASE_URL=postgresql+psycopg://...
AUTH_SECRET=your-long-secret
FRONTEND_ORIGINS=https://your-frontend-url
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-3.6-flash
ENABLE_CODE_EXECUTION=false
```

### Vercel / static hosting

The frontend is served from the repository root. The app code currently sets the deployed API URL directly in `index.html` and falls back to `http://localhost:8000` when running locally.

## Security Notes

- Never commit `.env`, connection strings, secrets, or API keys.
- JWTs include the user ID, issue time, expiration time, and a unique token ID.
- Keep code execution disabled on public services unless it is sandboxed.
- Use a strong `AUTH_SECRET` in production.
- Prefer a proper migration workflow and backups as the app grows beyond local development.

## License

This project is currently intended for local development and learning use. Add a formal license before sharing it publicly or using it in production environments.
