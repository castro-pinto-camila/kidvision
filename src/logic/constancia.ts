/**
 * Constancia del resultado (SPEC.md, «Pantallas» 6).
 *
 * Tiene dos partes separadas:
 *  - Para la familia: derivar o no, la agudeza en palabras simples, la
 *    simulación aproximada y avisos. SIN dioptrías ni categoría.
 *  - Para el profesional de salud: categoría probable y miopía estimada,
 *    como estimación de tamizaje.
 */
import type { MotivoDudoso } from './calidad';
import type { Categoria, Indicacion } from './clasificacion';
import type { ResultadoOjo, ResultadoSesion } from './flujo';
import type { Ojo } from './pasos';

export const TEXTO_CATEGORIA: Record<Categoria, string> = {
  miopia: 'Miopía probable',
  hipermetropia: 'Hipermetropía probable',
  astigmatismo: 'Astigmatismo probable',
  otraCausa: 'Baja visión por otra causa (oftalmología)',
  indeterminado: 'Error refractivo de tipo no determinado',
  normal: 'Sin hallazgos',
};

export const TEXTO_MOTIVO: Record<MotivoDudoso, string> = {
  'respuestas-iguales': 'Dio cinco respuestas iguales seguidas.',
  'falla-grande-acierta-menor': 'Falló letras grandes pero acertó letras más pequeñas.',
  'punto-remoto-no-confirmado': 'El punto remoto no se confirmó en la ranura siguiente.',
  'limite-dispositivo': 'La pantalla de este celular no alcanza para una de las ranuras.',
};

export const NO_COMPRE_LENTES = 'No compre lentes sin un examen profesional.';
export const NO_REEMPLAZA_EXAMEN =
  'Este tamizaje no reemplaza un examen. Si su hijo se acerca mucho a los objetos, entrecierra los ojos o se queja de dolor de cabeza, consulte.';
export const ES_ESTIMACION = 'Estimación de tamizaje, no es una receta ni un diagnóstico.';

/** Agudeza como fracción, para el profesional: «6/24», «6/9 o mejor», «menor que 6/60». */
export function textoAgudeza(o: ResultadoOjo, corte: string): string {
  if (o.pasaLejos) return `${corte} o mejor`;
  return o.umbral === '<6/60' ? 'menor que 6/60' : (o.umbral ?? '—');
}

/** −1,94 D */
export function textoDioptrias(d: number): string {
  return `${d.toFixed(2).replace('.', ',').replace('-', '−')} D`;
}

/** Denominador de la agudeza de lejos (6/24 → 24). Menor que 6/60 cuenta como 90; si pasó, null. */
export function denominadorLejos(o: ResultadoOjo): number | null {
  if (o.pasaLejos) return null;
  if (!o.umbral || o.umbral === '<6/60') return 90;
  return Number(o.umbral.split('/')[1]);
}

/** La agudeza de un ojo en palabras simples, para la familia. */
export function agudezaEnPalabras(o: ResultadoOjo): string {
  const den = denominadorLejos(o);
  let lejos: string;
  if (den === null) lejos = 'Ve bien de lejos.';
  else if (den <= 12) lejos = 'De lejos ve un poco menos de lo esperado.';
  else if (den <= 24) lejos = 'De lejos ve con dificultad.';
  else if (den <= 60) lejos = 'De lejos ve con mucha dificultad.';
  else lejos = 'De lejos ve con mucha dificultad, incluso las letras muy grandes.';
  return o.pasaCerca ? lejos : `${lejos} De cerca también le cuesta ver.`;
}

const TITULO_FAMILIA: Record<Indicacion, string> = {
  derivar: 'Su hijo necesita un examen de la vista',
  'no-derivar': 'Su hijo no necesita derivación por ahora',
  repetir: 'Vamos a repetir la prueba',
  'repetir-otro-celular': 'Vamos a repetir la prueba',
};

const RESUMEN_FAMILIA: Record<Indicacion, string> = {
  derivar:
    'En la prueba de la vista que hicimos en la escuela, su hijo podría no estar viendo bien. Llévelo a un examen con un profesional de salud (centro de salud u oftalmólogo).',
  'no-derivar': 'En la prueba de la vista que hicimos en la escuela, su hijo vio bien.',
  repetir: 'La prueba de la vista no salió clara. La repetiremos en la escuela.',
  'repetir-otro-celular': 'La prueba de la vista no salió clara. La repetiremos en la escuela.',
};

export interface TextoFamilia {
  titulo: string;
  resumen: string;
  ojos: Record<Ojo, string>;
  avisos: string[];
}

/** La parte para la familia: sin dioptrías ni categoría. */
export function textoFamilia(s: ResultadoSesion): TextoFamilia {
  const avisos = [NO_COMPRE_LENTES];
  if (s.indicacion === 'no-derivar') avisos.push(NO_REEMPLAZA_EXAMEN);
  return {
    titulo: TITULO_FAMILIA[s.indicacion],
    resumen: RESUMEN_FAMILIA[s.indicacion],
    ojos: { OD: agudezaEnPalabras(s.ojos.OD), OI: agudezaEnPalabras(s.ojos.OI) },
    avisos,
  };
}

/** La parte para el profesional de salud: datos de cada ojo como estimación de tamizaje. */
export function textoProfesional(s: ResultadoSesion): Record<Ojo, string[]> {
  const ojo = (o: ResultadoOjo): string[] => {
    const lineas = [`Agudeza lejana: ${textoAgudeza(o, s.umbralCorte)}`];
    if (o.puntoRemoto) {
      lineas.push(`Punto remoto: ${o.puntoRemoto}${o.puntoRemotoEstado === 'tentativo' ? ' (no confirmado)' : ''}`);
    }
    if (o.miopiaEstimadaD !== null) lineas.push(`Miopía estimada: ${textoDioptrias(o.miopiaEstimadaD)}`);
    if (o.pasaConMas2 !== null) {
      lineas.push(`Con +2.00 D: ${o.pasaConMas2 ? 'sigue leyendo la línea de corte' : 'deja de leerla'}`);
    }
    if (o.umbralEstenopeico !== null) {
      lineas.push(`Con estenopeico: ${o.umbralEstenopeico}${o.mejoraEstenopeico ? ' (mejora)' : ' (no mejora)'}`);
    }
    lineas.push(`Cerca (40 cm, 6/9): ${o.pasaCerca ? 'lee' : 'no lee'}`);
    lineas.push(
      `Categoría probable: ${o.categorias.length ? o.categorias.map((c) => TEXTO_CATEGORIA[c]).join(', ') : 'sin categoría'}`,
    );
    if (o.posibleAstigmatismo) lineas.push('Posible astigmatismo (por validar): abanico consistente con buena agudeza.');
    if (o.dudoso) lineas.push(`Resultado dudoso: ${o.motivosDudoso.map((m) => TEXTO_MOTIVO[m]).join(' ')}`);
    return lineas;
  };
  return { OD: ojo(s.ojos.OD), OI: ojo(s.ojos.OI) };
}

/** Mensaje de WhatsApp para la familia: solo la parte de la familia. */
export function mensajeWhatsapp(s: ResultadoSesion, codigo: string, colegio: string): string {
  const f = textoFamilia(s);
  const fecha = s.fecha.slice(0, 10).split('-').reverse().join('/');
  return [
    `KidVision${colegio ? ` · ${colegio}` : ''}`,
    `Prueba de la vista del ${fecha} · Código ${codigo}`,
    '',
    f.titulo,
    f.resumen,
    '',
    `Ojo derecho: ${f.ojos.OD}`,
    `Ojo izquierdo: ${f.ojos.OI}`,
    '',
    ...f.avisos,
  ].join('\n');
}

/** Enlace de WhatsApp sin número: el docente elige el contacto (no se guardan teléfonos). */
export function enlaceWhatsapp(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}

/**
 * Desenfoque de la simulación aproximada, como fracción de la altura de la
 * letra, según la agudeza de lejos del ojo que ve peor. 0 si los dos ojos
 * ven bien de lejos (entonces no se muestra la simulación).
 */
export function desenfoqueSimulado(s: ResultadoSesion): number {
  const dens = [denominadorLejos(s.ojos.OD), denominadorLejos(s.ojos.OI)].filter((d): d is number => d !== null);
  if (dens.length === 0) return 0;
  const mar = Math.max(...dens) / 6; // ángulo de resolución mínimo, en minutos
  return Math.min(0.12 * (mar - 1), 1.2);
}
