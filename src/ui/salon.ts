/**
 * Mi salón: la pantalla de inicio. Lista de niños por código con su estado,
 * agregar un niño, cargar la lista desde CSV y accesos al resto.
 */
import { leerListaCsv } from '../data/csv';
import {
  guardarEstudiantes,
  leerEstudiantes,
  ultimasEvaluaciones,
  type Estudiante,
  type Evaluacion,
} from '../data/salon';
import type { Indicacion } from '../logic/clasificacion';
import { h } from './dom';
import { icono } from './iconos';

export interface ContextoSalon {
  db: IDBDatabase | null;
  colegio: string;
  /** Mensaje si la pantalla no está calibrada o el celular no sirve; null si todo está bien. */
  problemaCelular: string | null;
  necesitaCalibrar: boolean;
  aviso?: string;
  abrirNino: (codigo: string) => void;
  practicar: () => void;
  resumen: () => void;
  configurar: () => void;
  calibrar: () => void;
}

const ESTADO: Record<Indicacion, string> = {
  derivar: 'Derivar',
  'no-derivar': 'No derivar',
  repetir: 'Repetir',
  'repetir-otro-celular': 'Repetir con otro celular',
};

const fechaCorta = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/');

export function montarSalon(raiz: HTMLElement, ctx: ContextoSalon): () => void {
  let vivo = true;
  const lista = h('section', { class: 'lista-salon', 'aria-live': 'polite' }, h('p', { class: 'nota' }, 'Cargando…'));
  const mensaje = h('div', { role: 'status' });

  function mostrarMensaje(texto: string, detalles: string[] = [], tipo: 'ok' | 'aviso' = 'ok'): void {
    mensaje.replaceChildren(
      h(
        'div',
        { class: tipo === 'ok' ? 'veredicto ok' : 'aviso' },
        texto,
        detalles.length > 0 && h('ul', {}, ...detalles.map((d) => h('li', {}, d))),
      ),
    );
  }

  async function cargar(): Promise<void> {
    if (!ctx.db) {
      lista.replaceChildren(h('p', { class: 'aviso' }, 'Este navegador no deja guardar datos: no se puede usar la lista del salón.'));
      return;
    }
    const [estudiantes, ultimas] = await Promise.all([leerEstudiantes(ctx.db), ultimasEvaluaciones(ctx.db)]);
    if (!vivo) return;
    dibujarLista(estudiantes, ultimas);
  }

  function dibujarLista(estudiantes: Estudiante[], ultimas: Map<string, Evaluacion>): void {
    if (estudiantes.length === 0) {
      lista.replaceChildren(
        h(
          'div',
          { class: 'vacio' },
          h('p', {}, h('strong', {}, 'Todavía no hay niños en tu salón.')),
          h('p', { class: 'nota' }, 'Agrégalos uno por uno o carga la lista desde un archivo CSV (código, edad, grado).'),
        ),
      );
      return;
    }
    const evaluados = estudiantes.filter((e) => ultimas.has(e.codigo)).length;
    lista.replaceChildren(
      h('p', { class: 'nota' }, `${evaluados} de ${estudiantes.length} evaluados`),
      h(
        'ul',
        { class: 'ninos' },
        ...estudiantes.map((e) => {
          const ev = ultimas.get(e.codigo);
          const color = ev ? ev.sesion.semaforo.toLowerCase() : 'pendiente';
          const detalle = [e.grado, e.edad !== null ? `${e.edad} años` : ''].filter(Boolean).join(' · ');
          return h(
            'li',
            {},
            h(
              'button',
              { class: 'fila-nino', onclick: () => ctx.abrirNino(e.codigo) },
              h('span', { class: `punto ${color}`, 'aria-hidden': 'true' }),
              h('span', { class: 'codigo' }, e.codigo, detalle && h('small', {}, detalle)),
              h(
                'span',
                { class: 'estado-nino' },
                ev ? ESTADO[ev.sesion.indicacion] : 'Pendiente',
                ev && h('small', {}, fechaCorta(ev.sesion.fecha)),
              ),
            ),
          );
        }),
      ),
    );
  }

  // --- Agregar un niño -------------------------------------------------------
  const codigo = h('input', { type: 'text', placeholder: '3B-07', 'aria-label': 'Código del niño', autocomplete: 'off' });
  const edad = h('input', { type: 'text', inputmode: 'numeric', placeholder: '9', 'aria-label': 'Edad' });
  const grado = h('input', { type: 'text', placeholder: '3B', 'aria-label': 'Grado' });
  const errorAgregar = h('p', { class: 'error' });
  const agregar = h(
    'details',
    { class: 'agregar' },
    h('summary', { class: 'boton' }, icono('mas'), 'Agregar niño'),
    h(
      'form',
      {
        class: 'formulario',
        onsubmit: async (ev: Event) => {
          ev.preventDefault();
          const c = codigo.value.trim();
          const n = edad.value.trim() === '' ? null : Number(edad.value.trim());
          if (!c) {
            errorAgregar.textContent = 'Escribe el código del niño.';
            return;
          }
          if (n !== null && (!Number.isInteger(n) || n < 3 || n > 18)) {
            errorAgregar.textContent = 'La edad debe ser un número entre 3 y 18.';
            return;
          }
          errorAgregar.textContent = '';
          if (!ctx.db) return;
          await guardarEstudiantes(ctx.db, [{ codigo: c, edad: n, grado: grado.value.trim() }]);
          codigo.value = '';
          edad.value = '';
          mostrarMensaje(`Se guardó ${c}.`);
          void cargar();
          codigo.focus();
        },
      },
      h('label', { class: 'campo-corto' }, h('span', {}, 'Código (sin nombre)'), codigo),
      h('label', { class: 'campo-corto' }, h('span', {}, 'Edad'), edad),
      h('label', { class: 'campo-corto' }, h('span', {}, 'Grado'), grado),
      errorAgregar,
      h('button', { class: 'boton principal', type: 'submit' }, 'Guardar niño'),
    ),
  );

  // --- Cargar CSV ------------------------------------------------------------
  const archivo = h('input', { type: 'file', accept: '.csv,text/csv,text/plain', class: 'oculto' });
  archivo.addEventListener('change', async () => {
    const f = archivo.files?.[0];
    archivo.value = '';
    if (!f || !ctx.db) return;
    const { estudiantes, errores } = leerListaCsv(await f.text());
    const { nuevos, actualizados } = await guardarEstudiantes(ctx.db, estudiantes);
    const detalles = errores.map((e) => `Fila ${e.fila}: ${e.mensaje}`);
    mostrarMensaje(
      `Se agregaron ${nuevos} niños${actualizados ? ` y se actualizaron ${actualizados}` : ''}.${errores.length ? ` ${errores.length} filas tienen problemas:` : ''}`,
      detalles,
      errores.length ? 'aviso' : 'ok',
    );
    void cargar();
  });

  raiz.replaceChildren(
    h(
      'main',
      { class: 'pagina' },
      h(
        'header',
        { class: 'cabecera' },
        h('span', { class: 'logo' }, icono('ojo')),
        h('div', { class: 'titulos' }, h('h1', {}, 'Mi salón'), ctx.colegio && h('p', { class: 'lema' }, ctx.colegio)),
        h('button', { class: 'boton secundario', 'aria-label': 'Configuración', onclick: ctx.configurar }, icono('ajustes')),
      ),
      ctx.aviso && h('p', { class: 'aviso' }, ctx.aviso),
      ctx.problemaCelular &&
        h(
          'div',
          { class: 'aviso' },
          ctx.problemaCelular,
          ctx.necesitaCalibrar &&
            h('button', { class: 'boton principal', onclick: ctx.calibrar }, icono('regla'), 'Calibrar pantalla'),
        ),
      mensaje,
      h(
        'div',
        { class: 'acciones-salon' },
        agregar,
        h('label', { class: 'boton' }, icono('subir'), 'Cargar lista (CSV)', archivo),
        h('button', { class: 'boton', onclick: ctx.resumen }, icono('lista'), 'Resumen del salón'),
        h('button', { class: 'boton', disabled: ctx.problemaCelular !== null, onclick: ctx.practicar }, 'Modo práctica (sin caja)'),
      ),
      lista,
    ),
  );
  void cargar();
  return () => {
    vivo = false;
  };
}
