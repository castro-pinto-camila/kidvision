/**
 * Búsqueda del punto remoto: de R1 a R10, siempre de borroso a nítido.
 * Los dos ojos se buscan a la vez: en cada ranura se prueba el derecho y luego
 * el izquierdo, y recién después se mueve el celular.
 */
import type { Ranura } from '../core/caja';
import { nivelObjetivo, type Pantalla } from '../core/optotipos';
import { ACIERTOS_PARA_PASAR } from './linea';
import { ir, mostrarLinea, type Contexto, type Flujo, type Ojo, type Posicion } from './pasos';

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

interface OjoEnBusqueda {
  ctx: Contexto;
  /** Primera ranura que pasó, a la espera de confirmarse en la siguiente. */
  candidato: Ranura | null;
}

/**
 * El punto remoto de cada ojo es la primera ranura con ≥ 4 de 5, confirmada en
 * la siguiente (o la última que se puede usar). Si la confirmación falla, se
 * repite una vez en esa misma ranura.
 */
export function* buscarPuntosRemotos(
  ctxs: Contexto[],
  ranuras: Ranura[],
  pantalla: Pantalla,
  posicion: Posicion,
): Flujo<Map<Ojo, ResultadoPuntoRemoto>> {
  const resultados = new Map<Ojo, ResultadoPuntoRemoto>();
  let activos: OjoEnBusqueda[] = ctxs.map((ctx) => ({ ctx, candidato: null }));
  const ultima = ranuras.length - 1;

  for (let i = 1; i <= ultima && activos.length > 0; i++) {
    const r = ranuras[i];
    const nivel = nivelObjetivo(r, pantalla);
    if (!nivel) {
      // Un candidato pendiente queda confirmado: era la última ranura que se puede usar.
      for (const a of activos) {
        resultados.set(
          a.ctx.ojo,
          a.candidato ? { ranura: a.candidato, estado: 'confirmado' } : { ranura: null, estado: 'limite' },
        );
      }
      return resultados;
    }

    yield* ir(posicion, r, null, null);
    const siguen: OjoEnBusqueda[] = [];
    for (const a of activos) {
      const pasa = (yield* mostrarLinea(a.ctx, 'remoto', r, nivel, ACIERTOS_PARA_PASAR)) >= ACIERTOS_PARA_PASAR;
      if (a.candidato) {
        const confirmado =
          pasa || (yield* mostrarLinea(a.ctx, 'remoto', r, nivel, ACIERTOS_PARA_PASAR)) >= ACIERTOS_PARA_PASAR;
        resultados.set(a.ctx.ojo, { ranura: a.candidato, estado: confirmado ? 'confirmado' : 'tentativo' });
      } else if (pasa && i === ultima) {
        resultados.set(a.ctx.ojo, { ranura: r, estado: 'confirmado' });
      } else {
        siguen.push(pasa ? { ctx: a.ctx, candidato: r } : a);
      }
    }
    activos = siguen;
  }

  for (const a of activos) resultados.set(a.ctx.ojo, { ranura: null, estado: 'no-encontrado' });
  return resultados;
}
