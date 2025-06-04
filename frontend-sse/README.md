# 🎵 SoundScape Explorer - Frontend

Una aplicación web interactiva para explorar paisajes sonoros del mundo con mapas dinámicos y reproductor de audio avanzado.

## 📋 Características

- 🗺️ **Mapa interactivo** con Leaflet para visualización geoespacial
- 🎵 **Reproductor de audio** avanzado con WaveSurfer.js
- 📱 **Diseño responsive** optimizado para móviles y desktop
- 🔍 **Búsqueda y filtros** avanzados por emociones y ubicación
- 📊 **Dashboard de analytics** con visualizaciones de datos
- 📤 **Upload de sonidos** con validación en tiempo real
- 🎨 **Interfaz moderna** con Material-UI y CSS personalizado

## 🛠️ Tecnologías

- **Framework**: React 19.1.0 con Hooks
- **Routing**: React Router DOM 7.6.2
- **Mapas**: Leaflet + React-Leaflet
- **Audio**: WaveSurfer.js 7.9.5
- **HTTP**: Axios 1.9.0
- **UI**: Material-UI + Styled Components
- **Estilos**: CSS moderno con variables nativas

## 📂 Estructura del Proyecto

```
frontend-sse/
├── public/
│   ├── index.html         # HTML base
│   └── favicon.ico
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── Audio/        # Reproductor y upload de audio
│   │   ├── Forms/        # Formularios interactivos
│   │   ├── Map/          # Componentes de mapa
│   │   └── UI/           # Elementos de interfaz
│   ├── pages/            # Páginas principales (implementadas en App.js)
│   ├── services/         # Servicios API
│   ├── utils/            # Utilidades y constantes
│   ├── styles/           # Estilos globales
│   ├── App.js            # Componente principal
│   ├── App.css           # Estilos principales
│   └── index.js          # Punto de entrada
├── package.json          # Dependencias y scripts
└── .env                  # Variables de entorno
```

## 🚀 Instalación y Configuración

### 1. Prerrequisitos

- Node.js 16+
- npm o yarn
- Backend funcionando (puerto 5000)

### 2. Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/soundscape-explorer.git
cd soundscape-explorer/frontend-sse

# Instalar dependencias
npm install

# O con yarn
yarn install
```

### 3. Variables de Entorno

Crear archivo `.env`:

```bash
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_UPLOADS_URL=http://localhost:5000
REACT_APP_DEFAULT_LAT=4.7110
REACT_APP_DEFAULT_LNG=-74.0721
REACT_APP_DEFAULT_ZOOM=10
```

### 4. Ejecutar la Aplicación

```bash
# Desarrollo
npm start

# Producción
npm run build
npm install -g serve
serve -s build
```

La aplicación estará disponible en `http://localhost:3000`

## 🎛️ Componentes Principales

### 🗺️ SoundMap

Componente de mapa interactivo:

```jsx
import SoundMap from './components/Map/SoundMap';

<SoundMap 
  sounds={sounds}
  onSoundSelect={handleSoundSelect}
  center={[lat, lng]}
  zoom={10}
  height="500px"
/>
```

**Props:**
- `sounds`: Array de sonidos a mostrar
- `onSoundSelect`: Callback al seleccionar sonido
- `center`: Coordenadas centrales [lat, lng]
- `zoom`: Nivel de zoom inicial
- `height`: Altura del mapa

### 🎵 AudioPlayer

Reproductor de audio con visualización:

```jsx
import AudioPlayer from './components/Audio/AudioPlayer';

<AudioPlayer 
  audioUrl="https://example.com/audio.mp3"
  title="Mi Sonido"
  compact={false}
/>
```

**Props:**
- `audioUrl`: URL del archivo de audio
- `title`: Título del audio
- `compact`: Modo compacto (boolean)

### 📝 SoundForm

Formulario para crear/editar sonidos:

```jsx
import SoundForm from './components/Forms/SoundForm';

<SoundForm 
  onSuccess={handleSuccess}
  onCancel={handleCancel}
  initialData={existingSound}
/>
```

**Props:**
- `onSuccess`: Callback de éxito
- `onCancel`: Callback de cancelación
- `initialData`: Datos iniciales para edición

## 🛣️ Rutas de la Aplicación

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | HomePage | Dashboard principal con sonidos destacados |
| `/explore` | ExplorePage | Mapa interactivo para explorar |
| `/upload` | UploadPage | Formulario para subir nuevos sonidos |
| `/analytics` | AnalyticsPage | Estadísticas y análisis de datos |

## 🎨 Personalización de Estilos

### Variables CSS

```css
:root {
  --primary-color: #4f46e5;
  --primary-hover: #4338ca;
  --secondary-color: #6b7280;
  --success-color: #10b981;
  --error-color: #ef4444;
  --warning-color: #f59e0b;
  
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
}
```

### Clases Utilitarias

```css
.btn-primary     /* Botón principal */
.btn-secondary   /* Botón secundario */
.sound-card     /* Tarjeta de sonido */
.emotion-tag    /* Etiqueta de emoción */
.loading-spinner /* Spinner de carga */
```

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile */
@media (max-width: 768px) {
  .sounds-grid {
    grid-template-columns: 1fr;
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .sounds-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .sounds-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## 🔧 Servicios API

### soundsAPI

```javascript
import { soundsAPI } from './services/api';

// Obtener todos los sonidos
const sounds = await soundsAPI.getAllSounds();

// Crear nuevo sonido
const formData = new FormData();
formData.append('audio', audioFile);
formData.append('nombre', 'Mi Sonido');
const result = await soundsAPI.createSound(formData);

// Buscar por ubicación
const nearbySounds = await soundsAPI.getSoundsByLocation(lat, lng, radius);
```

### analyticsAPI

```javascript
import { analyticsAPI } from './services/api';

// Patrones emocionales
const emotions = await analyticsAPI.getEmotionPatterns();

// Estadísticas de ubicaciones
const locations = await analyticsAPI.getLocationStats();

// Búsqueda avanzada
const results = await analyticsAPI.searchSounds({
  q: 'naturaleza',
  emotion: 'relajante'
});
```

## 🎵 Integración de Audio

### Formatos Soportados

- **MP3**: Más compatible
- **WAV**: Alta calidad
- **OGG**: Código abierto
- **M4A**: Apple/móviles

### Configuración WaveSurfer

```javascript
const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: '#4f46e5',
  progressColor: '#7c3aed',
  cursorColor: '#f59e0b',
  barWidth: 2,
  barGap: 1,
  height: 80,
  normalize: true,
  responsive: true
});
```

## 🗺️ Configuración de Mapas

### Leaflet Setup

```javascript
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corregir iconos de marcadores
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
```

### Marcadores Personalizados

```javascript
const createEmotionIcon = (emotion) => {
  const color = EMOTION_COLORS[emotion] || '#666';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}">🎵</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};
```

## 📊 Estado de la Aplicación

### Hooks Utilizados

```javascript
// Estado principal
const [sounds, setSounds] = useState([]);
const [selectedSound, setSelectedSound] = useState(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);

// Filtros
const [searchTerm, setSearchTerm] = useState('');
const [selectedEmotion, setSelectedEmotion] = useState('');
const [filteredSounds, setFilteredSounds] = useState([]);
```

### Manejo de Efectos

```javascript
// Cargar sonidos al montar
useEffect(() => {
  loadSounds();
}, []);

// Filtrar cuando cambien los criterios
useEffect(() => {
  filterSounds();
}, [sounds, searchTerm, selectedEmotion]);
```

## 🚨 Manejo de Errores

### Patrones de Error

```javascript
try {
  const response = await soundsAPI.getAllSounds();
  setSounds(response.data.data);
} catch (error) {
  console.error('Error:', error);
  setError('No se pudieron cargar los sonidos');
} finally {
  setIsLoading(false);
}
```

### Componentes de Error

```jsx
// Pantalla de error de conexión
{connectionStatus === 'disconnected' && (
  <div className="error-screen">
    <h2>❌ Error de Conexión</h2>
    <p>{error}</p>
    <button onClick={checkConnection}>Reintentar</button>
  </div>
)}
```

## 🎭 Estados de Carga

### Loading States

```jsx
// Spinner de carga
{isLoading && (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Cargando paisajes sonoros...</p>
  </div>
)}

// Skeleton loading para tarjetas
{isLoading ? (
  <div className="sound-card skeleton" />
) : (
  <SoundCard sound={sound} />
)}
```

## 🧪 Testing

### Scripts de Test

```bash
# Ejecutar tests
npm test

# Coverage
npm run test:coverage

# E2E tests (si están configurados)
npm run test:e2e
```

### Ejemplo de Test

```javascript
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SoundCard from './SoundCard';

test('renders sound card with title', () => {
  const mockSound = {
    nombre: 'Test Sound',
    autor: 'Test Author'
  };
  
  render(<SoundCard sound={mockSound} />);
  expect(screen.getByText('Test Sound')).toBeInTheDocument();
});
```

## 🔧 Optimización

### Performance Tips

1. **Lazy Loading** de componentes:
```javascript
const SoundMap = React.lazy(() => import('./components/Map/SoundMap'));
```

2. **Memoización** de componentes pesados:
```javascript
const MemoizedSoundCard = React.memo(SoundCard);
```

3. **Debounce** en búsquedas:
```javascript
const debouncedSearch = useDebounce(searchTerm, 300);
```

## 📦 Build y Deploy

### Build para Producción

```bash
# Crear build optimizado
npm run build

# Analizar bundle
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer build/static/js/*.js
```

### Variables de Entorno para Producción

```bash
REACT_APP_API_BASE_URL=https://api.tu-dominio.com/api
REACT_APP_UPLOADS_URL=https://api.tu-dominio.com
```

## 🤝 Contribuir

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Seguir convenciones de código:
   - Usar Prettier para formateo
   - ESLint para linting
   - Nombres descriptivos para componentes
4. Añadir tests para nuevas funcionalidades
5. Commit con mensajes descriptivos
6. Push y crear Pull Request

## 👥 Autores

- Juan Sebastian Zarate Ortiz
- Jhon Jairo Castro Mancipe
- Pedro Eduardo Cruz López

## 🔗 Enlaces Útiles

- [React Documentation](https://react.dev/)
- [Leaflet Documentation](https://leafletjs.com/)
- [WaveSurfer.js](https://wavesurfer-js.org/)
- [Material-UI](https://mui.com/)
- [Styled Components](https://styled-components.com/)