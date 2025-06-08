import React, { useState, useEffect } from 'react';
import StatsPanel from './StatsPanel';
import EmotionChart from './EmotionChart';
import './StatsPanel.css';
import './AnalyticsExtras.css';

const Analytics = ({ sounds = [] }) => {
  const [stats, setStats] = useState({});
  const [emotionData, setEmotionData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sounds.length > 0) {
      calculateAnalytics();
    }
    setLoading(false);
  }, [sounds]);

  const calculateAnalytics = () => {
    // Calcular estadísticas principales
    const totalSounds = sounds.length;
    const uniqueAuthors = new Set(sounds.map(s => s.author)).size;
    const uniqueEmotions = new Set(sounds.flatMap(s => s.emotions || [])).size;
    const totalDuration = sounds.reduce((acc, s) => acc + (s.duration || 0), 0);

    setStats({
      totalSounds,
      uniqueAuthors,
      uniqueEmotions,
      totalDuration
    });

    // Calcular datos de emociones
    const emotionCounts = {};
    sounds.forEach(sound => {
      (sound.emotions || []).forEach(emotion => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });

    const sortedEmotions = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    setEmotionData(sortedEmotions);

    // Calcular datos de ubicaciones
    const locationCounts = {};
    sounds.forEach(sound => {
      if (sound.location) {
        locationCounts[sound.location] = (locationCounts[sound.location] || 0) + 1;
      }
    });

    const sortedLocations = Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    setLocationData(sortedLocations);

    // Calcular timeline (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyCounts = {};
    sounds.forEach(sound => {
      const date = new Date(sound.createdAt || Date.now());
      if (date >= thirtyDaysAgo) {
        const dateKey = date.toISOString().split('T')[0];
        dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
      }
    });

    const timelineArray = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      timelineArray.push({
        date: dateKey,
        count: dailyCounts[dateKey] || 0
      });
    }

    setTimelineData(timelineArray);

    // Generar insights
    generateInsights(sortedEmotions, totalSounds, uniqueAuthors);
  };

  const generateInsights = (emotions, total, authors) => {
    const insightsList = [];

    if (emotions.length > 0) {
      const topEmotion = emotions[0];
      insightsList.push({
        title: "Emoción Dominante",
        description: `**${topEmotion.emotion}** es la emoción más común con ${topEmotion.count} apariciones (${((topEmotion.count / total) * 100).toFixed(1)}% del total).`
      });
    }

    if (authors > 1) {
      const soundsPerAuthor = (total / authors).toFixed(1);
      insightsList.push({
        title: "Participación Colaborativa",
        description: `Con **${authors} contribuyentes**, hay un promedio de **${soundsPerAuthor} sonidos por persona**, mostrando una buena distribución colaborativa.`
      });
    }

    if (emotions.length >= 3) {
      const diversityScore = ((emotions.length / total) * 100).toFixed(1);
      insightsList.push({
        title: "Diversidad Emocional",
        description: `El **${diversityScore}%** de diversidad emocional indica una rica variedad de expresiones en la colección.`
      });
    }

    const recentSounds = sounds.filter(s => {
      const soundDate = new Date(s.createdAt || Date.now());
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return soundDate >= weekAgo;
    }).length;

    if (recentSounds > 0) {
      insightsList.push({
        title: "Actividad Reciente",
        description: `**${recentSounds} sonidos** fueron agregados en los últimos 7 días, mostrando una comunidad activa.`
      });
    }

    setInsights(insightsList);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">
          <h1>Cargando Análisis...</h1>
        </div>
      </div>
    );
  }

  if (sounds.length === 0) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">
          <h1>Panel de Análisis</h1>
          <p className="analytics-subtitle">Explora las tendencias y patrones de tu colección</p>
        </div>
        <div className="no-data">
          <p>No hay datos suficientes para mostrar análisis. ¡Agrega algunos sonidos para comenzar!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <h1>Panel de Análisis</h1>
        <p className="analytics-subtitle">
          Explora las tendencias y patrones de tu colección de {stats.totalSounds} sonidos
        </p>
      </div>

      {/* Estadísticas principales */}
      <StatsPanel stats={stats} />

      {/* Grid de análisis */}
      <div className="analytics-grid">
        {/* Gráfico de emociones */}
        <div className="analytics-card">
          <EmotionChart 
            data={emotionData} 
            title="Distribución de Emociones" 
          />
        </div>

        {/* Ubicaciones más frecuentes */}
        {locationData.length > 0 && (
          <div className="analytics-card">
            <h3>
              <span>📍</span>
              Ubicaciones Frecuentes
            </h3>
            <div className="location-chart">
              {locationData.map(({ location, count }) => (
                <div key={location} className="location-item">
                  <span className="location-name">{location}</span>
                  <span className="count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estadísticas detalladas */}
        <div className="analytics-card">
          <h3>
            <span>📋</span>
            Estadísticas Detalladas
          </h3>
          <div className="detailed-stats">
            <div className="stat-row">
              <strong>Duración Promedio</strong>
              <span>{Math.round(stats.totalDuration / stats.totalSounds || 0)}s</span>
            </div>
            <div className="stat-row">
              <strong>Sonidos por Autor</strong>
              <span>{(stats.totalSounds / stats.uniqueAuthors || 0).toFixed(1)}</span>
            </div>
            <div className="stat-row">
              <strong>Emociones por Sonido</strong>
              <span>{(stats.uniqueEmotions / stats.totalSounds || 0).toFixed(1)}</span>
            </div>
            <div className="stat-row">
              <strong>Tiempo Total</strong>
              <span>{Math.round(stats.totalDuration / 60)}min</span>
            </div>
          </div>
        </div>

        {/* Actividad temporal */}
        <div className="analytics-card">
          <h3>
            <span>📈</span>
            Actividad Reciente
          </h3>
          <div className="timeline-chart">
            <div className="timeline-bars">
              {timelineData.map(({ date, count }) => {
                const maxCount = Math.max(...timelineData.map(d => d.count));
                const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                
                return (
                  <div key={date} className="timeline-bar">
                    <div 
                      className="bar" 
                      style={{ height: `${Math.max(height, 8)}%` }}
                      title={`${count} sonidos - ${formatDate(date)}`}
                    />
                    <div className="date-label">{formatDate(date)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sección de insights */}
      {insights.length > 0 && (
        <div className="insights-section">
          <h3>Insights Automáticos</h3>
          <div className="insights-grid">
            {insights.map((insight, index) => (
              <div key={index} className="insight-card">
                <h4>{insight.title}</h4>
                <p dangerouslySetInnerHTML={{ __html: insight.description }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;