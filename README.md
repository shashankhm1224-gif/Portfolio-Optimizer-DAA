# Portfolio Optimizer – 0/1 Knapsack (DAA Lab Project)

A full-stack demonstration of the 0/1 Knapsack problem using:
- Recursive brute force: `O(2^N)` time, `O(N)` recursion stack
- Bottom-up dynamic programming: `O(N × B)` time; this implementation also stores reconstruction decisions in `O(N × B)` space

The app uses a FastAPI backend and a React + Vite frontend. It is an academic algorithm demonstration, **not financial advice**.

## Requirements
- Python 3.10+
- Node.js 18+ and npm

## 1. Run the backend
Open a terminal in the project root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend: http://127.0.0.1:8000  
Swagger API docs: http://127.0.0.1:8000/docs  
Health check: http://127.0.0.1:8000/api/health

On macOS/Linux, activate with `source .venv/bin/activate`.

## 2. Run the frontend
Open a **second** terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).

The frontend is configured to call `http://127.0.0.1:8000` by default. To change it, create `frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## 3. Run tests
From the project root:

```powershell
cd backend
pip install -r requirements.txt
pytest -q
```

## API
- `GET /api/health`
- `POST /api/optimize`
- `POST /api/benchmark`

Example optimize request:

```json
{
  "budget": 800,
  "algorithm": "dp",
  "assets": [
    {"name": "Index Fund", "cost": 420, "return": 82},
    {"name": "Growth Equity", "cost": 360, "return": 76},
    {"name": "Treasury Bonds", "cost": 240, "return": 38}
  ]
}
```

## Project structure
```text
Portfolio_Optimizer_DAA_Project/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   └── optimizer.py
│   ├── tests/
│   │   └── test_optimizer.py
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
└── README.md
```

## Notes
- Each asset is either selected completely (1) or not selected (0).
- Costs and returns must be non-negative integers; costs must be positive.
- Brute force is limited to 23 assets to avoid excessive request times.
- Benchmark timings vary by machine and server load. Run repeated trials for rigorous comparisons.
