/**
 * Ayuda mínima para crear elementos sin framework.
 *   h('button', { class: 'grande', onclick: () => … }, 'Listo')
 */

type Hijo = Node | string | number | null | undefined | false;
type Atributo = string | number | boolean | undefined | ((e: Event) => void);

export function h<K extends keyof HTMLElementTagNameMap>(
  etiqueta: K,
  atributos: Record<string, Atributo> = {},
  ...hijos: Hijo[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(etiqueta);
  for (const [clave, valor] of Object.entries(atributos)) {
    if (valor === undefined || valor === false) continue;
    if (typeof valor === 'function') el.addEventListener(clave.replace(/^on/, ''), valor);
    else if (clave === 'class') el.className = String(valor);
    else if (valor === true) el.setAttribute(clave, '');
    else el.setAttribute(clave, String(valor));
  }
  for (const hijo of hijos) {
    if (hijo === null || hijo === undefined || hijo === false) continue;
    el.append(typeof hijo === 'number' ? String(hijo) : hijo);
  }
  return el;
}
