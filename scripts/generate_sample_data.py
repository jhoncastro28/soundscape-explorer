"""
Script para generar datos de prueba para SoundScape Explorer
"""

import os
import sys
import random
from datetime import datetime, timedelta
from pymongo import MongoClient
from backend_ssE.config import Config

# Datos de muestra
SAMPLE_SOUNDS = [
    {
        "nombre": "Amanecer en la selva amazónica",
        "descripcion": "Sonidos matutinos de la selva con cantos de pájaros y el río al fondo",
        "autor": "Carlos Natura",
        "ubicacion": {"type": "Point", "coordinates": [-69.2167, -4.2158]},
        "sonidos": ["naturaleza", "pájaros", "agua", "bosque"],
        "emociones": ["relajante", "peaceful", "inspirador"],
        "etiquetas": ["biodiversidad", "naturaleza", "meditación"],
        "audio_url": "/example_audio/amazon_dawn.mp3",
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
        "audio_url": "/example_audio/bogota_rain.mp3",
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
        "audio_url": "/example_audio/cartagena_waves.mp3",
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
        "audio_url": "/example_audio/cafe_morning.mp3",
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
        "audio_url": "/example_audio/chingaza_wind.mp3",
        "duracion": 360,
        "calidad_audio": "alta"
    },
    {
        "nombre": "Mercado de Paloquemao",
        "descripcion": "Bullicio matutino del mercado de frutas y verduras más grande de Bogotá",
        "autor": "Laura Marketera",
        "ubicacion": {"type": "Point", "coordinates": [-74.1200, 4.6400]},
        "sonidos": ["multitud", "ciudad", "tráfico"],
        "emociones": ["energético", "caótico", "alegre"],
        "etiquetas": ["mercado", "cultura", "social"],
        "audio_url": "/example_audio/paloquemao_market.mp3",
        "duracion": 200,
        "calidad_audio": "media"
    },
    {
        "nombre": "Grillo nocturno en Villa de Leyva",
        "descripcion": "Concierto nocturno de grillos en el campo cerca de Villa de Leyva",
        "autor": "Pedro Campesino",
        "ubicacion": {"type": "Point", "coordinates": [-73.5253, 5.6342]},
        "sonidos": ["insectos", "naturaleza"],
        "emociones": ["nostálgico", "peaceful", "meditativo"],
        "etiquetas": ["noche", "campo", "dormir", "relajación"],
        "audio_url": "/example_audio/villaleyva_crickets.mp3",
        "duracion": 600,
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
        "audio_url": "/example_audio/transmilenio_rush.mp3",
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
        "audio_url": "/example_audio/la_chorrera.mp3",
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
        "audio_url": "/example_audio/vallenato_valledupar.mp3",
        "duracion": 320,
        "calidad_audio": "alta"
    }
]

# Ubicaciones adicionales para generar más datos
COLOMBIA_LOCATIONS = [
    {"name": "Medellín", "coords": [-75.5636, 6.2442]},
    {"name": "Cali", "coords": [-76.5225, 3.4516]},
    {"name": "Barranquilla", "coords": [-74.7813, 10.9639]},
    {"name": "Santa Marta", "coords": [-74.2198, 11.2408]},
    {"name": "Manizales", "coords": [-75.5144, 5.0703]},
    {"name": "Pereira", "coords": [-75.6967, 4.8133]},
    {"name": "Bucaramanga", "coords": [-73.1198, 7.1193]},
    {"name": "Ibagué", "coords": [-75.2322, 4.4389]},
    {"name": "Neiva", "coords": [-75.2819, 2.9273]},
    {"name": "Pasto", "coords": [-77.2811, 1.2136]}
]

# Listas para generar datos aleatorios
AUTHORS = [
    "Carlos Natura", "María Rodríguez", "José Marinero", "Ana Cafetera",
    "Miguel Montañero", "Laura Marketera", "Pedro Campesino", "Roberto Urbano",
    "Diana Aventurera", "Rafael Juglares", "Camila Sonidos", "Andrés Campo",
    "Sofía Verde", "Luis Urbano", "Patricia Océano", "Fernando Viento",
    "Isabella Lluvia", "Gabriel Montaña", "Valentina Río", "Sebastián Bosque"
]

SOUND_TYPES = [
    "naturaleza", "ciudad", "océano", "bosque", "lluvia", "viento",
    "pájaros", "agua", "tráfico", "multitud", "música", "industrial",
    "animales", "insectos"
]

EMOTIONS = [
    "relajante", "energético", "nostálgico", "misterioso", "alegre",
    "melancólico", "caótico", "peaceful", "inspirador", "romántico",
    "aventurero", "meditativo"
]

TAGS = [
    "biodiversidad", "contaminación acústica", "turismo", "relajación",
    "meditación", "estudio", "trabajo", "ejercicio", "dormir",
    "concentración", "creatividad", "bienestar", "naturaleza", "cultura"
]

def connect_to_mongodb():
    """Conectar a MongoDB Atlas"""
    try:
        client = MongoClient(Config.MONGODB_URI)
        db = client[Config.DATABASE_NAME]
        
        # Verificar conexión
        client.admin.command('ping')
        print("✅ Conexión exitosa a MongoDB Atlas")
        return db
    except Exception as e:
        print(f"❌ Error conectando a MongoDB: {e}")
        sys.exit(1)

def generate_random_sound():
    """Generar un sonido aleatorio"""
    location = random.choice(COLOMBIA_LOCATIONS)
    
    # Añadir algo de variación a las coordenadas
    lat = location["coords"][1] + random.uniform(-0.1, 0.1)
    lng = location["coords"][0] + random.uniform(-0.1, 0.1)
    
    sound = {
        "nombre": f"Sonidos de {location['name']} - {random.choice(['mañana', 'tarde', 'noche'])}",
        "descripcion": f"Ambiente sonoro capturado en {location['name']}",
        "autor": random.choice(AUTHORS),
        "ubicacion": {
            "type": "Point",
            "coordinates": [lng, lat]
        },
        "sonidos": random.sample(SOUND_TYPES, random.randint(1, 4)),
        "emociones": random.sample(EMOTIONS, random.randint(1, 3)),
        "etiquetas": random.sample(TAGS, random.randint(1, 5)),
        "audio_url": f"/example_audio/{location['name'].lower()}_sample.mp3",
        "fecha": datetime.now() - timedelta(days=random.randint(0, 365)),
        "duracion": random.randint(60, 600),
        "calidad_audio": random.choice(["baja", "media", "alta", "profesional"])
    }
    
    return sound

def insert_sample_data(db, num_additional=20):
    """Insertar datos de muestra en la base de datos"""
    try:
        collection = db.sonidos
        
        # Limpiar colección existente (opcional)
        print("🗑️  Limpiando datos existentes...")
        collection.delete_many({})
        
        # Insertar sonidos predefinidos
        print("📝 Insertando sonidos predefinidos...")
        for sound in SAMPLE_SOUNDS:
            sound["fecha"] = datetime.now() - timedelta(days=random.randint(0, 30))
            collection.insert_one(sound)
        
        print(f"✅ Insertados {len(SAMPLE_SOUNDS)} sonidos predefinidos")
        
        # Generar y insertar sonidos adicionales
        if num_additional > 0:
            print(f"🎲 Generando {num_additional} sonidos adicionales...")
            additional_sounds = [generate_random_sound() for _ in range(num_additional)]
            collection.insert_many(additional_sounds)
            print(f"✅ Insertados {num_additional} sonidos adicionales")
        
        # Crear índices
        print("📊 Creando índices...")
        collection.create_index([("ubicacion", "2dsphere")])
        collection.create_index("fecha")
        collection.create_index("emociones")
        collection.create_index("etiquetas")
        collection.create_index("autor")
        print("✅ Índices creados")
        
        # Mostrar estadísticas
        total_sounds = collection.count_documents({})
        unique_authors = len(collection.distinct("autor"))
        unique_emotions = len(collection.distinct("emociones"))
        
        print("\n📊 Estadísticas de la base de datos:")
        print(f"   • Total de sonidos: {total_sounds}")
        print(f"   • Autores únicos: {unique_authors}")
        print(f"   • Emociones únicas: {unique_emotions}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error insertando datos: {e}")
        return False

def main():
    """Función principal"""
    print("🎵 SoundScape Explorer - Generador de Datos de Prueba")
    print("=" * 55)
    
    # Conectar a la base de datos
    db = connect_to_mongodb()
    
    # Preguntar al usuario cuántos datos adicionales generar
    try:
        num_additional = input("\n¿Cuántos sonidos adicionales quieres generar? (por defecto 20): ")
        num_additional = int(num_additional) if num_additional.strip() else 20
    except ValueError:
        num_additional = 20
    
    # Confirmar acción
    total_sounds = len(SAMPLE_SOUNDS) + num_additional
    confirm = input(f"\n⚠️  Se insertarán {total_sounds} sonidos (esto limpiará datos existentes). ¿Continuar? (s/N): ")
    
    if confirm.lower() not in ['s', 'sí', 'si', 'y', 'yes']:
        print("❌ Operación cancelada")
        return
    
    # Insertar datos
    success = insert_sample_data(db, num_additional)
    
    if success:
        print("\n🎉 ¡Datos de prueba generados exitosamente!")
        print("   Puedes ahora iniciar tu aplicación y explorar los sonidos.")
        print("\n🚀 Comandos para iniciar:")
        print("   Backend: cd backend && python app.py")
        print("   Frontend: cd frontend && npm start")
    else:
        print("\n❌ Error generando datos de prueba")

if __name__ == "__main__":
    # Asegurarse de que el script se ejecute desde el directorio correcto
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    sys.path.append(os.path.join(parent_dir, 'backend'))
    
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Operación cancelada por el usuario")
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        sys.exit(1)