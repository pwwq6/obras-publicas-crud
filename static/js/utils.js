// C:\Users\ANALISTA\Desktop\IA\static\js\utils.js
/* Módulo de utilidades generales para la aplicación*/
const appUtils = (() => {

    /**
     * Maneja las respuestas de la API, lanzando un error si la respuesta no es OK.
     * @param {Response} response - La respuesta de la API.
     * @returns {Response} La respuesta si es OK.
     * @throws {Error} Si la respuesta no es OK.
     */
    const handleApiResponse = async (response) => {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Error de red o servidor: ${response.status}` }));
            displayMessage(errorData.message || 'Ocurrió un error inesperado.', 'error');
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }
        return response; // Devuelve la respuesta para que pueda ser parseada (.json())
    };

    /**
     * Obtiene un elemento del DOM por su ID, con una verificación de seguridad.
     * @param {string} id - El ID del elemento a buscar.
     * @returns {HTMLElement | null} El elemento si se encuentra, de lo contrario null.
     */
    const getElementById = (id) => {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Elemento con ID "${id}" no encontrado en el DOM.`);
        }
        return element;
    };
    const displayMessage = (message, type = 'info') => {
        const globalMessageDiv = getElementById('global-message-area'); // Asumiendo un div global para mensajes
        if (globalMessageDiv) {
            globalMessageDiv.className = `alert alert-${type}`; // O tus clases CSS
            globalMessageDiv.textContent = message;
            globalMessageDiv.style.display = 'block';
            // Opcional: Ocultar después de un tiempo
            setTimeout(() => { globalMessageDiv.style.display = 'none'; }, 5000);
        } else {
            console.log(`Mensaje (${type}): ${message}`);
        }
    };
    
    /* Convierte una cadena de texto a un formato "slug" (sin espacios, minúsculas, etc.).
     * Útil para nombres de archivo o IDs.
     * @param {string} text - La cadena de texto a convertir.
     * @returns {string} La cadena convertida a slug.
     */
    const slugify = (text) => {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '_')           // Reemplaza espacios con _
            .replace(/[^\w-]+/g, '')       // Remueve caracteres no alfanuméricos
            .replace(/--+/g, '_')         // Reemplaza múltiples _ con una sola
            .replace(/^-+/, '')            // Recorta _ del inicio
            .replace(/-+$/, '');           // Recorta _ del final
    };
    // Devuelve las funciones que queremos que sean accesibles desde fuera del módulo
    return {
        getElementById,
        displayMessage,
        handleApiResponse,
        slugify
    };
    // static/js/utils.js (Ejemplo, si no tienes uno ya con estas funciones)

// Muestra/oculta un spinner de carga
function showLoading() {
    $('#loading-spinner').removeClass('hidden');
}

function hideLoading() {
    $('#loading-spinner').addClass('hidden');
}

// Muestra mensajes flash (asumiendo que tienes un contenedor para ellos en el DOM)
function showFlashMessage(message, type = 'info', duration = 5000) {
    const $container = $('#main-flash-message-container'); // Asegúrate de que este ID exista en tu base.html o index.html
    if ($container.length === 0) {
        console.warn("Contenedor de mensajes flash no encontrado (#main-flash-message-container). Creando uno temporal.");
        $('body').append('<div id="main-flash-message-container" style="position: fixed; top: 20px; right: 20px; z-index: 1000; display: flex; flex-direction: column; gap: 10px;"></div>');
        $container = $('#main-flash-message-container');
    }

    const $msgDiv = $(`<div class="flash-message ${type} hidden"></div>`);
    $msgDiv.text(message);
    $container.append($msgDiv);
    $msgDiv.fadeIn(300);

    setTimeout(() => {
        $msgDiv.fadeOut(500, function() {
            $(this).remove();
        });
    }, duration);
}

// Puedes añadir más funciones de utilidad aquí
})();
