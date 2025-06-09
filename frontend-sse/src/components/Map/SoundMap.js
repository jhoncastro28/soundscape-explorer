import React, { useState, useEffect, useRef, useCallback } from "react";
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

  useMapEvents({
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

// Crear icono mejorado y más llamativo
const createSoundIcon = (emotion, soundName) => {
  const color = EMOTION_COLORS[emotion] || "#4f46e5";

  // Crear un color más claro para el gradiente
  const lightColor = adjustColorBrightness(color, 40);

  // Asegurar que tenemos valores válidos
  const safeSoundName = (soundName || "Sonido").replace(/"/g, "&quot;");
  const safeEmotion = (emotion || "neutral").replace(/"/g, "&quot;");

  console.log(
    `🎨 Creando ícono para: "${safeSoundName}" con emoción "${safeEmotion}"`
  );

  return L.divIcon({
    className: "custom-sound-marker",
    html: `
      <div class="sound-marker-container">
        <div class="sound-marker-pulse"></div>
        <div class="sound-marker-icon" 
             style="
               background: linear-gradient(135deg, ${color} 0%, ${lightColor} 100%);
               width: 32px;
               height: 32px;
               border-radius: 50%;
               border: 3px solid white;
               box-shadow: 
                 0 4px 12px rgba(0,0,0,0.3),
                 0 0 0 4px rgba(255,255,255,0.8),
                 0 0 20px ${color}40;
               display: flex;
               align-items: center;
               justify-content: center;
               font-size: 16px;
               color: white;
               font-weight: bold;
               position: relative;
               cursor: pointer;
               transition: all 0.3s ease;
               animation: soundPulse 2s ease-in-out infinite;
             " 
             data-sound-name="${safeSoundName}" 
             data-emotion="${safeEmotion}"
             title="Hover para ver información rápida">
          🎵
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

// Función helper para ajustar brillo de color
const adjustColorBrightness = (hex, percent) => {
  // Convertir hex a RGB
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  // Ajustar brillo
  r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
  g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
  b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));

  // Convertir de vuelta a hex
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
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
  const [mapSounds, setMapSounds] = useState([]);
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);
  const mapRef = useRef();

  const showQuickTooltip = useCallback((element) => {
    // Verificar que el elemento existe y tiene los datos necesarios
    if (!element || !element.getAttribute) {
      console.warn("🚨 Elemento inválido para tooltip");
      return;
    }

    const soundName = element.getAttribute("data-sound-name");
    const emotion = element.getAttribute("data-emotion");

    console.log(`📋 Mostrando tooltip: ${soundName} (${emotion})`);

    // Remover tooltip existente ANTES de crear uno nuevo
    hideQuickTooltip();

    // Verificar que tenemos datos para mostrar
    if (!soundName) {
      console.warn("🚨 No hay nombre de sonido para el tooltip");
      return;
    }

    // Crear nuevo tooltip
    const tooltip = document.createElement("div");
    tooltip.className = "quick-sound-tooltip";
    tooltip.setAttribute("data-tooltip-active", "true");
    tooltip.innerHTML = `
      <div class="tooltip-content">
        <strong>${soundName}</strong>
        ${emotion ? `<br><span class="emotion-label">${emotion}</span>` : ""}
      </div>
    `;

    // Agregar al DOM primero
    document.body.appendChild(tooltip);

    // Esperar un frame para asegurar que el elemento esté renderizado
    requestAnimationFrame(() => {
      try {
        // Obtener posición del elemento
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        // Calcular posición centrada
        const left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        const top = rect.top - tooltipRect.height - 12; // Un poco más de separación

        // Asegurar que no se salga de la pantalla
        const finalLeft = Math.max(
          10,
          Math.min(left, window.innerWidth - tooltipRect.width - 10)
        );
        const finalTop = Math.max(10, top);

        tooltip.style.left = finalLeft + "px";
        tooltip.style.top = finalTop + "px";

        console.log(`✅ Tooltip posicionado en [${finalLeft}, ${finalTop}]`);
      } catch (error) {
        console.error("🚨 Error posicionando tooltip:", error);
        // Si hay error, remover el tooltip
        tooltip.remove();
      }
    });
  }, []);

  const hideQuickTooltip = useCallback(() => {
    const existingTooltips = document.querySelectorAll(
      '.quick-sound-tooltip[data-tooltip-active="true"]'
    );

    if (existingTooltips.length > 0) {
      console.log(`🗑️ Removiendo ${existingTooltips.length} tooltips`);
      existingTooltips.forEach((tooltip) => {
        // Animación de salida
        tooltip.classList.add("hiding");
        setTimeout(() => {
          if (tooltip.parentNode) {
            tooltip.remove();
          }
        }, 150); // Duración de la animación de salida
      });
    }
  }, []);

  // Función para limpiar tooltips cuando se haga click en el mapa
  const handleMapClick = useCallback(
    (e) => {
      // Solo ocultar si no se hizo click en un marcador
      if (!e.target.closest(".sound-marker-icon")) {
        console.log("🗺️ Click en mapa - ocultando tooltips");
        hideQuickTooltip();
      }
    },
    [hideQuickTooltip]
  );

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

  // Inicializar tooltips después de que el mapa se monte
  useEffect(() => {
    const initializeTooltips = () => {
      // Limpiar event listeners existentes para evitar duplicados
      const existingMarkers = document.querySelectorAll(".sound-marker-icon");
      existingMarkers.forEach((marker) => {
        // Remover listeners existentes si los hay
        if (marker._tooltipHandlers) {
          marker.removeEventListener(
            "mouseenter",
            marker._tooltipHandlers.mouseenter
          );
          marker.removeEventListener(
            "mouseleave",
            marker._tooltipHandlers.mouseleave
          );
          marker.removeEventListener("click", marker._tooltipHandlers.click);
          delete marker._tooltipHandlers;
        }
      });

      // Agregar event listeners a los nuevos marcadores
      const markers = document.querySelectorAll(".sound-marker-icon");
      console.log(
        `🎯 Inicializando tooltips para ${markers.length} marcadores`
      );

      markers.forEach((marker, index) => {
        // Función específica para mouseenter
        const handleMouseEnter = (e) => {
          console.log(`🐭 Hover en marcador ${index + 1}`);
          showQuickTooltip(e.target);
        };

        // Función específica para mouseleave
        const handleMouseLeave = () => {
          console.log(`🐭 Salió del marcador ${index + 1}`);
          hideQuickTooltip();
        };

        // Función específica para click
        const handleClick = () => {
          console.log(`🖱️ Click en marcador ${index + 1}`);
          hideQuickTooltip();
        };

        // Agregar listeners
        marker.addEventListener("mouseenter", handleMouseEnter, {
          passive: true,
        });
        marker.addEventListener("mouseleave", handleMouseLeave, {
          passive: true,
        });
        marker.addEventListener("click", handleClick, { passive: true });

        // Guardar referencias para poder limpiarlas después
        marker._tooltipHandlers = {
          mouseenter: handleMouseEnter,
          mouseleave: handleMouseLeave,
          click: handleClick,
        };
      });

      // Event listener para click en el mapa
      const mapContainer = document.querySelector(".sound-map-container");
      if (mapContainer && !mapContainer._hasTooltipHandler) {
        mapContainer.addEventListener("click", handleMapClick, {
          passive: true,
        });
        mapContainer._hasTooltipHandler = true;
      }
    };

    // Delay más corto y reintentos para asegurar que los marcadores estén listos
    const timer = setTimeout(() => {
      initializeTooltips();

      // Segundo intento por si acaso
      setTimeout(initializeTooltips, 200);
    }, 50);

    return () => {
      clearTimeout(timer);
      // Limpiar todos los event listeners
      const markers = document.querySelectorAll(".sound-marker-icon");
      markers.forEach((marker) => {
        if (marker._tooltipHandlers) {
          marker.removeEventListener(
            "mouseenter",
            marker._tooltipHandlers.mouseenter
          );
          marker.removeEventListener(
            "mouseleave",
            marker._tooltipHandlers.mouseleave
          );
          marker.removeEventListener("click", marker._tooltipHandlers.click);
          delete marker._tooltipHandlers;
        }
      });
    };
  }, [mapSounds, showQuickTooltip, hideQuickTooltip, handleMapClick]);

  // useEffect adicional para re-inicializar tooltips después de cambios en el DOM
  useEffect(() => {
    const reinitializeTooltips = () => {
      // Verificar si hay marcadores sin event listeners
      const markers = document.querySelectorAll(".sound-marker-icon");
      let markersWithoutListeners = 0;

      markers.forEach((marker) => {
        if (!marker._tooltipHandlers) {
          markersWithoutListeners++;
        }
      });

      if (markersWithoutListeners > 0) {
        console.log(
          `🔄 Re-inicializando tooltips para ${markersWithoutListeners} marcadores`
        );

        markers.forEach((marker, index) => {
          if (!marker._tooltipHandlers) {
            const handleMouseEnter = (e) => {
              console.log(`🐭 Hover en marcador ${index + 1} (reinicializado)`);
              showQuickTooltip(e.target);
            };

            const handleMouseLeave = () => {
              console.log(
                `🐭 Salió del marcador ${index + 1} (reinicializado)`
              );
              hideQuickTooltip();
            };

            const handleClick = () => {
              console.log(`🖱️ Click en marcador ${index + 1} (reinicializado)`);
              hideQuickTooltip();
            };

            marker.addEventListener("mouseenter", handleMouseEnter, {
              passive: true,
            });
            marker.addEventListener("mouseleave", handleMouseLeave, {
              passive: true,
            });
            marker.addEventListener("click", handleClick, { passive: true });

            marker._tooltipHandlers = {
              mouseenter: handleMouseEnter,
              mouseleave: handleMouseLeave,
              click: handleClick,
            };
          }
        });
      }
    };

    // Observador para detectar cambios en el DOM del mapa
    const mapContainer = document.querySelector(".leaflet-map-pane");
    if (mapContainer) {
      const observer = new MutationObserver(() => {
        // Delay para permitir que Leaflet termine de renderizar
        setTimeout(reinitializeTooltips, 100);
      });

      observer.observe(mapContainer, {
        childList: true,
        subtree: true,
      });

      return () => observer.disconnect();
    }
  }, [mapSounds, showQuickTooltip, hideQuickTooltip]);

  // Función global para forzar reinicialización (debugging)
  const forceReinitializeTooltips = useCallback(() => {
    console.log("🔧 Forzando reinicialización de tooltips...");
    const markers = document.querySelectorAll(".sound-marker-icon");
    console.log(`🎯 Encontrados ${markers.length} marcadores`);

    markers.forEach((marker, index) => {
      const soundName = marker.getAttribute("data-sound-name");
      const emotion = marker.getAttribute("data-emotion");
      console.log(`📋 Marcador ${index + 1}: ${soundName} (${emotion})`);

      // Remover listeners existentes
      if (marker._tooltipHandlers) {
        marker.removeEventListener(
          "mouseenter",
          marker._tooltipHandlers.mouseenter
        );
        marker.removeEventListener(
          "mouseleave",
          marker._tooltipHandlers.mouseleave
        );
        marker.removeEventListener("click", marker._tooltipHandlers.click);
      }

      // Agregar nuevos listeners
      const handleMouseEnter = (e) => showQuickTooltip(e.target);
      const handleMouseLeave = () => hideQuickTooltip();
      const handleClick = () => hideQuickTooltip();

      marker.addEventListener("mouseenter", handleMouseEnter, {
        passive: true,
      });
      marker.addEventListener("mouseleave", handleMouseLeave, {
        passive: true,
      });
      marker.addEventListener("click", handleClick, { passive: true });

      marker._tooltipHandlers = {
        mouseenter: handleMouseEnter,
        mouseleave: handleMouseLeave,
        click: handleClick,
      };
    });
  }, [showQuickTooltip, hideQuickTooltip]);

  // Hacer la función disponible globalmente para debugging
  useEffect(() => {
    window.reinitializeTooltips = forceReinitializeTooltips;
    return () => {
      delete window.reinitializeTooltips;
    };
  }, [forceReinitializeTooltips]);

  const handleMarkerClick = (sound) => {
    console.log("🗺️ Marcador clickeado:", sound.nombre);
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
        const icon = createSoundIcon(primaryEmotion, sound.nombre);

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

      {/* Debug info mejorado */}
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
        onClick={() => {
          console.log("🔍 Estado actual del mapa:");
          console.log("   - mapSounds:", mapSounds.length);
          console.log(
            "   - Marcadores DOM:",
            document.querySelectorAll(".sound-marker-icon").length
          );
          console.log(
            "   - Tooltips activos:",
            document.querySelectorAll(".quick-sound-tooltip").length
          );

          // Verificar marcadores
          const markers = document.querySelectorAll(".sound-marker-icon");
          markers.forEach((marker, i) => {
            const name = marker.getAttribute("data-sound-name");
            const emotion = marker.getAttribute("data-emotion");
            const hasListeners = !!marker._tooltipHandlers;
            console.log(
              `   - Marcador ${
                i + 1
              }: ${name} (${emotion}) - Listeners: ${hasListeners}`
            );
          });

          if (window.reinitializeTooltips) {
            console.log("🔧 Ejecutando reinicialización manual...");
            window.reinitializeTooltips();
          }
        }}
        title="Click para debug info"
      >
        Centro: [{mapCenter[0].toFixed(3)}, {mapCenter[1].toFixed(3)}] | Zoom:{" "}
        {mapZoom} | Sonidos: {mapSounds.length} | 🔍 Debug
      </div>
    </div>
  );
};

export default SoundMap;
