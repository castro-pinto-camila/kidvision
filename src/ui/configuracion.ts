/**
 * Configuración. Arriba, lo que necesita el docente: si la pantalla está
 * calibrada y si el celular sirve. Lo técnico de la caja queda plegado, con
 * una explicación de cada número. Cada cambio se guarda solo.
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
import { estadoCalibracion, type Configuracion } from '../data/config';
import { VERSION_APP } from '../version';
import { h } from './dom';
import { icono } from './iconos';
import { textoDioptrias } from './textos';

const coma = (n: number, decimales = 1) => n.toFixed(decimales).replace('.', ',');

function leerNumero(texto: string): number {
  return Number.parseFloat(texto.replace(',', '.'));
}

export interface AccionesConfiguracion {
  guardar: (c: Configuracion) => Promise<void>;
  calibrar: () => void;
  /** Abre la portada («Acerca de KidVision»). */
  acercaDe: () => void;
  /** Borra estudiantes y evaluaciones (la calibración y la caja se conservan). */
  borrarSalon: () => Promise<void>;
  volver: () => void;
}

export function montarConfiguracion(
  raiz: HTMLElement,
  config: Configuracion,
  acciones: AccionesConfiguracion,
): () => void {
  const c: Configuracion = structuredClone(config);
  const dpr = window.devicePixelRatio || 1;
  const aviso = h('div', { class: 'toast', role: 'status' });
  let temporizadorAviso: number | undefined;

  function avisar(texto: string): void {
    aviso.textContent = texto;
    aviso.classList.add('visible');
    clearTimeout(temporizadorAviso);
    temporizadorAviso = window.setTimeout(() => aviso.classList.remove('visible'), 1800);
  }

  async function guardarYActualizar(): Promise<void> {
    actualizar();
    try {
      await acciones.guardar(c);
      avisar('Guardado');
    } catch {
      avisar('No se pudo guardar');
    }
  }

  // --- Lo del docente -------------------------------------------------------
  const estadoDocente = h('section', { class: 'tarjetas' });

  function dibujarEstadoDocente(): void {
    const estado = estadoCalibracion(c, dpr);
    const pantalla: Pantalla | null = c.pxPorMm === null ? null : { pxPorMm: c.pxPorMm, dpr };
    const sirve = pantalla !== null && esDibujable(nivelPorNombre('6/9'), ranuras(c.caja)[0], pantalla);
    const textoCalibracion = {
      'sin-calibrar': 'La pantalla todavía no está calibrada.',
      vigente: 'Pantalla calibrada.',
      'cambio-zoom': 'Cambió el zoom o el tamaño de letra del celular: vuelve a calibrar.',
      'cambio-pantalla': 'Parece que cambió la pantalla del celular (o se abrió en otro lugar): vuelve a calibrar.',
    }[estado];
    const filas: HTMLElement[] = [
      h(
        'div',
        { class: `fila-estado ${estado === 'vigente' ? 'ok' : 'pendiente'}` },
        h('span', { class: 'icono' }, estado === 'vigente' ? icono('check') : '!'),
        h('span', { class: 'texto' }, textoCalibracion),
        h(
          'button',
          { class: estado === 'vigente' ? 'boton' : 'boton principal', onclick: acciones.calibrar },
          estado === 'sin-calibrar' ? 'Calibrar' : 'Volver a calibrar',
        ),
      ),
    ];
    if (pantalla) {
      filas.push(
        h(
          'div',
          { class: `fila-estado ${sirve ? 'ok' : 'mal'}` },
          h('span', { class: 'icono' }, sirve ? icono('check') : '✕'),
          h(
            'span',
            { class: 'texto' },
            sirve
              ? 'Tu celular sirve para la prueba.'
              : 'Tu celular no sirve para la prueba: su pantalla no puede dibujar la línea 6/9. Usa otro celular.',
          ),
        ),
      );
    }
    estadoDocente.replaceChildren(...filas);
  }

  // --- Colegio y datos del salón --------------------------------------------
  const entradaColegio = h('input', {
    type: 'text',
    class: 'texto-largo',
    value: c.colegio,
    placeholder: 'IE 1234 San Martín',
    'aria-label': 'Nombre del colegio',
  });
  entradaColegio.addEventListener('change', () => {
    c.colegio = entradaColegio.value.trim();
    void guardarYActualizar();
  });
  const entradaSalon = h('input', {
    type: 'text',
    class: 'texto-largo',
    value: c.salon,
    placeholder: '3B',
    'aria-label': 'Salón',
  });
  entradaSalon.addEventListener('change', () => {
    c.salon = entradaSalon.value.trim();
    void guardarYActualizar();
  });
  const colegio = h(
    'div',
    {},
    h(
      'label',
      { class: 'campo' },
      h('span', { class: 'etiqueta' }, 'Colegio', h('small', {}, 'Sale en la constancia para la familia.')),
      entradaColegio,
    ),
    h(
      'label',
      { class: 'campo' },
      h('span', { class: 'etiqueta' }, 'Salón', h('small', {}, 'Por ejemplo 3B o 5.º A.')),
      entradaSalon,
    ),
  );

  const datos = h(
    'section',
    { class: 'datos-salon' },
    h('h2', {}, 'Datos del salón'),
    h(
      'p',
      { class: 'nota' },
      'Los datos de los niños se guardan solo en este celular. Bórralos cuando termines el tamizaje del salón.',
    ),
    h(
      'button',
      {
        class: 'boton peligro',
        onclick: async () => {
          if (!confirm('¿Borrar todos los niños y sus resultados de este celular? No se puede deshacer.')) return;
          try {
            await acciones.borrarSalon();
            avisar('Datos del salón borrados');
          } catch {
            avisar('No se pudieron borrar');
          }
        },
      },
      'Borrar todos los datos del salón',
    ),
  );

  // --- Ajustes de la caja (plegados) ---------------------------------------
  function campo(
    etiqueta: string,
    explicacion: string,
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
    return h(
      'label',
      { class: 'campo' },
      h('span', { class: 'etiqueta' }, etiqueta, h('small', {}, explicacion)),
      h('span', { class: 'valor' }, entrada, h('span', { class: 'unidad' }, unidad)),
    );
  }

  const camposRanuras = h('div', { class: 'ranuras' });
  function dibujarCamposRanuras(): void {
    camposRanuras.replaceChildren(
      ...c.caja.ranuras_mm.map((d, i) => {
        let vigente = d;
        const entrada = h('input', { type: 'text', inputmode: 'decimal', value: coma(d) });
        entrada.addEventListener('change', () => {
          const n = leerNumero(entrada.value);
          if (Number.isFinite(n) && n > 0) {
            vigente = n;
            c.caja.ranuras_mm[i] = n;
            void guardarYActualizar();
          }
          entrada.value = coma(vigente);
        });
        return h('label', { class: 'ranura' }, h('span', {}, `R${i}`), entrada, h('span', { class: 'unidad' }, 'mm'));
      }),
    );
  }
  dibujarCamposRanuras();

  function selector<T extends string>(opciones: [T, string][], actual: T, aplicar: (v: T) => void): HTMLSelectElement {
    const s = h('select', {}, ...opciones.map(([v, t]) => h('option', { value: v, selected: v === actual }, t)));
    s.addEventListener('change', () => {
      aplicar(s.value as T);
      void guardarYActualizar();
    });
    return s;
  }

  const LADOS: [LadoFranja, string][] = [
    ['arriba', 'Arriba'],
    ['abajo', 'Abajo'],
    ['izquierda', 'Izquierda'],
    ['derecha', 'Derecha'],
  ];

  const tablas = h('div', {});

  const ajustes = h(
    'details',
    { class: 'avanzado' },
    h('summary', {}, 'Ajustes de la caja (para quien la arma)'),
    h(
      'p',
      { class: 'nota' },
      'Estos números vienen listos para la caja estándar. Cámbialos solo si mediste tu caja y no coinciden.',
    ),
    h('h3', {}, 'Lentes'),
    campo(
      'Potencia de los lentes de la caja',
      'Son lentes de lectura de +3.00: déjalo en 3.',
      c.caja.P,
      'D',
      (n) => n > 0 && ((c.caja.P = n), true),
    ),
    campo(
      'Distancia del lente al ojo',
      'Desde el lente hasta el ojo del niño. Normalmente 15 mm.',
      c.caja.e_mm,
      'mm',
      (n) => n >= 0 && ((c.caja.e_mm = n), true),
    ),
    campo(
      'Separación de cada lente',
      'Distancia horizontal entre el centro de la pantalla y el centro de cada lente.',
      c.caja.lenteDesdeCentro_mm,
      'mm',
      (n) => n >= 0 && ((c.caja.lenteDesdeCentro_mm = n), true),
    ),
    h('h3', {}, 'Ranuras'),
    h(
      'p',
      { class: 'nota' },
      'Distancia entre la pantalla y el lente en cada ranura. Mídela con una regla y corrígela si tu caja salió distinta.',
    ),
    camposRanuras,
    h(
      'button',
      {
        class: 'boton',
        onclick: () => {
          c.caja.ranuras_mm = crearCaja(c.caja.P, c.caja.e_mm).ranuras_mm;
          dibujarCamposRanuras();
          void guardarYActualizar();
        },
      },
      'Volver a las distancias de fábrica',
    ),
    h('h3', {}, 'Prueba'),
    h(
      'label',
      { class: 'campo' },
      h('span', { class: 'etiqueta' }, 'Línea para pasar de lejos', h('small', {}, 'La IAPB recomienda 6/9.')),
      selector<Configuracion['umbralCorte']>(
        [
          ['6/9', '6/9'],
          ['6/12', '6/12'],
        ],
        c.umbralCorte,
        (v) => (c.umbralCorte = v),
      ),
    ),
    h(
      'label',
      { class: 'campo' },
      h(
        'span',
        { class: 'etiqueta' },
        'Lado de los botones',
        h('small', {}, 'El borde de la pantalla que queda fuera de la caja.'),
      ),
      selector(LADOS, c.franja.lado, (v) => (c.franja.lado = v)),
    ),
    campo(
      'Alto de la franja de botones',
      'Cuánto de la pantalla ocupan los botones.',
      c.franja.ancho_mm,
      'mm',
      (n) => n >= 8 && ((c.franja.ancho_mm = n), true),
    ),
    h(
      'button',
      {
        class: 'boton',
        onclick: () => {
          c.pantallaInvertida = false;
          c.mitadesIntercambiadas = false;
          void guardarYActualizar();
        },
      },
      'Olvidar la corrección de la «D»',
    ),
    tablas,
  );

  function actualizar(): void {
    dibujarEstadoDocente();
    if (c.pxPorMm === null) {
      tablas.replaceChildren(h('p', { class: 'nota' }, 'Calibra la pantalla para ver las tablas de verificación.'));
      return;
    }
    const pantalla: Pantalla = { pxPorMm: c.pxPorMm, dpr };
    const lista = ranuras(c.caja);
    const mmPorPixel = 1 / (pantalla.pxPorMm * pantalla.dpr);
    const vista = {
      ancho: Math.max(window.innerWidth, window.innerHeight),
      alto: Math.min(window.innerWidth, window.innerHeight),
    };
    const dispOD = disponer(vista, c.pxPorMm, 'OD', c.caja.lenteDesdeCentro_mm, c.franja);
    const dispOI = disponer(vista, c.pxPorMm, 'OI', c.caja.lenteDesdeCentro_mm, c.franja);

    tablas.replaceChildren(
      h('h3', {}, 'Verificación'),
      h(
        'p',
        { class: 'nota' },
        `Cada píxel físico mide ${coma(mmPorPixel, 3)} mm (devicePixelRatio ${dpr}). ` +
          `Pantalla horizontal: ${coma(vista.ancho / c.pxPorMm, 0)} × ${coma(vista.alto / c.pxPorMm, 0)} mm.`,
      ),
      h('h4', {}, 'Qué se puede dibujar en cada ranura'),
      h(
        'div',
        { class: 'tabla-scroll' },
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
      ),
      h('h4', {}, '¿Cabe la línea en la mitad de pantalla de cada ojo?'),
      h('p', { class: 'nota' }, 'Medido en R0, donde las letras son más grandes, con cinco «E» y sus barras.'),
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
        h('button', { class: 'boton secundario', 'aria-label': 'Volver', onclick: acciones.volver }, icono('atras')),
        h('h1', {}, 'Configuración'),
      ),
      estadoDocente,
      colegio,
      ajustes,
      datos,
      h('button', { class: 'boton', onclick: acciones.acercaDe }, 'Acerca de KidVision'),
      h('p', { class: 'nota' }, VERSION_APP),
      aviso,
    ),
  );
  actualizar();
  window.addEventListener('resize', actualizar);
  return () => {
    clearTimeout(temporizadorAviso);
    window.removeEventListener('resize', actualizar);
  };
}
