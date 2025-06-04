import React from "react";
import "./StatsPanel.css";

const StatsPanel = ({ stats }) => {
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const statItems = [
    {
      key: "totalSounds",
      label: "Total de Sonidos",
      value: stats.totalSounds || 0,
      icon: "🎵",
      color: "#4f46e5",
    },
    {
      key: "uniqueAuthors",
      label: "Contribuyentes",
      value: stats.uniqueAuthors || 0,
      icon: "👥",
      color: "#10b981",
    },
    {
      key: "uniqueEmotions",
      label: "Emociones Únicas",
      value: stats.uniqueEmotions || 0,
      icon: "💭",
      color: "#f59e0b",
    },
    {
      key: "totalDuration",
      label: "Minutos Totales",
      value: Math.round((stats.totalDuration || 0) / 60),
      icon: "⏱️",
      color: "#8b5cf6",
    },
  ];

  return (
    <div className="stats-panel">
      <div className="stats-grid">
        {statItems.map((stat) => (
          <div key={stat.key} className="stat-card">
            <div className="stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <div className="stat-value" style={{ color: stat.color }}>
                {formatNumber(stat.value)}
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsPanel;
