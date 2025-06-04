from flask import Flask, send_from_directory
from flask_cors import CORS
from config import config
from utils.database import db_instance
from routes.sounds import sounds_bp
from routes.analytics import analytics_bp
import os

def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Configurar CORS
    CORS(app, origins=[app.config['FRONTEND_URL']])
    
    # Inicializar conexión a la base de datos
    with app.app_context():
        db_instance.connect()
    
    # Registrar blueprints
    app.register_blueprint(sounds_bp, url_prefix='/api')
    app.register_blueprint(analytics_bp, url_prefix='/api')
    
    # Ruta para servir archivos de audio
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
    # Ruta de health check
    @app.route('/api/health')
    def health_check():
        return {'status': 'OK', 'message': 'SoundScape Explorer API está funcionando'}
    
    # Manejo de errores
    @app.errorhandler(404)
    def not_found(error):
        return {'success': False, 'error': 'Endpoint no encontrado'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'success': False, 'error': 'Error interno del servidor'}, 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    # Crear directorio de uploads si no existe
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    print("🎵 SoundScape Explorer Backend iniciando...")
    print(f"🌍 Servidor corriendo en: http://localhost:5000")
    print(f"📂 Directorio de uploads: {app.config['UPLOAD_FOLDER']}")
    
    app.run(host='0.0.0.0', port=5000, debug=True)