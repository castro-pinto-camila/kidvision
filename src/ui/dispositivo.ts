/**
 * Pantalla completa, celular horizontal y pantalla siempre encendida.
 * Si el navegador no tiene alguna de estas funciones, la prueba sigue igual
 * y se le muestra un aviso al docente.
 */

import type { HuellaPantalla } from '../data/config';

let candado: WakeLockSentinel | null = null;
let activo = false;

/** Algunos navegadores nunca responden: pasado el límite, se sigue como si hubiera fallado. */
const LIMITE_MS = 2000;
function conLimite<T>(promesa: Promise<T>): Promise<T> {
  return Promise.race([
    promesa,
    new Promise<T>((_, rechazar) => setTimeout(() => rechazar(new Error('sin respuesta')), LIMITE_MS)),
  ]);
}

async function pedirPantallaEncendida(): Promise<boolean> {
  try {
    if (!('wakeLock' in navigator)) return false;
    candado = await conLimite(navigator.wakeLock.request('screen'));
    return true;
  } catch {
    return false;
  }
}

/** El navegador suelta el Wake Lock al cambiar de app; se vuelve a pedir al regresar. */
function alVolver(): void {
  if (activo && document.visibilityState === 'visible') void pedirPantallaEncendida();
}

/**
 * Llamar directamente desde el toque del botón «Empezar» (el navegador exige
 * un toque para la pantalla completa). Devuelve los avisos para el docente.
 */
export async function prepararPantalla(): Promise<string[]> {
  const avisos: string[] = [];
  activo = true;

  try {
    const raiz = document.documentElement;
    if (!raiz.requestFullscreen) throw new Error();
    await conLimite(raiz.requestFullscreen({ navigationUI: 'hide' }));
  } catch {
    avisos.push('Este navegador no permite la pantalla completa. La prueba funciona igual.');
  }

  try {
    const orientacion = screen.orientation as ScreenOrientation & {
      lock?: (o: string) => Promise<void>;
    };
    if (!orientacion?.lock) throw new Error();
    await conLimite(orientacion.lock('landscape'));
  } catch {
    avisos.push(
      'Este navegador no deja fijar el celular en horizontal. La app gira su dibujo sola: mete el celular con el lado de la flecha hacia arriba.',
    );
  }

  if (!(await pedirPantallaEncendida())) {
    avisos.push(
      'Este navegador no puede mantener la pantalla encendida. En los ajustes del celular, alarga el tiempo antes de que se apague.',
    );
  }
  document.addEventListener('visibilitychange', alVolver);

  avisos.push('Sube el brillo de la pantalla al máximo.');
  return avisos;
}

export async function liberarPantalla(): Promise<void> {
  activo = false;
  document.removeEventListener('visibilitychange', alVolver);
  try {
    await candado?.release();
  } catch {
    /* ya estaba suelto */
  }
  candado = null;
  try {
    screen.orientation?.unlock?.();
  } catch {
    /* no estaba bloqueada */
  }
  if (document.fullscreenElement) {
    try {
      await document.exitFullscreen();
    } catch {
      /* el usuario ya salió */
    }
  }
}

/** Cómo es la pantalla ahora: se guarda al calibrar y se compara antes de cada evaluación. */
export function huellaActual(): HuellaPantalla {
  return {
    ancho: screen.width,
    alto: screen.height,
    dpr: window.devicePixelRatio || 1,
    zoom: window.visualViewport?.scale ?? 1,
  };
}

/** true si la app se abrió desde el ícono de la pantalla de inicio (su almacenamiento es aparte del navegador). */
export function esAppInstalada(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}
