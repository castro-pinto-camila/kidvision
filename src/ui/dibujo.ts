/**
 * Dibujo en canvas. Se dibuja en píxeles CSS con medidas exactas (con
 * decimales) y el navegador suaviza los bordes: no se redondea el trazo,
 * para no cambiar el tamaño de la «E».
 */
import { etiquetaRayo } from '../logic/abanico';
import { barrasApinamiento, centrosLetras, medidasLinea, type Punto, type Rect } from '../core/disposicion';
import type { Direccion } from '../logic/orientaciones';

const NEGRO = '#000';
const BLANCO = '#fff';

/** Ajusta el canvas a los píxeles físicos y devuelve un contexto que dibuja en píxeles CSS. */
export function prepararLienzo(lienzo: HTMLCanvasElement, ancho: number, alto: number): CanvasRenderingContext2D {
  const dpr = window.devicePixelRatio || 1;
  lienzo.width = Math.round(ancho * dpr);
  lienzo.height = Math.round(alto * dpr);
  lienzo.style.width = `${ancho}px`;
  lienzo.style.height = `${alto}px`;
  const g = lienzo.getContext('2d')!;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.fillStyle = BLANCO;
  g.fillRect(0, 0, ancho, alto);
  return g;
}

export function pintar(g: CanvasRenderingContext2D, r: Rect, color = NEGRO): void {
  g.fillStyle = color;
  g.fillRect(r.x, r.y, r.ancho, r.alto);
}

const GIRO: Record<Direccion, number> = {
  derecha: 0,
  abajo: Math.PI / 2,
  izquierda: Math.PI,
  arriba: (3 * Math.PI) / 2,
};

/** «E» de 5 × 5 trazos y altura h, con las patas hacia `dir`. */
export function dibujarE(g: CanvasRenderingContext2D, c: Punto, h: number, dir: Direccion): void {
  const t = h / 5;
  g.save();
  g.translate(c.x, c.y);
  g.rotate(GIRO[dir]);
  g.fillStyle = NEGRO;
  g.fillRect(-h / 2, -h / 2, t, h);
  for (const fila of [0, 2, 4]) g.fillRect(-h / 2, -h / 2 + fila * t, h, t);
  g.restore();
}

/** Una letra grande (para la comprobación con la «D»). */
export function dibujarLetra(g: CanvasRenderingContext2D, letra: string, c: Punto, alto: number): void {
  g.save();
  g.fillStyle = NEGRO;
  g.font = `bold ${alto * 1.35}px system-ui, sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(letra, c.x, c.y);
  g.restore();
}

/**
 * Línea de cinco «E» con barras de apiñamiento. Debajo de la letra `actual`
 * va una marca para que el niño sepa cuál leer.
 */
export function dibujarLinea(
  g: CanvasRenderingContext2D,
  centro: Punto,
  h: number,
  orientaciones: Direccion[],
  actual: number | null,
  marcaMin: number,
): void {
  const letras = centrosLetras(centro, h);
  letras.forEach((p, i) => dibujarE(g, p, h, orientaciones[i]));
  for (const barra of barrasApinamiento(centro, h)) pintar(g, barra);
  if (actual !== null && actual < letras.length) {
    const ancho = Math.max(h, marcaMin);
    const alto = Math.max(h / 5, marcaMin / 4);
    const y = centro.y + medidasLinea(h).alto / 2 + Math.max(h / 2, marcaMin / 2);
    pintar(g, { x: letras[actual].x - ancho / 2, y, ancho, alto });
  }
}

/** Círculo lleno: la figura que mira el niño durante el minuto con los lentes de +2.00. */
export function dibujarCirculo(g: CanvasRenderingContext2D, c: Punto, radio: number, color: string): void {
  g.save();
  g.fillStyle = color;
  g.beginPath();
  g.arc(c.x, c.y, radio, 0, 2 * Math.PI);
  g.fill();
  g.restore();
}

/**
 * Carta de abanico: 12 rayos gruesos (6 líneas numeradas del 1 al 6, el mismo número en los dos extremos), girada
 * `rotacion` grados en sentido antihorario. Los bordes de cada rayo se
 * suavizan con trazos más anchos y más claros, para que los rayos diagonales
 * no se vean más grises que los verticales por el escalonado de los píxeles.
 */
export function dibujarAbanico(
  g: CanvasRenderingContext2D,
  centro: Punto,
  radio: number,
  rotacion: number,
  grosor: number,
): void {
  g.save();
  g.fillStyle = NEGRO;
  g.lineCap = 'butt';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `bold ${Math.round(radio * 0.13)}px system-ui, sans-serif`;
  const borde = grosor * 0.35;
  const pasadas: [number, number][] = [
    [grosor + 2 * borde, 0.25],
    [grosor + borde, 0.5],
    [grosor, 1],
  ];
  for (let hora = 1; hora <= 12; hora++) {
    const a = ((90 - 30 * hora + rotacion) * Math.PI) / 180;
    const dx = Math.cos(a);
    const dy = -Math.sin(a);
    for (const [ancho, opacidad] of pasadas) {
      g.strokeStyle = `rgba(0, 0, 0, ${opacidad})`;
      g.lineWidth = ancho;
      g.beginPath();
      g.moveTo(centro.x + dx * radio * 0.12, centro.y + dy * radio * 0.12);
      g.lineTo(centro.x + dx * radio * 0.76, centro.y + dy * radio * 0.76);
      g.stroke();
    }
    g.fillText(String(etiquetaRayo(hora)), centro.x + dx * radio * 0.9, centro.y + dy * radio * 0.9);
  }
  g.restore();
}
