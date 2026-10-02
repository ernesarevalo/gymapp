# Mi Rutina App - Workout Tracker 🏋️‍♂️️

Una aplicación web estática y minimalista diseñada para gestionar, visualizar y seguir rutinas de entrenamiento de forma estructurada. Creada con un enfoque *aesthetic* (tonos pastel), la aplicación permite navegar ágilmente entre los distintos días de entrenamiento desde una interfaz optimizada para dispositivos móviles.

## 🚀 Características Principales (Features)

* 🎨 **Diseño Aesthetic & UI Limpia:** Paleta de colores lila/rosa pastel con tipografía *Inter* e íconos vectoriales livianos (*Phosphor Icons*).
* 🌗 **Dark Mode Automático:** La interfaz detecta las preferencias del sistema del usuario y cambia a una paleta oscura sin intervención manual (`prefers-color-scheme`).
* 📱 **Mobile-First & Responsivo:** Pensada para ser usada cómodamente desde un teléfono móvil.
* ⚡ **Navegación por Pestañas:** Cambio fluido entre los días de entrenamiento que inyecta el contenido en el DOM sin recargar la página.
* 🔗 **Integración de Medios:** Cada ejercicio incluye un enlace externo directo para buscar referencias de técnica en video.
* ⚙️ **Escalable:** Los datos de la rutina se consumen desde un archivo JSON, lo que permite editar o agregar nuevos días sin tocar el código fuente HTML/JS.

## 🛠️ Tecnologías (Tech Stack)

* **HTML5:** Estructura semántica.
* **CSS3:** Variables CSS para manejo de temas (Light/Dark).
* **Vanilla JavaScript (ES6+):** Lógica del lado del cliente, manipulación del DOM y consumo asíncrono con Fetch API.
* **JSON:** Base de datos estática de solo lectura.

## 📁 Estructura del Proyecto

```text
mi-rutina-app/
├── data/
│   └── rutina.json      # Base de datos estática
├── css/
│   └── style.css        # Estilos y variables de color
├── js/
│   └── script.js        # Lógica de renderizado y Fetch API
├── index.html           # Punto de entrada principal
└── README.md            # Documentación del proyecto