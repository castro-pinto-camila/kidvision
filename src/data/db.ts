/**
 * Base de datos del celular (IndexedDB), sin librerías.
 *
 * Versión 1: configuración. Versión 2: estudiantes y evaluaciones (la
 * configuración guardada se conserva al actualizar).
 */

export const NOMBRE_DB = 'kidvision';
const VERSION = 2;

export const ALMACEN_CONFIG = 'config';
export const ALMACEN_ESTUDIANTES = 'estudiantes';
export const ALMACEN_EVALUACIONES = 'evaluaciones';
export const INDICE_CODIGO = 'codigo';

export function abrirDB(nombre = NOMBRE_DB): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const pedido = indexedDB.open(nombre, VERSION);
    pedido.onupgradeneeded = () => {
      const db = pedido.result;
      if (!db.objectStoreNames.contains(ALMACEN_CONFIG)) db.createObjectStore(ALMACEN_CONFIG);
      if (!db.objectStoreNames.contains(ALMACEN_ESTUDIANTES)) {
        db.createObjectStore(ALMACEN_ESTUDIANTES, { keyPath: 'codigo' });
      }
      if (!db.objectStoreNames.contains(ALMACEN_EVALUACIONES)) {
        const evaluaciones = db.createObjectStore(ALMACEN_EVALUACIONES, { keyPath: 'id', autoIncrement: true });
        evaluaciones.createIndex(INDICE_CODIGO, 'estudiante.codigo');
      }
    };
    pedido.onsuccess = () => resolve(pedido.result);
    pedido.onerror = () => reject(pedido.error);
  });
}

export function esperar<T>(pedido: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    pedido.onsuccess = () => resolve(pedido.result);
    pedido.onerror = () => reject(pedido.error);
  });
}

/** Espera a que termine una transacción de escritura. */
export function terminar(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function leer<T>(db: IDBDatabase, almacen: string, clave: IDBValidKey): Promise<T | undefined> {
  return esperar(db.transaction(almacen).objectStore(almacen).get(clave)) as Promise<T | undefined>;
}

export async function escribir(db: IDBDatabase, almacen: string, clave: IDBValidKey, valor: unknown): Promise<void> {
  await esperar(db.transaction(almacen, 'readwrite').objectStore(almacen).put(valor, clave));
}
