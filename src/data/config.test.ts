import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { abrirDB } from './db';
import {
  completar,
  configuracionPorDefecto,
  estadoCalibracion,
  guardarConfiguracion,
  leerConfiguracion,
} from './config';

let n = 0;
const dbNueva = () => abrirDB(`prueba-${++n}`);

describe('configuración', () => {
  it('sin nada guardado devuelve los valores por defecto (sin calibrar)', async () => {
    const config = await leerConfiguracion(await dbNueva());
    expect(config.pxPorMm).toBeNull();
    expect(config.caja.P).toBe(3);
    expect(config.caja.ranuras_mm).toHaveLength(11);
    expect(config.umbralCorte).toBe('6/9');
    expect(config.franja).toEqual({ lado: 'arriba', ancho_mm: 15 });
  });

  it('guarda y vuelve a leer la calibración y la caja', async () => {
    const db = await dbNueva();
    const config = configuracionPorDefecto();
    config.pxPorMm = 6.42;
    config.caja.ranuras_mm[4] = 201.5;
    config.franja.lado = 'abajo';
    await guardarConfiguracion(db, config);
    expect(await leerConfiguracion(db)).toEqual(config);
  });

  it('los valores por defecto no se comparten entre configuraciones', () => {
    const a = configuracionPorDefecto();
    a.caja.ranuras_mm[0] = 1;
    expect(configuracionPorDefecto().caja.ranuras_mm[0]).toBeCloseTo(333.33, 2);
  });

  it('completa campos que falten en una configuración vieja', () => {
    const vieja = { pxPorMm: 6 } as Parameters<typeof completar>[0];
    expect(completar(vieja).franja.ancho_mm).toBe(15);
    expect(completar(vieja).pxPorMm).toBe(6);
  });
});

describe('estado de la calibración', () => {
  it('sin calibrar', () => {
    expect(estadoCalibracion(configuracionPorDefecto(), 2)).toBe('sin-calibrar');
  });

  it('vigente si el devicePixelRatio es el mismo que al calibrar', () => {
    const c = { ...configuracionPorDefecto(), pxPorMm: 6.3, dprCalibracion: 2.625 };
    expect(estadoCalibracion(c, 2.625)).toBe('vigente');
  });

  it('pide recalibrar si cambió el zoom o el tamaño de letra del celular', () => {
    const c = { ...configuracionPorDefecto(), pxPorMm: 6.3, dprCalibracion: 2.625 };
    expect(estadoCalibracion(c, 2.25)).toBe('cambio-zoom');
  });

  it('una calibración vieja sin devicePixelRatio guardado se acepta', () => {
    const c = { ...configuracionPorDefecto(), pxPorMm: 6.3 };
    expect(estadoCalibracion(c, 3)).toBe('vigente');
  });
});

describe('calibración con la huella de la pantalla', () => {
  const huella = { ancho: 360, alto: 800, dpr: 3, zoom: 1 };
  const calibrada = { ...configuracionPorDefecto(), pxPorMm: 6.3, dprCalibracion: 3, huella };

  it('vigente si todo sigue igual, también con el celular girado', () => {
    expect(estadoCalibracion(calibrada, 3, huella)).toBe('vigente');
    expect(estadoCalibracion(calibrada, 3, { ...huella, ancho: 800, alto: 360 })).toBe('vigente');
  });

  it('pide recalibrar si hay zoom con los dedos', () => {
    expect(estadoCalibracion(calibrada, 3, { ...huella, zoom: 1.5 })).toBe('cambio-zoom');
  });

  it('pide recalibrar si cambió el tamaño de la pantalla (otro celular o ajuste de pantalla)', () => {
    expect(estadoCalibracion(calibrada, 3, { ...huella, ancho: 412, alto: 915 })).toBe('cambio-pantalla');
  });

  it('una calibración vieja, sin huella, sigue valiendo si el dpr no cambió', () => {
    expect(estadoCalibracion({ ...calibrada, huella: null }, 3, huella)).toBe('vigente');
  });

  it('la huella se guarda y se lee', async () => {
    const db = await dbNueva();
    await guardarConfiguracion(db, calibrada);
    expect((await leerConfiguracion(db)).huella).toEqual(huella);
  });
});
