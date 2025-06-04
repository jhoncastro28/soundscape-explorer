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
import AudioPlayer from "../Audio/AudioPlayer";
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

  useMapEvents({
    click(e) {
      if (showLocationSelector) {
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

// Crear icono personalizado basado en emoción
const createEmotionIcon = (emotion) => {
  const color = EMOTION_COLORS[emotion] || "#666";

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: white;
        font-weight: bold;
      ">
        🎵
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
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
  const [mapSounds, setMapSounds] = useState(sounds);
  const mapRef = useRef();

  useEffect(() => {
    setMapSounds(sounds);
  }, [sounds]);

  const handleMarkerClick = (sound) => {
    setSelectedSound(sound);
    if (onSoundSelect) {
      onSoundSelect(sound);
    }
  };

  const handleLoadSoundsInArea = async () => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const bounds = map.getBounds();
    const center = bounds.getCenter();

    try {
      const response = await soundsAPI.getSoundsByLocation(
        center.lat,
        center.lng,
        10 // 10km radius
      );

      if (response.data.success) {
        setMapSounds(response.data.data);
      }
    } catch (error) {
      console.error("Error cargando sonidos del área:", error);
    }
  };

  return (
    <div className="sound-map-container" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          url={MAP_CONFIG.tileLayer}
          attribution={MAP_CONFIG.attribution}
        />

        {/* Event handler para selección de ubicación */}
        <MapEventHandler
          onLocationSelect={onLocationSelect}
          showLocationSelector={showLocationSelector}
        />

        {/* Marcadores de sonidos */}
        {mapSounds.map((sound) => {
          const position = [
            sound.ubicacion.coordinates[1], // lat
            sound.ubicacion.coordinates[0], // lng
          ];

          const primaryEmotion = sound.emociones?.[0] || "neutral";
          const icon = createEmotionIcon(primaryEmotion);

          return (
            <Marker
              key={sound._id}
              position={position}
              icon={icon}
              eventHandlers={{
                click: () => handleMarkerClick(sound),
              }}
            >
              <Popup>
                <div className="sound-popup">
                  <h3>{sound.nombre}</h3>
                  <p>
                    <strong>Autor:</strong> {sound.autor}
                  </p>

                  {sound.emociones && sound.emociones.length > 0 && (
                    <div className="emotions">
                      <strong>Emociones:</strong>
                      <div className="emotion-tags">
                        {sound.emociones.map((emotion, index) => (
                          <span
                            key={index}
                            className="emotion-tag"
                            style={{ backgroundColor: EMOTION_COLORS[emotion] }}
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

                  {sound.etiquetas && sound.etiquetas.length > 0 && (
                    <div className="tags">
                      <strong>Etiquetas:</strong> {sound.etiquetas.join(", ")}
                    </div>
                  )}

                  {sound.audio_url && (
                    <div className="audio-player-container">
                      <AudioPlayer
                        audioUrl={`${APP_CONFIG.UPLOADS_URL}${sound.audio_url}`}
                      />
                    </div>
                  )}

                  <div className="sound-actions">
                    <button
                      onClick={() => handleMarkerClick(sound)}
                      className="btn-primary"
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Controles del mapa */}
      <div className="map-controls">
        <button
          onClick={handleLoadSoundsInArea}
          className="btn-secondary"
          title="Cargar sonidos en esta área"
        >
          🔄 Cargar sonidos del área
        </button>

        <div className="map-info">Sonidos mostrados: {mapSounds.length}</div>
      </div>
    </div>
  );
};

export default SoundMap;
