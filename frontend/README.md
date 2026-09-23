# AirSense.AI Frontend

React and Vite frontend for the AirSense.AI environmental health dashboard.

## Responsibilities

- Public landing, login, signup, password reset, email verification, unauthorized, and session-expired flows.
- Protected user dashboard for AQI, weather, health analytics, predictions, route planning, history, profile, and settings.
- Admin dashboard for user management, system status, invites, API logs, notification logs, feedback, and health advisory CMS.
- API communication through a shared Axios client.
- Client state through Zustand and server state through TanStack Query.
- Responsive UI with Tailwind CSS, Radix UI primitives, Lucide icons, Framer Motion, Recharts, and Leaflet.

## Local Setup

The Vite config reads environment variables from the repository root.

```bash
cd frontend
npm ci
npm run dev
```

Open:

```text
http://localhost:5173
```

## Environment

Set these in the repository-root `.env`:

```env
VITE_API_URL="http://localhost:8000/api/v1"
VITE_OPENWEATHER_API_KEY="..."
VITE_GOOGLE_MAPS_API_KEY="..."
VITE_GOOGLE_CLIENT_ID="..."
```

`VITE_API_URL` must include the versioned backend prefix `/api/v1` because frontend services call relative endpoints such as `/aqi/live`, `/routes/recommend`, and `/predictions/predict`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check and build production assets. |
| `npm run lint` | Run Oxlint. |
| `npm run preview` | Preview the built app locally. |

## Routes

| Route | Access | Page |
| --- | --- | --- |
| `/` | Public | Home |
| `/login` | Public | Login |
| `/signup` | Public | Signup |
| `/forgot-password` | Public | Forgot password |
| `/reset-password` | Public | Reset password |
| `/verify-email` | Public | Email verification |
| `/unauthorized` | Public | Unauthorized |
| `/session-expired` | Public | Session expired |
| `/dashboard` | User | Dashboard |
| `/health` | User | Health |
| `/prediction` | User | Prediction |
| `/routes` | User | Smart routes |
| `/history` | User | History |
| `/profile` | User | Profile |
| `/settings` | User | Settings |
| `/admin` | Admin, Super Admin | Admin |

## Source Layout

```text
src/
|-- components/
|   |-- auth/
|   |-- shared/
|   `-- ui/
|-- constants/
|-- features/
|   |-- admin/
|   |-- auth/
|   |-- dashboard/
|   |-- feedback/
|   |-- health/
|   |-- history/
|   |-- notifications/
|   |-- prediction/
|   |-- routes/
|   `-- settings/
|-- hooks/
|-- i18n/
|-- layouts/
|-- pages/
|-- providers/
|-- routes/
|-- services/
|-- store/
`-- utils/
```

## API Client

The shared client lives in `src/services/client.ts`:

```ts
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
```

Interceptors are initialized in `src/services/api.ts`.

## Quality Checks

```bash
npm run lint
npm run build
```

## Common Issues

| Issue | Fix |
| --- | --- |
| API calls return 404 | Set `VITE_API_URL` to include `/api/v1`. |
| Browser blocks requests | Add the frontend origin to backend `CORS_ORIGINS`. |
| Google sign-in missing | Set `VITE_GOOGLE_CLIENT_ID` and backend `GOOGLE_CLIENT_ID`. |
| Health weather cards missing data | Set `VITE_OPENWEATHER_API_KEY` if using browser-side OpenWeather features. |
