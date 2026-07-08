// Thin fetch wrapper around the ORBIT backend API.
// In dev, Vite proxies /api/* to http://127.0.0.1:8000 (see vite.config.js).
// In production, set VITE_API_BASE to the deployed backend URL.
const BASE = import.meta.env.VITE_API_BASE || "/api";

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${detail}`);
  }
  return res.json();
}

export const api = {
  labs: () => req("/labs"),
  businessUnits: () => req("/business-units"),
  assets: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null)
    ).toString();
    return req(`/assets${qs ? `?${qs}` : ""}`);
  },
  reserveAsset: (id, status) =>
    req(`/assets/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  calibrationRegister: () => req("/calibration/register"),
  calibrationSummary: () => req("/calibration/summary"),
  reuseItems: () => req("/reuse-items"),
  movements: () => req("/movements"),
  procurementCheck: (q) => req(`/procurement/check?q=${encodeURIComponent(q)}`),
  insights: () => req("/insights"),
  dashboard: () => req("/analytics/dashboard"),
};
