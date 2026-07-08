import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import AssetTag from "./AssetTag.jsx";

export default function AssetExplorer() {
  const [labs, setLabs] = useState([]);
  const [bus, setBus] = useState([]);
  const [assets, setAssets] = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [labId, setLabId] = useState("");
  const [buId, setBuId] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.labs(), api.businessUnits(), api.assets()])
      .then(([l, b, a]) => {
        setLabs(l);
        setBus(b);
        setAssets(a);
        setTotal(a.length);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      api
        .assets({ q, lab_id: labId, bu_id: buId, status })
        .then(setAssets)
        .catch((e) => setError(e.message));
    }, 200); // debounce search-as-you-type
    return () => clearTimeout(handle);
  }, [q, labId, buId, status]);

  async function handleReserve(asset) {
    try {
      await api.reserveAsset(asset.id, "inuse");
      setAssets((prev) => prev.map((a) => (a.id === asset.id ? { ...a, status: "inuse" } : a)));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section>
      <header className="page-head">
        <div>
          <p className="eyebrow">Module 02</p>
          <h2>Asset Explorer</h2>
          <p className="sub">Search and filter every equipment tag in the organization before you plan, book, or buy. Reserving an asset here writes to the database immediately.</p>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="filter-bar">
        <input type="text" placeholder="Search by name or asset ID…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={labId} onChange={(e) => setLabId(e.target.value)}>
          <option value="">All Labs</option>
          {labs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <select value={buId} onChange={(e) => setBuId(e.target.value)}>
          <option value="">All Business Units</option>
          {bus.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="inuse">In Use</option>
          <option value="maint">Under Maintenance</option>
          <option value="caldue">Calibration Due Soon</option>
          <option value="overdue">Calibration Overdue</option>
        </select>
        <span className="count-tag">{assets.length} / {total} assets</span>
      </div>

      <div className="tag-grid">
        {assets.length === 0 && <p className="empty-state">No assets match this filter.</p>}
        {assets.map((a) => <AssetTag key={a.id} asset={a} onReserve={handleReserve} />)}
      </div>
    </section>
  );
}
