/**
 * Resultado provisional (sin guardar). La versión completa, con constancia, llega en la sesión 4.
 */
import type { ResultadoOjo, ResultadoSesion } from '../logic/flujo';
import { h } from './dom';
import {
  TEXTO_CATEGORIA,
  TEXTO_INDICACION,
  TEXTO_MOTIVO,
  TEXTO_SEMAFORO,
  textoAgudeza,
  textoDioptrias,
} from './textos';

function tarjetaOjo(nombre: string, o: ResultadoOjo, corte: string): HTMLElement {
  return h(
    'section',
    { class: `ojo ${o.semaforo.toLowerCase()}` },
    h('h2', {}, nombre),
    h('p', {}, h('strong', {}, 'Agudeza: '), textoAgudeza(o, corte)),
    o.puntoRemoto &&
      h(
        'p',
        {},
        h('strong', {}, 'Punto remoto: '),
        `${o.puntoRemoto}${o.puntoRemotoEstado === 'tentativo' ? ' (no confirmado)' : ''}`,
      ),
    o.miopiaEstimadaD !== null &&
      h('p', {}, h('strong', {}, 'Miopía estimada: '), textoDioptrias(o.miopiaEstimadaD)),
    h(
      'p',
      {},
      h('strong', {}, 'Categoría: '),
      o.categorias.length ? o.categorias.map((c) => TEXTO_CATEGORIA[c]).join(', ') : 'sin categoría',
    ),
    o.posibleAstigmatismo &&
      h(
        'p',
        { class: 'nota' },
        'Posible astigmatismo (por validar): eligió la misma línea del abanico, pero ve bien de lejos y de cerca. No cambia el semáforo.',
      ),
    o.dudoso &&
      h('div', { class: 'dudoso' }, h('strong', {}, 'Resultado dudoso'), ...o.motivosDudoso.map((m) => h('p', {}, TEXTO_MOTIVO[m]))),
  );
}

export function montarResultado(
  raiz: HTMLElement,
  r: ResultadoSesion,
  practica: boolean,
  volver: () => void,
): () => void {
  const minutos = Math.floor(r.duracionSeg / 60);
  const segundos = r.duracionSeg % 60;
  raiz.replaceChildren(
    h(
      'main',
      { class: 'pagina' },
      practica &&
        h('p', { class: 'banda-practica' }, 'Modo práctica (sin caja): este resultado no vale y no se guarda.'),
      h('h1', {}, practica ? 'Resultado de práctica' : 'Resultado'),
      h(
        'div',
        { class: `semaforo ${r.semaforo.toLowerCase()}` },
        h('span', { class: 'luz' }),
        h('div', {}, h('strong', {}, TEXTO_SEMAFORO[r.semaforo]), h('p', {}, TEXTO_INDICACION[r.indicacion])),
      ),
      tarjetaOjo('Ojo derecho', r.ojos.OD, r.umbralCorte),
      tarjetaOjo('Ojo izquierdo', r.ojos.OI, r.umbralCorte),
      h('p', { class: 'nota' }, `Duración: ${minutos} min ${segundos} s. Estimación de tamizaje, no es una receta.`),
      !practica && h('p', { class: 'nota' }, 'Resultado provisional: todavía no se guarda (sesión 4).'),
      h('button', { class: 'boton principal', onclick: volver }, 'Volver al inicio'),
    ),
  );
  return () => {};
}
