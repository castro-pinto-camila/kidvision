/**
 * Tablas de verdad de las reglas de clasificación (SPEC.md, «Clasificación por ojo»):
 * una fila por cada combinación de hallazgos que puede darse. Se escriben en
 * docs/tabla-reglas-ojo.csv y docs/tabla-reglas-nino.csv para revisarlas en Excel
 * contra el SPEC, sin azar y sin pasar por la prueba.
 * Solo se usa para pruebas y documentación, no en la app.
 */
import { clasificar, indicacionNino, type Categoria, type Hallazgos, type Indicacion, type Semaforo } from './clasificacion';

const NOMBRE_CATEGORIA: Record<Categoria, string> = {
  miopia: 'miopía',
  hipermetropia: 'hipermetropía',
  astigmatismo: 'astigmatismo',
  otraCausa: 'otra causa',
  indeterminado: 'indeterminado',
  normal: 'normal',
};

const NOMBRE_INDICACION: Record<Indicacion, string> = {
  derivar: 'Derivar',
  'no-derivar': 'No derivar',
  repetir: 'Repetir la prueba',
  'repetir-otro-celular': 'Repetir con otro celular',
};

const BOM = '﻿';
const SEP = ';';
const sino = (x: boolean) => (x ? 'sí' : 'no');
const tresEstados = (x: boolean | null) => (x === null ? 'no se hizo' : sino(x));

/**
 * Combinaciones de hallazgos de un ojo que el flujo puede producir:
 * - Si pasa de lejos: no hay punto remoto ni estenopeico, y sí se hace la tapa +2.00.
 * - Si falla de lejos: no se hace la tapa +2.00; con punto remoto no se hace el estenopeico;
 *   sin punto remoto se hace el estenopeico (o no, si llegó al límite del dispositivo).
 */
export function combinacionesDeUnOjo(): Hallazgos[] {
  const filas: Hallazgos[] = [];
  const bools = [false, true];
  for (const dudoso of bools) {
    for (const pasaCerca of bools) {
      for (const abanicoConsistente of bools) {
        for (const pasaConMas2 of bools) {
          filas.push({ pasaLejos: true, puntoRemoto: null, pasaConMas2, mejoraEstenopeico: null, abanicoConsistente, pasaCerca, dudoso });
        }
        for (const [puntoRemoto, mejoraEstenopeico] of [['R2', null], [null, false], [null, true], [null, null]] as const) {
          filas.push({ pasaLejos: false, puntoRemoto, pasaConMas2: null, mejoraEstenopeico, abanicoConsistente, pasaCerca, dudoso });
        }
      }
    }
  }
  return filas;
}

export function csvOjo(): string {
  const cab = [
    'pasa de lejos',
    'tiene punto remoto',
    'pasa con +2.00',
    'mejora con estenopeico',
    'abanico consistente',
    'pasa de cerca',
    'resultado dudoso',
    'categoría',
    'posible astigmatismo (por validar)',
    'semáforo del ojo',
  ];
  const filas = combinacionesDeUnOjo().map((h) => {
    const r = clasificar(h);
    return [
      sino(h.pasaLejos),
      sino(h.puntoRemoto !== null),
      tresEstados(h.pasaConMas2),
      tresEstados(h.mejoraEstenopeico),
      sino(h.abanicoConsistente),
      sino(h.pasaCerca),
      sino(h.dudoso),
      r.categorias.map((c) => NOMBRE_CATEGORIA[c]).join(' + ') || '(sin categoría)',
      sino(r.posibleAstigmatismo),
      r.semaforo,
    ].join(SEP);
  });
  return BOM + [cab.join(SEP), ...filas].join('\n') + '\n';
}

/** Semáforo y «límite del dispositivo» de cada ojo → qué hacer con el niño. */
export function combinacionesDelNino(): { od: Semaforo; oi: Semaforo; limite: boolean }[] {
  const colores: Semaforo[] = ['VERDE', 'AMARILLO', 'ROJO'];
  const filas: { od: Semaforo; oi: Semaforo; limite: boolean }[] = [];
  for (const od of colores) {
    for (const oi of colores) {
      filas.push({ od, oi, limite: false });
      // «Límite del dispositivo» solo puede tenerlo un ojo amarillo.
      if (od === 'AMARILLO' || oi === 'AMARILLO') filas.push({ od, oi, limite: true });
    }
  }
  return filas;
}

export function indicacionDe(fila: { od: Semaforo; oi: Semaforo; limite: boolean }): { semaforo: Semaforo; indicacion: Indicacion } {
  const ojos = [
    { semaforo: fila.od, motivosDudoso: fila.limite && fila.od === 'AMARILLO' ? (['limite-dispositivo'] as const) : [] },
    { semaforo: fila.oi, motivosDudoso: fila.limite && fila.od !== 'AMARILLO' && fila.oi === 'AMARILLO' ? (['limite-dispositivo'] as const) : [] },
  ].map((o) => ({ semaforo: o.semaforo, motivosDudoso: [...o.motivosDudoso] }));
  const indicacion = indicacionNino(ojos);
  const semaforo: Semaforo = ojos.some((o) => o.semaforo === 'ROJO') ? 'ROJO' : ojos.some((o) => o.semaforo === 'AMARILLO') ? 'AMARILLO' : 'VERDE';
  return { semaforo, indicacion };
}

export function csvNino(): string {
  const cab = ['semáforo ojo derecho', 'semáforo ojo izquierdo', 'algún ojo en el límite del dispositivo', 'semáforo del niño', 'qué hacer'];
  const filas = combinacionesDelNino().map((f) => {
    const r = indicacionDe(f);
    return [f.od, f.oi, sino(f.limite), r.semaforo, NOMBRE_INDICACION[r.indicacion]].join(SEP);
  });
  return BOM + [cab.join(SEP), ...filas].join('\n') + '\n';
}
