import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function AIInsights() {
  const [insights, setInsights] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.insights().then(setInsights).catch((e) => setError(e.message));
  }, []);

  return (
    <section>
      <header className="page-head">
        <div>
          <p className="eyebrow">Module 07</p>
          <h2>AI Insight Feed</h2>
          <p className="sub">Recommendations generated from utilization, calibration, procurement, and project-planning signals across the platform — computed live by <code>GET /api/insights</code>.</p>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {insights.map((i, idx) => (
        <div className="insight" key={idx}>
          <span className="tag-lbl">{i.tag}</span>
          <p>{i.text}</p>
          <div className="impact">{i.impact}</div>
        </div>
      ))}
    </section>
  );
}
