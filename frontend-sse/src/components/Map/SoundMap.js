import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { soundsAPI } from "../../services/api";
import { APP_CONFIG, MAP_CONFIG, EMOTION_COLORS } from "../../utils/constants";
import SimpleAudioPlayer from "../Audio/AudioPlayer";
import "./SoundMap.css";

// Configurar iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Componente para manejar eventos del mapa
function MapEventHandler({ onLocationSelect, showLocationSelector }) {
  const [marker, setMarker] = useState(null);

  const map = useMapEvents({
    click(e) {
      if (showLocationSelector && onLocationSelect) {
        const { lat, lng } = e.latlng;
        setMarker([lat, lng]);
        onLocationSelect(lat, lng);
      }
    },
  });

  return marker && showLocationSelector ? (
    <Marker position={marker}>
      <Popup>
        <div className="location-popup">
          <div className="popup-header">
            <span className="location-icon">📍</span>
            <strong>Nueva ubicación seleccionada</strong>
          </div>
          <div className="coordinates">
            <div className="coordinate-item">
              <span className="label">Lat:</span>
              <span className="value">{marker[0].toFixed(6)}</span>
            </div>
            <div className="coordinate-item">
              <span className="label">Lng:</span>
              <span className="value">{marker[1].toFixed(6)}</span>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  ) : null;
}

// Crear icono animado y llamativo para sonidos
const createSoundIcon = (emotion, soundName) => {
  const color = EMOTION_COLORS[emotion] || "#667eea";
  const pulseColor = color + "80"; // Color con transparencia para el pulso

  // Seleccionar emoji basado en la emoción
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
      concentración: "🎯",
      estrés: "😰",
      ansiedad: "😟",
      felicidad: "😄",
      tristeza: "😢",
      motivador: "💪",
    };
    return emojiMap[emotion] || "🎵";
  };

  const emoji = getEmotionEmoji(emotion);

  return L.divIcon({
    className: "custom-sound-marker",
    html: `
      <div class="sound-marker-container" style="--marker-color: ${color}; --pulse-color: ${pulseColor};">
        <div class="sound-marker-pulse"></div>
        <div class="sound-marker-pulse-2"></div>
        <div class="sound-marker-main">
          <div class="sound-marker-inner">
            <span class="sound-emoji">${emoji}</span>
          </div>
          <div class="sound-marker-ring"></div>
        </div>
        <div class="sound-marker-tooltip">
          <div class="tooltip-content">
            <span class="tooltip-title">${soundName}</span>
            <span class="tooltip-emotion">${emotion}</span>
          </div>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -25],
  });
};

// Crear icono especial para sonidos destacados
const createFeaturedSoundIcon = (emotion, soundName) => {
  const color = EMOTION_COLORS[emotion] || "#667eea";

  return L.divIcon({
    className: "custom-sound-marker featured",
    html: `
      <div class="featured-marker-container" style="--marker-color: ${color};">
        <div class="featured-marker-rays"></div>
        <div class="featured-marker-pulse"></div>
        <div class="featured-marker-main">
          <div class="featured-marker-crown">👑</div>
          <div class="featured-marker-inner">
            <span class="sound-emoji">🎵</span>
          </div>
          <div class="featured-marker-sparkles">
            <span class="sparkle sparkle-1">✨</span>
            <span class="sparkle sparkle-2">✨</span>
            <span class="sparkle sparkle-3">✨</span>
          </div>
        </div>
        <div class="featured-tooltip">
          <div class="tooltip-content">
            <span class="tooltip-badge">⭐ DESTACADO</span>
            <span class="tooltip-title">${soundName}</span>
            <span class="tooltip-emotion">${emotion}</span>
          </div>
        </div>
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -30],
  });
};

const SoundMap = ({
  sounds = [],
  onSoundSelect,
  onLocationSelect,
  showLocationSelector = false,
  center = [APP_CONFIG.DEFAULT_LAT, APP_CONFIG.DEFAULT_LNG],
  zoom = APP_CONFIG.DEFAULT_ZOOM,
  height = "500px",
  featuredSounds = [],
}) => {
  const [selectedSound, setSelectedSound] = useState(null);
  const [mapSounds, setMapSounds] = useState([]);
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);
  const [hoveredSound, setHoveredSound] = useState(null);
  const mapRef = useRef();

  useEffect(() => {
    console.log("🗺️ SoundMap recibió sonidos:", sounds?.length || 0);

    // Validar y filtrar sonidos
    const validSounds = (sounds || []).filter((sound) => {
      const isValid =
        sound &&
        sound._id &&
        sound.ubicacion &&
        sound.ubicacion.coordinates &&
        Array.isArray(sound.ubicacion.coordinates) &&
        sound.ubicacion.coordinates.length === 2 &&
        typeof sound.ubicacion.coordinates[0] === "number" &&
        typeof sound.ubicacion.coordinates[1] === "number" &&
        !isNaN(sound.ubicacion.coordinates[0]) &&
        !isNaN(sound.ubicacion.coordinates[1]);

      if (!isValid) {
        console.warn("🗺️ Sonido inválido para mapa:", sound);
      }

      return isValid;
    });

    console.log(
      `🗺️ Sonidos válidos para mapa: ${validSounds.length}/${
        sounds?.length || 0
      }`
    );

    setMapSounds(validSounds);

    // Ajustar vista del mapa si hay sonidos
    if (validSounds.length > 0) {
      const lats = validSounds.map((s) => s.ubicacion.coordinates[1]);
      const lngs = validSounds.map((s) => s.ubicacion.coordinates[0]);

      const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

      setMapCenter([centerLat, centerLng]);

      if (validSounds.length > 1) {
        const latRange = Math.max(...lats) - Math.min(...lats);
        const lngRange = Math.max(...lngs) - Math.min(...lngs);
        const maxRange = Math.max(latRange, lngRange);

        let newZoom = 10;
        if (maxRange < 0.01) newZoom = 15;
        else if (maxRange < 0.1) newZoom = 12;
        else if (maxRange < 1) newZoom = 8;
        else newZoom = 6;

        setMapZoom(newZoom);
      }
    }
  }, [sounds]);

  const handleMarkerClick = (sound) => {
    console.log("🗺️ Marcador clickeado:", sound.nombre);
    setSelectedSound(sound);
    if (onSoundSelect) {
      onSoundSelect(sound);
    }
  };

  const handleLoadSoundsInArea = async () => {
    if (!mapRef.current) return;

    try {
      console.log("🗺️ Cargando sonidos del área...");
      const map = mapRef.current;
      const bounds = map.getBounds();
      const center = bounds.getCenter();

      const response = await soundsAPI.getSoundsByLocation(
        center.lat,
        center.lng,
        10
      );

      if (response.data.success) {
        console.log(
          `🗺️ Sonidos del área cargados: ${response.data.data.length}`
        );
        setMapSounds(response.data.data);
      }
    } catch (error) {
      console.error("🗺️ Error cargando sonidos del área:", error);
    }
  };

  // Renderizar marcadores con mejores efectos visuales
  const renderMarkers = () => {
    console.log(`🗺️ Renderizando ${mapSounds.length} marcadores`);

    return mapSounds.map((sound, index) => {
      try {
        if (!sound._id || !sound.ubicacion || !sound.ubicacion.coordinates) {
          console.warn(`🗺️ Sonido ${index} sin datos válidos:`, sound);
          return null;
        }

        const coordinates = sound.ubicacion.coordinates;
        const position = [coordinates[1], coordinates[0]]; // [lat, lng]

        const primaryEmotion = sound.emociones?.[0] || "neutral";
        const isFeatured = featuredSounds.some((f) => f._id === sound._id);

        const icon = isFeatured
          ? createFeaturedSoundIcon(primaryEmotion, sound.nombre)
          : createSoundIcon(primaryEmotion, sound.nombre);

        return (
          <Marker
            key={sound._id}
            position={position}
            icon={icon}
            eventHandlers={{
              click: () => handleMarkerClick(sound),
              mouseover: () => setHoveredSound(sound._id),
              mouseout: () => setHoveredSound(null),
            }}
          >
            {/* Tooltip que aparece al hover */}
            <Tooltip
              permanent={false}
              direction="top"
              offset={[0, -40]}
              className="sound-marker-tooltip-popup"
            >
              <div className="tooltip-popup-content">
                <div className="tooltip-popup-header">
                  <span className="tooltip-popup-emoji">
                    {primaryEmotion === "relajante"
                      ? "🌿"
                      : primaryEmotion === "energético"
                      ? "⚡"
                      : primaryEmotion === "nostálgico"
                      ? "🌅"
                      : primaryEmotion === "misterioso"
                      ? "🌙"
                      : primaryEmotion === "alegre"
                      ? "😊"
                      : "🎵"}
                  </span>
                  <span className="tooltip-popup-title">{sound.nombre}</span>
                </div>
                <div className="tooltip-popup-meta">
                  <span className="tooltip-popup-author">👤 {sound.autor}</span>
                  <span className="tooltip-popup-emotion">
                    💭 {primaryEmotion}
                  </span>
                </div>
                <div className="tooltip-popup-action">
                  <span>🎧 Click para escuchar</span>
                </div>
              </div>
            </Tooltip>

            {/* Popup detallado */}
            <Popup
              closeOnClick={false}
              autoClose={false}
              className="modern-sound-popup"
              maxWidth={400}
            >
              <div className="sound-popup-modern">
                <div className="popup-modern-header">
                  <div className="popup-header-content">
                    <h3 className="popup-title">
                      {sound.nombre || "Sin título"}
                    </h3>
                    <span className="popup-close-hint">✕</span>
                  </div>
                  <div className="popup-author-line">
                    <span className="author-icon">👤</span>
                    <span className="author-name">
                      {sound.autor || "Desconocido"}
                    </span>
                  </div>
                </div>

                <div className="popup-modern-content">
                  {sound.emociones && sound.emociones.length > 0 && (
                    <div className="popup-emotions">
                      <div className="emotions-label">
                        <span className="emotions-icon">💭</span>
                        <span>Emociones</span>
                      </div>
                      <div className="popup-emotion-tags">
                        {sound.emociones.slice(0, 3).map((emotion, index) => (
                          <span
                            key={index}
                            className="popup-emotion-tag"
                            style={{
                              backgroundColor:
                                EMOTION_COLORS[emotion] || "#667eea",
                            }}
                          >
                            {emotion}
                          </span>
                        ))}
                        {sound.emociones.length > 3 && (
                          <span className="emotion-count-badge">
                            +{sound.emociones.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {sound.descripcion && (
                    <div className="popup-description">
                      <div className="description-label">
                        <span className="description-icon">📝</span>
                        <span>Descripción</span>
                      </div>
                      <p className="description-text">{sound.descripcion}</p>
                    </div>
                  )}

                  {sound.audio_url && (
                    <div className="popup-audio-section">
                      <div className="audio-label">
                        <span className="audio-icon">🎧</span>
                        <span>Reproductor</span>
                      </div>
                      <div className="popup-audio-player">
                        <SimpleAudioPlayer
                          audioUrl={`${APP_CONFIG.UPLOADS_URL}${sound.audio_url}`}
                          title={sound.nombre}
                          compact={true}
                        />
                      </div>
                    </div>
                  )}

                  <div className="popup-actions">
                    <button
                      onClick={() => handleMarkerClick(sound)}
                      className="popup-detail-btn"
                    >
                      <span className="btn-icon">👁️</span>
                      Ver detalles
                    </button>
                    {sound.etiquetas && sound.etiquetas.length > 0 && (
                      <div className="popup-tags">
                        <span className="tags-icon">🏷️</span>
                        <span className="tags-text">
                          {sound.etiquetas.slice(0, 2).join(", ")}
                          {sound.etiquetas.length > 2 && "..."}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      } catch (error) {
        console.error(`🗺️ Error renderizando marcador ${index}:`, error);
        return null;
      }
    });
  };

  return (
    <div className="sound-map-container-modern" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
        key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
        className="modern-map"
      >
        <TileLayer
          url={MAP_CONFIG.tileLayer}
          attribution={MAP_CONFIG.attribution}
        />

        {/* Event handler para selección de ubicación */}
        {showLocationSelector && (
          <MapEventHandler
            onLocationSelect={onLocationSelect}
            showLocationSelector={showLocationSelector}
          />
        )}

        {/* Marcadores de sonidos */}
        {renderMarkers()}
      </MapContainer>

      {/* Controles del mapa modernos */}
      <div className="map-controls-modern">
        <button
          onClick={handleLoadSoundsInArea}
          className="map-control-btn load-area-btn"
          title="Cargar sonidos en esta área"
        >
          <span className="btn-icon">🔄</span>
          <span className="btn-text">Cargar área</span>
        </button>

        <div className="map-info-modern">
          <div className="info-item">
            <span className="info-icon">🎵</span>
            <span className="info-text">{mapSounds.length} sonidos</span>
          </div>
          {hoveredSound && (
            <div className="info-item hovered">
              <span className="info-icon">👁️</span>
              <span className="info-text">Explorando...</span>
            </div>
          )}
        </div>
      </div>

      {/* Leyenda de emociones */}
      {mapSounds.length > 0 && (
        <div className="emotion-legend">
          <div className="legend-header">
            <span className="legend-icon">💭</span>
            <span className="legend-title">Emociones</span>
          </div>
          <div className="legend-items">
            {Array.from(new Set(mapSounds.flatMap((s) => s.emociones || [])))
              .slice(0, 4)
              .map((emotion) => (
                <div key={emotion} className="legend-item">
                  <div
                    className="legend-color"
                    style={{
                      backgroundColor: EMOTION_COLORS[emotion] || "#667eea",
                    }}
                  ></div>
                  <span className="legend-label">{emotion}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Indicador de carga */}
      {mapSounds.length === 0 && (
        <div className="map-loading-indicator">
          <div className="loading-content">
            <div className="loading-spinner-map"></div>
            <span className="loading-text">Cargando paisajes sonoros...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoundMap;
