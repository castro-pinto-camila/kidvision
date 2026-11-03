# KidVision

App de tamizaje visual escolar para docentes de primaria en Perú (niños de 6 a 12 años).

## Archivos de referencia
- `SPEC.md`: qué construir. Es la fuente de verdad.
- `docs/CONTEXTO.md`: el problema, el usuario y la evidencia. Úsalo para entender el porqué y para proponer mejoras.
- Si `docs/CONTEXTO.md` y `SPEC.md` dicen cosas distintas, **SPEC.md manda** (el contexto incluye versiones anteriores del diseño).
- Si algo de SPEC.md es ambiguo, pregunta antes de decidir.

## Cómo trabajar
- Antes de escribir código en cada sesión, propón un plan y espera mi aprobación.
- Propón mejoras cuando las veas, pero no las implementes sin mi aprobación.
- No agregues funciones marcadas como versión 2 en SPEC.md.

## Git
- Haz un commit al terminar cada tarea, solo después de que las pruebas pasen.
- Mensajes de commit cortos y en español, que digan qué cambió.
- **No hagas `git push`;** yo subo los cambios con GitHub Desktop.
- No borres ni reescribas commits anteriores.

## Técnico
- TypeScript + Vite (sin framework). PWA que funciona sin conexión; datos en IndexedDB.
- Ninguna librería se carga desde internet en tiempo de uso.
- La lógica óptica, la clasificación y el flujo de la prueba viven en módulos puros (`src/core`, `src/logic`) con pruebas en Vitest. La interfaz (`src/ui`) solo dibuja y llama a esa lógica.
- `pxPorMm` de la calibración está en píxeles CSS. Para la regla de resolución usa píxeles físicos: `pxPorMm × devicePixelRatio`.
- Las pruebas usan los valores exactos de las tablas de SPEC.md. Si una prueba no coincide con la tabla, la tabla manda.

## Interfaz
- Textos en español, simples, para docentes sin formación en salud visual.
- Botones grandes; debe funcionar en celulares de gama baja.
