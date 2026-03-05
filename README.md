# Mini Agenda de Tareas

Pequeña aplicación web para crear, editar y eliminar tareas con estado, fecha de cumplimiento y duración estimada.

Archivos:
- `index.html` - Interfaz principal
- `styles.css` - Estilos
- `app.js` - Lógica: crear/editar/eliminar, persistencia en `localStorage`

Cómo usar:
1. Abrir `index.html` en un navegador moderno.
2. Rellenar el formulario para crear una tarea.
3. Usar los botones "Editar" y "Eliminar" en cada tarea.

Notas:
- Los estados soportados son: Sin iniciar, En proceso, Finalizada, Reprogramada (cada uno con color).
- Los datos se guardan en `localStorage` del navegador.
