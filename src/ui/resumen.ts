/**
 * Resumen del salón: conteo por color, listas y exportación a CSV.
 */
import { exportarResumenCsv } from '../data/csv';
import { leerEstudiantes, ultimasEvaluaciones } from '../data/salon';
import { nombreArchivoSalon, resumirSalon } from '../logic/resumen';
import { h } from './dom';
import { icono } from './iconos';

function descargar(nombre: string, contenido: string): void {
  const url = URL.createObjectURL(new Blob([contenido], { type: 'text/csv;charset=utf-8' }));
  const a = h('a', { href: url, download: nombre });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function montarResumen(
  raiz: HTMLElement,
  db: IDBDatabase | null,
  colegio: string,
  salon: string,
  abrirNino: (codigo: string) => void,
  volver: () => void,
): () => void {
  let vivo = true;
  const contenido = h('div', {}, h('p', { class: 'nota' }, 'Cargando…'));

  const listaCodigos = (titulo: string, codigos: string[]): Node | string =>
    codigos.length === 0
      ? ''
      : h(
          'section',
          {},
          h('h2', {}, `${titulo} (${codigos.length})`),
          h('div', { class: 'chips' }, ...codigos.map((c) => h('button', { class: 'chip', onclick: () => abrirNino(c) }, c))),
        );

  async function cargar(): Promise<void> {
    if (!db) {
      contenido.replaceChildren(h('p', { class: 'aviso' }, 'Este navegador no deja guardar datos.'));
      return;
    }
    const [estudiantes, ultimas] = await Promise.all([leerEstudiantes(db), ultimasEvaluaciones(db)]);
    if (!vivo) return;
    const filas = estudiantes.map((e) => ({ estudiante: e, evaluacion: ultimas.get(e.codigo) ?? null }));
    const r = resumirSalon(filas.map((f) => ({ codigo: f.estudiante.codigo, sesion: f.evaluacion?.sesion ?? null })));
    contenido.replaceChildren(
      h('p', { class: 'nota' }, `${r.evaluados} de ${r.total} niños evaluados.`),
      h(
        'div',
        { class: 'conteo' },
        h('div', { class: 'cuadro rojo' }, h('strong', {}, r.porColor.ROJO), h('span', {}, 'Derivar')),
        h('div', { class: 'cuadro amarillo' }, h('strong', {}, r.porColor.AMARILLO), h('span', {}, 'Repetir')),
        h('div', { class: 'cuadro verde' }, h('strong', {}, r.porColor.VERDE), h('span', {}, 'No derivar')),
      ),
      listaCodigos('Derivar', r.derivar),
      listaCodigos('Repetir la prueba', r.repetir),
      listaCodigos('Pendientes', r.pendientes),
      h(
        'button',
        {
          class: 'boton principal',
          disabled: r.total === 0,
          onclick: () => descargar(nombreArchivoSalon(colegio, salon), exportarResumenCsv(filas)),
        },
        icono('subir', 180),
        'Exportar a CSV (Excel)',
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
        h('button', { class: 'boton secundario', 'aria-label': 'Volver a Mi salón', onclick: volver }, icono('atras')),
        h('h1', {}, 'Resumen del salón'),
      ),
      contenido,
    ),
  );
  void cargar();
  return () => {
    vivo = false;
  };
}
