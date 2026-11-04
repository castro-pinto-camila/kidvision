/**
 * Arranque y navegación entre pantallas (#/, #/config, #/prueba, #/resultado).
 */
import { configuracionPorDefecto, guardarConfiguracion, leerConfiguracion, type Configuracion } from '../data/config';
import { abrirDB } from '../data/db';
import type { ResultadoSesion } from '../logic/flujo';
import { montarCalibracion } from './calibracion';
import { montarConfiguracion } from './configuracion';
import { liberarPantalla, prepararPantalla } from './dispositivo';
import { montarInicio } from './inicio';
import { montarPrueba } from './prueba';
import { montarResultado } from './resultado';

interface Estado {
  db: IDBDatabase | null;
  config: Configuracion;
  avisos: string[];
  enPrueba: boolean;
  resultado: ResultadoSesion | null;
  avisoInicio?: string;
  /** A dónde volver al terminar la calibración. */
  volverDeCalibrar: string;
}

export async function iniciarApp(raiz: HTMLElement): Promise<void> {
  const estado: Estado = {
    db: null,
    config: configuracionPorDefecto(),
    avisos: [],
    enPrueba: false,
    resultado: null,
    volverDeCalibrar: '#/',
  };
  try {
    estado.db = await abrirDB();
    estado.config = await leerConfiguracion(estado.db);
  } catch {
    estado.avisoInicio = 'Este navegador no deja guardar datos: la calibración se perderá al cerrar la app.';
  }

  let desmontar: () => void = () => {};
  const ir = (ruta: string) => {
    if (location.hash === ruta) mostrar();
    else location.hash = ruta;
  };

  async function guardar(c: Configuracion): Promise<void> {
    estado.config = c;
    if (estado.db) await guardarConfiguracion(estado.db, c);
  }

  function mostrar(): void {
    desmontar();
    const ruta = location.hash || '#/';
    if (ruta !== '#/prueba' && estado.enPrueba) {
      // Se salió de la prueba con el botón «atrás».
      estado.enPrueba = false;
      void liberarPantalla();
    }

    if (ruta === '#/config') {
      desmontar = montarConfiguracion(raiz, estado.config, {
        guardar,
        calibrar: () => {
          estado.volverDeCalibrar = '#/config';
          ir('#/calibrar');
        },
        volver: () => ir('#/'),
      });
    } else if (ruta === '#/calibrar') {
      desmontar = montarCalibracion(raiz, estado.config, guardar, () => ir(estado.volverDeCalibrar));
    } else if (ruta === '#/prueba' && estado.enPrueba && estado.config.pxPorMm !== null) {
      try {
        desmontar = montarPrueba(raiz, {
          config: { ...estado.config, pxPorMm: estado.config.pxPorMm },
          avisos: estado.avisos,
          guardarOrientacion: (invertida, intercambiadas) => {
            if (
              invertida === estado.config.pantallaInvertida &&
              intercambiadas === estado.config.mitadesIntercambiadas
            ) {
              return;
            }
            void guardar({ ...estado.config, pantallaInvertida: invertida, mitadesIntercambiadas: intercambiadas });
          },
          alTerminar: (r) => {
            estado.enPrueba = false;
            estado.resultado = r;
            ir('#/resultado');
          },
          alSalir: () => {
            estado.enPrueba = false;
            ir('#/');
          },
        });
      } catch (e) {
        estado.enPrueba = false;
        void liberarPantalla();
        estado.avisoInicio = e instanceof Error ? e.message : String(e);
        ir('#/');
      }
    } else if (ruta === '#/resultado' && estado.resultado) {
      desmontar = montarResultado(raiz, estado.resultado, () => ir('#/'));
    } else {
      const aviso = estado.avisoInicio;
      estado.avisoInicio = undefined;
      desmontar = montarInicio(
        raiz,
        estado.config,
        {
          empezar: async () => {
            // Se llama dentro del toque: el navegador lo exige para la pantalla completa.
            estado.avisos = await prepararPantalla();
            estado.enPrueba = true;
            ir('#/prueba');
          },
          configurar: () => ir('#/config'),
          calibrar: () => {
            estado.volverDeCalibrar = '#/';
            ir('#/calibrar');
          },
        },
        aviso,
      );
    }
  }

  window.addEventListener('hashchange', mostrar);
  mostrar();
}
