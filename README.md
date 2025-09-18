# AptivHire — Recruiting Multi-Agent System

Professional recruiting assistant web application (backend + frontend) that extracts job descriptions and candidate CVs, runs LLM-based matching, schedules interviews, and provides recruiter workflows. This repository contains a FastAPI backend and a Vite + React frontend.

---

## Project overview

AptivHire helps recruiters automate candidate screening and interview scheduling. The backend exposes structured endpoints for jobs, candidates, matches, and interviews, and integrates layered agents for CV parsing, job description parsing, and match/email generation. The frontend is a React single-page application created with Vite that consumes the API and provides an interactive UI for recruiters.

---

## Key features

* Upload and parse candidate CV (PDF → structured fields)
* Paste job description (free text → structured job fields)
* LLM-based matching agent produces match score, reasoning, and missing items
* Create and store matches and interviews in the database
* Email generation + sending (SMTP/Gmail API) for interview invitations
* Authentication (JWT access + refresh token) and protected API endpoints
* React frontend with pages for Dashboard, Jobs, Candidates, Matches, Interviews
* Pagination and search on listing pages


---

## Architecture & Components

* **Backend**: FastAPI, SQLAlchemy, PostgreSQL, Alembic for database migrations.
* **Agents / AI Layer**: LLM logic runs through Groq for inference. Agents are implemented as Pydantic-validated modules (Pydantic models + typed interfaces) that handle JD/CV parsing, matching, and email generation.
* **Email**: Asynchronous email handling using `aiosmtplib` for sending notifications and alerts.
* **Frontend**: Vite + React, with client-side token management and a `fetchWithAuth` utility for secure API requests.
* **Authentication**: JWT-based access and refresh token flow for secure user sessions.

---


## Prerequisites

* Python 3.11+
* Node.js 22+ and npm 
* PostgreSQL

---

## Repository layout

```
.
├── alembic/                    # alembic migrations
├── app/
│   ├── agents/                 # agent code (cv_agent, jd_agent, matcher_agent, scheduler_agent)
│   ├── auth.py                 # password hashing and JWT token management
│   ├── crud.py                 # CRUD helpers
│   ├── db.py                   # SQLAlchemy engine & session
│   ├── dependencies.py         # auth dependency and utilities
│   ├── models.py               # SQLAlchemy models
│   ├── routers/                # routers: jobs, candidates, matches, interviews, auth
│   ├── schemas/                # pydantic schemas
│   ├── utils/                  # email_sender, pdf_parser, etc.
│   ├── main.py                 # FastAPI app entrypoint
│   └── ...
├── frontend/                   # Vite + React app (src, public, package.json)
├── README.md
└── requirements.txt
```

---

## Environment variables

Create a `.env` file at project root (backend) and a `.env` for frontend. Example `.env` keys used by the project:

**Backend `.env`**

```env
DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/yourdb
GROQ_API_KEY=YOUR_API_KEY
SECRET_KEY=YOUR_SECRET_KEY_HERE

# If using SMTP
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-smtp-password-or-app-password
```

**Frontend `.env` (vite)**

```
VITE_API_BASE=http://localhost:8000
```

> Notes:
>
> * If using Gmail SMTP: enable 2FA, create an *App Password*, and update imports in interview routes to use:
>   ```python
>   from app.utils.email_sender import send_email
>   ```
>   instead of `gmail_helper`.
> * If using Gmail API: refer to the [Gmail API guide](https://github.com/ratul-d/AptivHire/blob/master/app/utils/gmail%20api.md).

---

## Backend — setup & run

### Install Python dependencies

```bash
# If using uv (recommended)
uv sync

# Or with plain venv + pip
python -m venv .venv
source .venv/bin/activate        # macOS / Linux
# .venv\Scripts\activate         # Windows PowerShell

pip install -r requirements.txt
```

### Database setup & migrations (Alembic)

1. Configure `DATABASE_URL` in `.env`.
2. Initialize database if needed (create database in PostgreSQL).
3. Create and run alembic migrations:

```bash
# apply migrations
alembic upgrade head
```

### Run backend server

From the project root:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## Frontend — setup & run

From the `frontend/` folder:

```bash
cd frontend
npm install
npm run dev
```

---

## API overview

> Authentication:

* `POST /auth/register` — Register with JSON body: `{ "email": "<email>", "password": "<password>" }`.

* `POST /auth/login` — Login with JSON body: `{ "email": "<email>", "password": "<password>" }`.
  Returns `access_token` and `refresh_token` in JSON on success:

  ```json
  {
    "msg": "Login Successful",
    "access_token": "<jwt>",
    "refresh_token": "<jwt>",
    "token_type": "bearer"
  }
  ```


* `POST /auth/refresh` — Refresh access token with JSON body: `{ "refresh_token": "<refresh_jwt>" }` → returns a new access token:

  ```json
  { "msg": "Token Refreshed", "access_token": "<new_jwt>", "token_type": "bearer" }
  ```


> Notes on authentication

* Protected endpoints require a valid access token. Include it in requests using the `Authorization` header:

  ```
  Authorization: Bearer <access_token>
  ```
* Tokens are JWTs; respect the token expiry and use the refresh endpoint to obtain a new access token when needed.

> Jobs:

* `POST /jobs/create` — Create job (protected). Body: either raw JD input or structured JD JSON depending on client. Example (raw):

  ```json
  { "raw_text": "Full job description here..." }
  ```

* `GET /jobs/read` — List jobs (protected). Returns an array of `Job` objects.

* `GET /jobs/{job_id}` — Get job by ID (protected). Returns single `Job`.

> Candidates:

* `POST /candidates/create` — Upload a candidate PDF (protected). Use `multipart/form-data` with field name `file`. Returns structured candidate data extracted from the PDF.
  

* `GET /candidates/read` — List candidates (protected). Returns an array of `Candidate` objects.

* `GET /candidates/{candidate_id}` — Get candidate by ID (protected). Returns single `Candidate`.

> Matches:

* `POST /matches/create` — Compute and store a match (protected). Body should include `job_id` and `candidate_id` (JSON). Example:

  ```json
  { "job_id": 1, "candidate_id": 2 }
  ```

  Returns created `Match` object. Duplicate matches are returned if they already exist.

* `GET /matches/read` — List matches (protected). Returns an array of `Match` objects.

* `GET /matches/{job_id}/{candidate_id}` — Get a specific match (protected). Returns single `Match`.

> Interviews:

* `POST /interviews/create` — Schedule interview (protected). Expected JSON fields:

  ```json
  {
    "job_id": 1,
    "candidate_id": 2,
    "interview_datetime": "2025-09-14T15:30:00+05:30",
    "interview_format": "onsite"
  }
  ```

  *Behavior:* prevents duplicate interview records for the same job & candidate. Generates email content (via agent) and attempts to send an invite. Returns created `Interview` on success.

* `GET /interviews/read` — List interviews (protected). Returns an array of `Interview` objects.

* `GET /interviews/{job_id}/{candidate_id}` — Get interview for a specific job & candidate (protected). Returns single `Interview`.

> Common query params and headers

* Pagination: `skip` (default `0`), `limit` (default `100`).
* Auth: `Authorization: Bearer <access_token>`.
* Content-Type: JSON endpoints — `application/json`; file upload — `multipart/form-data` (field `file`).

> Example cURL (login)

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"recruiter@example.com","password":"password"}'
```

> Example cURL (create job — protected)

```bash
curl -X POST http://localhost:8000/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"raw_text":"Senior backend engineer — 5+ years experience in Python, FastAPI, PostgreSQL."}'
```

> Response models

* All responses are JSON. Models for `Job`, `Candidate`, `Match`, and `Interview` are defined in `app.schemas`.

> Error handling (common)

* `200` / `201` — Success
* `400` — Bad request / validation error
* `401` — Unauthorized / invalid token
* `404` — Not found
* `460` — Domain-specific conflict (duplicate interview)
* `500` — Server / processing error


---

## Authentication & security notes

* Backend uses JWT (access + refresh) — access tokens are short-lived; refresh token flow is implemented.
* Frontend stores tokens in `localStorage` (implementation convenience). For higher security, use httpOnly cookies set by the server to mitigate XSS.
* Protect all sensitive endpoints with dependency `get_current_user`.
* Use HTTPS in production.
* Rotate `SECRET_KEY` and protect `.env` values.

---

## Development notes

* Use `alembic` for DB schema changes — review autogenerated migrations carefully.
* When converting columns (e.g., string → datetime) use `postgresql_using` expression to avoid cast errors.

---

## Deployment considerations

* Use a production ASGI server (Uvicorn/Gunicorn) and process manager.
* Configure connection pooling for SQLAlchemy (set `pool_size`, etc.) for production DB.
* Use an external SMTP or email provider for sending messages at scale.
  * Additionally, a `gmail_helper.py` has been added that uses the Gmail API for sending emails.  
    Setup instructions are provided in the [Gmail API guide](https://github.com/ratul-d/AptivHire/blob/master/app/utils/gmail%20api.md).
* Use managed DB (RDS, Cloud SQL) with backups and replicas as needed.
* Store secrets in a secret manager (Vault, AWS Secrets Manager, Azure Key Vault).

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-feature`.
3. Run tests and linters.
4. Submit a pull request describing your changes.

Please open issues for bugs or feature requests.

---

## License

This project is licensed under the Apache License 2.0 — see the [LICENSE](./LICENSE) file for details.

---

## Contact

For questions or clarifications, open an issue in the repository with a detailed description and reproduction steps.

---