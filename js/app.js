// --- 1. CONFIGURACIÓN DEL TIMELINE (AÑO ACTUAL) ---
const YEAR = new Date().getFullYear(); // 2026
const IS_LEAP = (YEAR % 4 === 0 && YEAR % 100 !== 0) || (YEAR % 400 === 0);
const DAYS_IN_YEAR = IS_LEAP ? 366 : 365;

// DOM Elements
const timelineHeader = document.getElementById('timelineHeader');
const todayLine = document.getElementById('todayLine');
const projectsArea = document.getElementById('projectsArea');
const viewToggle = document.getElementById('viewToggle');

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

// NUEVO: Parser de fechas a prueba de balas para Google Sheets
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
    const cleanDate = str.substring(0, 10
