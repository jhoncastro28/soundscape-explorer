import React, { useState, useRef } from "react";
import { soundsAPI } from "../../services/api";
import {
  EMOTIONS,
  SOUND_TYPES,
  PREDEFINED_TAGS,
  AUDIO_CONFIG,
  MESSAGES,
  APP_CONFIG,
} from "../../utils/constants";
import SoundMap from "../Map/SoundMap";
import "./SoundForm.css";

const SoundForm = ({ onSuccess, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || "",
    descripcion: initialData?.descripcion || "",
    autor: initialData?.autor || "",
    latitud: initialData?.ubicacion?.coordinates[1] || APP_CONFIG.DEFAULT_LAT,
    longitud: initialData?.ubicacion?.coordinates[0] || APP_CONFIG.DEFAULT_LNG,
    sonidos: initialData?.sonidos || [],
    emociones: initialData?.emociones || [],
    etiquetas: initialData?.etiquetas || [],
    duracion: initialData?.duracion || 0,
    calidad_audio: initialData?.calidad_audio || "media",
  });

  const [audioFile, setAudioFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState(
    initialData?.audio_url || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleMultiSelectChange = (name, value) => {
    setFormData((prev) => {
      const currentValues = prev[name] || [];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [name]: currentValues.filter((item) => item !== value),
        };
      } else {
        return {
          ...prev,
          [name]: [...currentValues, value],
        };
      }
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tamaño del archivo
    if (file.size > AUDIO_CONFIG.maxFileSize) {
      setErrors((prev) => ({
        ...prev,
        audio: MESSAGES.errors.fileTooBig,
      }));
      return;
    }

    // Validar formato
    const extension = file.name.split(".").pop().toLowerCase();
    if (!AUDIO_CONFIG.allowedFormats.includes(extension)) {
      setErrors((prev) => ({
        ...prev,
        audio: MESSAGES.errors.invalidFormat,
      }));
      return;
    }

    setAudioFile(file);
    setAudioPreview(URL.createObjectURL(file));
    setErrors((prev) => ({
      ...prev,
      audio: null,
    }));

    // Obtener duración del audio
    const audio = new Audio();
    audio.onloadedmetadata = () => {
      setFormData((prev) => ({
        ...prev,
        duracion: Math.floor(audio.duration),
      }));
    };
    audio.src = URL.createObjectURL(file);
  };

  const handleLocationSelect = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitud: lat,
      longitud: lng,
    }));
    setShowLocationSelector(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (!formData.autor.trim()) {
      newErrors.autor = "El autor es requerido";
    }

    if (!formData.latitud || !formData.longitud) {
      newErrors.ubicacion = MESSAGES.errors.locationRequired;
    }

    if (!audioFile && !initialData) {
      newErrors.audio = "El archivo de audio es requerido";
    }

    if (formData.emociones.length === 0) {
      newErrors.emociones = "Selecciona al menos una emoción";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();

      // Agregar datos del formulario
      Object.keys(formData).forEach((key) => {
        if (Array.isArray(formData[key])) {
          formData[key].forEach((item) => {
            submitData.append(key, item);
          });
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Agregar archivo de audio si existe
      if (audioFile) {
        submitData.append("audio", audioFile);
      }

      let response;
      if (initialData) {
        // Actualizar sonido existente
        response = await soundsAPI.updateSound(initialData._id, formData);
      } else {
        // Crear nuevo sonido
        response = await soundsAPI.createSound(submitData);
      }

      if (response.data.success) {
        if (onSuccess) {
          onSuccess(response.data.data);
        }
      }
    } catch (error) {
      console.error("Error enviando formulario:", error);
      setErrors({
        submit: error.response?.data?.error || MESSAGES.errors.genericError,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sound-form-container">
      <form onSubmit={handleSubmit} className="sound-form">
        <h2>{initialData ? "Editar Sonido" : "Nuevo Sonido"}</h2>

        {/* Información básica */}
        <div className="form-section">
          <h3>Información Básica</h3>

          <div className="form-group">
            <label htmlFor="nombre">Nombre del Sonido *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Ej: Amanecer en la selva amazónica"
              className={errors.nombre ? "error" : ""}
            />
            {errors.nombre && (
              <span className="error-message">{errors.nombre}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="autor">Autor *</label>
            <input
              type="text"
              id="autor"
              name="autor"
              value={formData.autor}
              onChange={handleInputChange}
              placeholder="Tu nombre"
              className={errors.autor ? "error" : ""}
            />
            {errors.autor && (
              <span className="error-message">{errors.autor}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Describe el contexto y características del sonido..."
              rows="3"
            />
          </div>
        </div>

        {/* Audio */}
        <div className="form-section">
          <h3>Archivo de Audio</h3>

          <div className="form-group">
            <label>Archivo de Audio {!initialData && "*"}</label>
            <div className="file-upload-area">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={AUDIO_CONFIG.allowedFormats
                  .map((format) => `.${format}`)
                  .join(",")}
                className="file-input"
              />
              <div
                className="file-upload-button"
                onClick={() => fileInputRef.current?.click()}
              >
                📁 Seleccionar archivo de audio
              </div>
              <div className="file-info">
                Formatos: {AUDIO_CONFIG.allowedFormats.join(", ")} | Máximo:{" "}
                {AUDIO_CONFIG.maxFileSize / (1024 * 1024)}MB
              </div>
            </div>
            {audioFile && (
              <div className="selected-file">
                ✅ {audioFile.name} (
                {Math.round((audioFile.size / (1024 * 1024)) * 100) / 100}MB)
              </div>
            )}
            {errors.audio && (
              <span className="error-message">{errors.audio}</span>
            )}
          </div>

          {audioPreview && (
            <div className="audio-preview">
              <h4>Vista previa:</h4>
              <audio controls style={{ width: "100%" }}>
                <source src={audioPreview} />
                Tu navegador no soporta el elemento de audio.
              </audio>
            </div>
          )}
        </div>

        {/* Ubicación */}
        <div className="form-section">
          <h3>Ubicación *</h3>

          <div className="location-inputs">
            <div className="form-group">
              <label htmlFor="latitud">Latitud</label>
              <input
                type="number"
                id="latitud"
                name="latitud"
                value={formData.latitud}
                onChange={handleInputChange}
                step="any"
                className={errors.ubicacion ? "error" : ""}
              />
            </div>

            <div className="form-group">
              <label htmlFor="longitud">Longitud</label>
              <input
                type="number"
                id="longitud"
                name="longitud"
                value={formData.longitud}
                onChange={handleInputChange}
                step="any"
                className={errors.ubicacion ? "error" : ""}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLocationSelector(!showLocationSelector)}
            className="btn-secondary"
          >
            📍 {showLocationSelector ? "Ocultar" : "Seleccionar en mapa"}
          </button>

          {showLocationSelector && (
            <div className="map-selector">
              <p>Haz clic en el mapa para seleccionar la ubicación:</p>
              <SoundMap
                center={[formData.latitud, formData.longitud]}
                onLocationSelect={handleLocationSelect}
                showLocationSelector={true}
                height="300px"
                sounds={[]}
              />
            </div>
          )}

          {errors.ubicacion && (
            <span className="error-message">{errors.ubicacion}</span>
          )}
        </div>

        {/* Clasificación */}
        <div className="form-section">
          <h3>Clasificación</h3>

          <div className="form-group">
            <label>Tipos de Sonidos</label>
            <div className="checkbox-grid">
              {SOUND_TYPES.map((type) => (
                <label key={type} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.sonidos.includes(type)}
                    onChange={() => handleMultiSelectChange("sonidos", type)}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Emociones *</label>
            <div className="checkbox-grid">
              {EMOTIONS.map((emotion) => (
                <label key={emotion} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.emociones.includes(emotion)}
                    onChange={() =>
                      handleMultiSelectChange("emociones", emotion)
                    }
                  />
                  {emotion}
                </label>
              ))}
            </div>
            {errors.emociones && (
              <span className="error-message">{errors.emociones}</span>
            )}
          </div>

          <div className="form-group">
            <label>Etiquetas</label>
            <div className="checkbox-grid">
              {PREDEFINED_TAGS.map((tag) => (
                <label key={tag} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.etiquetas.includes(tag)}
                    onChange={() => handleMultiSelectChange("etiquetas", tag)}
                  />
                  {tag}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="calidad_audio">Calidad de Audio</label>
            <select
              id="calidad_audio"
              name="calidad_audio"
              value={formData.calidad_audio}
              onChange={handleInputChange}
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="profesional">Profesional</option>
            </select>
          </div>
        </div>

        {/* Errores generales */}
        {errors.submit && (
          <div className="error-message general-error">{errors.submit}</div>
        )}

        {/* Botones */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Cancelar
          </button>

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting
              ? "Procesando..."
              : initialData
              ? "Actualizar"
              : "Crear Sonido"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SoundForm;
