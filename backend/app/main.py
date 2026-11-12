from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from .optimizer import Asset, run_optimizer, benchmark

app = FastAPI(title="Portfolio Optimizer API", version="1.0.0",
              description="DAA demonstration of 0/1 Knapsack using brute force and dynamic programming.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AssetInput(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    cost: int = Field(gt=0, le=1_000_000)
    returns: int = Field(ge=0, le=1_000_000, alias="return")
    model_config = {"populate_by_name": True}

class OptimizeRequest(BaseModel):
    budget: int = Field(gt=0, le=100_000)
    algorithm: str = Field(default="dp")
    assets: list[AssetInput] = Field(min_length=1, max_length=500)

    @field_validator("algorithm")
    @classmethod
    def valid_algorithm(cls, value):
        if value not in {"dp", "brute_force"}:
            raise ValueError("algorithm must be 'dp' or 'brute_force'")
        return value

class BenchmarkRequest(BaseModel):
    max_n: int = Field(default=19, ge=5, le=23)
    step: int = Field(default=2, ge=1, le=5)
    budget: int = Field(default=2000, ge=1, le=100_000)

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "portfolio-optimizer-api"}

@app.post("/api/optimize")
def optimize(request: OptimizeRequest):
    assets = [Asset(name=a.name, cost=a.cost, value=a.returns) for a in request.assets]
    if request.algorithm == "brute_force" and len(assets) > 23:
        raise HTTPException(status_code=400, detail="Brute force is limited to 23 assets.")
    try:
        result = run_optimizer(assets, request.budget, request.algorithm)
        result["budget"] = request.budget
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

@app.post("/api/benchmark")
def run_benchmark(request: BenchmarkRequest):
    return {"results": benchmark(request.max_n, request.step, request.budget)}
