import React, { useState, useRef } from "react";
import { AUDIO_CONFIG, MESSAGES } from "../../utils/constants";
import "./AudioUploader.css";

const AudioUploader = ({
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

  const fileInputRef = useRef(null);

  const validateFile = (file) => {
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

    return null;
  };

  const getAudioInfo = (file) => {
    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);

      audio.onloadedmetadata = () => {
        const info = {
          duration: Math.floor(audio.duration),
          size: file.size,
          format: file.name.split(".").pop().toLowerCase(),
          name: file.name,
        };
        URL.revokeObjectURL(url);
        resolve(info);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          size: file.size,
          format: file.name.split(".").pop().toLowerCase(),
          name: file.name,
          duration: 0,
        });
      };

      audio.src = url;
    });
  };

  const handleFile = async (file) => {
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Obtener información del audio
    const info = await getAudioInfo(file);
    setAudioInfo(info);

    if (onFileSelect) {
      onFileSelect(file, info);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

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
    if (!seconds) return "Desconocida";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`audio-uploader ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleInputChange}
        accept={acceptedFormats.map((format) => `.${format}`).join(",")}
        className="file-input"
        id="audio-upload"
      />

      <div
        className={`upload-area ${dragActive ? "drag-active" : ""} ${
          selectedFile ? "has-file" : ""
        } ${error ? "has-error" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
      >
        {!selectedFile ? (
          <div className="upload-prompt">
            <div className="upload-icon">🎵</div>
            <div className="upload-text">
              <p className="upload-main">
                Arrastra tu archivo de audio aquí o{" "}
                <span className="upload-link">haz clic para seleccionar</span>
              </p>
              <p className="upload-formats">
                Formatos: {acceptedFormats.join(", ")} | Máximo:{" "}
                {Math.round(maxFileSize / (1024 * 1024))}MB
              </p>
            </div>
          </div>
        ) : (
          <div className="file-preview">
            <div className="file-icon">🎵</div>
            <div className="file-details">
              <div className="file-name">{audioInfo?.name}</div>
              <div className="file-info">
                <span className="file-size">
                  {formatFileSize(audioInfo?.size || 0)}
                </span>
                <span className="file-duration">
                  Duración: {formatDuration(audioInfo?.duration)}
                </span>
                <span className="file-format">
                  {audioInfo?.format?.toUpperCase()}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              className="remove-file-btn"
              title="Eliminar archivo"
            >
              ❌
            </button>
          </div>
        )}
      </div>

      {error && <div className="upload-error">⚠️ {error}</div>}

      {selectedFile && audioInfo && (
        <div className="audio-preview">
          <h4>Vista previa:</h4>
          <audio
            controls
            src={URL.createObjectURL(selectedFile)}
            className="audio-preview-player"
          >
            Tu navegador no soporta el elemento de audio.
          </audio>
        </div>
      )}
    </div>
  );
};

export default AudioUploader;
