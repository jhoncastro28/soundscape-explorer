import React, { useState } from "react";
import "./Sidebar.css";

const Sidebar = ({
  isOpen = false,
  onToggle,
  title = "Menu",
  children,
  position = "left",
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && <div className="sidebar-overlay" onClick={onToggle} />}

      {/* Sidebar */}
      <aside
        className={`sidebar ${position} ${isOpen ? "open" : ""} ${
          isCollapsed ? "collapsed" : ""
        }`}
      >
        <div className="sidebar-header">
          <h3 className="sidebar-title">{title}</h3>
          <div className="sidebar-controls">
            <button
              onClick={handleToggleCollapse}
              className="collapse-btn"
              title={isCollapsed ? "Expandir" : "Colapsar"}
            >
              {isCollapsed ? "📋" : "📝"}
            </button>
            <button onClick={onToggle} className="close-btn" title="Cerrar">
              ❌
            </button>
          </div>
        </div>

        <div className="sidebar-content">{children}</div>
      </aside>
    </>
  );
};

export { Sidebar };
