import { describe, expect, it } from 'vitest';
import { nivelPorNombre } from '../core/optotipos';
import {
  abanicoConsistente,
  anguloFisico,
  BOTONES_ABANICO,
  diferenciaAngular,
  etiquetaRayo,
  ROTACIONES_SEGUNDA_VUELTA,
} from './abanico';
import { hayRespuestasIguales } from './calidad';
import { contarAciertos, respuestasParaDecidir, type Respuesta } from './linea';
import { DIRECCIONES, generarOrientaciones, type Direccion } from './orientaciones';
import { azarConSemilla } from './ninoSimulado';
import { indiceAgudeza, mejoraConEstenopeico, nombreAgudeza } from './umbral';

describe('orientaciones', () => {
  it('dos «E» seguidas nunca miran al mismo lado, tampoco entre líneas', () => {
    let anterior: Direccion | null = null;
    for (let i = 0; i < 2000; i++) {
      const linea = generarOrientaciones(5, Math.random, anterior);
      [anterior, ...linea].forEach((d, j, todas) => {
        if (j > 0) expect(d).not.toBe(todas[j - 1]);
      });
      anterior = linea[4];
    }
  });

  it('usa las cuatro direcciones', () => {
    const vistas = new Set(generarOrientaciones(200, azarConSemilla(1)));
    expect([...vistas].sort()).toEqual([...DIRECCIONES].sort());
  });

  it('con la misma semilla da lo mismo', () => {
    expect(generarOrientaciones(5, azarConSemilla(3))).toEqual(
      generarOrientaciones(5, azarConSemilla(3)),
    );
  });
});

describe('corte de línea: cuántas respuestas hacen falta para decidir', () => {
  const m: Direccion[] = ['arriba', 'derecha', 'abajo', 'izquierda', 'arriba'];

  it('pide 4: si puede pasar, se piden las cinco (no se corta al cuarto acierto)', () => {
    expect(respuestasParaDecidir(m, ['arriba', 'derecha', 'abajo', 'izquierda'], 4)).toBeNull();
    expect(respuestasParaDecidir(m, ['arriba', 'derecha', 'abajo', 'izquierda', 'arriba'], 4)).toBe(5);
  });

  it('pide 4: falla con el segundo error', () => {
    expect(respuestasParaDecidir(m, ['nose', 'derecha', 'nose'], 4)).toBe(3);
    expect(respuestasParaDecidir(m, ['nose', 'nose'], 4)).toBe(2);
  });

  it('pide 3 (umbral): falla con el tercer error; si puede pasar, se piden las cinco', () => {
    expect(respuestasParaDecidir(m, ['arriba', 'derecha', 'abajo'], 3)).toBeNull();
    expect(respuestasParaDecidir(m, ['nose', 'nose', 'abajo', 'nose'], 3)).toBe(4);
  });

  it('pide 0 (práctica): nunca se corta', () => {
    expect(respuestasParaDecidir(m, ['nose', 'nose', 'nose', 'nose'], 0)).toBeNull();
    expect(respuestasParaDecidir(m, ['nose', 'nose', 'nose', 'nose', 'nose'], 0)).toBe(5);
  });

  it('todavía no decidida', () => {
    expect(respuestasParaDecidir(m, ['arriba', 'nose'], 4)).toBeNull();
    expect(respuestasParaDecidir(m, [], 4)).toBeNull();
  });

  it('con 3 aciertos y 1 error (pide 4) se decide en la quinta', () => {
    expect(respuestasParaDecidir(m, ['arriba', 'nose', 'abajo', 'izquierda'], 4)).toBeNull();
    expect(respuestasParaDecidir(m, ['arriba', 'nose', 'abajo', 'izquierda', 'arriba'], 4)).toBe(5);
  });
});

describe('línea', () => {
  it('cuenta aciertos y «no sé» es error', () => {
    expect(
      contarAciertos(
        ['arriba', 'derecha', 'abajo', 'izquierda', 'arriba'],
        ['arriba', 'nose', 'abajo', 'derecha', 'arriba'],
      ),
    ).toBe(3);
  });
});

describe('control de calidad: cinco respuestas iguales seguidas', () => {
  const r = (...xs: Respuesta[]) => xs;

  it('cinco flechas iguales = dudoso', () => {
    expect(hayRespuestasIguales(r('abajo', 'arriba', 'arriba', 'arriba', 'arriba', 'arriba'))).toBe(true);
  });

  it('cuatro iguales no', () => {
    expect(hayRespuestasIguales(r('arriba', 'arriba', 'arriba', 'arriba', 'abajo'))).toBe(false);
  });

  it('«no sé» no cuenta ni corta la racha', () => {
    expect(hayRespuestasIguales(r('arriba', 'arriba', 'nose', 'arriba', 'arriba', 'arriba'))).toBe(true);
    expect(hayRespuestasIguales(r('nose', 'nose', 'nose', 'nose', 'nose'))).toBe(false);
  });
});

describe('carta de abanico', () => {
  it('convierte el botón a ángulo físico', () => {
    expect(anguloFisico(0, 0)).toBe(90); // línea «1», vertical
    expect(anguloFisico(3, 0)).toBe(0); // línea «4», horizontal
    expect(anguloFisico(1, 0)).toBe(60); // línea «2»
    expect(anguloFisico(3, 90)).toBe(90);
    expect(anguloFisico(0, 120)).toBe(30);
  });

  it('compara sobre 180°', () => {
    expect(diferenciaAngular(0, 170)).toBe(10);
    expect(diferenciaAngular(10, 170)).toBe(20);
    expect(diferenciaAngular(0, 90)).toBe(90);
  });

  it('tolerancia ≤ 15°', () => {
    expect(abanicoConsistente(0, 165)).toBe(true);
    expect(abanicoConsistente(0, 15)).toBe(true);
    expect(abanicoConsistente(0, 16)).toBe(false);
  });

  it.each(ROTACIONES_SEGUNDA_VUELTA)(
    'repetir el mismo número con un giro de %i° NO es consistente',
    (giro) => {
      for (let boton = 0; boton < 6; boton++) {
        expect(abanicoConsistente(anguloFisico(boton, 0), anguloFisico(boton, giro))).toBe(false);
      }
    },
  );

  it.each(ROTACIONES_SEGUNDA_VUELTA)(
    'elegir la misma línea física con un giro de %i° sí es consistente',
    (giro) => {
      const primera = anguloFisico(2, 0);
      const boton = [0, 1, 2, 3, 4, 5].find((b) => anguloFisico(b, giro) === primera)!;
      expect(boton).not.toBe(2);
      expect(abanicoConsistente(primera, anguloFisico(boton, giro))).toBe(true);
    },
  );

  it('«todas iguales» en cualquier vuelta no es consistente', () => {
    expect(abanicoConsistente(null, 30)).toBe(false);
    expect(abanicoConsistente(30, null)).toBe(false);
    expect(abanicoConsistente(null, null)).toBe(false);
  });
});

describe('umbral y estenopeico', () => {
  it('menor que 6/60 va antes que 6/60', () => {
    expect(indiceAgudeza(null)).toBe(-1);
    expect(indiceAgudeza(nivelPorNombre('6/60'))).toBe(0);
    expect(nombreAgudeza(null)).toBe('<6/60');
  });

  it('«mejora» = gana al menos un nivel', () => {
    expect(mejoraConEstenopeico(null, nivelPorNombre('6/60'))).toBe(true);
    expect(mejoraConEstenopeico(nivelPorNombre('6/24'), nivelPorNombre('6/18'))).toBe(true);
    expect(mejoraConEstenopeico(nivelPorNombre('6/24'), nivelPorNombre('6/24'))).toBe(false);
    expect(mejoraConEstenopeico(nivelPorNombre('6/24'), nivelPorNombre('6/36'))).toBe(false);
  });
});

describe('números de la carta de abanico', () => {
  const horas = Array.from({ length: 12 }, (_, i) => i + 1);

  it('hay seis números (1 a 6) y cada línea lleva el mismo número en sus dos extremos', () => {
    expect(new Set(horas.map(etiquetaRayo))).toEqual(new Set([1, 2, 3, 4, 5, 6]));
    for (let h = 1; h <= 6; h++) expect(etiquetaRayo(h)).toBe(etiquetaRayo(h + 6));
  });

  it('los seis botones se llaman 1 a 6', () => {
    expect([...BOTONES_ABANICO]).toEqual(['1', '2', '3', '4', '5', '6']);
  });

  it('el botón con el número de un rayo es la línea en la que está ese rayo, con cualquier giro', () => {
    for (const giro of [0, 60, 90, 120]) {
      for (const h of horas) {
        const anguloRayo = (((90 - 30 * h + giro) % 180) + 180) % 180;
        expect(anguloFisico(etiquetaRayo(h) - 1, giro)).toBe(anguloRayo);
      }
    }
  });
});
