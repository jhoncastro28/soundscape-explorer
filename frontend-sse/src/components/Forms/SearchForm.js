import React, { useState, useEffect } from "react";
import { EMOTIONS, SOUND_TYPES, PREDEFINED_TAGS } from "../../utils/constants";
import "./SearchForm.css";

const SearchForm = ({
  onSearch,
  onReset,
  initialValues = {},
  className = "",
}) => {
  const [searchParams, setSearchParams] = useState({
    query: "",
    emotion: "",
    soundType: "",
    tag: "",
    author: "",
    location: "",
    ...initialValues,
  });

  const [isAdvanced, setIsAdvanced] = useState(false);

  useEffect(() => {
    // Trigger search when params change
    if (onSearch) {
      onSearch(searchParams);
    }
  }, [searchParams, onSearch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReset = () => {
    const resetParams = {
      query: "",
      emotion: "",
      soundType: "",
      tag: "",
      author: "",
      location: "",
    };
    setSearchParams(resetParams);

    if (onReset) {
      onReset();
    }
  };

  const hasActiveFilters = () => {
    return Object.values(searchParams).some((value) => value !== "");
  };

  return (
    <div className={`search-form ${className}`}>
      <div className="search-header">
        <h3>🔍 Buscar Paisajes Sonoros</h3>
        <button
          type="button"
          onClick={() => setIsAdvanced(!isAdvanced)}
          className="toggle-advanced-btn"
        >
          {isAdvanced ? "📋 Búsqueda Simple" : "⚙️ Búsqueda Avanzada"}
        </button>
      </div>

      <div className="search-content">
        {/* Búsqueda básica */}
        <div className="basic-search">
          <div className="search-input-group">
            <input
              type="text"
              name="query"
              value={searchParams.query}
              onChange={handleInputChange}
              placeholder="Buscar por nombre, descripción o autor..."
              className="main-search-input"
            />
            <button
              type="button"
              onClick={handleReset}
              className="clear-search-btn"
              disabled={!hasActiveFilters()}
              title="Limpiar búsqueda"
            >
              ❌
            </button>
          </div>

          <div className="quick-filters">
            <select
              name="emotion"
              value={searchParams.emotion}
              onChange={handleInputChange}
              className="filter-select"
            >
              <option value="">Todas las emociones</option>
              {EMOTIONS.map((emotion) => (
                <option key={emotion} value={emotion}>
                  {emotion}
                </option>
              ))}
            </select>

            <select
              name="soundType"
              value={searchParams.soundType}
              onChange={handleInputChange}
              className="filter-select"
            >
              <option value="">Todos los tipos</option>
              {SOUND_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Búsqueda avanzada */}
        {isAdvanced && (
          <div className="advanced-search">
            <div className="advanced-filters">
              <div className="filter-group">
                <label htmlFor="tag">Etiqueta:</label>
                <select
                  id="tag"
                  name="tag"
                  value={searchParams.tag}
                  onChange={handleInputChange}
                  className="filter-select"
                >
                  <option value="">Todas las etiquetas</option>
                  {PREDEFINED_TAGS.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="author">Autor:</label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={searchParams.author}
                  onChange={handleInputChange}
                  placeholder="Nombre del autor..."
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="location">Ubicación:</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={searchParams.location}
                  onChange={handleInputChange}
                  placeholder="Ciudad, país..."
                  className="filter-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Filtros activos */}
        {hasActiveFilters() && (
          <div className="active-filters">
            <span className="active-filters-label">Filtros activos:</span>
            <div className="filter-tags">
              {Object.entries(searchParams).map(([key, value]) => {
                if (!value) return null;

                const displayNames = {
                  query: "Búsqueda",
                  emotion: "Emoción",
                  soundType: "Tipo",
                  tag: "Etiqueta",
                  author: "Autor",
                  location: "Ubicación",
                };

                return (
                  <span key={key} className="filter-tag">
                    <span className="filter-label">{displayNames[key]}:</span>
                    <span className="filter-value">{value}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSearchParams((prev) => ({ ...prev, [key]: "" }))
                      }
                      className="remove-filter-btn"
                      title="Eliminar filtro"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchForm;
