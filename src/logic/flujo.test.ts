import { describe, expect, it } from 'vitest';
import { CAJA_POR_DEFECTO, crearCaja } from '../core/caja';
import type { Pantalla } from '../core/optotipos';
import { PruebaVisual, type OpcionesPrueba, type Paso, type ResultadoSesion } from './flujo';
import { azarConSemilla, responderComo, toquesPara, type Nino, type OjoSimulado } from './ninoSimulado';
import type { Evento } from './pasos';

// 0,06 mm por píxel físico, como las tablas de SPEC.md.
const PANTALLA: Pantalla = { pxPorMm: 1 / 0.06, dpr: 1 };

type Intervencion = (paso: Paso, evento: Evento) => Evento;

function correr(
  nino: Nino,
  opciones: Partial<OpcionesPrueba> = {},
  intervenir?: Intervencion,
): { resultado: ResultadoSesion; pasos: Paso[] } {
  const prueba = new PruebaVisual({
    caja: CAJA_POR_DEFECTO,
    pantalla: PANTALLA,
    azar: azarConSemilla(7),
    ...opciones,
  });
  const pasos: Paso[] = [prueba.paso];
  while (prueba.paso.tipo !== 'fin') {
    const normal = responderComo(nino, prueba.paso);
    pasos.push(prueba.responder(intervenir ? intervenir(prueba.paso, normal) : normal));
    if (pasos.length > 500) throw new Error('La prueba no termina');
  }
  return { resultado: prueba.paso.resultado, pasos };
}

const ambos = (ojo: OjoSimulado): Nino => ({ OD: ojo, OI: ojo });

/** Resumen legible de un paso, para comparar secuencias. */
function resumen(p: Paso): string {
  switch (p.tipo) {
    case 'colocar':
      return `${p.ojo} colocar ${p.lugar}${p.accesorio ? ' + ' + p.accesorio : ''}${p.quitar ? ' (quitar ' + p.quitar + ')' : ''}`;
    case 'espera':
      return `${p.ojo} espera ${p.segundos}`;
    case 'linea':
      return `${p.ojo} ${p.prueba} ${p.lugar.id} ${p.nivel.nombre}`;
    case 'abanico':
      return `${p.ojo} abanico ${p.vuelta}`;
    case 'fin':
      return 'fin';
  }
}

const delOjo = (pasos: Paso[], ojo: 'OD' | 'OI') =>
  pasos.filter((p) => p.tipo !== 'fin' && p.ojo === ojo).map(resumen);

describe('niño con visión normal', () => {
  const { resultado, pasos } = correr(ambos({ refraccion: 0 }));

  it('sigue el orden del SPEC: lejos, clip, abanico, cerca; ojo derecho y luego izquierdo', () => {
    expect(delOjo(pasos, 'OD')).toEqual([
      'OD colocar R0',
      'OD lejos R0 6/9',
      'OD colocar R0 + clip',
      'OD espera 60',
      'OD clip R0 6/9',
      'OD colocar R0 (quitar clip)',
      'OD abanico 1',
      'OD abanico 2',
      'OD colocar cerca',
      'OD cerca cerca 6/9',
    ]);
    expect(resumen(pasos[delOjo(pasos, 'OD').length])).toBe('OI colocar R0');
    expect(pasos.at(-1)!.tipo).toBe('fin');
  });

  it('es normal y VERDE', () => {
    const OD = resultado.ojos.OD;
    expect(OD).toMatchObject({
      pasaLejos: true,
      umbral: null,
      pasaConMas2: false,
      abanico: [null, null],
      abanicoConsistente: false,
      pasaCerca: true,
      dudoso: false,
      categorias: ['normal'],
      semaforo: 'VERDE',
    });
    expect(resultado.semaforo).toBe('VERDE');
  });

  it('guarda cada línea con sus respuestas y tiempos', () => {
    const registro = resultado.ojos.OD.registro;
    expect(registro.map((l) => l.prueba)).toEqual(['lejos', 'clip', 'cerca']);
    expect(registro[0].toques).toHaveLength(5);
    expect(registro[0].toques[0].ms).toBe(1200);
    expect(registro[0].aciertos).toBe(5);
  });
});

describe('miopía', () => {
  // F = −1,5 D: ve nítido desde R3 (−1,47 D en el ojo).
  const miope: OjoSimulado = { refraccion: -1.5, borrosa: 24 };

  it('mide el umbral, encuentra el punto remoto en R3 confirmado en R4 y hace el abanico en R3', () => {
    const { resultado, pasos } = correr(ambos(miope));
    expect(delOjo(pasos, 'OD')).toEqual([
      'OD colocar R0',
      'OD lejos R0 6/9',
      'OD umbral R0 6/60',
      'OD umbral R0 6/36',
      'OD umbral R0 6/24',
      'OD umbral R0 6/18',
      'OD control R0 6/12',
      'OD colocar R1',
      'OD remoto R1 6/12',
      'OD colocar R2',
      'OD remoto R2 6/12',
      'OD colocar R3',
      'OD remoto R3 6/12',
      'OD colocar R4',
      expect.stringMatching(/^OD remoto R4 /),
      'OD colocar R3',
      'OD abanico 1',
      'OD abanico 2',
      'OD colocar cerca',
      'OD cerca cerca 6/9',
    ]);
    expect(resultado.ojos.OD).toMatchObject({
      pasaLejos: false,
      umbral: '6/24',
      puntoRemoto: 'R3',
      puntoRemotoEstado: 'confirmado',
      pasaConMas2: null,
      mejoraEstenopeico: null,
      dudoso: false,
      categorias: ['miopia'],
      semaforo: 'ROJO',
    });
    expect(resultado.ojos.OD.miopiaEstimadaD).toBeCloseTo(-1.47, 2);
    expect(resultado.semaforo).toBe('ROJO');
  });

  it('punto remoto en la última ranura (R10) queda confirmado sin ranura siguiente', () => {
    const { resultado } = correr(ambos({ refraccion: -4.8, borrosa: 60 }));
    expect(resultado.ojos.OD.puntoRemoto).toBe('R10');
    expect(resultado.ojos.OD.puntoRemotoEstado).toBe('confirmado');
    expect(resultado.ojos.OD.miopiaEstimadaD).toBeCloseTo(-4.65, 2);
    expect(resultado.ojos.OD.dudoso).toBe(false);
  });

  it('si la confirmación falla y el reintento pasa, queda confirmado', () => {
    let fallas = 0;
    const { resultado, pasos } = correr(ambos(miope), {}, (paso, ev) => {
      if (paso.tipo === 'linea' && paso.ojo === 'OD' && paso.prueba === 'remoto' && paso.lugar.id === 'R4' && fallas++ === 0) {
        return { tipo: 'linea', toques: toquesPara(paso, false) };
      }
      return ev;
    });
    const od = delOjo(pasos, 'OD');
    expect(od.filter((s) => s.startsWith('OD remoto R4'))).toHaveLength(2);
    expect(od.filter((s) => s === 'OD colocar R4')).toHaveLength(1);
    expect(resultado.ojos.OD).toMatchObject({
      puntoRemoto: 'R3',
      puntoRemotoEstado: 'confirmado',
      dudoso: false,
    });
  });

  it('si la confirmación falla dos veces: punto remoto tentativo, dudoso y AMARILLO', () => {
    const { resultado, pasos } = correr(ambos(miope), {}, (paso, ev) =>
      paso.tipo === 'linea' && paso.ojo === 'OD' && paso.prueba === 'remoto' && paso.lugar.id === 'R4'
        ? { tipo: 'linea', toques: toquesPara(paso, false) }
        : ev,
    );
    expect(delOjo(pasos, 'OD').some((s) => s.includes('R5'))).toBe(false);
    expect(resultado.ojos.OD).toMatchObject({
      puntoRemoto: 'R3',
      puntoRemotoEstado: 'tentativo',
      dudoso: true,
      motivosDudoso: ['punto-remoto-no-confirmado'],
      categorias: ['miopia'],
      semaforo: 'AMARILLO',
    });
    // El ojo izquierdo es ROJO (miopía confirmada): el niño es ROJO.
    expect(resultado.ojos.OI.semaforo).toBe('ROJO');
    expect(resultado.semaforo).toBe('ROJO');
  });

  it('sin punto remoto (miopía > −5 D) y mejora con estenopeico: indeterminado', () => {
    const { resultado, pasos } = correr(
      ambos({ refraccion: -7, borrosa: 60, conEstenopeico: 12 }),
    );
    const od = delOjo(pasos, 'OD');
    expect(od).toContain('OD colocar R10');
    expect(od).toContain('OD colocar R0 + estenopeico');
    expect(od).toContain('OD colocar R0 (quitar estenopeico)');
    expect(resultado.ojos.OD).toMatchObject({
      umbral: '6/60',
      puntoRemoto: null,
      puntoRemotoEstado: 'no-encontrado',
      umbralEstenopeico: '6/12',
      mejoraEstenopeico: true,
      categorias: ['indeterminado'],
      semaforo: 'ROJO',
    });
  });
});

describe('otras categorías', () => {
  it('hipermetropía: sigue leyendo con el clip de +2.00 D', () => {
    const { resultado } = correr(ambos({ refraccion: 2.5 }));
    expect(resultado.ojos.OD).toMatchObject({
      pasaLejos: true,
      pasaConMas2: true,
      categorias: ['hipermetropia'],
      semaforo: 'ROJO',
    });
  });

  it('hipermetropía: pasa de lejos pero falla de cerca', () => {
    const { resultado } = correr(ambos({ refraccion: 0, acomodacion: 1 }));
    expect(resultado.ojos.OD).toMatchObject({
      pasaConMas2: false,
      pasaCerca: false,
      categorias: ['hipermetropia'],
    });
  });

  it('astigmatismo: elige la misma línea física en las dos vueltas', () => {
    const { resultado } = correr(ambos({ refraccion: 0, ejeAstigmatismo: 30 }));
    expect(resultado.ojos.OD).toMatchObject({
      abanico: [30, 30],
      abanicoConsistente: true,
      categorias: ['astigmatismo'],
      semaforo: 'ROJO',
    });
  });

  it('el niño que repite siempre el mismo número NO sale con astigmatismo', () => {
    const { resultado } = correr(ambos({ refraccion: 0 }), {}, (paso, ev) =>
      paso.tipo === 'abanico' ? { tipo: 'abanico', eleccion: 2 } : ev,
    );
    expect(resultado.ojos.OD.abanicoConsistente).toBe(false);
    expect(resultado.ojos.OD.categorias).toEqual(['normal']);
  });

  it('otra causa: no ve nítido en ninguna ranura y no mejora con estenopeico', () => {
    const { resultado } = correr(
      ambos({ refraccion: 0, puedeVerNitido: false, borrosa: 36, conEstenopeico: 36 }),
    );
    expect(resultado.ojos.OD).toMatchObject({
      umbral: '6/36',
      puntoRemoto: null,
      umbralEstenopeico: '6/36',
      mejoraEstenopeico: false,
      categorias: ['otraCausa'],
      semaforo: 'ROJO',
    });
  });
});

describe('control de calidad en el flujo', () => {
  it('cinco respuestas iguales seguidas → dudoso', () => {
    const { resultado } = correr({
      OD: { refraccion: 0, respondeSiempre: 'arriba' },
      OI: { refraccion: 0 },
    });
    expect(resultado.ojos.OD.motivosDudoso).toContain('respuestas-iguales');
    expect(resultado.ojos.OD.semaforo).toBe('AMARILLO');
    expect(resultado.ojos.OI.dudoso).toBe(false);
    expect(resultado.semaforo).toBe('AMARILLO');
  });

  it('falla un nivel grande y acierta ≥ 4 de 5 en uno menor → dudoso', () => {
    const { resultado } = correr(ambos({ refraccion: -1.5, borrosa: 24 }), {}, (paso, ev) =>
      paso.tipo === 'linea' && paso.prueba === 'control'
        ? { tipo: 'linea', toques: toquesPara(paso, true) }
        : ev,
    );
    expect(resultado.ojos.OD.umbral).toBe('6/24');
    expect(resultado.ojos.OD.motivosDudoso).toEqual(['falla-grande-acierta-menor']);
  });

  it('con solo 3 de 5 en el nivel menor no es dudoso', () => {
    const { resultado } = correr(ambos({ refraccion: -1.5, borrosa: 24 }), {}, (paso, ev) => {
      if (paso.tipo !== 'linea' || paso.prueba !== 'control') return ev;
      const toques = toquesPara(paso, true);
      toques[0] = { respuesta: 'nose', ms: 900 };
      toques[1] = { respuesta: 'nose', ms: 900 };
      return { tipo: 'linea', toques };
    });
    expect(resultado.ojos.OD.dudoso).toBe(false);
  });

  it('límite del dispositivo: una ranura sin niveles dibujables → dudoso, sin estenopeico', () => {
    const caja = crearCaja();
    caja.ranuras_mm[10] = 10; // ranura absurda: ni el 6/60 se puede dibujar
    const { resultado, pasos } = correr(ambos({ refraccion: -7, borrosa: 60 }), { caja });
    expect(delOjo(pasos, 'OD').some((s) => s.includes('R10'))).toBe(false);
    expect(delOjo(pasos, 'OD').some((s) => s.includes('estenopeico'))).toBe(false);
    expect(resultado.ojos.OD).toMatchObject({
      puntoRemoto: null,
      puntoRemotoEstado: 'limite',
      mejoraEstenopeico: null,
      motivosDudoso: ['limite-dispositivo'],
      categorias: [],
      semaforo: 'AMARILLO',
    });
  });
});

describe('opciones y validaciones', () => {
  it('con umbral de corte 6/12 la línea de lejos y la del clip son 6/12; la de cerca sigue en 6/9', () => {
    const { resultado, pasos } = correr(ambos({ refraccion: 0 }), { umbralCorte: '6/12' });
    const od = delOjo(pasos, 'OD');
    expect(od).toContain('OD lejos R0 6/12');
    expect(od).toContain('OD clip R0 6/12');
    expect(od).toContain('OD cerca cerca 6/9');
    expect(resultado.umbralCorte).toBe('6/12');
  });

  it('registra la fecha de inicio y la duración en segundos', () => {
    const tiempos = [Date.UTC(2026, 10, 5, 15, 20), Date.UTC(2026, 10, 5, 15, 24, 5)];
    const { resultado } = correr(ambos({ refraccion: 0 }), { ahora: () => tiempos.shift()! });
    expect(resultado.fecha).toBe('2026-11-05T15:20:00.000Z');
    expect(resultado.duracionSeg).toBe(245);
  });

  it('no acepta un celular que no puede dibujar el 6/9 en R0', () => {
    expect(
      () => new PruebaVisual({ caja: CAJA_POR_DEFECTO, pantalla: { pxPorMm: 10, dpr: 1 } }),
    ).toThrow(/no sirve/);
  });

  it('rechaza eventos que no corresponden y no pierde el paso', () => {
    const prueba = new PruebaVisual({ caja: CAJA_POR_DEFECTO, pantalla: PANTALLA });
    expect(prueba.paso.tipo).toBe('colocar');
    expect(() => prueba.responder({ tipo: 'abanico', eleccion: 1 })).toThrow();
    expect(prueba.paso.tipo).toBe('colocar');

    prueba.responder({ tipo: 'confirmar' });
    expect(prueba.paso.tipo).toBe('linea');
    expect(() =>
      prueba.responder({ tipo: 'linea', toques: [{ respuesta: 'arriba', ms: 1 }] }),
    ).toThrow(/5 respuestas/);
    expect(prueba.paso.tipo).toBe('linea');
  });

  it('rechaza un botón del abanico que no existe', () => {
    const prueba = new PruebaVisual({ caja: CAJA_POR_DEFECTO, pantalla: PANTALLA });
    const nino = ambos({ refraccion: 0 });
    while (prueba.paso.tipo !== 'abanico') prueba.responder(responderComo(nino, prueba.paso));
    expect(() => prueba.responder({ tipo: 'abanico', eleccion: 6 })).toThrow();
    expect(() => prueba.responder({ tipo: 'abanico', eleccion: 'iguales' })).not.toThrow();
  });

  it('el giro de la segunda vuelta del abanico es 60°, 90° o 120°', () => {
    const giros = new Set<number>();
    for (let semilla = 1; semilla <= 40; semilla++) {
      const { pasos } = correr(ambos({ refraccion: 0 }), { azar: azarConSemilla(semilla) });
      for (const p of pasos) {
        if (p.tipo === 'abanico') giros.add(p.vuelta === 1 ? p.rotacion + 1000 : p.rotacion);
      }
    }
    expect([...giros].sort((a, b) => a - b)).toEqual([60, 90, 120, 1000]);
  });
});
