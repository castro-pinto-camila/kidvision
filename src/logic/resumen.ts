/**
 * Resumen del salón: conteo por color y listas de derivados, a repetir y pendientes.
 */
import type { Semaforo } from './clasificacion';
import type { ResultadoSesion } from './flujo';

export interface FilaSalon {
  codigo: string;
  /** Última evaluación; null si está pendiente. */
  sesion: ResultadoSesion | null;
}

export interface ResumenSalon {
  total: number;
  evaluados: number;
  porColor: Record<Semaforo, number>;
  derivar: string[];
  repetir: string[];
  pendientes: string[];
}

export function resumirSalon(filas: FilaSalon[]): ResumenSalon {
  const r: ResumenSalon = {
    total: filas.length,
    evaluados: 0,
    porColor: { VERDE: 0, AMARILLO: 0, ROJO: 0 },
    derivar: [],
    repetir: [],
    pendientes: [],
  };
  for (const { codigo, sesion } of filas) {
    if (!sesion) {
      r.pendientes.push(codigo);
      continue;
    }
    r.evaluados++;
    r.porColor[sesion.semaforo]++;
    if (sesion.indicacion === 'derivar') r.derivar.push(codigo);
    if (sesion.indicacion === 'repetir' || sesion.indicacion === 'repetir-otro-celular') r.repetir.push(codigo);
  }
  return r;
}
