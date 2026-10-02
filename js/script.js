document.addEventListener('DOMContentLoaded', () => {
    let rutinaData = [];
    let currentDiaId = '';
    const cacheBuster = new Date().getTime();
    
    // Cargar datos estáticos de la rutina
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

    // Lógica para crear el HTML de una tarjeta de ejercicio o diástasis
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
                    <a href="${ej.link}" target="_blank" class="card-link" aria-label="Ver técnica">
                        <i class="ph ph-video-camera"></i>
                    </a>
                </div>
                <div class="stats-grid">
                    <div class="stat-item"><i class="ph ph-barbell"></i> ${ej.series}</div>
                    <div class="stat-item"><i class="ph ph-gauge"></i> RIR ${ej.rir}</div>
                    <div class="stat-item"><i class="ph ph-timer"></i> ${ej.descanso}</div>
                </div>

                <div class="tracker-container">
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

        // 1. Renderizar Calentamiento
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

        // 2. Renderizar Ejercicios Principales
        if (dia.ejercicios) {
            dia.ejercicios.forEach((ej, exIndex) => {
                const exKey = `gymapp_${diaId}_ex_${exIndex}`;
                container.innerHTML += createExerciseCard(ej, exKey, false);
            });
        }

        // 3. Renderizar Bloque Diástasis
        if (dia.diastasis) {
            dia.diastasis.forEach((ej, exIndex) => {
                const exKey = `gymapp_${diaId}_dias_${exIndex}`;
                container.innerHTML += createExerciseCard(ej, exKey, true);
            });
        }

        attachEventListeners();
    }

    // --- Manejo de LocalStorage y Eventos ---
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
                renderContent(currentDiaId); // Re-render para iluminar tarjeta
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

    // Mascotita
    const mascot = document.getElementById('mascot-container');
    const speech = document.getElementById('mascot-speech');
    const frases = [
        "¡A darle con todo hoy! 💪",
        "¡Respiración y bracing abdominal!",
        "¡Controlá la bajada 3 seg! 🏋️‍♂️",
        "¡Esa última repetición cuenta!",
        "¡Mantené el foco!",
        "¡Anota tus pesos para la próxima!"
    ];

    if (mascot) {
        mascot.onclick = () => {
            speech.textContent = frases[Math.floor(Math.random() * frases.length)];
        };
    }
});