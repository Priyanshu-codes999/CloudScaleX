# CloudScale X — Frontend

Intelligent hybrid cloud deployment & cost optimisation console. React 19 + Vite + Tailwind CSS v4 + Recharts,
talking directly to the existing CloudScale X Spring Boot backend.

## Data integrity

* There is **no mock backend and no sample data**. Every workload, placement recommendation and cost figure is
  returned by the Spring Boot API.
* When the backend is unreachable the UI shows a connection error and empty states — it never substitutes
  fabricated records, prices or chart values.
* Placement output comes from the transparent **rule-based** engine; it is never described as machine learning.
* Cost figures are labelled as **illustrative estimates** from the demonstration pricing model, not AWS quotations.

## Prerequisites

* Node.js 18+ (Node 20/22/24 recommended)
* The CloudScale X Spring Boot backend running and reachable, by default at `http://localhost:8080`
* CORS enabled on the backend for the Vite dev origin (`http://localhost:5173`)

## Setup

```bash
npm install
npm run dev
```

The app opens at `http://localhost:5173`.

### Backend URL configuration

Create a `.env` file (optional — the default is `http://localhost:8080`):

```dotenv
VITE_API_BASE_URL=http://localhost:8080
```

The active base URL can also be changed at runtime in **Settings → Backend connection** (stored in
`localStorage` and applied to every request immediately).

## Production build

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```

## API contract

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/v1/workloads` | List all workloads |
| POST | `/api/v1/workloads` | Register a workload |
| GET | `/api/v1/workloads/{id}` | Fetch one workload |
| GET | `/api/v1/placement/{id}` | Rule-based placement recommendation |
| GET | `/api/v1/cost/{id}` | Illustrative local vs AWS cost comparison |

POST request body:

```json
{
  "applicationName": "Example Application",
  "cpuCores": 2,
  "ramGb": 4,
  "expectedUsers": 1000,
  "monthlyBudget": 2000
}
```

The example above is documentation of the request schema only — it is never preloaded as a record.

## Project structure

```
src/
  components/    Sidebar, Topbar, StatCard, WorkloadForm, WorkloadTable,
                 PlacementCard, CostComparison, LoadingState, EmptyState,
                 ErrorState, Modal, Logo
  context/       DataContext (workloads + connection state), ToastContext
  pages/         Dashboard, Workloads, Placement, CostOptimization, Settings
  services/      api.js — the single place all backend calls are made
  lib/           utils.js — small formatting helpers
  App.jsx        Layout shell + routes
  main.jsx       Entry point
  index.css      Tailwind v4 theme (navy / charcoal + electric blue + cyan)
```

## Notes

* `GET /api/v1/placement/{id}` and `GET /api/v1/cost/{id}` responses are normalised defensively and the raw
  engine response is always available in the UI ("View raw … response"), so no information is hidden or invented.
* The Overview page charts only render when real records exist; otherwise they show empty states.
