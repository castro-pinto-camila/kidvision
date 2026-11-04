/**
 * Clasificación por ojo y semáforo (SPEC.md, «Clasificación por ojo»).
 */
import type { MotivoDudoso } from './calidad';

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
  /**
   * Abanico consistente pero agudeza buena de lejos y de cerca. Se guarda como
   * «posible astigmatismo (por validar)» y no cambia el semáforo: la pantalla
   * puede hacer ver más negras las líneas verticales y horizontales.
   */
  posibleAstigmatismo: boolean;
  semaforo: Semaforo;
}

export function clasificar(h: Hallazgos): Clasificacion {
  const fallaLejos = !h.pasaLejos;
  const sinPuntoRemoto = h.puntoRemoto === null;

  const fallaAgudeza = fallaLejos || !h.pasaCerca;

  const miopia = fallaLejos && !sinPuntoRemoto;
  const hipermetropia = (h.pasaLejos && h.pasaConMas2 === true) || (h.pasaLejos && !h.pasaCerca);
  // El abanico solo cuenta para la categoría cuando la agudeza falla.
  const astigmatismo = h.abanicoConsistente && fallaAgudeza;
  const posibleAstigmatismo = h.abanicoConsistente && !fallaAgudeza;
  const otraCausa = fallaLejos && sinPuntoRemoto && h.mejoraEstenopeico === false;
  const indeterminado =
    fallaLejos && sinPuntoRemoto && h.mejoraEstenopeico === true && !hipermetropia && !astigmatismo;
  const normal = h.pasaLejos && h.pasaConMas2 === false && h.pasaCerca;

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
    posibleAstigmatismo,
    semaforo: h.dudoso ? 'AMARILLO' : normal ? 'VERDE' : 'ROJO',
  };
}

/** ROJO si algún ojo es ROJO; si no, AMARILLO si alguno es AMARILLO; si no, VERDE. */
export function semaforoNino(ojos: Semaforo[]): Semaforo {
  if (ojos.includes('ROJO')) return 'ROJO';
  if (ojos.includes('AMARILLO')) return 'AMARILLO';
  return 'VERDE';
}

export type Indicacion = 'derivar' | 'no-derivar' | 'repetir' | 'repetir-otro-celular';

/**
 * Qué hacer con el niño. Si sale AMARILLO y algún ojo llegó al límite del
 * dispositivo, repetir en el mismo celular no sirve: hay que usar otro.
 */
export function indicacionNino(
  ojos: { semaforo: Semaforo; motivosDudoso: MotivoDudoso[] }[],
): Indicacion {
  const semaforo = semaforoNino(ojos.map((o) => o.semaforo));
  if (semaforo === 'ROJO') return 'derivar';
  if (semaforo === 'VERDE') return 'no-derivar';
  return ojos.some((o) => o.motivosDudoso.includes('limite-dispositivo'))
    ? 'repetir-otro-celular'
    : 'repetir';
}
