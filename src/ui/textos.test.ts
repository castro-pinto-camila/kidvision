import { describe, expect, it } from 'vitest';
import type { PasoColocar } from '../logic/pasos';
import { textoColocar } from './textos';

const paso = (cambios: Partial<PasoColocar>): PasoColocar => ({
  tipo: 'colocar',
  ojo: null,
  lugar: 'R0',
  accesorio: null,
  quitar: null,
  moverPasador: true,
  nota: null,
  ...cambios,
});

describe('título de la pantalla de colocar', () => {
  it('dice «Pon el pasador» cuando la ranura cambia', () => {
    const t = textoColocar(paso({ lugar: 'R4' }));
    expect(t.titulo).toBe('Pon el pasador en R4');
    expect(t.lineas.join(' ')).toContain('Pon el pasador en R4');
  });

  it('si el celular ya está en la ranura y solo baja la tapa, no menciona el pasador', () => {
    const t = textoColocar(paso({ accesorio: 'clip', moverPasador: false }));
    expect(t.titulo).toBe('Baja la tapa +2.00');
    expect(t.lineas.join(' ')).not.toContain('pasador');
  });

  it('subir la tapa, quitar o poner el estenopeico y el abanico tienen su propio título', () => {
    expect(textoColocar(paso({ quitar: 'clip', moverPasador: false })).titulo).toBe('Sube la tapa +2.00');
    expect(textoColocar(paso({ accesorio: 'estenopeico', moverPasador: false })).titulo).toBe('Pon el estenopeico');
    expect(textoColocar(paso({ quitar: 'estenopeico', moverPasador: false })).titulo).toBe('Quita el estenopeico');
    expect(textoColocar(paso({ nota: 'abanico', moverPasador: false })).titulo).toBe('Ahora, la carta de abanico');
  });

  it('al cambiar de ranura con la tapa abajo, el pasador va primero y la tapa se explica en las líneas', () => {
    const t = textoColocar(paso({ lugar: 'R0', accesorio: 'clip', moverPasador: true }));
    expect(t.titulo).toBe('Pon el pasador en R0');
    expect(t.lineas.join(' ')).toContain('Baja la tapa +2.00');
  });
});
