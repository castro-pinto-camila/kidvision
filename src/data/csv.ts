/**
 * CSV: carga de la lista del salón y exportación del resumen.
 * La exportación usa punto y coma, coma decimal y marca BOM, para que Excel
 * en español la abra en columnas y con acentos.
 */
import type { ResultadoOjo } from '../logic/flujo';
import type { Estudiante, Evaluacion } from './salon';

export interface ErrorFila {
  /** Número de fila en el archivo (la primera es 1). */
  fila: number;
  mensaje: string;
}

const BOM = '﻿';

/** Parte una línea de CSV respetando comillas ("a;b" es un solo campo; "" es una comilla). */
export function partirLinea(linea: string, separador: string): string[] {
  const campos: string[] = [];
  let actual = '';
  let enComillas = false;
  for (let i = 0; i < linea.length; i++) {
    const c = linea[i];
    if (enComillas) {
      if (c === '"' && linea[i + 1] === '"') {
        actual += '"';
        i++;
      } else if (c === '"') {
        enComillas = false;
      } else {
        actual += c;
      }
    } else if (c === '"') {
      enComillas = true;
    } else if (c === separador) {
      campos.push(actual);
      actual = '';
    } else {
      actual += c;
    }
  }
  campos.push(actual);
  return campos.map((x) => x.trim());
}

const normalizar = (t: string) =>
  t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

/**
 * Lee la lista del salón: columnas código, edad y grado, separadas por coma o
 * punto y coma, con o sin encabezado. Devuelve los estudiantes válidos y los
 * errores por fila.
 */
export function leerListaCsv(texto: string): { estudiantes: Estudiante[]; errores: ErrorFila[] } {
  const lineas = texto.replace(BOM, '').split(/\r?\n/);
  const primera = lineas.find((l) => l.trim() !== '') ?? '';
  const separador = primera.includes(';') ? ';' : ',';
  const estudiantes: Estudiante[] = [];
  const errores: ErrorFila[] = [];
  const vistos = new Set<string>();

  lineas.forEach((linea, i) => {
    const fila = i + 1;
    if (linea.trim() === '') return;
    const [codigo = '', edadTexto = '', grado = ''] = partirLinea(linea, separador);
    if (i === lineas.indexOf(primera) && normalizar(codigo) === 'codigo') return; // encabezado
    if (!codigo) {
      errores.push({ fila, mensaje: 'Falta el código del niño.' });
      return;
    }
    if (vistos.has(codigo)) {
      errores.push({ fila, mensaje: `El código ${codigo} está repetido.` });
      return;
    }
    let edad: number | null = null;
    if (edadTexto !== '') {
      const n = Number(edadTexto);
      if (!Number.isInteger(n) || n < 3 || n > 18) {
        errores.push({ fila, mensaje: `La edad «${edadTexto}» no es válida (debe ser un número entre 3 y 18).` });
        return;
      }
      edad = n;
    }
    vistos.add(codigo);
    estudiantes.push({ codigo, edad, grado });
  });
  return { estudiantes, errores };
}

function campo(valor: string | number | null | undefined): string {
  if (valor === null || valor === undefined) return '';
  const t = typeof valor === 'number' ? String(valor).replace('.', ',') : valor;
  return /[;"\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
}

function agudeza(o: ResultadoOjo, corte: string): string {
  if (o.pasaLejos) return `${corte} o mejor`;
  return o.umbral === '<6/60' ? 'menor que 6/60' : (o.umbral ?? '');
}

const COLUMNAS = [
  'codigo',
  'grado',
  'edad',
  'estado',
  'fecha',
  'semaforo',
  'indicacion',
  'agudeza_OD',
  'agudeza_OI',
  'miopia_estimada_OD_D',
  'miopia_estimada_OI_D',
  'categorias_OD',
  'categorias_OI',
  'posible_astigmatismo_OD',
  'posible_astigmatismo_OI',
  'dudoso_OD',
  'dudoso_OI',
  'motivos_OD',
  'motivos_OI',
  'duracion_seg',
];

/** Resumen del salón: una fila por niño, con su última evaluación (o «pendiente»). */
export function exportarResumenCsv(filas: { estudiante: Estudiante; evaluacion: Evaluacion | null }[]): string {
  const lineas = filas.map(({ estudiante: e, evaluacion: ev }) => {
    if (!ev) return [e.codigo, e.grado, e.edad, 'pendiente'].map(campo).join(';');
    const s = ev.sesion;
    const { OD, OI } = s.ojos;
    const si = (b: boolean) => (b ? 'sí' : 'no');
    return [
      e.codigo,
      e.grado,
      e.edad,
      'evaluado',
      s.fecha.slice(0, 10),
      s.semaforo,
      s.indicacion,
      agudeza(OD, s.umbralCorte),
      agudeza(OI, s.umbralCorte),
      OD.miopiaEstimadaD === null ? null : Math.round(OD.miopiaEstimadaD * 100) / 100,
      OI.miopiaEstimadaD === null ? null : Math.round(OI.miopiaEstimadaD * 100) / 100,
      OD.categorias.join(' '),
      OI.categorias.join(' '),
      si(OD.posibleAstigmatismo),
      si(OI.posibleAstigmatismo),
      si(OD.dudoso),
      si(OI.dudoso),
      OD.motivosDudoso.join(' '),
      OI.motivosDudoso.join(' '),
      s.duracionSeg,
    ]
      .map(campo)
      .join(';');
  });
  return BOM + [COLUMNAS.join(';'), ...lineas].join('\r\n') + '\r\n';
}
