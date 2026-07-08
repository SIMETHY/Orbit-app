import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function MovementLog() {
  const [movements, setMovements] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.movements().then(setMovements).catch((e) => setError(e.message));
  }, []);

  return (
    <section>
      <header className="page-head">
        <div>
          <p className="eyebrow">Module 05</p>
          <h2>Movement &amp; Custody Log</h2>
          <p className="sub">Every inter-lab transfer, chain-of-custody, and location update — so nothing goes missing between business units.</p>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="panel">
        <h3>Recent Transfers</h3>
        <p className="cap">Scan events logged via POST /api/movements, newest first</p>
        <table>
          <thead>
            <tr><th>Asset ID</th><th>From</th><th>To</th><th>Handled By</th><th>Timestamp</th><th>Status</th></tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id}>
                <td className="mini-id">{m.asset_id}</td>
                <td>{m.from_location}</td>
                <td>{m.to_location}</td>
                <td>{m.handled_by}</td>
                <td className="mono">{m.timestamp.replace("T", " ").slice(0, 16)}</td>
                <td><span className={`badge ${m.status === "received" ? "available" : "caldue"}`}>{m.status === "received" ? "Received" : "In Transit"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
