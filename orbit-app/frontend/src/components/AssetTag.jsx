import React from "react";

const STATUS_META = {
  available: { cls: "available", lbl: "Available" },
  inuse: { cls: "inuse", lbl: "In Use" },
  maint: { cls: "maint", lbl: "Maintenance" },
  caldue: { cls: "caldue", lbl: "Cal. Due Soon" },
  overdue: { cls: "overdue", lbl: "Cal. Overdue" },
};

function money(v) {
  if (v === null || v === undefined) return "—";
  return `\u20b9${(v / 100000).toFixed(1)}L`;
}

export default function AssetTag({ asset, onReserve }) {
  const sm = STATUS_META[asset.status] || STATUS_META.available;
  return (
    <div className={`tag s-${asset.status}`}>
      <div className="corner c-tl"></div>
      <div className="corner c-br"></div>
      <span className={`badge ${sm.cls}`}>{sm.lbl}</span>
      <div className="id mono">{asset.id}</div>
      <div className="name">{asset.name}</div>
      <div className="meta">
        Lab: <span>{asset.lab.name}</span>
        <br />
        Business Unit: <span>{asset.business_unit.name}</span>
        <br />
        Category: <span>{asset.category}</span> · Value: <span>{money(asset.book_value)}</span>
      </div>
      <div className="foot">
        <span className="mono" style={{ fontSize: 11, color: "var(--paper-dim)" }}>
          Cal. due: {asset.calibration_due || "—"}
        </span>
        <button
          disabled={asset.status !== "available"}
          onClick={() => onReserve && onReserve(asset)}
        >
          {asset.status === "available" ? "Reserve" : "Unavailable"}
        </button>
      </div>
    </div>
  );
}
