/**
 * Arranque y navegación entre pantallas:
 *   #/                 Mi salón
 *   #/nino/<código>    Preparar al niño
 *   #/prueba           La prueba
 *   #/resultado        Resultado de la prueba recién hecha
 *   #/constancia/<id>  Constancia de una evaluación guardada
 *   #/resumen          Resumen del salón
 *   #/inicio          Portada (primera vez)
 *   #/bienvenida      Primera vez: colegio y calibración
 *   #/config, #/calibrar
 */
import {
  configuracionPorDefecto,
  guardarConfiguracion,
  leerConfiguracion,
  type Configuracion,
} from '../data/config';
import { abrirDB } from '../data/db';
import {
  borrarSalon,
  evaluacionesDe,
  guardarEvaluacion,
  leerEstudiantes,
  leerEvaluacion,
  type Estudiante,
} from '../data/salon';
import type { ResultadoSesion } from '../logic/flujo';
import { estadoPreparacion, primerPendiente, type AccionPaso } from '../logic/preparacion';
import { montarBienvenida } from './bienvenida';
import { montarPortada } from './portada';
import { montarCalibracion } from './calibracion';
import { montarConfiguracion } from './configuracion';
import { montarConstancia } from './constancia';
import { liberarPantalla, prepararPantalla } from './dispositivo';
import { h } from './dom';
import { montarPreparar } from './preparar';
import { montarPrueba } from './prueba';
import { montarResultado } from './resultado';
import { montarResumen } from './resumen';
import { montarSalon } from './salon';

interface Estado {
  db: IDBDatabase | null;
  config: Configuracion;
  avisos: string[];
  enPrueba: boolean;
  /** Modo práctica (sin caja): el resultado no vale y nunca se guarda. */
  practica: boolean;
  /** Niño de la prueba en curso (null en práctica). */
  estudiante: Estudiante | null;
  resultado: ResultadoSesion | null;
  guardado: 'ok' | 'error' | null;
  idEvaluacion: number | null;
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
    practica: false,
    estudiante: null,
    resultado: null,
    guardado: null,
    idEvaluacion: null,
    volverDeCalibrar: '#/',
  };
  try {
    estado.db = await abrirDB();
    estado.config = await leerConfiguracion(estado.db);
  } catch {
    estado.avisoInicio = 'Este navegador no deja guardar datos: la calibración y los resultados se perderán al cerrar la app.';
  }

  let desmontar: () => void = () => {};
  /** Cambia en cada navegación: una carga asíncrona vieja no pisa la pantalla nueva. */
  let turno = 0;
  const ir = (ruta: string) => {
    if (location.hash === ruta) mostrar();
    else location.hash = ruta;
  };

  async function guardar(c: Configuracion): Promise<void> {
    estado.config = c;
    if (estado.db) await guardarConfiguracion(estado.db, c);
  }

  const preparacion = () => estadoPreparacion(estado.config, window.devicePixelRatio || 1);

  /** Lo que hace el botón de cada paso pendiente; después de calibrar se vuelve a `volverA`. */
  function hacer(accion: AccionPaso, volverA: string): void {
    if (accion === 'colegio') return ir('#/bienvenida');
    estado.volverDeCalibrar = volverA;
    ir('#/calibrar');
  }

  // Se llama dentro del toque: el navegador lo exige para la pantalla completa.
  async function empezarPrueba(estudiante: Estudiante | null): Promise<void> {
    estado.practica = estudiante === null;
    estado.estudiante = estudiante;
    estado.avisos = await prepararPantalla();
    estado.enPrueba = true;
    ir('#/prueba');
  }

  async function terminarPrueba(r: ResultadoSesion): Promise<void> {
    estado.enPrueba = false;
    estado.resultado = r;
    estado.guardado = null;
    estado.idEvaluacion = null;
    const e = estado.estudiante;
    if (!estado.practica && e && estado.db && estado.config.pxPorMm !== null) {
      try {
        estado.idEvaluacion = await guardarEvaluacion(estado.db, {
          estudiante: { ...e, colegio: estado.config.colegio },
          dispositivo: {
            pxPorMm: estado.config.pxPorMm,
            dpr: window.devicePixelRatio || 1,
            caja: {
              P: estado.config.caja.P,
              e_mm: estado.config.caja.e_mm,
              ranuras_mm: [...estado.config.caja.ranuras_mm],
            },
          },
          sesion: r,
        });
        estado.guardado = 'ok';
      } catch {
        estado.guardado = 'error';
      }
    }
    ir('#/resultado');
  }

  function cargando(): void {
    raiz.replaceChildren(h('main', { class: 'pagina' }, h('p', { class: 'nota' }, 'Cargando…')));
  }

  function mostrar(): void {
    desmontar();
    desmontar = () => {};
    const miTurno = ++turno;
    const ruta = location.hash || '#/';
    if (ruta !== '#/prueba' && estado.enPrueba) {
      // Se salió de la prueba con el botón «atrás».
      estado.enPrueba = false;
      void liberarPantalla();
    }

    if (ruta === '#/inicio') {
      // Con el colegio ya escrito, la portada se abrió a propósito desde Configuración: se puede volver.
      const yaConfigurado = estado.config.colegio.trim() !== '';
      desmontar = montarPortada(raiz, {
        comenzar: () => ir(yaConfigurado ? '#/' : '#/bienvenida'),
        volver: yaConfigurado ? () => ir('#/config') : undefined,
      });
    } else if (ruta === '#/bienvenida') {
      desmontar = montarBienvenida(raiz, {
        colegioActual: estado.config.colegio,
        preparacion: preparacion(),
        guardarColegio: (nombre) => guardar({ ...estado.config, colegio: nombre }),
        calibrar: () => hacer('calibrar', '#/bienvenida'),
        refrescar: mostrar,
        seguir: () => ir('#/'),
      });
    } else if (ruta === '#/config') {
      desmontar = montarConfiguracion(raiz, estado.config, {
        guardar,
        calibrar: () => {
          estado.volverDeCalibrar = '#/config';
          ir('#/calibrar');
        },
        borrarSalon: async () => {
          if (estado.db) await borrarSalon(estado.db);
        },
        volver: () => ir('#/'),
        acercaDe: () => ir('#/inicio'),
      });
    } else if (ruta === '#/calibrar') {
      desmontar = montarCalibracion(raiz, estado.config, guardar, () => ir(estado.volverDeCalibrar));
    } else if (ruta === '#/prueba' && estado.enPrueba && estado.config.pxPorMm !== null) {
      try {
        desmontar = montarPrueba(raiz, {
          config: { ...estado.config, pxPorMm: estado.config.pxPorMm },
          avisos: estado.avisos,
          practica: estado.practica,
          guardarOrientacion: (invertida, intercambiadas) => {
            if (
              invertida === estado.config.pantallaInvertida &&
              intercambiadas === estado.config.mitadesIntercambiadas
            ) {
              return;
            }
            void guardar({ ...estado.config, pantallaInvertida: invertida, mitadesIntercambiadas: intercambiadas });
          },
          alTerminar: (r) => void terminarPrueba(r),
          alSalir: () => {
            estado.enPrueba = false;
            ir(estado.estudiante ? `#/nino/${encodeURIComponent(estado.estudiante.codigo)}` : '#/');
          },
        });
      } catch (e) {
        estado.enPrueba = false;
        void liberarPantalla();
        estado.avisoInicio = e instanceof Error ? e.message : String(e);
        ir('#/');
      }
    } else if (ruta === '#/resultado' && estado.resultado) {
      const id = estado.idEvaluacion;
      desmontar = montarResultado(raiz, {
        resultado: estado.resultado,
        codigo: estado.estudiante?.codigo ?? null,
        practica: estado.practica,
        guardado: estado.guardado,
        verConstancia: id !== null ? () => ir(`#/constancia/${id}`) : null,
        volver: () => ir('#/'),
      });
    } else if (ruta.startsWith('#/nino/') && estado.db) {
      const codigo = decodeURIComponent(ruta.slice('#/nino/'.length));
      const db = estado.db;
      cargando();
      void Promise.all([leerEstudiantes(db), evaluacionesDe(db, codigo)]).then(([lista, historial]) => {
        if (miTurno !== turno) return;
        const estudiante = lista.find((e) => e.codigo === codigo);
        if (!estudiante) return ir('#/');
        desmontar = montarPreparar(raiz, {
          estudiante,
          historial,
          pendiente: primerPendiente(preparacion()),
          resolver: (accion) => hacer(accion, location.hash),
          empezar: () => void empezarPrueba(estudiante),
          verConstancia: (idEv) => ir(`#/constancia/${idEv}`),
          volver: () => ir('#/'),
        });
      });
    } else if (ruta.startsWith('#/constancia/') && estado.db) {
      const id = Number(ruta.slice('#/constancia/'.length));
      cargando();
      void leerEvaluacion(estado.db, id).then((ev) => {
        if (miTurno !== turno) return;
        if (!ev) return ir('#/');
        desmontar = montarConstancia(raiz, ev, () => history.back());
      });
    } else if (ruta === '#/resumen') {
      desmontar = montarResumen(
        raiz,
        estado.db,
        estado.config.colegio,
        (codigo) => ir(`#/nino/${encodeURIComponent(codigo)}`),
        () => ir('#/'),
      );
    } else if (!estado.config.colegio.trim() && ruta === '#/') {
      // Primera vez: antes de Mi salón se pide el colegio y se calibra.
      ir('#/inicio');
    } else {
      const aviso = estado.avisoInicio;
      estado.avisoInicio = undefined;
      desmontar = montarSalon(raiz, {
        db: estado.db,
        colegio: estado.config.colegio,
        preparacion: preparacion(),
        aviso,
        abrirNino: (codigo) => ir(`#/nino/${encodeURIComponent(codigo)}`),
        practicar: () => void empezarPrueba(null),
        resumen: () => ir('#/resumen'),
        configurar: () => ir('#/config'),
        resolver: (accion) => hacer(accion, '#/'),
      });
    }
  }

  window.addEventListener('hashchange', mostrar);
  mostrar();
}
