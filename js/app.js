const YEAR = new Date().getFullYear(); // 2026 en tu caso
const IS_LEAP = (YEAR % 4 === 0 && YEAR % 100 !== 0) || (YEAR % 400 === 0);
const DAYS_IN_YEAR = IS_LEAP ? 366 : 365;

const timelineHeader = document.getElementById('timelineHeader');
const todayLine = document.getElementById('todayLine');
const projectsArea = document.getElementById('projectsArea');
const viewToggle = document.getElementById('viewToggle');

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

// NUEVO: Parser de fechas para entender "18/03/2026" o "2026-03-18"
function parseDateRobust(dateStr) {
    if (!dateStr) return new Date();
    // Si viene como DD/MM/YYYY desde sheets
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        // parts[0] = DD, parts[1] = MM, parts[2] = YYYY
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
    }
    // Si viene como YYYY-MM-DD
    return new Date(dateStr + 'T00:00:00');
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

function renderProjects(data) {
    projectsArea.innerHTML = '';
    
    // OJO: Usamos corchetes para leer las columnas con espacios
    const validData = data.filter(item => item['FECHA INICIO'] && item['FECHA FIN']);

    validData.forEach(item => {
        const pos = calculateBarPosition(item['FECHA INICIO'], item['FECHA FIN']);
        
        const responsable = item.RESPONSABLE ? String(item.RESPONSABLE).trim() : 'Sin Asignar';
        const inicialDev = responsable.charAt(0).toUpperCase();
        const proceso = item.PROCESO || 'Sin Título';
        const estado = item.ESTADO ? String(item.ESTADO).trim() : 'Backlog';
        const plataforma = item.PLATAFORMA ? String(item.PLATAFORMA).trim() : '-';
        
        const isProd = estado.toLowerCase() === 'prod';
        const iconEstado = isProd ? '✓' : (estado.toLowerCase().includes('curso') ? '⚙' : '⏳');
        
        const row = document.createElement('div');
        row.className = 'project-row';
        
        row.innerHTML = `
            <div class="project-bar ${isProd ? 'estado-prod' : ''}" style="left: ${pos.left}%; width: ${pos.width}%;">
                
                <div class="bar-content-classic">
                    <span class="truncate" title="${proceso}">${proceso}</span>
                    <span class="dev-pill" title="${responsable}">${responsable}</span>
                </div>

                <div class="bar-content-advanced">
                    <span class="truncate" title="${proceso}">${proceso}</span>
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

    const isAdvanced = viewToggle.checked;
    toggleViews(isAdvanced);
}

function toggleViews(isAdvanced) {
    const classics = document.querySelectorAll('.bar-content-classic');
    const advanced = document.querySelectorAll('.bar-content-advanced');
    classics.forEach(el => el.style.display = isAdvanced ? 'none' : 'flex');
    advanced.forEach(el => el.style.display = isAdvanced ? 'flex' : 'none');
}

viewToggle.addEventListener('change', (e) => {
    toggleViews(e.target.checked);
});

async function initRoadmap() {
    renderTimelineHeaders();
    positionTodayLine();

    // PEGA AQUÍ TU NUEVA URL GENERADA POR EL APPS SCRIPT ACTUALIZADO
    const API_URL = 'TU_NUEVA_URL_AQUI_TERMINADA_EN_/exec';

    try {
        projectsArea.innerHTML = '<div style="padding: 20px; text-align: center; font-weight: 600; color: var(--blue-dark);">Cargando roadmap desde Sheets... 🚀</div>';

        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error en la red');
        
        const data = await response.json();
        renderProjects(data);

    } catch (error) {
        console.error("Error cargando los datos:", error);
        projectsArea.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--coral-accent); font-weight: 600;">Error al cargar los datos. Verifica la conexión o la URL.</div>';
    }
}

initRoadmap();
