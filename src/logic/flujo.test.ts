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
      return `${p.ojo ? p.ojo + ' ' : ''}colocar ${p.lugar}${p.accesorio ? ' + ' + p.accesorio : ''}${p.quitar ? ' (quitar ' + p.quitar + ')' : ''}`;
    case 'espera':
      return `espera ${p.segundos}`;
    case 'linea':
      return `${p.ojo} ${p.prueba} ${p.lugar.id} ${p.nivel.nombre}`;
    case 'abanico':
      return `${p.ojo} abanico ${p.vuelta}`;
    case 'fin':
      return 'fin';
  }
}

/** Ranuras de la caja a las que se movió el celular, en orden. */
const movimientos = (pasos: Paso[]) =>
  pasos.flatMap((p) => (p.tipo === 'colocar' && p.lugar !== 'cerca' ? [p.lugar] : []));

describe('niño con visión normal', () => {
  const { resultado, pasos } = correr(ambos({ refraccion: 0 }));

  it('en cada lugar se prueban los dos ojos; una sola espera con los lentes de +2.00; cerca al final', () => {
    expect(pasos.map(resumen)).toEqual([
      'colocar R0',
      'OD practica R0 6/60',
      'OD lejos R0 6/9',
      'OI lejos R0 6/9',
      'colocar R0 + clip',
      'espera 60',
      'OD clip R0 6/9',
      'OI clip R0 6/9',
      'colocar R0 (quitar clip)',
      'OD abanico 1',
      'OD abanico 2',
      'OI abanico 1',
      'OI abanico 2',
      'OD colocar cerca',
      'OD cerca cerca 6/9',
      'OI colocar cerca',
      'OI cerca cerca 6/9',
      'fin',
    ]);
  });

  it('el niño sale de la caja una sola vez', () => {
    const lugares = pasos.flatMap((p) => (p.tipo === 'colocar' ? [p.lugar] : []));
    const salidas = lugares.filter((l, i) => l === 'cerca' && lugares[i - 1] !== 'cerca');
    expect(salidas).toHaveLength(1);
  });

  it('es normal, VERDE y no derivar', () => {
    expect(resultado.ojos.OD).toMatchObject({
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
    expect(resultado.indicacion).toBe('no-derivar');
  });

  it('guarda cada línea con sus respuestas, tiempos y si se cortó (la práctica no cuenta)', () => {
    const registro = resultado.ojos.OD.registro;
    expect(registro.map((l) => l.prueba)).toEqual(['lejos', 'clip', 'cerca']);
    // Lejos: puede pasar, así que se piden las cinco «E».
    expect(registro[0]).toMatchObject({ aciertos: 5, respondidas: 5, cortada: false });
    expect(registro[0].toques).toHaveLength(5);
    expect(registro[0].toques[0].ms).toBe(1200);
    expect(registro[0].mostradas).toHaveLength(5);
    // Clip: se nubla; con 2 errores ya no puede llegar a 4.
    expect(registro[1]).toMatchObject({ aciertos: 0, respondidas: 2, cortada: true });
  });
});

describe('miopía', () => {
  // F = −1,5 D: ve nítido desde R3 (−1,47 D en el ojo).
  const miope: OjoSimulado = { refraccion: -1.5, borrosa: 24 };

  it('los dos ojos en cada ranura: punto remoto en R3, confirmado en R4, abanico en R3', () => {
    const { resultado, pasos } = correr(ambos(miope));
    const umbral = (ojo: string) => [
      `${ojo} lejos R0 6/9`,
      `${ojo} umbral R0 6/60`,
      `${ojo} umbral R0 6/36`,
      `${ojo} umbral R0 6/24`,
      `${ojo} umbral R0 6/18`,
      `${ojo} control R0 6/12`,
    ];
    expect(pasos.map(resumen)).toEqual([
      'colocar R0',
      'OD practica R0 6/60',
      ...umbral('OD'),
      ...umbral('OI'),
      'colocar R1',
      'OD remoto R1 6/12',
      'OI remoto R1 6/12',
      'colocar R2',
      'OD remoto R2 6/12',
      'OI remoto R2 6/12',
      'colocar R3',
      'OD remoto R3 6/12',
      'OI remoto R3 6/12',
      'colocar R4',
      expect.stringMatching(/^OD remoto R4 /),
      expect.stringMatching(/^OI remoto R4 /),
      'colocar R3',
      'OD abanico 1',
      'OD abanico 2',
      'OI abanico 1',
      'OI abanico 2',
      'OD colocar cerca',
      'OD cerca cerca 6/9',
      'OI colocar cerca',
      'OI cerca cerca 6/9',
      'fin',
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

  it('miope de −2,00 D en ambos ojos: R4, −1,94 D y ROJO', () => {
    const { resultado } = correr(ambos({ refraccion: -2, borrosa: 24 }));
    for (const ojo of [resultado.ojos.OD, resultado.ojos.OI]) {
      expect(ojo.puntoRemoto).toBe('R4');
      expect(ojo.puntoRemotoEstado).toBe('confirmado');
      expect(ojo.miopiaEstimadaD).toBeCloseTo(-1.94, 2);
      expect(ojo.categorias).toEqual(['miopia']);
      expect(ojo.semaforo).toBe('ROJO');
    }
    expect(resultado.semaforo).toBe('ROJO');
    expect(resultado.indicacion).toBe('derivar');
  });

  it('miope de −2,00 D: el celular se mueve 7 veces dentro de la caja (antes, 14)', () => {
    const { pasos } = correr(ambos({ refraccion: -2, borrosa: 24 }));
    expect(movimientos(pasos)).toEqual(['R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R4']);
  });

  it('ojos distintos: cada uno se detiene en su punto remoto', () => {
    const { resultado, pasos } = correr({
      OD: { refraccion: -1, borrosa: 24 },
      OI: { refraccion: -3, borrosa: 24 },
    });
    expect(resultado.ojos.OD.puntoRemoto).toBe('R2');
    expect(resultado.ojos.OI.puntoRemoto).toBe('R6');
    // El ojo derecho ya no se prueba después de confirmar en R3.
    const remotosOD = pasos.map(resumen).filter((s) => s.startsWith('OD remoto'));
    expect(remotosOD.at(-1)).toMatch(/^OD remoto R3 /);
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
    const textos = pasos.map(resumen);
    expect(textos.filter((s) => s.startsWith('OD remoto R4'))).toHaveLength(2);
    expect(textos.filter((s) => s === 'colocar R4')).toHaveLength(1);
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
    expect(movimientos(pasos)).not.toContain('R5');
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
    const { resultado, pasos } = correr(ambos({ refraccion: -7, borrosa: 60, conEstenopeico: 12 }));
    const textos = pasos.map(resumen);
    expect(textos).toContain('colocar R10');
    expect(textos.filter((s) => s === 'colocar R0 + estenopeico')).toHaveLength(1);
    expect(textos).toContain('colocar R0 (quitar estenopeico)');
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
  it('hipermetropía: sigue leyendo con los lentes de +2.00 D', () => {
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

  it('un ojo pasa y el otro falla: clip para uno, búsqueda para el otro', () => {
    const { resultado, pasos } = correr({ OD: { refraccion: 0 }, OI: { refraccion: -1.5, borrosa: 24 } });
    const textos = pasos.map(resumen);
    expect(textos).toContain('OD clip R0 6/9');
    expect(textos.some((s) => s.startsWith('OI clip'))).toBe(false);
    expect(textos.some((s) => s.startsWith('OD remoto'))).toBe(false);
    expect(resultado.ojos.OD.categorias).toEqual(['normal']);
    expect(resultado.ojos.OI.puntoRemoto).toBe('R3');
  });

  it('abanico consistente pero buena agudeza: posible astigmatismo (por validar), sigue VERDE', () => {
    const { resultado } = correr(ambos({ refraccion: 0, ejeAstigmatismo: 30 }));
    expect(resultado.ojos.OD).toMatchObject({
      abanico: [30, 30],
      abanicoConsistente: true,
      posibleAstigmatismo: true,
      categorias: ['normal'],
      semaforo: 'VERDE',
    });
  });

  it('abanico consistente y falla de lejos: astigmatismo en la categoría', () => {
    const { resultado } = correr(
      ambos({ refraccion: 0, puedeVerNitido: false, borrosa: 36, conEstenopeico: 18, ejeAstigmatismo: 30 }),
    );
    expect(resultado.ojos.OD.categorias).toContain('astigmatismo');
    expect(resultado.ojos.OD.posibleAstigmatismo).toBe(false);
    expect(resultado.ojos.OD.semaforo).toBe('ROJO');
  });

  it('antes del primer abanico siempre hay una pantalla con la explicación', () => {
    const { pasos } = correr(ambos({ refraccion: -4.8, borrosa: 60 }));
    const i = pasos.findIndex((p) => p.tipo === 'abanico');
    const antes = pasos[i - 1];
    expect(antes).toMatchObject({ tipo: 'colocar', lugar: 'R10', nota: 'abanico' });
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
  it('cinco respuestas iguales seguidas → dudoso, aunque las líneas se corten', () => {
    const { resultado } = correr({
      OD: { refraccion: 0, respondeSiempre: 'arriba' },
      OI: { refraccion: 0 },
    });
    expect(resultado.ojos.OD.registro.some((l) => l.cortada && l.respondidas < 5)).toBe(true);
    expect(resultado.ojos.OD.motivosDudoso).toContain('respuestas-iguales');
    expect(resultado.ojos.OD.semaforo).toBe('AMARILLO');
    expect(resultado.ojos.OI.dudoso).toBe(false);
    expect(resultado.semaforo).toBe('AMARILLO');
    expect(resultado.indicacion).toBe('repetir');
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
    expect(movimientos(pasos)).not.toContain('R10');
    expect(pasos.map(resumen).some((s) => s.includes('estenopeico'))).toBe(false);
    expect(resultado.ojos.OD).toMatchObject({
      puntoRemoto: null,
      puntoRemotoEstado: 'limite',
      mejoraEstenopeico: null,
      motivosDudoso: ['limite-dispositivo'],
      categorias: [],
      semaforo: 'AMARILLO',
    });
    expect(resultado.indicacion).toBe('repetir-otro-celular');
  });
});

describe('corte de línea', () => {
  function hastaLaPrimeraLinea() {
    const prueba = new PruebaVisual({ caja: CAJA_POR_DEFECTO, pantalla: PANTALLA, azar: azarConSemilla(3) });
    prueba.responder({ tipo: 'confirmar' });
    const practica = prueba.paso;
    if (practica.tipo !== 'linea') throw new Error('se esperaba la práctica');
    prueba.responder({ tipo: 'linea', toques: toquesPara(practica, true) });
    const paso = prueba.paso;
    if (paso.tipo !== 'linea') throw new Error('se esperaba una línea');
    return { prueba, paso };
  }

  it('la línea de lejos pide 4 aciertos', () => {
    const { paso } = hastaLaPrimeraLinea();
    expect(paso.prueba).toBe('lejos');
    expect(paso.necesarios).toBe(4);
  });

  it('la práctica es una línea 6/60 que nunca se corta y no se registra', () => {
    const prueba = new PruebaVisual({ caja: CAJA_POR_DEFECTO, pantalla: PANTALLA });
    prueba.responder({ tipo: 'confirmar' });
    const paso = prueba.paso;
    if (paso.tipo !== 'linea') throw new Error('se esperaba la práctica');
    expect(paso).toMatchObject({ prueba: 'practica', necesarios: 0 });
    expect(paso.nivel.nombre).toBe('6/60');
    const cuatro = toquesPara(paso, false).slice(0, 4);
    expect(() => prueba.responder({ tipo: 'linea', toques: cuatro })).toThrow(/no está decidida/);
  });

  it('con 4 aciertos la línea no se corta: se pide la quinta', () => {
    const { prueba, paso } = hastaLaPrimeraLinea();
    const cuatro = toquesPara(paso, true).slice(0, 4);
    expect(() => prueba.responder({ tipo: 'linea', toques: cuatro })).toThrow(/no está decidida/);
  });

  it('con dos errores la línea ya está decidida y se acepta', () => {
    const { prueba, paso } = hastaLaPrimeraLinea();
    const dos = toquesPara(paso, false).slice(0, 2);
    expect(() => prueba.responder({ tipo: 'linea', toques: dos })).not.toThrow();
  });

  it('con una sola respuesta todavía no está decidida: se rechaza y no se pierde el paso', () => {
    const { prueba, paso } = hastaLaPrimeraLinea();
    expect(() => prueba.responder({ tipo: 'linea', toques: [{ respuesta: 'nose', ms: 1 }] })).toThrow(
      /no está decidida/,
    );
    expect(prueba.paso).toBe(paso);
  });

  it('las respuestas que sobran después de decidir se descartan', () => {
    const { resultado } = correr(ambos({ refraccion: 0 }));
    for (const l of resultado.ojos.OD.registro) {
      expect(l.toques).toHaveLength(l.respondidas);
      expect(l.cortada).toBe(l.respondidas < 5);
    }
  });
});

describe('opciones y validaciones', () => {
  it('con umbral de corte 6/12 la línea de lejos y la del clip son 6/12; la de cerca sigue en 6/9', () => {
    const { resultado, pasos } = correr(ambos({ refraccion: 0 }), { umbralCorte: '6/12' });
    const textos = pasos.map(resumen);
    expect(textos).toContain('OD lejos R0 6/12');
    expect(textos).toContain('OD clip R0 6/12');
    expect(textos).toContain('OD cerca cerca 6/9');
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
