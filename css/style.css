const YEAR = new Date().getFullYear(); 
const IS_LEAP = (YEAR % 4 === 0 && YEAR % 100 !== 0) || (YEAR % 400 === 0);
const DAYS_IN_YEAR = IS_LEAP ? 366 : 365;

const timelineHeader = document.getElementById('timelineHeader');
const todayLine = document.getElementById('todayLine');
const projectsArea = document.getElementById('projectsArea');
const zoomToggle = document.getElementById('zoomToggle'); 
const labelSemanas = document.getElementById('labelSemanas');
const labelMeses = document.getElementById('labelMeses');
const projectTooltip = document.getElementById('projectTooltip'); 

// Constantes de Zoom
const WIDTH_SEMANAS = '2500px';
const WIDTH_MESES = '1000px';

function renderTimelineHeaders() {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    let qHTML = '<div class="time-row row-quarters">';
    quarters.forEach(q => qHTML += `<div class="time-cell">${q}</div>`);
    qHTML += '</div>';

    let mHTML = '<div class="time-row row-months">';
    months.forEach(m => mHTML += `<div class="time-cell">${m}</div>`);
    mHTML += '</div>';

    let wHTML = '<div class="time-row row-weeks" id="rowWeeks">';
    for(let i=0; i<12; i++) {
        wHTML += `<div class="time-cell">S1</div><div class="time-cell">S2</div><div class="time-cell">S3</div><div class="time-cell">S4</div>`;
    }
    wHTML += '</div>';

    timelineHeader.innerHTML = qHTML + mHTML + wHTML;
}

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

function parseDateRobust(dateStr) {
    if (!dateStr) return new Date();
    let str = String(dateStr).trim();
    if (str.includes('/')) {
        const parts = str.split('/');
        str = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    const cleanDate = str.substring(0, 10);
    return new Date(`${cleanDate}T00:00:00`);
}

function calculateBarPosition(startDateStr, endDateStr) {
    const start = parseDateRobust(startDateStr);
    const end = parseDateRobust(endDateStr);
    const startDay = getDayOfYear(start);
    const endDay = getDayOfYear(end);
    let leftPercent = (startDay / DAYS_IN_YEAR) * 100;
    let widthPercent = ((endDay - startDay) / DAYS_IN_YEAR) * 100;

    if (leftPercent < 0) leftPercent = 0;
    if (widthPercent < 1) widthPercent = 1; 
    return { left: leftPercent, width: widthPercent };
}

function getInitials(name) {
    if (!name || name === 'Sin Asignar') return '-';
    const words = name.trim().split(' ').filter(w => w.length > 0);
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

function renderProjects(data) {
    projectsArea.innerHTML = '';
    const validData = data.filter(item => item['FECHA INICIO'] && item['FECHA FIN']);

    validData.forEach(item => {
        const pos = calculateBarPosition(item['FECHA INICIO'], item['FECHA FIN']);
        
        const responsable = item.RESPONSABLE ? String(item.RESPONSABLE).trim() : 'Sin Asignar';
        const inicialesDev = getInitials(responsable); 
        const proceso = item.PROCESO ? String(item.PROCESO).trim() : 'Sin Título';
        const estado = item.ESTADO ? String(item.ESTADO).trim() : 'Backlog';
        const area = item.ÁREA ? String(item.ÁREA).trim() : '-'; 
        
        const isProd = estado.toLowerCase() === 'prod';
        
        const row = document.createElement('div');
        row.className = 'project-row';
        
        row.innerHTML = `
            <div class="project-bar ${isProd ? 'estado-prod' : ''}" 
                 style="left: ${pos.left}%; width: ${pos.width}%;"
                 data-full-proceso="${proceso}" 
                 data-area="${area}" 
                 data-estado="${estado}">
                
                <div class="bar-content-classic">
                    <span class="truncate-classic truncate" title="${proceso}">${proceso}</span>
                    <span class="dev-pill" title="${responsable}">${inicialesDev}</span>
                </div>
            </div>
        `;
        projectsArea.appendChild(row);
    });
}

// LÓGICA DE ZOOM Y ANIMACIÓN
function updateZoomLevel() {
    const isMonthsView = zoomToggle.checked;
    const root = document.documentElement;
    const timelineHeaderElement = document.getElementById('timelineHeader');

    if (isMonthsView) {
        // Vista Meses: Comprimimos el ancho y ocultamos semanas
        root.style.setProperty('--timeline-current-width', WIDTH_MESES);
        timelineHeaderElement.classList.add('view-months');
        labelMeses.classList.add('label-active');
        labelMeses.classList.remove('label-inactive');
        labelSemanas.classList.add('label-inactive');
        labelSemanas.classList.remove('label-active');
    } else {
        // Vista Semanas: Expandimos a 2500px y mostramos semanas
        root.style.setProperty('--timeline-current-width', WIDTH_SEMANAS);
        timelineHeaderElement.classList.remove('view-months');
        labelSemanas.classList.add('label-active');
        labelSemanas.classList.remove('label-inactive');
        labelMeses.classList.add('label-inactive');
        labelMeses.classList.remove('label-active');
    }
}

zoomToggle.addEventListener('change', updateZoomLevel);

// Tooltip Logic
projectsArea.addEventListener('mouseover', (e) => {
    const projectBar = e.target.closest('.project-bar');
    if (!projectBar) return;
    const truncateSpan = projectBar.querySelector('.truncate-classic');
    if (!truncateSpan) return;

    if (truncateSpan.scrollWidth > truncateSpan.clientWidth) {
        const fullProceso = projectBar.getAttribute('data-full-proceso');
        const area = projectBar.getAttribute('data-area');
        const estado = projectBar.getAttribute('data-estado');

        projectTooltip.innerHTML = `
            <div class="tooltip-title">${fullProceso}</div>
            <div class="tooltip-area-line"><span class="tooltip-area-label">Área:</span> ${area}</div>
            <div class="tooltip-status-line"><span class="tooltip-status-label">Estado:</span> ${estado}</div>
        `;

        const barRect = projectBar.getBoundingClientRect();
        const tooltipWidth = projectTooltip.offsetWidth;
        const tooltipHeight = projectTooltip.offsetHeight;

        let tooltipLeft = barRect.left + (barRect.width / 2) - (tooltipWidth / 2);
        let tooltipTop = barRect.bottom + 10;
        
        if (tooltipLeft + tooltipWidth > window.innerWidth) tooltipLeft = window.innerWidth - tooltipWidth - 20;
        if (tooltipLeft < 0) tooltipLeft = 20;
        if (tooltipTop + tooltipHeight > window.innerHeight) tooltipTop = barRect.top - tooltipHeight - 10;

        projectTooltip.style.left = `${tooltipLeft}px`;
        projectTooltip.style.top = `${tooltipTop}px`;
        projectTooltip.style.display = 'block'; 
    }
});

projectsArea.addEventListener('mouseout', (e) => {
    const projectBar = e.target.closest('.project-bar');
    if (projectBar) projectTooltip.style.display = 'none';
});

async function initRoadmap() {
    renderTimelineHeaders();
    positionTodayLine();
    
    // Inicializar estado visual del toggle
    updateZoomLevel();

    const API_URL = 'https://script.google.com/macros/s/AKfycbxIIREskYhByQ1z6bH7G8IJNHnNfR2esJbhJhwho0UPEEVutqmftQGehcmM3nZHh3iY/exec';

    try {
        projectsArea.innerHTML = '<div style="padding: 20px; text-align: center; font-weight: 600; color: var(--blue-dark);">Cargando roadmap desde Sheets... 🚀</div>';
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error en la red');
        const data = await response.json();
        renderProjects(data);
    } catch (error) {
        console.error("Error cargando los datos:", error);
        projectsArea.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--coral-accent); font-weight: 600;">Error al cargar los datos. Verifica la conexión o la URL en consola.</div>';
    }
}

initRoadmap();
