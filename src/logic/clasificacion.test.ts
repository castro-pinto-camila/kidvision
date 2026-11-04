import { describe, expect, it } from 'vitest';
import type { MotivoDudoso } from './calidad';
import {
  clasificar,
  indicacionNino,
  semaforoNino,
  type Hallazgos,
  type Semaforo,
} from './clasificacion';

const NORMAL: Hallazgos = {
  pasaLejos: true,
  puntoRemoto: null,
  pasaConMas2: false,
  mejoraEstenopeico: null,
  abanicoConsistente: false,
  pasaCerca: true,
  dudoso: false,
};

const FALLA_LEJOS: Hallazgos = { ...NORMAL, pasaLejos: false, pasaConMas2: null };

describe('clasificación por ojo', () => {
  it('normal: pasa lejos, se nubla con +2, pasa cerca, abanico sin diferencias → VERDE', () => {
    expect(clasificar(NORMAL)).toEqual({ categorias: ['normal'], posibleAstigmatismo: false, semaforo: 'VERDE' });
  });

  it('miopía: falla lejos y hay punto remoto', () => {
    expect(clasificar({ ...FALLA_LEJOS, puntoRemoto: 'R4' })).toMatchObject({
      categorias: ['miopia'],
      semaforo: 'ROJO',
    });
  });

  it('hipermetropía: sigue leyendo con +2', () => {
    expect(clasificar({ ...NORMAL, pasaConMas2: true }).categorias).toEqual(['hipermetropia']);
  });

  it('hipermetropía: pasa lejos pero falla cerca', () => {
    expect(clasificar({ ...NORMAL, pasaCerca: false }).categorias).toEqual(['hipermetropia']);
  });

  it('abanico consistente con buena agudeza: posible astigmatismo, sigue VERDE', () => {
    expect(clasificar({ ...NORMAL, abanicoConsistente: true })).toEqual({
      categorias: ['normal'],
      posibleAstigmatismo: true,
      semaforo: 'VERDE',
    });
  });

  it('astigmatismo cuenta para la categoría cuando falla la agudeza de lejos', () => {
    expect(clasificar({ ...FALLA_LEJOS, mejoraEstenopeico: false, abanicoConsistente: true })).toMatchObject({
      categorias: ['astigmatismo', 'otraCausa'],
      posibleAstigmatismo: false,
      semaforo: 'ROJO',
    });
  });

  it('astigmatismo cuenta para la categoría cuando falla la agudeza de cerca', () => {
    expect(clasificar({ ...NORMAL, pasaCerca: false, abanicoConsistente: true })).toMatchObject({
      categorias: ['hipermetropia', 'astigmatismo'],
      posibleAstigmatismo: false,
      semaforo: 'ROJO',
    });
  });

  it('astigmatismo y miopía pueden coexistir', () => {
    expect(
      clasificar({ ...FALLA_LEJOS, puntoRemoto: 'R2', abanicoConsistente: true }).categorias,
    ).toEqual(['miopia', 'astigmatismo']);
  });

  it('otra causa: falla lejos, sin punto remoto y no mejora con estenopeico', () => {
    expect(clasificar({ ...FALLA_LEJOS, mejoraEstenopeico: false }).categorias).toEqual([
      'otraCausa',
    ]);
  });

  it('indeterminado: falla lejos, sin punto remoto y mejora con estenopeico', () => {
    expect(clasificar({ ...FALLA_LEJOS, mejoraEstenopeico: true }).categorias).toEqual([
      'indeterminado',
    ]);
  });

  it('no es indeterminado si hay astigmatismo', () => {
    expect(
      clasificar({ ...FALLA_LEJOS, mejoraEstenopeico: true, abanicoConsistente: true }).categorias,
    ).toEqual(['astigmatismo']);
  });

  it('estenopeico no hecho (null) no cuenta como «no mejora»', () => {
    expect(clasificar({ ...FALLA_LEJOS, mejoraEstenopeico: null, dudoso: true })).toMatchObject({
      categorias: [],
      semaforo: 'AMARILLO',
    });
  });

  it('dudoso → AMARILLO aunque todo lo demás sea normal o rojo', () => {
    expect(clasificar({ ...NORMAL, dudoso: true }).semaforo).toBe('AMARILLO');
    expect(clasificar({ ...FALLA_LEJOS, puntoRemoto: 'R3', dudoso: true }).semaforo).toBe('AMARILLO');
  });
});

describe('semáforo del niño', () => {
  it('ROJO si algún ojo es ROJO, aunque el otro sea AMARILLO', () => {
    expect(semaforoNino(['ROJO', 'AMARILLO'])).toBe('ROJO');
    expect(semaforoNino(['VERDE', 'ROJO'])).toBe('ROJO');
  });

  it('AMARILLO si ninguno es ROJO y alguno es AMARILLO', () => {
    expect(semaforoNino(['VERDE', 'AMARILLO'])).toBe('AMARILLO');
  });

  it('VERDE solo si los dos son VERDE', () => {
    expect(semaforoNino(['VERDE', 'VERDE'])).toBe('VERDE');
  });
});

describe('indicación para el niño', () => {
  const ojo = (semaforo: Semaforo, ...motivosDudoso: MotivoDudoso[]) => ({ semaforo, motivosDudoso });

  it('ROJO → derivar, aunque el otro ojo haya llegado al límite del dispositivo', () => {
    expect(indicacionNino([ojo('ROJO'), ojo('AMARILLO', 'limite-dispositivo')])).toBe('derivar');
  });

  it('VERDE → no derivar', () => {
    expect(indicacionNino([ojo('VERDE'), ojo('VERDE')])).toBe('no-derivar');
  });

  it('AMARILLO por el límite del dispositivo → repetir con otro celular', () => {
    expect(indicacionNino([ojo('VERDE'), ojo('AMARILLO', 'limite-dispositivo')])).toBe(
      'repetir-otro-celular',
    );
  });

  it('AMARILLO por otro motivo → repetir', () => {
    expect(indicacionNino([ojo('AMARILLO', 'respuestas-iguales'), ojo('VERDE')])).toBe('repetir');
  });
});
