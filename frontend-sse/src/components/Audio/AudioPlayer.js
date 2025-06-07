import React, { useState, useRef, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import { AUDIO_CONFIG } from "../../utils/constants";
import "./AudioPlayer.css";

const AudioPlayer = ({ audioUrl, title = "Audio", compact = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(AUDIO_CONFIG.defaultVolume);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const isDestroyedRef = useRef(false);

  useEffect(() => {
    if (!audioUrl || !waveformRef.current) return;

    // Reset estado
    isDestroyedRef.current = false;
    setError(null);
    setIsLoading(true);

    // Limpiar instancia anterior si existe
    if (wavesurfer.current) {
      try {
        wavesurfer.current.destroy();
      } catch (e) {
        // Ignorar errores de cleanup
      }
      wavesurfer.current = null;
    }

    // Crear nueva instancia con manejo de errores
    try {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#4f46e5",
        progressColor: "#7c3aed",
        cursorColor: "#f59e0b",
        barWidth: 2,
        barGap: 1,
        height: compact ? 40 : 80,
        normalize: true,
        backend: "WebAudio",
        responsive: true,
        // Añadir configuración para evitar errores
        mediaControls: false,
        interaction: true,
      });

      // Event listeners con verificación de estado
      wavesurfer.current.on("ready", () => {
        if (!isDestroyedRef.current && wavesurfer.current) {
          setDuration(wavesurfer.current.getDuration());
          setIsLoading(false);
          setError(null);
        }
      });

      wavesurfer.current.on("play", () => {
        if (!isDestroyedRef.current) {
          setIsPlaying(true);
        }
      });

      wavesurfer.current.on("pause", () => {
        if (!isDestroyedRef.current) {
          setIsPlaying(false);
        }
      });

      wavesurfer.current.on("finish", () => {
        if (!isDestroyedRef.current) {
          setIsPlaying(false);
          setCurrentTime(0);
        }
      });

      wavesurfer.current.on("audioprocess", () => {
        if (!isDestroyedRef.current && wavesurfer.current) {
          setCurrentTime(wavesurfer.current.getCurrentTime());
        }
      });

      wavesurfer.current.on("error", (error) => {
        if (!isDestroyedRef.current) {
          console.warn("WaveSurfer error:", error);
          setError("Error cargando el audio");
          setIsLoading(false);
        }
      });

      // Cargar audio con manejo de errores
      if (wavesurfer.current && !isDestroyedRef.current) {
        wavesurfer.current.load(audioUrl);
      }
    } catch (error) {
      console.error("Error inicializando WaveSurfer:", error);
      setError("Error inicializando reproductor");
      setIsLoading(false);
    }

    return () => {
      // Cleanup
      isDestroyedRef.current = true;

      if (wavesurfer.current) {
        try {
          // Pausar antes de destruir
          if (wavesurfer.current.isPlaying && wavesurfer.current.isPlaying()) {
            wavesurfer.current.pause();
          }

          // Pequeño delay para evitar race conditions
          setTimeout(() => {
            if (wavesurfer.current) {
              try {
                wavesurfer.current.destroy();
              } catch (e) {
                // Ignorar errores de cleanup en desarrollo
                console.warn("Error durante cleanup de WaveSurfer:", e.message);
              }
              wavesurfer.current = null;
            }
          }, 100);
        } catch (error) {
          console.warn("Error durante cleanup:", error.message);
        }
      }
    };
  }, [audioUrl, compact]);

  const togglePlayPause = () => {
    if (!wavesurfer.current || isDestroyedRef.current) return;

    try {
      if (isPlaying) {
        wavesurfer.current.pause();
      } else {
        wavesurfer.current.play();
      }
    } catch (error) {
      console.warn("Error en play/pause:", error);
      setError("Error controlando reproducción");
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    if (wavesurfer.current && !isDestroyedRef.current) {
      try {
        wavesurfer.current.setVolume(newVolume);
      } catch (error) {
        console.warn("Error cambiando volumen:", error);
      }
    }
  };

  const formatTime = (time) => {
    if (!time || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e) => {
    if (!wavesurfer.current || !duration || isDestroyedRef.current) return;

    try {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const seekTime = percentage * duration;

      wavesurfer.current.seekTo(percentage);
      setCurrentTime(seekTime);
    } catch (error) {
      console.warn("Error en seek:", error);
    }
  };

  if (error) {
    return (
      <div className={`audio-player ${compact ? "compact" : ""} error`}>
        <span className="error-message">❌ {error}</span>
      </div>
    );
  }

  return (
    <div className={`audio-player ${compact ? "compact" : ""}`}>
      {!compact && title && <div className="audio-title">🎵 {title}</div>}

      <div className="audio-controls">
        <button
          onClick={togglePlayPause}
          disabled={isLoading || isDestroyedRef.current}
          className="play-pause-btn"
          title={isPlaying ? "Pausar" : "Reproducir"}
        >
          {isLoading ? "⏳" : isPlaying ? "⏸️" : "▶️"}
        </button>

        <div className="time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {!compact && (
          <div className="volume-control">
            <span className="volume-icon">🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>
        )}
      </div>

      <div className="waveform-container">
        <div ref={waveformRef} className="waveform" onClick={handleSeek} />
        {isLoading && (
          <div className="loading-overlay">
            <span>Cargando audio...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPlayer;
