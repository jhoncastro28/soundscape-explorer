// frontend-sse/src/components/Analytics/Analytics.js - SOLUCIÓN COMPLETA

import React, { useState, useEffect, useCallback } from "react";
import StatsPanel from "./StatsPanel";
import EmotionChart from "./EmotionChart";
import "./StatsPanel.css";
import "./AnalyticsExtras.css";

const Analytics = ({ sounds = [] }) => {
  const [stats, setStats] = useState({});
  const [emotionData, setEmotionData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState({});

  const calculateAnalytics = useCallback(() => {
    console.log("🔍 Calculando analytics con", sounds.length, "sonidos");
    console.log("🎵 Primer sonido (estructura):", sounds[0]);

    // Calcular estadísticas principales
    const totalSounds = sounds.length;
    const uniqueAuthors = new Set(sounds.map((s) => s.author)).size;
    const uniqueEmotions = new Set(sounds.flatMap((s) => s.emotions || []))
      .size;
    const totalDuration = sounds.reduce((acc, s) => acc + (s.duration || 0), 0);

    setStats({
      totalSounds,
      uniqueAuthors,
      uniqueEmotions,
      totalDuration,
    });

    // Calcular datos de emociones
    const emotionCounts = {};
    sounds.forEach((sound) => {
      (sound.emotions || []).forEach((emotion) => {
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
    sounds.forEach((sound) => {
      if (sound.location) {
        locationCounts[sound.location] =
          (locationCounts[sound.location] || 0) + 1;
      }
    });

    const sortedLocations = Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    setLocationData(sortedLocations);

    // ✅ CALCULAR TIMELINE CON DEBUGGING MEJORADO
    console.log("📅 === INICIANDO CÁLCULO DE TIMELINE ===");

    const timelineArray = [];
    const dailyCounts = {};
    const debugDates = [];

    // Procesar cada sonido y extraer fechas
    sounds.forEach((sound, index) => {
      let soundDate = null;
      let originalDateValue = null;

      // Buscar fecha en diferentes campos posibles
      if (sound.createdAt) {
        originalDateValue = sound.createdAt;
        soundDate = new Date(sound.createdAt);
        console.log(
          `📊 Sonido ${index}: usando createdAt = ${sound.createdAt}`
        );
      } else if (sound.fecha) {
        originalDateValue = sound.fecha;
        soundDate = new Date(sound.fecha);
        console.log(`📊 Sonido ${index}: usando fecha = ${sound.fecha}`);
      } else {
        console.warn(`⚠️ Sonido ${index}: SIN FECHA - usando fecha actual`);
        originalDateValue = "NO_DATE";
        soundDate = new Date(); // Usar fecha actual como fallback
      }

      // Validar que la fecha sea válida
      if (!soundDate || isNaN(soundDate.getTime())) {
        console.error(
          `❌ Sonido ${index}: Fecha inválida - ${originalDateValue}`
        );
        soundDate = new Date(); // Fallback a fecha actual
      }

      // Obtener clave del día (YYYY-MM-DD)
      const dateKey = soundDate.toISOString().split("T")[0];

      // Incrementar contador para ese día
      if (dailyCounts[dateKey]) {
        dailyCounts[dateKey]++;
      } else {
        dailyCounts[dateKey] = 1;
      }

      // Guardar info de debug
      debugDates.push({
        soundIndex: index,
        soundName: sound.nombre || sound.name || `Sonido ${index}`,
        originalDate: originalDateValue,
        parsedDate: soundDate.toISOString(),
        dateKey: dateKey,
      });

      console.log(
        `✅ Sonido "${sound.nombre || "Sin nombre"}" -> ${dateKey} (total: ${
          dailyCounts[dateKey]
        })`
      );
    });

    console.log("📈 Conteos finales por día:", dailyCounts);
    console.log("🔍 Debug completo de fechas:", debugDates);

    // Generar los últimos 30 días
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];

      const count = dailyCounts[dateKey] || 0;
      const displayDate = date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
      });

      timelineArray.push({
        date: dateKey,
        count: count,
        displayDate: displayDate,
        fullDate: date.toLocaleDateString("es-ES", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        }),
      });
    }

    const totalSoundsInTimeline = timelineArray.reduce(
      (sum, day) => sum + day.count,
      0
    );
    const daysWithActivity = timelineArray.filter(
      (day) => day.count > 0
    ).length;

    console.log("📅 Timeline generado:");
    console.log(`   - Total días: ${timelineArray.length}`);
    console.log(`   - Días con actividad: ${daysWithActivity}`);
    console.log(`   - Total sonidos en timeline: ${totalSoundsInTimeline}`);
    console.log(`   - Sonidos totales: ${sounds.length}`);

    if (totalSoundsInTimeline !== sounds.length) {
      console.warn(
        `⚠️ DISCREPANCIA: Timeline tiene ${totalSoundsInTimeline} sonidos pero deberían ser ${sounds.length}`
      );
    }

    // Guardar información de debug
    setDebugInfo({
      totalSoundsInTimeline,
      daysWithActivity,
      dailyCounts,
      debugDates,
      timelineLength: timelineArray.length,
    });

    setTimelineData(timelineArray);

    // Generar insights
    generateInsights(
      sortedEmotions,
      totalSounds,
      uniqueAuthors,
      daysWithActivity
    );
  }, [sounds]);

  const generateInsights = useCallback(
    (emotions, total, authors, activeDays) => {
      const insightsList = [];

      if (emotions.length > 0) {
        const topEmotion = emotions[0];
        insightsList.push({
          title: "Emoción Dominante",
          description: `**${topEmotion.emotion}** es la emoción más común con ${
            topEmotion.count
          } apariciones (${((topEmotion.count / total) * 100).toFixed(
            1
          )}% del total).`,
        });
      }

      if (authors > 1) {
        const soundsPerAuthor = (total / authors).toFixed(1);
        insightsList.push({
          title: "Participación Colaborativa",
          description: `Con **${authors} contribuyentes**, hay un promedio de **${soundsPerAuthor} sonidos por persona**, mostrando una buena distribución colaborativa.`,
        });
      }

      if (emotions.length >= 3) {
        const diversityScore = ((emotions.length / total) * 100).toFixed(1);
        insightsList.push({
          title: "Diversidad Emocional",
          description: `El **${diversityScore}%** de diversidad emocional indica una rica variedad de expresiones en la colección.`,
        });
      }

      // Insight sobre actividad temporal
      if (activeDays > 0) {
        insightsList.push({
          title: "Actividad Temporal",
          description: `Actividad distribuida en **${activeDays} días** durante los últimos 30 días, con un promedio de **${(
            total / activeDays
          ).toFixed(1)} sonidos por día activo**.`,
        });
      } else {
        insightsList.push({
          title: "Actividad Reciente",
          description: `No hay registros de actividad en los últimos 30 días. ¡Es un buen momento para contribuir con nuevos sonidos!`,
        });
      }

      setInsights(insightsList);
    },
    []
  );

  useEffect(() => {
    console.log("🔄 Analytics useEffect - sonidos recibidos:", sounds.length);

    if (sounds.length > 0) {
      console.log("🎵 Estructura de datos recibidos:");
      console.log("   - Primer sonido:", sounds[0]);
      console.log("   - Campos disponibles:", Object.keys(sounds[0] || {}));
      console.log("   - ¿Tiene createdAt?:", !!sounds[0]?.createdAt);
      console.log("   - ¿Tiene fecha?:", !!sounds[0]?.fecha);
      console.log("   - Valor createdAt:", sounds[0]?.createdAt);
      console.log("   - Valor fecha:", sounds[0]?.fecha);

      calculateAnalytics();
    } else {
      console.log("⚠️ No hay sonidos para analizar");
      setDebugInfo({ message: "No hay sonidos para analizar" });
    }
    setLoading(false);
  }, [sounds, calculateAnalytics]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  // Función para debug manual
  const debugTimeline = () => {
    console.log("🔧 === DEBUG MANUAL TIMELINE ===");
    console.log("Sonidos originales:", sounds);
    console.log("Timeline data:", timelineData);
    console.log("Debug info:", debugInfo);
    console.log("Stats:", stats);

    // Mostrar fechas de todos los sonidos
    sounds.forEach((sound, i) => {
      console.log(`Sonido ${i}:`, {
        nombre: sound.nombre,
        createdAt: sound.createdAt,
        fecha: sound.fecha,
        autor: sound.author,
      });
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
          <p className="analytics-subtitle">
            Explora las tendencias y patrones de tu colección
          </p>
        </div>
        <div className="no-data">
          <p>
            No hay datos suficientes para mostrar análisis. ¡Agrega algunos
            sonidos para comenzar!
          </p>
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
          Explora las tendencias y patrones de tu colección de{" "}
          {stats.totalSounds} sonidos
        </p>
      </div>

      {/* Estadísticas principales */}
      <StatsPanel stats={stats} />

      {/* Grid de análisis */}
      <div className="analytics-grid">
        {/* Gráfico de emociones */}
        <div className="analytics-card">
          <EmotionChart data={emotionData} title="Distribución de Emociones" />
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

        {/* ✅ ACTIVIDAD TEMPORAL COMPLETAMENTE CORREGIDA */}
        <div className="analytics-card">
          <h3>
            <span>📈</span>
            Actividad Reciente (Últimos 30 días)
          </h3>

          {/* Panel de debug mejorado */}
          <div
            style={{
              fontSize: "11px",
              color: "#666",
              marginBottom: "12px",
              padding: "8px",
              background: "#f8f9fa",
              borderRadius: "4px",
              border: "1px solid #e9ecef",
              fontFamily: "monospace",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px",
              }}
            >
              <span>
                📊 Sonidos totales: <strong>{sounds.length}</strong>
              </span>
              <span>
                📈 En timeline:{" "}
                <strong>{debugInfo.totalSoundsInTimeline || 0}</strong>
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>
                📅 Días con actividad:{" "}
                <strong>{debugInfo.daysWithActivity || 0}</strong>
              </span>
              <button
                onClick={debugTimeline}
                style={{
                  fontSize: "10px",
                  padding: "2px 6px",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                🔍 Debug
              </button>
            </div>
          </div>

          <div className="timeline-chart">
            {timelineData.length > 0 ? (
              <div className="timeline-bars">
                {timelineData.map(
                  ({ date, count, displayDate, fullDate }, index) => {
                    const maxCount = Math.max(
                      ...timelineData.map((d) => d.count),
                      1
                    ); // Mínimo 1 para evitar división por 0
                    const height =
                      count > 0 ? Math.max((count / maxCount) * 100, 12) : 8;

                    return (
                      <div
                        key={date}
                        className="timeline-bar"
                        style={{ position: "relative" }}
                      >
                        <div
                          className="bar"
                          style={{
                            height: `${height}%`,
                            backgroundColor: count > 0 ? "#4f46e5" : "#e5e7eb",
                            minHeight: "8px",
                            transition: "all 0.3s ease",
                            cursor: count > 0 ? "pointer" : "default",
                          }}
                          title={`${
                            fullDate || formatDate(date)
                          }\n${count} sonido${count !== 1 ? "s" : ""}`}
                          onClick={() => {
                            if (count > 0) {
                              console.log(`📅 Día ${date}:`, {
                                fecha: date,
                                sonidos: count,
                                detalle: debugInfo.dailyCounts?.[date],
                              });
                            }
                          }}
                        />
                        <div
                          className="date-label"
                          style={{ fontSize: "10px", marginTop: "4px" }}
                        >
                          {displayDate}
                        </div>
                        {count > 0 && (
                          <div
                            style={{
                              position: "absolute",
                              top: "-20px",
                              left: "50%",
                              transform: "translateX(-50%)",
                              fontSize: "10px",
                              color: "#4f46e5",
                              fontWeight: "bold",
                            }}
                          >
                            {count}
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  color: "#666",
                  fontStyle: "italic",
                  padding: "40px",
                }}
              >
                No se pudo generar el timeline
              </div>
            )}
          </div>

          {timelineData.filter((day) => day.count > 0).length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "#6c757d",
                fontStyle: "italic",
                marginTop: "16px",
                padding: "16px",
                background: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e9ecef",
              }}
            >
              <strong>
                🤔 No hay actividad registrada en los últimos 30 días
              </strong>
              <br />
              <small>
                Esto puede significar que todos los sonidos son más antiguos o
                hay un problema con las fechas
              </small>
            </div>
          )}
        </div>

        {/* Estadísticas detalladas */}
        <div className="analytics-card">
          <h3>
            <span>📋</span>
            Estadísticas Detalladas
          </h3>
          <div className="detailed-stats">
            <div className="stat-row">
              <strong>Duración Promedio</strong>
              <span>
                {Math.round(stats.totalDuration / stats.totalSounds || 0)}s
              </span>
            </div>
            <div className="stat-row">
              <strong>Sonidos por Autor</strong>
              <span>
                {(stats.totalSounds / stats.uniqueAuthors || 0).toFixed(1)}
              </span>
            </div>
            <div className="stat-row">
              <strong>Emociones por Sonido</strong>
              <span>
                {(stats.uniqueEmotions / stats.totalSounds || 0).toFixed(1)}
              </span>
            </div>
            <div className="stat-row">
              <strong>Tiempo Total</strong>
              <span>{Math.round(stats.totalDuration / 60)}min</span>
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

      {/* Panel de debug expandido (solo en desarrollo) */}
      {process.env.NODE_ENV === "development" && debugInfo.debugDates && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            background: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "8px",
            fontSize: "12px",
            fontFamily: "monospace",
          }}
        >
          <h4>🔧 Información de Debug (solo desarrollo)</h4>
          <details>
            <summary style={{ cursor: "pointer", marginBottom: "8px" }}>
              Ver fechas procesadas ({debugInfo.debugDates.length} sonidos)
            </summary>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {debugInfo.debugDates.map((debug, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: "4px",
                    padding: "4px",
                    background: "white",
                    borderRadius: "3px",
                  }}
                >
                  <strong>{debug.soundName}</strong> | Original:{" "}
                  {debug.originalDate} | Parseado: {debug.parsedDate} | Día:{" "}
                  {debug.dateKey}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default Analytics;
