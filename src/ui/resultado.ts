/**
 * Resultado para el docente: semáforo, indicación y datos de cada ojo.
 * La evaluación ya se guardó (salvo en modo práctica).
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

export interface ContextoResultado {
  resultado: ResultadoSesion;
  codigo: string | null;
  practica: boolean;
  /** Cómo quedó el guardado: 'ok', 'error' o null si no se guarda (práctica). */
  guardado: 'ok' | 'error' | null;
  verConstancia: (() => void) | null;
  volver: () => void;
}

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

export function montarResultado(raiz: HTMLElement, ctx: ContextoResultado): () => void {
  const r = ctx.resultado;
  const minutos = Math.floor(r.duracionSeg / 60);
  const segundos = r.duracionSeg % 60;
  raiz.replaceChildren(
    h(
      'main',
      { class: 'pagina' },
      ctx.practica &&
        h('p', { class: 'banda-practica' }, 'Modo práctica (sin caja): este resultado no vale y no se guarda.'),
      h('h1', {}, ctx.practica ? 'Resultado de práctica' : `Resultado${ctx.codigo ? ` de ${ctx.codigo}` : ''}`),
      h(
        'div',
        { class: `semaforo ${r.semaforo.toLowerCase()}` },
        h('span', { class: 'luz' }),
        h('div', {}, h('strong', {}, TEXTO_SEMAFORO[r.semaforo]), h('p', {}, TEXTO_INDICACION[r.indicacion])),
      ),
      ctx.guardado === 'ok' && h('p', { class: 'guardado-ok', role: 'status' }, 'Resultado guardado en este celular.'),
      ctx.guardado === 'error' &&
        h('p', { class: 'aviso' }, 'No se pudo guardar el resultado. Anótalo antes de salir de esta pantalla.'),
      tarjetaOjo('Ojo derecho', r.ojos.OD, r.umbralCorte),
      tarjetaOjo('Ojo izquierdo', r.ojos.OI, r.umbralCorte),
      h('p', { class: 'nota' }, `Duración: ${minutos} min ${segundos} s. Estimación de tamizaje, no es una receta.`),
      ctx.verConstancia &&
        h('button', { class: 'boton principal', onclick: ctx.verConstancia }, 'Ver constancia para la familia'),
      h('button', { class: ctx.verConstancia ? 'boton' : 'boton principal', onclick: ctx.volver }, 'Volver a Mi salón'),
    ),
  );
  return () => {};
}
