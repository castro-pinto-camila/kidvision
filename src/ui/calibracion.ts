/**
 * Calibración de la pantalla en un solo paso: se elige una referencia de
 * tamaño conocido (DNI o tarjeta, regla del kit o regla común) y se arrastra
 * el punto azul hasta que la referencia coincida con el dibujo. Se guarda con
 * la huella de la pantalla; si cambia el zoom o la pantalla, se vuelve a pedir.
 */
import { ranuras } from '../core/caja';
import { esDibujable, nivelPorNombre } from '../core/optotipos';
import type { Configuracion } from '../data/config';
import {
  anchoReferenciaPx,
  pxPorMmDesdeAncho,
  referenciaPorId,
  REFERENCIAS,
  valorInicial,
  type IdReferencia,
} from '../logic/calibracion';
import { esAppInstalada, huellaActual } from './dispositivo';
import { h } from './dom';
import { icono } from './iconos';

/** Paso fino de los botones − / +, en píxeles de ancho. */
const PASO_FINO_PX = 0.5;
const ANCHO_MINIMO_PX = 120;
const ALTO_TARJETA_MM = 53.98;

const SVG = 'http://www.w3.org/2000/svg';

/** Dibujo de un DNI dentro del rectángulo: muestra que los bordes van al ras. */
function dibujoDni(): SVGSVGElement {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 856 540');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('class', 'dni');
  svg.innerHTML = `
    <rect x="4" y="4" width="848" height="532" rx="34" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="10 7" vector-effect="non-scaling-stroke"/>
    <rect x="60" y="130" width="190" height="240" rx="16" fill="currentColor" opacity="0.18"/>
    <rect x="300" y="150" width="380" height="34" rx="10" fill="currentColor" opacity="0.18"/>
    <rect x="300" y="220" width="300" height="34" rx="10" fill="currentColor" opacity="0.18"/>
    <rect x="300" y="290" width="340" height="34" rx="10" fill="currentColor" opacity="0.18"/>
    <text x="428" y="470" text-anchor="middle" font-size="44" fill="currentColor">Tu DNI aquí, bordes al ras</text>`;
  return svg;
}

/** Quita los «false» y textos vacíos de una lista de hijos. */
const soloElementos = (lista: unknown[]): HTMLElement[] => lista.filter((x): x is HTMLElement => x instanceof HTMLElement);

export function montarCalibracion(
  raiz: HTMLElement,
  config: Configuracion,
  guardar: (c: Configuracion) => Promise<void>,
  terminar: () => void,
): () => void {
  const esIphone = /iPhone|iPad|iPod/.test(navigator.userAgent);
  let id: IdReferencia = 'tarjeta';
  let px = valorInicial(config.pxPorMm, esIphone);
  let paso: 1 | 2 = 1;
  let error = '';

  const ref = () => referenciaPorId(id);
  const anchoRef = () => anchoReferenciaPx(ref(), px);
  const ampliada = () => (window.visualViewport?.scale ?? 1) > 1.01;

  function pasos(): HTMLElement {
    return h(
      'ol',
      { class: 'pasos' },
      ...['Ajustar', 'Listo'].map((n, i) =>
        h('li', { class: i + 1 === paso ? 'actual' : i + 1 < paso ? 'hecho' : '' }, h('span', { class: 'numero' }, i + 1), n),
      ),
    );
  }

  function avisos(): HTMLElement[] {
    const lista: HTMLElement[] = [];
    if (ampliada()) lista.push(h('p', { class: 'aviso' }, 'La página está ampliada. Aléjala con dos dedos antes de calibrar.'));
    if (anchoRef() > window.innerWidth - 40) {
      lista.push(h('p', { class: 'aviso' }, 'Gira el celular a horizontal para ver la referencia completa.'));
    }
    return lista;
  }

  /** Lo que se dibuja según la referencia: el rectángulo de la tarjeta o la línea de 10 cm. */
  function dibujoReferencia(): HTMLElement {
    const r = ref();
    if (r.id === 'tarjeta') {
      const t = h('div', { class: 'tarjeta' });
      t.append(dibujoDni());
      return t;
    }
    return h(
      'div',
      { class: `regla ${r.id === 'regla-kit' ? 'kit' : ''}` },
      ...Array.from({ length: 11 }, (_, cm) => h('span', { class: 'cm', style: `left:${cm * 10}%` }, cm)),
    );
  }

  function paso1(): HTMLElement[] {
    const marco = h('div', { class: 'referencia' }, dibujoReferencia());
    const asa = h('div', { class: 'asa', role: 'slider', 'aria-label': 'Ajustar el tamaño', tabindex: 0 });
    marco.append(asa);

    const aplicar = () => {
      marco.style.width = `${anchoRef()}px`;
      marco.style.height = id === 'tarjeta' ? `${px * ALTO_TARJETA_MM}px` : '';
      const regla = marco.querySelector<HTMLElement>('.regla');
      if (regla) regla.style.backgroundSize = `${anchoRef() / 10}px 100%`;
    };
    const fijarAncho = (ancho: number) => {
      const maximo = Math.max(ANCHO_MINIMO_PX, window.innerWidth - 24);
      px = pxPorMmDesdeAncho(ref(), Math.min(Math.max(ancho, ANCHO_MINIMO_PX), maximo));
      aplicar();
    };
    aplicar();

    asa.addEventListener('pointerdown', (e) => {
      asa.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    asa.addEventListener('pointermove', (e) => {
      if (!asa.hasPointerCapture(e.pointerId)) return;
      fijarAncho(e.clientX - marco.getBoundingClientRect().left);
    });
    asa.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') fijarAncho(anchoRef() - PASO_FINO_PX);
      if (e.key === 'ArrowRight') fijarAncho(anchoRef() + PASO_FINO_PX);
    });

    return soloElementos([
      h(
        'div',
        { class: 'selector-referencia', role: 'group', 'aria-label': 'Con qué calibras' },
        ...REFERENCIAS.map((r) =>
          h(
            'button',
            {
              class: r.id === id ? 'boton principal' : 'boton',
              'aria-pressed': r.id === id,
              onclick: () => {
                // Cambiar de referencia conserva la escala (px por mm): solo cambia lo que se dibuja.
                id = r.id;
                mostrar();
              },
            },
            r.nombre,
          ),
        ),
      ),
      h('p', { class: 'instruccion' }, ref().instruccion),
      ...avisos(),
      marco,
      h(
        'div',
        { class: 'fila-botones' },
        h('button', { class: 'boton', 'aria-label': 'Más angosto', onclick: () => fijarAncho(anchoRef() - PASO_FINO_PX) }, '−'),
        h('span', { class: 'nota' }, 'Ajuste fino'),
        h('button', { class: 'boton', 'aria-label': 'Más ancho', onclick: () => fijarAncho(anchoRef() + PASO_FINO_PX) }, '+'),
      ),
      error && h('p', { class: 'aviso' }, error),
      h(
        'button',
        {
          class: 'boton principal',
          onclick: async () => {
            if (ampliada()) {
              error = 'Aleja la página con dos dedos antes de guardar.';
              mostrar();
              return;
            }
            const huella = huellaActual();
            const nueva: Configuracion = { ...config, pxPorMm: px, dprCalibracion: huella.dpr, huella };
            try {
              await guardar(nueva);
              config = nueva;
              error = '';
              paso = 2;
            } catch {
              error = 'No se pudo guardar. Vuelve a intentarlo.';
            }
            mostrar();
          },
        },
        icono('check'),
        'Ya coincide: guardar',
      ),
    ]);
  }

  function paso2(): HTMLElement[] {
    const pantalla = { pxPorMm: px, dpr: window.devicePixelRatio || 1 };
    const sirve = esDibujable(nivelPorNombre('6/9'), ranuras(config.caja)[0], pantalla);
    const instalada = esAppInstalada();
    return soloElementos([
      h('div', { class: 'confirmacion', role: 'status' }, h('span', { class: 'check' }, icono('check')), 'Calibración guardada'),
      h(
        'div',
        { class: `veredicto ${sirve ? 'ok' : 'mal'}` },
        sirve
          ? 'Tu celular sirve para la prueba.'
          : 'La pantalla no alcanza a dibujar la línea 6/9. Casi siempre es un error al calibrar: vuelve a calibrar con cuidado. Si sigue igual, usa otro celular.',
      ),
      h(
        'p',
        { class: 'aviso' },
        instalada
          ? 'Calibraste dentro de la app instalada. Si abres KidVision desde el navegador, ahí tendrás que calibrar de nuevo.'
          : 'Calibraste en el navegador. Si instalas KidVision en la pantalla de inicio, esa app guarda sus datos aparte: tendrás que calibrar de nuevo dentro de ella, y también poner el colegio.',
      ),
      !sirve &&
        h(
          'button',
          {
            class: 'boton principal',
            onclick: () => {
              paso = 1;
              mostrar();
            },
          },
          'Volver a calibrar',
        ),
      h('button', { class: sirve ? 'boton principal' : 'boton', onclick: terminar }, sirve ? 'Listo' : 'Salir'),
    ]);
  }

  function mostrar(): void {
    const contenido = paso === 1 ? paso1() : paso2();
    raiz.replaceChildren(
      h(
        'main',
        { class: 'pagina calibracion' },
        h(
          'header',
          { class: 'cabecera' },
          paso !== 2 && h('button', { class: 'boton secundario', 'aria-label': 'Cancelar', onclick: terminar }, icono('atras')),
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
