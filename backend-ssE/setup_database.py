"""
Script para configurar la base de datos con datos de prueba
"""

import os
import sys
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pymongo import MongoClient, GEOSPHERE

# Cargar variables de entorno
load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'soundscape')

# Datos de muestra para Colombia
SAMPLE_SOUNDS = [
    {
        "nombre": "Amanecer en la selva amazónica",
        "descripcion": "Sonidos matutinos de la selva con cantos de pájaros y el río al fondo",
        "autor": "Carlos Natura",
        "ubicacion": {"type": "Point", "coordinates": [-69.2167, -4.2158]},
        "sonidos": ["naturaleza", "pájaros", "agua", "bosque"],
        "emociones": ["relajante", "peaceful", "inspirador"],
        "etiquetas": ["biodiversidad", "naturaleza", "meditación"],
        "audio_url": "/uploads/example_amazon_dawn.mp3",
        "duracion": 180,
        "calidad_audio": "alta"
    },
    {
        "nombre": "Lluvia en Bogotá",
        "descripcion": "Lluvia suave cayendo en el centro de Bogotá durante la tarde",
        "autor": "María Rodríguez",
        "ubicacion": {"type": "Point", "coordinates": [-74.0721, 4.7110]},
        "sonidos": ["lluvia", "ciudad"],
        "emociones": ["melancólico", "nostálgico", "relajante"],
        "etiquetas": ["clima", "ciudad", "relajación"],
        "audio_url": "/uploads/example_bogota_rain.mp3",
        "duracion": 240,
        "calidad_audio": "media"
    },
    {
        "nombre": "Olas del Caribe en Cartagena",
        "descripcion": "Sonido relajante de las olas rompiendo en las playas de Cartagena",
        "autor": "José Marinero",
        "ubicacion": {"type": "Point", "coordinates": [-75.5518, 10.3997]},
        "sonidos": ["océano", "agua", "naturaleza"],
        "emociones": ["relajante", "peaceful", "romántico"],
        "etiquetas": ["playa", "turismo", "relajación", "bienestar"],
        "audio_url": "/uploads/example_cartagena_waves.mp3",
        "duracion": 300,
        "calidad_audio": "alta"
    },
    {
        "nombre": "Café matutino en Zona Rosa",
        "descripcion": "Ambiente de una cafetería en la Zona Rosa de Bogotá durante la mañana",
        "autor": "Ana Cafetera",
        "ubicacion": {"type": "Point", "coordinates": [-74.0525, 4.6694]},
        "sonidos": ["ciudad", "multitud", "música"],
        "emociones": ["energético", "inspirador", "alegre"],
        "etiquetas": ["trabajo", "café", "social", "productividad"],
        "audio_url": "/uploads/example_cafe_morning.mp3",
        "duracion": 420,
        "calidad_audio": "media"
    },
    {
        "nombre": "Viento en los páramos de Chingaza",
        "descripcion": "Viento suave atravesando la vegetación del páramo en el Parque Chingaza",
        "autor": "Miguel Montañero",
        "ubicacion": {"type": "Point", "coordinates": [-73.8000, 4.5167]},
        "sonidos": ["viento", "naturaleza"],
        "emociones": ["misterioso", "meditativo", "peaceful"],
        "etiquetas": ["páramo", "naturaleza", "meditación", "biodiversidad"],
        "audio_url": "/uploads/example_chingaza_wind.mp3",
        "duracion": 360,
        "calidad_audio": "alta"
    },
    {
        "nombre": "TransMilenio en hora pico",
        "descripcion": "Sonidos del sistema de transporte masivo durante la hora pico",
        "autor": "Roberto Urbano",
        "ubicacion": {"type": "Point", "coordinates": [-74.0500, 4.6500]},
        "sonidos": ["tráfico", "ciudad", "industrial"],
        "emociones": ["caótico", "energético"],
        "etiquetas": ["transporte", "ciudad", "estrés"],
        "audio_url": "/uploads/example_transmilenio_rush.mp3",
        "duracion": 180,
        "calidad_audio": "media"
    },
    {
        "nombre": "Cascada La Chorrera",
        "descripcion": "El sonido poderoso de la cascada más alta de Colombia",
        "autor": "Diana Aventurera",
        "ubicacion": {"type": "Point", "coordinates": [-74.1167, 4.5833]},
        "sonidos": ["agua", "naturaleza"],
        "emociones": ["inspirador", "energético", "aventurero"],
        "etiquetas": ["cascada", "turismo", "naturaleza", "aventura"],
        "audio_url": "/uploads/example_la_chorrera.mp3",
        "duracion": 480,
        "calidad_audio": "profesional"
    },
    {
        "nombre": "Vallenato en Valledupar",
        "descripcion": "Música vallenata tradicional en una casa de Valledupar",
        "autor": "Rafael Juglares",
        "ubicacion": {"type": "Point", "coordinates": [-73.2481, 10.4631]},
        "sonidos": ["música"],
        "emociones": ["alegre", "nostálgico", "romántico"],
        "etiquetas": ["música", "cultura", "tradición"],
        "audio_url": "/uploads/example_vallenato.mp3",
        "duracion": 320,
        "calidad_audio": "alta"
    }
]

def connect_to_database():
    """Conectar a MongoDB"""
    try:
        client = MongoClient(MONGODB_URI)
        db = client[DATABASE_NAME]
        
        # Verificar conexión
        client.admin.command('ping')
        print("✅ Conectado a MongoDB Atlas")
        return db
    except Exception as e:
        print(f"❌ Error conectando a MongoDB: {e}")
        sys.exit(1)

def setup_collections_and_indexes(db):
    """Configurar colecciones e índices"""
    try:
        print("📊 Configurando colecciones e índices...")
        
        # Colección de sonidos
        sounds_collection = db.sonidos
        
        # Crear índices necesarios
        indices = [
            ([("ubicacion", GEOSPHERE)], "Índice geoespacial"),
            ("fecha", "Índice de fecha"),
            ("emociones", "Índice de emociones"),
            ("etiquetas", "Índice de etiquetas"), 
            ("autor", "Índice de autor"),
            ("sonidos", "Índice de tipos de sonidos")
        ]
        
        for index_spec, description in indices:
            try:
                sounds_collection.create_index(index_spec)
                print(f"   ✅ {description}")
            except Exception as e:
                print(f"   ⚠️ {description}: {e}")
        
        return sounds_collection
        
    except Exception as e:
        print(f"❌ Error configurando índices: {e}")
        return None

def insert_sample_data(collection):
    """Insertar datos de muestra"""
    try:
        print("📝 Insertando datos de muestra...")
        
        # Limpiar datos existentes (opcional)
        existing_count = collection.count_documents({})
        if existing_count > 0:
            print(f"   🗑️ Encontrados {existing_count} documentos existentes")
            choice = input("   ¿Deseas limpiar los datos existentes? (s/N): ")
            if choice.lower() in ['s', 'sí', 'si']:
                collection.delete_many({})
                print("   ✅ Datos existentes eliminados")
        
        # Insertar sonidos de muestra
        for i, sound in enumerate(SAMPLE_SOUNDS):
            # Añadir fecha aleatoria en los últimos 30 días
            sound["fecha"] = datetime.now() - timedelta(days=random.randint(0, 30))
            collection.insert_one(sound.copy())
            print(f"   📝 Insertado: {sound['nombre']}")
        
        print(f"✅ Insertados {len(SAMPLE_SOUNDS)} sonidos de muestra")
        
        # Mostrar estadísticas
        total_sounds = collection.count_documents({})
        unique_authors = len(collection.distinct("autor"))
        unique_emotions = len(collection.distinct("emociones"))
        
        print(f"\n📊 Estadísticas de la base de datos:")
        print(f"   • Total de sonidos: {total_sounds}")
        print(f"   • Autores únicos: {unique_authors}")
        print(f"   • Emociones únicas: {unique_emotions}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error insertando datos: {e}")
        return False

def test_queries(collection):
    """Probar consultas básicas"""
    try:
        print("\n🔍 Probando consultas...")
        
        # Consulta básica
        total = collection.count_documents({})
        print(f"   📊 Total de documentos: {total}")
        
        # Consulta por emoción
        relajantes = collection.count_documents({"emociones": "relajante"})
        print(f"   😌 Sonidos relajantes: {relajantes}")
        
        # Consulta geoespacial (cerca de Bogotá)
        bogota_sounds = collection.count_documents({
            "ubicacion": {
                "$near": {
                    "$geometry": {
                        "type": "Point",
                        "coordinates": [-74.0721, 4.7110]
                    },
                    "$maxDistance": 50000  # 50km
                }
            }
        })
        print(f"   🏙️ Sonidos cerca de Bogotá: {bogota_sounds}")
        
        # Consulta de agregación (emociones más populares)
        pipeline = [
            {"$unwind": "$emociones"},
            {"$group": {"_id": "$emociones", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 3}
        ]
        
        top_emotions = list(collection.aggregate(pipeline))
        print("   🎭 Top 3 emociones:")
        for emotion in top_emotions:
            print(f"      • {emotion['_id']}: {emotion['count']} sonidos")
        
        print("✅ Todas las consultas funcionan correctamente")
        return True
        
    except Exception as e:
        print(f"❌ Error probando consultas: {e}")
        return False

def main():
    """Función principal"""
    print("🎵 SoundScape Explorer - Configuración de Base de Datos")
    print("=" * 55)
    
    # Conectar a la base de datos
    db = connect_to_database()
    
    # Configurar colecciones e índices
    collection = setup_collections_and_indexes(db)
    if not collection:
        return
    
    # Insertar datos de muestra
    success = insert_sample_data(collection)
    if not success:
        return
    
    # Probar consultas
    test_success = test_queries(collection)
    if not test_success:
        return
    
    print("\n🎉 ¡Base de datos configurada exitosamente!")
    print("📝 Próximos pasos:")
    print("   1. Iniciar el backend: python app.py")
    print("   2. Instalar dependencias del frontend: cd frontend-sse && npm install")
    print("   3. Iniciar el frontend: npm start")
    print("   4. Abrir http://localhost:3000 en tu navegador")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Operación cancelada por el usuario")
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        sys.exit(1)