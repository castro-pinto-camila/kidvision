import { describe, expect, it } from 'vitest';
import { DIRECCIONES } from './orientaciones';
import { GIROS_ABANICO, secuenciaBase, secuenciaLinea, versionPorEvaluaciones } from './secuencias';

const claves = ['lejos|OD|R0|6/9|1', 'lejos|OI|R0|6/9|1', 'clip|OD|R0|6/9|1', 'remoto|OD|R1|6/12|1', 'cerca|OD|cerca|6/9|1'];

describe('secuencias fijas de «E»', () => {
  it('son siempre las mismas para la misma línea', () => {
    for (const c of claves) {
      expect(secuenciaBase('A', c)).toEqual(secuenciaBase('A', c));
    }
  });

  it('valores fijados: si cambian, cambia lo que ve el niño y hay que regenerar la guía', () => {
    expect(secuenciaBase('A', 'lejos|OD|R0|6/9|1')).toMatchInlineSnapshot(`
      [
        "abajo",
        "derecha",
        "abajo",
        "izquierda",
        "arriba",
      ]
    `);
    expect(secuenciaBase('B', 'lejos|OD|R0|6/9|1')).toMatchInlineSnapshot(`
      [
        "arriba",
        "derecha",
        "arriba",
        "abajo",
        "izquierda",
      ]
    `);
  });

  it('dos «E» seguidas nunca son iguales y salen las cuatro orientaciones', () => {
    for (const version of ['A', 'B'] as const) {
      for (let n = 1; n <= 200; n++) {
        const s = secuenciaBase(version, `remoto|OD|R${n % 10}|6/12|${n}`);
        expect(s).toHaveLength(5);
        for (let i = 1; i < s.length; i++) expect(s[i]).not.toBe(s[i - 1]);
        for (const d of DIRECCIONES) expect(s).toContain(d);
      }
    }
  });

  it('cada línea de la prueba tiene una secuencia distinta (ojo derecho, ojo izquierdo, con la tapa, de cerca…)', () => {
    const vistas = new Set(claves.map((c) => secuenciaBase('A', c).join()));
    expect(vistas.size).toBe(claves.length);
  });

  it('repetir la misma línea (segunda vez) da otra secuencia', () => {
    expect(secuenciaBase('A', 'remoto|OD|R2|6/12|2')).not.toEqual(secuenciaBase('A', 'remoto|OD|R2|6/12|1'));
  });

  it('el juego B es distinto del A en todas las líneas', () => {
    for (const c of claves) expect(secuenciaBase('B', c)).not.toEqual(secuenciaBase('A', c));
  });

  it('la primera «E» nunca repite la última de la línea anterior, y sigue siendo fija', () => {
    for (const anterior of DIRECCIONES) {
      for (const c of claves) {
        const s = secuenciaLinea('A', c, anterior);
        expect(s[0]).not.toBe(anterior);
        expect(s).toEqual(secuenciaLinea('A', c, anterior));
        for (let i = 1; i < s.length; i++) expect(s[i]).not.toBe(s[i - 1]);
        for (const d of DIRECCIONES) expect(s).toContain(d);
      }
    }
  });
});

describe('juego A o B según las evaluaciones del niño', () => {
  it('la primera evaluación usa A, la segunda B, la tercera A…', () => {
    expect([0, 1, 2, 3].map(versionPorEvaluaciones)).toEqual(['A', 'B', 'A', 'B']);
  });
});

describe('giro fijo del abanico', () => {
  it('es uno de 60°, 90° o 120°, distinto para cada ojo y distinto en A y en B', () => {
    for (const v of ['A', 'B'] as const) {
      expect([60, 90, 120]).toContain(GIROS_ABANICO[v].OD);
      expect([60, 90, 120]).toContain(GIROS_ABANICO[v].OI);
      expect(GIROS_ABANICO[v].OD).not.toBe(GIROS_ABANICO[v].OI);
    }
    expect(GIROS_ABANICO.A.OD).not.toBe(GIROS_ABANICO.B.OD);
  });
});
