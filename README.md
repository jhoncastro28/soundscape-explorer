# 🎵 SoundScape Explorer

Una aplicación web interactiva para explorar, compartir y analizar paisajes sonoros del mundo con geolocalización y reproductores de audio avanzados.

## 🌟 Características

- **🎧 Reproductor de Audio Avanzado**: Visualización de ondas con WaveSurfer.js
- **🗺️ Mapas Interactivos**: Visualización geoespacial con marcadores por emociones
- **📊 Analytics en Tiempo Real**: Patrones emocionales y estadísticas
- **📤 Upload de Audio**: Soporte para MP3, WAV, OGG, M4A
- **🔍 Búsqueda Avanzada**: Filtros por emoción, ubicación, autor

## 🛠️ Stack Tecnológico

### Frontend
- React 19.1.0
- React Router DOM 7.6.2
- Leaflet + React-Leaflet (Mapas)
- WaveSurfer.js 7.9.5 (Audio)
- Axios 1.9.0

### Backend
- Flask 2.3.3
- MongoDB Atlas
- PyMongo 4.5.0
- Flask-CORS

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
- Node.js 16+
- Python 3.8+
- Cuenta MongoDB Atlas (gratuita)

### 1. Clonar y preparar el proyecto

```bash
git clone <tu-repositorio>
cd soundscape-explorer
```

### 2. Configurar Backend

```bash
cd backend-ssE

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 3. Configurar Variables de Entorno

Edita `backend-ssE/.env` con tus datos de MongoDB Atlas:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/soundscape?retryWrites=true&w=majority
DATABASE_NAME=soundscape
FLASK_ENV=development
SECRET_KEY=tu_clave_secreta_local
FRONTEND_URL=http://localhost:3000
```

### 4. Configurar Frontend

```bash
cd frontend-sse

# Instalar dependencias
npm install
```

### 5. Generar Datos de Prueba (Opcional)

```bash
cd scripts
python generate_sample_data.py
```

### 6. Ejecutar la Aplicación

**Terminal 1 - Backend:**
```bash
cd backend-ssE
python app.py
# Servidor en http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend-sse
npm start
# Aplicación en http://localhost:3000
```

## 📁 Estructura del Proyecto

```
soundscape-explorer/
├── backend-ssE/              # Backend Flask
│   ├── app.py               # Aplicación principal
│   ├── config.py            # Configuración
│   ├── models/              # Modelos de datos
│   ├── routes/              # Rutas API
│   ├── utils/               # Utilidades
│   └── requirements.txt     # Dependencias Python
├── frontend-sse/            # Frontend React
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── services/        # Servicios API
│   │   ├── utils/           # Utilidades
│   │   └── App.js           # Componente principal
│   └── package.json         # Dependencias Node.js
└── scripts/                 # Scripts de utilidad
    └── generate_sample_data.py
```

## 🎯 Uso de la Aplicación

1. **Inicio**: Explora sonidos destacados y estadísticas generales
2. **Explorar**: Busca sonidos en el mapa interactivo
3. **Subir**: Comparte tus propios paisajes sonoros
4. **Análisis**: Visualiza patrones emocionales y estadísticas

## 🔧 API Endpoints

### Sonidos
- `GET /api/sounds` - Obtener sonidos
- `POST /api/sounds` - Crear sonido
- `GET /api/sounds/{id}` - Obtener sonido específico
- `PUT /api/sounds/{id}` - Actualizar sonido
- `DELETE /api/sounds/{id}` - Eliminar sonido

### Analytics
- `GET /api/analytics/emotions` - Patrones emocionales
- `GET /api/analytics/locations` - Estadísticas por ubicación
- `GET /api/analytics/search` - Búsqueda avanzada

## 🎨 Características Técnicas

- **Índices Geoespaciales**: Búsquedas optimizadas por ubicación
- **Upload Seguro**: Validación de archivos y tipos MIME
- **Responsive Design**: Optimizado para móviles y desktop
- **Mapas Dinámicos**: Marcadores coloridos por emoción
- **Audio Streaming**: Reproducción sin descargas completas

## 📊 Formatos Soportados

- **Audio**: MP3, WAV, OGG, M4A
- **Tamaño máximo**: 50MB por archivo
- **Ubicaciones**: Coordenadas GPS precisas

## 🤝 Desarrollo

Para desarrollo local, todos los servicios corren en localhost:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Base de datos: MongoDB Atlas (remoto)

## 👥 Equipo

- **Juan Sebastian Zarate Ortiz**
- **Jhon Jairo Castro Mancipe**
- **Pedro Eduardo Cruz López**

---

⭐ **¡Dale una estrella al proyecto si te gustó!** ⭐