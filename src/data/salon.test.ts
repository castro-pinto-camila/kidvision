import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { CAJA_POR_DEFECTO } from '../core/caja';
import { PruebaVisual, type ResultadoSesion } from '../logic/flujo';
import { azarConSemilla, responderComo, type OjoSimulado } from '../logic/ninoSimulado';
import { exportarResumenCsv, leerListaCsv, partirLinea } from './csv';
import { abrirDB, ALMACEN_CONFIG, escribir } from './db';
import {
  borrarSalon,
  compararCodigos,
  evaluacionesDe,
  guardarEstudiantes,
  guardarEvaluacion,
  leerEstudiantes,
  leerEvaluacion,
  ultimasEvaluaciones,
  type Estudiante,
  type Evaluacion,
} from './salon';

let n = 0;
const dbNueva = () => abrirDB(`salon-${++n}`);

function sesion(ojo: OjoSimulado, fecha: number): ResultadoSesion {
  const p = new PruebaVisual({
    caja: CAJA_POR_DEFECTO,
    pantalla: { pxPorMm: 1 / 0.06, dpr: 1 },
    azar: azarConSemilla(5),
    ahora: () => fecha,
  });
  while (p.paso.tipo !== 'fin') p.responder(responderComo({ OD: ojo, OI: ojo }, p.paso));
  return p.paso.resultado;
}

function evaluacion(e: Estudiante, s: ResultadoSesion): Evaluacion {
  return {
    estudiante: { ...e, colegio: 'IE 123' },
    dispositivo: { pxPorMm: 16.7, dpr: 1, caja: { P: 3, e_mm: 15, ranuras_mm: CAJA_POR_DEFECTO.ranuras_mm } },
    sesion: s,
  };
}

const ANA: Estudiante = { codigo: '3B-07', edad: 9, grado: '3B' };
const LUIS: Estudiante = { codigo: '3B-10', edad: 8, grado: '3B' };
const PEDRO: Estudiante = { codigo: '3B-2', edad: null, grado: '3B' };

describe('estudiantes y evaluaciones', () => {
  it('la versión 2 conserva la configuración guardada', async () => {
    const db = await dbNueva();
    await escribir(db, ALMACEN_CONFIG, 'actual', { pxPorMm: 6 });
    expect(db.objectStoreNames.contains('estudiantes')).toBe(true);
    expect(db.objectStoreNames.contains('evaluaciones')).toBe(true);
  });

  it('guarda estudiantes en orden natural de código y cuenta los nuevos', async () => {
    const db = await dbNueva();
    expect(await guardarEstudiantes(db, [LUIS, ANA, PEDRO])).toEqual({ nuevos: 3, actualizados: 0 });
    expect((await leerEstudiantes(db)).map((e) => e.codigo)).toEqual(['3B-2', '3B-07', '3B-10']);
    expect(await guardarEstudiantes(db, [{ ...ANA, edad: 10 }])).toEqual({ nuevos: 0, actualizados: 1 });
    expect((await leerEstudiantes(db)).find((e) => e.codigo === ANA.codigo)?.edad).toBe(10);
  });

  it('guarda el historial y muestra la última evaluación de cada niño', async () => {
    const db = await dbNueva();
    await guardarEstudiantes(db, [ANA, LUIS]);
    const primera = evaluacion(ANA, sesion({ refraccion: -2, borrosa: 24 }, Date.UTC(2026, 10, 3)));
    const segunda = evaluacion(ANA, sesion({ refraccion: 0 }, Date.UTC(2026, 10, 5)));
    const id1 = await guardarEvaluacion(db, primera);
    await guardarEvaluacion(db, segunda);
    expect((await evaluacionesDe(db, ANA.codigo)).map((e) => e.sesion.semaforo)).toEqual(['ROJO', 'VERDE']);
    const ultimas = await ultimasEvaluaciones(db);
    expect(ultimas.get(ANA.codigo)?.sesion.semaforo).toBe('VERDE');
    expect(ultimas.has(LUIS.codigo)).toBe(false);
    expect((await leerEvaluacion(db, id1))?.sesion.ojos.OD.puntoRemoto).toBe('R4');
  });

  it('la evaluación guardada tiene la forma del JSON de SPEC.md', async () => {
    const db = await dbNueva();
    const id = await guardarEvaluacion(db, evaluacion(ANA, sesion({ refraccion: -2, borrosa: 24 }, 0)));
    const ev = (await leerEvaluacion(db, id))!;
    expect(ev.estudiante).toEqual({ ...ANA, colegio: 'IE 123' });
    expect(ev.dispositivo.caja.ranuras_mm).toHaveLength(11);
    expect(ev.sesion).toMatchObject({ umbralCorte: '6/9', semaforo: 'ROJO' });
    expect(ev.sesion.ojos.OD).toMatchObject({ puntoRemoto: 'R4', categorias: ['miopia'] });
    expect(ev.sesion.ojos.OD.miopiaEstimadaD).toBeCloseTo(-1.94, 2);
  });

  it('borrar el salón deja la configuración', async () => {
    const db = await dbNueva();
    await escribir(db, ALMACEN_CONFIG, 'actual', { pxPorMm: 6 });
    await guardarEstudiantes(db, [ANA]);
    await guardarEvaluacion(db, evaluacion(ANA, sesion({ refraccion: 0 }, 0)));
    await borrarSalon(db);
    expect(await leerEstudiantes(db)).toEqual([]);
    expect((await ultimasEvaluaciones(db)).size).toBe(0);
    const tx = db.transaction(ALMACEN_CONFIG).objectStore(ALMACEN_CONFIG).get('actual');
    await new Promise((r) => (tx.onsuccess = r));
    expect(tx.result).toEqual({ pxPorMm: 6 });
  });

  it('orden natural de códigos', () => {
    expect(['3B-10', '3B-2', '3A-1'].sort(compararCodigos)).toEqual(['3A-1', '3B-2', '3B-10']);
  });
});

describe('CSV: carga de la lista', () => {
  it('lee con coma y encabezado', () => {
    const r = leerListaCsv('codigo,edad,grado\n3B-07,9,3B\n3B-08,10,3B\n');
    expect(r.errores).toEqual([]);
    expect(r.estudiantes).toEqual([
      { codigo: '3B-07', edad: 9, grado: '3B' },
      { codigo: '3B-08', edad: 10, grado: '3B' },
    ]);
  });

  it('lee con punto y coma, BOM de Excel, sin encabezado y con líneas vacías', () => {
    const r = leerListaCsv('﻿3B-07;9;3B\r\n\r\n3B-08;;3B\r\n');
    expect(r.estudiantes).toEqual([
      { codigo: '3B-07', edad: 9, grado: '3B' },
      { codigo: '3B-08', edad: null, grado: '3B' },
    ]);
  });

  it('reconoce el encabezado con tilde y mayúsculas', () => {
    expect(leerListaCsv('Código;Edad;Grado\n1;8;2A').estudiantes).toHaveLength(1);
  });

  it('avisa qué filas tienen problemas y sigue con las demás', () => {
    const r = leerListaCsv('codigo,edad,grado\n,9,3B\n3B-07,nueve,3B\n3B-08,9,3B\n3B-08,9,3B\n');
    expect(r.estudiantes.map((e) => e.codigo)).toEqual(['3B-08']);
    expect(r.errores.map((e) => e.fila)).toEqual([2, 3, 5]);
    expect(r.errores[0].mensaje).toMatch(/Falta el código/);
    expect(r.errores[1].mensaje).toMatch(/edad/);
    expect(r.errores[2].mensaje).toMatch(/repetido/);
  });

  it('respeta las comillas', () => {
    expect(partirLinea('"3B; turno tarde",9,"3""B"', ',')).toEqual(['3B; turno tarde', '9', '3"B']);
  });
});

describe('CSV: exportación del resumen', () => {
  const miope = sesion({ refraccion: -2, borrosa: 24 }, Date.UTC(2026, 10, 5));
  const csv = exportarResumenCsv([
    { estudiante: ANA, evaluacion: evaluacion(ANA, miope) },
    { estudiante: LUIS, evaluacion: null },
  ]);
  const filas = csv.replace('﻿', '').trim().split('\r\n');

  it('empieza con BOM y usa punto y coma', () => {
    expect(csv.startsWith('﻿')).toBe(true);
    expect(filas[0].split(';')[0]).toBe('codigo');
  });

  it('una fila por niño: evaluado con sus datos, pendiente vacío', () => {
    const ana = filas[1].split(';');
    expect(ana.slice(0, 7)).toEqual(['3B-07', '3B', '9', 'evaluado', '2026-11-05', 'ROJO', 'derivar']);
    expect(ana[7]).toBe('6/24');
    expect(ana[9]).toBe('-1,94');
    expect(ana[11]).toBe('miopia');
    expect(filas[2]).toBe('3B-10;3B;8;pendiente');
  });
});
