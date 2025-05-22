import os
import subprocess
import sys
import shutil
from datetime import datetime

def ejecutar_comando(comando):
    try:
        resultado = subprocess.run(comando, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ Comando ejecutado exitosamente: {comando}")
        return True, resultado.stdout
    except subprocess.CalledProcessError as e:
        print(f"✗ Error al ejecutar el comando: {comando}")
        print(f"Error: {e.stderr}")
        return False, None

def obtener_url_repositorio():
    print("\nObteniendo URL del repositorio...")
    exito, resultado = ejecutar_comando("git remote -v")
    if exito and resultado:
        # Obtener la primera URL del repositorio
        url = resultado.split('\n')[0].split()[1]
        print(f"URL del repositorio encontrada: {url}")
        return url
    else:
        print("❌ No se pudo obtener la URL del repositorio.")
        print("Por favor, ingresa la URL de tu repositorio Git:")
        return input("URL del repositorio: ").strip()

def clonar_repositorio():
    print("=== Iniciando proceso de clonación del repositorio ===")
    
    # Obtener URL del repositorio
    url_repo = obtener_url_repositorio()
    
    # 1. Crear backup de archivos actuales
    fecha_hora = datetime.now().strftime("%Y%m%d_%H%M%S")
    carpeta_backup = f"backup_{fecha_hora}"
    print(f"\n1. Creando backup en: {carpeta_backup}")
    os.makedirs(carpeta_backup, exist_ok=True)
    
    # Copiar todos los archivos al backup
    for item in os.listdir('.'):
        if item != '.git' and not item.startswith('backup_'):
            if os.path.isfile(item):
                shutil.copy2(item, os.path.join(carpeta_backup, item))
            elif os.path.isdir(item):
                shutil.copytree(item, os.path.join(carpeta_backup, item))
    
    # 2. Eliminar archivos actuales
    print("\n2. Eliminando archivos actuales...")
    for item in os.listdir('.'):
        if item != carpeta_backup and item != 'restaurar_repositorio.py':
            if os.path.isfile(item):
                os.remove(item)
            elif os.path.isdir(item):
                shutil.rmtree(item)
    
    # 3. Clonar repositorio
    print("\n3. Clonando repositorio...")
    if not ejecutar_comando(f"git clone {url_repo} temp_repo")[0]:
        print("\n❌ Error al clonar el repositorio.")
        print("Se ha creado un backup de tus archivos en:", carpeta_backup)
        sys.exit(1)
    
    # 4. Mover archivos del repositorio clonado
    print("\n4. Moviendo archivos del repositorio clonado...")
    for item in os.listdir('temp_repo'):
        if os.path.isfile(os.path.join('temp_repo', item)):
            shutil.copy2(os.path.join('temp_repo', item), item)
        elif os.path.isdir(item):
            shutil.copytree(os.path.join('temp_repo', item), item)
    
    # 5. Eliminar carpeta temporal
    print("\n5. Eliminando carpeta temporal...")
    shutil.rmtree('temp_repo')
    
    print("\n✅ Proceso completado exitosamente!")
    print(f"Se ha creado un backup de tus archivos anteriores en: {carpeta_backup}")

if __name__ == "__main__":
    print("=== Herramienta de Clonación de Repositorio Git ===")
    print("Este script realizará las siguientes acciones:")
    print("1. Crear un backup de todos los archivos actuales")
    print("2. Eliminar los archivos actuales (excepto backup y script)")
    print("3. Clonar el repositorio en una carpeta temporal")
    print("4. Mover los archivos del repositorio clonado")
    print("5. Eliminar la carpeta temporal")
    
    respuesta = input("\n¿Deseas continuar? (s/n): ").lower()
    if respuesta == 's':
        clonar_repositorio()
    else:
        print("Operación cancelada.") 