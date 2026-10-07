document.addEventListener('DOMContentLoaded', () => {
    let rutinaData = [];
    let currentDiaId = '';
    const cacheBuster = new Date().getTime();

    // --- MODO OSCURO / CLARO ---
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = themeToggleBtn.querySelector('i');
    
    const savedTheme = localStorage.getItem('gymapp_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let currentTheme = 'light';
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        currentTheme = 'dark';
    }
    
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            themeIcon.classList.remove('ph-moon');
            themeIcon.classList.add('ph-sun');
        } else {
            themeIcon.classList.remove('ph-sun');
            themeIcon.classList.add('ph-moon');
        }
    }
    
    applyTheme(currentTheme);
    
    themeToggleBtn.onclick = () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('gymapp_theme', currentTheme);
        applyTheme(currentTheme);
    };
    
    // --- CARGAR DATOS ---
    fetch(`data/rutina.json?v=${cacheBuster}`)
        .then(response => response.json())
        .then(data => {
            rutinaData = data.dias;
            renderTabs();
            if(rutinaData.length > 0) {
                currentDiaId = rutinaData[0].id;
                renderContent(currentDiaId);
            }
        })
        .catch(error => console.error("Error cargando el JSON:", error));

    function renderTabs() {
        const tabsContainer = document.getElementById('tabs-container');
        tabsContainer.innerHTML = '';

        rutinaData.forEach((dia, index) => {
            const btn = document.createElement('button');
            btn.className = `tab-btn ${index === 0 ? 'active' : ''}`;
            btn.textContent = dia.titulo;
            btn.onclick = () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentDiaId = dia.id;
                renderContent(dia.id);
            };
            tabsContainer.appendChild(btn);
        });
    }

    function createExerciseCard(ej, exKey, isOpcional = false) {
        const savedState = getSavedExData(exKey);
        const setCount = parseSetCount(ej.series);
        const isCompleted = isAllCompleted(savedState, setCount);
        
        let setsHtml = '';
        for (let i = 0; i < setCount; i++) {
            const isChecked = savedState.sets && savedState.sets[i];
            setsHtml += `
                <button class="set-pill ${isChecked ? 'completed' : ''}" 
                        data-exkey="${exKey}" 
                        data-setindex="${i}">
                    ${i + 1}
                </button>
            `;
        }

        const borderStyle = isOpcional ? 'style="border-left: 4px solid var(--success);"' : '';
        const opcionalLabel = isOpcional ? '<span style="font-size:0.75rem; color:var(--success); font-weight:600; text-transform:uppercase;">Opcional Core</span><br>' : '';

        return `
            <div class="card ${isCompleted ? 'completed-card' : ''}" ${borderStyle}>
                <div class="card-header">
                    <div class="card-title">${opcionalLabel}${ej.nombre}</div>
                    <a href="${ej.link}" target="_blank" class="card-link pdf-exclude" aria-label="Ver técnica">
                        <i class="ph ph-video-camera"></i>
                    </a>
                </div>
                <div class="stats-grid">
                    <div class="stat-item"><i class="ph ph-barbell"></i> ${ej.series}</div>
                    <div class="stat-item"><i class="ph ph-gauge"></i> RIR ${ej.rir}</div>
                    <div class="stat-item"><i class="ph ph-timer"></i> ${ej.descanso}</div>
                </div>

                <div class="tracker-container pdf-exclude">
                    <div class="weight-tracker">
                        <i class="ph ph-scales"></i>
                        <input type="number" 
                               class="weight-input" 
                               placeholder="0" 
                               value="${savedState.weight || ''}" 
                               data-exkey="${exKey}"> kg
                    </div>
                    <div class="sets-tracker">
                        ${setsHtml}
                    </div>
                </div>

                ${ej.nota ? `<div class="card-note">${ej.nota}</div>` : ''}
            </div>
        `;
    }

    function renderContent(diaId) {
        const container = document.getElementById('content-container');
        container.innerHTML = '';

        const dia = rutinaData.find(d => d.id === diaId);
        if (!dia) return;

        // 1. Calentamiento
        if (dia.calentamiento && dia.calentamiento.length > 0) {
            const listItems = dia.calentamiento.map(item => `<li style="margin-bottom: 6px;">${item}</li>`).join('');
            container.innerHTML += `
                <div class="card" style="background-color: var(--primary-light); border-color: transparent;">
                    <div class="card-title" style="margin-bottom: 10px; font-size: 1rem;">
                        <i class="ph ph-fire"></i> Calentamiento y Movilidad
                    </div>
                    <ul style="padding-left: 20px; font-size: 0.85rem; color: var(--text-main);">
                        ${listItems}
                    </ul>
                </div>
            `;
        }

        // 2. Ejercicios
        if (dia.ejercicios) {
            dia.ejercicios.forEach((ej, exIndex) => {
                const exKey = `gymapp_${diaId}_ex_${exIndex}`;
                container.innerHTML += createExerciseCard(ej, exKey, false);
            });
        }

        // 3. Diástasis
        if (dia.diastasis) {
            dia.diastasis.forEach((ej, exIndex) => {
                const exKey = `gymapp_${diaId}_dias_${exIndex}`;
                container.innerHTML += createExerciseCard(ej, exKey, true);
            });
        }

        attachEventListeners();
    }

    // --- LOCALSTORAGE Y EVENTOS ---
    function getSavedExData(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : { weight: '', sets: {} };
    }

    function saveExData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function parseSetCount(seriesStr) {
        const match = seriesStr.match(/^(\d+)/);
        return match ? parseInt(match[1], 10) : 3;
    }

    function isAllCompleted(savedState, totalSets) {
        if (!savedState.sets) return false;
        let count = 0;
        for (let i = 0; i < totalSets; i++) {
            if (savedState.sets[i]) count++;
        }
        return count === totalSets && totalSets > 0;
    }

    function attachEventListeners() {
        document.querySelectorAll('.weight-input').forEach(input => {
            input.oninput = (e) => {
                const key = e.target.dataset.exkey;
                const state = getSavedExData(key);
                state.weight = e.target.value;
                saveExData(key, state);
            };
        });

        document.querySelectorAll('.set-pill').forEach(btn => {
            btn.onclick = (e) => {
                const key = e.target.dataset.exkey;
                const setIdx = e.target.dataset.setindex;
                const state = getSavedExData(key);

                if (!state.sets) state.sets = {};
                state.sets[setIdx] = !state.sets[setIdx];

                saveExData(key, state);
                renderContent(currentDiaId); 
            };
        });
    }

    // Botón Reset
    const resetBtn = document.getElementById('reset-day-btn');
    if (resetBtn) {
        resetBtn.onclick = () => {
            if (confirm("¿Querés reiniciar las series completadas del día actual?")) {
                const dia = rutinaData.find(d => d.id === currentDiaId);
                if (dia) {
                    const clearSets = (key) => {
                        const state = getSavedExData(key);
                        state.sets = {}; 
                        saveExData(key, state);
                    };

                    if (dia.ejercicios) dia.ejercicios.forEach((_, i) => clearSets(`gymapp_${currentDiaId}_ex_${i}`));
                    if (dia.diastasis) dia.diastasis.forEach((_, i) => clearSets(`gymapp_${currentDiaId}_dias_${i}`));
                    
                    renderContent(currentDiaId);
                }
            }
        };
    }

    // --- DESCARGAR PDF LIMPIO ---
    const pdfBtn = document.getElementById('pdf-btn');
    if (pdfBtn) {
        pdfBtn.onclick = () => {
            const element = document.getElementById('content-container');
            const diaActual = rutinaData.find(d => d.id === currentDiaId);
            const tituloDia = diaActual ? diaActual.titulo.replace(/[^a-zA-Z0-9]/g, '_') : 'rutina';

            // Ocultar elementos interactivos y links a tiktok con una clase temporal
            document.querySelectorAll('.pdf-exclude').forEach(el => el.style.display = 'none');

            const options = {
                margin:       10,
                filename:     `gymapp_${tituloDia}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            html2pdf().from(element).set(options).save().then(() => {
                // Volver a mostrar los elementos ocultos al terminar
                document.querySelectorAll('.pdf-exclude').forEach(el => el.style.display = '');
            });
        };
    }

    // --- MASCOTA ALEATORIA ---
    const mascot = document.getElementById('mascot-container');
    const speech = document.getElementById('mascot-speech');
    const mascotIcon = document.getElementById('mascot-icon');
    
    const mascotasSvg = [
        `<svg viewBox="0 0 64 64" width="48" height="48" fill="none"><path d="M32 8C20.954 8 12 16.954 12 28v20c0 2.2 2.6 3.5 4.4 2.2L23 45l5.6 3.7c2.1 1.4 4.7 1.4 6.8 0L41 45l6.6 5.2c1.8 1.3 4.4 0 4.4-2.2V28C52 16.954 43.046 8 32 8z" fill="#E8D5F5"/><circle cx="25" cy="26" r="3" fill="#4A404A"/><circle cx="39" cy="26" r="3" fill="#4A404A"/><path d="M28 32c2 2 6 2 8 0" stroke="#4A404A" stroke-width="2" stroke-linecap="round"/><circle cx="20" cy="30" r="2.5" fill="#F3C4D8" opacity="0.8"/><circle cx="44" cy="30" r="2.5" fill="#F3C4D8" opacity="0.8"/></svg>`,
        `<svg viewBox="0 0 64 64" width="48" height="48" fill="none"><path d="M14 16 L22 30 L42 30 L50 16 L44 48 L20 48 Z" fill="#2d2a26"/><circle cx="24" cy="26" r="3" fill="#c49a6c"/><circle cx="40" cy="26" r="3" fill="#c49a6c"/><path d="M22 40 Q32 50 42 40" fill="#c49a6c"/><circle cx="32" cy="42" r="3" fill="#2d2a26"/><circle cx="27" cy="34" r="2.5" fill="#fff"/><circle cx="37" cy="34" r="2.5" fill="#fff"/><circle cx="27" cy="34" r="1" fill="#000"/><circle cx="37" cy="34" r="1" fill="#000"/></svg>`,
        `<svg viewBox="0 0 64 64" width="48" height="48" fill="none"><rect x="16" y="22" width="32" height="24" rx="12" fill="#a8e6cf"/><path d="M18 28 Q10 24 6 30" stroke="#a8e6cf" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M46 28 Q54 24 58 30" stroke="#a8e6cf" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M24 16 L26 22 M40 16 L38 22" stroke="#ffb7b2" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="30" r="3.5" fill="#2d6a4f"/><circle cx="40" cy="30" r="3.5" fill="#2d6a4f"/><path d="M28 36 Q32 40 36 36" stroke="#2d6a4f" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`,
        `<svg viewBox="0 0 64 64" width="48" height="48" fill="none"><circle cx="32" cy="34" r="16" fill="#3a3a3a"/><path d="M32 14L34 18M32 54L34 50M14 34L18 36M50 34L46 36M20 20L24 24M44 48L40 44M20 48L24 44M44 20L40 24" stroke="#3a3a3a" stroke-width="3" stroke-linecap="round"/><circle cx="27" cy="32" r="5" fill="#fff"/><circle cx="39" cy="32" r="5" fill="#fff"/><circle cx="27" cy="32" r="2" fill="#000"/><circle cx="39" cy="32" r="2" fill="#000"/></svg>`
    ];

    const frases = [
        "¡A darle con todo hoy! 💪",
        "¡Respiración y bracing abdominal!",
        "¡Controlá la bajada 3 seg! 🏋️‍♂️",
        "¡Esa última repetición cuenta!",
        "¡Mantené el foco!",
        "¡Anotá tus pesos para la próxima!"
    ];

    if (mascot && mascotIcon) {
        mascotIcon.innerHTML = mascotasSvg[Math.floor(Math.random() * mascotasSvg.length)];
        mascot.onclick = () => {
            speech.textContent = frases[Math.floor(Math.random() * frases.length)];
        };
    }
});
