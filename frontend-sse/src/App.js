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
import Analytics from "./components/Analytics/Analytics"; // ← IMPORTACIÓN AGREGADA
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
  console.log("🏠 HomePage renderizado con sonidos:", sounds?.length || 0);
  const [featuredSounds, setFeaturedSounds] = useState([]);
  const [recentSounds, setRecentSounds] = useState([]);

  // Función debugState local para HomePage
  const debugState = () => {
    console.log("🔍 Estado actual de HomePage:");
    console.log("   - sounds recibidos:", sounds?.length || 0);
    console.log("   - featuredSounds:", featuredSounds.length);
    console.log("   - recentSounds:", recentSounds.length);
    console.log("   - sounds completos:", sounds);
  };

  useEffect(() => {
    console.log("🏠 HomePage useEffect - sounds cambió:", sounds?.length || 0);

    if (sounds && sounds.length > 0) {
      const recent = sounds.slice(0, 6);
      const featured = sounds.slice(0, 3);

      console.log("📊 Recent sounds:", recent.length);
      console.log("⭐ Featured sounds:", featured.length);

      setRecentSounds(recent);
      setFeaturedSounds(featured);
    } else {
      console.log("⚠️ No hay sonidos para mostrar");
      setRecentSounds([]);
      setFeaturedSounds([]);
    }
  }, [sounds]);

  // Log al renderizar
  console.log("🎨 Renderizando HomePage con:");
  console.log("   - featuredSounds:", featuredSounds.length);
  console.log("   - recentSounds:", recentSounds.length);

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

      {/* Sección de sonidos destacados - CORREGIDA (eliminé duplicación) */}
      <section className="featured-section">
        <h2>Sonidos Destacados</h2>
        {featuredSounds.length > 0 ? (
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
        ) : (
          <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            <p>⚠️ No hay sonidos destacados para mostrar</p>
            <p>Estado: {sounds?.length || 0} sonidos cargados</p>
            <button
              onClick={debugState}
              style={{
                background: "#f59e0b",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              🔍 Debug Estado
            </button>
          </div>
        )}
      </section>

      <section className="recent-section">
        <h2>Sonidos Recientes</h2>
        {recentSounds.length > 0 ? (
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
        ) : (
          <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            <p>⚠️ No hay sonidos recientes para mostrar</p>
          </div>
        )}
      </section>

      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{sounds?.length || 0}</h3>
            <p>Sonidos Totales</p>
          </div>
          <div className="stat-card">
            <h3>{sounds ? new Set(sounds.map((s) => s.autor)).size : 0}</h3>
            <p>Contribuyentes</p>
          </div>
          <div className="stat-card">
            <h3>
              {sounds
                ? new Set(sounds.flatMap((s) => s.emociones || [])).size
                : 0}
            </h3>
            <p>Emociones Únicas</p>
          </div>
        </div>
      </section>
    </div>
  );
};

// Página de exploración
const ExplorePage = ({ sounds, onSoundSelect }) => {
  const [filteredSounds, setFilteredSounds] = useState(sounds || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("");

  useEffect(() => {
    let filtered = sounds || [];

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
            {sounds &&
              Array.from(new Set(sounds.flatMap((s) => s.emociones || []))).map(
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
  console.log("📊 AnalyticsPage recibió sounds:", sounds?.length || 0);

  // Debug: mostrar estructura de los primeros sonidos
  if (sounds && sounds.length > 0) {
    console.log("🎵 Primer sonido en AnalyticsPage:", sounds[0]);
    console.log("📅 Campos de fecha disponibles:", {
      fecha: sounds[0]?.fecha,
      _id: sounds[0]?._id,
      autor: sounds[0]?.autor,
    });
  }

  const adaptedSounds = sounds
    ? sounds.map((sound, index) => {
        // Determinar fecha a usar
        let dateToUse = null;
        if (sound.fecha) {
          dateToUse = sound.fecha;
        } else {
          console.warn(`⚠️ Sonido ${index} sin fecha, usando fecha actual`);
          dateToUse = new Date().toISOString();
        }

        const adapted = {
          // Datos básicos
          author: sound.autor || "Autor desconocido",
          emotions: Array.isArray(sound.emociones) ? sound.emociones : [],

          // Ubicación formateada
          location: sound.ubicacion?.coordinates
            ? `${sound.ubicacion.coordinates[1].toFixed(
                2
              )}, ${sound.ubicacion.coordinates[0].toFixed(2)}`
            : "Ubicación desconocida",

          // Duración con fallback
          duration: sound.duracion || 30,

          // ✅ FECHA CRÍTICA
          createdAt: dateToUse,
          fecha: dateToUse, // Mantener ambos por compatibilidad

          // Mantener datos originales por si acaso
          _id: sound._id,
          nombre: sound.nombre || "Sin nombre",
          descripcion: sound.descripcion || "",

          // Debug info
          originalData:
            process.env.NODE_ENV === "development" ? sound : undefined,
        };

        // Log de debug para los primeros sonidos
        if (index < 3) {
          console.log(`🔄 Sonido ${index} adaptado:`, {
            original_fecha: sound.fecha,
            adapted_createdAt: adapted.createdAt,
            nombre: adapted.nombre,
          });
        }

        return adapted;
      })
    : [];

  console.log("✅ Datos adaptados para Analytics:", {
    total: adaptedSounds.length,
    primerSonido: adaptedSounds[0],
    fechas: adaptedSounds.slice(0, 3).map((s) => ({
      nombre: s.nombre,
      fecha: s.createdAt,
    })),
  });

  return <Analytics sounds={adaptedSounds} />;
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
      console.log("🔄 Iniciando carga de sonidos...");
      setIsLoading(true);

      const response = await soundsAPI.getAllSounds({ limit: 100 });

      console.log("📥 Respuesta recibida:", response);
      console.log("📊 Status:", response.status);
      console.log("📋 Data completa:", response.data);

      if (response.data && response.data.success) {
        const soundsData = response.data.data;
        console.log("🎵 Sonidos extraídos:", soundsData);
        console.log(
          "📊 Cantidad de sonidos:",
          soundsData ? soundsData.length : 0
        );

        if (soundsData && Array.isArray(soundsData)) {
          console.log("✅ Sonidos válidos, actualizando estado...");

          // Validar cada sonido antes de agregarlo
          const validSounds = soundsData.filter((sound, index) => {
            const isValid =
              sound &&
              sound._id &&
              sound.nombre &&
              sound.ubicacion &&
              sound.ubicacion.coordinates &&
              Array.isArray(sound.ubicacion.coordinates) &&
              sound.ubicacion.coordinates.length === 2;

            if (!isValid) {
              console.warn(`⚠️ Sonido inválido en posición ${index}:`, sound);
            }

            return isValid;
          });

          console.log(
            `✅ ${validSounds.length}/${soundsData.length} sonidos válidos`
          );

          setSounds(validSounds);
          setError(null);

          // Log de éxito
          console.log("🎉 Estado actualizado con sonidos:", validSounds);
        } else {
          console.warn("⚠️ soundsData no es un array válido:", soundsData);
          setSounds([]);
        }
      } else {
        console.error("❌ Respuesta no exitosa:", response.data);
        setError("No se pudieron cargar los sonidos");
      }
    } catch (error) {
      console.error("💥 Error cargando sonidos:", error);
      console.error("📋 Error completo:", {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      });
      setError(MESSAGES.errors.networkError);
    } finally {
      setIsLoading(false);
      console.log("🏁 Carga de sonidos finalizada");
    }
  };

  // Debug function para App
  const debugMainState = () => {
    console.log("🔍 Estado principal de App:");
    console.log("   - isLoading:", isLoading);
    console.log("   - error:", error);
    console.log("   - sounds:", sounds);
    console.log("   - sounds.length:", sounds.length);
    console.log("   - connectionStatus:", connectionStatus);
  };

  useEffect(() => {
    console.log("🔄 Estado 'sounds' cambió:", sounds);
    console.log("📊 Cantidad:", sounds.length);
    if (sounds.length > 0) {
      console.log("🎵 Primer sonido:", sounds[0]);
    }
  }, [sounds]);

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

  // Agregar debugMainState al objeto window para acceso global
  useEffect(() => {
    window.debugSoundScape = debugMainState;
  }, [debugMainState]);

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
          <button
            onClick={debugMainState}
            className="btn-secondary"
            style={{ marginLeft: "10px" }}
          >
            🔍 Debug
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

export default App;
