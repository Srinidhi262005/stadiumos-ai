# StadiumOS AI

StadiumOS AI is a demo-ready operations command center for stadium event management. It combines a modern Next.js frontend with a FastAPI backend, real-time WebSocket support, JWT authentication, operational dashboards, incident command workflows, accessibility and volunteer coordination, and AI-powered decision support.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Data Flow (Pin-to-Pin)](#data-flow-pin-to-pin)
- [Modules and Responsibilities](#modules-and-responsibilities)
- [Backend Environment Variables](#backend-environment-variables)
- [Local Setup](#local-setup)
- [Build and Deployment](#build-and-deployment)
- [API Endpoints](#api-endpoints)
- [Key Developer Notes](#key-developer-notes)

## Project Overview

StadiumOS AI is built to demonstrate a secure, full-stack event operations platform:

- Frontend: `Next.js 16.2.10`, `React 19.2.4`, `TypeScript`, `Tailwind`, `Zustand`, `shadcn/ui`
- Backend: `FastAPI`, `SQLAlchemy`, `SQLite` by default, JWT auth, AI fallback behavior, and WebSocket heartbeat support
- AI layer: Gemini AI integration with deterministic fallback logic when the API key is unavailable
- Demo-safe design: frontend components use backend services when available and static fallback data when not

## Architecture

### Frontend

The frontend is located in the root `app/` and `features/` directories. It includes:

- `app/page.tsx` — root landing logic that redirects authenticated users to `/dashboard` and unauthenticated users to `/login`
- `app/dashboard/page.tsx` — AI Command Center dashboard with KPI cards, timeline, and live demo narrative
- `features/incidents/page.tsx` — incident commander view with incident queue, AI action planning, and operator controls
- `app/login/page.tsx` — authentication entry point
- UI components in `components/` and shared helpers in `lib/`
- Store layer under `store/` with Zustand hooks for auth, dashboard, incidents, volunteers, accessibility, sustainability, and notifications
- API adapters under `services/api/`

### Backend

The backend is under `backend/` and includes:

- `backend/main.py` — FastAPI app bootstrap, CORS, startup/shutdown lifecycle, DB initialization, and heartbeat task
- `backend/core/config.py` — pydantic settings and environment variable binding
- `backend/core/security.py` — JWT creation, verification, password hashing, and OAuth2 security utilities
- `backend/core/websocket.py` — WebSocket connection manager, broadcast service, event model, and heartbeat support
- `backend/database/session.py` — SQLAlchemy engine, session factory, and declarative base
- `backend/database/seed.py` — initial seed data for development
- `backend/api/router.py` — central API router registering all versioned controllers
- `backend/api/routers/` — resource-specific REST controllers for auth, dashboard, crowd, AI, incidents, volunteers, accessibility, sustainability, reports, notifications, matches, and WebSocket
- `backend/services/` — domain services including auth and Gemini AI support
- `backend/models/` — SQLAlchemy models for the domain entities
- `backend/schemas/` — Pydantic request/response schemas

## Data Flow (Pin-to-Pin)

### 1. User session initialization

1. Browser loads `app/page.tsx`.
2. `useAuthStore` checks authentication state.
3. The page redirects to `/dashboard` or `/login`.

### 2. Client API requests

1. `services/api/client.ts` creates an axios instance.
2. It attaches the JWT access token from `useAuthStore` or cookies to every request.
3. Frontend service methods in `services/api/*.ts` call backend endpoints.

### 3. Dashboard data flow

1. `app/dashboard/page.tsx` uses `useDashboardStore`.
2. `dashboardStore.ts` calls `DashboardService.getStats()` and `DashboardService.getTimeline()`.
3. `services/api/dashboard.ts` requests `/dashboard/stats` and `/dashboard/timeline`.
4. Backend router `backend/api/routers/dashboard.py` handles the request and returns live operational data.
5. If the backend call fails, the frontend returns fallback demo data.

### 4. AI request flow

1. Frontend AI workflows send JSON to `backend/api/routers/ai.py`.
2. The AI router delegates to `backend/services/gemini_service.py` via dependency injection.
3. `GeminiService._call_gemini()` sends a request to the Gemini endpoint using `GEMINI_API_KEY`.
4. If the key is missing or the network fails, `build_contextual_fallback()` returns structured demo guidance.

### 5. WebSocket and real-time events

1. WebSocket clients connect to `backend/api/routers/websocket.py` at `/ws`.
2. Backend core services in `backend/core/websocket.py` maintain active connections and broadcast events.
3. Heartbeat events are emitted every 30 seconds from `backend/main.py` startup.

## Modules and Responsibilities

### Frontend modules

- `app/page.tsx` — root redirect and bootstrapping.
- `app/dashboard/page.tsx` — dashboard overview, KPI presentation, timeline visualization, and demo notifications.
- `features/incidents/page.tsx` — incident command UX, filtering, selection, AI actions, and incident lifecycle controls.
- `services/api/client.ts` — centralized axios client with JWT auth and refresh handling.
- `services/api/dashboard.ts` — dashboard-specific API adapter with fallback data.
- `store/index.ts` — exports the application store hooks.
- `store/*Store.ts` — Zustand stores for auth, dashboard, incidents, crowd, volunteers, accessibility, sustainability, notifications, and realtime state.

### Backend modules

- `backend/main.py` — application startup, database setup, background heartbeat, health endpoint, and router registration.
- `backend/core/config.py` — settings loader, env var parsing, and CORS host definitions.
- `backend/core/security.py` — password hashing and JWT lifecycle management.
- `backend/core/websocket.py` — Push event model, connection tracking, broadcast service, and heartbeat management.
- `backend/database/session.py` — SQLAlchemy session factory and `Base` metadata.
- `backend/database/seed.py` — development seed data and table population.
- `backend/api/router.py` — aggregates all API routers under `/api/v1`.
- `backend/api/routers/auth.py` — login, refresh, current user, logout, and role listing.
- `backend/api/routers/ai.py` — AI operational endpoints for incident, crowd, volunteer, accessibility, sustainability, and report insights.
- `backend/api/routers/websocket.py` — WebSocket lifecycle endpoint and status check.
- `backend/services/auth_service.py` — auth business logic for credentials, token generation, and user lookup.
- `backend/services/gemini_service.py` — AI request orchestration, prompt assembly, Gemini call, and structured fallback.
- `backend/prompts/*.py` — prompt templates for each AI task.
- `backend/models/*.py` — database entity definitions.
- `backend/schemas/*.py` — Pydantic models for request/response validation.

## Backend Environment Variables

Use `backend/.env.example` as the reference. Required variables include:

- `PROJECT_NAME` — friendly backend service name
- `ENVIRONMENT` — `development` or `production`
- `API_V1_STR` — API prefix, usually `/api/v1`
- `DATABASE_URL` — database connection string (`sqlite:///./stadiumos.db` for development)
- `SECRET_KEY` — JWT signing key
- `ALGORITHM` — JWT signing algorithm, typically `HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES` — access token lifetime
- `GEMINI_API_KEY` — Gemini AI API key for production AI responses
- `SUPABASE_URL` — Supabase project URL (placeholder integration)
- `SUPABASE_ANON_KEY` — Supabase anon key
- `ALLOWED_HOSTS` — allowed CORS origins

## Local Setup

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Set up backend environment

```bash
python -m venv backend/.venv
backend/.venv/Scripts/activate
pip install -r backend/requirements.txt
```

### 3. Configure backend env

Copy `backend/.env.example` to `backend/.env` and set production values for:

- `DATABASE_URL`
- `SECRET_KEY`
- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### 4. Run locally

```bash
npm run dev
```

Then start the backend separately with:

```bash
backend/.venv/Scripts/uvicorn backend.main:app --reload
```

## Build and Deployment

- Frontend production build: `npm run build`
- Backend production run: `uvicorn backend.main:app --host 0.0.0.0 --port 8000`
- Recommended deployment: host frontend on Vercel and backend on any FastAPI-compatible platform

## API Endpoints

### Auth

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/roles`

### Dashboard

- `GET /api/v1/dashboard/stats`
- `GET /api/v1/dashboard/timeline`

### AI

- `POST /api/v1/ai/incident`
- `POST /api/v1/ai/crowd`
- `POST /api/v1/ai/volunteer`
- `POST /api/v1/ai/accessibility`
- `POST /api/v1/ai/sustainability`
- `POST /api/v1/ai/report`

### WebSocket

- `GET /ws/status`
- `/ws` WebSocket endpoint for real-time event streams

## Key Developer Notes

- The frontend uses a fallback-first pattern in `services/api/dashboard.ts` so the dashboard remains interactive even when the backend is unavailable.
- AI responses are handled by `backend/services/gemini_service.py` with safe fallback output in case Gemini is unreachable.
- The backend seed operation (`backend/database/seed.py`) creates base demo data on startup.
- The app uses JWT tokens and refresh logic via `backend/core/security.py`, `backend/services/auth_service.py`, and `services/api/client.ts`.
- `backend/core/websocket.py` is the core real-time infrastructure, while `backend/api/routers/websocket.py` exposes the socket endpoint.

## Contact

For questions, issue reports, or deployment details, use the repository issues on GitHub.
