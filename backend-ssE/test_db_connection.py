"""
Script para probar la conexión a MongoDB Atlas
Incluye múltiples métodos de conexión para resolver problemas de SSL
"""

import os
import sys
import ssl
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ConfigurationError

# Cargar variables de entorno
load_dotenv()

def test_connection_method_1():
    """Método 1: Conexión estándar con SSL configurado"""
    print("🔧 Método 1: Conexión estándar con SSL...")
    
    try:
        MONGODB_URI = os.getenv('MONGODB_URI')
        client = MongoClient(MONGODB_URI)
        
        # Probar conexión
        client.admin.command('ping')
        print("✅ Método 1: EXITOSO")
        return client
    except Exception as e:
        print(f"❌ Método 1 falló: {str(e)[:100]}...")
        return None

def test_connection_method_2():
    """Método 2: Conexión con SSL deshabilitado"""
    print("🔧 Método 2: Conexión con SSL deshabilitado...")
    
    try:
        # URI sin SSL estricto
        uri = "mongodb+srv://jhoncastro07:QmeMVwQai3EhQszF@soundscape-cluster.ss1nk4g.mongodb.net/soundscape?retryWrites=true&w=majority&ssl=true&ssl_cert_reqs=CERT_NONE"
        
        client = MongoClient(
            uri,
            ssl=True,
            ssl_cert_reqs=ssl.CERT_NONE,
            connect=False,
            serverSelectionTimeoutMS=5000
        )
        
        # Probar conexión
        client.admin.command('ping')
        print("✅ Método 2: EXITOSO")
        return client
    except Exception as e:
        print(f"❌ Método 2 falló: {str(e)[:100]}...")
        return None

def test_connection_method_3():
    """Método 3: Conexión con configuración TLS explícita"""
    print("🔧 Método 3: Conexión con configuración TLS explícita...")
    
    try:
        client = MongoClient(
            "mongodb+srv://jhoncastro07:QmeMVwQai3EhQszF@soundscape-cluster.ss1nk4g.mongodb.net/",
            tls=True,
            tlsAllowInvalidCertificates=True,
            connect=False,
            serverSelectionTimeoutMS=5000
        )
        
        # Probar conexión
        client.admin.command('ping')
        print("✅ Método 3: EXITOSO")
        return client
    except Exception as e:
        print(f"❌ Método 3 falló: {str(e)[:100]}...")
        return None

def test_database_operations(client):
    """Probar operaciones básicas de base de datos"""
    if not client:
        return False
    
    try:
        print("\n📊 Probando operaciones de base de datos...")
        
        db = client['soundscape']
        collection = db['sonidos']
        
        # Verificar colecciones existentes
        collections = db.list_collection_names()
        print(f"   • Colecciones disponibles: {collections}")
        
        # Contar documentos
        count = collection.count_documents({})
        print(f"   • Documentos en 'sonidos': {count}")
        
        # Probar inserción de documento de prueba
        test_doc = {
            "test": True,
            "nombre": "Documento de prueba",
            "ubicacion": {
                "type": "Point",
                "coordinates": [-74.0721, 4.7110]
            }
        }
        
        result = collection.insert_one(test_doc)
        print(f"   • Inserción exitosa: {result.inserted_id}")
        
        # Eliminar documento de prueba
        collection.delete_one({"_id": result.inserted_id})
        print("   • Documento de prueba eliminado")
        
        # Probar índice geoespacial
        try:
            collection.create_index([("ubicacion", "2dsphere")])
            print("   • Índice geoespacial verificado")
        except Exception as e:
            print(f"   • Advertencia con índice: {str(e)[:50]}...")
        
        print("✅ Todas las operaciones de base de datos exitosas")
        return True
        
    except Exception as e:
        print(f"❌ Error en operaciones de base de datos: {e}")
        return False

def fix_connection_issues():
    """Intentar resolver problemas comunes de conexión"""
    print("\n🔧 Intentando resolver problemas de conexión...")
    
    # Verificar variables de entorno
    mongodb_uri = os.getenv('MONGODB_URI')
    if not mongodb_uri:
        print("❌ Variable MONGODB_URI no encontrada en .env")
        return False
    
    print(f"   • URI encontrada: {mongodb_uri[:50]}...")
    
    # Verificar conectividad básica
    try:
        import socket
        socket.create_connection(("soundscape-cluster.ss1nk4g.mongodb.net", 27017), timeout=10)
        print("   • Conectividad de red: OK")
    except Exception as e:
        print(f"   • Problema de red: {str(e)[:50]}...")
    
    return True

def main():
    print("🎵 SoundScape Explorer - Diagnóstico de Conexión MongoDB")
    print("=" * 60)
    
    # Verificar archivo .env
    if not os.path.exists('.env'):
        print("❌ Archivo .env no encontrado")
        print("   Crea el archivo .env con la configuración de MongoDB")
        return
    
    print("✅ Archivo .env encontrado")
    
    # Intentar resolver problemas
    fix_connection_issues()
    
    # Probar diferentes métodos de conexión
    print("\n🔍 Probando diferentes métodos de conexión...")
    
    client = None
    
    # Probar cada método
    for test_method in [test_connection_method_1, test_connection_method_2, test_connection_method_3]:
        client = test_method()
        if client:
            break
    
    if client:
        print(f"\n🎉 ¡Conexión exitosa!")
        
        # Probar operaciones de base de datos
        if test_database_operations(client):
            print("\n✅ ¡Todo funcionando correctamente!")
            print("\n📝 Próximos pasos:")
            print("   1. Ejecutar: python setup_database.py (para datos de prueba)")
            print("   2. Iniciar backend: python app.py")
            print("   3. Iniciar frontend: npm start")
        else:
            print("\n⚠️ Conexión exitosa pero problemas con operaciones")
        
        client.close()
    else:
        print("\n❌ No se pudo establecer conexión con ningún método")
        print("\n🔧 Posibles soluciones:")
        print("   1. Verificar credenciales en MongoDB Atlas")
        print("   2. Añadir tu IP a la whitelist de MongoDB Atlas")
        print("   3. Verificar que el cluster esté activo")
        print("   4. Intentar cambiar la contraseña en MongoDB Atlas")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Operación cancelada por el usuario")
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        import traceback
        traceback.print_exc()