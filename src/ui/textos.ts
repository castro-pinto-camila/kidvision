/**
 * Textos para el docente.
 */
import type { Indicacion, Semaforo } from '../logic/clasificacion';
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
  'Ahora viene la carta de abanico: rectas que salen del centro, con un número del 1 al 6 en cada punta. Cada recta tiene el mismo número en sus dos puntas.',
  'Pregúntale: «¿Alguna línea se ve más negra o más marcada que las otras?».',
  'Si todas se ven iguales, toca «Todas iguales». Es lo más común.',
  'Si dice que sí, pídele el número de esa línea y toca el botón con ese número. Ejemplo: dice «3», tocas «3». Cada botón trae dibujada la línea que representa.',
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
  if (p.moverPasador) {
    lineas.push(`Pon el pasador en ${p.lugar}: desliza la bandeja hasta el agujero ${p.lugar} y atraviésalo con el pasador.`);
  }
  if (p.accesorio === 'clip') lineas.push('Baja la tapa +2.00 de la caja.');
  if (p.accesorio === 'estenopeico') {
    lineas.push('Pon el estenopeico (el oclusor con agujeritos) delante de los lentes de la caja.');
  }
  if (primero) lineas.push(...COMO_RESPONDE);
  if (p.nota === 'abanico') lineas.push(...COMO_ABANICO);
  // El título dice solo lo que hay que hacer: el pasador, únicamente si cambia de ranura.
  const titulo = p.moverPasador
    ? `Pon el pasador en ${p.lugar}`
    : p.accesorio === 'clip'
      ? 'Baja la tapa +2.00'
      : p.accesorio === 'estenopeico'
        ? 'Pon el estenopeico'
        : p.quitar === 'clip'
          ? 'Sube la tapa +2.00'
          : p.quitar === 'estenopeico'
            ? 'Quita el estenopeico'
            : 'Ahora, la carta de abanico';
  return { titulo, lineas };
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

export { TEXTO_CATEGORIA, TEXTO_MOTIVO, textoAgudeza, textoDioptrias } from '../logic/constancia';
