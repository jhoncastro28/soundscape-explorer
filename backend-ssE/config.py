import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # MongoDB Configuration
    MONGODB_URI = os.getenv('MONGODB_URI')
    DATABASE_NAME = os.getenv('DATABASE_NAME', 'soundscape')
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-local')
    DEBUG = os.getenv('FLASK_ENV') == 'development'
    
    # Upload Configuration
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 50000000))
    
    # CORS Configuration
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    
    # Audio Configuration
    ALLOWED_AUDIO_EXTENSIONS = os.getenv('ALLOWED_AUDIO_EXTENSIONS', 'mp3,wav,ogg,m4a').split(',')
    
    @staticmethod
    def validate_config():
        """Validar configuración requerida"""
        if not Config.MONGODB_URI:
            raise ValueError("MONGODB_URI es requerida. Configura tu archivo .env")
        
        return True

class DevelopmentConfig(Config):
    DEBUG = True
    # Configuraciones específicas para desarrollo local
    TESTING = False

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False

class TestingConfig(Config):
    TESTING = True
    DATABASE_NAME = 'soundscape_test'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}