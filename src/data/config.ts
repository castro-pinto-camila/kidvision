/**
 * Configuración del celular y de la caja, guardada en IndexedDB.
 */
import { CAJA_POR_DEFECTO, type ConfigCaja } from '../core/caja';
import type { Franja } from '../core/disposicion';
import { ALMACEN_CONFIG, escribir, leer } from './db';

export interface Configuracion {
  /** Píxeles CSS por mm, de la calibración con la tarjeta; null = sin calibrar. */
  pxPorMm: number | null;
  caja: ConfigCaja;
  umbralCorte: '6/9' | '6/12';
  franja: Franja;
  /** Resultado de la comprobación con la «D»: dibujo girado 180° y/o mitades cambiadas. */
  pantallaInvertida: boolean;
  mitadesIntercambiadas: boolean;
}

const CLAVE = 'actual';

export function configuracionPorDefecto(): Configuracion {
  return {
    pxPorMm: null,
    caja: { ...CAJA_POR_DEFECTO, ranuras_mm: [...CAJA_POR_DEFECTO.ranuras_mm] },
    umbralCorte: '6/9',
    franja: { lado: 'arriba', ancho_mm: 15 },
    pantallaInvertida: false,
    mitadesIntercambiadas: false,
  };
}

/** Completa lo guardado con los valores por defecto (por si faltan campos de versiones anteriores). */
export function completar(guardada: Partial<Configuracion> | undefined): Configuracion {
  const base = configuracionPorDefecto();
  if (!guardada) return base;
  return {
    ...base,
    ...guardada,
    caja: { ...base.caja, ...guardada.caja },
    franja: { ...base.franja, ...guardada.franja },
  };
}

export async function leerConfiguracion(db: IDBDatabase): Promise<Configuracion> {
  return completar(await leer<Partial<Configuracion>>(db, ALMACEN_CONFIG, CLAVE));
}

export async function guardarConfiguracion(db: IDBDatabase, config: Configuracion): Promise<void> {
  await escribir(db, ALMACEN_CONFIG, CLAVE, config);
}
