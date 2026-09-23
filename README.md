# AirSense.AI

<p align="center">
  <img src="assets/image.png" alt="AirSense.AI dashboard preview" width="1100" />
</p>

AI-Based Environmental Pollution Forecasting System for Personalized Health Alerts and Smart Route Planning.

AirSense.AI is a full-stack environmental intelligence platform that combines live air-quality data, weather data, machine-learning AQI forecasting, personal health profiles, and pollution-aware route planning. The application helps users understand current exposure, forecast near-term risk, receive health guidance, and choose safer routes through polluted urban environments.

## Project Overview

- Real-time AQI and weather monitoring
- Personalized health-risk alerts based on user profile
- Machine learning-based pollution forecasting
- Safer route suggestions with exposure-aware travel analysis
- Admin insights, notifications, and feedback management

## Table of Contents

- [Highlights](#highlights)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [ML Model Artifacts](#ml-model-artifacts)
- [API Overview](#api-overview)
- [Frontend Routes](#frontend-routes)
- [Data Science Workflow](#data-science-workflow)
- [Quality Checks](#quality-checks)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Project Documentation](#project-documentation)

## Highlights

- Ensemble AQI forecasting with CatBoost, LightGBM, and XGBoost model support.
- Live AQI ingestion through WAQI with OpenWeather air-pollution fallback logic.
- Weather-aware feature engineering for pollution forecasting.
- Personalized risk guidance for asthma, COPD, heart disease, elderly users, children, pregnant users, and general users.
- Smart route recommendations that score alternatives by AQI exposure, health impact, distance, duration, and safety.
- Route history, prediction history, exposure analytics, and saved health profile data.
- Real-time notification center, health advisories, feedback workflow, and admin operations.
- Multilingual page translation support through Sarvam AI integration.
- AI chat assistant powered through Groq when configured.
- Production-minded FastAPI backend with structured logging, Redis cache, rate limiting, security headers, scheduled jobs, and Alembic migrations.
- Responsive React dashboard with protected user and admin areas.

## Architecture

```mermaid
flowchart LR
    User[User Browser] --> Frontend[React + Vite Frontend]
    Frontend --> API[FastAPI Backend]
    API --> DB[(PostgreSQL)]
    API --> Redis[(Redis)]
    API --> ML[ML Ensemble Runtime]
    API --> WAQI[WAQI API]
    API --> OWM[OpenWeather API]
    API --> Maps[Google Maps / Geoapify]
    API --> Sarvam[Sarvam AI]
    API --> Groq[Groq Chat API]
    API --> SMTP[SMTP Provider]
```

The frontend talks to the backend through `VITE_API_URL`, which should point to the versioned API base such as `http://localhost:8000/api/v1`.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Zustand |
| UI and visualization | Radix UI, Lucide React, Framer Motion, Recharts, Leaflet |
| Backend | FastAPI, Pydantic v2, SQLAlchemy async, Alembic, Uvicorn |
| Data stores | PostgreSQL, Redis |
| ML | scikit-learn, CatBoost, LightGBM, XGBoost, pandas, NumPy, joblib |
| Integrations | WAQI, OpenWeather, Google Maps, Geoapify, Sarvam AI, Groq, SMTP |
| Deployment | Render blueprint with backend, static frontend, Redis, and PostgreSQL |

## Repository Structure

```text
.
|-- README.md
|-- render.yaml
|-- .env.example
|-- backend/
|   |-- main.py
|   |-- requirements.txt
|   |-- alembic/
|   `-- app/
|       |-- api/
|       |-- api_clients/
|       |-- core/
|       |-- middleware/
|       |-- ml/
|       |-- models/
|       |-- repositories/
|       |-- schemas/
|       |-- services/
|       `-- utils/
|-- frontend/
|   |-- package.json
|   |-- vite.config.ts
|   |-- public/
|   `-- src/
|       |-- components/
|       |-- features/
|       |-- layouts/
|       |-- pages/
|       |-- routes/
|       |-- services/
|       `-- store/
|-- Notebook/
|   |-- 01_data_preparation.ipynb
|   |-- 02_EDA.ipynb
|   |-- 03_feature_engineering.ipynb
|   |-- 04_model_training.ipynb
|   |-- 05_ensemble.ipynb
|   `-- 07_inference.ipynb
`-- models/
```

## Quick Start

### Prerequisites

- Python 3.11 or newer
- Node.js 20 or newer
- npm
- PostgreSQL
- Redis
- API keys for the external services you want to enable

### 1. Configure Environment

Create a local environment file from the example:

```bash
cp .env.example .env
```

At minimum, configure:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/airsense"
REDIS_URL="redis://localhost:6379/0"
SECRET_KEY="replace-with-a-long-random-secret"
VITE_API_URL="http://localhost:8000/api/v1"
```

You can generate a strong secret key with:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

### 2. Start the Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload
```

Backend URLs:

- API root: `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`
- ReDoc docs: `http://localhost:8000/redoc`
- Versioned API base: `http://localhost:8000/api/v1`

### 3. Start the Frontend

Open a second terminal:

```bash
cd frontend
npm ci
npm run dev
```

Frontend URL:

- App: `http://localhost:5173`

## Environment Variables

The backend reads `.env` from the current backend directory or from the project root. The frontend also reads the project-root `.env` because `frontend/vite.config.ts` sets `envDir` to the repository root.

### Required Core Variables

| Variable | Used By | Description |
| --- | --- | --- |
| `DATABASE_URL` | Backend | PostgreSQL connection string. `postgresql://` is automatically converted to `postgresql+asyncpg://`. |
| `REDIS_URL` | Backend | Redis connection string for cache, token blacklist, and background services. |
| `SECRET_KEY` | Backend | JWT signing secret. Use a long random value. |
| `VITE_API_URL` | Frontend | Backend API base URL, including `/api/v1`. |

### Recommended Variables

| Variable | Used By | Description |
| --- | --- | --- |
| `CORS_ORIGINS` | Backend | Comma-separated allowed frontend origins. Defaults to `http://localhost:5173`. |
| `DEBUG` | Backend | Enables debug logging and SQL echo when true. |
| `LOG_LEVEL` | Backend | Logging level such as `INFO`, `DEBUG`, or `ERROR`. |
| `API_VERSION` | Backend | API version prefix. Defaults to `v1`. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Backend | JWT lifetime in minutes. |

### External Service Variables

| Variable | Used By | Description |
| --- | --- | --- |
| `WAQI_API_KEY` | Backend | Live AQI data provider. |
| `OPENWEATHER_API_KEY` | Backend | Weather data and air-pollution fallback provider. |
| `VITE_OPENWEATHER_API_KEY` | Frontend | Frontend OpenWeather usage in health features. |
| `GOOGLE_MAPS_API_KEY` | Backend | Directions, maps, and route calculations. |
| `VITE_GOOGLE_MAPS_API_KEY` | Frontend | Browser-side maps functionality if enabled. |
| `GEOAPIFY_API_KEY` | Backend | Geocoding and autocomplete support. |
| `SARVAM_AI_KEY` | Backend | Translation support. |
| `GROQ_API_KEY` | Backend | AI chat assistant support. |
| `GOOGLE_CLIENT_ID` | Backend | Google authentication token verification. |
| `VITE_GOOGLE_CLIENT_ID` | Frontend | Google sign-in button. |
| `SMTP_SERVER` | Backend | SMTP hostname for email delivery. |
| `SMTP_PORT` | Backend | SMTP port, commonly `587`. |
| `SMTP_USERNAME` | Backend | Sender account username. |
| `SMTP_PASSWORD` | Backend | Sender account password or app password. |

If SMTP variables are missing, the backend simulates email sending by printing the message content to the server logs.

## ML Model Artifacts

The prediction service loads model artifacts at startup through `backend/app/ml/model_loader.py`.

The loader checks these directories, in order of available artifacts:

1. `ML_MODELS_DIR` if set
2. `backend/models`
3. `backend/backend/models`
4. `models`

A complete prediction runtime should include:

| Artifact | Purpose |
| --- | --- |
| `catboost_model.pkl` or `catboost_model.cbm` | CatBoost AQI regressor |
| `lightgbm_model.pkl` | LightGBM AQI regressor |
| `xgboost_model.pkl` or `xgboost_model.json` | XGBoost AQI regressor |
| `robust_scaler.pkl` | Feature scaler |
| `selected_features.pkl` | Ordered feature list used during training |
| `ensemble_metadata.pkl` or `ensemble_info.pkl` | Ensemble weights and model metadata |

If the API returns `Model prediction failed`, first confirm that all model files above are available and readable by the backend process.

## API Overview

Interactive documentation is available at `http://localhost:8000/docs` after the backend starts.

| Area | Base Path | Capabilities |
| --- | --- | --- |
| System | `/api/v1/system` | Job inspection, manual job execution, cache refresh, cache clear |
| Auth | `/api/v1/auth` | Registration, login, Google auth, refresh, password reset, email verification, logout |
| Users | `/api/v1/users` | Current user profile, password change, account deletion |
| Health Profile | `/api/v1/health-profile` | Read and update personalized health risk profile |
| Preferences | `/api/v1/preferences` | User preference management |
| AQI | `/api/v1/aqi` | Live AQI lookup |
| Weather | `/api/v1/weather` | Current weather and forecast |
| Predictions | `/api/v1/predictions` | AQI forecast generation |
| Routes | `/api/v1/routes` | Pollution-aware route recommendation, selection, and route history |
| Maps | `/api/v1/maps` | Geocode, autocomplete, reverse geocode, directions, distance matrix |
| Notifications | `/api/v1/notifications` | Notification list, unread items, mark read, delete |
| Health Advisories | `/api/v1/health-advisories` | Health advisory delivery |
| Dashboard | `/api/v1/dashboard` | Summary cards, recent activity, trends, charts |
| History | `/api/v1/history` | Prediction, route, exposure, and statistics history |
| Admin | `/api/v1/admin` | User management, invites, analytics, logs, notifications, CMS |
| Translation | `/api/v1/translation` | Batch and static translation support |
| Chat | `/api/v1/chat` | AI assistant responses |
| Feedback | `/api/v1/feedback` | User feedback and admin feedback workflows |

## Frontend Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page |
| `/login` | Public | User login |
| `/signup` | Public | User registration |
| `/forgot-password` | Public | Password reset request |
| `/reset-password` | Public | Password reset completion |
| `/verify-email` | Public | Email verification |
| `/dashboard` | User | Main AQI, weather, health, and route dashboard |
| `/health` | User | Health profile, exposure analytics, advisories, and activity planning |
| `/prediction` | User | AI AQI prediction workflow |
| `/routes` | User | Smart route search, map, comparison, and live navigation panel |
| `/history` | User | Prediction, route, exposure, and export history |
| `/profile` | User | Account profile |
| `/settings` | User | Account, privacy, appearance, connected apps, and notification settings |
| `/admin` | Admin, Super Admin | Admin dashboard and operational tools |

## Data Science Workflow

The `Notebook/` directory captures the ML lifecycle:

1. `01_data_preparation.ipynb` prepares raw pollution and weather data.
2. `02_EDA.ipynb` explores distributions, trends, and relationships.
3. `03_feature_engineering.ipynb` builds model-ready temporal, pollutant, weather, and interaction features.
4. `04_model_training.ipynb` trains base models.
5. `05_ensemble.ipynb` combines model outputs and saves ensemble metadata.
6. `07_inference.ipynb` validates inference behavior against exported artifacts.

After training, export the artifacts listed in [ML Model Artifacts](#ml-model-artifacts) to a loader-visible model directory.

## Quality Checks

### Backend

```bash
cd backend
pytest
```

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

## Deployment

The repository includes a Render blueprint at `render.yaml` that defines:

- `pollution-backend`: Python web service running FastAPI.
- `pollution-frontend`: Static Vite build.
- `pollution-redis`: Redis instance.
- `pollution-db`: PostgreSQL database.
- `pollution-secrets`: Environment group for API keys and secrets.

Before deploying:

1. Add all required secrets in the Render environment group.
2. Ensure `VITE_API_URL` points to the deployed backend API base, including `/api/v1`.
3. Ensure `CORS_ORIGINS` includes the deployed frontend origin.
4. Upload or mount the complete ML model artifact set.
5. Run Alembic migrations with `alembic upgrade head`.

## Troubleshooting

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| Backend exits on startup | Missing `DATABASE_URL`, `REDIS_URL`, or `SECRET_KEY` | Add the required variables to `.env`. |
| Frontend requests 404 | `VITE_API_URL` missing `/api/v1` | Set `VITE_API_URL=http://localhost:8000/api/v1`. |
| CORS errors | Frontend origin not allowed | Set `CORS_ORIGINS=http://localhost:5173` locally or to the deployed frontend origin in production. |
| `External data unavailable` | AQI/weather provider key missing or upstream API unavailable | Configure `WAQI_API_KEY` and `OPENWEATHER_API_KEY`. |
| `Model prediction failed` | Missing or unreadable ML artifacts | Check `ML_MODELS_DIR` and required model files. |
| Emails do not send | SMTP settings missing | Set `SMTP_SERVER`, `SMTP_PORT`, `SMTP_USERNAME`, and `SMTP_PASSWORD`. |
| Google login unavailable | Google client ID missing | Set both `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID`. |

## Project Documentation

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Notebook README](Notebook/README.md)

## Sample Screenshots

<p align="center">
  <img src="assets/image.png" alt="AirSense.AI home dashboard" width="48%" />
  <img src="assets/image-1.png" alt="AirSense.AI route planning view" width="48%" />
</p>

<p align="center">
  <img src="assets/image-2.png" alt="AirSense.AI health insights dashboard" width="48%" />
  <img src="assets/image-3.png" alt="AirSense.AI prediction analytics" width="48%" />
</p>

These previews highlight the main experience of the platform: live air quality monitoring, health-aware recommendations, forecasting insights, and route planning for safer urban movement.