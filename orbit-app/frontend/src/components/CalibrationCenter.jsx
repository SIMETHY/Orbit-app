import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function CalibrationCenter() {
  const [register, setRegister] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [requested, setRequested] = useState({});

  useEffect(() => {
    Promise.all([api.calibrationRegister(), api.calibrationSummary()])
      .then(([r, s]) => {
        setRegister(r);
        setSummary(s);
      })
      .catch((e) => setError(e.message));
  }, []);

  function badgeFor(asset) {
    const today = new Date().toISOString().slice(0, 10);
    if (!asset.calibration_due) return { cls: "available", lbl: "—" };
    if (asset.calibration_due < today) return { cls: "overdue", lbl: "Overdue" };
    const in30 = new Date();
    in30.setDate(in30.getDate() + 30);
    if (asset.calibration_due <= in30.toISOString().slice(0, 10)) return { cls: "caldue", lbl: "Due Soon" };
    return { cls: "available", lbl: "Valid" };
  }

  return (
    <section>
      <header className="page-head">
        <div>
          <p className="eyebrow">Module 03</p>
          <h2>Calibration Center</h2>
          <p className="sub">Every calibration-controlled instrument, sorted by urgency, so usability is known before a project depends on it.</p>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {summary && (
        <div className="kpi-row" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
          <div className="kpi"><div className="lbl">In Valid Window</div><div className="val mono" style={{ color: "var(--green)" }}>{summary.valid}</div></div>
          <div className="kpi"><div className="lbl">Due ≤ 30 Days</div><div className="val mono" style={{ color: "var(--amber)" }}>{summary.due_soon}</div></div>
          <div className="kpi"><div className="lbl">Overdue</div><div className="val mono" style={{ color: "var(--red)" }}>{summary.overdue}</div></div>
          <div className="kpi"><div className="lbl">Avg. Cycle Time</div><div className="val mono">{summary.avg_cycle_days} days</div></div>
        </div>
      )}

      <div className="panel">
        <h3>Calibration Register</h3>
        <p className="cap">Sorted by nearest due date across all labs</p>
        <table>
          <thead>
            <tr><th>Asset ID</th><th>Instrument</th><th>Lab</th><th>Last Calibrated</th><th>Due</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {register.map((a) => {
              const b = badgeFor(a);
              return (
                <tr key={a.id}>
                  <td className="mini-id">{a.id}</td>
                  <td>{a.name}</td>
                  <td>{a.lab.name}</td>
                  <td className="mono">{a.last_calibrated || "—"}</td>
                  <td className="mono">{a.calibration_due || "—"}</td>
                  <td><span className={`badge ${b.cls}`}>{b.lbl}</span></td>
                  <td>
                    <button
                      className="btn-ghost"
                      style={{ padding: "5px 10px", fontSize: 11 }}
                      disabled={!!requested[a.id]}
                      onClick={() => setRequested((r) => ({ ...r, [a.id]: true }))}
                    >
                      {requested[a.id] ? "Queued" : "Request"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
