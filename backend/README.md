# AirSense.AI Backend

FastAPI backend for AQI forecasting, health advisories, route planning, notifications, translation, chat, feedback, and admin workflows.

## Responsibilities

- Serve the versioned REST API under `/api/v1`.
- Authenticate users with JWT and optional Google sign-in.
- Persist users, health profiles, predictions, routes, exposure history, notifications, feedback, and admin data.
- Run AQI predictions through the ensemble ML runtime.
- Integrate with WAQI, OpenWeather, Google Maps, Geoapify, Sarvam AI, Groq, Redis, SMTP, and PostgreSQL.
- Provide production middleware for request IDs, correlation IDs, rate limiting, security headers, maintenance mode, request logging, CORS, GZip, and trusted hosts.
- Run scheduled background jobs through APScheduler.

## Local Setup

From the repository root, create or update `.env` using `.env.example`.

Then start the backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload
```

Useful URLs:

- Root: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- API base: `http://localhost:8000/api/v1`

## Required Environment

```env
DATABASE_URL="postgresql://user:password@localhost:5432/airsense"
REDIS_URL="redis://localhost:6379/0"
SECRET_KEY="replace-with-a-long-random-secret"
CORS_ORIGINS="http://localhost:5173"
```

Optional integrations:

```env
WAQI_API_KEY="..."
OPENWEATHER_API_KEY="..."
GOOGLE_MAPS_API_KEY="..."
GEOAPIFY_API_KEY="..."
SARVAM_AI_KEY="..."
GROQ_API_KEY="..."
GOOGLE_CLIENT_ID="..."
SMTP_SERVER="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USERNAME="..."
SMTP_PASSWORD="..."
```

## API Modules

| Module | Prefix | Purpose |
| --- | --- | --- |
| `system.py` | `/system` | Jobs and cache operations |
| `auth.py` | `/auth` | Registration, login, password reset, Google auth, logout |
| `users.py` | `/users` | Current user operations |
| `health_profile.py` | `/health-profile` | Personalized health profile |
| `preferences.py` | `/preferences` | User preferences |
| `aqi.py` | `/aqi` | Live AQI |
| `weather.py` | `/weather` | Weather and forecast |
| `predictions.py` | `/predictions` | Ensemble AQI forecast |
| `routes.py` | `/routes` | Smart route recommendation and history |
| `maps.py` | `/maps` | Geocoding, autocomplete, directions, distance matrix |
| `notifications.py` | `/notifications`, `/health-advisories` | Alerts and health advisories |
| `dashboard.py` | `/dashboard` | Summary, trends, charts, recent activity |
| `history.py` | `/history` | Prediction, route, exposure, and statistics history |
| `admin.py` | `/admin` | Admin operations, invites, analytics, logs, CMS |
| `translation.py` | `/translation` | Batch and static translation |
| `chat.py` | `/chat` | AI assistant |
| `feedback.py` | `/feedback` | Feedback submission and management |

## Database and Migrations

Alembic is configured in `backend/alembic.ini` and `backend/alembic/env.py`.

```bash
cd backend
alembic upgrade head
alembic revision --autogenerate -m "describe_change"
```

The application uses SQLAlchemy async sessions and automatically converts `postgresql://` URLs to `postgresql+asyncpg://`.

## ML Runtime

The model loader checks:

1. `ML_MODELS_DIR`
2. `backend/models`
3. `backend/backend/models`
4. `models`

Required files:

- `catboost_model.pkl` or `catboost_model.cbm`
- `lightgbm_model.pkl`
- `xgboost_model.pkl` or `xgboost_model.json`
- `robust_scaler.pkl`
- `selected_features.pkl`
- `ensemble_metadata.pkl` or `ensemble_info.pkl`

The prediction flow is:

1. Fetch live AQI data.
2. Fetch current weather.
3. Build the model feature vector.
4. Scale features with the training scaler.
5. Predict with CatBoost, LightGBM, and XGBoost.
6. Combine outputs using ensemble weights.
7. Store prediction history when enabled.

## Quality Checks

```bash
pytest
```

## Common Issues

| Issue | Fix |
| --- | --- |
| Backend stops during startup | Set `DATABASE_URL`, `REDIS_URL`, and `SECRET_KEY`. |
| Migration cannot connect | Confirm PostgreSQL is running and `DATABASE_URL` is correct. |
| Redis errors | Start Redis locally or update `REDIS_URL`. |
| Prediction fails | Confirm all model artifacts are present. |
| External data fails | Configure WAQI and OpenWeather keys. |
| Email is simulated | Add SMTP environment variables. |
