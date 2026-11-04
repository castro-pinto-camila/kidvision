/**
 * Bienvenida: la primera vez, antes de entrar a «Mi salón», se pide el colegio
 * y se calibra la pantalla. Cada paso muestra si ya está hecho.
 */
import type { Preparacion } from '../logic/preparacion';
import { h } from './dom';
import { icono } from './iconos';

export interface ContextoBienvenida {
  colegioActual: string;
  preparacion: Preparacion;
  guardarColegio: (nombre: string) => Promise<void>;
  calibrar: () => void;
  /** Vuelve a dibujar la pantalla con el estado nuevo. */
  refrescar: () => void;
  seguir: () => void;
}

export function montarBienvenida(raiz: HTMLElement, ctx: ContextoBienvenida): () => void {
  const [colegio, calibracion, celular] = ctx.preparacion.pasos;
  const entrada = h('input', {
    type: 'text',
    class: 'texto-largo',
    value: ctx.colegioActual,
    placeholder: 'IE 1234 San Martín',
    'aria-label': 'Nombre del colegio',
    autocomplete: 'off',
  });
  const error = h('p', { class: 'error' });
  const formulario = h(
    'form',
    {
      class: 'formulario',
      onsubmit: async (ev: Event) => {
        ev.preventDefault();
        const nombre = entrada.value.trim();
        if (!nombre) {
          error.textContent = 'Escribe el nombre del colegio.';
          return;
        }
        await ctx.guardarColegio(nombre);
        ctx.refrescar();
      },
    },
    h('label', { class: 'campo' }, h('span', { class: 'etiqueta' }, 'Nombre del colegio', h('small', {}, 'Sale en la constancia para la familia.')), entrada),
    error,
    h('button', { class: colegio.listo ? 'boton' : 'boton principal', type: 'submit' }, colegio.listo ? 'Cambiar el colegio' : 'Guardar el colegio'),
  );

  const fila = (listo: boolean, texto: string) =>
    h('div', { class: `fila-estado ${listo ? 'ok' : 'pendiente'}` }, h('span', { class: 'icono' }, listo ? icono('check') : '!'), h('span', { class: 'texto' }, texto));

  raiz.replaceChildren(
    h(
      'main',
      { class: 'pagina' },
      h('header', { class: 'cabecera' }, h('span', { class: 'logo' }, icono('ojo')), h('div', { class: 'titulos' }, h('h1', {}, 'Bienvenida'), h('p', { class: 'lema' }, 'Dos pasos antes de empezar'))),
      h('h2', {}, '1. El colegio'),
      fila(colegio.listo, colegio.listo ? colegio.texto : 'Todavía no escribiste el colegio.'),
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
