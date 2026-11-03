/**
 * Pantalla de configuración: calibración con tarjeta, caja, franja y verificación.
 * Cada cambio se guarda solo.
 */
import { crearCaja, ranuras } from '../core/caja';
import { cabe, disponer, medidasLinea, type LadoFranja } from '../core/disposicion';
import {
  alturaOptotipoMm,
  esDibujable,
  NIVELES,
  nivelesDibujables,
  nivelObjetivo,
  nivelPorNombre,
  type Pantalla,
} from '../core/optotipos';
import type { Configuracion } from '../data/config';
import { h } from './dom';
import { textoDioptrias } from './textos';

/** Ancho de un DNI o tarjeta bancaria (ISO/IEC 7810 ID-1). */
export const ANCHO_TARJETA_MM = 85.6;
const ALTO_TARJETA_MM = 53.98;
/** Valor inicial típico de un celular, antes de calibrar. */
const PX_POR_MM_INICIAL = 6.3;

const coma = (n: number, decimales = 1) => n.toFixed(decimales).replace('.', ',');

function leerNumero(texto: string): number {
  return Number.parseFloat(texto.replace(',', '.'));
}

export function montarConfiguracion(
  raiz: HTMLElement,
  config: Configuracion,
  guardar: (c: Configuracion) => Promise<void>,
  volver: () => void,
): () => void {
  const c: Configuracion = structuredClone(config);
  let pxCalibracion = c.pxPorMm ?? PX_POR_MM_INICIAL;
  const estadoGuardado = h('span', { class: 'guardado' });

  async function guardarYActualizar(): Promise<void> {
    actualizar();
    try {
      await guardar(c);
      estadoGuardado.textContent = 'Guardado ✓';
    } catch {
      estadoGuardado.textContent = 'No se pudo guardar';
    }
  }

  // --- Calibración ---------------------------------------------------------
  const tarjeta = h('div', { class: 'tarjeta' });
  const regla = h('div', { class: 'regla' });
  const textoCalibracion = h('p', { class: 'nota' });
  const avisoGirarCal = h('p', { class: 'aviso' });

  function ajustar(deltaPx: number): void {
    const ancho = pxCalibracion * ANCHO_TARJETA_MM + deltaPx;
    pxCalibracion = Math.max(1, ancho / ANCHO_TARJETA_MM);
    c.pxPorMm = pxCalibracion;
    void guardarYActualizar();
  }

  const calibracion = h(
    'section',
    {},
    h('h2', {}, '1. Calibrar la pantalla'),
    h(
      'p',
      {},
      'Apoya un DNI o una tarjeta bancaria sobre el rectángulo azul. Ajusta con los botones hasta que el rectángulo tenga el mismo ancho que la tarjeta.',
    ),
    avisoGirarCal,
    tarjeta,
    h(
      'div',
      { class: 'fila-botones' },
      h('button', { class: 'boton', onclick: () => ajustar(-10) }, '− −'),
      h('button', { class: 'boton', onclick: () => ajustar(-1) }, '−'),
      h('button', { class: 'boton', onclick: () => ajustar(1) }, '+'),
      h('button', { class: 'boton', onclick: () => ajustar(10) }, '+ +'),
    ),
    h('button', { class: 'boton principal', onclick: () => ajustar(0) }, 'Ya coincide: guardar'),
    textoCalibracion,
    h('p', {}, 'Comprueba con una regla: esta línea debe medir 10 cm.'),
    regla,
  );

  // --- Caja ----------------------------------------------------------------
  function campo(
    etiqueta: string,
    valor: number,
    unidad: string,
    aplicar: (n: number) => boolean,
  ): HTMLElement {
    const decimales = unidad === 'D' ? 2 : 1;
    let vigente = valor;
    const entrada = h('input', { type: 'text', inputmode: 'decimal', value: coma(valor, decimales) });
    entrada.addEventListener('change', () => {
      const n = leerNumero(entrada.value);
      if (Number.isFinite(n) && aplicar(n)) {
        vigente = n;
        void guardarYActualizar();
      }
      entrada.value = coma(vigente, decimales);
    });
    return h('label', { class: 'campo' }, h('span', {}, etiqueta), entrada, h('span', { class: 'unidad' }, unidad));
  }

  const camposRanuras = h('div', { class: 'ranuras' });
  function dibujarCamposRanuras(): void {
    camposRanuras.replaceChildren(
      ...c.caja.ranuras_mm.map((d, i) =>
        campo(`R${i}`, d, 'mm', (n) => {
          if (n <= 0) return false;
          c.caja.ranuras_mm[i] = n;
          return true;
        }),
      ),
    );
  }
  dibujarCamposRanuras();

  const selectorUmbral = h(
    'select',
    {},
    h('option', { value: '6/9', selected: c.umbralCorte === '6/9' }, '6/9 (recomendado por la IAPB)'),
    h('option', { value: '6/12', selected: c.umbralCorte === '6/12' }, '6/12'),
  );
  selectorUmbral.addEventListener('change', () => {
    c.umbralCorte = selectorUmbral.value as Configuracion['umbralCorte'];
    void guardarYActualizar();
  });

  const LADOS: [LadoFranja, string][] = [
    ['arriba', 'Arriba'],
    ['abajo', 'Abajo'],
    ['izquierda', 'Izquierda'],
    ['derecha', 'Derecha'],
  ];
  const selectorLado = h(
    'select',
    {},
    ...LADOS.map(([v, t]) => h('option', { value: v, selected: c.franja.lado === v }, t)),
  );
  selectorLado.addEventListener('change', () => {
    c.franja.lado = selectorLado.value as LadoFranja;
    void guardarYActualizar();
  });

  const caja = h(
    'section',
    {},
    h('h2', {}, '2. Caja'),
    campo('Potencia del lente (P)', c.caja.P, 'D', (n) => n > 0 && ((c.caja.P = n), true)),
    campo('Distancia lente–ojo (e)', c.caja.e_mm, 'mm', (n) => n >= 0 && ((c.caja.e_mm = n), true)),
    campo(
      'Centro del lente desde el centro de la pantalla',
      c.caja.lenteDesdeCentro_mm,
      'mm',
      (n) => n >= 0 && ((c.caja.lenteDesdeCentro_mm = n), true),
    ),
    h('h3', {}, 'Distancia de la pantalla al lente en cada ranura'),
    camposRanuras,
    h(
      'button',
      {
        class: 'boton secundario',
        onclick: () => {
          c.caja.ranuras_mm = crearCaja(c.caja.P, c.caja.e_mm).ranuras_mm;
          dibujarCamposRanuras();
          void guardarYActualizar();
        },
      },
      'Recalcular distancias según P',
    ),
    h('h3', {}, 'Prueba'),
    h('label', { class: 'campo' }, h('span', {}, 'Línea de corte'), selectorUmbral),
    h('label', { class: 'campo' }, h('span', {}, 'Lado de los botones (fuera de la caja)'), selectorLado),
    campo('Ancho de la franja de botones', c.franja.ancho_mm, 'mm', (n) => n >= 8 && ((c.franja.ancho_mm = n), true)),
  );

  // --- Verificación --------------------------------------------------------
  const verificacion = h('section', {});

  function actualizar(): void {
    const px = pxCalibracion;
    tarjeta.style.width = `${px * ANCHO_TARJETA_MM}px`;
    tarjeta.style.height = `${px * ALTO_TARJETA_MM}px`;
    regla.style.width = `${px * 100}px`;
    regla.style.backgroundSize = `${px * 10}px 100%`;
    avisoGirarCal.textContent =
      px * ANCHO_TARJETA_MM > window.innerWidth - 32 ? 'Gira el celular a horizontal para ver la tarjeta completa.' : '';
    textoCalibracion.textContent =
      c.pxPorMm === null
        ? 'Todavía no está calibrado.'
        : `Calibrado: ${coma(c.pxPorMm, 2)} píxeles por mm.`;

    if (c.pxPorMm === null) {
      verificacion.replaceChildren(h('h2', {}, '3. Verificación'), h('p', {}, 'Primero calibra la pantalla.'));
      return;
    }
    const pantalla: Pantalla = { pxPorMm: c.pxPorMm, dpr: window.devicePixelRatio || 1 };
    const lista = ranuras(c.caja);
    const apto = esDibujable(nivelPorNombre('6/9'), lista[0], pantalla);
    const mmPorPixel = 1 / (pantalla.pxPorMm * pantalla.dpr);

    // Pantalla horizontal de este celular.
    const vista = {
      ancho: Math.max(window.innerWidth, window.innerHeight),
      alto: Math.min(window.innerWidth, window.innerHeight),
    };
    const dispOD = disponer(vista, c.pxPorMm, 'OD', c.caja.lenteDesdeCentro_mm, c.franja);
    const dispOI = disponer(vista, c.pxPorMm, 'OI', c.caja.lenteDesdeCentro_mm, c.franja);

    verificacion.replaceChildren(
      h('h2', {}, '3. Verificación'),
      h(
        'div',
        { class: `veredicto ${apto ? 'ok' : 'mal'}` },
        apto
          ? 'Este celular sirve para la prueba.'
          : 'Este celular NO sirve para la prueba: no puede dibujar la línea 6/9 en R0. Usa un celular con mejor pantalla.',
      ),
      h(
        'p',
        { class: 'nota' },
        `Cada píxel físico mide ${coma(mmPorPixel, 3)} mm (devicePixelRatio ${pantalla.dpr}). ` +
          `Pantalla horizontal: ${coma(vista.ancho / c.pxPorMm, 0)} × ${coma(vista.alto / c.pxPorMm, 0)} mm.`,
      ),
      h('h3', {}, 'Qué se puede dibujar en cada ranura'),
      h(
        'table',
        {},
        h('tr', {}, h('th', {}, 'Ranura'), h('th', {}, 'd'), h('th', {}, 'V en el ojo'), h('th', {}, 'Niveles'), h('th', {}, 'Punto remoto')),
        ...lista.map((r) =>
          h(
            'tr',
            {},
            h('td', {}, r.id),
            h('td', {}, `${coma(r.d_mm)} mm`),
            h('td', {}, textoDioptrias(r.Vojo)),
            h('td', {}, nivelesDibujables(r, pantalla).map((n) => n.nombre).join(' ') || 'ninguno'),
            h('td', {}, r.id === 'R0' ? '—' : (nivelObjetivo(r, pantalla)?.nombre ?? 'no se puede')),
          ),
        ),
      ),
      h('h3', {}, '¿Cabe la línea en la mitad de pantalla de cada ojo?'),
      h(
        'p',
        { class: 'nota' },
        'Medido en R0, donde las letras son más grandes, con cinco «E» y sus barras.',
      ),
      h(
        'table',
        {},
        h('tr', {}, h('th', {}, 'Nivel'), h('th', {}, 'Ancho'), h('th', {}, 'Alto'), h('th', {}, '¿Cabe?')),
        ...NIVELES.map((n) => {
          const mm = medidasLinea(alturaOptotipoMm(n.thetaMin, lista[0]));
          const px = { ancho: mm.ancho * pantalla.pxPorMm, alto: mm.alto * pantalla.pxPorMm };
          const entra = cabe(px, dispOD.centro, dispOD.zona) && cabe(px, dispOI.centro, dispOI.zona);
          return h(
            'tr',
            {},
            h('td', {}, n.nombre),
            h('td', {}, `${coma(mm.ancho)} mm`),
            h('td', {}, `${coma(mm.alto)} mm`),
            h('td', { class: entra ? 'si' : 'no' }, entra ? 'Sí' : 'No'),
          );
        }),
      ),
    );
  }

  raiz.replaceChildren(
    h(
      'main',
      { class: 'pagina' },
      h(
        'header',
        { class: 'cabecera' },
        h('button', { class: 'boton secundario', onclick: volver }, '← Volver'),
        h('h1', {}, 'Configuración'),
        estadoGuardado,
      ),
      calibracion,
      caja,
      verificacion,
    ),
  );
  actualizar();
  window.addEventListener('resize', actualizar);
  return () => window.removeEventListener('resize', actualizar);
}
