# CodeLens

CodeLens is an AI-assisted developer workspace for reviewing Python code, generating test cases, explaining code, checking likely bugs, estimating complexity, suggesting optimizations, and scoring code quality.

It is designed as a simple, beginner-friendly platform: the user writes code in the browser, chooses an analysis action, and receives a readable result from the FastAPI backend.

## How It Works

```text
Browser frontend
      |
      | JSON requests
      v
FastAPI backend on Render
      |
      +--> Gemini API for AI review, when configured
      +--> Local fallback analyzers for the other tools
      +--> PostgreSQL for user accounts
```

The frontend is a static HTML, CSS, and JavaScript application. The backend owns authentication, password hashing, database access, AI requests, and analysis endpoints. The Gemini API key is read only by the backend and is never sent to the browser.

## Main Features

- **AI code review:** Reviews code using Gemini when `GEMINI_API_KEY` is configured. If Gemini is unavailable, the backend returns a local beginner-friendly review instead.
- **Test generation:** Produces starter Python tests based on the submitted function.
- **Code explanation:** Explains code at beginner or technical level.
- **Bug verification:** Checks common edge cases and likely logic problems.
- **Static analysis:** Reports basic structure, validation, and error-handling concerns.
- **Complexity analysis:** Estimates time and space complexity from the code structure.
- **Optimization suggestions:** Recommends clearer or more efficient patterns.
- **Quality score:** Produces a score from 0 to 100 using code structure and defensive-programming signals.
- **Authentication:** Supports account registration, login, signed expiring tokens, and current-user lookup.
- **Workspace UI:** Includes projects, review history, dashboard metrics, search, filters, settings, and responsive layouts.
- **Optional code execution:** The Run feature is available for local development but is disabled by default on hosted deployments because arbitrary Python must not run directly on a public API server.

## Project Structure

```text
.
├── index.html              Static frontend markup
├── script.js               Frontend interactions and API requests
├── styles.css              Responsive visual design
├── backend/
│   ├── main.py             FastAPI application and database logic
│   ├── requirements.txt    Python dependencies
│   └── test_main.py        Backend regression tests
├── Dockerfile              Production API container
├── docker-compose.yml      Local Docker API setup
├── render.yaml             Render deployment blueprint
├── vercel.json              Static Vercel configuration
└── .env.example            Environment variable template
```

## API Endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /` | API information and links |
| `GET /api/health` | Deployment health check |
| `POST /api/auth/register` | Create an account |
| `POST /api/auth/login` | Authenticate an account |
| `GET /api/auth/me` | Validate the current bearer token |
| `POST /api/review` | Review submitted code |
| `POST /api/generate-tests` | Generate starter tests |
| `POST /api/explain-code` | Explain submitted code |
| `POST /api/bug-verification` | Check likely bugs |
| `POST /api/static-analysis` | Run basic static analysis |
| `POST /api/complexity-analysis` | Estimate complexity |
| `POST /api/optimize-code` | Return optimization advice |
| `POST /api/quality-score` | Calculate a quality score |
| `POST /api/run` | Optional local Python execution |

Interactive API documentation is available at `/docs` when the backend is running.

## Run Locally

### Backend

Create a virtual environment, install dependencies, and start FastAPI:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload --port 8000
```

### Frontend

Serve the repository root with VS Code Live Server or another static server on port `5500`. The frontend is configured to call `http://localhost:8000` by default.

Run the backend tests with:

```powershell
python -m pytest backend/test_main.py -q
```

## Environment Variables

Copy [.env.example](.env.example) to `.env` for local development:

```text
DATABASE_URL=postgresql+psycopg://username:password@host:5432/codelens
AUTH_SECRET=long-random-secret-at-least-32-characters
FRONTEND_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
ENABLE_CODE_EXECUTION=false
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.6-flash
```

- `DATABASE_URL` selects PostgreSQL. Without it, local development falls back to SQLite at `backend/app.db`.
- `AUTH_SECRET` signs authentication tokens. Set a stable, private value in production.
- `FRONTEND_ORIGINS` contains the exact browser origin allowed by CORS, without a trailing slash.
- `ENABLE_CODE_EXECUTION` should remain `false` on a public deployment until a dedicated sandbox is implemented.
- `GEMINI_API_KEY` is optional. Without it, `/api/review` uses the local fallback reviewer.

## Database

The application creates the `users` table during startup. It supports Aiven PostgreSQL connection strings beginning with `postgres://` or `postgresql://` and automatically uses the installed `psycopg` driver.

The startup migration also repairs older `users` tables by adding missing `password_salt` and `created_at` columns. For production systems, use a formal migration tool and regular PostgreSQL backups as the schema grows.

## Deployment Architecture

The recommended hosted setup is:

```text
Vercel static frontend
        |
        v
Render Docker API  --->  Aiven PostgreSQL
        |
        v
   Gemini API
```

### Render API

The repository includes [Dockerfile](Dockerfile) and [render.yaml](render.yaml). The Render API service runs:

```text
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

Set these variables in the Render API service:

```text
DATABASE_URL=<Aiven PostgreSQL connection string>
AUTH_SECRET=<long random secret>
FRONTEND_ORIGINS=https://your-project.vercel.app
GEMINI_API_KEY=<your Gemini key>
GEMINI_MODEL=gemini-3.6-flash
ENABLE_CODE_EXECUTION=false
```

### Vercel frontend

The frontend is deployed as a static site from the repository root. The API URL is configured in [index.html](index.html):

```html
<script>
  window.CODELENS_API_URL = "https://your-api.onrender.com";
</script>
```

The Vercel domain must match the Render `FRONTEND_ORIGINS` value exactly.

### Local Docker

With Docker Desktop running, create a root `.env` file and run:

```powershell
docker compose up --build
```

The API will be available at `http://localhost:8000`.

## Security Notes

- Never commit `.env`, database URLs, passwords, API keys, or `AUTH_SECRET`.
- Rotate the Aiven password immediately if the connection URL is exposed.
- Keep code execution disabled on public deployments unless it runs in an isolated sandbox with CPU, memory, filesystem, process, and network limits.
- Add rate limiting and authentication requirements for expensive public endpoints before scaling the service.
