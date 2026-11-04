/**
 * Calibración de la pantalla en 3 pasos:
 *   1. ajustar un rectángulo al ancho del DNI,
 *   2. comprobar con una regla que una línea mide 10 cm,
 *   3. guardar y confirmarlo con claridad.
 * Nada se guarda hasta que el docente confirma la regla.
 */
import { ranuras } from '../core/caja';
import { esDibujable, nivelPorNombre } from '../core/optotipos';
import type { Configuracion } from '../data/config';
import { h } from './dom';

/** Ancho de un DNI o tarjeta bancaria (ISO/IEC 7810 ID-1). */
export const ANCHO_TARJETA_MM = 85.6;
const ALTO_TARJETA_MM = 53.98;
/** Valor inicial típico de un celular, antes de calibrar. */
const PX_POR_MM_INICIAL = 6.3;
/** Paso de los botones − / + (en píxeles del ancho del rectángulo). */
const PASO_FINO_PX = 0.5;

const SVG = 'http://www.w3.org/2000/svg';

/** Dibujo de un DNI dentro del rectángulo: muestra que los bordes van al ras. */
function dibujoDni(): SVGSVGElement {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 856 540');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('class', 'dni');
  svg.innerHTML = `
    <rect x="4" y="4" width="848" height="532" rx="34" fill="none" stroke="currentColor" stroke-width="6" stroke-dasharray="22 14"/>
    <rect x="60" y="130" width="190" height="240" rx="16" fill="currentColor" opacity="0.18"/>
    <rect x="300" y="150" width="380" height="34" rx="10" fill="currentColor" opacity="0.18"/>
    <rect x="300" y="220" width="300" height="34" rx="10" fill="currentColor" opacity="0.18"/>
    <rect x="300" y="290" width="340" height="34" rx="10" fill="currentColor" opacity="0.18"/>
    <text x="428" y="470" text-anchor="middle" font-size="44" fill="currentColor">Tu DNI aquí, bordes al ras</text>`;
  return svg;
}

export function montarCalibracion(
  raiz: HTMLElement,
  config: Configuracion,
  guardar: (c: Configuracion) => Promise<void>,
  terminar: () => void,
): () => void {
  let px = config.pxPorMm ?? PX_POR_MM_INICIAL;
  let paso: 1 | 2 | 3 = 1;
  let error = '';

  const anchoRect = () => px * ANCHO_TARJETA_MM;
  const ampliada = () => (window.visualViewport?.scale ?? 1) > 1.01;

  function pasos(): HTMLElement {
    const nombres = ['Ajustar', 'Medir', 'Listo'];
    return h(
      'ol',
      { class: 'pasos' },
      ...nombres.map((n, i) =>
        h('li', { class: i + 1 === paso ? 'actual' : i + 1 < paso ? 'hecho' : '' }, h('span', { class: 'numero' }, i + 1), n),
      ),
    );
  }

  function avisos(): (HTMLElement | false)[] {
    return [
      ampliada() && h('p', { class: 'aviso' }, 'La página está ampliada. Aléjala con dos dedos antes de calibrar.'),
      (paso === 1 ? anchoRect() : px * 100) > window.innerWidth - 24 &&
        h(
          'p',
          { class: 'aviso' },
          paso === 1
            ? 'Gira el celular a horizontal para ver el rectángulo completo.'
            : 'Gira el celular a horizontal para ver la línea completa.',
        ),
    ];
  }

  function paso1(): HTMLElement[] {
    const tarjeta = h('div', { class: 'tarjeta', style: `width:${anchoRect()}px;height:${px * ALTO_TARJETA_MM}px` });
    tarjeta.append(dibujoDni());
    const deslizador = h('input', {
      type: 'range',
      class: 'deslizador',
      min: 200,
      max: 1400,
      step: PASO_FINO_PX,
      value: anchoRect(),
      'aria-label': 'Ancho del rectángulo',
    });
    const ajustar = (ancho: number) => {
      px = Math.max(1, ancho / ANCHO_TARJETA_MM);
      tarjeta.style.width = `${anchoRect()}px`;
      tarjeta.style.height = `${px * ALTO_TARJETA_MM}px`;
      deslizador.value = String(anchoRect());
    };
    deslizador.addEventListener('input', () => ajustar(Number(deslizador.value)));
    return [
      h(
        'p',
        { class: 'instruccion' },
        'Apoya tu DNI (o una tarjeta bancaria) sobre el rectángulo. Ajusta hasta que los bordes izquierdo y derecho de la tarjeta queden al ras con los del rectángulo.',
      ),
      h('p', { class: 'nota' }, 'Antes, mide tu DNI con una regla: debe medir 8,56 cm de ancho.'),
      ...avisos().filter((x): x is HTMLElement => x !== false),
      tarjeta,
      h(
        'div',
        { class: 'fila-botones' },
        h('button', { class: 'boton', 'aria-label': 'Más angosto', onclick: () => ajustar(anchoRect() - PASO_FINO_PX) }, '−'),
        deslizador,
        h('button', { class: 'boton', 'aria-label': 'Más ancho', onclick: () => ajustar(anchoRect() + PASO_FINO_PX) }, '+'),
      ),
      h(
        'button',
        {
          class: 'boton principal',
          onclick: () => {
            paso = 2;
            mostrar();
          },
        },
        'Siguiente: medir con regla →',
      ),
    ];
  }

  function paso2(): HTMLElement[] {
    const regla = h(
      'div',
      { class: 'regla', style: `width:${px * 100}px;background-size:${px * 10}px 100%` },
      ...Array.from({ length: 11 }, (_, cm) => h('span', { class: 'cm', style: `left:${px * 10 * cm}px` }, cm)),
    );
    return [
      h('p', { class: 'instruccion' }, 'Mide esta línea con una regla, del 0 al 10. ¿Mide 10 cm?'),
      ...avisos().filter((x): x is HTMLElement => x !== false),
      regla,
      error && h('p', { class: 'aviso' }, error),
      h(
        'button',
        {
          class: 'boton principal',
          onclick: async () => {
            const nueva: Configuracion = { ...config, pxPorMm: px, dprCalibracion: window.devicePixelRatio || 1 };
            try {
              await guardar(nueva);
              config = nueva;
              error = '';
              paso = 3;
            } catch {
              error = 'No se pudo guardar. Vuelve a intentarlo.';
            }
            mostrar();
          },
        },
        'Sí, mide 10 cm: guardar',
      ),
      h(
        'button',
        {
          class: 'boton',
          onclick: () => {
            paso = 1;
            mostrar();
          },
        },
        'No, volver a ajustar',
      ),
    ].filter((x): x is HTMLElement => x instanceof HTMLElement);
  }

  function paso3(): HTMLElement[] {
    const pantalla = { pxPorMm: px, dpr: window.devicePixelRatio || 1 };
    const sirve = esDibujable(nivelPorNombre('6/9'), ranuras(config.caja)[0], pantalla);
    return [
      h('div', { class: 'confirmacion' }, h('span', { class: 'check', 'aria-hidden': 'true' }, '✓'), 'Calibración guardada'),
      h(
        'div',
        { class: `veredicto ${sirve ? 'ok' : 'mal'}` },
        sirve
          ? 'Tu celular sirve para la prueba.'
          : 'Tu celular NO sirve para la prueba: su pantalla no puede dibujar la línea 6/9. Usa un celular con mejor pantalla.',
      ),
      h('button', { class: 'boton principal', onclick: terminar }, 'Listo'),
    ];
  }

  function mostrar(): void {
    const contenido = paso === 1 ? paso1() : paso === 2 ? paso2() : paso3();
    raiz.replaceChildren(
      h(
        'main',
        { class: 'pagina calibracion' },
        h(
          'header',
          { class: 'cabecera' },
          paso !== 3 && h('button', { class: 'boton secundario', onclick: terminar }, '← Cancelar'),
          h('h1', {}, 'Calibrar la pantalla'),
        ),
        pasos(),
        ...contenido,
      ),
    );
  }

  mostrar();
  window.addEventListener('resize', mostrar);
  window.visualViewport?.addEventListener('resize', mostrar);
  return () => {
    window.removeEventListener('resize', mostrar);
    window.visualViewport?.removeEventListener('resize', mostrar);
  };
}
