# IA/core/routes.py
from flask import render_template, current_app
from core import core_bp
from investment.inversiones import get_inversiones_dashboard_data

@core_bp.route('/')
def index():
    print("DEBUG: 1. Entrando en la ruta principal routes.py  '/'") 
    try:

        db_uri = current_app.config['SQLALCHEMY_DATABASE_URI'] # Aquí, print("DEBUG: Llamando a get_inversiones_dashboard_data...")
        inversiones_data = get_inversiones_dashboard_data(db_uri) # print("DEBUG: Datos de inversiones obtenidos.")

        if not inversiones_data: 
            print("ADVERTENCIA: La función get_inversiones_dashboard_data devolvió datos vacíos o nulos., no obtuvo informacion de la DB routes.oy linea 15") # <-- Añade esto

        return render_template('index.html',
                                # Aquí, simplemente desempaquetamos el diccionario 'inversiones_data'.
                                # Todas las variables que 'index.html' necesita (total_costo_formateado,
                                # graph_gasto_por_mes_json, tabla_data, etc.) ya están dentro de este diccionario.
                           **inversiones_data
                          )
    except Exception as e: # print(f"ERROR: Fallo al renderizar la página principal. Error: {e}") # <-- Añade esto
        # Devuelve una respuesta de error en la página
        return "Error de conexion en routes.py, en routes def index()", 500
    
############# ACA INICIA MODAL ############
# Tu ruta para el contenido del modal PMI está bien aquí.
@core_bp.route('/pmi_content')
def pmi_content():
    return render_template('partials/_pmi_modal_content.html')

############# ACA INICIA SIGA ############
# Tu ruta para el contenido del botón SIGA también está bien aquí.
@core_bp.route('/siga_content')
def siga_content():
    return render_template('partials/_siga_content.html')

############# ACA INICIA PRUEBA ############
# Tu ruta para el contenido del botón SIGA también está bien aquí.
@core_bp.route('/prueba_content')
def prueba_content():
    return render_template('partials/PRUEBA.HTML')
