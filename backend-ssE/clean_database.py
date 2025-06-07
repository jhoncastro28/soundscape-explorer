"""
Script para limpiar completamente la base de datos de SoundScape Explorer
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'soundscape')

def clean_database():
    """Limpiar completamente la base de datos"""
    try:
        print("🧹 Limpiando base de datos de SoundScape Explorer")
        print("=" * 50)
        
        # Conectar a MongoDB
        client = MongoClient(MONGODB_URI)
        db = client[DATABASE_NAME]
        
        # Verificar conexión
        client.admin.command('ping')
        print("✅ Conectado a MongoDB Atlas")
        
        # Obtener todas las colecciones
        collections = db.list_collection_names()
        print(f"📋 Colecciones encontradas: {collections}")
        
        total_deleted = 0
        
        # Limpiar cada colección
        for collection_name in collections:
            collection = db[collection_name]
            count_before = collection.count_documents({})
            
            if count_before > 0:
                print(f"\n🗑️ Limpiando colección '{collection_name}'...")
                print(f"   Documentos antes: {count_before}")
                
                result = collection.delete_many({})
                deleted_count = result.deleted_count
                total_deleted += deleted_count
                
                print(f"   ✅ Eliminados: {deleted_count} documentos")
                
                # Verificar que esté vacía
                count_after = collection.count_documents({})
                if count_after == 0:
                    print(f"   ✅ Colección limpiada correctamente")
                else:
                    print(f"   ⚠️ Quedan {count_after} documentos")
            else:
                print(f"✅ Colección '{collection_name}' ya está vacía")
        
        print(f"\n📊 RESUMEN:")
        print(f"   Total documentos eliminados: {total_deleted}")
        print(f"   Colecciones procesadas: {len(collections)}")
        
        # Verificar que todo esté limpio
        print(f"\n🔍 Verificación final:")
        for collection_name in collections:
            count = db[collection_name].count_documents({})
            status = "✅ Vacía" if count == 0 else f"⚠️ {count} documentos"
            print(f"   {collection_name}: {status}")
        
        client.close()
        
        print(f"\n🎉 Base de datos limpiada exitosamente!")
        return True
        
    except Exception as e:
        print(f"❌ Error limpiando base de datos: {e}")
        return False

def show_current_data():
    """Mostrar datos actuales antes de limpiar"""
    try:
        client = MongoClient(MONGODB_URI)
        db = client[DATABASE_NAME]
        
        print("📊 DATOS ACTUALES EN LA BASE DE DATOS:")
        print("=" * 40)
        
        collections = db.list_collection_names()
        
        for collection_name in collections:
            collection = db[collection_name]
            count = collection.count_documents({})
            
            print(f"\n📁 Colección: {collection_name}")
            print(f"   📊 Documentos: {count}")
            
            if count > 0 and count <= 10:
                # Mostrar algunos documentos si no son muchos
                print("   📄 Documentos:")
                for i, doc in enumerate(collection.find().limit(5)):
                    doc_info = f"      {i+1}. "
                    if 'nombre' in doc:
                        doc_info += f"Nombre: {doc['nombre']}"
                    elif 'title' in doc:
                        doc_info += f"Title: {doc['title']}"
                    else:
                        doc_info += f"ID: {str(doc.get('_id', 'Sin ID'))[:10]}..."
                    
                    if 'autor' in doc:
                        doc_info += f" | Autor: {doc['autor']}"
                    
                    print(doc_info)
                
                if count > 5:
                    print(f"      ... y {count - 5} más")
        
        client.close()
        
    except Exception as e:
        print(f"❌ Error mostrando datos: {e}")

def main():
    """Función principal"""
    print("🧹 SoundScape Explorer - Limpiador de Base de Datos")
    print("=" * 55)
    
    # Mostrar datos actuales
    show_current_data()
    
    print(f"\n⚠️ ADVERTENCIA:")
    print(f"   Esta operación eliminará TODOS los datos de la base de datos")
    print(f"   Esta acción NO se puede deshacer")
    
    # Doble confirmación
    confirm1 = input(f"\n¿Estás seguro de que quieres limpiar la base de datos? (sí/no): ")
    if confirm1.lower() not in ['sí', 'si', 'yes']:
        print("❌ Operación cancelada")
        return
    
    confirm2 = input(f"Escribe 'ELIMINAR' para confirmar: ")
    if confirm2 != 'ELIMINAR':
        print("❌ Confirmación incorrecta. Operación cancelada")
        return
    
    # Ejecutar limpieza
    success = clean_database()
    
    if success:
        print(f"\n✅ ¡Base de datos limpiada exitosamente!")
        print(f"\n🚀 Próximos pasos:")
        print(f"   1. Ejecuta: python generate_test_audio.py")
        print(f"   2. Ejecuta: python create_real_test_data.py")
        print(f"   3. Inicia el backend: python app.py")
        print(f"   4. Inicia el frontend: npm start")
    else:
        print(f"\n❌ Error limpiando la base de datos")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n❌ Operación cancelada por el usuario")
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        import traceback
        traceback.print_exc()