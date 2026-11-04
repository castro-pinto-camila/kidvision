/**
 * Genera los íconos PNG de la app (un ojo blanco sobre azul) sin librerías:
 * solo zlib, que viene con Node. Uso: npm run iconos
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const AZUL = [37, 99, 235];
const BLANCO = [255, 255, 255];

const TABLA_CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(datos: Buffer): number {
  let c = 0xffffffff;
  for (const b of datos) c = TABLA_CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function bloque(tipo: string, datos: Buffer): Buffer {
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length);
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cuerpo));
  return Buffer.concat([largo, cuerpo, crc]);
}

/** Color de un punto (u, v en 0..1): fondo azul, ojo blanco con pupila azul. */
function color(u: number, v: number, margen: number): number[] {
  const x = (u - 0.5) / (0.5 - margen);
  const y = (v - 0.5) / (0.5 - margen);
  // Forma de ojo: intersección de dos círculos grandes (almendra).
  const enOjo = x * x + (Math.abs(y) + 0.75) ** 2 < 1.6 ** 2 && Math.abs(x) < 0.82;
  const pupila = x * x + y * y < 0.3 ** 2;
  const brillo = (x + 0.1) ** 2 + (y + 0.1) ** 2 < 0.08 ** 2;
  if (brillo) return BLANCO;
  if (pupila) return AZUL;
  if (enOjo) return BLANCO;
  return AZUL;
}

/** PNG cuadrado de `lado` píxeles, con 4 × 4 muestras por píxel para bordes suaves. */
function png(lado: number, margen: number): Buffer {
  const filas: Buffer[] = [];
  const n = 4;
  for (let j = 0; j < lado; j++) {
    const fila = Buffer.alloc(1 + lado * 4); // byte de filtro (0) + RGBA
    for (let i = 0; i < lado; i++) {
      const suma = [0, 0, 0];
      for (let a = 0; a < n; a++) {
        for (let b = 0; b < n; b++) {
          const c = color((i + (a + 0.5) / n) / lado, (j + (b + 0.5) / n) / lado, margen);
          suma[0] += c[0];
          suma[1] += c[1];
          suma[2] += c[2];
        }
      }
      const o = 1 + i * 4;
      fila[o] = Math.round(suma[0] / (n * n));
      fila[o + 1] = Math.round(suma[1] / (n * n));
      fila[o + 2] = Math.round(suma[2] / (n * n));
      fila[o + 3] = 255;
    }
    filas.push(fila);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(lado, 0);
  ihdr.writeUInt32BE(lado, 4);
  ihdr[8] = 8; // bits por canal
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloque('IHDR', ihdr),
    bloque('IDAT', deflateSync(Buffer.concat(filas))),
    bloque('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync('public/iconos', { recursive: true });
// Margen amplio: los íconos «maskable» de Android recortan los bordes.
writeFileSync('public/iconos/icono-192.png', png(192, 0.18));
writeFileSync('public/iconos/icono-512.png', png(512, 0.18));
writeFileSync('public/iconos/apple-touch-icon.png', png(180, 0.14));
console.log('Íconos escritos en public/iconos/.');
