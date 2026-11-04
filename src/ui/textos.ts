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
  lejos: 'Lejos',
  umbral: 'Agudeza',
  control: 'Control',
  clip: 'Clip +2.00',
  remoto: 'Punto remoto',
  estenopeico: 'Estenopeico',
  cerca: 'Cerca',
};

export function textoColocar(p: PasoColocar): { titulo: string; lineas: string[] } {
  if (p.lugar === 'cerca' && p.ojo) {
    return {
      titulo: `Prueba de cerca: ${NOMBRE_OJO[p.ojo]}`,
      lineas: [
        'Saca el celular de la caja.',
        `Sostenlo a 40 cm del ${NOMBRE_OJO[p.ojo]}: mide con el cordón.`,
        `Tapa el ${OTRO_OJO[p.ojo]} con el oclusor.`,
      ],
    };
  }
  const lineas: string[] = [];
  if (p.quitar === 'clip') lineas.push('Retira los lentes de +2.00.');
  if (p.quitar === 'estenopeico') lineas.push('Quita el estenopeico.');
  lineas.push(`Coloca el celular en la ranura ${p.lugar}.`);
  if (p.accesorio === 'clip') {
    lineas.push('Sostén los lentes de lectura de +2.00 delante de la caja, cubriendo los dos ojos.');
  }
  if (p.accesorio === 'estenopeico') {
    lineas.push('Pon el estenopeico (el oclusor con agujeritos) delante de los lentes de la caja.');
  }
  return { titulo: `Ranura ${p.lugar}`, lineas };
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
