/**
 * Pasos que la prueba le pide a la interfaz y eventos con los que responde.
 * Cada parte del flujo es un generador: entrega un paso (yield) y recibe el
 * evento del docente. Así el flujo se lee en el mismo orden que SPEC.md.
 */
import type { Geometria } from '../core/caja';
import { GEOMETRIA_CERCA, type Nivel, type Pantalla } from '../core/optotipos';
import { contarAciertos, LETRAS_POR_LINEA, type Toque } from './linea';
import { generarOrientaciones, type Azar, type Direccion } from './orientaciones';

export type Ojo = 'OD' | 'OI';
export type Accesorio = 'clip' | 'estenopeico' | null;

/** Dónde está el celular: una ranura de la caja o «cerca» (a 40 cm, fuera de la caja). */
export interface Lugar extends Geometria {
  id: string;
}

export const LUGAR_CERCA: Lugar = { id: 'cerca', ...GEOMETRIA_CERCA };

export type Prueba =
  | 'lejos'
  | 'umbral'
  | 'control'
  | 'clip'
  | 'remoto'
  | 'estenopeico'
  | 'cerca';

/** «Coloca el celular en …» y espera a que el docente confirme. */
export interface PasoColocar {
  tipo: 'colocar';
  ojo: Ojo;
  lugar: string;
  accesorio: Accesorio;
  /** Accesorio que hay que quitar antes, si lo hay. */
  quitar: Accesorio;
}

/** Temporizador (60 s con el clip). El docente confirma cuando termina. */
export interface PasoEspera {
  tipo: 'espera';
  ojo: Ojo;
  segundos: number;
}

/** Una línea de cinco «E». */
export interface PasoLinea {
  tipo: 'linea';
  ojo: Ojo;
  prueba: Prueba;
  lugar: Lugar;
  nivel: Nivel;
  orientaciones: Direccion[];
}

/** Una vuelta de la carta de abanico. `rotacion` en grados, antihorario. */
export interface PasoAbanico {
  tipo: 'abanico';
  ojo: Ojo;
  vuelta: 1 | 2;
  rotacion: number;
  lugar: Lugar;
}

export type PasoPendiente = PasoColocar | PasoEspera | PasoLinea | PasoAbanico;

export type Evento =
  | { tipo: 'confirmar' }
  | { tipo: 'linea'; toques: Toque[] }
  /** Índice del botón (0 = «12–6», 1 = «1–7», …, 5 = «5–11») o «todas iguales». */
  | { tipo: 'abanico'; eleccion: number | 'iguales' };

/** Lo que se guarda de cada línea mostrada, para revisar el piloto. */
export interface RegistroLinea {
  prueba: Prueba;
  lugar: string;
  nivel: string;
  mostradas: Direccion[];
  toques: Toque[];
  aciertos: number;
}

export interface Posicion {
  ojo: Ojo | null;
  lugar: string | null;
  accesorio: Accesorio;
}

/** Estado de un ojo mientras se evalúa. `posicion` se comparte entre los dos ojos. */
export interface Contexto {
  ojo: Ojo;
  pantalla: Pantalla;
  azar: Azar;
  posicion: Posicion;
  ultima: Direccion | null;
  registro: RegistroLinea[];
}

export type Flujo<T> = Generator<PasoPendiente, T, Evento>;

export function exigir<T extends Evento['tipo']>(
  evento: Evento,
  tipo: T,
): Extract<Evento, { tipo: T }> {
  if (evento?.tipo !== tipo) {
    throw new Error(`Se esperaba un evento «${tipo}» y llegó «${evento?.tipo}»`);
  }
  return evento as Extract<Evento, { tipo: T }>;
}

/** Pide colocar el celular solo si cambia el ojo, el lugar o el accesorio. */
export function* ir(ctx: Contexto, lugar: Lugar, accesorio: Accesorio = null): Flujo<void> {
  const p = ctx.posicion;
  if (p.ojo === ctx.ojo && p.lugar === lugar.id && p.accesorio === accesorio) return;
  const quitar = p.accesorio !== null && p.accesorio !== accesorio ? p.accesorio : null;
  exigir(yield { tipo: 'colocar', ojo: ctx.ojo, lugar: lugar.id, accesorio, quitar }, 'confirmar');
  ctx.posicion = { ojo: ctx.ojo, lugar: lugar.id, accesorio };
}

export function* esperar(ctx: Contexto, segundos: number): Flujo<void> {
  exigir(yield { tipo: 'espera', ojo: ctx.ojo, segundos }, 'confirmar');
}

/** Muestra una línea de cinco «E», la registra y devuelve los aciertos. */
export function* mostrarLinea(ctx: Contexto, prueba: Prueba, lugar: Lugar, nivel: Nivel): Flujo<number> {
  const orientaciones = generarOrientaciones(LETRAS_POR_LINEA, ctx.azar, ctx.ultima);
  ctx.ultima = orientaciones[orientaciones.length - 1];
  const { toques } = exigir(
    yield { tipo: 'linea', ojo: ctx.ojo, prueba, lugar, nivel, orientaciones },
    'linea',
  );
  const aciertos = contarAciertos(orientaciones, toques.map((t) => t.respuesta));
  ctx.registro.push({ prueba, lugar: lugar.id, nivel: nivel.nombre, mostradas: orientaciones, toques, aciertos });
  return aciertos;
}
