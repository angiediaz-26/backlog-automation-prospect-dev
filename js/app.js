// --- 6. LLAMADA REAL A LA API (FETCH) ---
async function initRoadmap() {
    renderTimelineHeaders();
    positionTodayLine();

    // Tu URL oficial de producción
    const API_URL = 'https://script.google.com/macros/s/AKfycbwWpXdU_P0_Ehn2iCq3LeEjcg30i52OalzYGf4YSZjMwn6x3gPIwIja2aWTaxo4O__Q/exec';

    try {
        // Mensaje de carga mientras esperamos a Sheets
        projectsArea.innerHTML = '<div style="padding: 20px; text-align: center; font-weight: 600; color: var(--blue-dark);">Cargando roadmap desde Sheets... 🚀</div>';

        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error en la red');
        
        const data = await response.json();
        
        // Renderizamos los datos reales
        renderProjects(data);

    } catch (error) {
        console.error("Error cargando los datos:", error);
        projectsArea.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--coral-accent); font-weight: 600;">Error al cargar los datos. Verifica la conexión o la URL.</div>';
    }
}

// Inicializar
initRoadmap();
