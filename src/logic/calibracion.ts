/**
 * Calibración de la pantalla: referencias de tamaño conocido y valor inicial.
 * Lógica pura; la interfaz solo dibuja y toma el ajuste del dedo.
 */

export type IdReferencia = 'tarjeta' | 'regla-kit' | 'regla';

export interface Referencia {
  id: IdReferencia;
  nombre: string;
  /** Largo real de la referencia, en mm. */
  mm: number;
  instruccion: string;
}

/** Ancho de un DNI o tarjeta bancaria (ISO/IEC 7810 ID-1). */
export const ANCHO_TARJETA_MM = 85.6;

/** Los 10 cm que se usan de una regla (los primeros 10 cm de la tira del kit, resaltados). */
export const LARGO_REGLA_MM = 100;

export const REFERENCIAS: Referencia[] = [
  {
    id: 'tarjeta',
    nombre: 'DNI o tarjeta',
    mm: ANCHO_TARJETA_MM,
    instruccion:
      'Apoya tu DNI (o una tarjeta bancaria) sobre el rectángulo. Arrastra el punto azul hasta que los bordes izquierdo y derecho de la tarjeta queden al ras con los del rectángulo.',
  },
  {
    id: 'regla-kit',
    nombre: 'Regla del kit',
    mm: LARGO_REGLA_MM,
    instruccion:
      'Apoya la tira de cartón del kit sobre la línea, con el 0 en el borde izquierdo. Arrastra el punto azul hasta que el 10 (donde termina la parte resaltada) quede en el borde derecho.',
  },
  {
    id: 'regla',
    nombre: 'Regla común',
    mm: LARGO_REGLA_MM,
    instruccion:
      'Apoya una regla sobre la línea, con el 0 en el borde izquierdo. Arrastra el punto azul hasta que los 10 cm de la regla lleguen al borde derecho.',
  },
];

export const referenciaPorId = (id: IdReferencia): Referencia => REFERENCIAS.find((r) => r.id === id)!;

/** Error aceptable de la calibración (±5 %) y el que se busca (±2 %). */
export const TOLERANCIA_CALIBRACION = 0.05;
export const OBJETIVO_CALIBRACION = 0.02;

/**
 * Valor con el que empieza el ajuste, para que lo que falte sea pequeño: la
 * calibración anterior si la hay; si no, el valor típico (Android: 160 px CSS
 * por pulgada; iPhone: 163). No se usa la diagonal de la pantalla.
 */
export function valorInicial(pxPorMmGuardado: number | null, esIphone: boolean): number {
  if (pxPorMmGuardado !== null && pxPorMmGuardado > 0) return pxPorMmGuardado;
  return (esIphone ? 163 : 160) / 25.4;
}

/** Ancho en píxeles CSS que debe tener la referencia con esa calibración. */
export const anchoReferenciaPx = (r: Referencia, pxPorMm: number): number => r.mm * pxPorMm;

/** Calibración (px CSS por mm) a partir del ancho en que quedó ajustada la referencia. */
export const pxPorMmDesdeAncho = (r: Referencia, anchoPx: number): number => Math.max(anchoPx, 1) / r.mm;
