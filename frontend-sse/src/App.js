import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";
import { soundsAPI, healthCheck } from "./services/api";
import SoundMap from "./components/Map/SoundMap";
import SoundForm from "./components/Forms/SoundForm";
import AudioPlayer from "./components/Audio/AudioPlayer";
import { APP_CONFIG, MESSAGES } from "./utils/constants";
import "./App.css";

// Componente de navegación
const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="main-nav">
      <div className="nav-brand">
        <Link to="/">🎵 SoundScape Explorer</Link>
      </div>

      <div className="nav-links">
        <Link to="/" className={isActive("/") ? "active" : ""}>
          🏠 Inicio
        </Link>
        <Link to="/explore" className={isActive("/explore") ? "active" : ""}>
          🗺️ Explorar
        </Link>
        <Link to="/upload" className={isActive("/upload") ? "active" : ""}>
          📤 Subir Sonido
        </Link>
        <Link
          to="/analytics"
          className={isActive("/analytics") ? "active" : ""}
        >
          📊 Análisis
        </Link>
      </div>
    </nav>
  );
};

// Página de inicio
const HomePage = ({ sounds, onSoundSelect }) => {
  const [featuredSounds, setFeaturedSounds] = useState([]);
  const [recentSounds, setRecentSounds] = useState([]);

  useEffect(() => {
    // Obtener sonidos destacados (últimos 6)
    setRecentSounds(sounds.slice(0, 6));
    setFeaturedSounds(sounds.slice(0, 3));
  }, [sounds]);

  return (
    <div className="home-page">
      <header className="hero-section">
        <div className="hero-content">
          <h1>Descubre los Paisajes Sonoros del Mundo</h1>
          <p>
            Explora, escucha y comparte sonidos ambientales de diferentes
            lugares del planeta. Conecta con las emociones que despiertan los
            sonidos de la naturaleza y la ciudad.
          </p>
          <div className="hero-actions">
            <Link to="/explore" className="btn-primary large">
              🗺️ Explorar Mapa
            </Link>
            <Link to="/upload" className="btn-secondary large">
              📤 Subir Sonido
            </Link>
          </div>
        </div>
      </header>

      <section className="featured-section">
        <h2>Sonidos Destacados</h2>
        <div className="sounds-grid">
          {featuredSounds.map((sound) => (
            <div key={sound._id} className="sound-card featured">
              <h3>{sound.nombre}</h3>
              <p className="author">Por: {sound.autor}</p>

              {sound.emociones && sound.emociones.length > 0 && (
                <div className="emotions">
                  {sound.emociones.slice(0, 3).map((emotion, index) => (
                    <span key={index} className="emotion-tag">
                      {emotion}
                    </span>
                  ))}
                </div>
              )}

              <p className="description">
                {sound.descripcion?.substring(0, 100)}
                {sound.descripcion?.length > 100 && "..."}
              </p>

              {sound.audio_url && (
                <AudioPlayer
                  audioUrl={`${APP_CONFIG.UPLOADS_URL}${sound.audio_url}`}
                  title={sound.nombre}
                  compact={true}
                />
              )}

              <button
                onClick={() => onSoundSelect(sound)}
                className="btn-primary small"
              >
                Ver detalles
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="recent-section">
        <h2>Sonidos Recientes</h2>
        <div className="sounds-list">
          {recentSounds.map((sound) => (
            <div key={sound._id} className="sound-item">
              <div className="sound-info">
                <h4>{sound.nombre}</h4>
                <p>Por: {sound.autor}</p>
                <span className="date">
                  {new Date(sound.fecha).toLocaleDateString()}
                </span>
              </div>

              <div className="sound-actions">
                <button
                  onClick={() => onSoundSelect(sound)}
                  className="btn-secondary small"
                >
                  Escuchar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{sounds.length}</h3>
            <p>Sonidos Totales</p>
          </div>
          <div className="stat-card">
            <h3>{new Set(sounds.map((s) => s.autor)).size}</h3>
            <p>Contribuyentes</p>
          </div>
          <div className="stat-card">
            <h3>{new Set(sounds.flatMap((s) => s.emociones || [])).size}</h3>
            <p>Emociones Únicas</p>
          </div>
        </div>
      </section>
    </div>
  );
};

// Página de exploración
const ExplorePage = ({ sounds, onSoundSelect }) => {
  const [filteredSounds, setFilteredSounds] = useState(sounds);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("");

  useEffect(() => {
    let filtered = sounds;

    if (searchTerm) {
      filtered = filtered.filter(
        (sound) =>
          sound.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sound.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sound.autor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedEmotion) {
      filtered = filtered.filter((sound) =>
        sound.emociones?.includes(selectedEmotion)
      );
    }

    setFilteredSounds(filtered);
  }, [sounds, searchTerm, selectedEmotion]);

  return (
    <div className="explore-page">
      <div className="explore-header">
        <h1>Explorar Paisajes Sonoros</h1>

        <div className="filters">
          <input
            type="text"
            placeholder="Buscar sonidos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={selectedEmotion}
            onChange={(e) => setSelectedEmotion(e.target.value)}
            className="emotion-filter"
          >
            <option value="">Todas las emociones</option>
            {Array.from(new Set(sounds.flatMap((s) => s.emociones || []))).map(
              (emotion) => (
                <option key={emotion} value={emotion}>
                  {emotion}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      <div className="explore-content">
        <div className="map-section">
          <SoundMap
            sounds={filteredSounds}
            onSoundSelect={onSoundSelect}
            height="500px"
          />
        </div>

        <div className="results-info">
          Mostrando {filteredSounds.length} sonido(s)
        </div>
      </div>
    </div>
  );
};

// Página de subida
const UploadPage = ({ onSoundCreated }) => {
  const [showForm, setShowForm] = useState(true);

  const handleSuccess = (newSound) => {
    setShowForm(false);
    if (onSoundCreated) {
      onSoundCreated(newSound);
    }

    // Mostrar mensaje de éxito
    alert(MESSAGES.success.soundUploaded);

    // Reiniciar formulario después de un delay
    setTimeout(() => {
      setShowForm(true);
    }, 2000);
  };

  if (!showForm) {
    return (
      <div className="upload-success">
        <h2>✅ Sonido subido exitosamente</h2>
        <p>Tu contribución al mapa sonoro mundial ha sido registrada.</p>
        <Link to="/explore" className="btn-primary">
          Ver en el mapa
        </Link>
      </div>
    );
  }

  return (
    <div className="upload-page">
      <SoundForm
        onSuccess={handleSuccess}
        onCancel={() => window.history.back()}
      />
    </div>
  );
};

// Página de análisis
const AnalyticsPage = ({ sounds }) => {
  const [emotionStats, setEmotionStats] = useState([]);
  const [locationStats, setLocationStats] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [generalStats, setGeneralStats] = useState({});

  const calculateAnalytics = () => {
    // Calcular estadísticas de emociones
    const emotions = {};
    sounds.forEach((sound) => {
      sound.emociones?.forEach((emotion) => {
        emotions[emotion] = (emotions[emotion] || 0) + 1;
      });
    });

    const emotionData = Object.entries(emotions)
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setEmotionStats(emotionData);

    // Calcular estadísticas de ubicación (agrupadas por región)
    const locations = {};
    sounds.forEach((sound) => {
      const lat = Math.round(sound.ubicacion.coordinates[1]);
      const lng = Math.round(sound.ubicacion.coordinates[0]);
      const key = `${lat},${lng}`;
      locations[key] = (locations[key] || 0) + 1;
    });

    const locationData = Object.entries(locations)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    setLocationStats(locationData);

    // Calcular datos de timeline (últimos 30 días)
    const timeline = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    sounds
      .filter((sound) => new Date(sound.fecha) >= thirtyDaysAgo)
      .forEach((sound) => {
        const date = new Date(sound.fecha).toISOString().split("T")[0];
        timeline[date] = (timeline[date] || 0) + 1;
      });

    const timelineArray = Object.entries(timeline)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    setTimelineData(timelineArray);

    // Calcular estadísticas generales
    const totalDuration = sounds.reduce(
      (sum, sound) => sum + (sound.duracion || 0),
      0
    );
    const uniqueAuthors = new Set(sounds.map((s) => s.autor)).size;
    const uniqueEmotions = new Set(sounds.flatMap((s) => s.emociones || []))
      .size;
    const averageDuration =
      sounds.length > 0 ? totalDuration / sounds.length : 0;

    setGeneralStats({
      totalSounds: sounds.length,
      uniqueAuthors,
      uniqueEmotions,
      totalDuration,
      averageDuration,
      lastUpload: sounds[0] ? new Date(sounds[0].fecha) : null,
    });
  };

  useEffect(() => {
    calculateAnalytics();
  }, [sounds]);

  return (
    <div className="analytics-page">
      <h1>📊 Análisis de Paisajes Sonoros</h1>

      {/* Estadísticas generales */}
      <section className="stats-overview">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎵</div>
            <div className="stat-content">
              <h3>{generalStats.totalSounds}</h3>
              <p>Sonidos Totales</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{generalStats.uniqueAuthors}</h3>
              <p>Contribuyentes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💭</div>
            <div className="stat-content">
              <h3>{generalStats.uniqueEmotions}</h3>
              <p>Emociones Únicas</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <h3>{Math.round((generalStats.totalDuration || 0) / 60)}</h3>
              <p>Minutos Totales</p>
            </div>
          </div>
        </div>
      </section>

      <div className="analytics-grid">
        {/* Gráfico de emociones */}
        <div className="analytics-card">
          <h3>🎭 Emociones Más Populares</h3>
          <div className="emotion-chart">
            {emotionStats.map(({ emotion, count }, index) => {
              const maxCount = emotionStats[0]?.count || 1;
              const percentage = (count / maxCount) * 100;

              return (
                <div key={emotion} className="emotion-bar">
                  <div className="emotion-info">
                    <span className="emotion-name">{emotion}</span>
                    <span className="emotion-count">{count}</span>
                  </div>
                  <div className="bar-container">
                    <div
                      className="bar"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: getEmotionColor(emotion),
                        animationDelay: `${index * 0.1}s`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ubicaciones más activas */}
        <div className="analytics-card">
          <h3>📍 Ubicaciones Más Activas</h3>
          <div className="location-chart">
            {locationStats.map(({ location, count }) => (
              <div key={location} className="location-item">
                <span className="location-name">📍 {location}</span>
                <span className="count">{count} sonidos</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline de actividad */}
        <div className="analytics-card timeline-card">
          <h3>📈 Actividad Reciente (Últimos 30 días)</h3>
          <div className="timeline-chart">
            {timelineData.length > 0 ? (
              <div className="timeline-bars">
                {timelineData.map(({ date, count }) => {
                  const maxCount = Math.max(
                    ...timelineData.map((d) => d.count)
                  );
                  const height = (count / maxCount) * 100;

                  return (
                    <div key={date} className="timeline-bar">
                      <div
                        className="bar"
                        style={{ height: `${height}%` }}
                        title={`${date}: ${count} sonidos`}
                      />
                      <span className="date-label">
                        {new Date(date).getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-data">No hay datos recientes</p>
            )}
          </div>
        </div>

        {/* Estadísticas adicionales */}
        <div className="analytics-card">
          <h3>📋 Estadísticas Detalladas</h3>
          <div className="detailed-stats">
            <div className="stat-row">
              <strong>Duración promedio:</strong>
              <span>
                {Math.round(generalStats.averageDuration || 0)} segundos
              </span>
            </div>
            <div className="stat-row">
              <strong>Sonidos por autor:</strong>
              <span>
                {(
                  generalStats.totalSounds / (generalStats.uniqueAuthors || 1)
                ).toFixed(1)}
              </span>
            </div>
            <div className="stat-row">
              <strong>Emociones por sonido:</strong>
              <span>
                {(
                  generalStats.uniqueEmotions / (generalStats.totalSounds || 1)
                ).toFixed(1)}
              </span>
            </div>
            <div className="stat-row">
              <strong>Último sonido:</strong>
              <span>
                {generalStats.lastUpload
                  ? new Date(generalStats.lastUpload).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de insights */}
      {sounds.length > 0 && (
        <section className="insights-section">
          <h3>🔍 Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <h4>Emoción Dominante</h4>
              <p>
                <strong>{emotionStats[0]?.emotion || "N/A"}</strong> es la
                emoción más común con {emotionStats[0]?.count || 0} sonidos.
              </p>
            </div>

            <div className="insight-card">
              <h4>Diversidad Emocional</h4>
              <p>
                El mapa sonoro cubre{" "}
                <strong>{generalStats.uniqueEmotions}</strong> emociones
                diferentes, mostrando gran diversidad.
              </p>
            </div>

            <div className="insight-card">
              <h4>Participación</h4>
              <p>
                <strong>{generalStats.uniqueAuthors}</strong> personas han
                contribuido al proyecto hasta ahora.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

// Modal para detalles de sonido
const SoundModal = ({ sound, onClose }) => {
  if (!sound) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{sound.nombre}</h2>
          <button onClick={onClose} className="close-btn">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="sound-details">
            <p>
              <strong>Autor:</strong> {sound.autor}
            </p>
            <p>
              <strong>Fecha:</strong> {new Date(sound.fecha).toLocaleString()}
            </p>

            {sound.descripcion && (
              <p>
                <strong>Descripción:</strong> {sound.descripcion}
              </p>
            )}

            {sound.emociones && sound.emociones.length > 0 && (
              <div className="emotions">
                <strong>Emociones:</strong>
                <div className="emotion-tags">
                  {sound.emociones.map((emotion, index) => (
                    <span key={index} className="emotion-tag">
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {sound.etiquetas && sound.etiquetas.length > 0 && (
              <div className="tags">
                <strong>Etiquetas:</strong> {sound.etiquetas.join(", ")}
              </div>
            )}

            <p>
              <strong>Ubicación:</strong>{" "}
              {sound.ubicacion.coordinates[1].toFixed(4)},{" "}
              {sound.ubicacion.coordinates[0].toFixed(4)}
            </p>
          </div>

          {sound.audio_url && (
            <div className="audio-section">
              <AudioPlayer
                audioUrl={`${APP_CONFIG.UPLOADS_URL}${sound.audio_url}`}
                title={sound.nombre}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente principal de la aplicación
function App() {
  const [sounds, setSounds] = useState([]);
  const [selectedSound, setSelectedSound] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("checking");

  // Cargar sonidos al iniciar la aplicación
  useEffect(() => {
    loadSounds();
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      await healthCheck();
      setConnectionStatus("connected");
    } catch (error) {
      setConnectionStatus("disconnected");
      setError("No se puede conectar al servidor");
    }
  };

  const loadSounds = async () => {
    try {
      setIsLoading(true);
      const response = await soundsAPI.getAllSounds({ limit: 100 });

      if (response.data.success) {
        setSounds(response.data.data);
        setError(null);
      }
    } catch (error) {
      console.error("Error cargando sonidos:", error);
      setError(MESSAGES.errors.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSoundCreated = (newSound) => {
    setSounds((prev) => [newSound, ...prev]);
    loadSounds(); // Recargar para obtener datos completos
  };

  const handleSoundSelect = (sound) => {
    setSelectedSound(sound);
  };

  const closeModal = () => {
    setSelectedSound(null);
  };

  // Mostrar pantalla de carga
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando paisajes sonoros...</p>
        </div>
      </div>
    );
  }

  // Mostrar error de conexión
  if (connectionStatus === "disconnected") {
    return (
      <div className="error-screen">
        <div className="error-content">
          <h2>❌ Error de Conexión</h2>
          <p>{error}</p>
          <button onClick={checkConnection} className="btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navigation />

        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage sounds={sounds} onSoundSelect={handleSoundSelect} />
              }
            />
            <Route
              path="/explore"
              element={
                <ExplorePage
                  sounds={sounds}
                  onSoundSelect={handleSoundSelect}
                />
              }
            />
            <Route
              path="/upload"
              element={<UploadPage onSoundCreated={handleSoundCreated} />}
            />
            <Route
              path="/analytics"
              element={<AnalyticsPage sounds={sounds} />}
            />
            {/* Ruta catch-all para redirigir a home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Modal para detalles de sonido */}
        <SoundModal sound={selectedSound} onClose={closeModal} />

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>SoundScape Explorer</h4>
              <p>Descubriendo los paisajes sonoros del mundo</p>
            </div>

            <div className="footer-section">
              <h4>Estadísticas</h4>
              <p>{sounds.length} sonidos registrados</p>
              <p>{new Set(sounds.map((s) => s.autor)).size} contribuyentes</p>
            </div>

            <div className="footer-section">
              <h4>Estado del Sistema</h4>
              <p className={`status ${connectionStatus}`}>
                {connectionStatus === "connected" ? "🟢" : "🔴"}
                {connectionStatus === "connected"
                  ? "Conectado"
                  : "Desconectado"}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

// Función helper para obtener color de emoción
const getEmotionColor = (emotion) => {
  const colors = {
    relajante: "#10b981",
    energético: "#f59e0b",
    nostálgico: "#8b5cf6",
    misterioso: "#6b7280",
    alegre: "#fbbf24",
    melancólico: "#6366f1",
    caótico: "#ef4444",
    peaceful: "#34d399",
    inspirador: "#06b6d4",
    romántico: "#ec4899",
    aventurero: "#f97316",
    meditativo: "#84cc16",
  };

  return colors[emotion] || "#6b7280";
};

export default App;