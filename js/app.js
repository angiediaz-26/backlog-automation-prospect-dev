// --- 1. CONFIGURACIÓN DEL TIMELINE (AÑO ACTUAL) ---
const YEAR = new Date().getFullYear(); // 2026
const IS_LEAP = (YEAR % 4 === 0 && YEAR % 100 !== 0) || (YEAR % 400 === 0);
const DAYS_IN_YEAR = IS_LEAP ? 366 : 365;

// DOM Elements
const timelineHeader = document.getElementById('timelineHeader');
const todayLine = document.getElementById('todayLine');
const projectsArea = document.getElementById('projectsArea');
const viewToggle = document.getElementById('viewToggle');
const projectTooltip = document.getElementById('projectTooltip'); // Referencia al Tooltip

// --- 2. RENDERIZAR CABECERAS (Q, Meses, Semanas) ---
function renderTimelineHeaders() {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    let qHTML = '<div class="time-row row-quarters">';
    quarters.forEach(q => qHTML += `<div class="time-cell">${q}</div>`);
    qHTML += '</div>';

    let mHTML = '<div class="time-row row-months">';
    months.forEach(m => mHTML += `<div class="time-cell">${m}</div>`);
    mHTML += '</div>';

    let wHTML = '<div class="time-row row-weeks">';
    for(let i=0; i<12; i++) {
        wHTML += `<div class="time-cell">S1</div><div class="time-cell">S2</div><div class="time-cell">S3</div><div class="time-cell">S4</div>`;
    }
    wHTML += '</div>';

    timelineHeader.innerHTML = qHTML + mHTML + wHTML;
}

// --- 3. LÓGICA DE POSICIONAMIENTO MATEMÁTICO ---
function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

function positionTodayLine() {
    const today = new Date(); 
    const dayOfYear = getDayOfYear(today);
    if (today.getFullYear() === YEAR) {
        const percentage = (dayOfYear / DAYS_IN_YEAR) * 100;
        todayLine.style.left = `${percentage}%`;
    } else {
        todayLine.style.display = 'none';
    }
}

// Parser de fechas a prueba de balas para Google Sheets
function parseDateRobust(dateStr) {
    if (!dateStr) return new Date();
    
    // 1. Lo convertimos a texto por seguridad y quitamos espacios
    let str = String(dateStr).trim();
    
    // 2. Si por algún motivo llega con barras (DD/MM/YYYY), lo volteamos a YYYY-MM-DD
    if (str.includes('/')) {
        const parts = str.split('/');
        // parts[0] = DD, parts[1] = MM, parts[2] = YYYY
        str = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    
    // 3. Cortamos SOLO los primeros 10 caracteres (YYYY-MM-DD). 
    // Esto elimina cualquier hora o zona horaria basura que envíe Sheets.
    const cleanDate = str.substring(0, 10);
    
    // 4. Retornamos la fecha forzando la hora a medianoche para evitar saltos de día
    return new Date(`${cleanDate}T00:00:00`);
}

function calculateBarPosition(startDateStr, endDateStr) {
    const start = parseDateRobust(startDateStr);
    const end = parseDateRobust(endDateStr);
    
    const startDay = getDayOfYear(start);
    const endDay = getDayOfYear(end);
    
    let leftPercent = (startDay / DAYS_IN_YEAR) * 100;
    let widthPercent = ((endDay - startDay) / DAYS_IN_YEAR) * 100;

    // Evitamos que las barras se salgan del contenedor visualmente
    if (leftPercent < 0) leftPercent = 0;
    if (widthPercent < 1) widthPercent = 1; 
    
    return { left: leftPercent, width: widthPercent };
}

// --- 4. RENDERIZAR PROYECTOS (Ajustado para el Tooltip) ---
function renderProjects(data) {
    projectsArea.innerHTML = '';
    
    // Filtramos para asegurarnos de que la fila tenga fecha de inicio y fin válidas
    const validData = data.filter(item => item['FECHA INICIO'] && item['FECHA FIN']);

    validData.forEach(item => {
        const pos = calculateBarPosition(item['FECHA INICIO'], item['FECHA FIN']);
        
        // Manejo seguro por si algunos campos vienen vacíos de Sheets
        const responsable = item.RESPONSABLE ? String(item.RESPONSABLE).trim() : 'Sin Asignar';
        const inicialDev = responsable.charAt(0).toUpperCase();
        const proceso = item.PROCESO ? String(item.PROCESO).trim() : 'Sin Título';
        const estado = item.ESTADO ? String(item.ESTADO).trim() : 'Backlog';
        const plataforma = item.PLATAFORMA ? String(item.PLATAFORMA).trim() : '-';
        const area = item.ÁREA ? String(item.ÁREA).trim() : '-'; // Obtenemos el Área
        
        const isProd = estado.toLowerCase() === 'prod';
        const iconEstado = isProd ? '✓' : (estado.toLowerCase().includes('curso') ? '⚙' : '⏳');
        
        const row = document.createElement('div');
        row.className = 'project-row';
        
        // ¡NUEVO! Guardamos la información detallada como atributos de datos para el detector JS
        row.innerHTML = `
            <div class="project-bar ${isProd ? 'estado-prod' : ''}" 
                 style="left: ${pos.left}%; width: ${pos.width}%;"
                 data-full-proceso="${proceso}" 
                 data-area="${area}" 
                 data-estado="${estado}">
                
                <div class="bar-content-classic">
                    <span class="truncate-classic truncate" title="${proceso}">${proceso}</span>
                    <span class="dev-pill" title="${responsable}">${responsable}</span>
                </div>

                <div class="bar-content-advanced">
                    <span class="truncate-advanced truncate" title="${proceso}">${proceso}</span>
                    <div class="floating-bubbles">
                        <div class="bubble" title="Estado: ${estado}">${iconEstado}</div>
                        <div class="bubble" title="Plataforma: ${plataforma}">${plataforma.charAt(0).toUpperCase()}</div>
                        <div class="bubble dev-initial" title="Responsable">
                            ${inicialDev}<span class="dev-full">${responsable.substring(1)}</span>
                        </div>
                    </div>
                </div>

            </div>
        `;
        projectsArea.appendChild(row);
    });

    // Restaurar la vista seleccionada si el toggle está activo
    const isAdvanced = viewToggle.checked;
    toggleViews(isAdvanced);
}

// --- 5. LÓGICA DEL DETECTOR DE TRUNACIÓN Y TOOLTIP INTELIGENTE (TIPO image_5.png) ---
// Usamos event delegation para mejor rendimiento
projectsArea.addEventListener('mouseover', (e) => {
    // Buscamos si el hover está sobre una barra de proyecto
    const projectBar = e.target.closest('.project-bar');
    if (!projectBar) return;

    // Obtenemos el elemento que contiene el nombre del proyecto en la Vista Clásica
    const truncateSpan = projectBar.querySelector('.bar-content-classic .truncate-classic');
    if (!truncateSpan) return;

    // ---> DETECTOR DE TRUNACIÓN (CRÍTICO) <---
    // Comprobamos si el ancho de scroll es mayor que el ancho de cliente.
    // Esto nos dice si el nombre NO se está mostrando completo.
    if (truncateSpan.scrollWidth > truncateSpan.clientWidth) {
        
        // Obtenemos la información detallada guardada en los atributos de datos
        const fullProceso = projectBar.getAttribute('data-full-proceso');
        const area = projectBar.getAttribute('data-area');
        const estado = projectBar.getAttribute('data-estado');

        // Construimos dinámicamente el HTML interno del Tooltip con la estructura de image_5.png
        projectTooltip.innerHTML = `
            <div class="tooltip-title">${fullProceso}</div>
            <div class="tooltip-area-line"><span class="tooltip-area-label">Área:</span> ${area}</div>
            <div class="tooltip-status-line"><span class="tooltip-status-label">Estado:</span> ${estado}</div>
        `;

        // Calculamos el posicionamiento dinámico del tooltip
        const barRect = projectBar.getBoundingClientRect();
        const tooltipWidth = projectTooltip.offsetWidth;
        const tooltipHeight = projectTooltip.offsetHeight;

        // Posicionamiento por defecto: directamente debajo de la barra
        let tooltipLeft = barRect.left + (barRect.width / 2) - (tooltipWidth / 2);
        let tooltipTop = barRect.bottom + 10;

        // --- CONTROL DE LÍMITES DE PANTALLA ---
        // Vital para proyectores: Evitamos que el tooltip se salga de la pantalla.
        
        // Límite Derecho
        if (tooltipLeft + tooltipWidth > window.innerWidth) {
            tooltipLeft = window.innerWidth - tooltipWidth - 20;
        }

        // Límite Izquierdo
        if (tooltipLeft < 0) {
            tooltipLeft = 20;
        }

        // Límite Inferior
        if (tooltipTop + tooltipHeight > window.innerHeight) {
            // Si no cabe debajo, lo posicionamos arriba de la barra
            tooltipTop = barRect.top - tooltipHeight - 10;
        }

        // Aplicamos las coordenadas calculadas
        projectTooltip.style.left = `${tooltipLeft}px`;
        projectTooltip.style.top = `${tooltipTop}px`;
        projectTooltip.style.display = 'block'; // Mostramos el Tooltip
    }
});

// Ocultar el Tooltip al salir del hover
projectsArea.addEventListener('mouseout', (e) => {
    const projectBar = e.target.closest('.project-bar');
    if (projectBar) {
        projectTooltip.style.display = 'none';
    }
});

// --- 6. TOGGLE VISTAS ---
function toggleViews(isAdvanced) {
    const classics = document.querySelectorAll('.bar-content-classic');
    const advanced = document.querySelectorAll('.bar-content-advanced');
    
    // Ocultamos el tooltip al cambiar de vista
    projectTooltip.style.display = 'none';
    
    classics.forEach(el => el.style.display = isAdvanced ? 'none' : 'flex');
    advanced.forEach(el => el.style.display = isAdvanced ? 'flex' : 'none');
}

viewToggle.addEventListener('change', (e) => {
    toggleViews(e.target.checked);
});

// --- 7. LLAMADA REAL A LA API (FETCH) ---
async function initRoadmap() {
    renderTimelineHeaders();
    positionTodayLine();

    // TU URL OFICIAL DE PRODUCCIÓN
    const API_URL = 'https://script.google.com/macros/s/AKfycbxIIREskYhByQ1z6bH7G8IJNHnNfR2esJbhJhwho0UPEEVutqmftQGehcmM3nZHh3iY/exec';

    try {
        projectsArea.innerHTML = '<div style="padding: 20px; text-align: center; font-weight: 600; color: var(--blue-dark);">Cargando roadmap desde Sheets... 🚀</div>';

        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error en la red');
        
        const data = await response.json();
        
        // Debug para la consola (Presiona F12 en el navegador para verlo)
        console.log("👀 DATOS RECIBIDOS DE SHEETS:", data);
        
        renderProjects(data);

    } catch (error) {
        console.error("Error cargando los datos:", error);
        projectsArea.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--coral-accent); font-weight: 600;">Error al cargar los datos. Verifica la conexión o la URL en consola.</div>';
    }
}

// Arrancamos
initRoadmap();
