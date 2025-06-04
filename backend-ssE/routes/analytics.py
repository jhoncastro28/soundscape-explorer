from flask import Blueprint, jsonify, request
from models.sound_model import SoundModel
from utils.database import db_instance

analytics_bp = Blueprint('analytics', __name__)
sound_model = SoundModel()

@analytics_bp.route('/analytics/emotions', methods=['GET'])
def get_emotion_patterns():
    """Obtener patrones emocionales de los sonidos"""
    try:
        patterns = sound_model.get_emotion_patterns()
        
        return jsonify({
            'success': True,
            'data': patterns
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@analytics_bp.route('/analytics/locations', methods=['GET'])
def get_location_stats():
    """Obtener estadísticas por ubicación"""
    try:
        collection = db_instance.get_collection('sonidos')
        
        pipeline = [
            {
                "$group": {
                    "_id": {
                        "lat": {"$round": [{"$arrayElemAt": ["$ubicacion.coordinates", 1]}, 1]},
                        "lng": {"$round": [{"$arrayElemAt": ["$ubicacion.coordinates", 0]}, 1]}
                    },
                    "count": {"$sum": 1},
                    "emociones_comunes": {"$push": "$emociones"},
                    "nombres": {"$push": "$nombre"}
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "count": 1,
                    "emociones_comunes": {
                        "$reduce": {
                            "input": "$emociones_comunes",
                            "initialValue": [],
                            "in": {"$concatArrays": ["$$value", "$$this"]}
                        }
                    },
                    "nombres": {"$slice": ["$nombres", 3]}
                }
            },
            {"$sort": {"count": -1}},
            {"$limit": 20}
        ]
        
        results = list(collection.aggregate(pipeline))
        
        return jsonify({
            'success': True,
            'data': results
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@analytics_bp.route('/analytics/tags', methods=['GET'])
def get_tag_stats():
    """Obtener estadísticas de etiquetas"""
    try:
        collection = db_instance.get_collection('sonidos')
        
        pipeline = [
            {"$unwind": "$etiquetas"},
            {
                "$group": {
                    "_id": "$etiquetas",
                    "count": {"$sum": 1},
                    "sonidos": {"$push": "$nombre"}
                }
            },
            {"$sort": {"count": -1}},
            {"$limit": 15}
        ]
        
        results = list(collection.aggregate(pipeline))
        
        return jsonify({
            'success': True,
            'data': results
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@analytics_bp.route('/analytics/timeline', methods=['GET'])
def get_timeline_stats():
    """Obtener estadísticas temporales"""
    try:
        collection = db_instance.get_collection('sonidos')
        
        pipeline = [
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$fecha"},
                        "month": {"$month": "$fecha"},
                        "day": {"$dayOfMonth": "$fecha"}
                    },
                    "count": {"$sum": 1},
                    "emociones": {"$push": "$emociones"}
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "count": 1,
                    "fecha": {
                        "$dateFromParts": {
                            "year": "$_id.year",
                            "month": "$_id.month",
                            "day": "$_id.day"
                        }
                    },
                    "emociones_planas": {
                        "$reduce": {
                            "input": "$emociones",
                            "initialValue": [],
                            "in": {"$concatArrays": ["$$value", "$$this"]}
                        }
                    }
                }
            },
            {"$sort": {"fecha": -1}},
            {"$limit": 30}
        ]
        
        results = list(collection.aggregate(pipeline))
        
        return jsonify({
            'success': True,
            'data': results
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@analytics_bp.route('/analytics/search', methods=['GET'])
def search_sounds():
    """Búsqueda avanzada de sonidos"""
    try:
        collection = db_instance.get_collection('sonidos')
        
        # Parámetros de búsqueda
        query = request.args.get('q', '')
        emotion = request.args.get('emotion')
        tag = request.args.get('tag')
        author = request.args.get('author')
        
        # Construir filtro de búsqueda
        search_filter = {}
        
        if query:
            search_filter["$or"] = [
                {"nombre": {"$regex": query, "$options": "i"}},
                {"descripcion": {"$regex": query, "$options": "i"}},
                {"etiquetas": {"$regex": query, "$options": "i"}}
            ]
        
        if emotion:
            search_filter["emociones"] = {"$in": [emotion]}
        
        if tag:
            search_filter["etiquetas"] = {"$in": [tag]}
        
        if author:
            search_filter["autor"] = {"$regex": author, "$options": "i"}
        
        # Ejecutar búsqueda
        results = list(collection.find(search_filter).limit(50).sort("fecha", -1))
        
        # Formatear resultados
        formatted_results = []
        for result in results:
            result['_id'] = str(result['_id'])
            if 'fecha' in result:
                result['fecha'] = result['fecha'].isoformat()
            formatted_results.append(result)
        
        return jsonify({
            'success': True,
            'data': formatted_results,
            'count': len(formatted_results)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@analytics_bp.route('/analytics/recommendations/<sound_id>', methods=['GET'])
def get_recommendations(sound_id):
    """Obtener recomendaciones basadas en un sonido"""
    try:
        # Obtener el sonido de referencia
        reference_sound = sound_model.get_sound_by_id(sound_id)
        
        if not reference_sound:
            return jsonify({
                'success': False,
                'error': 'Sonido de referencia no encontrado'
            }), 404
        
        collection = db_instance.get_collection('sonidos')
        
        # Buscar sonidos similares basados en emociones y etiquetas
        pipeline = [
            {
                "$match": {
                    "_id": {"$ne": sound_id},
                    "$or": [
                        {"emociones": {"$in": reference_sound.get('emociones', [])}},
                        {"etiquetas": {"$in": reference_sound.get('etiquetas', [])}}
                    ]
                }
            },
            {
                "$addFields": {
                    "similarity_score": {
                        "$add": [
                            {"$size": {"$setIntersection": ["$emociones", reference_sound.get('emociones', [])]}},
                            {"$size": {"$setIntersection": ["$etiquetas", reference_sound.get('etiquetas', [])]}}
                        ]
                    }
                }
            },
            {"$sort": {"similarity_score": -1}},
            {"$limit": 10}
        ]
        
        results = list(collection.aggregate(pipeline))
        
        # Formatear resultados
        formatted_results = []
        for result in results:
            result['_id'] = str(result['_id'])
            if 'fecha' in result:
                result['fecha'] = result['fecha'].isoformat()
            formatted_results.append(result)
        
        return jsonify({
            'success': True,
            'data': formatted_results,
            'reference': reference_sound
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500