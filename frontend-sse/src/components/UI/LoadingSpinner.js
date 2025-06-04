import React from "react";
import "./LoadingSpinner.css";

const LoadingSpinner = ({
  size = "medium",
  message = "Cargando...",
  overlay = false,
  color = "primary",
}) => {
  const sizeClasses = {
    small: "spinner-small",
    medium: "spinner-medium",
    large: "spinner-large",
  };

  const LoadingContent = () => (
    <div className={`loading-spinner ${sizeClasses[size]}`}>
      <div className={`spinner ${color}`}></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        <LoadingContent />
      </div>
    );
  }

  return <LoadingContent />;
};

export { LoadingSpinner };