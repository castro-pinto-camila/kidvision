import { describe, expect, it } from 'vitest';
import guiaArchivo from '../../docs/guia-resultados.md?raw';
import { correrEscenario, ESCENARIOS, guiaMarkdown } from './escenarios';

describe('guía de resultados: la app da lo que dicen las reglas del SPEC', () => {
  for (const e of ESCENARIOS) {
    it(e.titulo, () => {
      const { resultado } = correrEscenario(e);
      expect(resultado.semaforo).toBe(e.esperado.semaforo);
      expect(resultado.indicacion).toBe(e.esperado.indicacion);
      for (const ojo of ['OD', 'OI'] as const) {
        const real = resultado.ojos[ojo];
        const esp = e.esperado.ojos[ojo];
        expect(real.semaforo, `${ojo} semáforo`).toBe(esp.semaforo);
        expect(real.categorias, `${ojo} categorías`).toEqual(esp.categorias);
        expect(real.puntoRemoto, `${ojo} punto remoto`).toBe(esp.puntoRemoto);
        expect(real.posibleAstigmatismo, `${ojo} posible astigmatismo`).toBe(esp.posibleAstigmatismo ?? false);
      }
    });
  }

  it('los escenarios tienen identificadores distintos', () => {
    expect(new Set(ESCENARIOS.map((e) => e.id)).size).toBe(ESCENARIOS.length);
  });

  it('docs/guia-resultados.md está al día (si falla, corre npm run guia)', () => {
    const archivo = guiaArchivo.replace(/\r\n/g, '\n');
    expect(archivo).toBe(guiaMarkdown());
  });
});
