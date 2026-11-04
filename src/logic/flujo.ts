/**
 * Flujo completo de la prueba como máquina de estados (SPEC.md, «Pruebas por ojo»).
 *
 * Para mover el celular lo menos posible, el flujo va por lugares y no por
 * ojos: en cada lugar se prueban los dos ojos (cambia la mitad negra de la
 * pantalla) y recién después se mueve el celular.
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
import {
  clasificar,
  indicacionNino,
  semaforoNino,
  type Categoria,
  type Indicacion,
  type Semaforo,
} from './clasificacion';
import {
  ACIERTOS_PARA_PASAR,
  LETRAS_POR_LINEA,
  respuestasParaDecidir,
  type Respuesta,
} from './linea';
import { DIRECCIONES, type Azar } from './orientaciones';
import { type VersionLineas } from './secuencias';
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
import { buscarPuntosRemotos, type EstadoPuntoRemoto } from './puntoRemoto';
import { medirUmbral, mejoraConEstenopeico, nombreAgudeza, type ResultadoUmbral } from './umbral';

/** Nivel de la prueba de cerca (siempre 6/9) y nivel mínimo para que el celular sea apto. */
export const NIVEL_CERCA = '6/9';

/** Nivel de la línea de práctica: el más grande. */
export const NIVEL_PRACTICA = '6/60';

export const SEGUNDOS_CLIP = 60;

export interface OpcionesPrueba {
  caja: ConfigCaja;
  pantalla: Pantalla;
  /** Nivel de corte de la línea de tamizaje: «6/9» (por defecto) o «6/12». */
  umbralCorte?: string;
  /** Solo para pruebas: «E» al azar. La prueba real usa las secuencias fijas. */
  azar?: Azar;
  /** Juego de secuencias fijas: A (primera evaluación del niño) o B (la siguiente). */
  version?: VersionLineas;
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
  /** Abanico consistente con buena agudeza: se informa «por validar» y no cambia el semáforo. */
  posibleAstigmatismo: boolean;
  semaforo: Semaforo;
  /** Cada línea mostrada, con las respuestas, sus tiempos y si se cortó. */
  registro: RegistroLinea[];
}

export interface ResultadoSesion {
  fecha: string;
  umbralCorte: string;
  ojos: Record<Ojo, ResultadoOjo>;
  semaforo: Semaforo;
  /** Qué hacer: derivar, no derivar, repetir o repetir con otro celular. */
  indicacion: Indicacion;
  duracionSeg: number;
}

export type Paso = PasoPendiente | { tipo: 'fin'; resultado: ResultadoSesion };

interface Sesion {
  ranuras: Ranura[];
  pantalla: Pantalla;
  umbralCorte: string;
  azar: Azar | null;
  version: VersionLineas;
  posicion: Posicion;
}

/** Lo que se va midiendo de un ojo. */
interface DatosOjo {
  ctx: Contexto;
  pasaLejos: boolean;
  sinEstenopeico: ResultadoUmbral | null;
  pasaConMas2: boolean | null;
  puntoRemoto: Ranura | null;
  puntoRemotoEstado: EstadoPuntoRemoto | null;
  mejoraEstenopeico: boolean | null;
  umbralEstenopeico: string | null;
  abanico: [AnguloAbanico, AnguloAbanico];
  pasaCerca: boolean;
  motivos: Set<MotivoDudoso>;
}

function nuevoOjo(ojo: Ojo, s: Sesion): DatosOjo {
  return {
    ctx: { ojo, pantalla: s.pantalla, azar: s.azar, version: s.version, vistas: new Map(), ultima: null, registro: [] },
    pasaLejos: false,
    sinEstenopeico: null,
    pasaConMas2: null,
    puntoRemoto: null,
    puntoRemotoEstado: null,
    mejoraEstenopeico: null,
    umbralEstenopeico: null,
    abanico: [null, null],
    pasaCerca: false,
    motivos: new Set(),
  };
}

/** Control de calidad final y clasificación de un ojo. */
function cerrarOjo(d: DatosOjo): ResultadoOjo {
  const motivos = new Set(d.motivos);
  // Cinco respuestas iguales seguidas, contando entre líneas (aunque alguna se haya cortado).
  const respuestas = d.ctx.registro.flatMap((l) => l.toques.map((t) => t.respuesta));
  if (hayRespuestasIguales(respuestas)) motivos.add('respuestas-iguales');

  const consistente = abanicoConsistente(d.abanico[0], d.abanico[1]);
  const dudoso = motivos.size > 0;
  const { categorias, posibleAstigmatismo, semaforo } = clasificar({
    pasaLejos: d.pasaLejos,
    puntoRemoto: d.puntoRemoto?.id ?? null,
    pasaConMas2: d.pasaConMas2,
    mejoraEstenopeico: d.mejoraEstenopeico,
    abanicoConsistente: consistente,
    pasaCerca: d.pasaCerca,
    dudoso,
  });

  return {
    pasaLejos: d.pasaLejos,
    umbral: d.sinEstenopeico ? nombreAgudeza(d.sinEstenopeico.agudeza) : null,
    puntoRemoto: d.puntoRemoto?.id ?? null,
    puntoRemotoEstado: d.puntoRemotoEstado,
    miopiaEstimadaD: d.puntoRemoto ? d.puntoRemoto.Vojo : null,
    pasaConMas2: d.pasaConMas2,
    mejoraEstenopeico: d.mejoraEstenopeico,
    umbralEstenopeico: d.umbralEstenopeico,
    abanico: d.abanico,
    abanicoConsistente: consistente,
    pasaCerca: d.pasaCerca,
    dudoso,
    motivosDudoso: [...motivos],
    categorias,
    posibleAstigmatismo,
    semaforo,
    registro: d.ctx.registro,
  };
}

function* evaluarSesion(s: Sesion, ahora: () => number): Flujo<ResultadoSesion> {
  const inicio = ahora();
  const R0 = s.ranuras[0];
  const corte = nivelPorNombre(s.umbralCorte);
  const od = nuevoOjo('OD', s);
  const oi = nuevoOjo('OI', s);
  const ojos = [od, oi];

  // 0. Línea de práctica grande, para que el niño entienda el juego. No cuenta.
  yield* ir(s.posicion, R0, null, null);
  const practica: Contexto = {
    ojo: 'OD',
    pantalla: s.pantalla,
    azar: s.azar,
    version: s.version,
    vistas: new Map(),
    ultima: null,
    registro: [],
  };
  yield* mostrarLinea(practica, 'practica', R0, nivelPorNombre(NIVEL_PRACTICA), 0);

  // 1. Agudeza lejana en R0: ojo derecho y luego izquierdo. Si falla, el umbral.
  for (const d of ojos) {
    d.pasaLejos = (yield* mostrarLinea(d.ctx, 'lejos', R0, corte, ACIERTOS_PARA_PASAR)) >= ACIERTOS_PARA_PASAR;
    if (!d.pasaLejos) {
      d.sinEstenopeico = yield* medirUmbral(d.ctx, R0, corte, 'umbral');
      if (d.sinEstenopeico.aciertaMenor) d.motivos.add('falla-grande-acierta-menor');
    }
  }

  // 2. Lentes de +2.00 D para los que pasaron: una sola espera para los dos ojos.
  const pasan = ojos.filter((d) => d.pasaLejos);
  if (pasan.length > 0) {
    yield* ir(s.posicion, R0, 'clip', null);
    yield* esperar(SEGUNDOS_CLIP);
    for (const d of pasan) {
      d.pasaConMas2 = (yield* mostrarLinea(d.ctx, 'clip', R0, corte, ACIERTOS_PARA_PASAR)) >= ACIERTOS_PARA_PASAR;
    }
  }

  // 3. Punto remoto de los que fallaron, los dos ojos en cada ranura.
  const fallan = ojos.filter((d) => !d.pasaLejos);
  if (fallan.length > 0) {
    const resultados = yield* buscarPuntosRemotos(
      fallan.map((d) => d.ctx),
      s.ranuras,
      s.pantalla,
      s.posicion,
    );
    for (const d of fallan) {
      const r = resultados.get(d.ctx.ojo)!;
      d.puntoRemoto = r.ranura;
      d.puntoRemotoEstado = r.estado;
      if (r.estado === 'tentativo') d.motivos.add('punto-remoto-no-confirmado');
      if (r.estado === 'limite') d.motivos.add('limite-dispositivo');
    }
  }

  // 4. Estenopeico, solo si no se encontró (y no por límite del dispositivo).
  const sinPunto = fallan.filter((d) => d.puntoRemotoEstado === 'no-encontrado');
  if (sinPunto.length > 0) {
    yield* ir(s.posicion, R0, 'estenopeico', null);
    for (const d of sinPunto) {
      const con = yield* medirUmbral(d.ctx, R0, corte, 'estenopeico');
      if (con.aciertaMenor) d.motivos.add('falla-grande-acierta-menor');
      d.umbralEstenopeico = nombreAgudeza(con.agudeza);
      d.mejoraEstenopeico = mejoraConEstenopeico(d.sinEstenopeico!.agudeza, con.agudeza);
    }
  }

  // 5. Carta de abanico en R0 o en la ranura del punto remoto. Primero el ojo
  // cuya ranura es donde ya está el celular. Antes del primero, siempre una
  // pantalla con la explicación para el docente.
  const lugarAbanico = (d: DatosOjo) => d.puntoRemoto ?? R0;
  const ordenAbanico = [...ojos].sort(
    (a, b) =>
      Number(lugarAbanico(b).id === s.posicion.lugar) - Number(lugarAbanico(a).id === s.posicion.lugar),
  );
  for (const [i, d] of ordenAbanico.entries()) {
    yield* ir(s.posicion, lugarAbanico(d), null, null, i === 0 ? 'abanico' : null);
    d.abanico = yield* hacerAbanico(d.ctx, lugarAbanico(d));
  }

  // 6. Agudeza cercana a 40 cm, fuera de la caja: el niño sale una sola vez.
  for (const d of ojos) {
    yield* ir(s.posicion, LUGAR_CERCA, null, d.ctx.ojo);
    d.pasaCerca =
      (yield* mostrarLinea(d.ctx, 'cerca', LUGAR_CERCA, nivelPorNombre(NIVEL_CERCA), ACIERTOS_PARA_PASAR)) >=
      ACIERTOS_PARA_PASAR;
  }

  const OD = cerrarOjo(od);
  const OI = cerrarOjo(oi);
  return {
    fecha: new Date(inicio).toISOString(),
    umbralCorte: s.umbralCorte,
    ojos: { OD, OI },
    semaforo: semaforoNino([OD.semaforo, OI.semaforo]),
    indicacion: indicacionNino([OD, OI]),
    duracionSeg: Math.round((ahora() - inicio) / 1000),
  };
}

const RESPUESTAS_VALIDAS: readonly Respuesta[] = [...DIRECCIONES, 'nose'];

/** Revisa que el evento corresponda al paso actual, para no romper el flujo. */
function validarEvento(paso: Paso, evento: Evento): void {
  if (paso.tipo === 'fin') throw new Error('La prueba ya terminó');
  const esperado = paso.tipo === 'colocar' || paso.tipo === 'espera' ? 'confirmar' : paso.tipo;
  if (evento.tipo !== esperado) {
    throw new Error(`Se esperaba un evento «${esperado}» y llegó «${evento.tipo}»`);
  }
  if (evento.tipo === 'linea' && paso.tipo === 'linea') {
    const n = evento.toques.length;
    if (n < 1 || n > LETRAS_POR_LINEA) {
      throw new Error(`Una línea necesita de 1 a ${LETRAS_POR_LINEA} respuestas`);
    }
    if (!evento.toques.every((t) => RESPUESTAS_VALIDAS.includes(t.respuesta))) {
      throw new Error('Respuesta no válida');
    }
    const respuestas = evento.toques.map((t) => t.respuesta);
    if (respuestasParaDecidir(paso.orientaciones, respuestas, paso.necesarios) === null) {
      throw new Error('Faltan respuestas: la línea todavía no está decidida');
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
      azar: opciones.azar ?? null,
      version: opciones.version ?? 'A',
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
