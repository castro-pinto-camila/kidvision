/**
 * Bienvenida: la primera vez, antes de entrar a «Mi salón», se pide el colegio,
 * el salón y se calibra la pantalla. Cada paso muestra si ya está hecho.
 */
import type { Preparacion } from '../logic/preparacion';
import { h } from './dom';
import { icono } from './iconos';

export interface ContextoBienvenida {
  colegioActual: string;
  salonActual: string;
  preparacion: Preparacion;
  guardarDatos: (colegio: string, salon: string) => Promise<void>;
  calibrar: () => void;
  /** Vuelve a dibujar la pantalla con el estado nuevo. */
  refrescar: () => void;
  seguir: () => void;
}

export function montarBienvenida(raiz: HTMLElement, ctx: ContextoBienvenida): () => void {
  const [colegio, calibracion, celular] = ctx.preparacion.pasos;
  const entradaColegio = h('input', {
    type: 'text',
    class: 'texto-largo',
    value: ctx.colegioActual,
    placeholder: 'IE 1234 San Martín',
    'aria-label': 'Nombre del colegio',
    autocomplete: 'off',
  });
  const entradaSalon = h('input', {
    type: 'text',
    class: 'texto-largo',
    value: ctx.salonActual,
    placeholder: '3B',
    'aria-label': 'Salón',
    autocomplete: 'off',
  });
  const error = h('p', { class: 'error' });
  const formulario = h(
    'form',
    {
      class: 'formulario',
      onsubmit: async (ev: Event) => {
        ev.preventDefault();
        const nombre = entradaColegio.value.trim();
        const salon = entradaSalon.value.trim();
        if (!nombre) {
          error.textContent = 'Escribe el nombre del colegio.';
          return;
        }
        if (!salon) {
          error.textContent = 'Escribe el salón, por ejemplo 3B.';
          return;
        }
        await ctx.guardarDatos(nombre, salon);
        ctx.refrescar();
      },
    },
    h('label', { class: 'campo' }, h('span', { class: 'etiqueta' }, 'Nombre del colegio', h('small', {}, 'Sale en la constancia para la familia.')), entradaColegio),
    h('label', { class: 'campo' }, h('span', { class: 'etiqueta' }, 'Salón', h('small', {}, 'Por ejemplo 3B o 5.º A. Sale en la constancia y en el archivo del salón.')), entradaSalon),
    error,
    h('button', { class: colegio.listo ? 'boton' : 'boton principal', type: 'submit' }, colegio.listo ? 'Cambiar colegio o salón' : 'Guardar colegio y salón'),
  );

  const fila = (listo: boolean, texto: string) =>
    h('div', { class: `fila-estado ${listo ? 'ok' : 'pendiente'}` }, h('span', { class: 'icono' }, listo ? icono('check') : '!'), h('span', { class: 'texto' }, texto));

  raiz.replaceChildren(
    h(
      'main',
      { class: 'pagina' },
      h('header', { class: 'cabecera' }, h('span', { class: 'logo' }, icono('ojo')), h('div', { class: 'titulos' }, h('h1', {}, 'Bienvenida'), h('p', { class: 'lema' }, 'Dos pasos antes de empezar'))),
      h('h2', {}, '1. El colegio y el salón'),
      fila(colegio.listo, colegio.texto),
      formulario,
      h('h2', {}, '2. La pantalla del celular'),
      fila(calibracion.listo, calibracion.texto),
      !calibracion.listo && h('button', { class: 'boton principal', onclick: ctx.calibrar }, icono('regla'), calibracion.boton ?? 'Calibrar pantalla'),
      calibracion.listo && fila(celular.listo, celular.texto),
      h('button', { class: 'boton principal grande', disabled: !ctx.preparacion.listoParaEvaluar, onclick: ctx.seguir }, 'Entrar a Mi salón'),
      !ctx.preparacion.listoParaEvaluar && h('p', { class: 'nota' }, 'Se activa cuando los dos pasos estén listos.'),
    ),
  );
  return () => {};
}
