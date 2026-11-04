import { describe, expect, it } from 'vitest';
import { nombreArchivoSalon } from './resumen';

const HOY = new Date('2026-11-04T15:00:00Z');

describe('nombre del archivo CSV del salón', () => {
  it('lleva el colegio y el salón, sin tildes ni espacios', () => {
    expect(nombreArchivoSalon('IE 1234 San Martín', '5.º A', HOY)).toBe('kidvision-ie-1234-san-martin-5-a-2026-11-04.csv');
    expect(nombreArchivoSalon('IE 123', '3B', HOY)).toBe('kidvision-ie-123-3b-2026-11-04.csv');
  });

  it('sin salón (datos viejos) usa solo el colegio, y sin nada dice «salon»', () => {
    expect(nombreArchivoSalon('IE 123', '', HOY)).toBe('kidvision-ie-123-2026-11-04.csv');
    expect(nombreArchivoSalon('', '', HOY)).toBe('kidvision-salon-2026-11-04.csv');
  });
});
