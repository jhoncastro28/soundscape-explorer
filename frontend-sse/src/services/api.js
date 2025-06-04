import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 segundos
});

// Interceptores para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);

    if (error.code === "ECONNABORTED") {
      throw new Error("Timeout: La solicitud tardó demasiado tiempo");
    }

    if (!error.response) {
      throw new Error("Error de red: No se pudo conectar al servidor");
    }

    const message =
      error.response.data?.error ||
      error.response.data?.message ||
      "Error desconocido";
    throw new Error(message);
  }
);

// Servicios para sonidos
export const soundsAPI = {
  // Obtener todos los sonidos
  getAllSounds: (params = {}) => {
    return api.get("/sounds", { params });
  },

  // Obtener sonido por ID
  getSoundById: (id) => {
    return api.get(`/sounds/${id}`);
  },

  // Obtener sonidos por ubicación
  getSoundsByLocation: (lat, lng, radius = 10) => {
    return api.get("/sounds", {
      params: { lat, lng, radius },
    });
  },

  // Obtener sonidos por emoción
  getSoundsByEmotion: (emotion) => {
    return api.get("/sounds", {
      params: { emotion },
    });
  },

  // Crear nuevo sonido
  createSound: (formData) => {
    return api.post("/sounds", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Actualizar sonido
  updateSound: (id, data) => {
    return api.put(`/sounds/${id}`, data);
  },

  // Eliminar sonido
  deleteSound: (id) => {
    return api.delete(`/sounds/${id}`);
  },

  // Añadir etiqueta a sonido
  addTagToSound: (id, tag) => {
    return api.post(`/sounds/${id}/tags`, { tag });
  },
};

// Servicios para analytics
export const analyticsAPI = {
  // Obtener patrones emocionales
  getEmotionPatterns: () => {
    return api.get("/analytics/emotions");
  },

  // Obtener estadísticas de ubicaciones
  getLocationStats: () => {
    return api.get("/analytics/locations");
  },

  // Obtener estadísticas de etiquetas
  getTagStats: () => {
    return api.get("/analytics/tags");
  },

  // Obtener estadísticas temporales
  getTimelineStats: () => {
    return api.get("/analytics/timeline");
  },

  // Búsqueda avanzada
  searchSounds: (params) => {
    return api.get("/analytics/search", { params });
  },

  // Obtener recomendaciones
  getRecommendations: (soundId) => {
    return api.get(`/analytics/recommendations/${soundId}`);
  },
};

// Health check
export const healthCheck = () => {
  return api.get("/health");
};

// Función helper para construir URLs de archivos
export const getFileUrl = (relativePath) => {
  const uploadsUrl =
    process.env.REACT_APP_UPLOADS_URL || "http://localhost:5000";
  return `${uploadsUrl}${relativePath}`;
};

// Función helper para manejar errores de forma consistente
export const handleAPIError = (
  error,
  defaultMessage = "Error en la operación"
) => {
  console.error("API Error Details:", error);

  if (error.response) {
    // Error de respuesta del servidor
    const message = error.response.data?.error || error.response.data?.message;
    return (
      message || `Error ${error.response.status}: ${error.response.statusText}`
    );
  } else if (error.request) {
    // Error de red
    return "Error de conexión: No se pudo conectar al servidor";
  } else {
    // Error en la configuración de la petición
    return error.message || defaultMessage;
  }
};

export default api;
