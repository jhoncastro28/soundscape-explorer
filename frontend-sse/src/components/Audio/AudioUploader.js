import React, { useState, useRef, useCallback } from "react";
import { AUDIO_CONFIG, MESSAGES } from "../../utils/constants";
import "./AudioUploader.css";

const ModernAudioUploader = ({
  onFileSelect,
  onFileRemove,
  acceptedFormats = AUDIO_CONFIG.allowedFormats,
  maxFileSize = AUDIO_CONFIG.maxFileSize,
  className = "",
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [audioInfo, setAudioInfo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const validateFile = useCallback(
    (file) => {
      // Validar tamaño
      if (file.size > maxFileSize) {
        return `Archivo demasiado grande. Máximo ${Math.round(
          maxFileSize / (1024 * 1024)
        )}MB`;
      }

      // Validar formato
      const extension = file.name.split(".").pop().toLowerCase();
      if (!acceptedFormats.includes(extension)) {
        return `Formato no permitido. Use: ${acceptedFormats.join(", ")}`;
      }

      // Validar tipo MIME
      const validMimeTypes = {
        mp3: ["audio/mpeg", "audio/mp3"],
        wav: ["audio/wav", "audio/wave"],
        ogg: ["audio/ogg"],
        m4a: ["audio/mp4", "audio/m4a"],
      };

      const expectedMimes = validMimeTypes[extension];
      if (
        expectedMimes &&
        !expectedMimes.some((mime) => file.type.includes(mime.split("/")[1]))
      ) {
        console.warn(
          "Tipo MIME no coincide exactamente, pero permitiendo:",
          file.type
        );
      }

      return null;
    },
    [acceptedFormats, maxFileSize]
  );

  const analyzeAudioFile = useCallback(
    async (file) => {
      setIsAnalyzing(true);

      return new Promise((resolve) => {
        const audio = new Audio();
        const url = URL.createObjectURL(file);

        const cleanup = () => {
          URL.revokeObjectURL(url);
          setIsAnalyzing(false);
        };

        audio.onloadedmetadata = () => {
          const info = {
            duration: Math.floor(audio.duration),
            size: file.size,
            format: file.name.split(".").pop().toLowerCase(),
            name: file.name,
            sampleRate: audio.sampleRate || "Desconocido",
            channels: audio.channels || "Desconocido",
            bitrate:
              Math.round((file.size * 8) / audio.duration) || "Desconocido",
            quality: getAudioQuality(file.size, audio.duration),
          };
          cleanup();
          resolve(info);
        };

        audio.onerror = () => {
          const info = {
            size: file.size,
            format: file.name.split(".").pop().toLowerCase(),
            name: file.name,
            duration: 0,
            error: "No se pudo analizar el audio",
          };
          cleanup();
          resolve(info);
        };

        // Timeout para evitar esperas infinitas
        setTimeout(() => {
          if (isAnalyzing) {
            const info = {
              size: file.size,
              format: file.name.split(".").pop().toLowerCase(),
              name: file.name,
              duration: 0,
              error: "Tiempo de análisis excedido",
            };
            cleanup();
            resolve(info);
          }
        }, 10000); // 10 segundos timeout

        audio.src = url;
      });
    },
    [isAnalyzing]
  );

  const getAudioQuality = (fileSize, duration) => {
    if (!duration) return "desconocida";

    const bitrate = (fileSize * 8) / duration / 1000; // kbps

    if (bitrate >= 320) return "muy alta";
    if (bitrate >= 256) return "alta";
    if (bitrate >= 192) return "buena";
    if (bitrate >= 128) return "media";
    return "baja";
  };

  const simulateUploadProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 20;
      });
    }, 200);
  };

  const handleFile = async (file) => {
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedFile(file);
    simulateUploadProgress();

    try {
      const info = await analyzeAudioFile(file);
      setAudioInfo(info);

      if (onFileSelect) {
        onFileSelect(file, info);
      }
    } catch (error) {
      console.error("Error analizando archivo:", error);
      setError("Error analizando el archivo de audio");
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      // Solo desactivar si realmente salimos del drop zone
      if (!dropZoneRef.current?.contains(e.relatedTarget)) {
        setDragActive(false);
      }
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setAudioInfo(null);
    setError(null);
    setUploadProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (onFileRemove) {
      onFileRemove();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return "Desconocida";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getFormatIcon = (format) => {
    const icons = {
      mp3: "🎵",
      wav: "🌊",
      ogg: "🔊",
      m4a: "📱",
    };
    return icons[format] || "🎧";
  };

  const getQualityColor = (quality) => {
    const colors = {
      "muy alta": "#10b981",
      alta: "#059669",
      buena: "#3b82f6",
      media: "#f59e0b",
      baja: "#ef4444",
      desconocida: "#6b7280",
    };
    return colors[quality] || "#6b7280";
  };

  return (
    <div className={`modern-audio-uploader ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleInputChange}
        accept={acceptedFormats.map((format) => `.${format}`).join(",")}
        className="file-input"
        id="modern-audio-upload"
      />

      <div
        ref={dropZoneRef}
        className={`modern-upload-area ${dragActive ? "drag-active" : ""} ${
          selectedFile ? "has-file" : ""
        } ${error ? "has-error" : ""} ${isAnalyzing ? "analyzing" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
      >
        {!selectedFile ? (
          <div className="upload-prompt-modern">
            <div className="upload-animation">
              <div className="upload-icon-container">
                <div className="upload-icon">🎵</div>
                <div className="upload-pulse"></div>
                <div className="upload-pulse delay-1"></div>
                <div className="upload-pulse delay-2"></div>
              </div>
            </div>

            <div className="upload-text-modern">
              <h3 className="upload-title">
                {dragActive
                  ? "¡Suelta tu archivo aquí!"
                  : "Selecciona tu archivo de audio"}
              </h3>
              <p className="upload-main">
                Arrastra y suelta o{" "}
                <span className="upload-link">haz clic para explorar</span>
              </p>
              <div className="upload-specs">
                <div className="spec-item">
                  <span className="spec-icon">📁</span>
                  <span>
                    Formatos: {acceptedFormats.join(", ").toUpperCase()}
                  </span>
                </div>
                <div className="spec-item">
                  <span className="spec-icon">📏</span>
                  <span>
                    Máximo: {Math.round(maxFileSize / (1024 * 1024))}MB
                  </span>
                </div>
                <div className="spec-item">
                  <span className="spec-icon">⚡</span>
                  <span>Análisis automático incluido</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="file-preview-modern">
            <div className="file-header">
              <div className="file-icon-large">
                {getFormatIcon(audioInfo?.format)}
              </div>
              <div className="file-details-main">
                <h4 className="file-name">{audioInfo?.name}</h4>
                <div className="file-meta-primary">
                  <span className="file-size-badge">
                    {formatFileSize(audioInfo?.size || 0)}
                  </span>
                  <span className="file-format-badge">
                    {audioInfo?.format?.toUpperCase()}
                  </span>
                  {audioInfo?.quality && (
                    <span
                      className="quality-badge"
                      style={{
                        backgroundColor: getQualityColor(audioInfo.quality),
                      }}
                    >
                      {audioInfo.quality}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                className="remove-file-btn-modern"
                title="Eliminar archivo"
              >
                <span className="remove-icon">✕</span>
              </button>
            </div>

            {/* Barra de progreso */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="upload-progress-container">
                <div className="progress-bar-modern">
                  <div
                    className="progress-fill-modern"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
            )}

            {/* Información detallada del audio */}
            <div className="audio-details-grid">
              <div className="detail-card">
                <div className="detail-icon">⏱️</div>
                <div className="detail-content">
                  <span className="detail-label">Duración</span>
                  <span className="detail-value">
                    {formatDuration(audioInfo?.duration)}
                  </span>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-icon">📊</div>
                <div className="detail-content">
                  <span className="detail-label">Bitrate</span>
                  <span className="detail-value">
                    {audioInfo?.bitrate !== "Desconocido"
                      ? `${Math.round(audioInfo?.bitrate)} kbps`
                      : "Calculando..."}
                  </span>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-icon">🎛️</div>
                <div className="detail-content">
                  <span className="detail-label">Calidad</span>
                  <span
                    className="detail-value"
                    style={{ color: getQualityColor(audioInfo?.quality) }}
                  >
                    {audioInfo?.quality || "Analizando..."}
                  </span>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-icon">📏</div>
                <div className="detail-content">
                  <span className="detail-label">Tamaño</span>
                  <span className="detail-value">
                    {formatFileSize(audioInfo?.size || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Estado de análisis */}
            {isAnalyzing && (
              <div className="analyzing-indicator">
                <div className="analyzing-spinner"></div>
                <span>Analizando propiedades del audio...</span>
              </div>
            )}

            {/* Errores de análisis */}
            {audioInfo?.error && (
              <div className="analysis-warning">
                <span className="warning-icon">⚠️</span>
                <span>{audioInfo.error}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="upload-error-modern">
          <span className="error-icon">❌</span>
          <span className="error-text">{error}</span>
        </div>
      )}

      {selectedFile && audioInfo && !error && (
        <div className="audio-preview-section">
          <h4 className="preview-title">
            <span className="preview-icon">🎧</span>
            Vista previa del audio
          </h4>
          <div className="preview-player-container">
            <audio
              controls
              src={URL.createObjectURL(selectedFile)}
              className="preview-audio-player"
            >
              Tu navegador no soporta el elemento de audio.
            </audio>
          </div>

          {/* Tips de optimización */}
          <div className="optimization-tips">
            <h5>💡 Consejos para mejor calidad:</h5>
            <ul>
              <li>Para mejor calidad, usa formato WAV o MP3 a 320kbps</li>
              <li>Mantén el audio entre 30 segundos y 10 minutos</li>
              <li>Evita ruido de fondo excesivo para mejor experiencia</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernAudioUploader;
