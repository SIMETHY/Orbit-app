import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./components/Dashboard.jsx";
import AssetExplorer from "./components/AssetExplorer.jsx";
import CalibrationCenter from "./components/CalibrationCenter.jsx";
import ReuseBank from "./components/ReuseBank.jsx";
import MovementLog from "./components/MovementLog.jsx";
import ProcurementCheck from "./components/ProcurementCheck.jsx";
import AIInsights from "./components/AIInsights.jsx";
import Blueprint from "./components/Blueprint.jsx";
import { api } from "./api.js";

export default function App() {
  const [view, setView] = useState("dashboard");
  const [apiOnline, setApiOnline] = useState(true);

  useEffect(() => {
    fetch((import.meta.env.VITE_API_BASE || "/api") + "/health")
      .then((r) => setApiOnline(r.ok))
      .catch(() => setApiOnline(false));
  }, []);

  return (
    <div className="shell">
      <Sidebar active={view} onNavigate={setView} apiOnline={apiOnline} />
      <main>
        {view === "dashboard" && <Dashboard onNavigate={setView} />}
        {view === "explorer" && <AssetExplorer />}
        {view === "calibration" && <CalibrationCenter />}
        {view === "reuse" && <ReuseBank />}
        {view === "movement" && <MovementLog />}
        {view === "procurement" && <ProcurementCheck />}
        {view === "ai" && <AIInsights />}
        {view === "architecture" && <Blueprint />}
      </main>
    </div>
  );
}
