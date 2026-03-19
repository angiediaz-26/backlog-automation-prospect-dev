const YEAR = new Date().getFullYear(); 
const IS_LEAP = (YEAR % 4 === 0 && YEAR % 100 !== 0) || (YEAR % 400 === 0);
const DAYS_IN_YEAR = IS_LEAP ? 366 : 365;

const timelineHeader = document.getElementById('timelineHeader');
const todayLine = document.getElementById('todayLine');
const projectsArea = document.getElementById('projectsArea');
const viewToggle = document.getElementById('viewToggle');
const projectTooltip = document.getElementById('projectTooltip'); 

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

// NUEVO: Función para extraer hasta 2 iniciales del nombre
function getInitials(name) {
    if (!name || name === 'Sin Asignar') return '-';
    // Limpiamos espacios extra y separamos por palabras
    const words = name.trim().split(' ').filter(w => w.length > 0);
    // Si solo hay un nombre, sacamos 1 letra. Si hay más, sacamos 2 letras.
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

function renderProjects(data) {
    projectsArea.innerHTML = '';
    const validData = data.filter(item => item['FECHA INICIO'] && item['FECHA FIN']);

    validData.forEach(item => {
        const pos = calculateBarPosition(item['FECHA INICIO'], item['FECHA FIN']);
        
        const responsable = item.RESPONSABLE ? String(item.RESPONSABLE).trim() : 'Sin Asignar';
        const inicialesDev = getInitials(responsable); // Usamos la nueva función (Ej: AL)
        const proceso = item.PROCESO ? String(item.PROCESO).trim() : 'Sin Título';
        const estado = item.ESTADO ? String(item.ESTADO).trim() : 'Backlog';
        const plataforma = item.PLATAFORMA ? String(item.PLATAFORMA).trim() : '-';
        const area = item.ÁREA ? String(item.ÁREA).trim() : '-'; 
        
        const isProd = estado.toLowerCase() === 'prod';
        const iconEstado = isProd ? '✓' : (estado.toLowerCase().includes('curso') ? '⚙' : '⏳');
        
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

                <div class="bar-content-advanced">
                    <span class="truncate-advanced truncate" title="${proceso}">${proceso}</span>
                    <div class="floating-bubbles">
                        <div class="bubble" title="Estado: ${estado}">${iconEstado}</div>
                        <div class="bubble" title="Plataforma: ${plataforma}">${plataforma.charAt(0).toUpperCase()}</div>
                        <div class="bubble dev-initial" title="Responsable">
                            ${inicialesDev.charAt(0)}<span class="dev-full">${responsable.substring(1)}</span>
                        </div>
                    </div>
                </div>

            </div>
        `;
        projectsArea.appendChild(row);
    });

    const isAdvanced = viewToggle.checked;
    toggleViews(isAdvanced);
}

// Detector de Trunación y Tooltip
projectsArea.addEventListener('mouseover', (e) => {
    const projectBar = e.target.closest('.project-bar');
    if (!projectBar) return;

    const truncateSpan = projectBar.querySelector('.bar-content-classic .truncate-classic');
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

function toggleViews(isAdvanced) {
    const classics = document.querySelectorAll('.bar-content-classic');
    const advanced = document.querySelectorAll('.bar-content-advanced');
    
    projectTooltip.style.display = 'none';
    
    classics.forEach(el => el.style.display = isAdvanced ? 'none' : 'flex');
    advanced.forEach(el => el.style.display = isAdvanced ? 'flex' : 'none');
}

viewToggle.addEventListener('change', (e) => toggleViews(e.target.checked));

async function initRoadmap() {
    renderTimelineHeaders();
    positionTodayLine();

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
