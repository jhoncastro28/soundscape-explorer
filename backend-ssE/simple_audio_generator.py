"""
Generador de archivos de audio simple - Compatible con Python 3.13
Usa solo numpy y wave (librerías estándar)
"""

import os
import wave
import math
import numpy as np

def create_sine_wave(frequency, duration, sample_rate=44100, amplitude=0.3):
    """Crear una onda sinusoidal"""
    frames = int(duration * sample_rate)
    arr = np.sin(2 * np.pi * frequency * np.linspace(0, duration, frames))
    arr = (arr * amplitude * 32767).astype(np.int16)
    return arr

def create_noise(duration, sample_rate=44100, amplitude=0.1):
    """Crear ruido blanco suave"""
    frames = int(duration * sample_rate)
    arr = np.random.normal(0, amplitude, frames)
    arr = (arr * 32767).astype(np.int16)
    return arr

def apply_fade(audio_data, fade_duration, sample_rate=44100):
    """Aplicar fade in y fade out"""
    fade_frames = int(fade_duration * sample_rate)
    
    # Fade in
    for i in range(min(fade_frames, len(audio_data))):
        audio_data[i] = int(audio_data[i] * (i / fade_frames))
    
    # Fade out
    for i in range(min(fade_frames, len(audio_data))):
        idx = len(audio_data) - 1 - i
        audio_data[idx] = int(audio_data[idx] * (i / fade_frames))
    
    return audio_data

def save_wav_file(audio_data, filename, sample_rate=44100):
    """Guardar audio como archivo WAV"""
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 2 bytes = 16 bit
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_data.tobytes())

def create_test_audio_files():
    """Crear archivos de audio de prueba usando numpy y wave"""
    
    uploads_dir = "uploads"
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)
        print(f"📁 Directorio {uploads_dir} creado")
    
    print("🎵 Generando archivos de audio de prueba...")
    
    # 1. Tono simple (440Hz)
    print("🔊 Creando tono de prueba (440Hz)...")
    tone_data = create_sine_wave(440, 3.0)  # 440Hz por 3 segundos
    tone_data = apply_fade(tone_data, 0.5)  # Fade de 0.5 segundos
    save_wav_file(tone_data, os.path.join(uploads_dir, "test_tone.wav"))
    print("✅ test_tone.wav creado")
    
    # 2. Ruido blanco suave (ambiente)
    print("🌊 Creando ruido ambiente...")
    noise_data = create_noise(5.0, amplitude=0.08)  # 5 segundos de ruido suave
    noise_data = apply_fade(noise_data, 1.0)  # Fade de 1 segundo
    save_wav_file(noise_data, os.path.join(uploads_dir, "test_ambient.wav"))
    print("✅ test_ambient.wav creado")
    
    # 3. Acorde simple (simulando ciudad)
    print("🏙️ Creando sonido de ciudad simulado...")
    city_duration = 4.0
    low_freq = create_sine_wave(80, city_duration, amplitude=0.1)    # Bajo
    mid_freq = create_sine_wave(220, city_duration, amplitude=0.08)  # Medio
    high_freq = create_sine_wave(660, city_duration, amplitude=0.05) # Alto
    
    # Combinar frecuencias
    city_sound = (low_freq.astype(np.int32) + mid_freq.astype(np.int32) + high_freq.astype(np.int32))
    city_sound = np.clip(city_sound, -32767, 32767).astype(np.int16)
    city_sound = apply_fade(city_sound, 0.8)
    save_wav_file(city_sound, os.path.join(uploads_dir, "test_city.wav"))
    print("✅ test_city.wav creado")
    
    # 4. Sonido de naturaleza (frecuencias variables)
    print("🌿 Creando sonido de naturaleza...")
    nature_duration = 6.0
    sample_rate = 44100
    frames = int(nature_duration * sample_rate)
    
    # Crear base de viento (ruido filtrado)
    wind_base = create_noise(nature_duration, amplitude=0.06)
    
    # Agregar "pájaros" (tonos cortos)
    nature_sound = wind_base.copy()
    for i in range(5):
        # Frecuencias de pájaros entre 800-1500 Hz
        bird_freq = 800 + (i * 150)
        bird_start = int((i + 1) * sample_rate * 0.8)  # Espaciados en el tiempo
        bird_duration = 0.3  # 0.3 segundos cada pájaro
        
        if bird_start < len(nature_sound):
            bird_frames = int(bird_duration * sample_rate)
            bird_end = min(bird_start + bird_frames, len(nature_sound))
            
            # Crear canto de pájaro
            bird_sound = create_sine_wave(bird_freq, bird_duration, amplitude=0.15)
            bird_sound = apply_fade(bird_sound, 0.05)  # Fade rápido
            
            # Superponer sobre el viento
            for j in range(min(len(bird_sound), bird_end - bird_start)):
                nature_sound[bird_start + j] = np.clip(
                    int(nature_sound[bird_start + j]) + int(bird_sound[j]), 
                    -32767, 32767
                )
    
    nature_sound = apply_fade(nature_sound, 1.0)
    save_wav_file(nature_sound, os.path.join(uploads_dir, "test_nature.wav"))
    print("✅ test_nature.wav creado")
    
    # 5. Lluvia simulada (ruido de alta frecuencia)
    print("🌧️ Creando sonido de lluvia...")
    rain_duration = 4.0
    rain_data = create_noise(rain_duration, amplitude=0.12)
    
    # Filtro simple para simular lluvia (más ruido en frecuencias altas)
    # Agregar componente de alta frecuencia
    high_noise = create_noise(rain_duration, amplitude=0.08)
    
    # Combinar
    rain_sound = ((rain_data.astype(np.int32) + high_noise.astype(np.int32)) / 2).astype(np.int16)
    rain_sound = apply_fade(rain_sound, 0.8)
    save_wav_file(rain_sound, os.path.join(uploads_dir, "test_rain.wav"))
    print("✅ test_rain.wav creado")

def copy_and_rename_existing():
    """Copiar archivos existentes con nombres más simples"""
    uploads_dir = "uploads"
    
    # Mapeo de archivos existentes
    mappings = {
        "example_transmilenio_rush.mp3": "bogota_transmilenio.mp3",
        "example_cartagena_waves.mp3": "cartagena_waves.mp3",
        "example_vallenato.mp3": "valledupar_vallenato.mp3"
    }
    
    print("📋 Copiando archivos existentes...")
    
    for old_name, new_name in mappings.items():
        old_path = os.path.join(uploads_dir, old_name)
        new_path = os.path.join(uploads_dir, new_name)
        
        if os.path.exists(old_path):
            try:
                import shutil
                shutil.copy2(old_path, new_path)
                print(f"✅ {old_name} → {new_name}")
            except Exception as e:
                print(f"❌ Error copiando {old_name}: {e}")
        else:
            print(f"⚠️ No encontrado: {old_name}")

def list_audio_files():
    """Listar todos los archivos de audio"""
    uploads_dir = "uploads"
    
    if not os.path.exists(uploads_dir):
        print(f"❌ Directorio {uploads_dir} no existe")
        return []
    
    print(f"\n📁 Archivos en {uploads_dir}:")
    audio_extensions = ['.mp3', '.wav', '.ogg', '.m4a']
    audio_files = []
    
    for file in sorted(os.listdir(uploads_dir)):
        if os.path.isfile(os.path.join(uploads_dir, file)):
            file_path = os.path.join(uploads_dir, file)
            file_size = os.path.getsize(file_path)
            
            if any(file.lower().endswith(ext) for ext in audio_extensions):
                audio_files.append(file)
                print(f"   🎵 {file} ({file_size:,} bytes)")
            elif file != '.gitkeep':
                print(f"   📄 {file} ({file_size:,} bytes)")
    
    return audio_files

def test_numpy_availability():
    """Verificar que numpy esté disponible"""
    try:
        import numpy
        print(f"✅ NumPy disponible: versión {numpy.__version__}")
        return True
    except ImportError:
        print("❌ NumPy no está instalado")
        print("💡 Para instalarlo: pip install numpy")
        return False

def main():
    """Función principal"""
    print("🎵 Generador de Audio Simple - Compatible con Python 3.13")
    print("=" * 60)
    print(f"🐍 Python version: {os.sys.version}")
    
    # Verificar dependencias
    if not test_numpy_availability():
        print("\n❌ No se puede continuar sin NumPy")
        print("   Ejecuta: pip install numpy")
        return
    
    # Mostrar archivos existentes
    existing_files = list_audio_files()
    
    print(f"\n🎛️ Opciones:")
    print("1. Crear archivos de audio WAV de prueba (recomendado)")
    print("2. Solo copiar/renombrar archivos existentes") 
    print("3. Ambos (crear nuevos + copiar existentes)")
    
    try:
        choice = input("\nElige una opción (1/2/3): ").strip()
        
        if choice == "1":
            create_test_audio_files()
        elif choice == "2":
            copy_and_rename_existing()
        elif choice == "3":
            create_test_audio_files()
            copy_and_rename_existing()
        else:
            print("❌ Opción inválida")
            return
        
        # Mostrar resultado final
        print(f"\n📊 Resultado final:")
        final_files = list_audio_files()
        
        print(f"\n🎉 ¡Archivos de audio listos!")
        print(f"📁 Total de archivos de audio: {len(final_files)}")
        print(f"\n🚀 Siguiente paso:")
        print(f"   python create_real_test_data.py")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()