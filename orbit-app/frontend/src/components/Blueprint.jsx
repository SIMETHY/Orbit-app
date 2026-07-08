import React from "react";

export default function Blueprint() {
  return (
    <section>
      <header className="page-head">
        <div>
          <p className="eyebrow">Module 08</p>
          <h2>Platform Blueprint</h2>
          <p className="sub">How ORBIT is built to sit as a central intelligence layer across every existing system, rather than replace them.</p>
        </div>
      </header>

      <div className="two-col-note">
        <div className="panel">
          <h3>System Layers</h3>
          <table>
            <tbody>
              <tr><td className="mini-id">L1</td><td>Ingestion — RFID/QR/barcode scans, ERP &amp; procurement feed, calibration lab exports, manual entry</td></tr>
              <tr><td className="mini-id">L2</td><td>Unified Asset Ledger — single record per physical asset (this app's SQLite/Postgres DB)</td></tr>
              <tr><td className="mini-id">L3</td><td>Rules Engine — calibration windows, utilization thresholds, transfer approvals</td></tr>
              <tr><td className="mini-id">L4</td><td>AI Recommendation Layer — reallocation matching, procurement duplicate detection, demand forecasting</td></tr>
              <tr><td className="mini-id">L5</td><td>Experience Layer — this React dashboard, plus a future mobile scan app and chat-based lookup</td></tr>
            </tbody>
          </table>
        </div>
        <div className="panel">
          <h3>Core Data Model (as implemented)</h3>
          <p className="cap mono">Asset · Lab · BusinessUnit · Movement · ReuseItem · ComplianceSnapshot</p>
          <table>
            <tbody>
              <tr><td className="mini-id">Asset</td><td>id, name, category, status, book_value, last_calibrated, calibration_due, lab_id, bu_id</td></tr>
              <tr><td className="mini-id">Movement</td><td>id, asset_id, from_location, to_location, handled_by, timestamp, status</td></tr>
              <tr><td className="mini-id">ReuseItem</td><td>id, name, source_project, condition, quantity, lab_id</td></tr>
              <tr><td className="mini-id">ComplianceSnapshot</td><td>month_label, compliance_pct — feeds the dashboard trend chart</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h3>What's real vs. what's a stand-in, in this build</h3>
        <table>
          <thead><tr><th>Piece</th><th>This build</th><th>Production version</th></tr></thead>
          <tbody>
            <tr><td className="mini-id">Data store</td><td>SQLite file, seeded with 18 representative assets</td><td>Postgres, synced from ERP/procurement system, RFID scan feed</td></tr>
            <tr><td className="mini-id">Search / match</td><td>SQL <code>ILIKE</code> text match</td><td>Embedding-based semantic match over name + spec sheet text</td></tr>
            <tr><td className="mini-id">AI insight engine</td><td>Rule-based (thresholds on utilization/calibration dates)</td><td>LLM call (Claude API) reasoning over the same tables + free-text requests</td></tr>
            <tr><td className="mini-id">Auth</td><td>None (open API for demo)</td><td>SSO across 5,000+ employees, role-based access per lab/BU</td></tr>
            <tr><td className="mini-id">Tagging</td><td>Manual seed data</td><td>Physical QR/RFID tags scanned at movement events</td></tr>
          </tbody>
        </table>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h3>Rollout Plan</h3>
        <table>
          <thead><tr><th>Phase</th><th>Scope</th><th>Outcome</th></tr></thead>
          <tbody>
            <tr><td className="mini-id">Phase 1</td><td>Tag &amp; digitize 2 pilot labs, calibration feed integration</td><td>Single register live, no more spreadsheet lookups</td></tr>
            <tr><td className="mini-id">Phase 2</td><td>Org-wide tagging, procurement duplicate-check made mandatory pre-purchase</td><td>Measurable capex avoidance</td></tr>
            <tr><td className="mini-id">Phase 3</td><td>LLM-based reallocation engine, mobile scan app, project-planning API</td><td>Predictive availability, faster project kickoff</td></tr>
            <tr><td className="mini-id">Phase 4</td><td>Enterprise analytics, capital planning dashboards for leadership</td><td>Data-driven capex &amp; compliance strategy</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
