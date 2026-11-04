import { describe, expect, it } from 'vitest';
import { CAJA_POR_DEFECTO } from '../core/caja';
import {
  agudezaEnPalabras,
  desenfoqueSimulado,
  enlaceWhatsapp,
  mensajeWhatsapp,
  NO_COMPRE_LENTES,
  NO_REEMPLAZA_EXAMEN,
  textoFamilia,
  textoProfesional,
} from './constancia';
import { PruebaVisual, type ResultadoSesion } from './flujo';
import { azarConSemilla, responderComo, type Nino, type OjoSimulado } from './ninoSimulado';
import { resumirSalon } from './resumen';

function sesion(nino: Nino): ResultadoSesion {
  const p = new PruebaVisual({
    caja: CAJA_POR_DEFECTO,
    pantalla: { pxPorMm: 1 / 0.06, dpr: 1 },
    azar: azarConSemilla(9),
    ahora: () => Date.UTC(2026, 10, 5, 15),
  });
  while (p.paso.tipo !== 'fin') p.responder(responderComo(nino, p.paso));
  return p.paso.resultado;
}
const ambos = (o: OjoSimulado): Nino => ({ OD: o, OI: o });

const MIOPE = sesion(ambos({ refraccion: -2, borrosa: 24 }));
const NORMAL = sesion(ambos({ refraccion: 0 }));
const DUDOSO = sesion({ OD: { refraccion: 0, respondeSiempre: 'arriba' }, OI: { refraccion: 0 } });

/** Palabras que no deben aparecer en la parte de la familia. */
const PROHIBIDAS = /miop|hipermet|astigm|dioptr|\bD\b|−\d|-\d,|categor|oftalmolog[ií]a\)/i;

describe('parte para la familia', () => {
  it('derivar: lo dice claro y avisa que no compre lentes', () => {
    const f = textoFamilia(MIOPE);
    expect(f.titulo).toBe('Su hijo necesita un examen de la vista');
    expect(f.avisos).toEqual([NO_COMPRE_LENTES]);
    expect(f.ojos.OD).toBe('De lejos ve con dificultad.');
  });

  it('no derivar: agrega que el tamizaje no reemplaza un examen', () => {
    const f = textoFamilia(NORMAL);
    expect(f.titulo).toBe('Su hijo no necesita derivación por ahora');
    expect(f.ojos.OD).toBe('Ve bien de lejos.');
    expect(f.avisos).toEqual([NO_COMPRE_LENTES, NO_REEMPLAZA_EXAMEN]);
  });

  it('repetir: no asusta a la familia', () => {
    expect(textoFamilia(DUDOSO).titulo).toBe('Vamos a repetir la prueba');
  });

  it('nunca muestra dioptrías ni categoría', () => {
    for (const s of [MIOPE, NORMAL, DUDOSO]) {
      const f = textoFamilia(s);
      const todo = [f.titulo, f.resumen, f.ojos.OD, f.ojos.OI, ...f.avisos].join(' ');
      expect(todo).not.toMatch(PROHIBIDAS);
    }
  });

  it('la agudeza en palabras cubre todos los niveles', () => {
    const ojo = MIOPE.ojos.OD;
    expect(agudezaEnPalabras({ ...ojo, umbral: '6/12' })).toMatch(/un poco menos/);
    expect(agudezaEnPalabras({ ...ojo, umbral: '6/36' })).toMatch(/mucha dificultad\.$/);
    expect(agudezaEnPalabras({ ...ojo, umbral: '<6/60' })).toMatch(/letras muy grandes/);
    expect(agudezaEnPalabras({ ...NORMAL.ojos.OD, pasaCerca: false })).toBe(
      'Ve bien de lejos. De cerca también le cuesta ver.',
    );
  });
});

describe('parte para el profesional de salud', () => {
  it('trae la categoría probable y la miopía estimada', () => {
    const p = textoProfesional(MIOPE);
    expect(p.OD).toContain('Agudeza lejana: 6/24');
    expect(p.OD).toContain('Punto remoto: R4');
    expect(p.OD).toContain('Miopía estimada: −1,94 D');
    expect(p.OD).toContain('Categoría probable: Miopía probable');
  });

  it('en un niño normal dice que con +2.00 deja de leer', () => {
    expect(textoProfesional(NORMAL).OD).toContain('Con +2.00 D: deja de leerla');
  });
});

describe('WhatsApp', () => {
  it('el mensaje lleva solo la parte de la familia', () => {
    const m = mensajeWhatsapp(MIOPE, '3B-07', 'IE 123');
    expect(m).toContain('IE 123');
    expect(m).toContain('Código 3B-07');
    expect(m).toContain('05/11/2026');
    expect(m).toContain(NO_COMPRE_LENTES);
    expect(m).not.toMatch(PROHIBIDAS);
  });

  it('el enlace no lleva número de teléfono', () => {
    expect(enlaceWhatsapp('Hola, mundo')).toBe('https://wa.me/?text=Hola%2C%20mundo');
  });
});

describe('simulación aproximada', () => {
  it('sin desenfoque si los dos ojos ven bien de lejos', () => {
    expect(desenfoqueSimulado(NORMAL)).toBe(0);
  });

  it('más desenfoque cuanto peor ve (toma el peor ojo) y con un tope', () => {
    const con = (umbral: string) =>
      desenfoqueSimulado({ ...MIOPE, ojos: { OD: { ...MIOPE.ojos.OD, umbral }, OI: NORMAL.ojos.OI } });
    expect(con('6/12')).toBeLessThan(con('6/24'));
    expect(con('6/24')).toBeLessThan(con('6/60'));
    expect(con('<6/60')).toBeLessThanOrEqual(1.2);
  });
});

describe('resumen del salón', () => {
  it('cuenta por color y arma las listas', () => {
    const r = resumirSalon([
      { codigo: 'A', sesion: MIOPE },
      { codigo: 'B', sesion: NORMAL },
      { codigo: 'C', sesion: DUDOSO },
      { codigo: 'D', sesion: null },
    ]);
    expect(r).toEqual({
      total: 4,
      evaluados: 3,
      porColor: { VERDE: 1, AMARILLO: 1, ROJO: 1 },
      derivar: ['A'],
      repetir: ['C'],
      pendientes: ['D'],
    });
  });
});
