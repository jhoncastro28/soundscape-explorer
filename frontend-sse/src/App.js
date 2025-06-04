import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
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

  useEffect(() => {
    // Calcular estadísticas de emociones
    const emotions = {};
    sounds.forEach((sound) => {
      sound.emociones?.forEach((emotion) => {
        emotions[emotion] = (emotions[emotion] || 0) + 1;
      });
    });

    setEmotionStats(
      Object.entries(emotions)
        .map(([emotion, count]) => ({ emotion, count }))
        .sort((a, b) => b.count - a.count)
    );

    // Calcular estadísticas de ubicación (por país/región)
    // Esto es una simplificación, en una app real usarías geocoding
    const locations = {};
    sounds.forEach((sound) => {
      const key = `${Math.round(sound.ubicacion.coordinates[1])},${Math.round(
        sound.ubicacion.coordinates[0]
      )}`;
      locations[key] = (locations[key] || 0) + 1;
    });

    setLocationStats(
      Object.entries(locations)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    );
  }, [sounds]);

  return (
    <div className="analytics-page">
      <h1>Análisis de Paisajes Sonoros</h1>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Emociones Más Populares</h3>
          <div className="emotion-chart">
            {emotionStats.slice(0, 10).map(({ emotion, count }) => (
              <div key={emotion} className="emotion-bar">
                <span className="emotion-name">{emotion}</span>
                <div className="bar-container">
                  <div
                    className="bar"
                    style={{
                      width: `${(count / emotionStats[0]?.count) * 100}%`,
                    }}
                  />
                  <span className="count">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <h3>Ubicaciones Más Activas</h3>
          <div className="location-chart">
            {locationStats.map(({ location, count }) => (
              <div key={location} className="location-item">
                <span className="location-name">📍 {location}</span>
                <span className="count">{count} sonidos</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <h3>Estadísticas Generales</h3>
          <div className="general-stats">
            <div className="stat">
              <strong>Total de sonidos:</strong> {sounds.length}
            </div>
            <div className="stat">
              <strong>Contribuyentes únicos:</strong>{" "}
              {new Set(sounds.map((s) => s.autor)).size}
            </div>
            <div className="stat">
              <strong>Emociones únicas:</strong>{" "}
              {new Set(sounds.flatMap((s) => s.emociones || [])).size}
            </div>
            <div className="stat">
              <strong>Último sonido:</strong>{" "}
              {sounds[0] ? new Date(sounds[0].fecha).toLocaleString() : "N/A"}
            </div>
          </div>
        </div>
      </div>
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

export default App;
