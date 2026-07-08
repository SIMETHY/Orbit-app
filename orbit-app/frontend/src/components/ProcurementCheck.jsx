import React, { useState } from "react";
import { api } from "../api.js";

function money(v) {
  if (!v) return null;
  return `\u20b9${(v / 100000).toFixed(1)}L`;
}

export default function ProcurementCheck() {
  const [q, setQ] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const r = await api.procurementCheck(q.trim());
      setResult(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <header className="page-head">
        <div>
          <p className="eyebrow">Module 06</p>
          <h2>Procurement Duplicate-Check</h2>
          <p className="sub">Before a purchase requisition is raised, check whether the organization already owns it — idle, elsewhere, and shippable.</p>
        </div>
      </header>

      <div className="panel">
        <h3>Check before you buy</h3>
        <p className="cap">Type the equipment you're about to requisition</p>
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          <input
            type="text"
            style={{ flex: 1, minWidth: 280 }}
            placeholder="e.g. Digital Storage Oscilloscope, Spectrum Analyzer, Torque Wrench…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
          />
          <button className="btn-primary" onClick={run} disabled={loading}>
            {loading ? "Checking…" : "Check Inventory"}
          </button>
        </div>

        {error && <div className="error-banner" style={{ marginTop: 14 }}>{error}</div>}

        {result && result.match_count === 0 && (
          <div className="result-card nomatch">
            <b>No existing match found.</b><br />
            <span style={{ color: "var(--paper-dim)", fontSize: 13 }}>
              This looks like a genuinely new asset class for the organization. Procurement may proceed — the new asset will be auto-tagged into ORBIT on delivery.
            </span>
          </div>
        )}

        {result && result.match_count > 0 && (
          <div className="result-card match">
            <b>{result.match_count} existing asset(s) found matching "{result.query}"</b>
            <p style={{ color: "var(--paper-dim)", fontSize: 13, margin: "8px 0 14px 0" }}>
              {result.idle_count} of these are currently <span style={{ color: "var(--green)" }}>available</span> and could fulfil this requirement instead of a new purchase.
            </p>
            <table>
              <thead><tr><th>Asset ID</th><th>Name</th><th>Lab</th><th>Status</th><th>Value</th></tr></thead>
              <tbody>
                {result.matches.map((a) => (
                  <tr key={a.id}>
                    <td className="mini-id">{a.id}</td>
                    <td>{a.name}</td>
                    <td>{a.lab.name}</td>
                    <td><span className={`badge ${a.status}`}>{a.status}</span></td>
                    <td>{money(a.book_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.estimated_saving && (
              <div className="impact" style={{ marginTop: 12, color: "var(--green)", fontFamily: "'IBM Plex Mono'", fontSize: 12.5 }}>
                Estimated capex avoidance if reallocated: {money(result.estimated_saving)}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
