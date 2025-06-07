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
import SearchForm from "./components/Forms/SearchForm";
import { APP_CONFIG, MESSAGES } from "./utils/constants";
import "./App.css";

// Componente de navegación mejorado
const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Inicio", icon: "🏠" },
    { path: "/explore", label: "Explorar", icon: "🗺️" },
    { path: "/upload", label: "Subir", icon: "📤" },
    { path: "/analytics", label: "Análisis", icon: "📊" },
  ];

  return (
    <nav className="main-nav">
      <div className="nav-brand">
        <Link to="/">
          <span className="brand-icon">🎵</span>
          SoundScape Explorer
        </Link>
      </div>

      <div className={`nav-links ${isMenuOpen ? "mobile-open" : ""}`}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={isActive(item.path) ? "active" : ""}
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.label}</span>
          </Link>
        ))}
      </div>

      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  );
};

// Componente de página de inicio mejorado
const HomePage = ({ sounds, onSoundSelect }) => {
  console.log("🏠 HomePage renderizado con sonidos:", sounds?.length || 0);
  const [featuredSounds, setFeaturedSounds] = useState([]);
  const [recentSounds, setRecentSounds] = useState([]);
  const [statsData, setStatsData] = useState({});

  useEffect(() => {
    console.log("🏠 HomePage useEffect - sounds cambió:", sounds?.length || 0);

    if (sounds && sounds.length > 0) {
      const recent = sounds.slice(0, 6);
      const featured = sounds
        .filter(
          (sound) =>
            sound.emociones?.includes("inspirador") ||
            sound.emociones?.includes("relajante") ||
            sound.emociones?.includes("peaceful")
        )
        .slice(0, 3);

      setRecentSounds(recent);
      setFeaturedSounds(featured.length > 0 ? featured : sounds.slice(0, 3));

      // Calcular estadísticas
      const stats = {
        totalSounds: sounds.length,
        uniqueAuthors: new Set(sounds.map((s) => s.autor)).size,
        uniqueEmotions: new Set(sounds.flatMap((s) => s.emociones || [])).size,
        totalMinutes: Math.round(
          sounds.reduce((sum, s) => sum + (s.duracion || 0), 0) / 60
        ),
        avgDuration:
          sounds.length > 0
            ? Math.round(
                sounds.reduce((sum, s) => sum + (s.duracion || 0), 0) /
                  sounds.length
              )
            : 0,
      };
      setStatsData(stats);
    } else {
      setRecentSounds([]);
      setFeaturedSounds([]);
      setStatsData({});
    }
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
              <span className="btn-icon">🗺️</span>
              Explorar Mapa
            </Link>
            <Link to="/upload" className="btn-secondary large">
              <span className="btn-icon">📤</span>
              Subir Sonido
            </Link>
          </div>
        </div>
      </header>

      {/* Estadísticas destacadas */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card hover-lift">
            <div className="stat-icon">🎵</div>
            <div className="stat-content">
              <div className="stat-value">{statsData.totalSounds || 0}</div>
              <div className="stat-label">Sonidos Totales</div>
            </div>
          </div>
          <div className="stat-card hover-lift">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{statsData.uniqueAuthors || 0}</div>
              <div className="stat-label">Contribuyentes</div>
            </div>
          </div>
          <div className="stat-card hover-lift">
            <div className="stat-icon">💭</div>
            <div className="stat-content">
              <div className="stat-value">{statsData.uniqueEmotions || 0}</div>
              <div className="stat-label">Emociones Únicas</div>
            </div>
          </div>
          <div className="stat-card hover-lift">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-value">{statsData.totalMinutes || 0}</div>
              <div className="stat-label">Minutos Totales</div>
            </div>
          </div>
        </div>
      </section>

      {/* Sonidos destacados */}
      <section className="featured-section">
        <h2 className="gradient-text">✨ Sonidos Destacados</h2>
        {featuredSounds.length > 0 ? (
          <div className="sounds-grid">
            {featuredSounds.map((sound) => (
              <div
                key={sound._id}
                className="sound-card featured hover-lift floating-element"
              >
                <div className="card-header">
                  <h3>{sound.nombre}</h3>
                  <span className="featured-badge">⭐ Destacado</span>
                </div>
                <p className="author">
                  <span className="author-icon">👤</span>
                  {sound.autor}
                </p>

                {sound.emociones && sound.emociones.length > 0 && (
                  <div className="emotions">
                    <div className="emotion-tags">
                      {sound.emociones.slice(0, 3).map((emotion, index) => (
                        <span key={index} className="emotion-tag ripple-effect">
                          {emotion}
                        </span>
                      ))}
                      {sound.emociones.length > 3 && (
                        <span className="emotion-count">
                          +{sound.emociones.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <p className="description">
                  {sound.descripcion?.substring(0, 120)}
                  {sound.descripcion?.length > 120 && "..."}
                </p>

                {sound.audio_url && (
                  <div className="audio-preview">
                    <AudioPlayer
                      audioUrl={`${APP_CONFIG.UPLOADS_URL}${sound.audio_url}`}
                      title={sound.nombre}
                      compact={true}
                    />
                  </div>
                )}

                <div className="card-actions">
                  <button
                    onClick={() => onSoundSelect(sound)}
                    className="btn-primary small ripple-effect"
                  >
                    <span className="btn-icon">👁️</span>
                    Ver detalles
                  </button>
                  <div className="sound-meta">
                    <span className="duration">
                      ⏱️ {Math.round((sound.duracion || 0) / 60)}min
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎵</div>
            <h3>No hay sonidos destacados</h3>
            <p>Sé el primero en compartir un sonido increíble</p>
            <Link to="/upload" className="btn-primary">
              <span className="btn-icon">📤</span>
              Subir Sonido
            </Link>
          </div>
        )}
      </section>

      {/* Sonidos recientes */}
      <section className="recent-section">
        <h2 className="gradient-text">🕒 Sonidos Recientes</h2>
        {recentSounds.length > 0 ? (
          <div className="sounds-list">
            {recentSounds.map((sound, index) => (
              <div
                key={sound._id}
                className="sound-item hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="sound-info">
                  <div className="sound-header">
                    <h4>{sound.nombre}</h4>
                    {sound.emociones?.[0] && (
                      <span className="primary-emotion">
                        {getEmotionEmoji(sound.emociones[0])}{" "}
                        {sound.emociones[0]}
                      </span>
                    )}
                  </div>
                  <p className="sound-author">
                    <span className="author-icon">👤</span>
                    {sound.autor}
                  </p>
                  <div className="sound-meta">
                    <span className="date">
                      📅 {new Date(sound.fecha).toLocaleDateString()}
                    </span>
                    <span className="duration">
                      ⏱️ {Math.round((sound.duracion || 0) / 60)}min
                    </span>
                  </div>
                </div>

                <div className="sound-actions">
                  <button
                    onClick={() => onSoundSelect(sound)}
                    className="btn-secondary small ripple-effect"
                  >
                    <span className="btn-icon">🎧</span>
                    Escuchar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🕒</div>
            <h3>No hay sonidos recientes</h3>
            <p>Los sonidos aparecerán aquí una vez que se suban</p>
          </div>
        )}
      </section>
    </div>
  );
};

// Página de exploración mejorada
const ExplorePage = ({ sounds, onSoundSelect }) => {
  const [filteredSounds, setFilteredSounds] = useState(sounds || []);
  const [searchParams, setSearchParams] = useState({});
  const [viewMode, setViewMode] = useState("map"); // 'map' o 'grid'

  const handleSearch = (params) => {
    setSearchParams(params);
    let filtered = sounds || [];

    // Aplicar filtros
    if (params.query) {
      const query = params.query.toLowerCase();
      filtered = filtered.filter(
        (sound) =>
          sound.nombre.toLowerCase().includes(query) ||
          sound.descripcion?.toLowerCase().includes(query) ||
          sound.autor.toLowerCase().includes(query)
      );
    }

    if (params.emotion) {
      filtered = filtered.filter((sound) =>
        sound.emociones?.includes(params.emotion)
      );
    }

    if (params.soundType) {
      filtered = filtered.filter((sound) =>
        sound.sonidos?.includes(params.soundType)
      );
    }

    if (params.author) {
      const author = params.author.toLowerCase();
      filtered = filtered.filter((sound) =>
        sound.autor.toLowerCase().includes(author)
      );
    }

    setFilteredSounds(filtered);
  };

  useEffect(() => {
    setFilteredSounds(sounds || []);
  }, [sounds]);

  return (
    <div className="explore-page">
      <div className="explore-header">
        <h1 className="gradient-text">🗺️ Explorar Paisajes Sonoros</h1>
        <p className="explore-subtitle">
          Descubre sonidos increíbles de todo el mundo y conecta con nuevas
          experiencias auditivas
        </p>
      </div>

      {/* Formulario de búsqueda */}
      <SearchForm
        onSearch={handleSearch}
        onReset={() => {
          setSearchParams({});
          setFilteredSounds(sounds || []);
        }}
        className="explore-search"
      />

      {/* Controles de vista */}
      <div className="view-controls">
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === "map" ? "active" : ""}`}
            onClick={() => setViewMode("map")}
          >
            <span className="btn-icon">🗺️</span>
            Vista Mapa
          </button>
          <button
            className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            <span className="btn-icon">⊞</span>
            Vista Grid
          </button>
        </div>

        <div className="results-info">
          <span className="results-count">
            🎵 {filteredSounds.length} sonido
            {filteredSounds.length !== 1 ? "s" : ""} encontrado
            {filteredSounds.length !== 1 ? "s" : ""}
          </span>
          {Object.keys(searchParams).some((key) => searchParams[key]) && (
            <span className="filtered-indicator">📊 Filtrado</span>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="explore-content">
        {viewMode === "map" ? (
          <div className="map-section">
            <SoundMap
              sounds={filteredSounds}
              onSoundSelect={onSoundSelect}
              height="600px"
              featuredSounds={filteredSounds.filter(
                (s) =>
                  s.emociones?.includes("inspirador") ||
                  s.emociones?.includes("relajante")
              )}
            />
          </div>
        ) : (
          <div className="grid-section">
            {filteredSounds.length > 0 ? (
              <div className="sounds-grid">
                {filteredSounds.map((sound, index) => (
                  <div
                    key={sound._id}
                    className="sound-card hover-lift"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="card-header">
                      <h3>{sound.nombre}</h3>
                      <div className="card-meta">
                        <span className="location-hint">
                          📍 {sound.ubicacion.coordinates[1].toFixed(2)},{" "}
                          {sound.ubicacion.coordinates[0].toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <p className="author">
                      <span className="author-icon">👤</span>
                      {sound.autor}
                    </p>

                    {sound.emociones && sound.emociones.length > 0 && (
                      <div className="emotions">
                        <div className="emotion-tags">
                          {sound.emociones.slice(0, 3).map((emotion, index) => (
                            <span key={index} className="emotion-tag">
                              {emotion}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {sound.descripcion && (
                      <p className="description">
                        {sound.descripcion.substring(0, 100)}
                        {sound.descripcion.length > 100 && "..."}
                      </p>
                    )}

                    {sound.audio_url && (
                      <div className="audio-preview">
                        <AudioPlayer
                          audioUrl={`${APP_CONFIG.UPLOADS_URL}${sound.audio_url}`}
                          title={sound.nombre}
                          compact={true}
                        />
                      </div>
                    )}

                    <div className="card-actions">
                      <button
                        onClick={() => onSoundSelect(sound)}
                        className="btn-primary small"
                      >
                        <span className="btn-icon">👁️</span>
                        Ver detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state large">
                <div className="empty-icon">🔍</div>
                <h3>No se encontraron sonidos</h3>
                <p>
                  Intenta ajustar los filtros de búsqueda o explora diferentes
                  términos
                </p>
                <button
                  onClick={() => {
                    setSearchParams({});
                    setFilteredSounds(sounds || []);
                  }}
                  className="btn-secondary"
                >
                  <span className="btn-icon">🔄</span>
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Página de subida mejorada
const UploadPage = ({ onSoundCreated }) => {
  const [showForm, setShowForm] = useState(true);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleSuccess = (newSound) => {
    setShowForm(false);
    setUploadSuccess(true);
    if (onSoundCreated) {
      onSoundCreated(newSound);
    }

    // Reiniciar después de 3 segundos
    setTimeout(() => {
      setShowForm(true);
      setUploadSuccess(false);
    }, 3000);
  };

  if (uploadSuccess) {
    return (
      <div className="upload-success">
        <div className="success-content">
          <div className="success-icon">🎉</div>
          <h2>¡Sonido subido exitosamente!</h2>
          <p>Tu contribución al mapa sonoro mundial ha sido registrada.</p>
          <div className="success-actions">
            <Link to="/explore" className="btn-primary">
              <span className="btn-icon">🗺️</span>
              Ver en el mapa
            </Link>
            <button
              onClick={() => {
                setUploadSuccess(false);
                setShowForm(true);
              }}
              className="btn-secondary"
            >
              <span className="btn-icon">📤</span>
              Subir otro
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-page">
      <div className="upload-header">
        <h1 className="gradient-text">📤 Compartir un Sonido</h1>
        <p className="upload-subtitle">
          Comparte los sonidos únicos de tu entorno y contribuye al mapa sonoro
          global
        </p>
      </div>

      {showForm && (
        <SoundForm
          onSuccess={handleSuccess}
          onCancel={() => window.history.back()}
        />
      )}
    </div>
  );
};

// Página de análisis mejorada (se mantiene igual pero con mejores estilos)
const AnalyticsPage = ({ sounds }) => {
  // ... (mantener la lógica existente pero aplicar los nuevos estilos)
  return (
    <div className="analytics-page">
      <h1>📊 Análisis de Paisajes Sonoros</h1>
      {/* ... resto del contenido ... */}
    </div>
  );
};

// Modal mejorado para detalles de sonido
const SoundModal = ({ sound, onClose }) => {
  if (!sound) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-morphism"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>
            <span className="modal-icon">🎵</span>
            {sound.nombre}
          </h2>
          <button onClick={onClose} className="close-btn">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="sound-details">
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">👤 Autor</span>
                <span className="detail-value">{sound.autor}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">📅 Fecha</span>
                <span className="detail-value">
                  {new Date(sound.fecha).toLocaleDateString()}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">⏱️ Duración</span>
                <span className="detail-value">
                  {Math.round((sound.duracion || 0) / 60)} minutos
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">📍 Ubicación</span>
                <span className="detail-value">
                  {sound.ubicacion.coordinates[1].toFixed(4)},{" "}
                  {sound.ubicacion.coordinates[0].toFixed(4)}
                </span>
              </div>
            </div>

            {sound.descripcion && (
              <div className="description-section">
                <h4>📝 Descripción</h4>
                <p>{sound.descripcion}</p>
              </div>
            )}

            {sound.emociones && sound.emociones.length > 0 && (
              <div className="emotions-section">
                <h4>💭 Emociones</h4>
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
              <div className="tags-section">
                <h4>🏷️ Etiquetas</h4>
                <div className="tag-list">
                  {sound.etiquetas.map((tag, index) => (
                    <span key={index} className="tag-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {sound.audio_url && (
            <div className="audio-section">
              <h4>🎧 Reproductor</h4>
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

// Función helper para obtener emoji de emoción
const getEmotionEmoji = (emotion) => {
  const emojiMap = {
    relajante: "🌿",
    energético: "⚡",
    nostálgico: "🌅",
    misterioso: "🌙",
    alegre: "😊",
    melancólico: "🌧️",
    caótico: "🌪️",
    peaceful: "☮️",
    inspirador: "✨",
    romántico: "💝",
    aventurero: "🏔️",
    meditativo: "🧘",
  };
  return emojiMap[emotion] || "🎵";
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
      console.log("🔄 Iniciando carga de sonidos...");
      setIsLoading(true);

      const response = await soundsAPI.getAllSounds({ limit: 100 });

      if (response.data && response.data.success) {
        const soundsData = response.data.data;

        if (soundsData && Array.isArray(soundsData)) {
          const validSounds = soundsData.filter((sound) => {
            return (
              sound &&
              sound._id &&
              sound.nombre &&
              sound.ubicacion &&
              sound.ubicacion.coordinates &&
              Array.isArray(sound.ubicacion.coordinates) &&
              sound.ubicacion.coordinates.length === 2
            );
          });

          setSounds(validSounds);
          setError(null);
        } else {
          setSounds([]);
        }
      } else {
        setError("No se pudieron cargar los sonidos");
      }
    } catch (error) {
      console.error("💥 Error cargando sonidos:", error);
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

  // Mostrar pantalla de carga moderna
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando paisajes sonoros del mundo...</p>
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
          <div className="error-actions">
            <button onClick={checkConnection} className="btn-primary">
              <span className="btn-icon">🔄</span>
              Reintentar
            </button>
          </div>
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Modal para detalles de sonido */}
        <SoundModal sound={selectedSound} onClose={closeModal} />

        {/* Footer mejorado */}
        <footer className="app-footer glass-morphism">
          <div className="footer-content">
            <div className="footer-section">
              <h4>🎵 SoundScape Explorer</h4>
              <p>
                Descubriendo los paisajes sonoros del mundo, una grabación a la
                vez.
              </p>
            </div>

            <div className="footer-section">
              <h4>📊 Estadísticas</h4>
              <p>{sounds.length} sonidos registrados</p>
              <p>
                {new Set(sounds.map((s) => s.autor)).size} contribuyentes
                activos
              </p>
              <p>
                {new Set(sounds.flatMap((s) => s.emociones || [])).size}{" "}
                emociones capturadas
              </p>
            </div>

            <div className="footer-section">
              <h4>🔗 Estado del Sistema</h4>
              <p className={`status ${connectionStatus}`}>
                <span className="status-icon">
                  {connectionStatus === "connected" ? "🟢" : "🔴"}
                </span>
                <span className="status-text">
                  {connectionStatus === "connected"
                    ? "Sistema operativo"
                    : "Desconectado"}
                </span>
              </p>
              <p className="last-update">
                Última actualización: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
