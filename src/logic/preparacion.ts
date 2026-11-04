/**
 * Qué falta para poder evaluar: colegio y salón, pantalla calibrada y celular apto.
 * Lógica pura: la interfaz solo dibuja los pasos y sus botones.
 */
import { ranuras } from '../core/caja';
import { esDibujable, nivelPorNombre } from '../core/optotipos';
import { estadoCalibracion, type Configuracion, type HuellaPantalla } from '../data/config';

export type IdPaso = 'colegio' | 'calibracion' | 'celular';
/** Qué hace el botón de un paso: pedir el colegio o ir a calibrar. */
export type AccionPaso = 'colegio' | 'calibrar';

export interface Paso {
  id: IdPaso;
  listo: boolean;
  texto: string;
  /** Texto del botón; null si el paso no tiene nada que hacer por sí solo. */
  boton: string | null;
  accion: AccionPaso | null;
}

export interface Preparacion {
  pasos: Paso[];
  listoParaEvaluar: boolean;
  /** El modo práctica no necesita el colegio. */
  listoParaPracticar: boolean;
}

export function estadoPreparacion(config: Configuracion, dpr: number, huella?: HuellaPantalla): Preparacion {
  const colegio = config.colegio.trim();
  const calibracion = estadoCalibracion(config, dpr, huella);
  const calibrada = calibracion === 'vigente';
  const apto =
    calibrada && esDibujable(nivelPorNombre('6/9'), ranuras(config.caja)[0], { pxPorMm: config.pxPorMm!, dpr });

  const salon = (config.salon ?? '').trim();
  const faltaColegio = colegio === '';
  const faltaSalon = salon === '';
  const pasoColegio: Paso =
    !faltaColegio && !faltaSalon
      ? { id: 'colegio', listo: true, texto: `Colegio: ${colegio} · Salón: ${salon}`, boton: null, accion: null }
      : {
          id: 'colegio',
          listo: false,
          texto:
            faltaColegio && faltaSalon
              ? 'Falta el colegio y el salón (salen en la constancia).'
              : faltaSalon
                ? 'Falta el salón, por ejemplo «3B» (sale en la constancia).'
                : 'Falta el nombre del colegio (sale en la constancia).',
          boton: faltaSalon && !faltaColegio ? 'Escribir el salón' : 'Escribir el colegio y el salón',
          accion: 'colegio',
        };

  const textoCalibracion = {
    'sin-calibrar': 'Falta calibrar la pantalla con tu DNI.',
    vigente: 'Pantalla calibrada.',
    'cambio-zoom': 'Cambió el zoom o el tamaño de letra del celular: vuelve a calibrar la pantalla.',
    'cambio-pantalla': 'Parece que cambió la pantalla del celular (o se abrió en otro lugar): vuelve a calibrar.',
  }[calibracion];

  // Calibrada pero con una medida con la que no se puede dibujar la línea 6/9: casi siempre es un error al calibrar.
  // Se muestra como un solo paso pendiente, para no decir «calibrada ✓» y «no sirve» a la vez.
  const calibracionErrada = calibrada && !apto;
  const pasoCalibracion: Paso = {
    id: 'calibracion',
    listo: calibrada && apto,
    texto: calibracionErrada
      ? 'La calibración no parece correcta: con esa medida la pantalla no alcanza a dibujar la línea 6/9. Casi siempre es un error al calibrar: vuelve a calibrar con cuidado. Si sigue igual, usa otro celular.'
      : textoCalibracion,
    boton: calibrada && apto ? null : calibracion === 'sin-calibrar' ? 'Calibrar pantalla' : 'Volver a calibrar',
    accion: calibrada && apto ? null : 'calibrar',
  };

  const pasoCelular: Paso = pasoCalibracion.listo
    ? { id: 'celular', listo: true, texto: 'Tu celular sirve para la prueba.', boton: null, accion: null }
    : { id: 'celular', listo: false, texto: 'Se comprueba el celular al terminar de calibrar bien.', boton: null, accion: null };

  const pasos = [pasoColegio, pasoCalibracion, pasoCelular];
  return {
    pasos,
    listoParaEvaluar: pasos.every((p) => p.listo),
    listoParaPracticar: pasoCalibracion.listo && pasoCelular.listo,
  };
}

/**
 * ¿Se puede empezar ahora? Se pregunta justo antes de cada evaluación, porque el
 * zoom o la pantalla pudieron cambiar desde que se calibró. La práctica no pide colegio.
 */
export function puedeEmpezar(prep: Preparacion, practica: boolean): boolean {
  return practica ? prep.listoParaPracticar : prep.listoParaEvaluar;
}

/** El primer paso que falta (para avisar y ofrecer su botón); null si ya se puede. */
export function primerPendiente(prep: Preparacion, paraPracticar = false): Paso | null {
  const pasos = paraPracticar ? prep.pasos.filter((p) => p.id !== 'colegio') : prep.pasos;
  return pasos.find((p) => !p.listo && p.boton !== null) ?? pasos.find((p) => !p.listo) ?? null;
}
