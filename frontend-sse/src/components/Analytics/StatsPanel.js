import React, { useState, useEffect } from "react";
import "./StatsPanel.css";

const StatsPanel = ({ stats, loading = false, showComparison = false, previousStats = null }) => {
  const [animatedStats, setAnimatedStats] = useState({});

  useEffect(() => {
    if (stats && !loading) {
      // Animar los números desde 0 hasta el valor final
      const duration = 1500;
      const steps = 60;
      const stepDuration = duration / steps;

      Object.keys(stats).forEach(key => {
        const finalValue = stats[key] || 0;
        let currentValue = 0;
        const increment = finalValue / steps;

        const interval = setInterval(() => {
          currentValue += increment;
          if (currentValue >= finalValue) {
            currentValue = finalValue;
            clearInterval(interval);
          }
          
          setAnimatedStats(prev => ({
            ...prev,
            [key]: Math.round(currentValue)
          }));
        }, stepDuration);
      });
    }
  }, [stats, loading]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return { percentage: 0, direction: 'neutral' };
    
    const percentage = ((current - previous) / previous) * 100;
    const direction = percentage > 0 ? 'positive' : percentage < 0 ? 'negative' : 'neutral';
    
    return { percentage: Math.abs(percentage), direction };
  };

  const getStatTooltip = (key, value) => {
    const tooltips = {
      totalSounds: `Total de grabaciones de sonido en la colección`,
      uniqueAuthors: `Número de personas que han contribuido con sonidos`,
      uniqueEmotions: `Variedad de emociones diferentes registradas`,
      totalDuration: `Duración acumulada de todos los sonidos: ${formatDuration(value)}`
    };
    
    return tooltips[key] || '';
  };

  const statItems = [
    {
      key: "totalSounds",
      label: "Total de Sonidos",
      value: animatedStats.totalSounds || 0,
      icon: "🎵",
      color: "#4f46e5",
      description: "grabaciones"
    },
    {
      key: "uniqueAuthors",
      label: "Contribuyentes",
      value: animatedStats.uniqueAuthors || 0,
      icon: "👥",
      color: "#10b981",
      description: "personas"
    },
    {
      key: "uniqueEmotions",
      label: "Emociones Únicas",
      value: animatedStats.uniqueEmotions || 0,
      icon: "💭",
      color: "#f59e0b",
      description: "diferentes"
    },
    {
      key: "totalDuration",
      label: "Tiempo Total",
      value: Math.round((animatedStats.totalDuration || 0) / 60),
      icon: "⏱️",
      color: "#8b5cf6",
      description: "minutos"
    },
  ];

  if (loading) {
    return (
      <div className="stats-panel">
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton skeleton-stat"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="stats-panel">
      <div className="stats-grid">
        {statItems.map((stat, index) => {
          const change = showComparison && previousStats 
            ? calculateChange(stat.value, previousStats[stat.key]) 
            : null;

          return (
            <div 
              key={stat.key} 
              className={`stat-card tooltip`}
              style={{ 
                animationDelay: `${index * 150}ms`,
                '--stat-color': stat.color 
              }}
              data-tooltip={getStatTooltip(stat.key, stats[stat.key])}
            >
              <div className="stat-icon" style={{ color: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-content">
                <div className="stat-value" style={{ color: stat.color }}>
                  {formatNumber(stat.value)}
                  {change && (
                    <span className={`trend-indicator ${change.direction}`}>
                      {change.direction === 'positive' && '↗'}
                      {change.direction === 'negative' && '↘'}
                      {change.direction === 'neutral' && '→'}
                      {change.percentage.toFixed(1)}%
                    </span>
                  )}
                </div>
                <div className="stat-label">
                  {stat.label}
                  <span className="stat-description"> • {stat.description}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparación de períodos si está disponible */}
      {showComparison && previousStats && (
        <div className="comparison-card">
          <div className="comparison-header">
            <h3 className="comparison-title">
              📊 Comparación con Período Anterior
            </h3>
          </div>
          <div className="comparison-metrics">
            {statItems.map(stat => {
              const change = calculateChange(stat.value, previousStats[stat.key] || 0);
              const previousValue = previousStats[stat.key] || 0;
              
              return (
                <div key={`comparison-${stat.key}`} className="comparison-metric">
                  <div className="comparison-value">
                    {formatNumber(stat.value)}
                  </div>
                  <div className="comparison-label">{stat.label}</div>
                  <div className={`comparison-change ${change.direction}`}>
                    {change.direction === 'positive' && '+'}
                    {change.direction === 'negative' && '-'}
                    {change.percentage.toFixed(1)}% vs {formatNumber(previousValue)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resumen adicional */}
      {stats.totalSounds > 0 && (
        <div className="stats-summary">
          <div className="summary-insights">
            <div className="insight-item">
              <strong>Promedio por autor:</strong> {' '}
              {(stats.totalSounds / (stats.uniqueAuthors || 1)).toFixed(1)} sonidos
            </div>
            <div className="insight-item">
              <strong>Duración promedio:</strong> {' '}
              {Math.round((stats.totalDuration || 0) / (stats.totalSounds || 1))}s por sonido
            </div>
            <div className="insight-item">
              <strong>Diversidad emocional:</strong> {' '}
              {((stats.uniqueEmotions || 0) / (stats.totalSounds || 1) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;