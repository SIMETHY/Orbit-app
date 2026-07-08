import React from "react";

const TABS = [
  { id: "dashboard", num: "01", label: "Command Dashboard" },
  { id: "explorer", num: "02", label: "Asset Explorer" },
  { id: "calibration", num: "03", label: "Calibration Center" },
  { id: "reuse", num: "04", label: "Reusable Materials Bank" },
  { id: "movement", num: "05", label: "Movement & Custody Log" },
  { id: "procurement", num: "06", label: "Procurement Duplicate-Check" },
  { id: "ai", num: "07", label: "AI Insight Feed" },
  { id: "architecture", num: "08", label: "Platform Blueprint" },
];

export default function Sidebar({ active, onNavigate, apiOnline }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="mark">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <rect x="1" y="1" width="24" height="24" stroke="#E3A23C" strokeWidth="1.4" />
            <path d="M13 4 L13 22 M4 13 L22 13" stroke="#E3A23C" strokeWidth="1.4" />
            <circle cx="13" cy="13" r="4" stroke="#E9EEF3" strokeWidth="1.2" />
          </svg>
          <h1>ORBIT</h1>
        </div>
        <p>Enterprise Resource Intelligence Platform<br />Labs · Calibration · Procurement · AI</p>
      </div>
      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${active === t.id ? "active" : ""}`}
            onClick={() => onNavigate(t.id)}
          >
            <span className="num">{t.num}</span> {t.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-foot">
        <span className={`api-dot ${apiOnline ? "ok" : "down"}`}></span>
        {apiOnline ? "API connected" : "API unreachable — start the backend"}
        <br /><br />
        <b>Org scope (seeded demo data):</b><br />
        5 Business Units · 6 Labs<br />18 tagged assets (extendable to 1,800+)
      </div>
    </aside>
  );
}
