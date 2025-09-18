// static/js/proyeccion_f1.js

var proyeccion_f1 = (function($) {
    'use strict';

    // **IMPORTANTE: Registrar el plugin de datalabels al inicio del script**
    Chart.register(ChartDataLabels);

    // Variables privadas para almacenar las instancias de los gráficos
    let proyeccionRealChartInstance = null;
    let proyeccionAcumuladoChartInstance = null;
    const mesesDelAnio = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const ahora = new Date();
    const mesActual = mesesDelAnio[ahora.getMonth()];

    // Función para formatear números grandes (M, K)
    function formatNumber(num) {
        if (num === null || num === undefined) {
            return '0';
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toLocaleString();
    }

    // Función para renderizar el cuadro de resumen
    function renderProyeccionResumen(data) {
        $('#pimTotal').text(data.PIM_TOTAL.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' }));
        $('#devengadoAcumulado').text(data.DEVENGADO_ACUMULADO_A_LA_FECHA.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' }));
        $('#proyeccion11Meses').text(data.CONSIDERACION_11_MESES.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' }));
        $('#proyeccion12Meses').text(data.CONSIDERACION_12_MESES.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' }));
    }

    // Función para renderizar las dos tablas
    function renderProyeccionTables(data, pimTotal) {
        const table11Body = $('#proyeccionTable11MesesBody');
        const table12Body = $('#proyeccionTable12MesesBody');
        table11Body.empty();
        table12Body.empty();

        let devengadoAcumulado = 0;

        mesesDelAnio.forEach((mes, index) => {
            const item = data.find(d => {
                const mesDeDatos = d.MES.split("'")[1];
                return mesDeDatos && mesDeDatos.trim() === mes.trim();
            });
            
            const devengadoMes = item ? item.DEVENGADO : 0;
            devengadoAcumulado += devengadoMes;

            const avanceReal = (devengadoAcumulado / pimTotal) * 100;
            const claseMesActual = mes === mesActual ? 'bg-yellow-100 font-bold' : '';

            // Proyección a 11 meses
            const proyeccion11Meses = pimTotal / 11;
            const ejecucion11Meses = proyeccion11Meses * (index + 1);
            const avance11 = Math.min((ejecucion11Meses / pimTotal) * 100, 100);
            const diferencia = avanceReal - avance11;

            const row11 = `
                <tr class="${claseMesActual}">
                    <td>${mes}</td>
                    <td>${proyeccion11Meses.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>${ejecucion11Meses.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>${avance11.toFixed(2)}%</td>
                    <td>${devengadoMes.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>${avanceReal.toFixed(2)}%</td>
                    <td class="${diferencia < 0 ? 'text-red-500' : 'text-green-500'}">${diferencia.toFixed(2)}%</td>
                </tr>
            `;
            table11Body.append(row11);
            
            // Proyección a 12 meses
            const proyeccion12Meses = pimTotal / 12;
            const ejecucion12Meses = proyeccion12Meses * (index + 1);
            const avance12 = (ejecucion12Meses / pimTotal) * 100;
            const diferencia12 = avanceReal - avance12;

            const row12 = `
                <tr class="${claseMesActual}">
                    <td>${mes}</td>
                    <td>${proyeccion12Meses.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>${ejecucion12Meses.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>${avance12.toFixed(2)}%</td>
                    <td>${devengadoMes.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>${avanceReal.toFixed(2)}%</td>
                    <td class="${diferencia12 < 0 ? 'text-red-500' : 'text-green-500'}">${diferencia12.toFixed(2)}%</td>
                </tr>
            `;
            table12Body.append(row12);
        });
    }

    // Función para renderizar el gráfico de barras y líneas (Devengado Real)
    function renderDevengadoRealChart(data, pimTotal) {
        if (proyeccionRealChartInstance) {
            proyeccionRealChartInstance.destroy();
        }

        const ctx = document.getElementById('devengadoRealChart').getContext('2d');
        const devengadoData = mesesDelAnio.map(mes => {
            const item = data.find(d => d.MES.split("'")[1].trim() === mes.trim());
            return item ? item.DEVENGADO : 0;
        });
        
        const proyeccionMensual = pimTotal / 12;
        const proyeccionProgramadaData = mesesDelAnio.map(() => proyeccionMensual);

        proyeccionRealChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: mesesDelAnio,
                datasets: [
                    {
                        type: 'line',
                        label: 'Proyección Programada',
                        data: proyeccionProgramadaData,
                        borderColor: 'rgb(255, 159, 64)',
                        backgroundColor: 'rgba(255, 159, 64, 0.2)',
                        fill: false,
                        yAxisID: 'y',
                        pointRadius: 5,
                        datalabels: {
                            display: true,
                            align: 'bottom',
                            formatter: (value, context) => {
                                if (context.dataIndex === 0) {
                                    return `S/.${formatNumber(value)}\n${((value/pimTotal)*100).toFixed(2)}%`;
                                }
                                return null;
                            },
                            color: 'red'
                        }
                    },
                    {
                        type: 'line',
                        label: 'Devengado Real',
                        data: devengadoData,
                        backgroundColor: 'rgba(54, 162, 235, 0.8)',
                        borderColor: 'rgb(54, 162, 235)',
                        borderWidth: 3,
                        yAxisID: 'y',
                        datalabels: {
                            display: true,
                            align: 'end',
                            formatter: (value) => {
                                if (value === null || value === undefined || value === 0) {
                                    return '';
                                }
                                const porcentaje = (value / pimTotal) * 100;
                                return `S/.${formatNumber(value)}\n${porcentaje.toFixed(2)}%`;
                            },
                            color: 'black',
                        }
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    datalabels: {
                        font: {
                            weight: 'bold',
                            size:'11px'
                        },
                        color: 'black' 
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Monto (S/.)'
                        }
                    },
                }
            }
        });
    }

    // Función para renderizar el gráfico de líneas (Devengado Acumulado)
    function renderDevengadoAcumuladoChart(data, pimTotal) {
        if (proyeccionAcumuladoChartInstance) {
            proyeccionAcumuladoChartInstance.destroy();
        }

        const ctx = document.getElementById('devengadoAcumuladoChart').getContext('2d');
        let devengadoAcumulado = 0;
        const devengadoAcumuladoData = mesesDelAnio.map(mes => {
            const item = data.find(d => d.MES.split("'")[1].trim() === mes.trim());
            const devengadoMes = item ? item.DEVENGADO : 0;
            devengadoAcumulado += devengadoMes;
            return devengadoAcumulado;
        });

        const avanceAcumuladoData = devengadoAcumuladoData.map(val => (val / pimTotal) * 100);
        const avanceProgramadoData = mesesDelAnio.map((_, index) => ((pimTotal / 12) * (index + 1)) / pimTotal * 100);

        proyeccionAcumuladoChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: mesesDelAnio,
                datasets: [
                    {
                        label: 'Proyección Programada',
                        data: avanceProgramadoData,
                        borderColor: 'rgb(255, 159, 64)',
                        backgroundColor: 'rgba(255, 159, 64, 0.2)',
                        tension: 0.4,
                        fill: false,
                        pointRadius: 5,
                        borderWidth: 3,
                        datalabels: {
                            display: true,
                            align: 'top',
                            formatter: (value) => value.toFixed(2) + '%',
                            color: 'black'
                        }
                    },
                    {
                        label: 'Avance Real',
                        data: avanceAcumuladoData,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.4,
                        fill: false,
                        pointRadius: 5,
                        borderWidth: 3,
                        datalabels: {
                            display: true,
                            align: 'bottom',
                            formatter: (value) => value.toFixed(2) + '%',
                            color: 'red',
                        }
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    datalabels: {
                        font: {
                            weight: 'bold',
                            size:'11px'
                        },
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Avance (%)'
                        }
                    }
                }
            }
        });
    }

    // Función principal de inicialización del módulo
    function init() {
        console.log('Módulo de Proyección F.1 inicializado.');
        
        // Carga los datos de la API
        loadData();

        // Asigna el evento de clic al botón de impresión solo una vez
        $('#content-area').off('click', '#Print_proyeccion_F1').on('click', '#Print_proyeccion_F1', function() {
            window.print();
        });
    }
    
    // Función para cargar los datos desde la API
    function loadData() {
        $.ajax({
            url: AppConfig.PROYECCION_F1_API_URL,
            method: 'GET',
            success: function(response) {
                if (response && response.proyeccion_mensual && response.resumen_proyeccion) {
                    renderProyeccionResumen(response.resumen_proyeccion);
                    renderProyeccionTables(response.proyeccion_mensual, response.resumen_proyeccion.PIM_TOTAL);
                    renderDevengadoRealChart(response.proyeccion_mensual, response.resumen_proyeccion.PIM_TOTAL); 
                    renderDevengadoAcumuladoChart(response.proyeccion_mensual, response.resumen_proyeccion.PIM_TOTAL);
                } else {
                    console.error('Estructura de datos de API inesperada.');
                }
            },
            error: function(error) {
                console.error('Error al obtener datos de Proyección F.1:', error);
                alert('No se pudieron cargar los datos de proyección.');
            },
        });
    }

    // Retorna el objeto público con la función de inicialización
    return {
        init: init
    };

})(jQuery);