/**
 * Versión de la app que tiene el celular: el commit y la fecha en que se compiló.
 * El commit es el mismo código corto que aparece en GitHub, así se puede comprobar
 * si el celular tiene la última versión publicada.
 */
export function formatearVersion(commit: string, fechaIso: string): string {
  const [anio, mes, dia] = fechaIso.slice(0, 10).split('-');
  return `Versión ${commit} · publicada el ${dia}/${mes}/${anio}`;
}

export const VERSION_APP = formatearVersion(__COMMIT__, __FECHA_COMPILACION__);
