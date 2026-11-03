/**
 * Búsqueda del punto remoto: de R1 a R10, siempre de borroso a nítido.
 */
import type { Ranura } from '../core/caja';
import { nivelObjetivo } from '../core/optotipos';
import { ACIERTOS_PARA_PASAR } from './linea';
import { ir, mostrarLinea, type Contexto, type Flujo } from './pasos';

export type EstadoPuntoRemoto =
  | 'confirmado'
  /** Pasó una ranura, pero la siguiente falló dos veces. */
  | 'tentativo'
  | 'no-encontrado'
  /** En una ranura no se puede dibujar ningún nivel. */
  | 'limite';

export interface ResultadoPuntoRemoto {
  ranura: Ranura | null;
  estado: EstadoPuntoRemoto;
}

/**
 * El punto remoto es la primera ranura con ≥ 4 de 5, confirmada en la
 * siguiente (o la última que se puede usar). Si la confirmación falla, se
 * repite una vez esa ranura.
 */
export function* buscarPuntoRemoto(ctx: Contexto, ranuras: Ranura[]): Flujo<ResultadoPuntoRemoto> {
  function* pasa(r: Ranura): Flujo<boolean> {
    const nivel = nivelObjetivo(r, ctx.pantalla)!;
    yield* ir(ctx, r);
    return (yield* mostrarLinea(ctx, 'remoto', r, nivel)) >= ACIERTOS_PARA_PASAR;
  }

  for (let i = 1; i < ranuras.length; i++) {
    const r = ranuras[i];
    if (!nivelObjetivo(r, ctx.pantalla)) return { ranura: null, estado: 'limite' };
    if (!(yield* pasa(r))) continue;

    const siguiente = ranuras[i + 1];
    if (!siguiente || !nivelObjetivo(siguiente, ctx.pantalla)) {
      return { ranura: r, estado: 'confirmado' };
    }
    if ((yield* pasa(siguiente)) || (yield* pasa(siguiente))) {
      return { ranura: r, estado: 'confirmado' };
    }
    return { ranura: r, estado: 'tentativo' };
  }
  return { ranura: null, estado: 'no-encontrado' };
}
