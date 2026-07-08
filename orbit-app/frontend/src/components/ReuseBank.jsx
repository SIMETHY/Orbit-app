import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function ReuseBank() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [claimed, setClaimed] = useState({});

  useEffect(() => {
    api.reuseItems().then(setItems).catch((e) => setError(e.message));
  }, []);

  return (
    <section>
      <header className="page-head">
        <div>
          <p className="eyebrow">Module 04</p>
          <h2>Reusable Materials &amp; BOM Bank</h2>
          <p className="sub">Leftover project materials, cataloged instead of forgotten in a store bin — searchable before the next BOM is raised.</p>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="tag-grid">
        {items.map((r) => (
          <div className="tag s-available" key={r.id}>
            <div className="corner c-tl"></div>
            <div className="corner c-br"></div>
            <span className="badge available">Reclaimable</span>
            <div className="id mono">{r.id}</div>
            <div className="name">{r.name}</div>
            <div className="meta">
              Source: <span>{r.source_project}</span><br />
              Condition: <span>{r.condition}</span><br />
              Location: <span>{r.lab.name}</span> · Qty: <span>{r.quantity}</span>
            </div>
            <div className="foot">
              <span className="mono" style={{ fontSize: 11, color: "var(--paper-dim)" }}>Store: Central BOM Bank</span>
              <button disabled={!!claimed[r.id]} onClick={() => setClaimed((c) => ({ ...c, [r.id]: true }))}>
                {claimed[r.id] ? "Claimed" : "Claim"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
