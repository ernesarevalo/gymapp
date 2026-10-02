document.addEventListener('DOMContentLoaded', () => {
    let rutinaData = [];
    
    // Hace la petición a la nueva ruta
    fetch('data/rutina.json')
        .then(response => response.json())
        .then(data => {
            rutinaData = data.dias;
            renderTabs();
            // Renderiza el primer día por defecto si existen datos
            if(rutinaData.length > 0) renderContent(rutinaData[0].id);
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
                // Remueve la clase active de todos los botones
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                // Agrega la clase active al botón clickeado
                btn.classList.add('active');
                renderContent(dia.id);
            };
            tabsContainer.appendChild(btn);
        });
    }

    function renderContent(diaId) {
        const container = document.getElementById('content-container');
        container.innerHTML = ''; // Limpiar la vista actual

        const dia = rutinaData.find(d => d.id === diaId);
        if (!dia) return;

        dia.ejercicios.forEach(ej => {
            const card = document.createElement('div');
            card.className = 'card';
            
            card.innerHTML = `
                <div class="card-header">
                    <div class="card-title">${ej.nombre}</div>
                    <a href="${ej.link}" target="_blank" class="card-link" aria-label="Ver técnica">
                        <i class="ph ph-video-camera"></i>
                    </a>
                </div>
                <div class="stats-grid">
                    <div class="stat-item"><i class="ph ph-barbell"></i> ${ej.series}</div>
                    <div class="stat-item"><i class="ph ph-gauge"></i> RPE ${ej.rpe}</div>
                    <div class="stat-item"><i class="ph ph-timer"></i> ${ej.descanso}</div>
                </div>
                ${ej.nota ? `<div class="card-note">${ej.nota}</div>` : ''}
            `;
            
            container.appendChild(card);
        });
    }
});