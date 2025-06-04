// helpers.js - Funciones utilitarias para SoundScape Explorer

/**
 * Formatear duración en segundos a formato MM:SS
 * @param {number} seconds - Duración en segundos
 * @returns {string} Duración formateada
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

/**
 * Formatear tamaño de archivo en bytes a formato legible
 * @param {number} bytes - Tamaño en bytes
 * @param {number} decimals - Número de decimales
 * @returns {string} Tamaño formateado
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

/**
 * Formatear fecha a formato legible
 * @param {string|Date} date - Fecha a formatear
 * @param {object} options - Opciones de formato
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  const formatOptions = { ...defaultOptions, ...options };

  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("es-ES", formatOptions);
  } catch (error) {
    console.error("Error formateando fecha:", error);
    return "Fecha inválida";
  }
};

/**
 * Formatear fecha relativa (hace X tiempo)
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha relativa
 */
export const formatRelativeDate = (date) => {
  try {
    const now = new Date();
    const dateObj = new Date(date);
    const diffInSeconds = Math.floor((now - dateObj) / 1000);

    if (diffInSeconds < 60) {
      return "Hace unos segundos";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? "s" : ""}`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours !== 1 ? "s" : ""}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `Hace ${diffInDays} día${diffInDays !== 1 ? "s" : ""}`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `Hace ${diffInMonths} mes${diffInMonths !== 1 ? "es" : ""}`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `Hace ${diffInYears} año${diffInYears !== 1 ? "s" : ""}`;
  } catch (error) {
    console.error("Error calculando fecha relativa:", error);
    return "Fecha desconocida";
  }
};

/**
 * Truncar texto con elipsis
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text || "";

  return text.substring(0, maxLength).trim() + "...";
};

/**
 * Capitalizar primera letra de cada palabra
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
export const capitalizeWords = (text) => {
  if (!text) return "";

  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Validar email
 * @param {string} email - Email a validar
 * @returns {boolean} Es válido
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar coordenadas de latitud y longitud
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {boolean} Son válidas
 */
export const isValidCoordinates = (lat, lng) => {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

/**
 * Calcular distancia entre dos puntos geográficos (Haversine formula)
 * @param {number} lat1 - Latitud punto 1
 * @param {number} lng1 - Longitud punto 1
 * @param {number} lat2 - Latitud punto 2
 * @param {number} lng2 - Longitud punto 2
 * @returns {number} Distancia en kilómetros
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Debounce función para optimizar llamadas
 * @param {Function} func - Función a ejecutar
 * @param {number} delay - Retraso en ms
 * @returns {Function} Función debounced
 */
export const debounce = (func, delay) => {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

/**
 * Throttle función para limitar llamadas
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Límite en ms
 * @returns {Function} Función throttled
 */
export const throttle = (func, limit) => {
  let inThrottle;

  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Generar ID único
 * @returns {string} ID único
 */
export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Descargar archivo
 * @param {string} url - URL del archivo
 * @param {string} filename - Nombre del archivo
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Copiar texto al portapapeles
 * @param {string} text - Texto a copiar
 * @returns {Promise<boolean>} Éxito de la operación
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback para navegadores más antiguos
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const result = document.execCommand("copy");
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error("Error copiando al portapapeles:", error);
    return false;
  }
};

/**
 * Obtener ubicación del usuario
 * @param {object} options - Opciones de geolocalización
 * @returns {Promise<{lat: number, lng: number}>} Coordenadas
 */
export const getUserLocation = (options = {}) => {
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000, // 5 minutos
  };

  const geoOptions = { ...defaultOptions, ...options };

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalización no soportada"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      geoOptions
    );
  });
};

/**
 * Validar archivo de audio
 * @param {File} file - Archivo a validar
 * @param {object} constraints - Restricciones
 * @returns {object} Resultado de validación
 */
export const validateAudioFile = (file, constraints = {}) => {
  const {
    maxSize = 50 * 1024 * 1024, // 50MB por defecto
    allowedFormats = ["mp3", "wav", "ogg", "m4a"],
  } = constraints;

  const errors = [];

  if (!file) {
    errors.push("No se ha seleccionado ningún archivo");
    return { isValid: false, errors };
  }

  // Validar tamaño
  if (file.size > maxSize) {
    errors.push(
      `El archivo es demasiado grande. Máximo: ${formatFileSize(maxSize)}`
    );
  }

  // Validar formato
  const extension = file.name.split(".").pop().toLowerCase();
  if (!allowedFormats.includes(extension)) {
    errors.push(
      `Formato no permitido. Formatos válidos: ${allowedFormats.join(", ")}`
    );
  }

  // Validar tipo MIME
  const mimeTypes = {
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    m4a: "audio/mp4",
  };

  const expectedMimeType = mimeTypes[extension];
  if (expectedMimeType && !file.type.includes(expectedMimeType.split("/")[1])) {
    errors.push("El tipo de archivo no coincide con la extensión");
  }

  return {
    isValid: errors.length === 0,
    errors,
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
      extension,
    },
  };
};

/**
 * Formatear número con separadores de miles
 * @param {number} number - Número a formatear
 * @param {string} locale - Locale para el formato
 * @returns {string} Número formateado
 */
export const formatNumber = (number, locale = "es-ES") => {
  if (typeof number !== "number") return "0";

  return new Intl.NumberFormat(locale).format(number);
};

/**
 * Obtener color basado en emoción
 * @param {string} emotion - Emoción
 * @returns {string} Color hexadecimal
 */
export const getEmotionColor = (emotion) => {
  const emotionColors = {
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

  return emotionColors[emotion] || "#6b7280";
};

/**
 * Limpiar y normalizar texto para búsqueda
 * @param {string} text - Texto a normalizar
 * @returns {string} Texto normalizado
 */
export const normalizeSearchText = (text) => {
  if (!text) return "";

  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
    .replace(/[^\w\s]/g, "") // Quitar caracteres especiales
    .trim();
};

/**
 * Filtrar array por texto de búsqueda
 * @param {Array} items - Items a filtrar
 * @param {string} searchText - Texto de búsqueda
 * @param {Array} searchFields - Campos donde buscar
 * @returns {Array} Items filtrados
 */
export const filterBySearch = (
  items,
  searchText,
  searchFields = ["nombre", "descripcion", "autor"]
) => {
  if (!searchText) return items;

  const normalizedSearch = normalizeSearchText(searchText);

  return items.filter((item) => {
    return searchFields.some((field) => {
      const fieldValue = item[field];
      if (!fieldValue) return false;

      const normalizedValue = normalizeSearchText(fieldValue.toString());
      return normalizedValue.includes(normalizedSearch);
    });
  });
};

/**
 * Ordenar array por múltiples criterios
 * @param {Array} items - Items a ordenar
 * @param {Array} sortCriteria - Criterios de ordenamiento
 * @returns {Array} Items ordenados
 */
export const multiSort = (items, sortCriteria) => {
  return [...items].sort((a, b) => {
    for (const criterion of sortCriteria) {
      const { field, direction = "asc" } = criterion;

      let aValue = a[field];
      let bValue = b[field];

      // Manejar diferentes tipos de datos
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === "asc" ? 1 : -1;
      }
    }
    return 0;
  });
};

/**
 * Agrupar array por campo
 * @param {Array} items - Items a agrupar
 * @param {string} field - Campo por el que agrupar
 * @returns {Object} Items agrupados
 */
export const groupBy = (items, field) => {
  return items.reduce((groups, item) => {
    const key = item[field];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
};

/**
 * Contar ocurrencias en array
 * @param {Array} items - Items a contar
 * @param {string} field - Campo a contar
 * @returns {Object} Conteo de ocurrencias
 */
export const countOccurrences = (items, field) => {
  return items.reduce((counts, item) => {
    const value = item[field];
    if (Array.isArray(value)) {
      // Si el campo es un array, contar cada elemento
      value.forEach((v) => {
        counts[v] = (counts[v] || 0) + 1;
      });
    } else {
      counts[value] = (counts[value] || 0) + 1;
    }
    return counts;
  }, {});
};

/**
 * Obtener coordenadas del centro de un grupo de puntos
 * @param {Array} points - Array de coordenadas [{lat, lng}]
 * @returns {Object} Coordenadas del centro
 */
export const getCenterCoordinates = (points) => {
  if (!points || points.length === 0) {
    return { lat: 0, lng: 0 };
  }

  if (points.length === 1) {
    return points[0];
  }

  const sum = points.reduce(
    (acc, point) => ({
      lat: acc.lat + point.lat,
      lng: acc.lng + point.lng,
    }),
    { lat: 0, lng: 0 }
  );

  return {
    lat: sum.lat / points.length,
    lng: sum.lng / points.length,
  };
};

/**
 * Generar URL para compartir
 * @param {Object} params - Parámetros para la URL
 * @returns {string} URL completa
 */
export const generateShareUrl = (params = {}) => {
  const baseUrl = window.location.origin + window.location.pathname;
  const urlParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      urlParams.append(key, value);
    }
  });

  const queryString = urlParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

/**
 * Parsear parámetros de URL
 * @returns {Object} Parámetros parseados
 */
export const parseUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const params = {};

  for (const [key, value] of urlParams.entries()) {
    params[key] = value;
  }

  return params;
};

/**
 * Detectar si es dispositivo móvil
 * @returns {boolean} Es móvil
 */
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Detectar si está en modo offline
 * @returns {boolean} Está offline
 */
export const isOffline = () => {
  return !navigator.onLine;
};

/**
 * Formatear coordenadas para mostrar
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @param {number} precision - Decimales
 * @returns {string} Coordenadas formateadas
 */
export const formatCoordinates = (lat, lng, precision = 4) => {
  if (!isValidCoordinates(lat, lng)) {
    return "Coordenadas inválidas";
  }

  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
};

/**
 * Obtener bounds (límites) de un conjunto de coordenadas
 * @param {Array} coordinates - Array de coordenadas
 * @returns {Object} Bounds con min/max lat/lng
 */
export const getCoordinatesBounds = (coordinates) => {
  if (!coordinates || coordinates.length === 0) {
    return null;
  }

  const lats = coordinates.map((coord) => coord.lat);
  const lngs = coordinates.map((coord) => coord.lng);

  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  };
};

/**
 * Convertir archivo a Base64
 * @param {File} file - Archivo a convertir
 * @returns {Promise<string>} String en Base64
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Lazy load de imágenes
 * @param {HTMLElement} img - Elemento imagen
 * @param {string} src - URL de la imagen
 */
export const lazyLoadImage = (img, src) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        img.src = src;
        img.classList.remove("lazy");
        observer.unobserve(img);
      }
    });
  });

  observer.observe(img);
};

/**
 * Limpiar datos para envío al servidor
 * @param {Object} data - Datos a limpiar
 * @returns {Object} Datos limpiados
 */
export const sanitizeData = (data) => {
  const cleaned = {};

  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (typeof value === "string") {
        cleaned[key] = value.trim();
      } else if (Array.isArray(value)) {
        cleaned[key] = value.filter(
          (item) => item !== null && item !== undefined
        );
      } else {
        cleaned[key] = value;
      }
    }
  });

  return cleaned;
};

// Objeto con todas las funciones exportadas para facilitar importación
const helpers = {
  formatDuration,
  formatFileSize,
  formatDate,
  formatRelativeDate,
  truncateText,
  capitalizeWords,
  isValidEmail,
  isValidCoordinates,
  calculateDistance,
  debounce,
  throttle,
  generateUniqueId,
  downloadFile,
  copyToClipboard,
  getUserLocation,
  validateAudioFile,
  formatNumber,
  getEmotionColor,
  normalizeSearchText,
  filterBySearch,
  multiSort,
  groupBy,
  countOccurrences,
  getCenterCoordinates,
  generateShareUrl,
  parseUrlParams,
  isMobileDevice,
  isOffline,
  formatCoordinates,
  getCoordinatesBounds,
  fileToBase64,
  lazyLoadImage,
  sanitizeData,
};

export default helpers;
