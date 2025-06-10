# 🎵 SoundScape Explorer

Una aplicación web completa para explorar, compartir y analizar paisajes sonoros del mundo con geolocalización, análisis de datos y reproductores de audio avanzados.

## ✨ Características Principales

### 🎧 Experiencia de Audio
- **Reproductor de Audio Inteligente**: Controles avanzados con visualización de ondas
- **Soporte Multi-formato**: MP3, WAV, OGG, M4A (hasta 50MB)
- **Streaming Optimizado**: Reproducción sin descargas completas
- **Controles de Volumen**: Ajustes precisos de volumen y progreso

### 🗺️ Mapas Interactivos  
- **Visualización Geoespacial**: Mapas con marcadores coloridos por emociones
- **Tooltips Inteligentes**: Información rápida al hacer hover
- **Búsqueda por Área**: Carga sonidos en ubicaciones específicas
- **Selector de Ubicación**: Click en mapa para establecer coordenadas

### 📊 Analytics Avanzados
- **Dashboard Completo**: Estadísticas en tiempo real
- **Patrones Emocionales**: Análisis de distribución de emociones
- **Timeline de Actividad**: Visualización temporal de últimos 30 días
- **Estadísticas Detalladas**: Métricas por autor, ubicación y duración
- **Insights Automáticos**: Análisis inteligente de tendencias

### 🔍 Búsqueda y Filtros
- **Búsqueda Avanzada**: Filtros por texto, emoción, autor, ubicación
- **Filtros Dinámicos**: Tags activos con eliminación rápida
- **Recomendaciones**: Sugerencias basadas en similitud

### 🎨 Interfaz Moderna
- **Diseño Responsive**: Optimizado para móviles y desktop
- **Modo Oscuro**: Soporte automático según preferencias del sistema
- **Animaciones Fluidas**: Transiciones suaves y micro-interacciones
- **Accesibilidad**: Cumple estándares WCAG

## 🛠️ Stack Tecnológico

### Frontend
```javascript
React 18.2.0              // Framework principal
React Router DOM 6.28.0   // Navegación SPA
Leaflet + React-Leaflet   // Mapas interactivos  
Axios 1.9.0              // Cliente HTTP
Styled Components         // CSS-in-JS
```

### Backend
```python
Flask 2.3.3               # Framework web
MongoDB Atlas             # Base de datos NoSQL
PyMongo 4.5.0            # Driver MongoDB
Flask-CORS               # Manejo de CORS
Geopy 2.4.0             # Utilidades geográficas
```

### Características Técnicas
- **Índices Geoespaciales**: Búsquedas optimizadas por ubicación
- **Agregaciones MongoDB**: Análisis complejos de datos
- **Upload Seguro**: Validación de archivos y tipos MIME
- **Streaming de Audio**: Sin descargas completas
- **Caching Inteligente**: Optimización de rendimiento

## 🚀 Instalación Rápida

### 1. Clonar Repositorio
```bash
git clone <tu-repositorio>
cd soundscape-explorer
```

### 2. Backend Setup
```bash
cd backend-ssE
pip install -r requirements.txt
```

### 3. Configurar MongoDB
Edita `backend-ssE/.env`:
```env
MONGODB_URI=...
DATABASE_NAME=soundscape
FLASK_ENV=development
SECRET_KEY=tu_clave_secreta
FRONTEND_URL=http://localhost:3000
```

### 4. Frontend Setup  
```bash
cd frontend-sse
npm install
```

### 5. Ejecutar Aplicación
```bash
# Terminal 1 - Backend
cd backend-ssE && python app.py

# Terminal 2 - Frontend  
cd frontend-sse && npm start
```

**🌐 URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Estructura del Proyecto

```
soundscape-explorer/
├── 📁 backend-ssE/           # Backend Flask
│   ├── 🐍 app.py            # Aplicación principal
│   ├── ⚙️ config.py         # Configuración
│   ├── 📁 models/           # Modelos de datos
│   ├── 📁 routes/           # Endpoints API
│   │   ├── 🎵 sounds.py     # CRUD de sonidos
│   │   └── 📊 analytics.py  # Analytics y métricas
│   ├── 📁 utils/            # Utilidades
│   └── 📄 requirements.txt  # Dependencias Python
├── 📁 frontend-sse/         # Frontend React
│   ├── 📁 src/
│   │   ├── 📁 components/   # Componentes React
│   │   │   ├── 🎧 Audio/    # Reproductores de audio
│   │   │   ├── 📊 Analytics/ # Dashboard y gráficos
│   │   │   ├── 🗺️ Map/      # Mapas interactivos
│   │   │   ├── 📝 Forms/    # Formularios
│   │   │   └── 🎨 UI/       # Componentes de interfaz
│   │   ├── 🔧 services/     # Servicios API
│   │   └── 🛠️ utils/        # Utilidades y constantes
│   └── 📦 package.json      # Dependencias Node.js
└── 📁 scripts/              # Scripts de utilidad
```

## 🎯 Características Destacadas

### 🎵 Gestión de Audio
- **Validación Robusta**: Verificación de formato y tamaño
- **Preview en Tiempo Real**: Escucha antes de subir
- **Metadatos Automáticos**: Extracción de duración y calidad
- **Streaming Eficiente**: Reproducción optimizada

### 🗺️ Geolocalización
- **Búsqueda por Proximidad**: Radio configurable
- **Clustering Inteligente**: Agrupación de marcadores cercanos  
- **Coordenadas Precisas**: Hasta 6 decimales de precisión
- **Mapas Personalizados**: Diferentes proveedores de tiles

### 📈 Analytics Inteligentes
- **Métricas en Vivo**: Actualización en tiempo real
- **Visualizaciones Dinámicas**: Gráficos interactivos
- **Patrones Temporales**: Análisis de tendencias
- **Insights Automáticos**: Descubrimiento de patrones

### 🔐 Seguridad y Validación
- **Validación de Archivos**: Múltiples capas de verificación
- **Sanitización de Datos**: Limpieza automática de inputs
- **Rate Limiting**: Protección contra abuso
- **CORS Configurado**: Comunicación segura entre dominios

## 📊 API Endpoints

### 🎵 Sonidos
- `GET /api/sounds` - Lista paginada de sonidos
- `POST /api/sounds` - Crear nuevo sonido con audio
- `GET /api/sounds/{id}` - Obtener sonido específico
- `PUT /api/sounds/{id}` - Actualizar sonido
- `DELETE /api/sounds/{id}` - Eliminar sonido

### 📊 Analytics
- `GET /api/analytics/emotions` - Patrones emocionales
- `GET /api/analytics/locations` - Estadísticas geográficas  
- `GET /api/analytics/timeline` - Datos temporales
- `GET /api/analytics/search` - Búsqueda avanzada
- `GET /api/analytics/recommendations/{id}` - Recomendaciones

## 🌟 Próximas Características

- [ ] 🔊 **Análisis Espectral**: Visualización de frecuencias
- [ ] 🤖 **IA para Categorización**: Clasificación automática
- [ ] 🌐 **Modo Offline**: Funcionalidad sin conexión  
- [ ] 📱 **App Móvil**: Versión nativa iOS/Android
- [ ] 🎙️ **Grabación Directa**: Captura desde micrófono
- [ ] 👥 **Perfiles de Usuario**: Sistema de autenticación
- [ ] 🏆 **Gamificación**: Sistema de puntos y logros

## 👥 Equipo de Desarrollo

- **Juan Sebastian Zarate Ortiz** - Full Stack Developer
- **Jhon Jairo Castro Mancipe** - Backend Developer  
- **Pedro Eduardo Cruz López** - Frontend Developer

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: add amazing feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 🔗 Enlaces

- [📖 Documentación Completa](./docs/)
- [🐛 Reportar Bug](./issues/new?template=bug_report.md)
- [💡 Solicitar Feature](./issues/new?template=feature_request.md)
- [💬 Discusiones](./discussions)

---

⭐ **¡Dale una estrella si te gustó el proyecto!** ⭐