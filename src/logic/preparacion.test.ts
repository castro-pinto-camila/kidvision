import { describe, expect, it } from 'vitest';
import { configuracionPorDefecto, type Configuracion } from '../data/config';
import { estadoPreparacion, primerPendiente, puedeEmpezar } from './preparacion';

function config(cambios: Partial<Configuracion> = {}): Configuracion {
  return { ...configuracionPorDefecto(), ...cambios };
}
const CALIBRADA = { pxPorMm: 6.3, dprCalibracion: 3 };

describe('qué falta para evaluar', () => {
  it('al empezar falta todo y no se puede evaluar ni practicar', () => {
    const p = estadoPreparacion(config(), 3);
    expect(p.pasos.map((x) => x.listo)).toEqual([false, false, false]);
    expect(p.listoParaEvaluar).toBe(false);
    expect(p.listoParaPracticar).toBe(false);
    expect(p.pasos[0].accion).toBe('colegio');
    expect(p.pasos[1].accion).toBe('calibrar');
    expect(p.pasos[2].boton).toBeNull();
  });

  it('con colegio y pantalla calibrada, listo para evaluar', () => {
    const p = estadoPreparacion(config({ colegio: 'IE 1234', salon: '3B', ...CALIBRADA }), 3);
    expect(p.pasos.every((x) => x.listo)).toBe(true);
    expect(p.listoParaEvaluar).toBe(true);
    expect(primerPendiente(p)).toBeNull();
  });

  it('un colegio solo con espacios cuenta como vacío', () => {
    expect(estadoPreparacion(config({ colegio: '   ', ...CALIBRADA }), 3).pasos[0].listo).toBe(false);
  });

  it('sin colegio se puede practicar, pero no evaluar', () => {
    const p = estadoPreparacion(config(CALIBRADA), 3);
    expect(p.listoParaPracticar).toBe(true);
    expect(p.listoParaEvaluar).toBe(false);
    expect(primerPendiente(p)?.id).toBe('colegio');
    expect(primerPendiente(p, true)).toBeNull();
  });

  it('si cambió el zoom hay que volver a calibrar', () => {
    const p = estadoPreparacion(config({ colegio: 'IE', salon: '3B', ...CALIBRADA }), 4);
    expect(p.pasos[1].listo).toBe(false);
    expect(p.pasos[1].boton).toBe('Volver a calibrar');
    expect(p.listoParaEvaluar).toBe(false);
  });

  it('una calibración errada se muestra como un solo paso pendiente, sin decir «calibrada»', () => {
    const p = estadoPreparacion(config({ colegio: 'IE', salon: '3B', pxPorMm: 1, dprCalibracion: 1 }), 1);
    expect(p.pasos[1].listo).toBe(false);
    expect(p.pasos[1].texto).not.toContain('Pantalla calibrada');
    expect(p.pasos[1].texto).toContain('error al calibrar');
    expect(p.pasos[1].accion).toBe('calibrar');
    expect(p.pasos[2].listo).toBe(false);
    expect(p.pasos[2].boton).toBeNull();
    expect(p.listoParaPracticar).toBe(false);
    expect(primerPendiente(p)?.id).toBe('calibracion');
  });
});

describe('antes de cada evaluación se vuelve a comprobar la pantalla', () => {
  const huella = { ancho: 360, alto: 800, dpr: 3, zoom: 1 };
  const lista = config({ colegio: 'IE', salon: '3B', ...CALIBRADA, huella });

  it('con todo igual, se puede empezar', () => {
    expect(puedeEmpezar(estadoPreparacion(lista, 3, huella), false)).toBe(true);
  });

  it('con zoom de dedos después de calibrar, no se puede empezar ni practicar', () => {
    const prep = estadoPreparacion(lista, 3, { ...huella, zoom: 1.4 });
    expect(puedeEmpezar(prep, false)).toBe(false);
    expect(puedeEmpezar(prep, true)).toBe(false);
    expect(prep.pasos[1].boton).toBe('Volver a calibrar');
  });

  it('si cambió la pantalla (otro lugar o ajuste de pantalla), pide calibrar de nuevo', () => {
    const prep = estadoPreparacion(lista, 3, { ...huella, ancho: 412, alto: 915 });
    expect(puedeEmpezar(prep, false)).toBe(false);
    expect(prep.pasos[1].texto).toContain('cambió la pantalla');
  });

  it('sin colegio se puede practicar pero no evaluar', () => {
    const prep = estadoPreparacion({ ...lista, colegio: '' }, 3, huella);
    expect(puedeEmpezar(prep, true)).toBe(true);
    expect(puedeEmpezar(prep, false)).toBe(false);
  });
});

describe('colegio y salón', () => {
  const base = config({ ...CALIBRADA });

  it('hacen falta los dos: sin salón no se puede evaluar, y el botón pide el salón', () => {
    const p = estadoPreparacion({ ...base, colegio: 'IE 1234', salon: '' }, 3);
    expect(p.pasos[0].listo).toBe(false);
    expect(p.pasos[0].texto).toContain('Falta el salón');
    expect(p.pasos[0].boton).toBe('Escribir el salón');
    expect(p.listoParaEvaluar).toBe(false);
    expect(p.listoParaPracticar).toBe(true);
  });

  it('sin colegio y sin salón pide los dos', () => {
    const p = estadoPreparacion({ ...base, colegio: '', salon: '' }, 3);
    expect(p.pasos[0].texto).toContain('colegio y el salón');
    expect(p.pasos[0].boton).toBe('Escribir el colegio y el salón');
  });

  it('con los dos, queda listo y los muestra', () => {
    const p = estadoPreparacion({ ...base, colegio: 'IE 1234', salon: '3B' }, 3);
    expect(p.pasos[0].listo).toBe(true);
    expect(p.pasos[0].texto).toBe('Colegio: IE 1234 · Salón: 3B');
  });

  it('una configuración guardada antes de existir el salón (sin ese dato) pide el salón', () => {
    const vieja = { ...base, colegio: 'IE 1234' } as Parameters<typeof estadoPreparacion>[0];
    delete (vieja as { salon?: string }).salon;
    expect(estadoPreparacion(vieja, 3).pasos[0].listo).toBe(false);
  });
});
