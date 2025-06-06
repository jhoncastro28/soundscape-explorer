from pymongo import MongoClient, GEOSPHERE
from config import Config
import logging

class Database:
    def __init__(self):
        self.client = None
        self.db = None
        
    def connect(self):
        try:
            self.client = MongoClient(Config.MONGODB_URI)
            self.db = self.client[Config.DATABASE_NAME]
            
            # Crear índices geoespaciales
            self.create_indexes()
            
            # Verificar conexión
            self.client.admin.command('ping')
            print("Conexión exitosa a MongoDB Atlas")
            
        except Exception as e:
            print(f"Error conectando a MongoDB: {e}")
            raise e
    
    def create_indexes(self):
        """Crear índices necesarios para la aplicación"""
        try:
            # Índice geoespacial para ubicación
            self.db.sonidos.create_index([("ubicacion", GEOSPHERE)])
            
            # Índices adicionales para consultas frecuentes
            self.db.sonidos.create_index("fecha")
            self.db.sonidos.create_index("emociones")
            self.db.sonidos.create_index("etiquetas")
            self.db.sonidos.create_index("autor")
            
            print("Índices creados exitosamente")
            
        except Exception as e:
            print(f"Error creando índices: {e}")
    
    def get_collection(self, collection_name):
        """Obtener una colección de la base de datos"""
        if self.db is None:
            self.connect()
        return self.db[collection_name]
    
    def close_connection(self):
        """Cerrar conexión a la base de datos"""
        if self.client:
            self.client.close()

# Instancia global de la base de datos
db_instance = Database()