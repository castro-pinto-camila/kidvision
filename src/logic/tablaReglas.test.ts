import { describe, expect, it } from 'vitest';
import tablaNino from '../../docs/tabla-reglas-nino.csv?raw';
import tablaOjo from '../../docs/tabla-reglas-ojo.csv?raw';
import { clasificar, type Categoria, type Hallazgos } from './clasificacion';
import { combinacionesDeUnOjo, combinacionesDelNino, csvNino, csvOjo, indicacionDe } from './tablaReglas';

/**
 * Las fórmulas del SPEC.md («Clasificación por ojo»), copiadas tal cual y por separado de
 * src/logic/clasificacion.ts. «!x» del SPEC significa «x es falso», no «x es null».
 */
function segunElSpec(h: Hallazgos) {
  const fallaLejos = !h.pasaLejos;
  const miopia = fallaLejos && h.puntoRemoto != null;
  const hipermetropia = (h.pasaLejos && h.pasaConMas2 === true) || (h.pasaLejos && !h.pasaCerca);
  const fallaAgudeza = fallaLejos || !h.pasaCerca;
  const astigmatismo = h.abanicoConsistente && fallaAgudeza;
  const posibleAstigmatismo = h.abanicoConsistente && !fallaAgudeza;
  const otraCausa = fallaLejos && h.puntoRemoto == null && h.mejoraEstenopeico === false;
  const indeterminado = fallaLejos && h.puntoRemoto == null && h.mejoraEstenopeico === true && !hipermetropia && !astigmatismo;
  const normal = h.pasaLejos && h.pasaConMas2 === false && h.pasaCerca;
  const categorias: Categoria[] = [];
  if (miopia) categorias.push('miopia');
  if (hipermetropia) categorias.push('hipermetropia');
  if (astigmatismo) categorias.push('astigmatismo');
  if (otraCausa) categorias.push('otraCausa');
  if (indeterminado) categorias.push('indeterminado');
  if (normal) categorias.push('normal');
  return { categorias, posibleAstigmatismo, semaforo: h.dudoso ? 'AMARILLO' : normal ? 'VERDE' : 'ROJO' };
}

/** Todas las combinaciones posibles de hallazgos, también las que el flujo nunca produce. */
function todasLasCombinaciones(): Hallazgos[] {
  const bools = [false, true];
  const tres = [null, false, true];
  const filas: Hallazgos[] = [];
  for (const pasaLejos of bools)
    for (const puntoRemoto of [null, 'R3'])
      for (const pasaConMas2 of tres)
        for (const mejoraEstenopeico of tres)
          for (const abanicoConsistente of bools)
            for (const pasaCerca of bools)
              for (const dudoso of bools)
                filas.push({ pasaLejos, puntoRemoto, pasaConMas2, mejoraEstenopeico, abanicoConsistente, pasaCerca, dudoso });
  return filas;
}

describe('reglas de clasificación frente a las fórmulas del SPEC', () => {
  it('dan lo mismo en las 288 combinaciones posibles de hallazgos', () => {
    const todas = todasLasCombinaciones();
    expect(todas).toHaveLength(288);
    for (const h of todas) {
      const real = clasificar(h);
      const esperado = segunElSpec(h);
      expect(real.categorias, JSON.stringify(h)).toEqual(esperado.categorias);
      expect(real.posibleAstigmatismo, JSON.stringify(h)).toBe(esperado.posibleAstigmatismo);
      expect(real.semaforo, JSON.stringify(h)).toBe(esperado.semaforo);
    }
  });

  it('las combinaciones que el flujo puede producir son 48 y todas están en la tabla', () => {
    expect(combinacionesDeUnOjo()).toHaveLength(48);
    expect(csvOjo().trim().split('\n')).toHaveLength(49);
  });

  it('un ojo que llega al límite del dispositivo queda sin categoría y amarillo', () => {
    const h: Hallazgos = { pasaLejos: false, puntoRemoto: null, pasaConMas2: null, mejoraEstenopeico: null, abanicoConsistente: false, pasaCerca: false, dudoso: true };
    expect(clasificar(h)).toMatchObject({ categorias: [], semaforo: 'AMARILLO' });
  });
});

describe('qué hacer con el niño frente a lo que dice el SPEC', () => {
  it('rojo = derivar; verde = no derivar; amarillo = repetir, o repetir con otro celular si hay límite', () => {
    for (const f of combinacionesDelNino()) {
      const r = indicacionDe(f);
      const peor = [f.od, f.oi].includes('ROJO') ? 'ROJO' : [f.od, f.oi].includes('AMARILLO') ? 'AMARILLO' : 'VERDE';
      expect(r.semaforo).toBe(peor);
      const esperado = peor === 'ROJO' ? 'derivar' : peor === 'VERDE' ? 'no-derivar' : f.limite ? 'repetir-otro-celular' : 'repetir';
      expect(r.indicacion, JSON.stringify(f)).toBe(esperado);
    }
  });
});

describe('archivos para revisar en Excel', () => {
  it('docs/tabla-reglas-ojo.csv y docs/tabla-reglas-nino.csv están al día (si falla, corre npm run guia)', () => {
    expect(tablaOjo.replace(/\r\n/g, '\n')).toBe(csvOjo());
    expect(tablaNino.replace(/\r\n/g, '\n')).toBe(csvNino());
  });
});
