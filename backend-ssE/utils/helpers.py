"""
Funciones auxiliares para SoundScape Explorer Backend
"""

import os
import hashlib
import mimetypes
from datetime import datetime
from werkzeug.utils import secure_filename

def validate_audio_file(file, allowed_extensions, max_size_mb=50):
    """
    Validar archivo de audio subido
    
    Args:
        file: Archivo de Flask request.files
        allowed_extensions: Lista de extensiones permitidas
        max_size_mb: Tamaño máximo en MB
    
    Returns:
        dict: {is_valid: bool, error: str}
    """
    if not file or file.filename == '':
        return {"is_valid": False, "error": "No se seleccionó archivo"}
    
    # Validar extensión
    filename = secure_filename(file.filename)
    extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    
    if extension not in allowed_extensions:
        return {
            "is_valid": False, 
            "error": f"Formato no permitido. Use: {', '.join(allowed_extensions)}"
        }
    
    # Validar tamaño (aproximado, el tamaño real se verifica en Flask)
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)  # Regresar al inicio
    
    max_size_bytes = max_size_mb * 1024 * 1024
    if file_size > max_size_bytes:
        return {
            "is_valid": False,
            "error": f"Archivo demasiado grande. Máximo: {max_size_mb}MB"
        }
    
    # Validar tipo MIME básico
    mime_type, _ = mimetypes.guess_type(filename)
    if mime_type and not mime_type.startswith('audio/'):
        return {
            "is_valid": False,
            "error": "El archivo no parece ser un archivo de audio válido"
        }
    
    return {"is_valid": True, "error": None}

def generate_unique_filename(original_filename, prefix="sound"):
    """
    Generar nombre único para archivo
    
    Args:
        original_filename: Nombre original del archivo
        prefix: Prefijo para el nombre
    
    Returns:
        str: Nombre único del archivo
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    secure_name = secure_filename(original_filename)
    name, ext = os.path.splitext(secure_name)
    
    # Crear hash único corto
    unique_hash = hashlib.md5(f"{timestamp}_{name}".encode()).hexdigest()[:8]
    
    return f"{prefix}_{timestamp}_{unique_hash}{ext}"

def format_file_size(bytes_size):
    """
    Formatear tamaño de archivo en formato legible
    
    Args:
        bytes_size: Tamaño en bytes
    
    Returns:
        str: Tamaño formateado (ej: "2.5 MB")
    """
    if bytes_size == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB"]
    size_index = 0
    size = float(bytes_size)
    
    while size >= 1024.0 and size_index < len(size_names) - 1:
        size /= 1024.0
        size_index += 1
    
    return f"{size:.1f} {size_names[size_index]}"

def validate_coordinates(lat, lng):
    """
    Validar coordenadas geográficas
    
    Args:
        lat: Latitud
        lng: Longitud
    
    Returns:
        bool: True si son válidas
    """
    try:
        lat = float(lat)
        lng = float(lng)
        return -90 <= lat <= 90 and -180 <= lng <= 180
    except (ValueError, TypeError):
        return False

def sanitize_mongo_query(query_dict):
    """
    Limpiar parámetros de consulta para MongoDB
    
    Args:
        query_dict: Diccionario de parámetros
    
    Returns:
        dict: Parámetros limpiados
    """
    sanitized = {}
    
    for key, value in query_dict.items():
        if value is not None and value != '':
            # Limpiar strings
            if isinstance(value, str):
                sanitized[key] = value.strip()
            # Validar números
            elif isinstance(value, (int, float)):
                sanitized[key] = value
            # Manejar listas
            elif isinstance(value, list):
                sanitized[key] = [v for v in value if v is not None and v != '']
    
    return sanitized

def create_response(success=True, data=None, error=None, message=None):
    """
    Crear respuesta estándar de API
    
    Args:
        success: Bool indicando éxito
        data: Datos de respuesta
        error: Mensaje de error
        message: Mensaje adicional
    
    Returns:
        dict: Respuesta formateada
    """
    response = {"success": success}
    
    if data is not None:
        response["data"] = data
    
    if error:
        response["error"] = error
    
    if message:
        response["message"] = message
    
    # Agregar timestamp
    response["timestamp"] = datetime.now().isoformat()
    
    return response

def paginate_results(results, page=1, page_size=20):
    """
    Paginar resultados
    
    Args:
        results: Lista de resultados
        page: Número de página (inicia en 1)
        page_size: Tamaño de página
    
    Returns:
        dict: Resultados paginados con metadatos
    """
    total = len(results)
    start = (page - 1) * page_size
    end = start + page_size
    
    paginated_data = results[start:end]
    
    return {
        "data": paginated_data,
        "pagination": {
            "current_page": page,
            "page_size": page_size,
            "total_items": total,
            "total_pages": (total + page_size - 1) // page_size,
            "has_next": end < total,
            "has_previous": page > 1
        }
    }

def log_api_request(endpoint, method, params=None, user_ip=None):
    """
    Log básico de requests de API (para desarrollo)
    
    Args:
        endpoint: Endpoint solicitado
        method: Método HTTP
        params: Parámetros de la request
        user_ip: IP del usuario
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_message = f"[{timestamp}] {method} {endpoint}"
    
    if params:
        log_message += f" - Params: {params}"
    
    if user_ip:
        log_message += f" - IP: {user_ip}"
    
    print(log_message)  # En desarrollo, usar print. En producción, usar logging

def calculate_distance_km(lat1, lng1, lat2, lng2):
    """
    Calcular distancia entre dos puntos geográficos (fórmula Haversine)
    
    Args:
        lat1, lng1: Coordenadas del primer punto
        lat2, lng2: Coordenadas del segundo punto
    
    Returns:
        float: Distancia en kilómetros
    """
    import math
    
    # Convertir a radianes
    lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
    
    # Diferencias
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    
    # Fórmula Haversine
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radio de la Tierra en km
    r = 6371
    
    return c * r