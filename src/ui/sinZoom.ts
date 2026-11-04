/**
 * Evita el zoom por accidente: ampliar o achicar la página cambia el tamaño
 * de todo y echa a perder la calibración. El zoom de los ajustes del celular
 * no se puede detener; ese se detecta al empezar cada evaluación.
 */
export function bloquearZoom(): void {
  // Safari (iPhone) hace el zoom con dos dedos mediante eventos de «gesto».
  for (const tipo of ['gesturestart', 'gesturechange', 'gestureend']) {
    document.addEventListener(tipo, (e) => e.preventDefault());
  }
  // Dos dedos sobre la pantalla.
  document.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length > 1) e.preventDefault();
    },
    { passive: false },
  );
  // Ctrl + rueda del ratón (computadora).
  document.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey) e.preventDefault();
    },
    { passive: false },
  );
}
