import { describe, expect, it } from 'vitest';
import { CAJA_POR_DEFECTO } from '../core/caja';
import type { Pantalla } from '../core/optotipos';
import { PruebaVisual, type ResultadoSesion } from './flujo';
import { responderComo, type Nino } from './ninoSimulado';
import type { VersionLineas } from './secuencias';

const PANTALLA: Pantalla = { pxPorMm: 1 / 0.06, dpr: 1 };
const normal: Nino = { OD: { refraccion: 0 }, OI: { refraccion: 0 } };
const miope: Nino = { OD: { refraccion: -2 }, OI: { refraccion: -2 } };

function correr(nino: Nino, version: VersionLineas = 'A'): ResultadoSesion {
  const prueba = new PruebaVisual({ caja: CAJA_POR_DEFECTO, pantalla: PANTALLA, version });
  let n = 0;
  while (prueba.paso.tipo !== 'fin') {
    prueba.responder(responderComo(nino, prueba.paso));
    if (++n > 500) throw new Error('La prueba no termina');
  }
  return prueba.paso.resultado;
}

const lineas = (r: ResultadoSesion) => [...r.ojos.OD.registro, ...r.ojos.OI.registro].map((l) => l.mostradas);

describe('la prueba real muestra siempre las mismas «E»', () => {
  it('dos pruebas iguales muestran exactamente las mismas flechas', () => {
    expect(lineas(correr(normal))).toEqual(lineas(correr(normal)));
    expect(lineas(correr(miope))).toEqual(lineas(correr(miope)));
  });

  it('con el juego B las flechas son otras', () => {
    expect(lineas(correr(normal, 'B'))).not.toEqual(lineas(correr(normal, 'A')));
  });

  it('el ojo derecho y el izquierdo no leen la misma línea (no se la aprenden)', () => {
    const r = correr(normal);
    const od = r.ojos.OD.registro.find((l) => l.prueba === 'lejos')!;
    const oi = r.ojos.OI.registro.find((l) => l.prueba === 'lejos')!;
    expect(od.nivel).toBe(oi.nivel);
    expect(od.mostradas).not.toEqual(oi.mostradas);
    const clipOd = r.ojos.OD.registro.find((l) => l.prueba === 'clip')!;
    expect(clipOd.mostradas).not.toEqual(od.mostradas);
  });

  it('en una línea nunca hay dos «E» seguidas iguales y las cuatro orientaciones aparecen', () => {
    for (const r of [correr(normal), correr(miope)]) {
      for (const l of lineas(r)) {
        for (let i = 1; i < l.length; i++) expect(l[i]).not.toBe(l[i - 1]);
        expect(new Set(l).size).toBe(4);
      }
    }
  });

  it('el abanico gira siempre lo mismo: 90° el ojo derecho y 120° el izquierdo con el juego A', () => {
    const prueba = new PruebaVisual({ caja: CAJA_POR_DEFECTO, pantalla: PANTALLA });
    const giros: Record<string, number> = {};
    while (prueba.paso.tipo !== 'fin') {
      const p = prueba.paso;
      if (p.tipo === 'abanico' && p.vuelta === 2) giros[p.ojo] = p.rotacion;
      prueba.responder(responderComo(normal, p));
    }
    expect(giros).toEqual({ OD: 90, OI: 120 });
  });
});
