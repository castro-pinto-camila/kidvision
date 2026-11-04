/**
 * Textos para el docente.
 */
import type { MotivoDudoso } from '../logic/calidad';
import type { Categoria, Indicacion, Semaforo } from '../logic/clasificacion';
import type { ResultadoOjo } from '../logic/flujo';
import type { Ojo, PasoColocar, Prueba } from '../logic/pasos';

export const NOMBRE_OJO: Record<Ojo, string> = { OD: 'ojo derecho', OI: 'ojo izquierdo' };
export const OTRO_OJO: Record<Ojo, string> = { OD: 'ojo izquierdo', OI: 'ojo derecho' };

export const NOMBRE_PRUEBA: Record<Prueba, string> = {
  practica: 'Práctica (no cuenta)',
  lejos: 'Lejos',
  umbral: 'Agudeza',
  control: 'Control',
  clip: 'Tapa +2.00',
  remoto: 'Punto remoto',
  estenopeico: 'Estenopeico',
  cerca: 'Cerca',
};

/** Cómo responde el niño: lo lee el docente antes de la primera línea. */
export const COMO_RESPONDE = [
  'Siéntate al lado del niño, no enfrente: enfrente verías su mano al revés.',
  'Pregúntale: «¿Hacia dónde apuntan las patitas de la E?». Él señala con la mano y tú tocas esa flecha.',
  'La primera línea es de práctica: no cuenta.',
];

/** Explicación de la carta de abanico, antes de la primera vuelta. */
export const COMO_ABANICO = [
  'Ahora viene la carta de abanico: líneas como los rayos de un reloj.',
  'Pregúntale: «¿Alguna línea se ve más negra o más marcada que las otras?».',
  'Si todas se ven iguales, toca «Todas iguales». Es lo más común.',
  'Si dice que sí, pídele el número de esa línea y toca el botón con ese número.',
];

export function textoColocar(p: PasoColocar, primero = false): { titulo: string; lineas: string[] } {
  if (p.lugar === 'cerca' && p.ojo) {
    return {
      titulo: `Prueba de cerca: ${NOMBRE_OJO[p.ojo]}`,
      lineas: [
        'Saca el celular de la bandeja.',
        `Apoya un extremo de la tira de cartón de 40 cm en la mejilla del niño, bajo el ${NOMBRE_OJO[p.ojo]}, y sostén el celular en el otro extremo.`,
        `Tapa el ${OTRO_OJO[p.ojo]} con el oclusor.`,
      ],
    };
  }
  const lineas: string[] = [];
  if (p.quitar === 'clip') lineas.push('Sube la tapa +2.00 de la caja.');
  if (p.quitar === 'estenopeico') lineas.push('Quita el estenopeico.');
  if (primero) {
    lineas.push('Pon el celular sin funda en la bandeja, con la pantalla apoyada contra el tope y la esponja detrás.');
  }
  lineas.push(`Pon el pasador en ${p.lugar}: desliza la bandeja hasta el agujero ${p.lugar} y atraviésalo con el pasador.`);
  if (p.accesorio === 'clip') lineas.push('Baja la tapa +2.00 de la caja.');
  if (p.accesorio === 'estenopeico') {
    lineas.push('Pon el estenopeico (el oclusor con agujeritos) delante de los lentes de la caja.');
  }
  if (primero) lineas.push(...COMO_RESPONDE);
  if (p.nota === 'abanico') lineas.push(...COMO_ABANICO);
  return { titulo: `Pon el pasador en ${p.lugar}`, lineas };
}

export const TEXTO_SEMAFORO: Record<Semaforo, string> = {
  VERDE: 'Verde',
  AMARILLO: 'Amarillo',
  ROJO: 'Rojo',
};

export const TEXTO_INDICACION: Record<Indicacion, string> = {
  derivar: 'Derivar a evaluación profesional',
  'no-derivar': 'No necesita derivación',
  repetir: 'Repetir la prueba',
  'repetir-otro-celular': 'Repetir la prueba con otro celular',
};

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

export function textoAgudeza(o: ResultadoOjo, corte: string): string {
  if (o.pasaLejos) return `${corte} o mejor`;
  return o.umbral === '<6/60' ? 'menor que 6/60' : (o.umbral ?? '—');
}

/** −1,94 D */
export function textoDioptrias(d: number): string {
  return `${d.toFixed(2).replace('.', ',').replace('-', '−')} D`;
}
