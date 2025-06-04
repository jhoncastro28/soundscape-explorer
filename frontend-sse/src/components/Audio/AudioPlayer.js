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

  useEffect(() => {
    if (!audioUrl || !waveformRef.current) return;

    // Inicializar WaveSurfer
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
    });

    // Event listeners
    wavesurfer.current.on("ready", () => {
      setDuration(wavesurfer.current.getDuration());
      setIsLoading(false);
      setError(null);
    });

    wavesurfer.current.on("play", () => {
      setIsPlaying(true);
    });

    wavesurfer.current.on("pause", () => {
      setIsPlaying(false);
    });

    wavesurfer.current.on("finish", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    wavesurfer.current.on("audioprocess", () => {
      setCurrentTime(wavesurfer.current.getCurrentTime());
    });

    wavesurfer.current.on("error", (error) => {
      console.error("Error en reproductor de audio:", error);
      setError("Error cargando el audio");
      setIsLoading(false);
    });

    // Cargar audio
    setIsLoading(true);
    setError(null);
    wavesurfer.current.load(audioUrl);

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [audioUrl, compact]);

  const togglePlayPause = () => {
    if (!wavesurfer.current) return;

    if (isPlaying) {
      wavesurfer.current.pause();
    } else {
      wavesurfer.current.play();
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (wavesurfer.current) {
      wavesurfer.current.setVolume(newVolume);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e) => {
    if (!wavesurfer.current || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const seekTime = percentage * duration;

    wavesurfer.current.seekTo(percentage);
    setCurrentTime(seekTime);
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
          disabled={isLoading}
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
