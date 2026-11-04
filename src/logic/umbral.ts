/**
 * Agudeza umbral: desde 6/60 hacia abajo hasta el nivel de corte.
 */
import { esDibujable, NIVELES, type Nivel } from '../core/optotipos';
import { ACIERTOS_PARA_PASAR, ACIERTOS_UMBRAL } from './linea';
import { mostrarLinea, type Contexto, type Flujo, type Lugar } from './pasos';

export interface ResultadoUmbral {
  /** Último nivel con ≥ 3 de 5; null = menor que 6/60. */
  agudeza: Nivel | null;
  /** Control de calidad: tras la primera falla, acertó ≥ 4 de 5 en un nivel más pequeño. */
  aciertaMenor: boolean;
}

/**
 * Baja de nivel mientras el niño acierte ≥ 3 de 5. En la primera falla muestra
 * un nivel más pequeño (si se puede dibujar) como control de calidad.
 */
export function* medirUmbral(
  ctx: Contexto,
  lugar: Lugar,
  corte: Nivel,
  prueba: 'umbral' | 'estenopeico',
): Flujo<ResultadoUmbral> {
  let agudeza: Nivel | null = null;
  const hastaCorte = NIVELES.slice(0, NIVELES.indexOf(corte) + 1);
  for (const nivel of hastaCorte) {
    if ((yield* mostrarLinea(ctx, prueba, lugar, nivel, ACIERTOS_UMBRAL)) >= ACIERTOS_UMBRAL) {
      agudeza = nivel;
      continue;
    }
    const menor = NIVELES[NIVELES.indexOf(nivel) + 1];
    let aciertaMenor = false;
    if (menor && esDibujable(menor, lugar, ctx.pantalla)) {
      aciertaMenor =
        (yield* mostrarLinea(ctx, 'control', lugar, menor, ACIERTOS_PARA_PASAR)) >= ACIERTOS_PARA_PASAR;
    }
    return { agudeza, aciertaMenor };
  }
  return { agudeza, aciertaMenor: false };
}

/** Posición en la escala: 0 = 6/60, 6 = 6/6; −1 = menor que 6/60. */
export function indiceAgudeza(agudeza: Nivel | null): number {
  return agudeza ? NIVELES.indexOf(agudeza) : -1;
}

/** «Mejora» con el estenopeico = gana al menos un nivel. */
export function mejoraConEstenopeico(sin: Nivel | null, con: Nivel | null): boolean {
  return indiceAgudeza(con) >= indiceAgudeza(sin) + 1;
}

export function nombreAgudeza(agudeza: Nivel | null): string {
  return agudeza ? agudeza.nombre : '<6/60';
}
