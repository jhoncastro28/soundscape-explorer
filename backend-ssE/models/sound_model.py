from datetime import datetime
from bson import ObjectId
from utils.database import db_instance

class SoundModel:
    def __init__(self):
        self.collection = db_instance.get_collection('sonidos')
    
    def create_sound(self, sound_data):
        """Crear un nuevo sonido en la base de datos"""
        try:
            # Validar estructura de datos
            sound_document = {
                "nombre": sound_data.get('nombre'),
                "ubicacion": {
                    "type": "Point",
                    "coordinates": [
                        float(sound_data.get('longitud')),
                        float(sound_data.get('latitud'))
                    ]
                },
                "sonidos": sound_data.get('sonidos', []),
                "emociones": sound_data.get('emociones', []),
                "audio_url": sound_data.get('audio_url'),
                "autor": sound_data.get('autor'),
                "fecha": datetime.now(),
                "etiquetas": sound_data.get('etiquetas', []),
                "descripcion": sound_data.get('descripcion', ''),
                "duracion": sound_data.get('duracion', 0),
                "calidad_audio": sound_data.get('calidad_audio', 'media')
            }
            
            result = self.collection.insert_one(sound_document)
            return str(result.inserted_id)
            
        except Exception as e:
            print(f"Error creando sonido: {e}")
            raise e
    
    def get_sounds_by_location(self, lat, lng, radius_km=10):
        """Obtener sonidos cerca de una ubicación"""
        try:
            pipeline = [
                {
                    "$geoNear": {
                        "near": {
                            "type": "Point",
                            "coordinates": [float(lng), float(lat)]
                        },
                        "distanceField": "distancia",
                        "maxDistance": radius_km * 1000,  # Convertir a metros
                        "spherical": True
                    }
                },
                {
                    "$limit": 50
                }
            ]
            
            results = list(self.collection.aggregate(pipeline))
            return self._format_results(results)
            
        except Exception as e:
            print(f"Error obteniendo sonidos por ubicación: {e}")
            raise e
    
    def get_all_sounds(self, limit=100):
        """Obtener todos los sonidos con límite"""
        try:
            results = list(self.collection.find().limit(limit).sort("fecha", -1))
            return self._format_results(results)
            
        except Exception as e:
            print(f"Error obteniendo todos los sonidos: {e}")
            raise e
    
    def get_sound_by_id(self, sound_id):
        """Obtener un sonido por su ID"""
        try:
            result = self.collection.find_one({"_id": ObjectId(sound_id)})
            if result:
                return self._format_result(result)
            return None
            
        except Exception as e:
            print(f"Error obteniendo sonido por ID: {e}")
            raise e
    
    def update_sound(self, sound_id, update_data):
        """Actualizar un sonido"""
        try:
            # Remover campos que no deben actualizarse
            update_data.pop('_id', None)
            update_data.pop('fecha', None)
            
            result = self.collection.update_one(
                {"_id": ObjectId(sound_id)},
                {"$set": update_data}
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            print(f"Error actualizando sonido: {e}")
            raise e
    
    def add_tag_to_sound(self, sound_id, new_tag):
        """Añadir etiqueta a un sonido"""
        try:
            result = self.collection.update_one(
                {"_id": ObjectId(sound_id)},
                {"$addToSet": {"etiquetas": new_tag}}
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            print(f"Error añadiendo etiqueta: {e}")
            raise e
    
    def delete_sound(self, sound_id):
        """Eliminar un sonido"""
        try:
            result = self.collection.delete_one({"_id": ObjectId(sound_id)})
            return result.deleted_count > 0
            
        except Exception as e:
            print(f"Error eliminando sonido: {e}")
            raise e
    
    def get_emotion_patterns(self):
        """Obtener patrones emocionales usando agregaciones"""
        try:
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
            
            results = list(self.collection.aggregate(pipeline))
            return results
            
        except Exception as e:
            print(f"Error obteniendo patrones emocionales: {e}")
            raise e
    
    def get_sounds_by_emotion(self, emotion):
        """Obtener sonidos por emoción específica"""
        try:
            results = list(self.collection.find(
                {"emociones": {"$in": [emotion]}}
            ).limit(20))
            
            return self._format_results(results)
            
        except Exception as e:
            print(f"Error obteniendo sonidos por emoción: {e}")
            raise e
    
    def _format_result(self, result):
        """Formatear un resultado individual"""
        if result:
            result['_id'] = str(result['_id'])
            if 'fecha' in result:
                result['fecha'] = result['fecha'].isoformat()
        return result
    
    def _format_results(self, results):
        """Formatear lista de resultados"""
        formatted_results = []
        for result in results:
            formatted_results.append(self._format_result(result))
        return formatted_results