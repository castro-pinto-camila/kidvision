/**
 * Flujo completo de la prueba como máquina de estados (SPEC.md, «Pruebas por ojo»).
 *
 * Uso desde la interfaz:
 *   const prueba = new PruebaVisual({ caja, pantalla });
 *   dibujar(prueba.paso);
 *   // cuando el docente responde:
 *   dibujar(prueba.responder(evento));
 * hasta que `paso.tipo === 'fin'`.
 */
import { ranuras, type ConfigCaja, type Ranura } from '../core/caja';
import { esDibujable, nivelPorNombre, type Pantalla } from '../core/optotipos';
import { abanicoConsistente, BOTONES_ABANICO, hacerAbanico, type AnguloAbanico } from './abanico';
import { hayRespuestasIguales, type MotivoDudoso } from './calidad';
import { clasificar, semaforoNino, type Categoria, type Semaforo } from './clasificacion';
import { ACIERTOS_PARA_PASAR, LETRAS_POR_LINEA, type Respuesta } from './linea';
import { DIRECCIONES, type Azar } from './orientaciones';
import {
  esperar,
  ir,
  LUGAR_CERCA,
  mostrarLinea,
  type Contexto,
  type Evento,
  type Flujo,
  type Ojo,
  type PasoPendiente,
  type Posicion,
  type RegistroLinea,
} from './pasos';
import { buscarPuntoRemoto, type EstadoPuntoRemoto } from './puntoRemoto';
import { medirUmbral, mejoraConEstenopeico, nombreAgudeza } from './umbral';

/** Nivel de la prueba de cerca (siempre 6/9) y nivel mínimo para que el celular sea apto. */
export const NIVEL_CERCA = '6/9';

export const SEGUNDOS_CLIP = 60;

export interface OpcionesPrueba {
  caja: ConfigCaja;
  pantalla: Pantalla;
  /** Nivel de corte de la línea de tamizaje: «6/9» (por defecto) o «6/12». */
  umbralCorte?: string;
  azar?: Azar;
  /** Reloj en milisegundos (para medir la duración). */
  ahora?: () => number;
}

export interface ResultadoOjo {
  pasaLejos: boolean;
  /** Agudeza umbral si falló de lejos («6/18», «<6/60»); null si pasó. */
  umbral: string | null;
  puntoRemoto: string | null;
  puntoRemotoEstado: EstadoPuntoRemoto | null;
  miopiaEstimadaD: number | null;
  pasaConMas2: boolean | null;
  mejoraEstenopeico: boolean | null;
  umbralEstenopeico: string | null;
  /** Ángulo físico elegido en cada vuelta; null = «todas iguales». */
  abanico: [AnguloAbanico, AnguloAbanico];
  abanicoConsistente: boolean;
  pasaCerca: boolean;
  dudoso: boolean;
  motivosDudoso: MotivoDudoso[];
  categorias: Categoria[];
  semaforo: Semaforo;
  /** Cada línea mostrada, con las respuestas y sus tiempos. */
  registro: RegistroLinea[];
}

export interface ResultadoSesion {
  fecha: string;
  umbralCorte: string;
  ojos: Record<Ojo, ResultadoOjo>;
  semaforo: Semaforo;
  duracionSeg: number;
}

export type Paso = PasoPendiente | { tipo: 'fin'; resultado: ResultadoSesion };

interface Sesion {
  ranuras: Ranura[];
  pantalla: Pantalla;
  umbralCorte: string;
  azar: Azar;
  posicion: Posicion;
}

function* evaluarOjo(ojo: Ojo, s: Sesion): Flujo<ResultadoOjo> {
  const ctx: Contexto = {
    ojo,
    pantalla: s.pantalla,
    azar: s.azar,
    posicion: s.posicion,
    ultima: null,
    registro: [],
  };
  const R0 = s.ranuras[0];
  const corte = nivelPorNombre(s.umbralCorte);
  const motivos = new Set<MotivoDudoso>();

  let umbral: string | null = null;
  let pasaConMas2: boolean | null = null;
  let puntoRemoto: Ranura | null = null;
  let puntoRemotoEstado: EstadoPuntoRemoto | null = null;
  let mejoraEstenopeico: boolean | null = null;
  let umbralEstenopeico: string | null = null;

  // 1. Agudeza lejana en R0.
  yield* ir(ctx, R0);
  const pasaLejos = (yield* mostrarLinea(ctx, 'lejos', R0, corte)) >= ACIERTOS_PARA_PASAR;

  if (pasaLejos) {
    // 2. Clip de +2.00 D.
    yield* ir(ctx, R0, 'clip');
    yield* esperar(ctx, SEGUNDOS_CLIP);
    pasaConMas2 = (yield* mostrarLinea(ctx, 'clip', R0, corte)) >= ACIERTOS_PARA_PASAR;
  } else {
    const sin = yield* medirUmbral(ctx, R0, corte, 'umbral');
    umbral = nombreAgudeza(sin.agudeza);
    if (sin.aciertaMenor) motivos.add('falla-grande-acierta-menor');

    // 3. Búsqueda del punto remoto.
    const busqueda = yield* buscarPuntoRemoto(ctx, s.ranuras);
    puntoRemoto = busqueda.ranura;
    puntoRemotoEstado = busqueda.estado;
    if (busqueda.estado === 'tentativo') motivos.add('punto-remoto-no-confirmado');
    if (busqueda.estado === 'limite') motivos.add('limite-dispositivo');

    // 4. Estenopeico, solo si no se encontró (y no por límite del dispositivo).
    if (busqueda.estado === 'no-encontrado') {
      yield* ir(ctx, R0, 'estenopeico');
      const con = yield* medirUmbral(ctx, R0, corte, 'estenopeico');
      if (con.aciertaMenor) motivos.add('falla-grande-acierta-menor');
      umbralEstenopeico = nombreAgudeza(con.agudeza);
      mejoraEstenopeico = mejoraConEstenopeico(sin.agudeza, con.agudeza);
    }
  }

  // 5. Carta de abanico en R0 o en la ranura del punto remoto.
  const lugarAbanico = puntoRemoto ?? R0;
  yield* ir(ctx, lugarAbanico);
  const abanico = yield* hacerAbanico(ctx, lugarAbanico);
  const consistente = abanicoConsistente(abanico[0], abanico[1]);

  // 6. Agudeza cercana a 40 cm, fuera de la caja.
  yield* ir(ctx, LUGAR_CERCA);
  const pasaCerca =
    (yield* mostrarLinea(ctx, 'cerca', LUGAR_CERCA, nivelPorNombre(NIVEL_CERCA))) >= ACIERTOS_PARA_PASAR;

  const respuestas = ctx.registro.flatMap((l) => l.toques.map((t) => t.respuesta));
  if (hayRespuestasIguales(respuestas)) motivos.add('respuestas-iguales');

  const dudoso = motivos.size > 0;
  const { categorias, semaforo } = clasificar({
    pasaLejos,
    puntoRemoto: puntoRemoto?.id ?? null,
    pasaConMas2,
    mejoraEstenopeico,
    abanicoConsistente: consistente,
    pasaCerca,
    dudoso,
  });

  return {
    pasaLejos,
    umbral,
    puntoRemoto: puntoRemoto?.id ?? null,
    puntoRemotoEstado,
    miopiaEstimadaD: puntoRemoto ? puntoRemoto.Vojo : null,
    pasaConMas2,
    mejoraEstenopeico,
    umbralEstenopeico,
    abanico,
    abanicoConsistente: consistente,
    pasaCerca,
    dudoso,
    motivosDudoso: [...motivos],
    categorias,
    semaforo,
    registro: ctx.registro,
  };
}

function* evaluarSesion(s: Sesion, ahora: () => number): Flujo<ResultadoSesion> {
  const inicio = ahora();
  // Orden: ojo derecho y luego izquierdo.
  const OD = yield* evaluarOjo('OD', s);
  const OI = yield* evaluarOjo('OI', s);
  return {
    fecha: new Date(inicio).toISOString(),
    umbralCorte: s.umbralCorte,
    ojos: { OD, OI },
    semaforo: semaforoNino([OD.semaforo, OI.semaforo]),
    duracionSeg: Math.round((ahora() - inicio) / 1000),
  };
}

const RESPUESTAS_VALIDAS: readonly Respuesta[] = [...DIRECCIONES, 'nose'];

/** Revisa que el evento corresponda al paso actual, para no romper el flujo. */
function validarEvento(paso: Paso, evento: Evento): void {
  const esperado = paso.tipo === 'colocar' || paso.tipo === 'espera' ? 'confirmar' : paso.tipo;
  if (paso.tipo === 'fin') throw new Error('La prueba ya terminó');
  if (evento.tipo !== esperado) {
    throw new Error(`Se esperaba un evento «${esperado}» y llegó «${evento.tipo}»`);
  }
  if (evento.tipo === 'linea') {
    if (evento.toques.length !== LETRAS_POR_LINEA) {
      throw new Error(`Una línea necesita ${LETRAS_POR_LINEA} respuestas`);
    }
    if (!evento.toques.every((t) => RESPUESTAS_VALIDAS.includes(t.respuesta))) {
      throw new Error('Respuesta no válida');
    }
  }
  if (evento.tipo === 'abanico' && evento.eleccion !== 'iguales') {
    const e = evento.eleccion;
    if (!Number.isInteger(e) || e < 0 || e >= BOTONES_ABANICO.length) {
      throw new Error('Botón del abanico no válido');
    }
  }
}

export class PruebaVisual {
  paso: Paso;
  private readonly flujo: Flujo<ResultadoSesion>;

  constructor(opciones: OpcionesPrueba) {
    const umbralCorte = opciones.umbralCorte ?? '6/9';
    const lista = ranuras(opciones.caja);
    if (!esDibujable(nivelPorNombre(NIVEL_CERCA), lista[0], opciones.pantalla)) {
      throw new Error('Este celular no puede dibujar el 6/9 en R0: no sirve para la prueba');
    }
    const sesion: Sesion = {
      ranuras: lista,
      pantalla: opciones.pantalla,
      umbralCorte,
      azar: opciones.azar ?? Math.random,
      posicion: { ojo: null, lugar: null, accesorio: null },
    };
    this.flujo = evaluarSesion(sesion, opciones.ahora ?? Date.now);
    this.paso = this.avanzar();
  }

  /** Entrega la respuesta del docente y devuelve el paso siguiente. */
  responder(evento: Evento): Paso {
    validarEvento(this.paso, evento);
    this.paso = this.avanzar(evento);
    return this.paso;
  }

  private avanzar(evento?: Evento): Paso {
    const r = evento ? this.flujo.next(evento) : this.flujo.next();
    return r.done ? { tipo: 'fin', resultado: r.value } : r.value;
  }
}
