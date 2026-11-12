from __future__ import annotations
from dataclasses import dataclass
from typing import Iterable
import time

@dataclass(frozen=True)
class Asset:
    name: str
    cost: int
    value: int

def brute_force(assets: list[Asset], budget: int) -> tuple[int, list[int]]:
    """Return maximum value and selected asset indices using recursive search."""
    n = len(assets)
    if n > 23:
        raise ValueError("Brute force is limited to 23 assets.")
    def solve(i: int, remaining: int) -> tuple[int, list[int]]:
        if i == n or remaining == 0:
            return 0, []
        best_value, best_indices = solve(i + 1, remaining)
        asset = assets[i]
        if asset.cost <= remaining:
            included_value, included_indices = solve(i + 1, remaining - asset.cost)
            included_value += asset.value
            if included_value > best_value:
                return included_value, [i] + included_indices
        return best_value, best_indices
    return solve(0, budget)

def dynamic_programming(assets: list[Asset], budget: int) -> tuple[int, list[int]]:
    """Bottom-up 0/1 knapsack using a 1D value array and stored reconstruction decisions."""
    n = len(assets)
    dp = [0] * (budget + 1)
    # Store decisions for reconstruction; decisions[i][b] indicates whether item i
    # improved the best value at capacity b during its iteration.
    decisions = [[False] * (budget + 1) for _ in range(n)]
    for i, asset in enumerate(assets):
        for capacity in range(budget, asset.cost - 1, -1):
            candidate = asset.value + dp[capacity - asset.cost]
            if candidate > dp[capacity]:
                dp[capacity] = candidate
                decisions[i][capacity] = True

    chosen = []
    capacity = budget
    for i in range(n - 1, -1, -1):
        if decisions[i][capacity]:
            chosen.append(i)
            capacity -= assets[i].cost
    chosen.reverse()
    return dp[budget], chosen

def run_optimizer(assets: list[Asset], budget: int, algorithm: str) -> dict:
    start = time.perf_counter()
    if algorithm == "brute_force":
        best_value, indices = brute_force(assets, budget)
        complexity = "O(2^N) time, O(N) recursion stack"
    elif algorithm == "dp":
        best_value, indices = dynamic_programming(assets, budget)
        complexity = "O(N × B) time, O(N × B) reconstruction decisions"
    else:
        raise ValueError("algorithm must be 'dp' or 'brute_force'")
    elapsed_ms = (time.perf_counter() - start) * 1000
    selected = [assets[i] for i in indices]
    return {
        "algorithm": algorithm,
        "maximum_return": best_value,
        "total_cost": sum(a.cost for a in selected),
        "selected_assets": [{"name": a.name, "cost": a.cost, "return": a.value} for a in selected],
        "execution_time_ms": round(elapsed_ms, 4),
        "complexity": complexity,
    }

def benchmark(max_n: int = 19, step: int = 2, budget: int = 2000) -> list[dict]:
    """Compare both solvers on deterministic generated data."""
    import random
    rng = random.Random(42)
    rows = []
    for n in range(5, max_n + 1, step):
        assets = [Asset(f"Asset {i+1}", rng.randint(80, 500), rng.randint(15, 120)) for i in range(n)]
        # Measure each once; timings are illustrative and machine-dependent.
        t0 = time.perf_counter()
        brute_force(assets, budget)
        brute_ms = (time.perf_counter() - t0) * 1000
        t0 = time.perf_counter()
        dynamic_programming(assets, budget)
        dp_ms = (time.perf_counter() - t0) * 1000
        rows.append({"assets": n, "brute_force_ms": round(brute_ms, 4), "dp_ms": round(dp_ms, 4)})
    return rows
