import { describe, expect, it } from 'vitest';
import {
  barrasApinamiento,
  cabe,
  centrosLetras,
  disponer,
  medidasLinea,
  type Franja,
} from './disposicion';

// Pantalla de 150 × 70 mm a 6 px CSS por mm.
const PX = 6;
const VISTA = { ancho: 150 * PX, alto: 70 * PX };
const ARRIBA: Franja = { lado: 'arriba', ancho_mm: 15 };

describe('medidas de la línea', () => {
  it('cinco letras, cuatro espacios de una letra y barras a una letra de distancia', () => {
    // 5h + 4h + 2·(h + h/5) = 11,4h; alto h + 2·(h + h/5) = 3,4h
    expect(medidasLinea(10).ancho).toBeCloseTo(114, 9);
    expect(medidasLinea(10).alto).toBeCloseTo(34, 9);
  });

  it('las letras están separadas un ancho de letra', () => {
    const c = centrosLetras({ x: 100, y: 50 }, 10);
    expect(c.map((p) => p.x)).toEqual([60, 80, 100, 120, 140]);
  });

  it('las barras rodean la línea con grosor de un trazo', () => {
    const [arriba, abajo, izq, der] = barrasApinamiento({ x: 0, y: 0 }, 10);
    expect(arriba).toEqual({ x: -57, y: -17, ancho: 114, alto: 2 });
    expect(abajo.y + abajo.alto).toBeCloseTo(17, 9);
    expect(izq.ancho).toBe(2);
    expect(der.x + der.ancho).toBeCloseTo(57, 9);
  });
});

describe('disposición dentro de la caja', () => {
  it('ojo derecho: mitad derecha visible, izquierda en negro, centro a 31 mm a la derecha', () => {
    const d = disponer(VISTA, PX, 'OD', 31, ARRIBA);
    expect(d.negro).toEqual({ x: 0, y: 0, ancho: 75 * PX, alto: 70 * PX });
    expect(d.zona).toEqual({ x: 75 * PX, y: 15 * PX, ancho: 75 * PX, alto: 55 * PX });
    expect(d.centro).toEqual({ x: (75 + 31) * PX, y: 35 * PX });
    expect(d.franja).toEqual({ x: 0, y: 0, ancho: 150 * PX, alto: 15 * PX });
  });

  it('ojo izquierdo: lo contrario', () => {
    const d = disponer(VISTA, PX, 'OI', 31, ARRIBA);
    expect(d.negro!.x).toBe(75 * PX);
    expect(d.zona.x).toBe(0);
    expect(d.centro.x).toBe((75 - 31) * PX);
  });

  it('franja a la derecha: le quita espacio solo al ojo derecho', () => {
    const franja: Franja = { lado: 'derecha', ancho_mm: 15 };
    expect(disponer(VISTA, PX, 'OD', 31, franja).zona.ancho).toBe(60 * PX);
    expect(disponer(VISTA, PX, 'OI', 31, franja).zona.ancho).toBe(75 * PX);
  });

  it('prueba de cerca: sin negro y centrada en la pantalla libre', () => {
    const d = disponer(VISTA, PX, null, 31, ARRIBA);
    expect(d.negro).toBeNull();
    expect(d.centro).toEqual({ x: 75 * PX, y: (15 + 27.5) * PX });
  });
});

describe('¿cabe la línea en la mitad del ojo?', () => {
  const d = disponer(VISTA, PX, 'OD', 31, ARRIBA);

  it('el 6/60 en R0 (4,85 mm → 55,3 mm de ancho) cabe: el límite es 2 × 31 mm', () => {
    expect(cabe(medidasLinea(4.85 * PX), d.centro, d.zona)).toBe(true);
  });

  it('una línea de 63 mm ya no cabe: cruzaría el centro de la pantalla', () => {
    expect(cabe({ ancho: 63 * PX, alto: 10 * PX }, d.centro, d.zona)).toBe(false);
  });

  it('el alto también cuenta (la franja de arriba le quita espacio)', () => {
    // Centro a 35 mm del borde superior; la franja llega a 15 mm → caben 40 mm de alto.
    expect(cabe({ ancho: 10 * PX, alto: 40 * PX }, d.centro, d.zona)).toBe(true);
    expect(cabe({ ancho: 10 * PX, alto: 41 * PX }, d.centro, d.zona)).toBe(false);
  });
});
