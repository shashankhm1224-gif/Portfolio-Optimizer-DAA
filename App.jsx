
import { useMemo, useState } from 'react';
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from 'recharts';

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const initialAssets = [
  { name: 'Index Fund', cost: 420, returns: 82 },
  { name: 'Treasury Bonds', cost: 240, returns: 38 },
  { name: 'Growth Equity', cost: 360, returns: 76 },
  { name: 'Dividend Fund', cost: 290, returns: 53 },
];

export default function App() {
  const [assets, setAssets] = useState(initialAssets);
  const [budget, setBudget] = useState(800);
  const [algorithm, setAlgorithm] = useState('dp');
  const [result, setResult] = useState(null);
  const [benchmark, setBenchmark] = useState([]);
  const [benchmarkBusy, setBenchmarkBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const totalCost = useMemo(
    () => assets.reduce((sum, a) => sum + Number(a.cost || 0), 0),
    [assets]
  );

  const updateAsset = (index, field, value) =>
    setAssets(current =>
      current.map((a, i) =>
        i === index
          ? { ...a, [field]: field === 'name' ? value : Number(value) }
          : a
      )
    );

  const addAsset = () =>
    setAssets(current => [
      ...current,
      {
        name: `New Asset ${current.length + 1}`,
        cost: 100,
        returns: 20
      }
    ]);

  const removeAsset = index =>
    setAssets(current => current.filter((_, i) => i !== index));

  async function optimize() {
    setBusy(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API}/api/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget: Number(budget),
          algorithm,
          assets: assets.map(a => ({
            ...a,
            return: Number(a.returns)
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Unable to calculate result');
      }

      setResult(data);
    } catch (e) {
      setError(
        `${e.message}. Check that the FastAPI backend is running at ${API}.`
      );
    } finally {
      setBusy(false);
    }
  }

  async function runBenchmark() {
    setError('');
    setBenchmarkBusy(true);
    setBenchmark([]);

    try {
      const response = await fetch(`${API}/api/benchmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_n: 19,
          step: 2,
          budget: 2000
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Benchmark failed');
      }

      if (!data.results || data.results.length === 0) {
        throw new Error('No benchmark results received');
      }

      setBenchmark(data.results);
    } catch (e) {
      setError(`${e.message}. Check the backend connection.`);
    } finally {
      setBenchmarkBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-mark">P</span> PORTFOLIO
          <span className="brand-light">LAB</span>
        </a>
        <span className="course-tag">
          DESIGN & ANALYSIS OF ALGORITHMS
        </span>
      </header>

      <main className="container">
        <section className="hero">
          <div>
            <p className="eyebrow">ALGORITHM WORKBENCH / 01</p>
            <h1>
              Make every choice
              <br />
              <span>count.</span>
            </h1>
            <p className="hero-copy">
              Explore the 0/1 Knapsack problem. Allocate a fixed budget
              across assets and compare recursive brute force with
              dynamic programming.
            </p>
          </div>

          <div className="hero-stat">
            <span className="stat-label">PROBLEM TYPE</span>
            <strong>0 / 1</strong>
            <span>KNAPSACK OPTIMIZATION</span>
            <div className="stat-line"></div>
            <small>Each asset is selected whole — or not at all.</small>
          </div>
        </section>

        <section className="workspace-grid">
          <div className="panel asset-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">01 — INPUT</p>
                <h2>Investment universe</h2>
              </div>
              <button className="text-button" onClick={addAsset}>
                ＋ Add asset
              </button>
            </div>

            <div className="asset-table">
              <div className="table-head">
                <span>ASSET NAME</span>
                <span>COST ($)</span>
                <span>RETURN ($)</span>
                <span></span>
              </div>

              {assets.map((asset, i) => (
                <div className="asset-row" key={i}>
                  <input
                    aria-label="Asset name"
                    value={asset.name}
                    onChange={e =>
                      updateAsset(i, 'name', e.target.value)
                    }
                  />

                  <input
                    aria-label="Asset cost"
                    type="number"
                    min="1"
                    value={asset.cost}
                    onChange={e =>
                      updateAsset(i, 'cost', e.target.value)
                    }
                  />

                  <input
                    aria-label="Expected return"
                    type="number"
                    min="0"
                    value={asset.returns}
                    onChange={e =>
                      updateAsset(i, 'returns', e.target.value)
                    }
                  />

                  <button
                    className="remove-button"
                    aria-label="Remove asset"
                    onClick={() => removeAsset(i)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="budget-box">
              <div>
                <label htmlFor="budget">TOTAL AVAILABLE BUDGET</label>
                <div className="budget-input">
                  <span>$</span>
                  <input
                    id="budget"
                    type="number"
                    min="1"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                  />
                </div>
              </div>

              <div className="budget-note">
                <span>Universe value</span>
                <strong>${totalCost.toLocaleString()}</strong>
              </div>
            </div>

            <div className="algorithm-select">
              <label htmlFor="algorithm">SELECT ALGORITHM</label>
              <select
                id="algorithm"
                value={algorithm}
                onChange={e => setAlgorithm(e.target.value)}
              >
                <option value="dp">
                  Dynamic Programming · O(N × B)
                </option>
                <option value="brute_force">
                  Recursive Brute Force · O(2^N)
                </option>
              </select>
            </div>

            <button
              className="primary-button"
              disabled={
                busy ||
                !assets.length ||
                Number(budget) <= 0 ||
                assets.some(a => !a.name.trim() || Number(a.cost) <= 0)
              }
              onClick={optimize}
            >
              {busy ? 'Calculating…' : 'Run optimization'}
              <span>↗</span>
            </button>

            {algorithm === 'brute_force' && assets.length > 23 && (
              <p className="hint warning">
                Brute force supports up to 23 assets.
              </p>
            )}
          </div>

          <div className="panel result-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">02 — OUTPUT</p>
                <h2>Optimization result</h2>
              </div>
              <span className="live-dot">● READY</span>
            </div>

            {!result ? (
              <div className="empty-state">
                <div className="empty-icon">⌁</div>
                <h3>Awaiting computation</h3>
                <p>
                  Configure your assets and budget, then run the optimizer
                  to reveal the highest-return portfolio.
                </p>
              </div>
            ) : (
              <>
                <div className="result-highlight">
                  <span>MAXIMUM EXPECTED RETURN</span>
                  <strong>
                    ${result.maximum_return.toLocaleString()}
                  </strong>
                  <small>
                    Using{' '}
                    {result.algorithm === 'dp'
                      ? 'Dynamic Programming'
                      : 'Recursive Brute Force'}
                  </small>
                </div>

                <div className="metrics">
                  <div>
                    <span>TOTAL INVESTED</span>
                    <strong>
                      ${result.total_cost.toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <span>BUDGET LEFT</span>
                    <strong>
                      ${(Number(result.budget) - result.total_cost).toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <span>EXECUTION TIME</span>
                    <strong>
                      {result.execution_time_ms} <small>ms</small>
                    </strong>
                  </div>
                </div>

                <h3 className="subheading">
                  Selected assets
                  <span>{result.selected_assets.length} selected</span>
                </h3>

                {result.selected_assets.length ? (
                  result.selected_assets.map(a => (
                    <div className="selected-asset" key={a.name}>
                      <span className="check">✓</span>
                      <strong>{a.name}</strong>
                      <span>${a.cost}</span>
                      <b>+${a.return}</b>
                    </div>
                  ))
                ) : (
                  <p className="hint">No assets fit within this budget.</p>
                )}

                <p className="complexity-note">{result.complexity}</p>
              </>
            )}
          </div>
        </section>

        <section className="panel benchmark-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">03 — PERFORMANCE</p>
              <h2>Algorithm benchmark</h2>
              <p className="section-copy">
                Compare execution time as the number of assets increases.
              </p>
            </div>

            <button
              className="outline-button"
              onClick={runBenchmark}
              disabled={benchmarkBusy}
            >
              {benchmarkBusy ? 'Running benchmark…' : 'Run benchmark ↗'}
            </button>
          </div>

          {benchmarkBusy ? (
            <div className="benchmark-empty">
              <p>Running benchmark, please wait...</p>
            </div>
          ) : benchmark.length > 0 ? (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={benchmark}
                  margin={{ top: 15, right: 20, left: 15, bottom: 25 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#263246"
                  />

                  <XAxis
                    dataKey="assets"
                    stroke="#8d9bb0"
                    tickLine={false}
                    axisLine={false}
                    label={{
                      value: 'Number of assets (N)',
                      position: 'insideBottom',
                      offset: -15,
                      fill: '#8d9bb0'
                    }}
                  />

                  <YAxis
                    scale="log"
                    domain={[0.001, 'auto']}
                    allowDataOverflow
                    stroke="#8d9bb0"
                    tickLine={false}
                    axisLine={false}
                    label={{
                      value: 'Execution time (ms, log scale)',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#8d9bb0'
                    }}
                  />

                  <Tooltip
                    formatter={value => [
                      `${Number(value).toFixed(4)} ms`
                    ]}
                    contentStyle={{
                      background: '#111c2d',
                      border: '1px solid #34445c',
                      borderRadius: 8
                    }}
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="brute_force_ms"
                    name="Brute Force · O(2^N)"
                    stroke="#e7653d"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="dp_ms"
                    name="Dynamic Programming · O(N × B)"
                    stroke="#57c6a2"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>

              <p className="hint">
                Timings are measured on this machine/server and will vary
                between runs.
              </p>
            </div>
          ) : (
            <div className="benchmark-empty">
              <span>↗</span>
              <p>
                Run the benchmark to generate a live comparison chart
                for both algorithms.
              </p>
            </div>
          )}
        </section>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        <section className="theory-grid">
          <article>
            <p className="eyebrow">THE LOGIC</p>
            <h3>Brute force</h3>
            <p>
              Checks every possible subset of assets. It is simple to
              understand, but the number of combinations grows exponentially.
            </p>
            <code>O(2^N) time</code>
          </article>

          <article>
            <p className="eyebrow">THE LOGIC</p>
            <h3>Dynamic programming</h3>
            <p>
              Builds the solution from smaller subproblems and reuses
              stored results to avoid repeated calculations.
            </p>
            <code>O(N × B) time</code>
          </article>

          <article>
            <p className="eyebrow">THE RULE</p>
            <h3>0/1 constraint</h3>
            <p>
              An asset can be selected once in full or left out.
              Partial investment is not permitted in this model.
            </p>
            <code>Σ cost ≤ budget</code>
          </article>
        </section>

        <footer>
          <span>PORTFOLIO LAB <i>·</i> DAA LAB PROJECT</span>
          <span>ACADEMIC DEMONSTRATION — NOT FINANCIAL ADVICE</span>
        </footer>
      </main>
    </div>
  );
}
