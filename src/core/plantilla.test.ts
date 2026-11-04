import { describe, expect, it } from 'vitest';
import { CAJA_POR_DEFECTO, crearCaja } from './caja';
import {
  agujerosPasador,
  altoSeparador,
  anchoTapa,
  geometriaTecho,
  medidasTapa,
  dimensiones,
  espacioCelular,
  generarPlantilla,
  hojaArmadoHtml,
  hojasA4,
  marcasRegla,
  MEDIDAS_POR_DEFECTO as M,
  plantillaHtml,
  plantillaSvg,
} from './plantilla';

describe('agujeros del pasador', () => {
  const agujeros = agujerosPasador(CAJA_POR_DEFECTO);

  it('hay uno por ranura, de R0 a R10', () => {
    expect(agujeros.map((a) => a.ranura)).toEqual([
      'R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10',
    ]);
  });

  it('cada agujero está a d + 12 mm del plano de los lentes (el tope queda en d)', () => {
    agujeros.forEach((a, i) => {
      expect(a.x).toBeCloseTo(CAJA_POR_DEFECTO.ranuras_mm[i] + M.pasadorDesdeTope, 9);
    });
    expect(agujeros[0].x).toBeCloseTo(345.3, 1);
    expect(agujeros[10].x).toBeCloseTo(137.0, 1);
  });

  it('van en dos filas alternadas: pares arriba e impares abajo', () => {
    expect(agujeros.filter((_, i) => i % 2 === 0).every((a) => a.z === M.filaPares)).toBe(true);
    expect(agujeros.filter((_, i) => i % 2 === 1).every((a) => a.z === M.filaImpares)).toBe(true);
  });

  it('en cada fila queda cartón entre agujeros (al menos dos diámetros)', () => {
    for (const fila of [M.filaPares, M.filaImpares]) {
      const xs = agujeros.filter((a) => a.z === fila).map((a) => a.x).sort((p, q) => p - q);
      for (let i = 1; i < xs.length; i++) {
        expect(xs[i] - xs[i - 1] - M.diametroPasador).toBeGreaterThanOrEqual(2 * M.diametroPasador);
      }
    }
  });

  it('las dos filas no se tocan', () => {
    expect(M.filaPares - M.filaImpares).toBeGreaterThan(2 * M.diametroPasador);
  });
});

describe('regla de la canaleta', () => {
  it('cada marca está en d: ahí va la muesca de la bandeja (el plano del tope)', () => {
    expect(marcasRegla(CAJA_POR_DEFECTO).map((r) => Math.round(r.x * 10) / 10)).toEqual([
      333.3, 285.7, 250, 222.2, 200, 181.8, 166.7, 153.8, 142.9, 133.3, 125,
    ]);
  });

  it('sigue la configuración: con otra caja, otras marcas', () => {
    const caja = crearCaja(2);
    expect(marcasRegla(caja)[0].x).toBeCloseTo(500, 6);
    expect(agujerosPasador(caja)[0].x).toBeCloseTo(512, 6);
  });
});

describe('medidas de la caja', () => {
  const d = dimensiones(CAJA_POR_DEFECTO);

  it('el apoyo para la cara deja su cara a e = 15 mm del plano de los lentes', () => {
    // medio panel de lentes + separador + espesor del apoyo = e
    expect(M.carton / 2 + d.separador + M.carton).toBeCloseTo(CAJA_POR_DEFECTO.e_mm, 9);
  });

  it('cabe un celular de 6,8" (≈ 164 mm) con esponja dentro de la bandeja', () => {
    expect(espacioCelular()).toBeGreaterThanOrEqual(164 + 2 * 3);
  });

  it('la bandeja en R0 cabe antes del panel trasero', () => {
    const finBandejaEnR0 = CAJA_POR_DEFECTO.ranuras_mm[0] + M.fondoBandeja;
    expect(d.largoParedes - M.margenDelantero - M.carton).toBeGreaterThan(finBandejaEnR0);
  });

  it('medidas exteriores con la configuración por defecto', () => {
    expect(Math.round(d.largoTotal)).toBe(380);
    expect(d.anchoTotal).toBe(184);
    expect(d.altoTotal).toBe(62);
  });
});

describe('archivos para imprimir', () => {
  const p = generarPlantilla(CAJA_POR_DEFECTO);

  it('tiene todas las piezas', () => {
    expect(p.piezas.map((x) => x.nombre)).toEqual([
      'Pared derecha · agujeros del pasador',
      'Pared izquierda · regla de la muesca (cara interior)',
      'Regla para la canaleta',
      'Piso',
      'Panel de lentes (+3.00)',
      'Tapa +2.00',
      'Apoyo para la cara',
      'Panel trasero',
      'Techo delantero',
      'Separador 1',
      'Separador 2',
      'Bandeja',
    ]);
  });

  it('las piezas no se pisan en la hoja', () => {
    const cajas = p.piezas.map((x) => ({ x0: x.x, y0: x.y, x1: x.x + x.ancho, y1: x.y + x.alto }));
    for (let i = 0; i < cajas.length; i++) {
      for (let j = i + 1; j < cajas.length; j++) {
        const a = cajas[i];
        const b = cajas[j];
        const separadas = a.x1 <= b.x0 || b.x1 <= a.x0 || a.y1 <= b.y0 || b.y1 <= a.y0;
        expect(separadas, `${p.piezas[i].nombre} / ${p.piezas[j].nombre}`).toBe(true);
      }
    }
  });

  it('la hoja grande mide en milímetros y trae el aviso y la regla de 10 cm', () => {
    const svg = plantillaSvg(p);
    expect(svg).toMatch(/width="[\d.]+mm"/);
    expect(svg).toContain('Imprimir sin ajustar a página');
    expect(svg).toContain('Debe medir 10 cm exactos');
  });

  it('las hojas A4 cubren toda la plantilla y cada una trae el aviso y la regla', () => {
    const hojas = hojasA4(p);
    expect(hojas.length).toBeGreaterThan(1);
    for (const h of hojas) {
      expect(h.svg).toContain('width="297mm"');
      expect(h.svg).toContain('Imprimir sin ajustar a página');
      expect(h.svg).toContain('Debe medir 10 cm exactos');
    }
    const ultima = hojas.at(-1)!;
    // Ventana útil 277 × 172 mm con 10 mm de solape: la última hoja llega al borde de la plantilla.
    expect(ultima.columna * 267 + 10).toBeGreaterThanOrEqual(p.ancho);
    expect(ultima.fila * 162 + 10).toBeGreaterThanOrEqual(p.alto);
  });

  it('la página HTML dice las medidas totales', () => {
    expect(plantillaHtml(p, 'Caja KidVision')).toContain('380,3 × 184,0 × 62,0 mm');
  });
});

describe('hoja de armado', () => {
  const p = generarPlantilla(CAJA_POR_DEFECTO);
  const html = plantillaHtml(p, 'Caja KidVision');
  const armado = hojaArmadoHtml(p);

  it('va justo después de la portada y antes de las hojas de piezas', () => {
    const portada = html.indexOf('class="portada hoja"');
    const hoja = html.indexOf('Cómo armar la caja');
    const primeraPieza = html.indexOf('Hoja 1 de');
    expect(portada).toBeGreaterThan(-1);
    expect(hoja).toBeGreaterThan(portada);
    expect(primeraPieza).toBeGreaterThan(hoja);
  });

  it('explica para qué sirve cada pieza de la plantilla, incluidos S1 y S2', () => {
    for (const nombre of [
      'Piso',
      'Pared derecha',
      'Pared izquierda',
      'Regla para la canaleta',
      'Panel de lentes (+3.00)',
      'Tapa +2.00',
      'Apoyo para la cara',
      'S1 y S2 (separadores)',
      'Panel trasero',
      'Techo delantero',
      'Bandeja',
    ]) {
      expect(armado).toContain(`<th>${nombre}</th>`);
    }
    expect(armado).toContain('Dos tacos de 10,5 mm');
  });

  it('tiene los pasos numerados en orden de pegado y explica el pasador', () => {
    const pasos = armado.match(/<li>/g) ?? [];
    expect(pasos.length).toBeGreaterThanOrEqual(10);
    const orden = ['Paredes al piso', 'Panel de lentes.', 'S1, S2 y apoyo', 'Techo delantero.', 'Mete la bandeja', 'Usa el pasador'];
    const posiciones = orden.map((t) => armado.indexOf(t));
    expect(posiciones.every((x) => x > -1)).toBe(true);
    expect([...posiciones].sort((a, b) => a - b)).toEqual(posiciones);
    expect(armado).toContain('Pon el pasador en R4');
    expect(armado).toContain('pares arriba, impares abajo');
  });

  it('da las distancias para comprobar, calculadas desde la configuración', () => {
    expect(armado).toContain('333,3 mm');
    expect(armado).toContain('en R10, 125,0 mm');
  });
});

describe('salientes de la tapa +2.00 y separadores S1 y S2', () => {
  const t = medidasTapa();

  it('los salientes miden 3 mm de ancho y al menos 10 mm de largo (2 mm se doblan en cartón)', () => {
    expect(M.salienteTapa).toBe(3);
    expect(M.salienteLargo).toBeGreaterThanOrEqual(10);
    expect(t.salienteZmax - t.salienteZmin).toBe(M.salienteLargo);
  });

  it('con S1 y S2 a la altura del panel (56 mm) los salientes quedarían trabados', () => {
    // Los salientes ocupan el ancho de S1/S2 (3 mm a cada lado): si S llega al panel, se cruzan en altura.
    expect(M.altoInterior).toBeGreaterThan(t.salienteZmin);
  });

  it('con S1 y S2 más bajos, los salientes pasan por encima con holgura', () => {
    expect(altoSeparador()).toBe(41);
    expect(t.salienteZmin - altoSeparador()).toBeGreaterThanOrEqual(M.holguraSeparador);
    expect(t.salienteZmax).toBeLessThanOrEqual(M.altoInterior);
  });

  it('con los salientes la tapa llena exactamente el ancho interior', () => {
    expect(t.ancho).toBe(172);
    expect(t.anchoConSalientes).toBe(M.anchoInterior);
  });
});

describe('tapa +2.00 y techo delantero', () => {
  const caja = CAJA_POR_DEFECTO;
  const d = dimensiones(caja);
  const techo = geometriaTecho(caja);
  // Zona de la bisagra y del hueco de la tapa, en x desde el plano de los lentes (x = 0):
  // del apoyo (x = -e + cartón) hasta la cara del panel de lentes que mira al niño (x = -cartón/2).
  const hueco = { desde: -caja.e_mm + M.carton, hasta: -M.carton / 2 };

  it('la tapa cabe entre S1 y S2', () => {
    expect(anchoTapa()).toBe(172);
    expect(anchoTapa() + 2 * M.carton).toBeLessThanOrEqual(M.anchoInterior);
    expect(medidasTapa().ancho).toBeLessThanOrEqual(M.anchoInterior - 2 * M.carton);
  });

  it('el hueco de la tapa mide lo que dicen S1 y S2 y deja lugar a la tapa de cartón', () => {
    expect(hueco.hasta - hueco.desde).toBeCloseTo(d.separador, 9);
    expect(d.separador).toBeGreaterThan(2 * M.carton);
  });

  it('el techo no cubre la bisagra ni el hueco de la tapa', () => {
    expect(techo.desde).toBeGreaterThanOrEqual(M.carton / 2); // detrás del panel de lentes
    expect(techo.desde).toBeGreaterThan(hueco.hasta);
  });

  it('el techo llega hasta justo antes de R10 y el celular en R10 no lo toca', () => {
    const tope10 = Math.min(...caja.ranuras_mm); // el celular empieza en el tope
    expect(techo.hasta).toBeLessThan(tope10);
    expect(tope10 - techo.hasta).toBeGreaterThanOrEqual(M.carton + M.holguraTrasera);
    expect(techo.hasta - techo.desde).toBeGreaterThan(100);
  });

  it('la pieza del techo en la plantilla mide lo mismo', () => {
    const pieza = generarPlantilla(caja).piezas.find((x) => x.nombre === 'Techo delantero')!;
    expect(pieza.ancho).toBeCloseTo(techo.hasta - techo.desde, 9);
  });
});
