/**
 * Pantalla de inicio. Si falta calibrar (o hay que recalibrar), el botón
 * principal lleva directo a la calibración.
 */
import { ranuras } from '../core/caja';
import { esDibujable, nivelPorNombre } from '../core/optotipos';
import { estadoCalibracion, type Configuracion } from '../data/config';
import { h } from './dom';

export interface AccionesInicio {
  empezar: () => void;
  configurar: () => void;
  calibrar: () => void;
}

export function montarInicio(raiz: HTMLElement, config: Configuracion, acciones: AccionesInicio, aviso?: string): () => void {
  const dpr = window.devicePixelRatio || 1;
  const estado = estadoCalibracion(config, dpr);
  const apto =
    estado === 'vigente' &&
    esDibujable(nivelPorNombre('6/9'), ranuras(config.caja)[0], { pxPorMm: config.pxPorMm!, dpr });

  const mensaje =
    estado === 'sin-calibrar'
      ? 'Antes de la primera prueba, calibra la pantalla con tu DNI.'
      : estado === 'cambio-zoom'
        ? 'Cambió el zoom o el tamaño de letra del celular: vuelve a calibrar la pantalla.'
        : !apto
          ? 'Este celular no sirve para la prueba: su pantalla no puede dibujar la línea 6/9.'
          : null;

  raiz.replaceChildren(
    h(
      'main',
      { class: 'pagina inicio' },
      h('div', { class: 'marca' }, h('span', { class: 'logo', 'aria-hidden': 'true' }, 'E'), h('h1', {}, 'KidVision')),
      h('p', { class: 'lema' }, 'Tamizaje visual escolar con la caja óptica.'),
      aviso && h('p', { class: 'aviso' }, aviso),
      mensaje && h('p', { class: 'aviso' }, mensaje),
      estado === 'vigente'
        ? h('button', { class: 'boton principal grande', disabled: !apto, onclick: acciones.empezar }, 'Empezar prueba')
        : h('button', { class: 'boton principal grande', onclick: acciones.calibrar }, 'Calibrar pantalla'),
      h('button', { class: 'boton', onclick: acciones.configurar }, 'Configuración'),
    ),
  );
  return () => {};
}
