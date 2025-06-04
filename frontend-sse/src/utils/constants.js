// Configuración de la aplicación
export const APP_CONFIG = {
  API_BASE_URL:
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api",
  UPLOADS_URL: process.env.REACT_APP_UPLOADS_URL || "http://localhost:5000",
  DEFAULT_LAT: parseFloat(process.env.REACT_APP_DEFAULT_LAT) || 4.711,
  DEFAULT_LNG: parseFloat(process.env.REACT_APP_DEFAULT_LNG) || -74.0721,
  DEFAULT_ZOOM: parseInt(process.env.REACT_APP_DEFAULT_ZOOM) || 10,
};

// Configuración del mapa
export const MAP_CONFIG = {
  tileLayer: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  defaultZoom: 10,
  minZoom: 3,
  maxZoom: 18,
};

// Configuración de audio
export const AUDIO_CONFIG = {
  allowedFormats: ["mp3", "wav", "ogg", "m4a"],
  maxFileSize: 50 * 1024 * 1024, // 50MB
  defaultVolume: 0.7,
  waveColor: "#4f46e5",
  progressColor: "#7c3aed",
  cursorColor: "#f59e0b",
};

// Emociones disponibles
export const EMOTIONS = [
  "relajante",
  "energético",
  "nostálgico",
  "misterioso",
  "alegre",
  "melancólico",
  "caótico",
  "peaceful",
  "inspirador",
  "romántico",
  "aventurero",
  "meditativo",
  "concentración",
  "estrés",
  "ansiedad",
  "felicidad",
  "tristeza",
  "motivador",
];

// Tipos de sonidos
export const SOUND_TYPES = [
  "naturaleza",
  "ciudad",
  "océano",
  "bosque",
  "lluvia",
  "viento",
  "pájaros",
  "agua",
  "tráfico",
  "multitud",
  "música",
  "industrial",
  "animales",
  "insectos",
  "silencio",
  "conversación",
];

// Etiquetas predefinidas
export const PREDEFINED_TAGS = [
  "biodiversidad",
  "contaminación acústica",
  "turismo",
  "relajación",
  "meditación",
  "estudio",
  "trabajo",
  "ejercicio",
  "dormir",
  "concentración",
  "creatividad",
  "bienestar",
  "naturaleza",
  "cultura",
  "patrimonio",
  "educación",
  "terapia",
  "mindfulness",
  "ecoturismo",
  "sostenibilidad",
];

// Colores para emociones (para visualizaciones)
export const EMOTION_COLORS = {
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
  concentración: "#3b82f6",
  estrés: "#dc2626",
  ansiedad: "#9333ea",
  felicidad: "#eab308",
  tristeza: "#64748b",
  motivador: "#059669",
};

// Calidades de audio
export const AUDIO_QUALITIES = [
  { value: "baja", label: "Baja (AM Radio)" },
  { value: "media", label: "Media (MP3 128kbps)" },
  { value: "alta", label: "Alta (MP3 320kbps)" },
  { value: "profesional", label: "Profesional (WAV/FLAC)" },
];

// Mensajes del sistema
export const MESSAGES = {
  success: {
    soundUploaded:
      "¡Sonido subido exitosamente! Tu contribución al mapa sonoro mundial ha sido registrada.",
    soundUpdated: "Sonido actualizado correctamente.",
    soundDeleted: "Sonido eliminado exitosamente.",
    tagAdded: "Etiqueta añadida al sonido.",
  },
  errors: {
    networkError:
      "Error de conexión. Por favor, verifica tu conexión a internet.",
    serverError: "Error del servidor. Por favor, intenta más tarde.",
    fileTooBig: `El archivo es demasiado grande. Máximo ${
      AUDIO_CONFIG.maxFileSize / (1024 * 1024)
    }MB.`,
    invalidFormat: `Formato no válido. Usa: ${AUDIO_CONFIG.allowedFormats.join(
      ", "
    )}`,
    locationRequired: "Por favor, selecciona una ubicación en el mapa.",
    genericError: "Ha ocurrido un error inesperado.",
    soundNotFound: "Sonido no encontrado.",
    uploadFailed: "Error al subir el archivo. Intenta nuevamente.",
  },
  loading: {
    uploadingSound: "Subiendo sonido...",
    loadingSounds: "Cargando paisajes sonoros...",
    loadingMap: "Cargando mapa...",
    processingAudio: "Procesando audio...",
  },
};

// Configuración de paginación
export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
  pageSizeOptions: [10, 20, 50, 100],
};

// Configuración de validación
export const VALIDATION = {
  nameMinLength: 3,
  nameMaxLength: 100,
  descriptionMaxLength: 500,
  authorMinLength: 2,
  authorMaxLength: 50,
  maxEmotions: 5,
  maxTags: 10,
  maxSoundTypes: 8,
};

// URLs y enlaces externos
export const EXTERNAL_LINKS = {
  openStreetMap: "https://www.openstreetmap.org",
  documentation: "https://github.com/tu-usuario/soundscape-explorer",
  support: "mailto:support@soundscape-explorer.com",
  privacy: "/privacy",
  terms: "/terms",
};

// Configuración de localStorage keys
export const STORAGE_KEYS = {
  userPreferences: "soundscape_user_prefs",
  lastLocation: "soundscape_last_location",
  audioSettings: "soundscape_audio_settings",
  mapSettings: "soundscape_map_settings",
};

// Configuración de analytics/métricas
export const ANALYTICS_CONFIG = {
  trackingEnabled: process.env.NODE_ENV === "production",
  events: {
    soundPlayed: "sound_played",
    soundUploaded: "sound_uploaded",
    mapInteraction: "map_interaction",
    searchPerformed: "search_performed",
  },
};

const constants = {
  APP_CONFIG,
  MAP_CONFIG,
  AUDIO_CONFIG,
  EMOTIONS,
  SOUND_TYPES,
  PREDEFINED_TAGS,
  EMOTION_COLORS,
  AUDIO_QUALITIES,
  MESSAGES,
  PAGINATION,
  VALIDATION,
  EXTERNAL_LINKS,
  STORAGE_KEYS,
  ANALYTICS_CONFIG,
};

export default constants;
