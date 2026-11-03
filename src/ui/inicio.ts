/**
 * Pantalla de inicio.
 */
import { ranuras } from '../core/caja';
import { esDibujable, nivelPorNombre } from '../core/optotipos';
import type { Configuracion } from '../data/config';
import { h } from './dom';

export interface AccionesInicio {
  empezar: () => void;
  configurar: () => void;
}

export function montarInicio(raiz: HTMLElement, config: Configuracion, acciones: AccionesInicio, aviso?: string): () => void {
  const calibrado = config.pxPorMm !== null;
  const apto =
    calibrado &&
    esDibujable(nivelPorNombre('6/9'), ranuras(config.caja)[0], {
      pxPorMm: config.pxPorMm!,
      dpr: window.devicePixelRatio || 1,
    });

  raiz.replaceChildren(
    h(
      'main',
      { class: 'pagina inicio' },
      h('h1', {}, 'KidVision'),
      h('p', {}, 'Tamizaje visual escolar con la caja óptica.'),
      aviso && h('p', { class: 'aviso' }, aviso),
      !calibrado && h('p', { class: 'aviso' }, 'Antes de la primera prueba, calibra la pantalla en Configuración.'),
      calibrado &&
        !apto &&
        h('p', { class: 'aviso' }, 'Este celular no sirve para la prueba: su pantalla no puede dibujar la línea 6/9. Revisa Configuración.'),
      h('button', { class: 'boton principal', disabled: !apto, onclick: acciones.empezar }, 'Empezar prueba'),
      h('button', { class: 'boton', onclick: acciones.configurar }, 'Configuración'),
    ),
  );
  return () => {};
}
