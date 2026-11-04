/**
 * Escenarios de la guía de resultados (docs/guia-resultados.md): niños simulados
 * a los que se les hace la prueba completa con el flujo y la clasificación reales.
 *
 * Cada escenario trae lo que debe salir según las reglas del SPEC.md, escrito a
 * mano. Una prueba comprueba que la app da exactamente eso; la guía se genera
 * con `npm run guia` y se compara con lo que se ve en el celular.
 * Solo se usa para pruebas y documentación, no en la app.
 */
import { CAJA_POR_DEFECTO } from '../core/caja';
import type { Pantalla } from '../core/optotipos';
import { BOTONES_ABANICO } from './abanico';
import type { Categoria, Indicacion, Semaforo } from './clasificacion';
import { PruebaVisual, type Paso, type ResultadoOjo, type ResultadoSesion } from './flujo';
import { contarAciertos } from './linea';
import { azarConSemilla, responderComo, type Nino, type OjoSimulado } from './ninoSimulado';
import type { Evento, Ojo } from './pasos';

/** 0,06 mm por píxel físico, como las tablas del SPEC.md. */
export const PANTALLA_GUIA: Pantalla = { pxPorMm: 1 / 0.06, dpr: 1 };

export interface EsperadoOjo {
  semaforo: Semaforo;
  categorias: Categoria[];
  puntoRemoto: string | null;
  posibleAstigmatismo?: boolean;
}

export interface Escenario {
  id: string;
  titulo: string;
  /** Cómo es el niño, en palabras simples. */
  descripcion: string;
  nino: Nino;
  /** Lo que debe salir según las reglas del SPEC. */
  esperado: {
    semaforo: Semaforo;
    indicacion: Indicacion;
    ojos: Record<Ojo, EsperadoOjo>;
  };
  /** Por qué sale eso, con las reglas del SPEC. */
  regla: string;
}

const ambos = (o: OjoSimulado): Nino => ({ OD: o, OI: o });

export const ESCENARIOS: Escenario[] = [
  {
    id: 'normal',
    titulo: 'Vista normal',
    descripcion: 'Lee la línea 6/9 de lejos con los dos ojos, no la lee con los lentes de +2.00 (se le nubla), lee de cerca y no ve ninguna línea más negra en el abanico.',
    nino: ambos({ refraccion: 0 }),
    esperado: {
      semaforo: 'VERDE',
      indicacion: 'no-derivar',
      ojos: {
        OD: { semaforo: 'VERDE', categorias: ['normal'], puntoRemoto: null },
        OI: { semaforo: 'VERDE', categorias: ['normal'], puntoRemoto: null },
      },
    },
    regla: 'Normal = pasa de lejos + NO pasa con +2.00 + pasa de cerca. Si los dos ojos son verdes, no se deriva.',
  },
  {
    id: 'miopia-leve',
    titulo: 'Miopía leve (−1,0 D) en los dos ojos',
    descripcion: 'No lee 6/9 de lejos. Al acercar el celular, ve nítido en R2 y confirma.',
    nino: ambos({ refraccion: -1 }),
    esperado: {
      semaforo: 'ROJO',
      indicacion: 'derivar',
      ojos: {
        OD: { semaforo: 'ROJO', categorias: ['miopia'], puntoRemoto: 'R2' },
        OI: { semaforo: 'ROJO', categorias: ['miopia'], puntoRemoto: 'R2' },
      },
    },
    regla: 'Miopía = falla de lejos y se encuentra el punto remoto (la primera ranura donde lee y lo confirma). La miopía estimada es la vergencia de esa ranura en el ojo. Cualquier ojo rojo = derivar.',
  },
  {
    id: 'miopia-moderada',
    titulo: 'Miopía moderada (−3,0 D)',
    descripcion: 'Igual que la anterior, pero necesita acercar el celular hasta R6.',
    nino: ambos({ refraccion: -3 }),
    esperado: {
      semaforo: 'ROJO',
      indicacion: 'derivar',
      ojos: {
        OD: { semaforo: 'ROJO', categorias: ['miopia'], puntoRemoto: 'R6' },
        OI: { semaforo: 'ROJO', categorias: ['miopia'], puntoRemoto: 'R6' },
      },
    },
    regla: 'Igual que la miopía leve: el punto remoto es la primera ranura donde lee y se confirma.',
  },
  {
    id: 'miopia-un-ojo',
    titulo: 'Miopía solo en el ojo derecho (−2,0 D)',
    descripcion: 'El ojo izquierdo es normal; el derecho es miope.',
    nino: { OD: { refraccion: -2 }, OI: { refraccion: 0 } },
    esperado: {
      semaforo: 'ROJO',
      indicacion: 'derivar',
      ojos: {
        OD: { semaforo: 'ROJO', categorias: ['miopia'], puntoRemoto: 'R4' },
        OI: { semaforo: 'VERDE', categorias: ['normal'], puntoRemoto: null },
      },
    },
    regla: 'El semáforo del niño es el peor de los dos ojos: un ojo rojo basta para derivar.',
  },
  {
    id: 'hipermetropia',
    titulo: 'Hipermetropía (+3,0 D)',
    descripcion: 'Lee 6/9 de lejos (su ojo acomoda), pero también lo lee con los lentes de +2.00.',
    nino: ambos({ refraccion: 3 }),
    esperado: {
      semaforo: 'ROJO',
      indicacion: 'derivar',
      ojos: {
        OD: { semaforo: 'ROJO', categorias: ['hipermetropia'], puntoRemoto: null },
        OI: { semaforo: 'ROJO', categorias: ['hipermetropia'], puntoRemoto: null },
      },
    },
    regla: 'Hipermetropía = pasa de lejos y TAMBIÉN pasa con +2.00 (el ojo normal se nubla con esos lentes, el hipermétrope no). No se mide cuánto.',
  },
  {
    id: 'hipermetropia-cerca',
    titulo: 'Hipermetropía que solo se nota de cerca (+1,0 D)',
    descripcion: 'Lee 6/9 de lejos, se nubla con los lentes de +2.00 (como un niño normal), pero no lee 6/9 de cerca.',
    nino: ambos({ refraccion: 1, acomodacion: 1.5 }),
    esperado: {
      semaforo: 'ROJO',
      indicacion: 'derivar',
      ojos: {
        OD: { semaforo: 'ROJO', categorias: ['hipermetropia'], puntoRemoto: null },
        OI: { semaforo: 'ROJO', categorias: ['hipermetropia'], puntoRemoto: null },
      },
    },
    regla: 'También es hipermetropía si pasa de lejos y NO pasa de cerca. «Normal» exige pasar de cerca, así que no es verde.',
  },
  {
    id: 'astigmatismo',
    titulo: 'Astigmatismo con mala agudeza',
    descripcion: 'Es miope (−1,0 D) y en el abanico ve más negra siempre la misma línea (vertical), en las dos vueltas aunque la carta gire.',
    nino: ambos({ refraccion: -1, ejeAstigmatismo: 90 }),
    esperado: {
      semaforo: 'ROJO',
      indicacion: 'derivar',
      ojos: {
        OD: { semaforo: 'ROJO', categorias: ['miopia', 'astigmatismo'], puntoRemoto: 'R2' },
        OI: { semaforo: 'ROJO', categorias: ['miopia', 'astigmatismo'], puntoRemoto: 'R2' },
      },
    },
    regla: 'Astigmatismo = el abanico es consistente (las dos líneas elegidas, ya sumado el giro de la carta, difieren 15° o menos) Y la agudeza falla (de lejos o de cerca).',
  },
  {
    id: 'posible-astigmatismo',
    titulo: 'Posible astigmatismo (por validar)',
    descripcion: 'Ve bien de lejos y de cerca, pero en el abanico elige siempre la misma línea.',
    nino: ambos({ refraccion: 0, ejeAstigmatismo: 90 }),
    esperado: {
      semaforo: 'VERDE',
      indicacion: 'no-derivar',
      ojos: {
        OD: { semaforo: 'VERDE', categorias: ['normal'], puntoRemoto: null, posibleAstigmatismo: true },
        OI: { semaforo: 'VERDE', categorias: ['normal'], puntoRemoto: null, posibleAstigmatismo: true },
      },
    },
    regla: 'Con buena agudeza de lejos y de cerca, un abanico consistente NO es astigmatismo: se anota «posible astigmatismo (por validar)» y no cambia el semáforo, porque la pantalla puede hacer ver más negras las líneas verticales y horizontales.',
  },
  {
    id: 'abanico-no-consistente',
    titulo: 'Abanico que no se repite',
    descripcion: 'Es miope (−1,0 D). En el abanico elige una línea distinta cada vez que la carta gira (en la práctica, elige «todas iguales»).',
    nino: ambos({ refraccion: -1, ejeAstigmatismo: null }),
    esperado: {
      semaforo: 'ROJO',
      indicacion: 'derivar',
      ojos: {
        OD: { semaforo: 'ROJO', categorias: ['miopia'], puntoRemoto: 'R2' },
        OI: { semaforo: 'ROJO', categorias: ['miopia'], puntoRemoto: 'R2' },
      },
    },
    regla: '«Todas iguales» en cualquiera de las dos vueltas = abanico no consistente = no hay astigmatismo.',
  },
  {
    id: 'otra-causa',
    titulo: 'Otra causa (no mejora con nada)',
    descripcion: 'No lee de lejos, no encuentra ninguna ranura donde vea mejor y tampoco mejora con el estenopeico (el agujerito).',
    nino: ambos({ refraccion: 0, puedeVerNitido: false }),
    esperado: {
      semaforo: 'ROJO',
      indicacion: 'derivar',
      ojos: {
        OD: { semaforo: 'ROJO', categorias: ['otraCausa'], puntoRemoto: null },
        OI: { semaforo: 'ROJO', categorias: ['otraCausa'], puntoRemoto: null },
      },
    },
    regla: 'Otra causa = falla de lejos, sin punto remoto, y NO mejora con el estenopeico. Se deriva.',
  },
  {
    id: 'indeterminado',
    titulo: 'Indeterminado (mejora con el estenopeico)',
    descripcion: 'No lee de lejos y no encuentra punto remoto, pero con el estenopeico lee mejor.',
    nino: ambos({ refraccion: 0, puedeVerNitido: false, borrosa: 60, conEstenopeico: 12 }),
    esperado: {
      semaforo: 'ROJO',
      indicacion: 'derivar',
      ojos: {
        OD: { semaforo: 'ROJO', categorias: ['indeterminado'], puntoRemoto: null },
        OI: { semaforo: 'ROJO', categorias: ['indeterminado'], puntoRemoto: null },
      },
    },
    regla: 'Indeterminado = falla de lejos, sin punto remoto, y SÍ mejora con el estenopeico (parece un problema de enfoque que la caja no alcanza a medir). Se deriva.',
  },
  {
    id: 'miopia-mayor-5',
    titulo: 'Miopía mayor a −5 D (más de lo que mide la caja)',
    descripcion: 'Es muy miope (−7,0 D): no lee en ninguna ranura, de R1 a R10, y el estenopeico (el agujerito) tampoco le mejora la lectura.',
    nino: ambos({ refraccion: -7 }),
    esperado: {
      semaforo: 'ROJO',
      indicacion: 'derivar',
      ojos: {
        OD: { semaforo: 'ROJO', categorias: ['otraCausa'], puntoRemoto: null },
        OI: { semaforo: 'ROJO', categorias: ['otraCausa'], puntoRemoto: null },
      },
    },
    regla: 'Sin punto remoto, la app no puede decir cuánta miopía hay. Si el estenopeico no mejora sale «otra causa»; si mejora, «indeterminado» (que puede ser una miopía mayor a −5 D). Los dos son rojos: se deriva.',
  },
  {
    id: 'respuestas-iguales',
    titulo: 'Respuestas dudosas (siempre la misma flecha)',
    descripcion: 'El niño responde siempre «arriba», sin mirar.',
    nino: ambos({ refraccion: 0, respondeSiempre: 'arriba' }),
    esperado: {
      semaforo: 'AMARILLO',
      indicacion: 'repetir',
      ojos: {
        OD: { semaforo: 'AMARILLO', categorias: ['otraCausa'], puntoRemoto: null },
        OI: { semaforo: 'AMARILLO', categorias: ['otraCausa'], puntoRemoto: null },
      },
    },
    regla: 'Cinco respuestas iguales seguidas = resultado dudoso: el semáforo pasa a amarillo y se indica repetir la prueba.',
  },
];

// --- Cómo se ve cada paso ---------------------------------------------------

const OJO: Record<Ojo, string> = { OD: 'ojo derecho', OI: 'ojo izquierdo' };
const FLECHA = { arriba: '↑', abajo: '↓', derecha: '→', izquierda: '←', nose: '?' } as const;
const PRUEBA: Record<string, string> = {
  practica: 'práctica (no cuenta)',
  lejos: 'de lejos',
  umbral: 'para ver cuánto lee',
  control: 'de control',
  clip: 'con los lentes de +2.00',
  remoto: 'buscando el punto remoto',
  estenopeico: 'con el estenopeico',
  cerca: 'de cerca (40 cm)',
};

function describirPaso(paso: Paso, evento: Evento | null): string {
  switch (paso.tipo) {
    case 'colocar': {
      if (paso.lugar === 'cerca') {
        return `**Prueba de cerca, ${OJO[paso.ojo!]}:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.`;
      }
      const acciones = [
        paso.quitar === 'clip' ? 'sube la tapa +2.00' : paso.quitar === 'estenopeico' ? 'quita el estenopeico' : '',
        paso.moverPasador ? `pon el pasador en ${paso.lugar.toUpperCase()}` : '',
        paso.accesorio === 'clip' ? 'baja la tapa +2.00' : paso.accesorio === 'estenopeico' ? 'pon el estenopeico' : '',
      ].filter(Boolean);
      const texto = acciones.length > 0 ? acciones.join(', ') : 'lee la explicación de la carta de abanico';
      return `**${texto[0].toUpperCase()}${texto.slice(1)}** y confirma.`;
    }
    case 'espera':
      return `**Espera ${paso.segundos} s** con los dos ojos mirando el círculo azul, y confirma.`;
    case 'linea': {
      const toques = evento?.tipo === 'linea' ? evento.toques : [];
      const respuestas = toques.map((t) => t.respuesta);
      const aciertos = contarAciertos(paso.orientaciones, respuestas);
      const mostradas = paso.orientaciones.slice(0, respuestas.length).map((d) => FLECHA[d]).join(' ');
      const toco = respuestas.map((r) => FLECHA[r]).join(' ');
      const pasa = aciertos >= paso.necesarios;
      const resultado = paso.prueba === 'practica' ? '' : pasa ? ` → **pasa** (hacen falta ${paso.necesarios})` : ` → **no pasa** (hacen falta ${paso.necesarios})`;
      return `${OJO[paso.ojo][0].toUpperCase()}${OJO[paso.ojo].slice(1)}, línea ${paso.nivel.nombre} ${paso.lugar.id === 'cerca' ? 'a 40 cm' : 'en ' + paso.lugar.id.toUpperCase()}, prueba ${PRUEBA[paso.prueba]}: las «E» apuntan ${mostradas}; tocas ${toco}; aciertos ${aciertos} de ${respuestas.length}${resultado}.`;
    }
    case 'abanico': {
      const eleccion = evento?.tipo === 'abanico' ? evento.eleccion : 'iguales';
      const giro = paso.rotacion === 0 ? 'carta sin girar' : `carta girada ${paso.rotacion}°`;
      const accion = eleccion === 'iguales' ? 'el niño ve todas iguales → tocas «Todas iguales»' : `el niño dice «${BOTONES_ABANICO[eleccion]}» → tocas «${BOTONES_ABANICO[eleccion]}»`;
      return `Abanico, ${OJO[paso.ojo]}, vuelta ${paso.vuelta} (${giro}): ${accion}.`;
    }
    case 'fin':
      return 'Fin de la prueba.';
  }
}

export interface Corrida {
  pasos: string[];
  resultado: ResultadoSesion;
}

/** Hace la prueba completa con el niño simulado y anota, paso a paso, qué toca el docente. */
export function correrEscenario(e: Escenario): Corrida {
  const prueba = new PruebaVisual({ caja: CAJA_POR_DEFECTO, pantalla: PANTALLA_GUIA, azar: azarConSemilla(7) });
  const pasos: string[] = [];
  while (prueba.paso.tipo !== 'fin') {
    const paso = prueba.paso;
    const evento = responderComo(e.nino, paso);
    pasos.push(describirPaso(paso, evento));
    prueba.responder(evento);
  }
  return { pasos, resultado: prueba.paso.resultado };
}

// --- Texto de la guía -------------------------------------------------------

const NOMBRE_CATEGORIA: Record<Categoria, string> = {
  miopia: 'miopía',
  hipermetropia: 'hipermetropía',
  astigmatismo: 'astigmatismo',
  otraCausa: 'otra causa',
  indeterminado: 'indeterminado',
  normal: 'normal',
};
const NOMBRE_INDICACION: Record<Indicacion, string> = {
  derivar: 'Derivar',
  'no-derivar': 'No derivar',
  repetir: 'Repetir la prueba',
  'repetir-otro-celular': 'Repetir con otro celular',
};

const lista = (c: Categoria[]) => c.map((x) => NOMBRE_CATEGORIA[x]).join(' + ');

function resumenOjo(o: ResultadoOjo): string {
  const partes = [
    `semáforo **${o.semaforo}**`,
    `categoría: ${lista(o.categorias) || '—'}`,
    o.puntoRemoto ? `punto remoto ${o.puntoRemoto} (miopía estimada ${o.miopiaEstimadaD!.toFixed(2).replace('.', ',')} D)` : 'sin punto remoto',
  ];
  if (o.posibleAstigmatismo) partes.push('«posible astigmatismo (por validar)»');
  if (o.dudoso) partes.push(`dudoso: ${o.motivosDudoso.join(', ')}`);
  return partes.join(' · ');
}

export function guiaMarkdown(): string {
  const bloques = ESCENARIOS.map((e, i) => {
    const { pasos, resultado } = correrEscenario(e);
    const filas = pasos.map((p, n) => `${n + 1}. ${p}`).join('\n');
    return `## ${i + 1}. ${e.titulo}

**Cómo es el niño:** ${e.descripcion}

**Qué debe salir:** semáforo **${e.esperado.semaforo}** · indicación **${NOMBRE_INDICACION[e.esperado.indicacion]}**

**Por qué (reglas del SPEC):** ${e.regla}

**Resultado que da la app:**
- Ojo derecho: ${resumenOjo(resultado.ojos.OD)}
- Ojo izquierdo: ${resumenOjo(resultado.ojos.OI)}
- Niño: semáforo **${resultado.semaforo}** · **${NOMBRE_INDICACION[resultado.indicacion]}**

<details>
<summary>Secuencia completa de la prueba (${pasos.length} pasos)</summary>

${filas}

</details>
`;
  }).join('\n');

  return `# Guía de resultados: qué secuencia da cada resultado

Este archivo lo genera \`npm run guia\`; no se edita a mano. Cada escenario es un niño simulado al que se le hace la prueba completa con el flujo y la clasificación reales de la app. Una prueba automática comprueba que lo que dice «Qué debe salir» (escrito a mano desde las reglas del SPEC) coincide con lo que da la app.

**Cómo usarla para revisar la app en tu celular:** elige un escenario, haz la prueba tocando exactamente la secuencia de la lista (puedes equivocarte a propósito en las flechas, tal como dice cada paso) y compara el semáforo, la categoría y la indicación con los de este archivo.

## Reglas en una mirada

| Resultado de un ojo | Cuándo sale |
| --- | --- |
| **Normal** (verde) | Pasa de lejos, NO pasa con +2.00 y pasa de cerca |
| **Miopía** (rojo) | Falla de lejos y se encuentra el punto remoto |
| **Hipermetropía** (rojo) | Pasa de lejos y pasa con +2.00, o pasa de lejos y falla de cerca |
| **Astigmatismo** (rojo) | Abanico consistente y falla la agudeza (de lejos o de cerca) |
| **Otra causa** (rojo) | Falla de lejos, sin punto remoto, y no mejora con el estenopeico |
| **Indeterminado** (rojo) | Falla de lejos, sin punto remoto, y mejora con el estenopeico |
| **Dudoso** (amarillo) | Respuestas iguales seguidas, punto remoto sin confirmar, límite del dispositivo, o falla una línea grande y acierta una menor |

**Niño:** rojo si algún ojo es rojo; si no, amarillo si alguno es amarillo; si no, verde. Rojo = derivar · verde = no derivar · amarillo = repetir (con otro celular si algún ojo llegó al límite del dispositivo).

Pasar una línea = 4 aciertos de 5 (3 de 5 al medir el umbral).

${bloques}`;
}
