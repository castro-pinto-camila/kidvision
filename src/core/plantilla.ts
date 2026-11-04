/**
 * Plantilla de corte de la caja con bandeja deslizante (SPEC.md, «Requisitos
 * de la caja»). Todo en mm, calculado desde la configuración de la caja.
 *
 * Ejes de la caja: x a lo largo, con x = 0 en el plano de los lentes y x > 0
 * hacia el celular; z hacia arriba desde la cara de arriba del piso.
 *
 * La bandeja lleva el celular apoyado contra su tope (la cara interior del
 * frente). Para la ranura Rk el tope queda en x = d_k. Se fija con un pasador
 * que atraviesa la pared derecha y la bandeja; también se puede alinear la
 * muesca de la bandeja con la regla de la pared izquierda y sujetar con un clip.
 *
 * Este archivo usa solo sintaxis que Node puede ejecutar quitando los tipos
 * (lo usa scripts/plantilla.ts), por eso importa con extensión .ts.
 */
import type { ConfigCaja } from './caja.ts';

export interface MedidasCaja {
  /** Espesor del cartón. */
  carton: number;
  /**
   * Ancho interior de la caja. Dentro va la bandeja, con sus costados de
   * cartón: tiene que caber un celular de 6,8" (≈ 164 mm) más esponja.
   */
  anchoInterior: number;
  /** Alto interior: el celular sobresale por arriba para la franja de botones. */
  altoInterior: number;
  /** Altura del centro de los lentes sobre el piso (≈ centro de la pantalla). */
  alturaLentes: number;
  diametroLente: number;
  /** De la cara del tope a la cara de atrás de la bandeja (celular + cuña). */
  fondoBandeja: number;
  alturaBandeja: number;
  /** Labio inferior del tope y postes de los costados. */
  labioTope: number;
  posteTope: number;
  /** Distancia del tope al agujero del pasador, dentro de la bandeja. */
  pasadorDesdeTope: number;
  diametroPasador: number;
  /** Alturas de las dos filas de agujeros (ranuras pares e impares). */
  filaPares: number;
  filaImpares: number;
  /** Lo que sobra delante del plano de los lentes y detrás de la bandeja en R0. */
  margenDelantero: number;
  holguraTrasera: number;
  /** Salientes de la tapa +2.00: lo que sobresalen a cada lado, su largo y a qué distancia del borde de arriba empiezan. */
  salienteTapa: number;
  salienteLargo: number;
  salienteDesdeArriba: number;
  /** Aire entre lo más bajo de los salientes y lo más alto de S1 y S2. */
  holguraSeparador: number;
  /** Pestaña para levantar la tapa (doblada hacia el ojo, en el borde de abajo). */
  pestanaAncho: number;
  pestanaLargo: number;
}

export const MEDIDAS_POR_DEFECTO: MedidasCaja = {
  carton: 3,
  anchoInterior: 178,
  altoInterior: 56,
  alturaLentes: 39,
  diametroLente: 30,
  fondoBandeja: 24,
  alturaBandeja: 45,
  labioTope: 5,
  posteTope: 8,
  pasadorDesdeTope: 12,
  diametroPasador: 4,
  filaPares: 34,
  filaImpares: 18,
  margenDelantero: 10,
  holguraTrasera: 5,
  salienteTapa: 3,
  salienteLargo: 12,
  salienteDesdeArriba: 2,
  holguraSeparador: 1,
  pestanaAncho: 20,
  pestanaLargo: 7,
};

/** corte = se corta; doblez = se dobla; guia = ayuda gris que no se corta; marca = se imprime y no se corta (regla, números). */
export type Trazo = 'corte' | 'doblez' | 'guia' | 'marca';

export type Forma =
  | { tipo: 'rect'; x: number; y: number; ancho: number; alto: number; trazo: Trazo; relleno?: string }
  | { tipo: 'circulo'; x: number; y: number; r: number; trazo: Trazo }
  | { tipo: 'linea'; x1: number; y1: number; x2: number; y2: number; trazo: Trazo }
  | { tipo: 'poligono'; puntos: [number, number][]; trazo: Trazo }
  | { tipo: 'texto'; x: number; y: number; texto: string; tam: number; ancla?: 'start' | 'middle' | 'end' };

export interface Pieza {
  nombre: string;
  /** Posición en la hoja grande. */
  x: number;
  y: number;
  ancho: number;
  alto: number;
  formas: Forma[];
}

export interface Agujero {
  ranura: string;
  /** Posición a lo largo de la caja (centro del agujero). */
  x: number;
  /** Altura sobre el piso. */
  z: number;
}

/** Agujeros del pasador en la pared derecha: dos filas alternadas para que quede cartón entre ellos. */
export function agujerosPasador(caja: ConfigCaja, m: MedidasCaja = MEDIDAS_POR_DEFECTO): Agujero[] {
  return caja.ranuras_mm.map((d, i) => ({
    ranura: `R${i}`,
    x: d + m.pasadorDesdeTope,
    z: i % 2 === 0 ? m.filaPares : m.filaImpares,
  }));
}

/** Marcas de la regla de la pared izquierda: donde debe quedar la muesca (el tope) en cada ranura. */
export function marcasRegla(caja: ConfigCaja): { ranura: string; x: number }[] {
  return caja.ranuras_mm.map((d, i) => ({ ranura: `R${i}`, x: d }));
}

export interface DimensionesCaja {
  /** Largo de las paredes, del frente (antes de los lentes) al panel trasero. */
  largoParedes: number;
  /** Medidas exteriores con el apoyo para la cara. */
  largoTotal: number;
  anchoTotal: number;
  altoTotal: number;
  /** Separación entre el panel de los lentes y el apoyo para la cara. */
  separador: number;
}

export function dimensiones(caja: ConfigCaja, m: MedidasCaja = MEDIDAS_POR_DEFECTO): DimensionesCaja {
  const dMax = Math.max(...caja.ranuras_mm);
  const finInterior = dMax + m.fondoBandeja + m.holguraTrasera;
  const largoParedes = m.margenDelantero + finInterior + m.carton;
  // El apoyo queda con su cara a e del plano de los lentes; el panel de lentes mide medio cartón hacia el ojo.
  const separador = caja.e_mm - m.carton / 2 - m.carton;
  return {
    largoParedes,
    largoTotal: caja.e_mm + finInterior + m.carton,
    anchoTotal: m.anchoInterior + 2 * m.carton,
    altoTotal: m.altoInterior + 2 * m.carton,
    separador,
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const coma = (n: number) => r1(n).toFixed(1).replace('.', ',');

/** Pared: largo × (alto interior + piso). u = x + margenDelantero; v = desde el borde de arriba. */
function pared(
  nombre: string,
  caja: ConfigCaja,
  m: MedidasCaja,
  extra: (u: (x: number) => number, v: (z: number) => number) => Forma[],
): Omit<Pieza, 'x' | 'y'> {
  const { largoParedes } = dimensiones(caja, m);
  const alto = m.altoInterior + m.carton;
  const u = (x: number) => x + m.margenDelantero;
  const v = (z: number) => alto - m.carton - z;
  const formas: Forma[] = [
    { tipo: 'rect', x: 0, y: 0, ancho: largoParedes, alto, trazo: 'corte' },
    // Dónde va el panel de los lentes: su centro en x = 0.
    { tipo: 'rect', x: u(-m.carton / 2), y: 0, ancho: m.carton, alto, trazo: 'guia' },
    { tipo: 'texto', x: u(0) + 2, y: 6, texto: 'Plano de los lentes (x = 0)', tam: 3 },
    { tipo: 'linea', x1: 0, y1: v(0), x2: largoParedes, y2: v(0), trazo: 'guia' },
    { tipo: 'texto', x: largoParedes - 2, y: v(0) - 1.5, texto: 'piso', tam: 3, ancla: 'end' },
    { tipo: 'texto', x: largoParedes / 2, y: v(0) - 1.5, texto: nombre, tam: 4.5, ancla: 'middle' },
    ...extra(u, v),
  ];
  return { nombre, ancho: largoParedes, alto, formas };
}

function paredDerecha(caja: ConfigCaja, m: MedidasCaja): Omit<Pieza, 'x' | 'y'> {
  return pared('Pared derecha · agujeros del pasador', caja, m, (u, v) =>
    agujerosPasador(caja, m).flatMap((a): Forma[] => [
      { tipo: 'circulo', x: u(a.x), y: v(a.z), r: m.diametroPasador / 2, trazo: 'corte' },
      {
        tipo: 'texto',
        x: u(a.x),
        y: a.z === m.filaPares ? v(a.z) - 4 : v(a.z) + 8,
        texto: a.ranura,
        tam: 6,
        ancla: 'middle',
      },
    ]),
  );
}

function paredIzquierda(caja: ConfigCaja, m: MedidasCaja): Omit<Pieza, 'x' | 'y'> {
  return pared('Pared izquierda · regla de la muesca (cara interior)', caja, m, (u, v) =>
    marcasRegla(caja).flatMap((r, i): Forma[] => [
      { tipo: 'linea', x1: u(r.x), y1: 0, x2: u(r.x), y2: 10, trazo: 'corte' },
      { tipo: 'texto', x: u(r.x), y: i % 2 === 0 ? 16 : 23, texto: r.ranura, tam: 5, ancla: 'middle' },
      { tipo: 'linea', x1: u(r.x), y1: v(m.alturaBandeja), x2: u(r.x), y2: v(m.alturaBandeja) - 3, trazo: 'guia' },
    ]),
  );
}

/** Regla suelta, por si la pared se arma con otro cartón: se pega en el borde de arriba de la pared izquierda. */
function reglaSuelta(caja: ConfigCaja, m: MedidasCaja): Omit<Pieza, 'x' | 'y'> {
  const { largoParedes } = dimensiones(caja, m);
  const alto = 26;
  const u = (x: number) => x + m.margenDelantero;
  return {
    nombre: 'Regla para la canaleta',
    ancho: largoParedes,
    alto,
    formas: [
      { tipo: 'rect', x: 0, y: 0, ancho: largoParedes, alto, trazo: 'corte' },
      { tipo: 'linea', x1: u(0), y1: 0, x2: u(0), y2: alto, trazo: 'guia' },
      { tipo: 'texto', x: u(0) + 2, y: alto - 3, texto: 'lentes', tam: 3 },
      ...marcasRegla(caja).flatMap((r, i): Forma[] => [
        { tipo: 'linea', x1: u(r.x), y1: 0, x2: u(r.x), y2: 10, trazo: 'corte' },
        { tipo: 'texto', x: u(r.x), y: i % 2 === 0 ? 16 : 23, texto: r.ranura, tam: 5, ancla: 'middle' },
      ]),
      {
        tipo: 'texto',
        x: largoParedes - 3,
        y: alto - 3,
        texto: 'La muesca de la bandeja va sobre la marca',
        tam: 3,
        ancla: 'end',
      },
    ],
  };
}

function piso(caja: ConfigCaja, m: MedidasCaja): Omit<Pieza, 'x' | 'y'> {
  const { largoParedes } = dimensiones(caja, m);
  const u = (x: number) => x + m.margenDelantero;
  return {
    nombre: 'Piso',
    ancho: largoParedes,
    alto: m.anchoInterior,
    formas: [
      { tipo: 'rect', x: 0, y: 0, ancho: largoParedes, alto: m.anchoInterior, trazo: 'corte' },
      { tipo: 'rect', x: u(-m.carton / 2), y: 0, ancho: m.carton, alto: m.anchoInterior, trazo: 'guia' },
      { tipo: 'texto', x: largoParedes / 2, y: m.anchoInterior / 2, texto: 'Piso (la bandeja se desliza aquí)', tam: 5, ancla: 'middle' },
    ],
  };
}

/** Ancho de la tapa +2.00: baja entre S1 y S2, que ocupan un cartón a cada lado. */
export function anchoTapa(m: MedidasCaja = MEDIDAS_POR_DEFECTO): number {
  return m.anchoInterior - 2 * m.carton;
}

/** Panel con dos agujeros para lentes. */
function panelLentes(nombre: string, caja: ConfigCaja, m: MedidasCaja): Omit<Pieza, 'x' | 'y'> {
  const ancho = m.anchoInterior;
  const alto = m.altoInterior;
  const cy = alto - m.alturaLentes;
  const formas: Forma[] = [
    { tipo: 'rect', x: 0, y: 0, ancho, alto, trazo: 'corte' },
    ...[-1, 1].map(
      (s): Forma => ({
        tipo: 'circulo',
        x: ancho / 2 + s * caja.lenteDesdeCentro_mm,
        y: cy,
        r: m.diametroLente / 2,
        trazo: 'corte',
      }),
    ),
    { tipo: 'texto', x: ancho / 2, y: alto - 4, texto: nombre, tam: 4, ancla: 'middle' },
  ];
  return { nombre, ancho, alto, formas };
}

export interface MedidasTapa {
  /** Ancho del cuerpo (sin salientes): lo que cabe entre S1 y S2. */
  ancho: number;
  alto: number;
  /** Altura sobre el piso, de la parte más baja a la más alta de los salientes (con la tapa abajo). */
  salienteZmin: number;
  salienteZmax: number;
  /** Ancho total con los salientes: queda por encima de S1 y S2. */
  anchoConSalientes: number;
}

export function medidasTapa(m: MedidasCaja = MEDIDAS_POR_DEFECTO): MedidasTapa {
  const alto = m.altoInterior;
  return {
    ancho: anchoTapa(m),
    alto,
    salienteZmax: alto - m.salienteDesdeArriba,
    salienteZmin: alto - m.salienteDesdeArriba - m.salienteLargo,
    anchoConSalientes: anchoTapa(m) + 2 * m.salienteTapa,
  };
}

/** Altura de S1 y S2: más bajos que el panel, para que los salientes de la tapa se apoyen encima sin trabarse. */
export function altoSeparador(m: MedidasCaja = MEDIDAS_POR_DEFECTO): number {
  return medidasTapa(m).salienteZmin - m.holguraSeparador;
}

/**
 * Tapa +2.00 con bisagra arriba. Salientes a los lados (arriba) para que se
 * apoye sobre S1 y S2 y quede a plomo, y pestaña en el borde de abajo, que se
 * dobla hacia el ojo para levantarla con la uña por la muesca de la nariz.
 */
function tapaLentes(caja: ConfigCaja, m: MedidasCaja): Omit<Pieza, 'x' | 'y'> {
  const t = medidasTapa(m);
  const s = m.salienteTapa;
  const W = t.ancho;
  const H = t.alto;
  const y1 = m.salienteDesdeArriba;
  const y2 = y1 + m.salienteLargo;
  const cx = s + W / 2;
  const pa = m.pestanaAncho / 2;
  const cy = H - m.alturaLentes;
  return {
    nombre: 'Tapa +2.00',
    ancho: t.anchoConSalientes,
    alto: H + m.pestanaLargo,
    formas: [
      {
        tipo: 'poligono',
        puntos: [
          [s, 0], [s + W, 0], [s + W, y1], [2 * s + W, y1], [2 * s + W, y2], [s + W, y2],
          [s + W, H], [cx + pa, H], [cx + pa, H + m.pestanaLargo], [cx - pa, H + m.pestanaLargo], [cx - pa, H],
          [s, H], [s, y2], [0, y2], [0, y1], [s, y1],
        ],
        trazo: 'corte',
      },
      ...[-1, 1].map(
        (k): Forma => ({ tipo: 'circulo', x: cx + k * caja.lenteDesdeCentro_mm, y: cy, r: m.diametroLente / 2, trazo: 'corte' }),
      ),
      { tipo: 'linea', x1: s, y1: 0, x2: s + W, y2: 0, trazo: 'doblez' },
      { tipo: 'texto', x: cx, y: 5, texto: 'bisagra: pegar arriba del panel de lentes, lado del ojo', tam: 3, ancla: 'middle' },
      { tipo: 'linea', x1: cx - pa, y1: H, x2: cx + pa, y2: H, trazo: 'doblez' },
      { tipo: 'texto', x: cx, y: H + m.pestanaLargo - 1.5, texto: 'pestaña: doblar hacia el ojo', tam: 3, ancla: 'middle' },
      { tipo: 'texto', x: s + 1, y: y2 + 5, texto: 'salientes: cinta', tam: 2.5 },
      { tipo: 'texto', x: cx, y: H - 4, texto: 'Tapa +2.00', tam: 4, ancla: 'middle' },
    ],
  };
}

function apoyoCara(caja: ConfigCaja, m: MedidasCaja): Omit<Pieza, 'x' | 'y'> {
  const ancho = m.anchoInterior + 2 * m.carton;
  const alto = m.altoInterior;
  const cy = alto - m.alturaLentes;
  const ventanaAncho = 2 * caja.lenteDesdeCentro_mm + m.diametroLente + 10;
  const ventanaAlto = m.diametroLente + 6;
  return {
    nombre: 'Apoyo para la cara',
    ancho,
    alto,
    formas: [
      { tipo: 'rect', x: 0, y: 0, ancho, alto, trazo: 'corte' },
      {
        tipo: 'rect',
        x: (ancho - ventanaAncho) / 2,
        y: cy - ventanaAlto / 2,
        ancho: ventanaAncho,
        alto: ventanaAlto,
        trazo: 'corte',
      },
      {
        tipo: 'poligono',
        puntos: [
          [ancho / 2 - 12, alto],
          [ancho / 2, alto - 14],
          [ancho / 2 + 12, alto],
        ],
        trazo: 'corte',
      },
      { tipo: 'texto', x: 4, y: 6, texto: `Apoyo para la cara: su cara queda a ${coma(caja.e_mm)} mm de los lentes`, tam: 3 },
    ],
  };
}

function separador(caja: ConfigCaja, m: MedidasCaja, n: number): Omit<Pieza, 'x' | 'y'> {
  const ancho = dimensiones(caja, m).separador;
  const alto = altoSeparador(m);
  return {
    nombre: `Separador ${n}`,
    ancho,
    alto,
    formas: [
      { tipo: 'rect', x: 0, y: 0, ancho, alto, trazo: 'corte' },
      { tipo: 'texto', x: ancho / 2, y: alto / 2, texto: `S${n}`, tam: 4, ancla: 'middle' },
    ],
  };
}

/**
 * Dónde está el techo delantero a lo largo de la caja (x = 0 en el plano de los
 * lentes). Empieza en la cara de atrás del panel de lentes, así deja libre la
 * bisagra y el espacio donde baja la tapa. Termina antes del tope de la bandeja
 * en R10; el celular empieza en ese tope, así que no lo toca.
 */
export function geometriaTecho(caja: ConfigCaja, m: MedidasCaja = MEDIDAS_POR_DEFECTO): { desde: number; hasta: number } {
  const dMin = Math.min(...caja.ranuras_mm);
  return { desde: m.carton / 2, hasta: dMin - m.carton - m.holguraTrasera };
}

function tapaSuperior(caja: ConfigCaja, m: MedidasCaja): Omit<Pieza, 'x' | 'y'> {
  const { desde, hasta } = geometriaTecho(caja, m);
  const largo = hasta - desde;
  const ancho = m.anchoInterior + 2 * m.carton;
  return {
    nombre: 'Techo delantero',
    ancho: largo,
    alto: ancho,
    formas: [
      { tipo: 'rect', x: 0, y: 0, ancho: largo, alto: ancho, trazo: 'corte' },
      { tipo: 'texto', x: largo / 2, y: ancho / 2, texto: 'Techo delantero', tam: 5, ancla: 'middle' },
      { tipo: 'texto', x: largo / 2, y: ancho / 2 + 7, texto: 'empieza detrás del panel de lentes', tam: 3, ancla: 'middle' },
      { tipo: 'texto', x: largo / 2, y: ancho / 2 + 11, texto: 'detrás queda abierta la canaleta', tam: 3, ancla: 'middle' },
    ],
  };
}

/** Largo de la tira y de la parte resaltada que se usa para calibrar la pantalla. */
export const LARGO_TIRA_MM = 400;
export const CALIBRACION_TIRA_MM = 100;
const ALTO_TIRA_MM = 25;

/**
 * Tira de 40 cm con marcas cada centímetro. Sirve para la prueba de cerca
 * (de la mejilla al celular) y, con los primeros 10 cm resaltados, para calibrar la pantalla.
 */
function tira(): Omit<Pieza, 'x' | 'y'> {
  const formas: Forma[] = [
    { tipo: 'rect', x: 0, y: 0, ancho: CALIBRACION_TIRA_MM, alto: ALTO_TIRA_MM, trazo: 'marca', relleno: '#fde68a' },
    { tipo: 'rect', x: 0, y: 0, ancho: LARGO_TIRA_MM, alto: ALTO_TIRA_MM, trazo: 'corte' },
  ];
  for (let cm = 0; cm <= 40; cm++) {
    const x = cm * 10;
    const largo = cm % 5 === 0 ? 7 : 4;
    formas.push({ tipo: 'linea', x1: x, y1: 0, x2: x, y2: largo, trazo: 'marca' });
    if (cm % 5 === 0 || cm <= 10) {
      formas.push({ tipo: 'texto', x, y: largo + 4, texto: String(cm), tam: cm <= 10 ? 3.5 : 3, ancla: 'middle' });
    }
  }
  formas.push(
    { tipo: 'texto', x: 4, y: 21, texto: 'CALIBRAR: apoya el 0 en el borde izquierdo de la línea de la app y llega hasta el 10', tam: 3 },
    { tipo: 'texto', x: 108, y: 21, texto: 'Tira de 40 cm: prueba de cerca (de la mejilla al celular)', tam: 3 },
  );
  return { nombre: 'Tira de 40 cm', ancho: LARGO_TIRA_MM, alto: ALTO_TIRA_MM, formas };
}

function panelTrasero(m: MedidasCaja): Omit<Pieza, 'x' | 'y'> {
  return {
    nombre: 'Panel trasero',
    ancho: m.anchoInterior,
    alto: m.altoInterior,
    formas: [
      { tipo: 'rect', x: 0, y: 0, ancho: m.anchoInterior, alto: m.altoInterior, trazo: 'corte' },
      { tipo: 'texto', x: m.anchoInterior / 2, y: m.altoInterior / 2, texto: 'Panel trasero', tam: 5, ancla: 'middle' },
    ],
  };
}

/** Ancho exterior de la bandeja: 1 mm de holgura a cada lado para que se deslice. */
export function anchoBandeja(m: MedidasCaja = MEDIDAS_POR_DEFECTO): number {
  return m.anchoInterior - 2;
}

/** Espacio para el celular dentro de la bandeja, entre sus costados. */
export function espacioCelular(m: MedidasCaja = MEDIDAS_POR_DEFECTO): number {
  return anchoBandeja(m) - 2 * m.carton;
}

/**
 * Bandeja desplegada: base al centro; frente (tope con ventana), fondo y
 * costados se doblan hacia arriba. En el costado derecho, los agujeros del
 * pasador; en el izquierdo, la muesca en el plano del tope.
 */
function bandeja(m: MedidasCaja): Omit<Pieza, 'x' | 'y'> {
  const b = anchoBandeja(m);
  const D = m.fondoBandeja;
  const H = m.alturaBandeja;
  const x0 = H; // la base empieza después del costado izquierdo
  const y0 = H; // y después del frente
  const formas: Forma[] = [
    // Base
    { tipo: 'rect', x: x0, y: y0, ancho: b, alto: D, trazo: 'doblez' },
    { tipo: 'texto', x: x0 + b / 2, y: y0 + D / 2 + 1.5, texto: 'Base de la bandeja', tam: 4, ancla: 'middle' },
    // Frente = tope (arriba en el dibujo): ventana dejando labio y postes
    { tipo: 'rect', x: x0, y: 0, ancho: b, alto: H, trazo: 'corte' },
    {
      tipo: 'rect',
      x: x0 + m.posteTope,
      y: 0,
      ancho: b - 2 * m.posteTope,
      alto: H - m.labioTope,
      trazo: 'corte',
    },
    { tipo: 'texto', x: x0 + b / 2, y: H / 2, texto: 'TOPE: la pantalla se apoya aquí', tam: 4, ancla: 'middle' },
    // Fondo (abajo en el dibujo)
    { tipo: 'rect', x: x0, y: y0 + D, ancho: b, alto: H, trazo: 'corte' },
    { tipo: 'texto', x: x0 + b / 2, y: y0 + D + H / 2, texto: 'Fondo (cuña o esponja detrás del celular)', tam: 3.5, ancla: 'middle' },
    // Costado izquierdo con muesca en el plano del tope (borde de arriba de la base = cara del tope)
    { tipo: 'rect', x: 0, y: y0, ancho: H, alto: D, trazo: 'corte' },
    {
      tipo: 'poligono',
      puntos: [
        [0, y0 - 3],
        [5, y0],
        [0, y0 + 3],
      ],
      trazo: 'corte',
    },
    { tipo: 'texto', x: H / 2, y: y0 + D / 2 + 1.5, texto: 'Izq.: muesca', tam: 3, ancla: 'middle' },
    // Costado derecho con dos agujeros del pasador
    { tipo: 'rect', x: x0 + b, y: y0, ancho: H, alto: D, trazo: 'corte' },
    ...[m.filaPares, m.filaImpares].map(
      (z): Forma => ({ tipo: 'circulo', x: x0 + b + z, y: y0 + m.pasadorDesdeTope, r: m.diametroPasador / 2, trazo: 'corte' }),
    ),
    { tipo: 'texto', x: x0 + b + H / 2, y: y0 + D - 2, texto: 'Der.: pasador', tam: 3, ancla: 'middle' },
  ];
  return { nombre: 'Bandeja', ancho: b + 2 * H, alto: D + 2 * H, formas };
}

export interface Plantilla {
  piezas: Pieza[];
  ancho: number;
  alto: number;
  dimensiones: DimensionesCaja;
  /** Datos con que se calculó, para la hoja de armado. */
  ranuras_mm: number[];
  e_mm: number;
  medidas: MedidasCaja;
}

/** Ubica todas las piezas en una hoja grande, una debajo de otra. */
export function generarPlantilla(caja: ConfigCaja, m: MedidasCaja = MEDIDAS_POR_DEFECTO): Plantilla {
  const margen = 10;
  const separacion = 12;
  const filas: Omit<Pieza, 'x' | 'y'>[][] = [
    [paredDerecha(caja, m)],
    [paredIzquierda(caja, m)],
    [reglaSuelta(caja, m)],
    [piso(caja, m)],
    [panelLentes('Panel de lentes (+3.00)', caja, m), tapaLentes(caja, m)],
    [apoyoCara(caja, m), panelTrasero(m)],
    [tapaSuperior(caja, m), separador(caja, m, 1), separador(caja, m, 2)],
    [tira()],
    [bandeja(m)],
  ];
  const piezas: Pieza[] = [];
  let y = margen;
  let ancho = 0;
  for (const fila of filas) {
    let x = margen;
    for (const p of fila) {
      piezas.push({ ...p, x, y });
      x += p.ancho + separacion;
    }
    ancho = Math.max(ancho, x - separacion + margen);
    y += Math.max(...fila.map((p) => p.alto)) + separacion;
  }
  return {
    piezas,
    ancho,
    alto: y - separacion + margen,
    dimensiones: dimensiones(caja, m),
    ranuras_mm: [...caja.ranuras_mm],
    e_mm: caja.e_mm,
    medidas: m,
  };
}

// --- SVG -----------------------------------------------------------------

const ESTILO: Record<Trazo, string> = {
  corte: 'fill="none" stroke="#000" stroke-width="0.4"',
  doblez: 'fill="none" stroke="#000" stroke-width="0.3" stroke-dasharray="3 2"',
  guia: 'fill="none" stroke="#999" stroke-width="0.25" stroke-dasharray="1 1.5"',
  marca: 'fill="none" stroke="#000" stroke-width="0.3"',
};

function escapar(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formaSvg(f: Forma, dx: number, dy: number): string {
  const n = (v: number) => r1(v).toString();
  switch (f.tipo) {
    case 'rect':
      return `<rect x="${n(f.x + dx)}" y="${n(f.y + dy)}" width="${n(f.ancho)}" height="${n(f.alto)}" ${f.relleno ? ESTILO[f.trazo].replace('fill="none"', `fill="${f.relleno}"`) : ESTILO[f.trazo]}/>`;
    case 'circulo':
      return `<circle cx="${n(f.x + dx)}" cy="${n(f.y + dy)}" r="${n(f.r)}" ${ESTILO[f.trazo]}/>`;
    case 'linea':
      return `<line x1="${n(f.x1 + dx)}" y1="${n(f.y1 + dy)}" x2="${n(f.x2 + dx)}" y2="${n(f.y2 + dy)}" ${ESTILO[f.trazo]}/>`;
    case 'poligono':
      return `<polygon points="${f.puntos.map(([x, y]) => `${n(x + dx)},${n(y + dy)}`).join(' ')}" ${ESTILO[f.trazo]}/>`;
    case 'texto':
      return `<text x="${n(f.x + dx)}" y="${n(f.y + dy)}" font-size="${f.tam}" text-anchor="${f.ancla ?? 'start'}" font-family="Arial, sans-serif">${escapar(f.texto)}</text>`;
  }
}

/** Regla de 10 cm con marcas cada cm, para comprobar que se imprimió al 100 %. */
function reglaCalibracion(x: number, y: number): string {
  const marcas = Array.from({ length: 11 }, (_, i) => {
    const xi = x + i * 10;
    return `<line x1="${xi}" y1="${y}" x2="${xi}" y2="${y + (i % 5 === 0 ? 5 : 3)}" stroke="#000" stroke-width="0.3"/><text x="${xi}" y="${y + 9}" font-size="3" text-anchor="middle" font-family="Arial, sans-serif">${i}</text>`;
  }).join('');
  return `<line x1="${x}" y1="${y}" x2="${x + 100}" y2="${y}" stroke="#000" stroke-width="0.4"/>${marcas}<text x="${x + 104}" y="${y + 4}" font-size="3.2" font-family="Arial, sans-serif">Debe medir 10 cm exactos</text>`;
}

function contenidoSvg(p: Plantilla): string {
  return p.piezas.flatMap((pz) => pz.formas.map((f) => formaSvg(f, pz.x, pz.y))).join('\n');
}

const AVISO = 'Imprimir sin ajustar a página (escala 100 %)';

function leyenda(x: number, y: number): string {
  return [
    `<line x1="${x}" y1="${y}" x2="${x + 10}" y2="${y}" ${ESTILO.corte}/><text x="${x + 12}" y="${y + 1}" font-size="3" font-family="Arial, sans-serif">cortar</text>`,
    `<line x1="${x + 30}" y1="${y}" x2="${x + 40}" y2="${y}" ${ESTILO.doblez}/><text x="${x + 42}" y="${y + 1}" font-size="3" font-family="Arial, sans-serif">doblar</text>`,
    `<line x1="${x + 60}" y1="${y}" x2="${x + 70}" y2="${y}" ${ESTILO.guia}/><text x="${x + 72}" y="${y + 1}" font-size="3" font-family="Arial, sans-serif">guía (no cortar)</text>`,
  ].join('');
}

/** Una sola hoja grande (para imprenta o plóter). */
export function plantillaSvg(p: Plantilla): string {
  const pie = 26;
  const ancho = Math.max(p.ancho, 200);
  const alto = p.alto + pie;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${r1(ancho)}mm" height="${r1(alto)}mm" viewBox="0 0 ${r1(ancho)} ${r1(alto)}">
<rect x="0" y="0" width="${r1(ancho)}" height="${r1(alto)}" fill="#fff"/>
${contenidoSvg(p)}
<text x="10" y="${r1(p.alto + 6)}" font-size="4.5" font-weight="bold" font-family="Arial, sans-serif">${AVISO}</text>
${reglaCalibracion(10, p.alto + 10)}
${leyenda(150, p.alto + 12)}
</svg>
`;
}

export interface Hoja {
  fila: number;
  columna: number;
  svg: string;
}

/**
 * La hoja grande partida en hojas A4 horizontales. Las hojas vecinas se
 * superponen 10 mm; una línea de unión punteada sale en las dos hojas para
 * pegarlas alineadas.
 */
export function hojasA4(p: Plantilla): Hoja[] {
  const pagina = { ancho: 297, alto: 210 };
  const margen = 10;
  const pie = 28;
  const ventana = { ancho: pagina.ancho - 2 * margen, alto: pagina.alto - margen - pie };
  const solape = 10;
  const paso = { x: ventana.ancho - solape, y: ventana.alto - solape };
  const columnas = Math.max(1, Math.ceil((p.ancho - solape) / paso.x));
  const filas = Math.max(1, Math.ceil((p.alto - solape) / paso.y));
  const contenido = contenidoSvg(p);

  // Líneas de unión: en el medio de cada franja superpuesta.
  const uniones = [
    ...Array.from({ length: columnas - 1 }, (_, c) => {
      const x = (c + 1) * paso.x + solape / 2;
      return `<line x1="${x}" y1="0" x2="${x}" y2="${r1(filas * paso.y + solape)}" stroke="#d00" stroke-width="0.3" stroke-dasharray="4 2"/>`;
    }),
    ...Array.from({ length: filas - 1 }, (_, f) => {
      const y = (f + 1) * paso.y + solape / 2;
      return `<line x1="0" y1="${y}" x2="${r1(columnas * paso.x + solape)}" y2="${y}" stroke="#d00" stroke-width="0.3" stroke-dasharray="4 2"/>`;
    }),
  ].join('\n');

  const total = filas * columnas;
  const hojas: Hoja[] = [];
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      const vx = c * paso.x;
      const vy = f * paso.y;
      const numero = f * columnas + c + 1;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${pagina.ancho}mm" height="${pagina.alto}mm" viewBox="0 0 ${pagina.ancho} ${pagina.alto}">
<rect x="0" y="0" width="${pagina.ancho}" height="${pagina.alto}" fill="#fff"/>
<svg x="${margen}" y="${margen}" width="${ventana.ancho}" height="${ventana.alto}" viewBox="${r1(vx)} ${r1(vy)} ${ventana.ancho} ${ventana.alto}">
${contenido}
${uniones}
</svg>
<rect x="${margen}" y="${margen}" width="${ventana.ancho}" height="${ventana.alto}" fill="none" stroke="#bbb" stroke-width="0.2"/>
<text x="${margen}" y="${pagina.alto - pie + 6}" font-size="4" font-weight="bold" font-family="Arial, sans-serif">${AVISO} · Hoja ${numero} de ${total} (fila ${f + 1}, columna ${c + 1})</text>
<text x="${margen}" y="${pagina.alto - pie + 11}" font-size="3" font-family="Arial, sans-serif">Une las hojas superponiendo la línea roja punteada de una con la de la vecina.</text>
${reglaCalibracion(margen, pagina.alto - pie + 15)}
${leyenda(160, pagina.alto - pie + 17)}
</svg>`;
      hojas.push({ fila: f + 1, columna: c + 1, svg });
    }
  }
  return hojas;
}

/** Para qué sirve cada pieza, con el mismo nombre que lleva en la plantilla. */
function piezasArmado(p: Plantilla): [string, string][] {
  const sep = coma(p.dimensiones.separador);
  return [
    ['Piso', 'La base. La bandeja se desliza encima.'],
    ['Pared derecha', 'Lleva los agujeros del pasador, R0 a R10, en dos filas: pares arriba, impares abajo.'],
    ['Pared izquierda', 'Lleva en su cara interior la regla R0 a R10, donde se alinea la muesca de la bandeja.'],
    [
      'Regla para la canaleta',
      'Repuesto de esa regla: se pega en el borde de arriba de la pared izquierda si la pared se arma con otro cartón.',
    ],
    [
      'Panel de lentes (+3.00)',
      'Sostiene los dos lentes de lectura de +3.00. Su centro marca el plano de los lentes, desde donde se miden todas las distancias.',
    ],
    ['Tapa +2.00', 'Lleva los lentes de +2.00. Se baja delante de los lentes de la caja solo cuando la app lo pide. Tiene dos salientes arriba, para que se apoye en S1 y S2 y quede a plomo, y una pestaña abajo para levantarla.'],
    ['Apoyo para la cara', `Donde el niño apoya la cara. Queda a ${coma(p.e_mm)} mm de los lentes.`],
    [
      'S1 y S2 (separadores)',
      `Dos tacos de ${sep} mm entre el panel de lentes y el apoyo para la cara, uno en cada extremo. Fijan esos ${coma(p.e_mm)} mm: si faltan o se aplastan, el ojo queda a otra distancia. Son más bajos que el panel (${coma(altoSeparador(p.medidas))} mm): los salientes de la tapa pasan por encima.`,
    ],
    ['Panel trasero', 'Cierra la caja por detrás de la bandeja.'],
    [
      'Tira de 40 cm',
      'Va aparte de la caja. Se pega sobre cartón rígido. Sirve para la prueba de cerca (de la mejilla al celular) y, con sus primeros 10 cm resaltados, para calibrar la pantalla.',
    ],
    ['Techo delantero', 'Empieza detrás del panel de lentes, para dejar libres la bisagra y el hueco de la tapa. Detrás queda abierta la canaleta, por donde sobresale el celular.'],
    [
      'Bandeja',
      'Lleva el celular: la pantalla se apoya contra el tope y la esponja va detrás. Se mueve de R0 a R10.',
    ],
  ];
}

/** Pasos de armado, en el orden en que se pegan las piezas. */
function pasosArmado(p: Plantilla): string[] {
  const m = p.medidas;
  const nUltima = p.ranuras_mm.length - 1;
  return [
    '<strong>Imprime y recorta.</strong> Imprime al 100 % y mide la regla de 10 cm de cada hoja. Une las hojas por la línea roja. Corta por las líneas negras continuas y marca los dobleces (líneas punteadas negras) sin cortarlos. Las líneas grises son guías: no se cortan.',
    `<strong>Haz los agujeros.</strong> Los del pasador (pared derecha y costado derecho de la bandeja), con un palito de ${coma(m.diametroPasador)} mm. Los de los lentes, en el panel de lentes y en la tapa +2.00.`,
    '<strong>Arma la bandeja.</strong> Dobla hacia arriba el tope, el fondo y los dos costados, y pega las esquinas. El tope (el lado con la ventana) va adelante, mirando a los lentes.',
    '<strong>Paredes al piso.</strong> Pega la pared derecha y la izquierda a los costados del piso. «Derecha» es la derecha del niño cuando mira por los lentes. La franja gris «Plano de los lentes» de las dos paredes va adelante, a la misma altura. La regla de la pared izquierda mira hacia adentro.',
    '<strong>Panel de lentes.</strong> Pégalo entre las paredes, justo sobre la franja gris «Plano de los lentes» (su cartón la cubre exacta). Coloca los lentes de +3.00 en sus agujeros.',
    '<strong>Panel trasero.</strong> Pégalo entre las paredes, al final.',
    '<strong>S1, S2 y apoyo para la cara.</strong> Pega S1 y S2 de pie en la cara del panel de lentes que mira al niño, uno en cada extremo, junto a las paredes. Son más bajos que el panel: no los alargues. Pega el apoyo para la cara a S1 y S2, con la muesca de la nariz abajo.',
    '<strong>Techo delantero.</strong> Pégalo sobre las paredes, empezando justo detrás del panel de lentes. No cubras la bisagra ni el hueco de la tapa. Detrás queda abierta la canaleta.',
    `<strong>Tapa +2.00.</strong> Refuerza los dos salientes de arriba con cinta (el cartón de 3 mm se dobla). Dobla la pestaña de abajo hacia el ojo. Pega la bisagra arriba del panel de lentes, del lado del niño, y coloca los lentes de +2.00. La tapa se mueve así: se levanta con la pestaña (se alcanza por la muesca de la nariz) y, al soltarla, baja sola delante de los lentes de la caja. <em>Cómo comprobar que asienta bien:</em> bájala; sus dos salientes deben quedar apoyados sobre S1 y S2, la tapa pegada al panel de lentes y sin inclinación, y los dos agujeros frente a los lentes de la caja. Debe subir y bajar sin rozar el apoyo ni el techo. Si queda inclinada, revisa que S1 y S2 midan ${coma(altoSeparador(m))} mm y que ningún pegamento sobresalga.`,
    '<strong>Mete la bandeja</strong> por la canaleta, con el tope hacia los lentes. Pon el celular sin funda, con la pantalla contra el tope y la esponja detrás y a los costados.',
    '<strong>Usa el pasador.</strong> Cuando la app diga «Pon el pasador en R4», desliza la bandeja hasta que su agujero quede frente al agujero R4 de la pared derecha y atraviesa los dos con el pasador. La bandeja tiene dos agujeros: usa el de la misma fila que el número (pares arriba, impares abajo). <em>Alternativa:</em> alinea la muesca de la bandeja con la marca R4 de la regla y sujétala con un clip.',
    '<strong>Tira de 40 cm.</strong> Recórtala y pégala sobre un cartón rígido del mismo tamaño. No va dentro de la caja: se usa para la prueba de cerca y para calibrar la pantalla (sus primeros 10 cm están resaltados).',
    `<strong>Comprueba las medidas.</strong> Con el pasador en R0, del plano de los lentes al tope debe haber ${coma(p.ranuras_mm[0])} mm; en R${nUltima}, ${coma(p.ranuras_mm[nUltima])} mm. Si no coincide, corrige esas distancias en la app: Configuración → Ajustes de la caja.`,
  ];
}

/** Dibujo de costado, sin escala: el orden de las piezas de adelante hacia atrás. */
function esquemaArmado(): string {
  const rect = (x: number, y: number, w: number, alto: number, color = '#fff') =>
    `<rect x="${x}" y="${y}" width="${w}" height="${alto}" fill="${color}" stroke="#000" stroke-width="0.4"/>`;
  const texto = (x: number, y: number, t: string, ancla = 'middle') =>
    `<text x="${x}" y="${y}" font-size="3" text-anchor="${ancla}" font-family="Arial, sans-serif">${t}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="130mm" height="48mm" viewBox="0 0 130 48">
${texto(4, 5, 'Vista de costado, sin escala. El niño mira desde la izquierda.', 'start')}
${rect(4, 16, 3, 24, '#dbeafe')}${texto(5.5, 14, 'Apoyo')}
${rect(7, 31, 11, 4, '#fde68a')}${texto(12.5, 29, 'S1/S2')}
${rect(18, 16, 3, 24)}${texto(19.5, 11, 'Lentes')}
<rect x="21" y="14" width="40" height="2" fill="#e5e7eb" stroke="#000" stroke-width="0.3"/>
${texto(41, 12, 'Techo delantero')}
${texto(72, 24, 'canaleta abierta')}
${rect(82, 27, 12, 13, '#fce7f3')}${texto(96, 38, 'Bandeja', 'start')}
<rect x="84" y="8" width="3" height="32" fill="#2563eb"/>
${texto(89, 10, 'celular', 'start')}
<circle cx="91" cy="32" r="1.2" fill="#000"/>
${texto(96, 32, 'pasador', 'start')}
${rect(122, 16, 3, 24)}${texto(123.5, 14, 'Trasero')}
<rect x="14" y="40" width="111" height="2" fill="#e5e7eb" stroke="#000" stroke-width="0.3"/>
<text x="70" y="46" font-size="3" text-anchor="middle" font-family="Arial, sans-serif">Piso, con las paredes a los costados</text>
</svg>`;
}

/** Hoja de armado: va después de la portada. */
export function hojaArmadoHtml(p: Plantilla): string {
  const filas = piezasArmado(p)
    .map(([nombre, uso]) => `<tr><th>${escapar(nombre)}</th><td>${escapar(uso)}</td></tr>`)
    .join('\n');
  const pasos = pasosArmado(p)
    .map((paso) => `<li>${paso}</li>`)
    .join('\n');
  return `<section class="hoja armado">
<h1>Cómo armar la caja</h1>
<div class="columnas">
<div>
<h2>Para qué sirve cada pieza</h2>
<table>
${filas}
</table>
${esquemaArmado()}
</div>
<div>
<h2>Pasos, en orden de pegado</h2>
<ol>
${pasos}
</ol>
</div>
</div>
</section>`;
}

/** Página HTML para imprimir las hojas A4 desde el navegador, una por página. */
export function plantillaHtml(p: Plantilla, titulo: string): string {
  const d = p.dimensiones;
  const hojas = hojasA4(p);
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${escapar(titulo)}</title>
<style>
  @page { size: A4 landscape; margin: 0; }
  body { margin: 0; font-family: Arial, sans-serif; }
  .portada { padding: 16mm; }
  .hoja { width: 297mm; height: 210mm; page-break-after: always; break-after: page; }
  .hoja svg { display: block; }
  .armado { box-sizing: border-box; padding: 9mm 11mm; font-size: 8.5pt; line-height: 1.25; }
  .armado h1 { font-size: 15pt; margin: 0 0 3mm; }
  .armado h2 { font-size: 10.5pt; margin: 0 0 2mm; }
  .armado .columnas { display: grid; grid-template-columns: 1fr 1.3fr; gap: 7mm; }
  .armado table { border-collapse: collapse; margin-bottom: 3mm; }
  .armado th, .armado td { text-align: left; vertical-align: top; padding: 0.7mm 1.4mm; border-bottom: 0.2mm solid #ccc; }
  .armado th { white-space: nowrap; }
  .armado ol { margin: 0; padding-left: 5mm; }
  .armado li { margin-bottom: 1mm; }
  @media screen { .hoja { margin: 8mm auto; box-shadow: 0 0 4px #999; } }
</style>
</head>
<body>
<section class="portada hoja">
<h1>${escapar(titulo)}</h1>
<p><strong>${AVISO}.</strong> Antes de cortar, mide la regla de 10 cm de cada hoja.</p>
<p>Medidas exteriores aproximadas: <strong>${coma(d.largoTotal)} × ${coma(d.anchoTotal)} × ${coma(d.altoTotal)} mm</strong> (largo con el apoyo para la cara × ancho × alto, sin contar el celular que sobresale).</p>
<p>Después de esta portada viene la hoja de armado, y luego ${hojas.length} hojas A4 horizontales con las piezas. También está la hoja grande en un solo archivo SVG para imprenta.</p>
</section>
${hojaArmadoHtml(p)}
${hojas.map((h) => `<section class="hoja">${h.svg}</section>`).join('\n')}
</body>
</html>
`;
}
