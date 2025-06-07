import React, { useState, useRef, useEffect } from "react";
import "./AudioPlayer.css";

const SimpleAudioPlayer = ({ audioUrl, title = "Audio", compact = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    console.log("🎵 Cargando audio:", audioUrl);
    setError(null);
    setIsLoading(true);

    // Event listeners
    const handleLoadedData = () => {
      console.log("✅ Audio cargado correctamente");
      setDuration(audio.duration);
      setIsLoading(false);
      setError(null);
    };

    const handleError = (e) => {
      console.error("❌ Error cargando audio:", e);
      setError("Error cargando el audio");
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    // Add event listeners
    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("error", handleError);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    // Set volume
    audio.volume = volume;

    // Cleanup
    return () => {
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [audioUrl, volume]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    } catch (error) {
      console.error("Error en play/pause:", error);
      setError("Error controlando reproducción");
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time) => {
    if (!time || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (error) {
    return (
      <div className={`audio-player ${compact ? "compact" : ""} error`}>
        <span className="error-message">❌ {error}</span>
        <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "5px" }}>
          URL: {audioUrl}
        </div>
      </div>
    );
  }

  return (
    <div className={`audio-player ${compact ? "compact" : ""}`}>
      {!compact && title && <div className="audio-title">🎵 {title}</div>}

      {/* Audio element oculto */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        style={{ display: "none" }}
      />

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

      {/* Barra de progreso simple */}
      <div
        className="progress-bar"
        onClick={handleSeek}
        style={{
          width: "100%",
          height: "8px",
          backgroundColor: "#e5e7eb",
          borderRadius: "4px",
          cursor: "pointer",
          marginTop: "8px",
          position: "relative",
        }}
      >
        <div
          style={{
            width: duration ? `${(currentTime / duration) * 100}%` : "0%",
            height: "100%",
            backgroundColor: "#4f46e5",
            borderRadius: "4px",
            transition: "width 0.1s",
          }}
        />
      </div>

      {isLoading && (
        <div
          style={{
            fontSize: "0.8rem",
            color: "#666",
            textAlign: "center",
            marginTop: "5px",
          }}
        >
          Cargando: {audioUrl.split("/").pop()}
        </div>
      )}
    </div>
  );
};

export default SimpleAudioPlayer;
