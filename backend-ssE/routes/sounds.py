from flask import Blueprint, request, jsonify, current_app
import os
from werkzeug.utils import secure_filename
from models.sound_model import SoundModel
import uuid

sounds_bp = Blueprint('sounds', __name__)
sound_model = SoundModel()

def allowed_file(filename):
    """Verificar si el archivo tiene una extensión permitida"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_AUDIO_EXTENSIONS']

@sounds_bp.route('/sounds', methods=['GET'])
def get_sounds():
    """Obtener sonidos con filtros opcionales"""
    try:
        # Parámetros de consulta
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        radius = request.args.get('radius', 10, type=int)
        emotion = request.args.get('emotion')
        limit = request.args.get('limit', 100, type=int)
        
        if lat and lng:
            # Buscar por ubicación
            sounds = sound_model.get_sounds_by_location(lat, lng, radius)
        elif emotion:
            # Buscar por emoción
            sounds = sound_model.get_sounds_by_emotion(emotion)
        else:
            # Obtener todos los sonidos
            sounds = sound_model.get_all_sounds(limit)
        
        return jsonify({
            'success': True,
            'data': sounds,
            'count': len(sounds)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@sounds_bp.route('/sounds/<sound_id>', methods=['GET'])
def get_sound(sound_id):
    """Obtener un sonido específico por ID"""
    try:
        sound = sound_model.get_sound_by_id(sound_id)
        
        if not sound:
            return jsonify({
                'success': False,
                'error': 'Sonido no encontrado'
            }), 404
        
        return jsonify({
            'success': True,
            'data': sound
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@sounds_bp.route('/sounds', methods=['POST'])
def create_sound():
    """Crear un nuevo sonido"""
    try:
        # Verificar si hay un archivo de audio
        if 'audio' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No se proporcionó archivo de audio'
            }), 400
        
        file = request.files['audio']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No se seleccionó archivo'
            }), 400
        
        if file and allowed_file(file.filename):
            # Generar nombre único para el archivo
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            
            # Crear directorio de uploads si no existe
            os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
            
            # Guardar archivo
            file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(file_path)
            
            # Crear URL del archivo
            audio_url = f"/uploads/{unique_filename}"
            
            # Obtener datos del formulario
            sound_data = {
                'nombre': request.form.get('nombre'),
                'latitud': request.form.get('latitud'),
                'longitud': request.form.get('longitud'),
                'sonidos': request.form.getlist('sonidos'),
                'emociones': request.form.getlist('emociones'),
                'etiquetas': request.form.getlist('etiquetas'),
                'descripcion': request.form.get('descripcion', ''),
                'autor': request.form.get('autor'),
                'audio_url': audio_url,
                'duracion': request.form.get('duracion', 0, type=int),
                'calidad_audio': request.form.get('calidad_audio', 'media')
            }
            
            # Validar datos requeridos
            if not all([sound_data['nombre'], sound_data['latitud'], sound_data['longitud']]):
                return jsonify({
                    'success': False,
                    'error': 'Faltan datos requeridos: nombre, latitud, longitud'
                }), 400
            
            # Crear sonido en la base de datos
            sound_id = sound_model.create_sound(sound_data)
            
            return jsonify({
                'success': True,
                'data': {
                    'id': sound_id,
                    'message': 'Sonido creado exitosamente'
                }
            }), 201
        
        else:
            return jsonify({
                'success': False,
                'error': 'Tipo de archivo no permitido'
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@sounds_bp.route('/sounds/<sound_id>', methods=['PUT'])
def update_sound(sound_id):
    """Actualizar un sonido"""
    try:
        update_data = request.json
        
        if not update_data:
            return jsonify({
                'success': False,
                'error': 'No se proporcionaron datos para actualizar'
            }), 400
        
        success = sound_model.update_sound(sound_id, update_data)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Sonido actualizado exitosamente'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'No se pudo actualizar el sonido'
            }), 404
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@sounds_bp.route('/sounds/<sound_id>/tags', methods=['POST'])
def add_tag(sound_id):
    """Añadir etiqueta a un sonido"""
    try:
        data = request.json
        new_tag = data.get('tag')
        
        if not new_tag:
            return jsonify({
                'success': False,
                'error': 'Se debe proporcionar una etiqueta'
            }), 400
        
        success = sound_model.add_tag_to_sound(sound_id, new_tag)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Etiqueta añadida exitosamente'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'No se pudo añadir la etiqueta'
            }), 404
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@sounds_bp.route('/sounds/<sound_id>', methods=['DELETE'])
def delete_sound(sound_id):
    """Eliminar un sonido"""
    try:
        # Obtener información del sonido antes de eliminarlo
        sound = sound_model.get_sound_by_id(sound_id)
        
        if not sound:
            return jsonify({
                'success': False,
                'error': 'Sonido no encontrado'
            }), 404
        
        # Eliminar archivo de audio si existe
        if sound.get('audio_url'):
            file_path = os.path.join(
                current_app.config['UPLOAD_FOLDER'],
                os.path.basename(sound['audio_url'])
            )
            if os.path.exists(file_path):
                os.remove(file_path)
        
        # Eliminar de la base de datos
        success = sound_model.delete_sound(sound_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Sonido eliminado exitosamente'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'No se pudo eliminar el sonido'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500