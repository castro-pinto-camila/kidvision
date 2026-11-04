/**
 * Pantalla de la prueba: dibuja el paso que pide la lógica (src/logic/flujo.ts)
 * y le entrega las respuestas del docente.
 *
 * El dibujo es siempre horizontal: si el celular está vertical, todo el
 * contenedor se gira 90° (ver girarPantalla). Al empezar, una «D» en la mitad
 * del ojo derecho comprueba que el giro y las mitades están bien.
 */
import { disponer, girarPantalla, ojoEnPantalla, type Disposicion } from '../core/disposicion';
import { alturaOptotipoMm, alturaPxCss, type Pantalla } from '../core/optotipos';
import type { Configuracion } from '../data/config';
import { BOTONES_ABANICO } from '../logic/abanico';
import { PruebaVisual, type Paso, type ResultadoSesion } from '../logic/flujo';
import { respuestasParaDecidir, type Respuesta, type Toque } from '../logic/linea';
import type { Evento, Ojo, PasoAbanico, PasoColocar, PasoEspera, PasoLinea } from '../logic/pasos';
import { dibujarAbanico, dibujarCirculo, dibujarLetra, dibujarLinea, pintar, prepararLienzo } from './dibujo';
import { liberarPantalla } from './dispositivo';
import { h } from './dom';
import { icono } from './iconos';
import { NOMBRE_OJO, NOMBRE_PRUEBA, textoColocar } from './textos';

export interface OpcionesPantallaPrueba {
  config: Configuracion & { pxPorMm: number };
  avisos: string[];
  /** Modo práctica (sin caja): aviso en todas las pantallas; el resultado no vale. */
  practica: boolean;
  /** Guarda lo que se corrigió en la comprobación con la «D». */
  guardarOrientacion: (invertida: boolean, intercambiadas: boolean) => void;
  alTerminar: (resultado: ResultadoSesion) => void;
  alSalir: () => void;
}

/** Respuesta, giro de la flecha y nombre para lectores de pantalla. */
const FLECHAS: [Respuesta, number, string][] = [
  ['izquierda', 180, 'Izquierda'],
  ['arriba', 270, 'Arriba'],
  ['abajo', 90, 'Abajo'],
  ['derecha', 0, 'Derecha'],
];

/** Cuánto dura el aviso «Siguiente línea» entre una línea y la otra. */
const MS_TRANSICION = 600;
const AZUL_FIGURA = '#2563eb';

/** Monta la prueba en `raiz`. Devuelve la función para desmontarla. */
export function montarPrueba(raiz: HTMLElement, op: OpcionesPantallaPrueba): () => void {
  const { config } = op;
  const pantalla: Pantalla = { pxPorMm: config.pxPorMm, dpr: window.devicePixelRatio || 1 };
  const prueba = new PruebaVisual({ caja: config.caja, pantalla, umbralCorte: config.umbralCorte });

  const lienzo = h('canvas', { class: 'lienzo' });
  const capa = h('div', { class: 'capa' });
  const contenedor = h('div', { class: 'prueba' }, lienzo, capa);
  raiz.replaceChildren(contenedor);

  let invertida = config.pantallaInvertida;
  let intercambiadas = config.mitadesIntercambiadas;
  let verificado = false;
  let primerPaso = true;
  let avisos = op.avisos;
  let toques: Toque[] = [];
  let ultimoToque = performance.now();
  let reloj: number | undefined;
  let animacion: number | undefined;
  let transicion: number | undefined;
  let segundosRestantes = 0;
  let esperaIniciada: PasoEspera | null = null;

  const marcaPractica = op.practica ? 'PRÁCTICA · ' : '';

  function responder(evento: Evento): void {
    const paso: Paso = prueba.responder(evento);
    toques = [];
    avisos = [];
    primerPaso = false;
    detenerReloj();
    if (paso.tipo === 'fin') {
      void liberarPantalla();
      op.alTerminar(paso.resultado);
      return;
    }
    if (evento.tipo === 'linea') {
      mostrarTransicion();
      return;
    }
    ultimoToque = performance.now();
    dibujar();
  }

  /** Entre una línea y la siguiente: pantalla en blanco y «✓ Siguiente línea» en la franja. */
  function mostrarTransicion(): void {
    const d = disposicion(null);
    fondo(d);
    capa.replaceChildren(
      franja(d, '', [h('span', { class: 'siguiente' }, icono('check'), 'Siguiente línea')]),
    );
    transicion = window.setTimeout(() => {
      transicion = undefined;
      ultimoToque = performance.now();
      dibujar();
    }, MS_TRANSICION);
  }

  function salir(): void {
    if (!confirm('¿Salir de la prueba? Se perderán las respuestas de este niño.')) return;
    void liberarPantalla();
    op.alSalir();
  }

  function detenerReloj(): void {
    if (reloj !== undefined) clearInterval(reloj);
    if (animacion !== undefined) cancelAnimationFrame(animacion);
    reloj = undefined;
    animacion = undefined;
  }

  /** Medidas del dibujo (siempre horizontal); de paso, gira el contenedor. */
  function vista() {
    const g = girarPantalla({ ancho: window.innerWidth, alto: window.innerHeight }, invertida);
    contenedor.style.width = `${g.ancho}px`;
    contenedor.style.height = `${g.alto}px`;
    contenedor.style.transform = g.transform;
    return { ancho: g.ancho, alto: g.alto };
  }

  function disposicion(ojo: Ojo | null): Disposicion {
    const enPantalla = ojo === null ? null : ojoEnPantalla(ojo, intercambiadas);
    return disponer(vista(), config.pxPorMm, enPantalla, config.caja.lenteDesdeCentro_mm, config.franja);
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
        class: `franja ${vertical ? 'vertical' : ''} ${op.practica ? 'en-practica' : ''}`,
        style: `left:${f.x}px;top:${f.y}px;width:${f.ancho}px;height:${f.alto}px`,
      },
      (estado || op.practica) && h('span', { class: 'estado' }, marcaPractica + estado),
      ...botones,
    );
  }

  function dibujarColocar(paso: PasoColocar): void {
    const v = vista();
    prepararLienzo(lienzo, v.ancho, v.alto);
    const { titulo, lineas } = textoColocar(paso, primerPaso);
    const enCaja = paso.lugar !== 'cerca';
    capa.replaceChildren(
      h(
        'div',
        { class: 'panel' },
        op.practica &&
          h('p', { class: 'banda-practica' }, 'Modo práctica (sin caja): el resultado no vale y no se guarda.'),
        enCaja && h('p', { class: 'arriba-indicador' }, '↑ Este lado hacia arriba ↑'),
        avisos.length > 0 && h('ul', { class: 'avisos' }, ...avisos.map((a) => h('li', {}, a))),
        h('h2', {}, titulo),
        ...lineas.map((l) => h('p', { class: 'instruccion' }, l)),
        h('button', { class: 'boton principal', onclick: () => responder({ tipo: 'confirmar' }) }, 'Listo'),
        h('button', { class: 'boton secundario', onclick: salir }, 'Salir de la prueba'),
      ),
    );
  }

  /**
   * Comprobación antes de la primera línea: una «D» grande en la mitad del ojo
   * derecho. El docente mira por la caja y confirma que la ve con el ojo
   * derecho y derecha (no al revés).
   */
  function dibujarVerificacion(): void {
    const d = disposicion('OD');
    const g = fondo(d);
    dibujarLetra(g, 'D', d.centro, 12 * config.pxPorMm);
    capa.replaceChildren(
      franja(d, 'Comprobación: mira por la caja', [
        h(
          'button',
          {
            class: 'boton principal',
            onclick: () => {
              verificado = true;
              op.guardarOrientacion(invertida, intercambiadas);
              ultimoToque = performance.now();
              dibujar();
            },
          },
          'Veo la D derecha con el ojo derecho',
        ),
        h(
          'button',
          {
            class: 'boton',
            onclick: () => {
              invertida = !invertida;
              dibujar();
            },
          },
          'La veo al revés',
        ),
        h(
          'button',
          {
            class: 'boton',
            onclick: () => {
              intercambiadas = !intercambiadas;
              dibujar();
            },
          },
          'La veo con el ojo izquierdo',
        ),
      ]),
    );
  }

  /**
   * El minuto con la tapa +2.00: un círculo azul grande y sin detalles se
   * mueve despacio frente a cada lente, para que el niño tenga algo que mirar.
   */
  function animarEspera(): void {
    const d = disposicion(null);
    const centros = (['OD', 'OI'] as const).map((o) => disposicion(o).centro);
    const radio = 6 * config.pxPorMm;
    const recorrido = 4 * config.pxPorMm;
    const t = performance.now() / 1000;
    const g = fondo(d);
    for (const c of centros) {
      dibujarCirculo(
        g,
        { x: c.x + recorrido * Math.cos(t * 0.8), y: c.y + recorrido * Math.sin(t * 0.8) },
        radio,
        AZUL_FIGURA,
      );
    }
    animacion = requestAnimationFrame(animarEspera);
  }

  function dibujarEspera(paso: PasoEspera): void {
    const d = disposicion(null);
    if (esperaIniciada !== paso) {
      esperaIniciada = paso;
      segundosRestantes = paso.segundos;
      reloj = window.setInterval(() => {
        segundosRestantes--;
        if (segundosRestantes <= 0) {
          clearInterval(reloj);
          reloj = undefined;
          navigator.vibrate?.(300);
        }
        dibujarEspera(paso);
      }, 1000);
      animarEspera();
    }
    const listo = segundosRestantes <= 0;
    const avance = 100 * (1 - segundosRestantes / paso.segundos);
    capa.replaceChildren(
      franja(d, 'Tapa +2.00 · los dos ojos', [
        h(
          'div',
          { class: 'progreso', role: 'progressbar', 'aria-valuenow': Math.round(avance) },
          h('div', { class: 'progreso-barra', style: `width:${avance}%` }),
          h('span', { class: 'progreso-texto' }, listo ? 'Listo' : `${segundosRestantes} s`),
        ),
        h(
          'button',
          { class: 'boton principal', disabled: !listo, onclick: () => responder({ tipo: 'confirmar' }) },
          'Seguir',
        ),
      ]),
    );
  }

  function tocar(respuesta: Respuesta): void {
    const ahora = performance.now();
    toques.push({ respuesta, ms: Math.round(ahora - ultimoToque) });
    ultimoToque = ahora;
    // La línea se corta solo si ya falló; si puede pasar, se piden las cinco.
    const paso = prueba.paso;
    const termina =
      paso.tipo === 'linea' &&
      respuestasParaDecidir(paso.orientaciones, toques.map((t) => t.respuesta), paso.necesarios) !== null;
    if (termina) responder({ tipo: 'linea', toques });
    else dibujar();
  }

  function dibujarLineaE(paso: PasoLinea): void {
    const d = disposicion(paso.lugar.id === 'cerca' ? null : paso.ojo);
    const g = fondo(d);
    const alto = alturaPxCss(alturaOptotipoMm(paso.nivel.thetaMin, paso.lugar), pantalla);
    dibujarLinea(g, d.centro, alto, paso.orientaciones, toques.length, 2 * config.pxPorMm);
    const estado = `${NOMBRE_OJO[paso.ojo]} · ${NOMBRE_PRUEBA[paso.prueba]} ${paso.nivel.nombre} · letra ${Math.min(toques.length + 1, 5)} de 5`;
    capa.replaceChildren(
      franja(d, estado, [
        ...FLECHAS.map(([r, giro, nombre]) =>
          h('button', { class: 'boton flecha', 'aria-label': nombre, onclick: () => tocar(r) }, icono('flecha', giro)),
        ),
        h('button', { class: 'boton', onclick: () => tocar('nose') }, 'No sé'),
        h(
          'button',
          {
            class: 'boton secundario',
            disabled: toques.length === 0,
            'aria-label': 'Borrar la última respuesta',
            onclick: () => {
              toques.pop();
              ultimoToque = performance.now();
              dibujar();
            },
          },
          icono('borrar'),
        ),
      ]),
    );
  }

  function dibujarAbanicoPaso(paso: PasoAbanico): void {
    const d = disposicion(paso.ojo);
    const g = fondo(d);
    const { zona, centro } = d;
    const radio =
      0.95 *
      Math.min(centro.x - zona.x, zona.x + zona.ancho - centro.x, centro.y - zona.y, zona.y + zona.alto - centro.y);
    // Rayos gruesos: al menos 3 píxeles físicos y al menos 0,8 mm.
    const grosor = Math.max(3 / pantalla.dpr, 0.8 * config.pxPorMm);
    dibujarAbanico(g, centro, radio, paso.rotacion, grosor);
    capa.replaceChildren(
      franja(d, `${NOMBRE_OJO[paso.ojo]} · vuelta ${paso.vuelta} de 2 · ¿alguna línea más negra?`, [
        h(
          'button',
          { class: 'boton principal destacado', onclick: () => responder({ tipo: 'abanico', eleccion: 'iguales' }) },
          'Todas iguales',
        ),
        ...BOTONES_ABANICO.map((nombre, i) =>
          h('button', { class: 'boton', onclick: () => responder({ tipo: 'abanico', eleccion: i }) }, nombre),
        ),
      ]),
    );
  }

  function dibujar(): void {
    if (transicion !== undefined) return;
    const paso = prueba.paso;
    if (!verificado && paso.tipo !== 'colocar' && paso.tipo !== 'fin') return dibujarVerificacion();
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
    clearTimeout(transicion);
    window.removeEventListener('resize', dibujar);
  };
}
