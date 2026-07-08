import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { api } from "../api.js";

const CAT_COLORS = {
  "Test & Measurement": "#4C9FE8",
  "Calibration-Controlled": "#E3A23C",
  "Mechanical Tooling": "#4FBF8B",
  "IT / Compute": "#8FA0B3",
};

function money(v) {
  if (!v) return "\u20b90";
  const cr = v / 10000000;
  return cr >= 1 ? `\u20b9${cr.toFixed(2)} Cr` : `\u20b9${(v / 100000).toFixed(1)} L`;
}

export default function Dashboard({ onNavigate }) {
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [error, setError] = useState(null);
  const utilRef = useRef(null);
  const mixRef = useRef(null);
  const calRef = useRef(null);
  const chartInstances = useRef([]);

  useEffect(() => {
    Promise.all([api.dashboard(), api.insights()])
      .then(([d, i]) => {
        setData(d);
        setInsights(i.slice(0, 3));
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!data) return;
    chartInstances.current.forEach((c) => c.destroy());
    chartInstances.current = [];

    chartInstances.current.push(
      new Chart(utilRef.current, {
        type: "bar",
        data: {
          labels: data.utilization_by_lab.map((l) => l.lab),
          datasets: [{ label: "Utilization %", data: data.utilization_by_lab.map((l) => l.utilization_pct), backgroundColor: "#E3A23C", borderRadius: 2 }],
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, max: 100, grid: { color: "#28374A" }, ticks: { color: "#8FA0B3" } },
            x: { grid: { display: false }, ticks: { color: "#8FA0B3", font: { size: 10 } } },
          },
        },
      })
    );

    chartInstances.current.push(
      new Chart(mixRef.current, {
        type: "doughnut",
        data: {
          labels: data.category_mix.map((c) => c.category),
          datasets: [{ data: data.category_mix.map((c) => c.pct), backgroundColor: data.category_mix.map((c) => CAT_COLORS[c.category] || "#8FA0B3"), borderColor: "#131C27", borderWidth: 2 }],
        },
        options: { plugins: { legend: { position: "bottom", labels: { color: "#8FA0B3", font: { size: 10.5 }, boxWidth: 11 } } } },
      })
    );

    chartInstances.current.push(
      new Chart(calRef.current, {
        type: "line",
        data: {
          labels: data.compliance_trend.map((t) => t.month),
          datasets: [{ label: "Compliance %", data: data.compliance_trend.map((t) => t.compliance_pct), borderColor: "#4FBF8B", backgroundColor: "rgba(79,191,139,0.12)", tension: 0.35, fill: true, pointBackgroundColor: "#4FBF8B" }],
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 60, max: 100, grid: { color: "#28374A" }, ticks: { color: "#8FA0B3" } },
            x: { grid: { display: false }, ticks: { color: "#8FA0B3" } },
          },
        },
      })
    );

    return () => chartInstances.current.forEach((c) => c.destroy());
  }, [data]);

  return (
    <section>
      <header className="page-head">
        <div>
          <p className="eyebrow">Command Dashboard</p>
          <h2>Enterprise Asset Intelligence — Live Overview</h2>
          <p className="sub">Data below is served live from the ORBIT API and SQLite database — not hardcoded.</p>
        </div>
        <button className="btn-primary" onClick={() => onNavigate("procurement")}>+ Run Procurement Check</button>
      </header>

      {error && <div className="error-banner">Could not reach the API ({error}). Is the backend running on port 8000?</div>}
      {!data && !error && <div className="loading">Loading live metrics…</div>}

      {data && (
        <>
          <div className="kpi-row">
            <div className="kpi"><div className="lbl">Total Tagged Assets</div><div className="val mono">{data.total_assets}</div></div>
            <div className="kpi"><div className="lbl">Fleet Utilization</div><div className="val mono">{data.utilization_pct}%</div></div>
            <div className="kpi"><div className="lbl">Calibration Compliance</div><div className="val mono">{data.calibration_compliance_pct}%</div></div>
            <div className="kpi"><div className="lbl">Idle High-Value Assets</div><div className="val mono">{money(data.duplicate_spend_avoided)}</div></div>
            <div className="kpi"><div className="lbl">Reusable BOM Items</div><div className="val mono">{data.reuse_items_reclaimed}</div></div>
          </div>

          <div className="grid-2">
            <div className="panel">
              <h3>Utilization by Laboratory</h3>
              <p className="cap">Trailing 30-day utilization, from the labs table</p>
              <canvas ref={utilRef} height="200"></canvas>
            </div>
            <div className="panel">
              <h3>Asset Category Mix</h3>
              <p className="cap">Share of tagged inventory by book value</p>
              <canvas ref={mixRef} height="200"></canvas>
            </div>
          </div>

          <div className="grid-2">
            <div className="panel">
              <h3>Calibration Compliance Trend</h3>
              <p className="cap">% of calibration-controlled instruments within valid window</p>
              <canvas ref={calRef} height="200"></canvas>
            </div>
            <div className="panel">
              <h3>Top Opportunities This Week</h3>
              <p className="cap">Computed by the rule-based insight engine</p>
              {insights.map((i, idx) => (
                <div className="insight" key={idx}>
                  <span className="tag-lbl">{i.tag}</span>
                  <p>{i.text}</p>
                  <div className="impact">{i.impact}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
