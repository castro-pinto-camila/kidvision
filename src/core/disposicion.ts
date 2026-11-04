/**
 * Dónde va cada cosa en la pantalla durante la prueba. Medidas en píxeles CSS,
 * con el celular horizontal. El niño mira la pantalla de frente: su ojo
 * derecho ve la mitad derecha.
 */

export type LadoFranja = 'arriba' | 'abajo' | 'izquierda' | 'derecha';

export interface Franja {
  lado: LadoFranja;
  ancho_mm: number;
}

export interface Rect {
  x: number;
  y: number;
  ancho: number;
  alto: number;
}

export interface Punto {
  x: number;
  y: number;
}

export interface Vista {
  ancho: number;
  alto: number;
}

export interface Disposicion {
  /** Franja de botones del docente, fuera de la caja. */
  franja: Rect;
  /** Zona que ve el ojo evaluado (su mitad de pantalla, sin la franja). */
  zona: Rect;
  /** Mitad que se pinta de negro; null en la prueba de cerca. */
  negro: Rect | null;
  /** Centro de las «E» y del abanico. */
  centro: Punto;
}

/** Separación entre letras y entre la línea y las barras: un ancho de letra. Barras: un trazo. */
const SEPARACION = 1;
const BARRA = 1 / 5;

/** Ancho y alto de una línea de cinco «E» de altura h, con sus barras de apiñamiento. */
export function medidasLinea(h: number): { ancho: number; alto: number } {
  const margen = 2 * (SEPARACION + BARRA) * h;
  return { ancho: (5 + 4 * SEPARACION) * h + margen, alto: h + margen };
}

/** Centros de las cinco «E». */
export function centrosLetras(centro: Punto, h: number): Punto[] {
  const paso = (1 + SEPARACION) * h;
  return [-2, -1, 0, 1, 2].map((i) => ({ x: centro.x + i * paso, y: centro.y }));
}

/** Las cuatro barras de apiñamiento (arriba, abajo, izquierda, derecha). */
export function barrasApinamiento(centro: Punto, h: number): Rect[] {
  const { ancho, alto } = medidasLinea(h);
  const g = BARRA * h;
  const x0 = centro.x - ancho / 2;
  const y0 = centro.y - alto / 2;
  return [
    { x: x0, y: y0, ancho, alto: g },
    { x: x0, y: y0 + alto - g, ancho, alto: g },
    { x: x0, y: y0, ancho: g, alto },
    { x: x0 + ancho - g, y: y0, ancho: g, alto },
  ];
}

function franjaRect(vista: Vista, f: Franja, pxPorMm: number): Rect {
  const a = f.ancho_mm * pxPorMm;
  switch (f.lado) {
    case 'arriba':
      return { x: 0, y: 0, ancho: vista.ancho, alto: a };
    case 'abajo':
      return { x: 0, y: vista.alto - a, ancho: vista.ancho, alto: a };
    case 'izquierda':
      return { x: 0, y: 0, ancho: a, alto: vista.alto };
    case 'derecha':
      return { x: vista.ancho - a, y: 0, ancho: a, alto: vista.alto };
  }
}

function interseccion(a: Rect, b: Rect): Rect {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const ancho = Math.max(0, Math.min(a.x + a.ancho, b.x + b.ancho) - x);
  const alto = Math.max(0, Math.min(a.y + a.alto, b.y + b.alto) - y);
  return { x, y, ancho, alto };
}

/** Pantalla sin la franja. */
function areaLibre(vista: Vista, franja: Rect, lado: LadoFranja): Rect {
  const todo = { x: 0, y: 0, ancho: vista.ancho, alto: vista.alto };
  switch (lado) {
    case 'arriba':
      return { ...todo, y: franja.alto, alto: vista.alto - franja.alto };
    case 'abajo':
      return { ...todo, alto: vista.alto - franja.alto };
    case 'izquierda':
      return { ...todo, x: franja.ancho, ancho: vista.ancho - franja.ancho };
    case 'derecha':
      return { ...todo, ancho: vista.ancho - franja.ancho };
  }
}

/**
 * @param ojo 'OD' u 'OI' dentro de la caja; null para la prueba de cerca (pantalla completa).
 * @param lente_mm distancia del centro de la pantalla al centro del lente.
 */
export function disponer(
  vista: Vista,
  pxPorMm: number,
  ojo: 'OD' | 'OI' | null,
  lente_mm: number,
  franja: Franja,
): Disposicion {
  const fr = franjaRect(vista, franja, pxPorMm);
  const libre = areaLibre(vista, fr, franja.lado);
  if (ojo === null) {
    return {
      franja: fr,
      zona: libre,
      negro: null,
      centro: { x: libre.x + libre.ancho / 2, y: libre.y + libre.alto / 2 },
    };
  }
  const mitad = vista.ancho / 2;
  const derecha: Rect = { x: mitad, y: 0, ancho: mitad, alto: vista.alto };
  const izquierda: Rect = { x: 0, y: 0, ancho: mitad, alto: vista.alto };
  const propia = ojo === 'OD' ? derecha : izquierda;
  const desplazamiento = lente_mm * pxPorMm * (ojo === 'OD' ? 1 : -1);
  return {
    franja: fr,
    zona: interseccion(propia, libre),
    negro: ojo === 'OD' ? izquierda : derecha,
    centro: { x: mitad + desplazamiento, y: vista.alto / 2 },
  };
}

/** ¿Cabe un rectángulo de ese tamaño, centrado en `centro`, dentro de `zona`? */
export function cabe(medidas: { ancho: number; alto: number }, centro: Punto, zona: Rect): boolean {
  const eps = 1e-9;
  return (
    centro.x - medidas.ancho / 2 >= zona.x - eps &&
    centro.x + medidas.ancho / 2 <= zona.x + zona.ancho + eps &&
    centro.y - medidas.alto / 2 >= zona.y - eps &&
    centro.y + medidas.alto / 2 <= zona.y + zona.alto + eps
  );
}

export type Giro = 0 | 90 | 180 | 270;

export interface GiroPantalla {
  /** Medidas del dibujo, siempre horizontal (ancho ≥ alto). */
  ancho: number;
  alto: number;
  giro: Giro;
  /** Transformación CSS para un contenedor de ancho × alto ubicado arriba a la izquierda. */
  transform: string;
}

/**
 * La prueba se dibuja siempre horizontal. Si el celular está vertical (por
 * ejemplo, porque no se pudo bloquear el giro), el dibujo se gira 90°.
 * `invertir` lo gira 180° más, por si el celular quedó de cabeza en la caja.
 */
export function girarPantalla(vista: Vista, invertir: boolean): GiroPantalla {
  const vertical = vista.alto > vista.ancho;
  const giro = (((vertical ? 90 : 0) + (invertir ? 180 : 0)) % 360) as Giro;
  const ancho = vertical ? vista.alto : vista.ancho;
  const alto = vertical ? vista.ancho : vista.alto;
  const transform: Record<Giro, string> = {
    0: 'none',
    90: `translate(${vista.ancho}px, 0px) rotate(90deg)`,
    180: `translate(${vista.ancho}px, ${vista.alto}px) rotate(180deg)`,
    270: `translate(0px, ${vista.alto}px) rotate(270deg)`,
  };
  return { ancho, alto, giro, transform: transform[giro] };
}

/** Dónde cae en la pantalla física un punto del dibujo (la misma cuenta que hace el CSS). */
export function aPantallaFisica(p: Punto, giro: Giro, vista: Vista): Punto {
  switch (giro) {
    case 0:
      return p;
    case 90:
      return { x: vista.ancho - p.y, y: p.x };
    case 180:
      return { x: vista.ancho - p.x, y: vista.alto - p.y };
    case 270:
      return { x: p.y, y: vista.alto - p.x };
  }
}

/** Qué mitad de pantalla le toca a cada ojo, por si la caja quedó al revés. */
export function ojoEnPantalla(ojo: 'OD' | 'OI', intercambiar: boolean): 'OD' | 'OI' {
  if (!intercambiar) return ojo;
  return ojo === 'OD' ? 'OI' : 'OD';
}
