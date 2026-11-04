/**
 * Íconos dibujados en SVG dentro de la app (nada se descarga de internet).
 */

const SVG = 'http://www.w3.org/2000/svg';

const TRAZOS = {
  flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  atras: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  borrar: '<path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7z"/><path d="M12 9.5l5 5M17 9.5l-5 5"/>',
  ajustes:
    '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  regla: '<rect x="2" y="8" width="20" height="8" rx="1.5"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/>',
  ojo: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  mas: '<path d="M12 5v14M5 12h14"/>',
  subir: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
  lista: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
  whatsapp: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.5c.5 2 2 3.5 4 4l1.2-1.2 2 1-.4 1.6c-3.5.3-7.5-3.5-7.2-7l1.6-.4 1 2z"/>',
  imprimir: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="1.5"/><path d="M7 14h10v7H7z"/>',
} as const;

export type NombreIcono = keyof typeof TRAZOS;

/** Ícono de trazo, del color del texto. `giro` en grados (para las flechas). */
export function icono(nombre: NombreIcono, giro = 0): SVGSVGElement {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', 'icono-svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2.4');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  if (giro) svg.style.transform = `rotate(${giro}deg)`;
  svg.innerHTML = TRAZOS[nombre];
  return svg;
}
