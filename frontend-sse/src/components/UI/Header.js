import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header = ({
  title = "SoundScape Explorer",
  subtitle,
  showNavigation = true,
  currentPath = "/",
  connectionStatus = "connected",
}) => {
  const navItems = [
    { path: "/", label: "🏠 Inicio", icon: "🏠" },
    { path: "/explore", label: "🗺️ Explorar", icon: "🗺️" },
    { path: "/upload", label: "📤 Subir", icon: "📤" },
    { path: "/analytics", label: "📊 Análisis", icon: "📊" },
  ];

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-brand">
          <Link to="/" className="brand-link">
            <h1>{title}</h1>
            {subtitle && <p className="subtitle">{subtitle}</p>}
          </Link>
        </div>

        {showNavigation && (
          <nav className="header-nav">
            <ul className="nav-list">
              {navItems.map((item) => (
                <li key={item.path} className="nav-item">
                  <Link
                    to={item.path}
                    className={`nav-link ${
                      currentPath === item.path ? "active" : ""
                    }`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="header-status">
          <div className={`connection-status ${connectionStatus}`}>
            <span className="status-indicator">
              {connectionStatus === "connected" ? "🟢" : "🔴"}
            </span>
            <span className="status-text">
              {connectionStatus === "connected" ? "Conectado" : "Desconectado"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export { Header };