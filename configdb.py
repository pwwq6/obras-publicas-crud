import os
import pymysql
from pymysql import OperationalError

class ConfigDB:
    # Configuración de la base de datos MySQL.
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'mysql+pymysql://root:@localhost/inversiones'

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # AÑADE ESTO: Extensiones permitidas para los archivos subidos
    ALLOWED_EXTENSIONS = {'xlsx', 'xls'} # O {'.xlsx', '.xls', '.csv'} si quieres incluir más

    # AÑADE ESTO (si no lo tenías ya): Credenciales de la base de datos para pymysql.connect()
    # Asegúrate de que estas coincidan con tu configuración real de la BD
    DB_HOST = 'localhost'
    DB_USER = 'root'
    DB_PASSWORD = '' # Deja vacío si no tienes contraseña para el usuario root
    DB_NAME = 'inversiones'

    # Ruta donde se guardarán temporalmente los archivos subidos
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

# ---- FUNCIÓN PARA CONECTAR A LA BASE DE DATOS ----
def connect_db():
    try:
        connection = pymysql.connect(
            host=ConfigDB.DB_HOST,
            user=ConfigDB.DB_USER,
            password=ConfigDB.DB_PASSWORD,
            database=ConfigDB.DB_NAME,
            cursorclass=pymysql.cursors.DictCursor
        )
        print(f"Conexión a la base de datos establecida exitosamente. {connection}")
        return connection

    except OperationalError as e:
        print(f"Error de conexión a la base de datos: {e}")
        return None
    except Exception as e:
        print(f"Error inesperado al conectar a la base de datos: {e}")
        return None