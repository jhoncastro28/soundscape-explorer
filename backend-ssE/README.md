# 🎵 SoundScape Explorer - Backend

Un sistema backend robusto para mapeo sonoro colaborativo con geolocalización, construido con Flask y MongoDB Atlas.

## 📋 Características

- 🗺️ **API REST completa** con operaciones CRUD para sonidos geolocalizados
- 🔍 **Consultas geoespaciales** avanzadas con MongoDB
- 📊 **Analytics y agregaciones** complejas de datos
- 📁 **Upload de archivos** de audio con validación
- 🔐 **Validación robusta** de datos y archivos
- 🌐 **CORS configurado** para integración frontend
- 📈 **Escalable** con MongoDB Atlas

## 🛠️ Tecnologías

- **Framework**: Flask 2.3.3
- **Base de Datos**: MongoDB Atlas con consultas geoespaciales
- **Validación**: Validación personalizada de archivos y datos
- **Upload**: Werkzeug para manejo seguro de archivos
- **Geolocalización**: GeoJSON y índices 2dsphere
- **CORS**: Flask-CORS para integración frontend

## 📂 Estructura del Proyecto

```
backend-ssE/
├── app.py                 # Aplicación principal
├── config.py              # Configuración de la app
├── requirements.txt       # Dependencias
├── .env                  # Variables de entorno
├── models/
│   └── sound_model.py    # Modelo de datos de sonidos
├── routes/
│   ├── sounds.py         # Rutas CRUD de sonidos
│   └── analytics.py      # Rutas de análisis y estadísticas
└── utils/
    ├── database.py       # Conexión y configuración de MongoDB
    └── geo_utils.py      # Utilidades geoespaciales
```

## 🚀 Instalación y Configuración

### 1. Prerrequisitos

- Python 3.8+
- MongoDB Atlas (cuenta gratuita)
- Git

### 2. Clonación y Setup

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/soundscape-explorer.git
cd soundscape-explorer/backend-ssE

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

### 3. Configuración de Variables de Entorno

Crear archivo `.env`:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/soundscape?retryWrites=true&w=majority
DATABASE_NAME=soundscape

# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=tu_clave_secreta_muy_segura

# Upload Configuration
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=50000000

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Audio Configuration
ALLOWED_AUDIO_EXTENSIONS=mp3,wav,ogg,m4a
```

### 4. Configuración de MongoDB Atlas

1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear un cluster gratuito
3. Configurar usuario y contraseña
4. Obtener string de conexión
5. Actualizar `MONGODB_URI` en `.env`

### 5. Ejecutar la Aplicación

```bash
# Iniciar servidor de desarrollo
python app.py
```

El servidor estará disponible en `http://localhost:5000`

## 📡 API Endpoints

### Sonidos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/sounds` | Obtener sonidos (con filtros opcionales) |
| `GET` | `/api/sounds/{id}` | Obtener sonido específico |
| `POST` | `/api/sounds` | Crear nuevo sonido |
| `PUT` | `/api/sounds/{id}` | Actualizar sonido |
| `DELETE` | `/api/sounds/{id}` | Eliminar sonido |
| `POST` | `/api/sounds/{id}/tags` | Añadir etiqueta a sonido |

### Analytics

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/analytics/emotions` | Patrones emocionales |
| `GET` | `/api/analytics/locations` | Estadísticas por ubicación |
| `GET` | `/api/analytics/tags` | Estadísticas de etiquetas |
| `GET` | `/api/analytics/timeline` | Datos temporales |
| `GET` | `/api/analytics/search` | Búsqueda avanzada |
| `GET` | `/api/analytics/recommendations/{id}` | Recomendaciones |

### Utilidad

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/uploads/{filename}` | Servir archivos de audio |

## 📊 Ejemplos de Uso

### Crear un nuevo sonido

```bash
curl -X POST http://localhost:5000/api/sounds \
  -F "audio=@mi_sonido.mp3" \
  -F "nombre=Amanecer en la playa" \
  -F "latitud=10.3997" \
  -F "longitud=-75.5518" \
  -F "autor=Juan Pérez" \
  -F "emociones=relajante" \
  -F "emociones=peaceful"
```

### Buscar sonidos por ubicación

```bash
curl "http://localhost:5000/api/sounds?lat=4.7110&lng=-74.0721&radius=5"
```

### Obtener patrones emocionales

```bash
curl "http://localhost:5000/api/analytics/emotions"
```

## 🔧 Configuración Avanzada

### Índices de MongoDB

El sistema crea automáticamente los siguientes índices:

```javascript
// Índice geoespacial principal
db.sonidos.createIndex({ "ubicacion": "2dsphere" })

// Índices para consultas frecuentes
db.sonidos.createIndex({ "fecha": 1 })
db.sonidos.createIndex({ "emociones": 1 })
db.sonidos.createIndex({ "etiquetas": 1 })
db.sonidos.createIndex({ "autor": 1 })
```

### Agregaciones Complejas

Ejemplo de agregación para análisis emocional:

```python
pipeline = [
    {"$unwind": "$emociones"},
    {"$group": {
        "_id": "$emociones",
        "count": {"$sum": 1},
        "sonidos_ejemplo": {"$push": "$nombre"}
    }},
    {"$sort": {"count": -1}},
    {"$limit": 10}
]
```

### Consultas Geoespaciales

```python
# Buscar sonidos en un radio de 10km
pipeline = [
    {
        "$geoNear": {
            "near": {"type": "Point", "coordinates": [lng, lat]},
            "distanceField": "distancia",
            "maxDistance": 10000,  # 10km en metros
            "spherical": True
        }
    }
]
```

## 📁 Archivos de Audio

### Formatos Soportados
- **MP3**: Formato más común, buena compresión
- **WAV**: Alta calidad, sin compresión
- **OGG**: Código abierto, buena compresión
- **M4A**: Formato Apple, alta calidad

### Validaciones
- Tamaño máximo: 50MB
- Formatos permitidos: configurables en `.env`
- Nombres seguros con `secure_filename()`

## 🧪 Datos de Prueba

Generar datos de muestra:

```bash
# Desde la raíz del proyecto
cd scripts
python generate_sample_data.py
```

Este script creará:
- 10 sonidos predefinidos de Colombia
- Datos adicionales aleatorios (configurable)
- Índices optimizados
- Estadísticas de la base de datos

## 🚨 Manejo de Errores

### Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | Operación exitosa |
| 201 | Recurso creado |
| 400 | Error en datos enviados |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

### Formato de Respuesta

```json
{
  "success": true/false,
  "data": {...},
  "error": "mensaje de error",
  "count": 123
}
```

## 🔐 Seguridad

### Medidas Implementadas

- ✅ Validación de tipos de archivo
- ✅ Sanitización de nombres de archivo
- ✅ Límites de tamaño de archivo
- ✅ Validación de datos de entrada
- ✅ CORS configurado específicamente
- ✅ Variables de entorno para credenciales

### Recomendaciones para Producción

```bash
# Cambiar clave secreta
SECRET_KEY=clave_super_segura_para_produccion

# Configurar CORS específico
FRONTEND_URL=https://tu-dominio.com

# Usar HTTPS
FLASK_ENV=production
```

## 📈 Monitoreo y Logs

### Logs del Sistema

```python
# Configurar logging en app.py
import logging
logging.basicConfig(level=logging.INFO)
```

### Métricas Importantes

- Número de uploads por día
- Errores de conexión a MongoDB
- Tiempo de respuesta de endpoints
- Uso de almacenamiento

## 🔧 Troubleshooting

### Problemas Comunes

#### Error de Conexión a MongoDB
```bash
Error: ServerSelectionTimeoutError
```
**Solución**: Verificar `MONGODB_URI` y conexión a internet

#### Error de CORS
```bash
Access to fetch at '...' has been blocked by CORS policy
```
**Solución**: Verificar `FRONTEND_URL` en `.env`

#### Error de Upload
```bash
Error: File too large
```
**Solución**: Verificar `MAX_CONTENT_LENGTH` y tamaño del archivo

## 📚 Dependencias

### Principales

```txt
Flask==2.3.3          # Framework web
pymongo==4.5.0        # Driver MongoDB
Flask-CORS==4.0.0     # Cross-Origin Resource Sharing
python-dotenv==1.0.0  # Variables de entorno
Werkzeug==2.3.7       # Utilidades web
geopy==2.4.0          # Geocoding
```

## 🤝 Contribuir

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 👥 Autores

- Juan Sebastian Zarate Ortiz
- Jhon Jairo Castro Mancipe  
- Pedro Eduardo Cruz López

## 🔗 Enlaces Útiles

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [GeoJSON Specification](https://geojson.org/)
- [Audio File Formats](https://en.wikipedia.org/wiki/Audio_file_format)