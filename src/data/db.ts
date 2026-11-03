/**
 * Base de datos del celular (IndexedDB), sin librerías.
 */

export const NOMBRE_DB = 'kidvision';
const VERSION = 1;

export const ALMACEN_CONFIG = 'config';

export function abrirDB(nombre = NOMBRE_DB): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const pedido = indexedDB.open(nombre, VERSION);
    pedido.onupgradeneeded = () => {
      const db = pedido.result;
      if (!db.objectStoreNames.contains(ALMACEN_CONFIG)) db.createObjectStore(ALMACEN_CONFIG);
    };
    pedido.onsuccess = () => resolve(pedido.result);
    pedido.onerror = () => reject(pedido.error);
  });
}

function esperar<T>(pedido: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    pedido.onsuccess = () => resolve(pedido.result);
    pedido.onerror = () => reject(pedido.error);
  });
}

export async function leer<T>(db: IDBDatabase, almacen: string, clave: IDBValidKey): Promise<T | undefined> {
  return esperar(db.transaction(almacen).objectStore(almacen).get(clave)) as Promise<T | undefined>;
}

export async function escribir(db: IDBDatabase, almacen: string, clave: IDBValidKey, valor: unknown): Promise<void> {
  await esperar(db.transaction(almacen, 'readwrite').objectStore(almacen).put(valor, clave));
}
