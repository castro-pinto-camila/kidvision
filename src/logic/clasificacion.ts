/**
 * Clasificación por ojo y semáforo (SPEC.md, «Clasificación por ojo»).
 */

export type Semaforo = 'VERDE' | 'AMARILLO' | 'ROJO';

export type Categoria =
  | 'miopia'
  | 'hipermetropia'
  | 'astigmatismo'
  | 'otraCausa'
  | 'indeterminado'
  | 'normal';

export interface Hallazgos {
  pasaLejos: boolean;
  puntoRemoto: string | null;
  /** null si no se hizo (falló de lejos). */
  pasaConMas2: boolean | null;
  /** null si no se hizo. */
  mejoraEstenopeico: boolean | null;
  abanicoConsistente: boolean;
  pasaCerca: boolean;
  dudoso: boolean;
}

export interface Clasificacion {
  categorias: Categoria[];
  semaforo: Semaforo;
}

export function clasificar(h: Hallazgos): Clasificacion {
  const fallaLejos = !h.pasaLejos;
  const sinPuntoRemoto = h.puntoRemoto === null;

  const miopia = fallaLejos && !sinPuntoRemoto;
  const hipermetropia = (h.pasaLejos && h.pasaConMas2 === true) || (h.pasaLejos && !h.pasaCerca);
  const astigmatismo = h.abanicoConsistente;
  const otraCausa = fallaLejos && sinPuntoRemoto && h.mejoraEstenopeico === false;
  const indeterminado =
    fallaLejos && sinPuntoRemoto && h.mejoraEstenopeico === true && !hipermetropia && !astigmatismo;
  const normal = h.pasaLejos && h.pasaConMas2 === false && h.pasaCerca && !h.abanicoConsistente;

  const banderas: [Categoria, boolean][] = [
    ['miopia', miopia],
    ['hipermetropia', hipermetropia],
    ['astigmatismo', astigmatismo],
    ['otraCausa', otraCausa],
    ['indeterminado', indeterminado],
    ['normal', normal],
  ];
  return {
    categorias: banderas.filter(([, si]) => si).map(([c]) => c),
    semaforo: h.dudoso ? 'AMARILLO' : normal ? 'VERDE' : 'ROJO',
  };
}

/** ROJO si algún ojo es ROJO; si no, AMARILLO si alguno es AMARILLO; si no, VERDE. */
export function semaforoNino(ojos: Semaforo[]): Semaforo {
  if (ojos.includes('ROJO')) return 'ROJO';
  if (ojos.includes('AMARILLO')) return 'AMARILLO';
  return 'VERDE';
}
