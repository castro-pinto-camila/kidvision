/**
 * Constancia imprimible y enlace de WhatsApp. Dos partes separadas: la de la
 * familia (sin dioptrías ni categoría) y la del profesional de salud.
 */
import type { Evaluacion } from '../data/salon';
import {
  desenfoqueSimulado,
  enlaceWhatsapp,
  ES_ESTIMACION,
  mensajeWhatsapp,
  textoFamilia,
  textoProfesional,
} from '../logic/constancia';
import { h } from './dom';
import { icono } from './iconos';

const SVG = 'http://www.w3.org/2000/svg';
/** Altura de las letras grandes del pizarrón dibujado, en píxeles. */
const ALTO_LETRA = 30;

/** Pizarrón simple; `desenfoque` en fracciones de la altura de la letra. */
function pizarron(desenfoque: number): SVGSVGElement {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 240 150');
  svg.setAttribute('class', 'pizarron');
  svg.setAttribute('aria-hidden', 'true');
  // El desenfoque va en un filtro SVG, en unidades del dibujo: así escala con el tamaño de la imagen.
  const id = `desenfoque-${Math.round(desenfoque * 1000)}`;
  svg.innerHTML = `<defs><filter id="${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${(desenfoque * ALTO_LETRA).toFixed(2)}"/></filter></defs>
    <rect x="0" y="0" width="240" height="150" rx="8" fill="#1f5135"/>
    <g fill="#f5f5f0" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle"${desenfoque > 0 ? ` filter="url(#${id})"` : ''}>
      <text x="120" y="54" font-size="${ALTO_LETRA * 1.35}">A B C</text>
      <text x="120" y="96" font-size="24">2 + 3 = 5</text>
      <text x="120" y="128" font-size="15">mamá ama a su perro</text>
    </g>`;
  return svg;
}

export function montarConstancia(raiz: HTMLElement, ev: Evaluacion, volver: () => void): () => void {
  const s = ev.sesion;
  const familia = textoFamilia(s);
  const profesional = textoProfesional(s);
  const desenfoque = desenfoqueSimulado(s);
  const fecha = s.fecha.slice(0, 10).split('-').reverse().join('/');
  const mensaje = mensajeWhatsapp(s, ev.estudiante.codigo, ev.estudiante.colegio);

  raiz.replaceChildren(
    h(
      'main',
      { class: 'pagina constancia' },
      h(
        'div',
        { class: 'no-imprimir acciones-constancia' },
        h('button', { class: 'boton secundario', 'aria-label': 'Volver', onclick: volver }, icono('atras')),
        h(
          'a',
          { class: 'boton principal', href: enlaceWhatsapp(mensaje), target: '_blank', rel: 'noopener' },
          icono('whatsapp'),
          'Enviar por WhatsApp',
        ),
        h('button', { class: 'boton', onclick: () => window.print() }, icono('imprimir'), 'Imprimir'),
      ),
      h(
        'header',
        { class: 'membrete' },
        h('strong', {}, 'KidVision · Prueba de la vista en la escuela'),
        h('span', {}, [ev.estudiante.colegio, `Código ${ev.estudiante.codigo}`, fecha].filter(Boolean).join(' · ')),
      ),

      h(
        'section',
        { class: `para-familia ${s.semaforo.toLowerCase()}` },
        h('h2', {}, 'Para la familia'),
        h('p', { class: 'titulo-familia' }, familia.titulo),
        h('p', {}, familia.resumen),
        h(
          'ul',
          { class: 'ojos-familia' },
          h('li', {}, h('strong', {}, 'Ojo derecho: '), familia.ojos.OD),
          h('li', {}, h('strong', {}, 'Ojo izquierdo: '), familia.ojos.OI),
        ),
        desenfoque > 0 &&
          h(
            'figure',
            { class: 'simulacion' },
            h('div', {}, pizarron(0), h('span', {}, 'Con buena vista')),
            h('div', {}, pizarron(desenfoque), h('span', {}, 'Como ve su hijo de lejos')),
            h(
              'figcaption',
              {},
              'Simulación aproximada: sirve para darse una idea, no muestra exactamente cómo ve su hijo.',
            ),
          ),
        ...familia.avisos.map((a) => h('p', { class: 'aviso-familia' }, a)),
      ),

      h(
        'section',
        { class: 'para-profesional' },
        h('h2', {}, 'Para el profesional de salud'),
        h('p', { class: 'nota' }, ES_ESTIMACION),
        h(
          'div',
          { class: 'ojos-profesional' },
          h('div', {}, h('h3', {}, 'Ojo derecho (OD)'), h('ul', {}, ...profesional.OD.map((l) => h('li', {}, l)))),
          h('div', {}, h('h3', {}, 'Ojo izquierdo (OI)'), h('ul', {}, ...profesional.OI.map((l) => h('li', {}, l)))),
        ),
        h(
          'p',
          { class: 'nota' },
          'Tamizaje con caja óptica (lentes de +3.00 D) y búsqueda del punto remoto; la miopía estimada es la vergencia en el ojo de la primera posición en que el niño leyó la línea.',
        ),
      ),
    ),
  );
  return () => {};
}
