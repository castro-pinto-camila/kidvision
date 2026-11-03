/**
 * Pantalla de la prueba: dibuja el paso que pide la lógica (src/logic/flujo.ts)
 * y le entrega las respuestas del docente.
 */
import { disponer, type Disposicion } from '../core/disposicion';
import { alturaOptotipoMm, alturaPxCss, type Pantalla } from '../core/optotipos';
import type { Configuracion } from '../data/config';
import { BOTONES_ABANICO } from '../logic/abanico';
import { PruebaVisual, type Paso, type ResultadoSesion } from '../logic/flujo';
import type { Respuesta, Toque } from '../logic/linea';
import type { Evento, PasoAbanico, PasoColocar, PasoEspera, PasoLinea } from '../logic/pasos';
import { dibujarAbanico, dibujarLinea, pintar, prepararLienzo } from './dibujo';
import { liberarPantalla } from './dispositivo';
import { h } from './dom';
import { NOMBRE_OJO, NOMBRE_PRUEBA, textoColocar } from './textos';

export interface OpcionesPantallaPrueba {
  config: Configuracion & { pxPorMm: number };
  avisos: string[];
  alTerminar: (resultado: ResultadoSesion) => void;
  alSalir: () => void;
}

const FLECHAS: [Respuesta, string, string][] = [
  ['izquierda', '←', 'Izquierda'],
  ['arriba', '↑', 'Arriba'],
  ['abajo', '↓', 'Abajo'],
  ['derecha', '→', 'Derecha'],
];

/** Monta la prueba en `raiz`. Devuelve la función para desmontarla. */
export function montarPrueba(raiz: HTMLElement, op: OpcionesPantallaPrueba): () => void {
  const { config } = op;
  const pantalla: Pantalla = { pxPorMm: config.pxPorMm, dpr: window.devicePixelRatio || 1 };
  const prueba = new PruebaVisual({ caja: config.caja, pantalla, umbralCorte: config.umbralCorte });

  const lienzo = h('canvas', { class: 'lienzo' });
  const capa = h('div', { class: 'capa' });
  raiz.replaceChildren(h('div', { class: 'prueba' }, lienzo, capa));

  let avisos = op.avisos;
  let toques: Toque[] = [];
  let ultimoToque = performance.now();
  let reloj: number | undefined;
  let segundosRestantes = 0;
  let esperaIniciada: PasoEspera | null = null;

  function responder(evento: Evento): void {
    const paso: Paso = prueba.responder(evento);
    toques = [];
    ultimoToque = performance.now();
    avisos = [];
    detenerReloj();
    if (paso.tipo === 'fin') {
      void liberarPantalla();
      op.alTerminar(paso.resultado);
    } else {
      dibujar();
    }
  }

  function salir(): void {
    if (!confirm('¿Salir de la prueba? Se perderán las respuestas de este niño.')) return;
    void liberarPantalla();
    op.alSalir();
  }

  function detenerReloj(): void {
    if (reloj !== undefined) clearInterval(reloj);
    reloj = undefined;
  }

  function vista() {
    return { ancho: window.innerWidth, alto: window.innerHeight };
  }

  function disposicion(paso: PasoLinea | PasoAbanico | PasoEspera): Disposicion {
    const enCaja = paso.tipo === 'espera' || paso.lugar.id !== 'cerca';
    return disponer(vista(), config.pxPorMm, enCaja ? paso.ojo : null, config.caja.lenteDesdeCentro_mm, config.franja);
  }

  /** Fondo: blanco, con la mitad del otro ojo en negro. */
  function fondo(d: Disposicion): CanvasRenderingContext2D {
    const v = vista();
    const g = prepararLienzo(lienzo, v.ancho, v.alto);
    if (d.negro) pintar(g, d.negro);
    return g;
  }

  /** Franja de botones del docente, en el borde que queda fuera de la caja. */
  function franja(d: Disposicion, estado: string, botones: HTMLElement[]): HTMLElement {
    const vertical = config.franja.lado === 'izquierda' || config.franja.lado === 'derecha';
    const f = d.franja;
    return h(
      'div',
      {
        class: `franja ${vertical ? 'vertical' : ''}`,
        style: `left:${f.x}px;top:${f.y}px;width:${f.ancho}px;height:${f.alto}px`,
      },
      h('span', { class: 'estado' }, estado),
      ...botones,
    );
  }

  function avisoGirar(): HTMLElement | null {
    const v = vista();
    if (v.ancho >= v.alto) return null;
    return h('div', { class: 'girar' }, h('p', {}, 'Gira el celular a horizontal'));
  }

  function dibujarColocar(paso: PasoColocar): void {
    const v = vista();
    prepararLienzo(lienzo, v.ancho, v.alto);
    const { titulo, lineas } = textoColocar(paso);
    capa.replaceChildren(
      h(
        'div',
        { class: 'panel' },
        avisos.length > 0 && h('ul', { class: 'avisos' }, ...avisos.map((a) => h('li', {}, a))),
        h('h2', {}, titulo),
        ...lineas.map((l) => h('p', { class: 'instruccion' }, l)),
        h('button', { class: 'boton principal', onclick: () => responder({ tipo: 'confirmar' }) }, 'Listo'),
        h('button', { class: 'boton secundario', onclick: salir }, 'Salir de la prueba'),
      ),
    );
  }

  function dibujarEspera(paso: PasoEspera): void {
    const d = disposicion(paso);
    fondo(d);
    if (esperaIniciada !== paso) {
      esperaIniciada = paso;
      segundosRestantes = paso.segundos;
      reloj = window.setInterval(() => {
        segundosRestantes--;
        if (segundosRestantes <= 0) {
          detenerReloj();
          navigator.vibrate?.(300);
        }
        dibujar();
      }, 1000);
    }
    const listo = segundosRestantes <= 0;
    capa.replaceChildren(
      franja(d, `${NOMBRE_OJO[paso.ojo]} · clip +2.00`, [
        h('span', { class: 'cuenta' }, listo ? '¡Listo!' : `${segundosRestantes} s`),
        h(
          'button',
          {
            class: 'boton principal',
            disabled: !listo,
            onclick: () => responder({ tipo: 'confirmar' }),
          },
          'Seguir',
        ),
      ]),
    );
  }

  function tocar(respuesta: Respuesta): void {
    const ahora = performance.now();
    toques.push({ respuesta, ms: Math.round(ahora - ultimoToque) });
    ultimoToque = ahora;
    if (toques.length === 5) responder({ tipo: 'linea', toques });
    else dibujar();
  }

  function dibujarLineaE(paso: PasoLinea): void {
    const d = disposicion(paso);
    const g = fondo(d);
    const alto = alturaPxCss(alturaOptotipoMm(paso.nivel.thetaMin, paso.lugar), pantalla);
    dibujarLinea(g, d.centro, alto, paso.orientaciones, toques.length, 2 * config.pxPorMm);
    const estado = `${NOMBRE_OJO[paso.ojo]} · ${NOMBRE_PRUEBA[paso.prueba]} ${paso.nivel.nombre} · letra ${Math.min(toques.length + 1, 5)} de 5`;
    capa.replaceChildren(
      franja(d, estado, [
        ...FLECHAS.map(([r, simbolo, nombre]) =>
          h('button', { class: 'boton flecha', 'aria-label': nombre, onclick: () => tocar(r) }, simbolo),
        ),
        h('button', { class: 'boton', onclick: () => tocar('nose') }, 'No sé'),
        h(
          'button',
          {
            class: 'boton secundario',
            disabled: toques.length === 0,
            onclick: () => {
              toques.pop();
              ultimoToque = performance.now();
              dibujar();
            },
          },
          'Borrar',
        ),
      ]),
      ...[avisoGirar()].filter((x) => x !== null),
    );
  }

  function dibujarAbanicoPaso(paso: PasoAbanico): void {
    const d = disposicion(paso);
    const g = fondo(d);
    const { zona, centro } = d;
    const radio =
      0.95 *
      Math.min(centro.x - zona.x, zona.x + zona.ancho - centro.x, centro.y - zona.y, zona.y + zona.alto - centro.y);
    // Grosor: al menos 3 píxeles físicos (y al menos 0,4 mm).
    const grosor = Math.max(3 / pantalla.dpr, 0.4 * config.pxPorMm);
    dibujarAbanico(g, centro, radio, paso.rotacion, grosor);
    capa.replaceChildren(
      franja(d, `${NOMBRE_OJO[paso.ojo]} · abanico, vuelta ${paso.vuelta} de 2`, [
        ...BOTONES_ABANICO.map((nombre, i) =>
          h('button', { class: 'boton', onclick: () => responder({ tipo: 'abanico', eleccion: i }) }, nombre),
        ),
        h(
          'button',
          { class: 'boton', onclick: () => responder({ tipo: 'abanico', eleccion: 'iguales' }) },
          'Todas iguales',
        ),
      ]),
      ...[avisoGirar()].filter((x) => x !== null),
    );
  }

  function dibujar(): void {
    const paso = prueba.paso;
    switch (paso.tipo) {
      case 'colocar':
        return dibujarColocar(paso);
      case 'espera':
        return dibujarEspera(paso);
      case 'linea':
        return dibujarLineaE(paso);
      case 'abanico':
        return dibujarAbanicoPaso(paso);
      case 'fin':
        return;
    }
  }

  window.addEventListener('resize', dibujar);
  dibujar();

  return () => {
    detenerReloj();
    window.removeEventListener('resize', dibujar);
  };
}
