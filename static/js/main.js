// static/js/main.js

$(document).ready(function() {
    console.log("main.js: Documento listo. Main, funciono OK.");

    // Inicializa los módulos de musica audioplayer.js
    if (typeof audioPlayer !== 'undefined' && audioPlayer.init) {
        audioPlayer.init();
    }
    // Inicializa dashboard dashboard.js
    if (typeof dashboard !== 'undefined' && dashboard.init) {
        dashboard.init();
    }
    // Mapeo centralizado de todos los módulos
    const MODULOS_CONFIG = {
        'btn-siga': {
            url: AppConfig.SIGA_CONTENT_URL,
            js: null,
            css: null
        },
        'btn-excel_up': {//EXCEL BASICOexcel_upload
            url: AppConfig.EXCEL_UPLOAD_FORM_URL,
            js: AppConfig.JS_URLS.excel_upload, // Usa la URL del objeto AppConfig
            css: AppConfig.CSS_URLS.excel_upload,
            initFunc: 'excelUploader.init'
        },
        'btn-resumen': {
            url: '/get_dashboard_content_ajax',
            js: null,
            css: null
        },
        'btn-excel_advanced': {
            url: AppConfig.EXCEL_ADVANCED_FORM_URL,
            js: AppConfig.JS_URLS.excel_advanced, // Usa la URL del objeto AppConfig
            css: AppConfig.CSS_URLS.excel_advanced,
            initFunc: 'excelAdvanced.init'
        },
        'btn_bulk_excel_advanced': {//ACA ES CONSULTA AVANZADA Y REPORTE bi
            url: AppConfig.EXCEL_BULK_ADVANCED_FORM_URL,
            js: AppConfig.JS_URLS.excel_bulk_advanced, // Usa la URL del objeto AppConfig
            css: [AppConfig.CSS_URLS.excel_bulk_advanced, AppConfig.CSS_URLS.excel_consulta_mef],
            initFunc: 'BULK_EXCEL_ADVANCED.init'
        },
        'btn_ca_mef': {//EXCEL QUE SUBE CONSULTA AMIGABLE MESES, PROY, MUNI,
            url: AppConfig.EXCEL_CONSULTA_MEF_FORM_URL,
            js: AppConfig.JS_URLS.excel_consulta_mef,
            css: AppConfig.CSS_URLS.excel_consulta_mef,
            initFunc: 'XLS_CONSULTA_MEF.init'
        },
        'btn-f12b': {
            url: AppConfig.REPORTE_F12B_FORM_URL,
            js: AppConfig.JS_URLS.report_f12b,
            css: AppConfig.CSS_URLS.report_f12b,
            initFunc: 'REPORTE_F12B.init'
        },
        'btn-prueba': {
            url: '/prueba_content',
        },
        'btn-rei': {
            url: AppConfig.REI_MODULE_CONTENT_URL,
            js: AppConfig.JS_URLS.rei,
            css: AppConfig.CSS_URLS.rei,
            initFunc: 'rei.init'
        },
        'btn-sindicato': {
            url: AppConfig.SINDICATO_DASHBOARD_URL,
            js: AppConfig.JS_URLS.sindicato,
            css: AppConfig.CSS_URLS.sindicato,
            initFunc: 'sindicato.init'
        },
        'btn-proyeccion-f1': {
            url: AppConfig.PROYECCION_F1_URL,
            js: AppConfig.JS_URLS.proyeccion_f1,
            css: AppConfig.CSS_URLS.proyeccion_f1,
            initFunc: 'proyeccion_f1.init'
        },
        'btn-recordatorio': {
            url: AppConfig.RECORDATORIO_HTML_URL,
            js: AppConfig.JS_URLS.recordatorio,
            css: [AppConfig.CSS_URLS.recordatorio, AppConfig.CSS_URLS.excel_consulta_mef],
            initFunc: 'recordatorio.init'
        },
        'btn-muni': {
            url: AppConfig.MUNICIPALIDAD_HTML_URL,
            js: AppConfig.JS_URLS.municipalidad,
            css: AppConfig.CSS_URLS.municipalidad,
            initFunc: 'municipalidad.init'
        },
        'btn-tab-ctrl': {
            url: AppConfig.TAB_CONTROL_HTML_URL,
            js: AppConfig.JS_URLS.tab_control,
            css: AppConfig.CSS_URLS.tab_control,
            initFunc: 'tab_control.init'
        }
    };

    const contentArea = $('#content-area');

    // Lógica para cargar CSS y JS dinámicamente
    function loadScript(src, callback) {
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
            if (callback) callback();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = callback;
        script.onerror = () => console.error(`Error al cargar el script: ${src}`);
        document.body.appendChild(script);
    }

    function loadCss(href) {
        if (Array.isArray(href)) {
            href.forEach(url => loadSingleCss(url));
        } else {
            loadSingleCss(href);
        }
    }

    function loadSingleCss(href) {
        const existingLink = document.querySelector(`link[href="${href}"]`);
        if (existingLink) {
            return;
        }
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onerror = () => console.error(`Error al cargar el CSS: ${href}`);
        document.head.appendChild(link);
    }

    // MANEJO CENTRALIZADO DE CLICS
    $('.navbar button').on('click', function(e) {
        e.preventDefault();
        const buttonId = $(this).attr('id');
        const modulo = MODULOS_CONFIG[buttonId];

        if (!modulo) {
            console.error(`ERROR: No se encontró la configuración para el botón con ID: ${buttonId}`);
            return;
        }

        $('.navbar button').removeClass('active');
        $(this).addClass('active');

        contentArea.html(`<p>Cargando contenido de ${buttonId.replace('btn-', '').toUpperCase()}...</p>`);

        $.ajax({
            url: modulo.url,
            method: 'GET',
            success: function(html) {
                contentArea.html(html);

                if (modulo.css) {
                    loadCss(modulo.css);
                }
                if (modulo.js) {
                    loadScript(modulo.js, () => {
                        if (modulo.initFunc) {
                            try {
                                eval(`typeof ${modulo.initFunc} === 'function' && ${modulo.initFunc}()`);
                            } catch (error) {
                                console.error(`Error al inicializar el módulo ${buttonId}:`, error);
                            }
                        }
                    });
                }
            },
            error: function(xhr, status, error) {
                console.error(`Error al cargar el módulo ${buttonId}:`, status, error, xhr.responseText);
                contentArea.html('<p style="color: red;">Error al cargar el contenido. Por favor, inténtelo de nuevo.</p>');
            }
        });
    });

    // Lógica para modales (se mantiene aquí por ser una funcionalidad global)
    const pmiModal = $('#pmiModal');
    const btnPmi = $('#btn-pmi');
    const closeButton = pmiModal.find('.close-button');

    btnPmi.on('click', function() {
        pmiModal.css('display', 'flex');
    });

    closeButton.on('click', function() {
        pmiModal.css('display', 'none');
    });

    $(window).on('click', function(event) {
        if ($(event.target).is(pmiModal)) {
            pmiModal.css('display', 'none');
        }
    });

    $(document).on('click', '#btn-reportF12B, #Act_F12B', function(e) {
        e.preventDefault();
        const targetModalId = $(this).attr('id') === 'btn-reportF12B' ? '#pmiModalF12B' : '#modalInversionesActualizadas';
        $(targetModalId).css('display', 'flex');
    });

    $(document).on('click', '#pmiModalF12B .close-button, #modalInversionesActualizadas .close-button2', function(e) {
        $(this).closest('.modal-overlay').css('display', 'none');
    });

    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
            $('.modal-overlay').css('display', 'none');
        }
    });

});