/**
 * Configuración del celular y de la caja, guardada en IndexedDB.
 */
import { CAJA_POR_DEFECTO, type ConfigCaja } from '../core/caja';
import type { Franja } from '../core/disposicion';
import { ALMACEN_CONFIG, escribir, leer } from './db';

/** Cómo era la pantalla al calibrar: si cambia algo de esto, la calibración ya no vale. */
export interface HuellaPantalla {
  /** screen.width y screen.height (en cualquier orden: girar el celular no cuenta como cambio). */
  ancho: number;
  alto: number;
  dpr: number;
  /** Zoom de la página con los dedos (visualViewport.scale); 1 = sin zoom. */
  zoom: number;
}

export interface Configuracion {
  /** Píxeles CSS por mm, de la calibración con la tarjeta; null = sin calibrar. */
  pxPorMm: number | null;
  /** devicePixelRatio al calibrar: si cambia (zoom o tamaño de letra del celular), hay que recalibrar. */
  dprCalibracion: number | null;
  /** Pantalla y zoom al calibrar; null si se calibró con una versión anterior de la app. */
  huella: HuellaPantalla | null;
  caja: ConfigCaja;
  /** Nombre del colegio: se escribe una vez y va en la constancia y en cada evaluación. */
  colegio: string;
  umbralCorte: '6/9' | '6/12';
  franja: Franja;
  /** Resultado de la comprobación con la «D»: dibujo girado 180° y/o mitades cambiadas. */
  pantallaInvertida: boolean;
  mitadesIntercambiadas: boolean;
}

const CLAVE = 'actual';

export type EstadoCalibracion = 'sin-calibrar' | 'vigente' | 'cambio-zoom' | 'cambio-pantalla';

/**
 * Si el devicePixelRatio cambió desde la calibración, los píxeles CSS ya no
 * miden lo mismo: el zoom o el tamaño de letra del celular cambió.
 */
export function estadoCalibracion(
  config: Configuracion,
  dprActual: number,
  huellaActual?: HuellaPantalla,
): EstadoCalibracion {
  if (config.pxPorMm === null) return 'sin-calibrar';
  if (config.dprCalibracion !== null && Math.abs(config.dprCalibracion - dprActual) > 0.01) return 'cambio-zoom';
  const h = config.huella;
  if (h && huellaActual) {
    if (Math.abs(h.zoom - huellaActual.zoom) > 0.01 || Math.abs(h.dpr - huellaActual.dpr) > 0.01) return 'cambio-zoom';
    const lados = (x: HuellaPantalla) => [Math.min(x.ancho, x.alto), Math.max(x.ancho, x.alto)];
    const [a1, a2] = lados(h);
    const [b1, b2] = lados(huellaActual);
    if (Math.abs(a1 - b1) > 1 || Math.abs(a2 - b2) > 1) return 'cambio-pantalla';
  }
  return 'vigente';
}

export function configuracionPorDefecto(): Configuracion {
  return {
    pxPorMm: null,
    dprCalibracion: null,
    huella: null,
    caja: { ...CAJA_POR_DEFECTO, ranuras_mm: [...CAJA_POR_DEFECTO.ranuras_mm] },
    colegio: '',
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
