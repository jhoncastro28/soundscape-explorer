import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { soundsAPI } from "../../services/api";
import { APP_CONFIG, MAP_CONFIG, EMOTION_COLORS } from "../../utils/constants";
import SimpleAudioPlayer from "../Audio/AudioPlayer";
import "./SoundMap.css";

// Configurar iconos de Leaflet - CORREGIDO
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
        <div>
          <strong>Nueva ubicación seleccionada</strong>
          <br />
          Lat: {marker[0].toFixed(6)}
          <br />
          Lng: {marker[1].toFixed(6)}
        </div>
      </Popup>
    </Marker>
  ) : null;
}

// Crear icono simple pero visible
const createSoundIcon = (emotion) => {
  const color = EMOTION_COLORS[emotion] || "#4f46e5";

  return L.divIcon({
    className: "custom-sound-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: white;
        font-weight: bold;
        position: relative;
      ">
        🎵
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
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
}) => {
  const [selectedSound, setSelectedSound] = useState(null);
  const [mapSounds, setMapSounds] = useState([]);
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);
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
      // Calcular centro basado en los sonidos
      const lats = validSounds.map((s) => s.ubicacion.coordinates[1]);
      const lngs = validSounds.map((s) => s.ubicacion.coordinates[0]);

      const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

      console.log(`🗺️ Centro calculado: [${centerLat}, ${centerLng}]`);

      setMapCenter([centerLat, centerLng]);

      // Si hay varios sonidos, ajustar zoom para mostrar todos
      if (validSounds.length > 1) {
        const latRange = Math.max(...lats) - Math.min(...lats);
        const lngRange = Math.max(...lngs) - Math.min(...lngs);
        const maxRange = Math.max(latRange, lngRange);

        // Calcular zoom apropiado
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
        10 // 10km radius
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

  // Renderizar marcadores con mejor logging
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

        console.log(
          `🗺️ Marcador ${index}: ${sound.nombre} en [${position[0]}, ${position[1]}]`
        );

        const primaryEmotion = sound.emociones?.[0] || "neutral";
        const icon = createSoundIcon(primaryEmotion);

        return (
          <Marker
            key={sound._id}
            position={position}
            icon={icon}
            eventHandlers={{
              click: () => handleMarkerClick(sound),
            }}
          >
            <Popup closeOnClick={false} autoClose={false}>
              <div className="sound-popup">
                <h3>{sound.nombre || "Sin título"}</h3>
                <p>
                  <strong>Autor:</strong> {sound.autor || "Desconocido"}
                </p>

                {sound.emociones && sound.emociones.length > 0 && (
                  <div className="emotions">
                    <strong>Emociones:</strong>
                    <div className="emotion-tags">
                      {sound.emociones.map((emotion, index) => (
                        <span
                          key={index}
                          className="emotion-tag"
                          style={{
                            backgroundColor: EMOTION_COLORS[emotion] || "#666",
                          }}
                        >
                          {emotion}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {sound.descripcion && (
                  <p>
                    <strong>Descripción:</strong> {sound.descripcion}
                  </p>
                )}

                {sound.audio_url && (
                  <div className="audio-player-container">
                    <SimpleAudioPlayer
                      audioUrl={`${APP_CONFIG.UPLOADS_URL}${sound.audio_url}`}
                      title={sound.nombre}
                      compact={true}
                    />
                  </div>
                )}

                <div className="sound-actions">
                  <button
                    onClick={() => handleMarkerClick(sound)}
                    className="btn-primary"
                    style={{
                      background: "#4f46e5",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Ver detalles
                  </button>
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
    <div className="sound-map-container" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
        key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`} // Forzar re-render cuando cambie centro/zoom
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

      {/* Controles del mapa */}
      <div className="map-controls">
        <button
          onClick={handleLoadSoundsInArea}
          className="btn-secondary"
          title="Cargar sonidos en esta área"
          style={{
            background: "white",
            border: "1px solid #ccc",
            padding: "4px 8px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🔄 Cargar área
        </button>

        <div
          className="map-info"
          style={{
            background: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "12px",
          }}
        >
          Sonidos: {mapSounds.length}
        </div>
      </div>

      {/* Debug info */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          background: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "10px",
          zIndex: 1000,
        }}
      >
        Centro: [{mapCenter[0].toFixed(3)}, {mapCenter[1].toFixed(3)}] | Zoom:{" "}
        {mapZoom} | Sonidos: {mapSounds.length}
      </div>
    </div>
  );
};

export default SoundMap;
