# 🎵 SoundScape Explorer

Una aplicación web interactiva para explorar, compartir y analizar paisajes sonoros del mundo con geolocalización y reproductores de audio avanzados.

## 🌟 Características Principales

### 🎧 **Experiencia de Audio Inmersiva**
- Reproductor avanzado con WaveSurfer.js
- Visualización de formas de onda en tiempo real
- Soporte para múltiples formatos (MP3, WAV, OGG, M4A)
- Controles de volumen y navegación intuitivos

### 🗺️ **Mapas Interactivos**
- Visualización geoespacial con Leaflet
- Marcadores dinámicos por emociones
- Búsqueda por proximidad geográfica
- Selección interactiva de ubicaciones

### 📊 **Analytics Avanzados**
- Patrones emocionales en tiempo real
- Estadísticas de ubicaciones más activas
- Timeline de actividad
- Insights automatizados

### 🎨 **Interfaz Moderna**
- Diseño responsive para todos los dispositivos
- Tema coherente con variables CSS
- Animaciones fluidas y micro-interacciones
- Componentes reutilizables

## 🛠️ Stack Tecnológico

### Frontend
- **React 19.1.0** - Framework principal
- **React Router DOM 7.6.2** - Navegación
- **Leaflet + React-Leaflet** - Mapas interactivos
- **WaveSurfer.js 7.9.5** - Reproductor de audio
- **Axios 1.9.0** - Cliente HTTP
- **Material-UI** - Componentes UI

### Backend
- **Flask 2.3.3** - Framework web
- **MongoDB Atlas** - Base de datos NoSQL
- **PyMongo 4.5.0** - Driver MongoDB
- **Flask-CORS** - Manejo de CORS
- **Werkzeug** - Utilidades web

### Infraestructura
- **MongoDB Atlas** - Base de datos en la nube
- **Consultas geoespaciales** con índices 2dsphere
- **Upload de archivos** con validación
- **API REST** completa

## 📁 Estructura del Proyecto

```
soundscape-explorer/
├── backend-ssE/                 # Backend Flask
│   ├── app.py                  # Aplicación principal
│   ├── config.py               # Configuración
│   ├── models/                 # Modelos de datos
│   │   └── sound_model.py      # Modelo de sonidos
│   ├── routes/                 # Rutas API
│   │   ├── sounds.py           # CRUD de sonidos
│   │   └── analytics.py        # Análisis y estadísticas
│   ├── utils/                  # Utilidades
│   │   ├── database.py         # Conexión MongoDB
│   │   └── geo_utils.py        # Utilidades geoespaciales
│   └── requirements.txt        # Dependencias Python
│
├── frontend-sse/               # Frontend React
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   │   ├── Audio/          # Reproductor y upload
│   │   │   ├── Forms/          # Formularios
│   │   │   ├── Map/            # Mapas interactivos
│   │   │   ├── Analytics/      # Visualizaciones
│   │   │   └── UI/             # Elementos de interfaz
│   │   ├── services/           # Servicios API
│   │   ├── utils/              # Utilidades y constantes
│   │   ├── styles/             # Estilos globales
│   │   └── App.js              # Componente principal
│   └── package.json            # Dependencias Node.js
│
└── scripts/                    # Scripts de utilidad
    └── generate_sample_data.py # Generador de datos de prueba
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Node.js 16+** y npm
- **Python 3.8+**
- **Cuenta MongoDB Atlas** (gratuita)
- **Git**

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/soundscape-explorer.git
cd soundscape-explorer
```

### 2. Configurar el Backend

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

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de MongoDB Atlas
```

#### Configuración de MongoDB Atlas

1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear un cluster gratuito
3. Configurar usuario y contraseña
4. Obtener string de conexión
5. Actualizar `MONGODB_URI` en `.env`:

```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/soundscape?retryWrites=true&w=majority
DATABASE_NAME=soundscape
SECRET_KEY=tu_clave_secreta_muy_segura
```

### 3. Configurar el Frontend

```bash
cd ../frontend-sse

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env si es necesario
```

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_UPLOADS_URL=http://localhost:5000
REACT_APP_DEFAULT_LAT=4.7110
REACT_APP_DEFAULT_LNG=-74.0721
REACT_APP_DEFAULT_ZOOM=10
```

### 4. Ejecutar la Aplicación

#### Terminal 1 - Backend:
```bash
cd backend-ssE
python app.py
# Servidor en http://localhost:5000
```

#### Terminal 2 - Frontend:
```bash
cd frontend-sse
npm start
# Aplicación en http://localhost:3000
```

### 5. Generar Datos de Prueba (Opcional)

```bash
cd scripts
python generate_sample_data.py
```

## 📡 API Endpoints

### Sonidos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/sounds` | Obtener sonidos con filtros |
| `GET` | `/api/sounds/{id}` | Obtener sonido específico |
| `POST` | `/api/sounds` | Crear nuevo sonido |
| `PUT` | `/api/sounds/{id}` | Actualizar sonido |
| `DELETE` | `/api/sounds/{id}` | Eliminar sonido |

### Analytics
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/analytics/emotions` | Patrones emocionales |
| `GET` | `/api/analytics/locations` | Estadísticas por ubicación |
| `GET` | `/api/analytics/search` | Búsqueda avanzada |
| `GET` | `/api/analytics/recommendations/{id}` | Recomendaciones |

## 🎨 Características de la Interfaz

### Componentes Principales

#### 🎵 AudioPlayer
- Reproductor con WaveSurfer.js
- Visualización de ondas de audio
- Controles de volumen y progreso
- Modo compacto y expandido

#### 🗺️ SoundMap
- Mapa interactivo con Leaflet
- Marcadores por emociones con colores
- Popups informativos
- Selección de ubicación

#### 📝 SoundForm
- Formulario completo de upload
- Validación en tiempo real
- Preview de audio
- Selección de ubicación en mapa

#### 📊 Analytics
- Gráficos de emociones
- Estadísticas de ubicaciones
- Timeline de actividad
- Insights automatizados

### Tema y Estilos

El proyecto utiliza un sistema de variables CSS consistente:

```css
:root {
  --primary-color: #4f46e5;
  --success-color: #10b981;
  --error-color: #ef4444;
  --bg-primary: #ffffff;
  --text-primary: #111827;
  /* ... más variables */
}
```

## 🔧 Configuración Avanzada

### Índices de MongoDB

El sistema crea automáticamente estos índices:

```javascript
db.sonidos.createIndex({ "ubicacion": "2dsphere" })
db.sonidos.createIndex({ "fecha": 1 })
db.sonidos.createIndex({ "emociones": 1 })
db.sonidos.createIndex({ "etiquetas": 1 })
```

### Consultas Geoespaciales

```python
pipeline = [
    {
        "$geoNear": {
            "near": {"type": "Point", "coordinates": [lng, lat]},
            "distanceField": "distancia",
            "maxDistance": 10000,  # 10km
            "spherical": True
        }
    }
]
```

### Formatos de Audio Soportados

- **MP3**: Más compatible, buena compresión
- **WAV**: Alta calidad, sin compresión
- **OGG**: Código abierto, buena compresión
- **M4A**: Formato Apple, alta calidad

## 🧪 Testing y Desarrollo

### Scripts Disponibles

```bash
# Frontend
npm start          # Servidor de desarrollo
npm run build      # Build de producción
npm test           # Ejecutar tests

# Backend
python app.py      # Servidor de desarrollo
python -m pytest  # Ejecutar tests (si están configurados)
```

### Estructura de Testing

```javascript
// Ejemplo de test con React Testing Library
import { render, screen } from '@testing-library/react';
import AudioPlayer from './AudioPlayer';

test('renders audio player with title', () => {
  render(<AudioPlayer title="Test Audio" />);
  expect(screen.getByText('Test Audio')).toBeInTheDocument();
});
```

## 🔐 Seguridad

### Medidas Implementadas

- ✅ Validación de tipos de archivo
- ✅ Sanitización de nombres de archivo
- ✅ Límites de tamaño de archivo
- ✅ Validación de datos de entrada
- ✅ CORS configurado específicamente
- ✅ Variables de entorno para credenciales

### Para Producción

```env
SECRET_KEY=clave_super_segura_para_produccion
FRONTEND_URL=https://tu-dominio.com
FLASK_ENV=production
```

## 📈 Optimización y Performance

### Frontend
- Lazy loading de componentes
- Memoización con React.memo
- Debounce en búsquedas
- Optimización de imágenes

### Backend
- Índices optimizados en MongoDB
- Paginación en consultas
- Cache de consultas frecuentes
- Compresión de respuestas

## 🚨 Troubleshooting

### Problemas Comunes

#### Error de Conexión MongoDB
```
ServerSelectionTimeoutError
```
**Solución**: Verificar `MONGODB_URI` y conexión a internet

#### Error de CORS
```
Access blocked by CORS policy
```
**Solución**: Verificar `FRONTEND_URL` en configuración

#### Error de Upload
```
File too large
```
**Solución**: Verificar `MAX_CONTENT_LENGTH`

## 🤝 Contribuir

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Seguir convenciones de código
4. Añadir tests para nuevas funcionalidades
5. Commit descriptivos (`git commit -am 'Añadir nueva funcionalidad'`)
6. Push y crear Pull Request

### Convenciones de Código

- **Frontend**: ESLint + Prettier
- **Backend**: PEP 8 para Python
- **Commits**: Conventional Commits
- **Ramas**: feature/, bugfix/, hotfix/

## 📊 Roadmap

### Versión 1.1
- [ ] Sistema de usuarios y autenticación
- [ ] Favoritos y playlists
- [ ] Comentarios en sonidos
- [ ] Sistema de ratings

### Versión 1.2
- [ ] Exportación de datos
- [ ] Integración con redes sociales
- [ ] API pública
- [ ] Aplicación móvil

### Versión 2.0
- [ ] Machine Learning para recomendaciones
- [ ] Reconocimiento automático de emociones
- [ ] Colaboración en tiempo real
- [ ] Marketplace de sonidos

## 👥 Equipo

- **Juan Sebastian Zarate Ortiz** - Frontend & UX
- **Jhon Jairo Castro Mancipe** - Backend & Database
- **Pedro Eduardo Cruz López** - Full Stack & DevOps

## 🙏 Agradecimientos

- [OpenStreetMap](https://www.openstreetmap.org) por los mapas
- [Freesound](https://freesound.org) por inspiración
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) por la base de datos
- Comunidad de desarrolladores open source

---

⭐ **¡Dale una estrella al proyecto si te gustó!** ⭐