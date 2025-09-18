# C:\Users\ANALISTA\Desktop\IA\python app.py

from flask import Flask, render_template, url_for
from configdb import ConfigDB
from core import core_bp
from audio_player import audio_player_bp
from dashboard.dashboard import dashboard_bp
from excel_upload import excel_upload_bp
from excel_advanced import excel_advanced_bp
from excel_bulk_advanced import excel_bulk_advanced_bp
from excel_consulta_mef import excel_consulta_mef_bp
from report_f12b import report_f12b_bp
from rei import rei_bp
from proyeccion_f1 import proyeccion_f1_bp
from recordatorio.recor_principal import recor_principal_bp
from municipalidad import municipalidad_bp
from tab_control import tab_control_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(ConfigDB)

    # Registrar Blueprints
    app.register_blueprint(core_bp)
    app.register_blueprint(audio_player_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(excel_upload_bp)
    app.register_blueprint(excel_advanced_bp)
    app.register_blueprint(excel_bulk_advanced_bp)
    app.register_blueprint(excel_consulta_mef_bp)
    app.register_blueprint(report_f12b_bp)
    app.register_blueprint(rei_bp)
    app.register_blueprint(proyeccion_f1_bp)
    app.register_blueprint(recor_principal_bp) # Registra la nueva Blueprint
    app.register_blueprint(municipalidad_bp)
    app.register_blueprint(tab_control_bp)

    
    # --- Rutas Principales ---

    # --- NUEVA RUTA PARA EL DASHBOARD DEL SINDICATO  se pone aca porque es directo no es necesario PY---
    @app.route('/sindicato-dashboard')
    def sindicato_dashboard_content():
        """ Ruta para servir el contenido HTML del módulo de gestión sindical. """
        return render_template('sindicato_dashboard.html')

    return app
    
if __name__ == '__main__':#se ejecuta y genera routes.py para ejecucion de index()
    app = create_app()
    app.run(debug=True)