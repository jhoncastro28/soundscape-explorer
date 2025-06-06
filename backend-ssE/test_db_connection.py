"""
Script para probar la conexión a MongoDB Atlas
"""

import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient

def test_mongodb_connection():
    """Probar conexión a MongoDB Atlas"""
    
    # Cargar variables de entorno
    load_dotenv()
    
    MONGODB_URI = os.getenv('MONGODB_URI')
    DATABASE_NAME = os.getenv('DATABASE_NAME', 'soundscape')
    
    if not MONGODB_URI:
        print("❌ ERROR: MONGODB_URI no está configurada en el archivo .env")
        return False
    
    print("🔧 Configuración encontrada:")
    print(f"   • Base de datos: {DATABASE_NAME}")
    print(f"   • URI: {MONGODB_URI[:50]}...")
    
    try:
        print("\n🔗 Intentando conectar a MongoDB Atlas...")
        
        # Crear cliente MongoDB
        client = MongoClient(MONGODB_URI)
        
        # Probar conexión
        client.admin.command('ping')
        print("✅ Conexión exitosa a MongoDB Atlas")
        
        # Obtener información de la base de datos
        db = client[DATABASE_NAME]
        collections = db.list_collection_names()
        
        print(f"\n📊 Información de la base de datos '{DATABASE_NAME}':")
        print(f"   • Colecciones existentes: {len(collections)}")
        
        if collections:
            print(f"   • Nombres: {', '.join(collections)}")
            
            # Si existe la colección de sonidos, mostrar estadísticas
            if 'sonidos' in collections:
                sounds_count = db.sonidos.count_documents({})
                print(f"   • Total de sonidos: {sounds_count}")
        else:
            print("   • La base de datos está vacía (esto es normal para una instalación nueva)")
        
        # Probar operación geoespacial básica
        print("\n🗺️ Probando operaciones geoespaciales...")
        test_collection = db.test_geo
        
        # Insertar un documento de prueba
        test_doc = {
            "name": "test_point",
            "location": {
                "type": "Point",
                "coordinates": [-74.0721, 4.7110]  # Bogotá
            }
        }
        
        # Crear índice geoespacial
        test_collection.create_index([("location", "2dsphere")])
        
        # Insertar y buscar
        result = test_collection.insert_one(test_doc)
        
        # Buscar puntos cerca de Bogotá
        near_query = {
            "location": {
                "$near": {
                    "$geometry": {
                        "type": "Point",
                        "coordinates": [-74.0721, 4.7110]
                    },
                    "$maxDistance": 1000  # 1km
                }
            }
        }
        
        found = test_collection.find_one(near_query)
        
        if found:
            print("✅ Operaciones geoespaciales funcionando correctamente")
        else:
            print("⚠️ Problema con operaciones geoespaciales")
        
        # Limpiar datos de prueba
        test_collection.drop()
        
        print("\n🎉 ¡Todas las pruebas pasaron exitosamente!")
        print("📝 Tu configuración de MongoDB Atlas está lista para usar")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error de conexión: {e}")
        print("\n🔧 Posibles soluciones:")
        print("   1. Verifica que la URI de MongoDB Atlas sea correcta")
        print("   2. Asegúrate de que tu IP esté en la whitelist de MongoDB Atlas")
        print("   3. Verifica tus credenciales de MongoDB Atlas")
        print("   4. Comprueba tu conexión a internet")
        
        return False

if __name__ == "__main__":
    print("🎵 SoundScape Explorer - Test de Conexión MongoDB")
    print("=" * 50)
    
    # Cambiar al directorio del backend
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(script_dir, 'backend-ssE')
    
    if os.path.exists(backend_dir):
        os.chdir(backend_dir)
        print(f"📂 Cambiando al directorio: {backend_dir}")
    else:
        print("⚠️ Ejecutando desde el directorio actual")
    
    success = test_mongodb_connection()
    
    if success:
        print("\n✅ ¡Listo para continuar con la instalación!")
        sys.exit(0)
    else:
        print("\n❌ Resuelve los problemas de conexión antes de continuar")
        sys.exit(1)