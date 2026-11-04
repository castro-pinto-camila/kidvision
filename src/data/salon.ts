/**
 * Estudiantes y evaluaciones del salón, guardados en el celular.
 * El niño se registra por código, sin nombre (SPEC.md, «Datos»).
 */
import type { ResultadoSesion } from '../logic/flujo';
import {
  ALMACEN_ESTUDIANTES,
  ALMACEN_EVALUACIONES,
  esperar,
  INDICE_CODIGO,
  terminar,
} from './db';

export interface Estudiante {
  codigo: string;
  edad: number | null;
  grado: string;
}

/** Una evaluación, con la forma del JSON de SPEC.md. */
export interface Evaluacion {
  id?: number;
  estudiante: Estudiante & { colegio: string };
  dispositivo: {
    pxPorMm: number;
    dpr: number;
    caja: { P: number; e_mm: number; ranuras_mm: number[] };
  };
  sesion: ResultadoSesion;
}

/** Orden natural de códigos: «3B-2» antes que «3B-10». */
export function compararCodigos(a: string, b: string): number {
  return a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' });
}

export async function leerEstudiantes(db: IDBDatabase): Promise<Estudiante[]> {
  const todos = (await esperar(db.transaction(ALMACEN_ESTUDIANTES).objectStore(ALMACEN_ESTUDIANTES).getAll())) as Estudiante[];
  return todos.sort((a, b) => compararCodigos(a.codigo, b.codigo));
}

/** Agrega o actualiza estudiantes. Devuelve cuántos eran nuevos. */
export async function guardarEstudiantes(db: IDBDatabase, lista: Estudiante[]): Promise<{ nuevos: number; actualizados: number }> {
  const existentes = new Set((await leerEstudiantes(db)).map((e) => e.codigo));
  const tx = db.transaction(ALMACEN_ESTUDIANTES, 'readwrite');
  const almacen = tx.objectStore(ALMACEN_ESTUDIANTES);
  let nuevos = 0;
  for (const e of lista) {
    if (!existentes.has(e.codigo)) nuevos++;
    almacen.put(e);
  }
  await terminar(tx);
  return { nuevos, actualizados: lista.length - nuevos };
}

export async function guardarEvaluacion(db: IDBDatabase, evaluacion: Evaluacion): Promise<number> {
  const tx = db.transaction(ALMACEN_EVALUACIONES, 'readwrite');
  const id = (await esperar(tx.objectStore(ALMACEN_EVALUACIONES).add(evaluacion))) as number;
  await terminar(tx);
  return id;
}

export async function leerEvaluacion(db: IDBDatabase, id: number): Promise<Evaluacion | undefined> {
  return (await esperar(db.transaction(ALMACEN_EVALUACIONES).objectStore(ALMACEN_EVALUACIONES).get(id))) as
    | Evaluacion
    | undefined;
}

/** Todas las evaluaciones de un niño, de la más antigua a la más reciente. */
export async function evaluacionesDe(db: IDBDatabase, codigo: string): Promise<Evaluacion[]> {
  const indice = db.transaction(ALMACEN_EVALUACIONES).objectStore(ALMACEN_EVALUACIONES).index(INDICE_CODIGO);
  const lista = (await esperar(indice.getAll(codigo))) as Evaluacion[];
  return lista.sort((a, b) => a.sesion.fecha.localeCompare(b.sesion.fecha));
}

/** La última evaluación de cada niño (la lista muestra esa; el historial se conserva). */
export async function ultimasEvaluaciones(db: IDBDatabase): Promise<Map<string, Evaluacion>> {
  const todas = (await esperar(
    db.transaction(ALMACEN_EVALUACIONES).objectStore(ALMACEN_EVALUACIONES).getAll(),
  )) as Evaluacion[];
  const ultimas = new Map<string, Evaluacion>();
  for (const e of todas) {
    const previa = ultimas.get(e.estudiante.codigo);
    if (!previa || previa.sesion.fecha <= e.sesion.fecha) ultimas.set(e.estudiante.codigo, e);
  }
  return ultimas;
}

/** Borra estudiantes y evaluaciones. La configuración (calibración y caja) se conserva. */
export async function borrarSalon(db: IDBDatabase): Promise<void> {
  const tx = db.transaction([ALMACEN_ESTUDIANTES, ALMACEN_EVALUACIONES], 'readwrite');
  tx.objectStore(ALMACEN_ESTUDIANTES).clear();
  tx.objectStore(ALMACEN_EVALUACIONES).clear();
  await terminar(tx);
}
