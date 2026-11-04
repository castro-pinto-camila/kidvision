/**
 * Preparar al niño: instrucciones con dibujos simples y el texto que dice el
 * docente, antes de empezar la prueba de un niño.
 */
import type { Estudiante, Evaluacion } from '../data/salon';
import type { AccionPaso, Paso } from '../logic/preparacion';
import { h } from './dom';
import { icono } from './iconos';
import { TEXTO_INDICACION } from './textos';

export interface ContextoPreparar {
  estudiante: Estudiante;
  historial: Evaluacion[];
  /** Lo que falta para poder evaluar (colegio, calibración o celular); null si ya se puede. */
  pendiente: Paso | null;
  /** Botón del paso pendiente. */
  resolver: (accion: AccionPaso) => void;
  empezar: () => void;
  verConstancia: (id: number) => void;
  volver: () => void;
}

const SVG = 'http://www.w3.org/2000/svg';

function dibujo(contenido: string): SVGSVGElement {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 120 80');
  svg.setAttribute('class', 'dibujo');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = contenido;
  return svg;
}

/** Dibujos de una sola idea cada uno, sin detalles. */
const DIBUJOS = {
  // Caja de costado con la bandeja y el pasador en R0.
  caja: `<rect x="10" y="30" width="96" height="26" rx="3" fill="none" stroke="currentColor" stroke-width="2.5"/>
    <rect x="80" y="20" width="6" height="36" rx="1.5" fill="#2563eb"/>
    <circle cx="92" cy="44" r="3" fill="currentColor"/><text x="92" y="70" font-size="10" text-anchor="middle" fill="currentColor">R0</text>
    <rect x="6" y="34" width="6" height="18" rx="2" fill="#16a34a"/>`,
  // Niño mirando por la caja y el docente al lado.
  ubicar: `<rect x="44" y="34" width="70" height="20" rx="3" fill="none" stroke="currentColor" stroke-width="2.5"/>
    <circle cx="30" cy="42" r="11" fill="#f59e0b"/><circle cx="16" cy="64" r="9" fill="#2563eb"/>
    <path d="M24 64 L36 64" stroke="currentColor" stroke-width="2" stroke-dasharray="3 3"/>`,
  // Una E y una mano que señala hacia donde apuntan las patitas.
  juego: `<g fill="currentColor"><rect x="18" y="20" width="8" height="40"/><rect x="18" y="20" width="36" height="8"/>
    <rect x="18" y="36" width="36" height="8"/><rect x="18" y="52" width="36" height="8"/></g>
    <path d="M66 40 H104 M94 30 L104 40 L94 50" fill="none" stroke="#2563eb" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
  // Signo de interrogación: si no ve, dice «no sé».
  nose: `<circle cx="60" cy="40" r="28" fill="none" stroke="currentColor" stroke-width="2.5"/>
    <text x="60" y="52" font-size="36" font-weight="bold" text-anchor="middle" fill="currentColor">?</text>`,
};

const PASOS: [keyof typeof DIBUJOS, string, string][] = [
  [
    'caja',
    'Prepara la caja',
    'Celular sin funda en la bandeja, con la pantalla contra el tope. Pasador en R0. Tapa +2.00 levantada.',
  ],
  [
    'ubicar',
    'Ubica al niño',
    'Que apoye la cara en el apoyo y mire por los lentes. Tú siéntate a su lado, no enfrente.',
  ],
  [
    'juego',
    'Explícale el juego',
    'Dile: «Vas a ver unas letras E. Señala con tu mano hacia dónde apuntan sus patitas».',
  ],
  ['nose', 'Si no ve, está bien', 'Dile: «Si no ves la letra, di "no sé". No hay respuestas malas».'],
];

const fechaCorta = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/');

export function montarPreparar(raiz: HTMLElement, ctx: ContextoPreparar): () => void {
  const e = ctx.estudiante;
  const detalle = [e.grado, e.edad !== null ? `${e.edad} años` : ''].filter(Boolean).join(' · ');
  raiz.replaceChildren(
    h(
      'main',
      { class: 'pagina' },
      h(
        'header',
        { class: 'cabecera' },
        h('button', { class: 'boton secundario', 'aria-label': 'Volver a Mi salón', onclick: ctx.volver }, icono('atras')),
        h('div', { class: 'titulos' }, h('h1', {}, `Preparar a ${e.codigo}`), detalle && h('p', { class: 'lema' }, detalle)),
      ),
      h(
        'ol',
        { class: 'pasos-preparar' },
        ...PASOS.map(([d, titulo, texto]) =>
          h('li', {}, dibujo(DIBUJOS[d]), h('div', {}, h('strong', {}, titulo), h('p', {}, texto))),
        ),
      ),
      ctx.pendiente &&
        h(
          'div',
          { class: 'aviso' },
          ctx.pendiente.texto,
          ctx.pendiente.boton &&
            ctx.pendiente.accion &&
            h('button', { class: 'boton principal', onclick: () => ctx.resolver(ctx.pendiente!.accion!) }, ctx.pendiente.boton),
        ),
      h(
        'button',
        { class: 'boton principal grande', disabled: ctx.pendiente !== null, onclick: ctx.empezar },
        'Empezar prueba',
      ),
      ctx.historial.length > 0 &&
        h(
          'section',
          {},
          h('h2', {}, 'Pruebas anteriores'),
          h(
            'ul',
            { class: 'historial' },
            ...[...ctx.historial].reverse().map((ev) =>
              h(
                'li',
                {},
                h('span', { class: `punto ${ev.sesion.semaforo.toLowerCase()}`, 'aria-hidden': 'true' }),
                h('span', {}, `${fechaCorta(ev.sesion.fecha)} · ${TEXTO_INDICACION[ev.sesion.indicacion]}`),
                ev.id !== undefined &&
                  h('button', { class: 'boton', onclick: () => ctx.verConstancia(ev.id!) }, 'Constancia'),
              ),
            ),
          ),
        ),
    ),
  );
  return () => {};
}
