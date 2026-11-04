/**
 * Portada: la primera pantalla de la app. Dice qué es KidVision y lleva a la
 * bienvenida (colegio y calibración). Solo sale la primera vez.
 */
import { h } from './dom';
import { icono } from './iconos';

export interface ContextoPortada {
  comenzar: () => void;
  /** Si no es la primera vez (se abrió desde Configuración), un botón para volver. */
  volver?: () => void;
}

export function montarPortada(raiz: HTMLElement, ctx: ContextoPortada): () => void {
  raiz.replaceChildren(
    h(
      'main',
      { class: 'pagina portada' },
      h('span', { class: 'logo' }, icono('ojo')),
      h('h1', {}, 'KidVision'),
      h('p', { class: 'instruccion' }, 'Tamizaje visual escolar para docentes'),
      h(
        'p',
        {},
        'Con una caja de cartón y tu celular, mide la vista de niños de 6 a 12 años y te dice a quiénes conviene derivar a un control con un especialista.',
      ),
      h('p', { class: 'nota' }, 'Es una herramienta de tamizaje: no da un diagnóstico ni receta lentes. Funciona sin internet.'),
      h('button', { class: 'boton principal grande', onclick: ctx.comenzar }, ctx.volver ? 'Seguir' : 'Comenzar'),
      ctx.volver && h('button', { class: 'boton', onclick: ctx.volver }, 'Volver'),
    ),
  );
  return () => {};
}
