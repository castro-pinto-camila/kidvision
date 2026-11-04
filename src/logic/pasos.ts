/**
 * Pasos que la prueba le pide a la interfaz y eventos con los que responde.
 * Cada parte del flujo es un generador: entrega un paso (yield) y recibe el
 * evento del docente. Así el flujo se lee en el mismo orden que SPEC.md.
 */
import type { Geometria } from '../core/caja';
import { GEOMETRIA_CERCA, type Nivel, type Pantalla } from '../core/optotipos';
import { contarAciertos, LETRAS_POR_LINEA, respuestasParaDecidir, type Toque } from './linea';
import { secuenciaLinea, type VersionLineas } from './secuencias';
import { generarOrientaciones, type Azar, type Direccion } from './orientaciones';

export type Ojo = 'OD' | 'OI';
export type Accesorio = 'clip' | 'estenopeico' | null;

/** Dónde está el celular: una ranura de la caja o «cerca» (a 40 cm, fuera de la caja). */
export interface Lugar extends Geometria {
  id: string;
}

export const LUGAR_CERCA: Lugar = { id: 'cerca', ...GEOMETRIA_CERCA };

export type Prueba =
  /** Línea de práctica al empezar: no cuenta para nada. */
  | 'practica'
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
  /** Solo en la prueba de cerca, que es de un ojo a la vez; dentro de la caja, null (los dos ojos). */
  ojo: Ojo | null;
  lugar: string;
  accesorio: Accesorio;
  /** Accesorio que hay que quitar antes, si lo hay. */
  quitar: Accesorio;
  /** true si hay que mover el pasador a otra ranura; false si el celular ya está ahí y solo cambia la tapa o el estenopeico. */
  moverPasador: boolean;
  /** Lo que viene después, cuando hay que explicarlo antes (la carta de abanico). */
  nota: 'abanico' | null;
}

/** Temporizador (60 s con el clip, los dos ojos a la vez). El docente confirma cuando termina. */
export interface PasoEspera {
  tipo: 'espera';
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
  /** Aciertos para aprobar la línea (4, o 3 en el umbral). La línea se corta solo si ya falló. */
  necesarios: number;
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
  /** Las respuestas hasta que la línea quedó decidida (o las cinco). */
  | { tipo: 'linea'; toques: Toque[] }
  /** Índice del botón (0 = línea «1», …, 5 = línea «6») o «todas iguales». */
  | { tipo: 'abanico'; eleccion: number | 'iguales' };

/** Lo que se guarda de cada línea mostrada, para revisar el piloto. */
export interface RegistroLinea {
  prueba: Prueba;
  lugar: string;
  nivel: string;
  mostradas: Direccion[];
  toques: Toque[];
  aciertos: number;
  /** Cuántas «E» respondió el niño (de 1 a 5). */
  respondidas: number;
  /** true si la línea se cortó antes de la quinta «E» porque ya había fallado. */
  cortada: boolean;
}

/** Dónde está el celular ahora. Se comparte entre los dos ojos. */
export interface Posicion {
  ojo: Ojo | null;
  lugar: string | null;
  accesorio: Accesorio;
}

/** Estado de un ojo mientras se evalúa. */
export interface Contexto {
  ojo: Ojo;
  pantalla: Pantalla;
  /** Solo para pruebas: si se da, las «E» salen al azar; si es null, salen las secuencias fijas. */
  azar: Azar | null;
  /** Juego de secuencias fijas: A o B. */
  version: VersionLineas;
  /** Cuántas veces se mostró cada línea (por clave), para que la repetición de una línea tenga otra secuencia. */
  vistas: Map<string, number>;
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

/**
 * Pide colocar el celular solo si cambia el lugar o el accesorio. Fuera de la
 * caja (cerca) también al cambiar de ojo, porque hay que mover el oclusor;
 * dentro de la caja el cambio de ojo lo hace la pantalla. Con `nota` lo pide
 * siempre, para que el docente lea la explicación de lo que sigue.
 */
export function* ir(
  posicion: Posicion,
  lugar: Lugar,
  accesorio: Accesorio,
  ojo: Ojo | null,
  nota: 'abanico' | null = null,
): Flujo<void> {
  const mismoOjo = lugar.id !== 'cerca' || posicion.ojo === ojo;
  if (!nota && posicion.lugar === lugar.id && posicion.accesorio === accesorio && mismoOjo) return;
  const moverPasador = posicion.lugar !== lugar.id;
  const quitar = posicion.accesorio !== null && posicion.accesorio !== accesorio ? posicion.accesorio : null;
  exigir(yield { tipo: 'colocar', ojo, lugar: lugar.id, accesorio, quitar, moverPasador, nota }, 'confirmar');
  posicion.ojo = ojo;
  posicion.lugar = lugar.id;
  posicion.accesorio = accesorio;
}

export function* esperar(segundos: number): Flujo<void> {
  exigir(yield { tipo: 'espera', segundos }, 'confirmar');
}

/**
 * Muestra una línea de cinco «E», la registra y devuelve los aciertos. Las
 * respuestas que llegan después de que la línea quedó decidida se descartan.
 */
export function* mostrarLinea(
  ctx: Contexto,
  prueba: Prueba,
  lugar: Lugar,
  nivel: Nivel,
  necesarios: number,
): Flujo<number> {
  const clave = `${prueba}|${ctx.ojo}|${lugar.id}|${nivel.nombre}`;
  const vez = (ctx.vistas.get(clave) ?? 0) + 1;
  ctx.vistas.set(clave, vez);
  const orientaciones = ctx.azar
    ? generarOrientaciones(LETRAS_POR_LINEA, ctx.azar, ctx.ultima)
    : secuenciaLinea(ctx.version, `${clave}|${vez}`, ctx.ultima, LETRAS_POR_LINEA);
  ctx.ultima = orientaciones[orientaciones.length - 1];
  const evento = exigir(
    yield { tipo: 'linea', ojo: ctx.ojo, prueba, lugar, nivel, orientaciones, necesarios },
    'linea',
  );
  const respuestas = evento.toques.map((t) => t.respuesta);
  const respondidas = respuestasParaDecidir(orientaciones, respuestas, necesarios) ?? respuestas.length;
  const toques = evento.toques.slice(0, respondidas);
  const aciertos = contarAciertos(orientaciones.slice(0, respondidas), respuestas.slice(0, respondidas));
  ctx.registro.push({
    prueba,
    lugar: lugar.id,
    nivel: nivel.nombre,
    mostradas: orientaciones,
    toques,
    aciertos,
    respondidas,
    cortada: respondidas < LETRAS_POR_LINEA,
  });
  return aciertos;
}
