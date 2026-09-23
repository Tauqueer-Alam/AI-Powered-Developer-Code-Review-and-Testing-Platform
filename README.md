# CodeLens

A beginner-friendly frontend prototype for an AI-powered developer code review and testing platform.

## Run the frontend

Serve the project folder with a local web server. For example, use VS Code Live Server on port `5500`.

You can also use VS Code Live Server if you have that extension installed.

## Run the Gemini backend

Open a terminal in the project folder and run:

```powershell
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload --port 8000
```

Keep the frontend server running on port `5500`, then click **Start a review**. The backend reads secrets from the root `.env` file. The key never goes into the browser.

For a deployed frontend, set `window.CODELENS_API_URL` before loading `script.js`, and set `FRONTEND_ORIGINS` to the exact frontend origin.

## PostgreSQL deployment

Install the backend dependencies and configure these variables in `.env` or your hosting provider:

```text
DATABASE_URL=postgresql+psycopg://username:password@host:5432/codelens
AUTH_SECRET=long-random-secret-at-least-32-characters
FRONTEND_ORIGINS=https://your-frontend.example
ENABLE_CODE_EXECUTION=false
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

The application creates the `users` table on startup. Use a managed PostgreSQL database and persistent backups in production.

## Deploy with Aiven, Render, and Docker

1. Push this repository to GitHub.
2. In Aiven, create a PostgreSQL service and database. Copy its connection string, including `sslmode=require` if Aiven provides it.
3. In Render, choose **New > Blueprint** and select the repository. Render will read [render.yaml](render.yaml) and create the Docker API and static frontend services.
4. In the Render API service environment variables, set `DATABASE_URL` to the Aiven connection string. Also set `FRONTEND_ORIGINS` to the exact frontend URL and add `GEMINI_API_KEY` if needed.
5. After the services are created, copy the public URLs for `codelens-api` and `codelens-frontend`.
6. In [index.html](index.html), add this line immediately before the `script.js` tag, replacing the URL with the actual API URL:

```html
<script>window.CODELENS_API_URL = 'https://codelens-api.onrender.com';</script>
<script src="script.js"></script>
```

7. Redeploy the frontend after adding the API URL. Keep `GEMINI_API_KEY` in the API service only. Do not put it in frontend files.

The backend automatically creates the `users` table in Aiven on startup. It accepts Aiven's standard `postgresql://` URL and selects the installed `psycopg` driver automatically.

### Run the Docker API locally

Create a root `.env` file from [.env.example](.env.example), replace `DATABASE_URL` with the Aiven URL, and run:

```powershell
docker compose up --build
```

The API will be available at `http://localhost:8000`. The frontend can continue running through VS Code Live Server on port `5500`.

## What is included

- Developer dashboard with project, review, bug, and test statistics
- Review activity chart and code health summary
- Project list page
- Review history page with search
- Settings page for the future backend and AI connection
- New project modal with a small working interaction
- Responsive layout for smaller screens
- Gemini-powered code review workspace through the FastAPI backend
- Local Python run endpoint with a five-second timeout for development

The `/api/run` endpoint executes arbitrary Python and defaults to disabled. For local development set `ENABLE_CODE_EXECUTION=true`; before enabling it publicly, replace it with a properly isolated job runner such as a locked-down container or separate sandbox service with CPU, memory, filesystem, process, and network limits.

## Next step

The next phase can add a FastAPI backend, user authentication, a real code editor, Docker execution, and the LLM API connection.
