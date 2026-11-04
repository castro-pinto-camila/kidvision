# KidVision — Especificación del MVP

El MVP es una aplicación web instalable (PWA) que funciona sin internet, la usa el docente y trabaja con una caja óptica de cartón con ranuras. Mide la agudeza visual, clasifica el tipo probable de error refractivo y estima las dioptrías de miopía. Es una herramienta de **tamizaje**: no diagnostica ni receta.

## Decisiones fijadas

- **Usuario:** el docente. Los padres son una fase posterior.
- **Hardware:** caja de unos 35 cm con lentes de +3.00 D (lentes de lectura) en la mirilla y ranuras donde se inserta el celular. Cada ranura equivale a una distancia óptica distinta. La cartilla impresa a 3 m solo se usa para validar; no es parte del producto.
- **Dioptrías:** se estima la miopía (0 a −5 D, pasos de 0,5 D). La hipermetropía se detecta con un lente de +2.00 D (una tapa con bisagra en la caja), pero no se cuantifica. El astigmatismo se detecta con la carta de abanico; su magnitud es de la versión 2.

## Alcance del MVP

- **Entra:** calibración de pantalla y de la caja, pruebas por ojo, búsqueda del punto remoto, control de calidad, clasificación, semáforo, constancia para la familia con enlace de WhatsApp, lista del salón y exportación a CSV.
- **Versión 2 (NO implementar):** magnitud del cilindro, respuesta por voz o gestos, página de la familia con QR y seguimiento, sincronización con servidor, fotorrefracción con IA.
- **Stack:** TypeScript + Vite (sin framework); service worker para funcionar sin conexión; IndexedDB; Vitest para pruebas; ninguna librería cargada desde internet en tiempo de uso.

## Óptica de la caja

- `P` = potencia del lente de la caja (+3.00 D).
- `V` = vergencia que produce cada ranura (D).
- `d` = distancia de la pantalla al lente (m).
- `e` = distancia del lente al ojo (m), 0,015 por defecto.

```
d = 1 / (P − V)
V_ojo = V / (1 − e·V)
```

| Ranura | V (D) | d (mm) | V en el ojo, e = 15 mm (D) | Uso |
| --- | --- | --- | --- | --- |
| R0 | 0,0 | 333,3 | 0,00 | Agudeza lejana, tapa +2.00 D, abanico |
| R1 | −0,5 | 285,7 | −0,50 | Punto remoto |
| R2 | −1,0 | 250,0 | −0,99 | Punto remoto |
| R3 | −1,5 | 222,2 | −1,47 | Punto remoto |
| R4 | −2,0 | 200,0 | −1,94 | Punto remoto |
| R5 | −2,5 | 181,8 | −2,41 | Punto remoto |
| R6 | −3,0 | 166,7 | −2,87 | Punto remoto |
| R7 | −3,5 | 153,8 | −3,33 | Punto remoto |
| R8 | −4,0 | 142,9 | −3,77 | Punto remoto |
| R9 | −4,5 | 133,3 | −4,22 | Punto remoto |
| R10 | −5,0 | 125,0 | −4,65 | Punto remoto |

Con la tapa de +2.00 D bajada sobre el lente y el celular en R0, la potencia total es +5.00 D y la vergencia resultante es +2.00 D (la prueba de la IAPB).

`P`, `e`, las distancias de las ranuras y la posición horizontal del centro del lente son **parámetros editables** en la configuración, porque la caja real tendrá tolerancias.

### Requisitos de la caja

La óptica solo depende de la distancia entre la pantalla y el lente, no del tamaño del celular. Para que una misma caja sirva para distintos celulares:

- **Bandeja deslizante con tope:** las ranuras R0 a R10 no pueden ser cortes separados, porque desde R5–R6 los topes vecinos quedan a menos de 16 mm (R9–R10: 8,3 mm) y los cortes se pisan. Por eso el celular va en una **bandeja** que se desliza por la caja. La pantalla se apoya contra el **tope** (la cara interior del frente de la bandeja, con una ventana que deja un labio abajo y postes a los costados); detrás va una cuña o esponja que lo empuja contra el tope. En la posición Rk el tope queda exactamente a `d` del plano de los lentes, sea cual sea el grosor del celular (un error de 2 mm equivale a 0,02 D en R0 y a 0,13 D en R10).
- **Pasador (obligatorio):** la bandeja se fija con un pasador (un palito de brocheta o un clip de alambre de unos 3 mm) que atraviesa la pared derecha y el costado de la bandeja. Los agujeros de la pared están a `d + 12 mm` (el agujero de la bandeja está 12 mm detrás del tope), en dos filas alternadas (pares arriba, impares abajo) para que quede cartón entre ellos, y llevan números grandes R0 a R10. La app lo dice así: «Pon el pasador en R4».
- **Regla y muesca (alternativa):** una regla impresa en la cara interior de la pared izquierda (y una regla suelta para pegar) marca R0 a R10 en `d`. El costado izquierdo de la bandeja tiene una muesca en el plano del tope: se alinea la muesca con la marca y se sujeta con un clip, por si el cartón se rompe entre agujeros.
- **Apoyo para la cara:** una pieza fija con ventana para los ojos y muesca para la nariz, separada del panel de lentes de modo que su cara quede a `e` (15 mm) del plano de los lentes.
- **Esponja a los costados** para centrar el celular entre las paredes.
- **Celulares aceptados:** pantallas de 6,0" a 6,8", **sin funda**. La app comprueba además que el celular pueda dibujar el 6/9 en R0.
- El borde superior del celular sobresale de la caja: ahí queda la franja de botones del docente.
- La tapa de +2.00 D va unida con una bisagra arriba del panel de lentes, del lado del ojo, y se baja dentro del espacio entre los lentes y el apoyo para la cara.
- **Plantilla de corte:** `npm run plantilla` genera `docs/plantilla-caja.html` (hojas A4 horizontales que se unen por una línea roja) y `docs/plantilla-caja.svg` (una hoja grande), a escala 1:1, calculadas desde la configuración de la caja, con una regla de 10 cm para comprobar la impresión y la indicación «Imprimir sin ajustar a página». Con la configuración por defecto la caja mide unos 380 × 184 × 62 mm (largo con el apoyo × ancho × alto).
- Centrar los lentes por software no hace falta por ahora: con la pantalla en el foco, 5 mm de desvío equivalen a menos de 1° y no afectan la agudeza. Cuando exista la caja se agregará una comprobación simple: «¿Ves la línea de «E» completa por cada lente? Sí / No».

## Tamaño de los optotipos

La «E» ocupa una cuadrícula de 5 × 5 trazos.

```
θ (min de arco) = 5 · 10^logMAR
h (m)           = θ_rad · (d + e·(1 − P·d))
h_px            = h_mm · pxPorMm
```

En R0 el paréntesis vale `d`, así que el tamaño no depende de `e`. En las demás ranuras la corrección es de hasta un 8 %.

θ se calcula desde la fracción Snellen (θ = 5 × denominador / 6, por ejemplo 6/36 → 30′), que coincide con la columna θ de la tabla; el logMAR de la tabla está redondeado.

**Prueba de cerca (fuera de la caja):** se usa la misma fórmula con `d` = 400 mm, `P` = 0 y `e` = 0, es decir `h = θ_rad · 0,4 m` (el 6/9 mide 0,87 mm).

`pxPorMm` sale de la calibración: el docente ajusta un rectángulo en pantalla al ancho de una tarjeta de 85,6 mm (DNI o tarjeta bancaria). Ese valor está en **píxeles CSS**; para la regla de resolución se usan **píxeles físicos** = pxPorMm × devicePixelRatio.

| Nivel | logMAR | θ (min de arco) | Altura en R0 (mm) | Píxeles en R0 (0,06 mm/px) |
| --- | --- | --- | --- | --- |
| 6/60 | 1,00 | 50 | 4,85 | 81 |
| 6/36 | 0,78 | 30 | 2,91 | 48 |
| 6/24 | 0,60 | 20 | 1,94 | 32 |
| 6/18 | 0,48 | 15 | 1,45 | 24 |
| 6/12 | 0,30 | 10 | 0,97 | 16 |
| 6/9 | 0,18 | 7,5 | 0,73 | 12 |
| 6/6 | 0,00 | 5 | 0,48 | 8 |

La columna de píxeles y los ejemplos de resolución usan 0,06 mm por **píxel físico**.

**Regla de resolución:** si el trazo (h_px físicos / 5) mide menos de 2 píxeles, ese nivel no se puede dibujar en esa ranura. El objetivo de la búsqueda del punto remoto es el **mayor entre 6/12 y el nivel más pequeño dibujable** en esa ranura (con 0,06 mm por píxel físico, desde R4 el 6/12 ya no se puede dibujar; en R4 el trazo mide 1,997 px, justo en el límite).

**Celular no apto:** si el 6/9 no se puede dibujar en R0, la pantalla de configuración avisa que ese celular no sirve para la prueba. Si el 6/9 se dibuja en R0, también se dibuja en la prueba de cerca, porque 400 mm > 333 mm.

## Pruebas por ojo

El ojo evaluado se elige pintando en negro la mitad de pantalla del otro ojo. La «E» se centra frente al lente (31 mm desde el centro de la pantalla por defecto, editable). En cada cambio, la app indica «Pon el pasador en Rx» y espera a que el docente confirme. Orden: **por lugares, no por ojos**, para mover el celular lo menos posible. En cada lugar se prueba el ojo derecho y luego el izquierdo (solo cambia la mitad negra) y recién después se mueve el celular: R0 (una línea de práctica, y lejos y umbral de los dos ojos), lentes de +2.00 (una sola espera para los dos), búsqueda del punto remoto con los dos ojos en cada ranura (un ojo que ya confirmó deja de probarse; cada ojo sigue yendo de borroso a nítido), estenopeico, abanico (primero el ojo cuya ranura es donde ya está el celular) y, al final, el paso 6 (cerca) de ambos ojos, para que el niño salga de la caja una sola vez.

0. **Línea de práctica (R0):** una línea 6/60 al empezar, para que el niño entienda el juego. Se responden las cinco «E», no se corta y no cuenta para nada (no entra en el registro ni en el control de calidad).
1. **Agudeza lejana (R0):** cinco «E» de nivel 6/9 en orientaciones aleatorias, separadas un ancho de letra, con barras de apiñamiento. Pasa con ≥ 4 de 5 (IAPB). Si falla, se mide el umbral: desde 6/60 hacia abajo, la agudeza es el último nivel con ≥ 3 de 5 aciertos. El umbral llega hasta el nivel de corte y se detiene en el primer nivel con < 3 de 5 (si falla el 6/60, la agudeza es «menor que 6/60»). Tras esa primera falla se muestra un nivel más pequeño, si se puede dibujar, como control de calidad. «No sé» cuenta como error. Dos «E» seguidas nunca tienen la misma orientación, tampoco entre una línea y la siguiente.
2. **Si pasó: tapa de +2.00 D (R0).** El lente de +2.00 va integrado a la caja como una tapa con bisagra, para que no se olvide; cubre los dos ojos a la vez. La instrucción es «Baja la tapa +2.00 de la caja» (y después, «Sube la tapa +2.00»). Una sola espera de 60 s para los dos ojos, con un círculo azul grande y sin detalles que se mueve despacio frente a cada lente (algo que mirar, sin letras ni detalles finos) y una barra de progreso para el docente; luego, relectura de la línea 6/9 de cada ojo que pasó. «Sigue leyendo» = ≥ 4 de 5.
3. **Si falló: búsqueda del punto remoto.** Avanzar R1, R2, … R10 mostrando cinco «E» del nivel objetivo. El punto remoto es la primera ranura con ≥ 4 de 5 aciertos **confirmada en la siguiente ranura** (o en la última). Siempre se avanza de borroso a nítido, para que el niño no compense enfocando. Si la ranura de confirmación falla, se repite una vez: si en el reintento pasa, queda confirmado; si no, el punto remoto queda **tentativo** y el ojo dudoso. Si en una ranura no se puede dibujar ningún nivel, la búsqueda termina, el ojo queda dudoso por «límite del dispositivo» y no se hace el estenopeico.
4. **Si no se encontró punto remoto: estenopeico (R0).** Repetir el umbral con el oclusor estenopeico; «mejora» = gana al menos 1 nivel.
5. **Carta de abanico:** en R0, o en la ranura del punto remoto si se encontró. 12 rayos cada 30°, numerados como un reloj. El niño dice el número del rayo que ve más negro y el docente toca uno de seis botones («12–6», «1–7», «2–8», «3–9», «4–10», «5–11») o «todas iguales». En la segunda vuelta la carta, con sus números, gira **60°, 90° o 120° al azar**. Cada elección se convierte a ángulo físico sumando la rotación de su vuelta; es consistente si los dos ángulos difieren ≤ 15° sobre 180°. (Con un giro de 15°, repetir el mismo número salía siempre consistente.) «Todas iguales» en cualquiera de las vueltas = no consistente. Antes de la primera vuelta, siempre una pantalla para el docente: «¿Alguna línea se ve más negra o más marcada que las otras? Si todas se ven iguales, toca "Todas iguales"». En la franja, «Todas iguales» va primero y más grande. Rayos gruesos (al menos 3 píxeles físicos y 0,8 mm) con bordes suaves. **Límite conocido:** en una pantalla de píxeles las líneas verticales y horizontales pueden verse más negras que las diagonales; como el celular está fijo en la caja, ninguna rotación separa ese efecto de un astigmatismo vertical. Por eso el abanico solo cuenta para la categoría cuando la agudeza falla (ver Clasificación).
6. **Agudeza cercana (fuera de la caja, a 40 cm):** el celular se sostiene a 40 cm del ojo con una **tira de cartón rígida de 40 cm** (un extremo en la mejilla del niño, bajo el ojo evaluado; el celular en el otro), sin el lente de la caja; el otro ojo se tapa con el oclusor. Línea 6/9 con ≥ 4 de 5.

**Pantalla siempre horizontal y comprobación con la «D»:** la prueba se dibuja siempre horizontal; si el celular está vertical (por ejemplo, porque el navegador no deja bloquear el giro), la app gira su dibujo 90°, y la pantalla de «Coloca el celular…» indica «este lado hacia arriba». Al empezar cada prueba, antes de la primera línea, se muestra una «D» grande en la mitad del ojo derecho; el docente mira por la caja y confirma que la ve con el ojo derecho y derecha. Si la ve al revés, la app gira el dibujo 180°; si la ve con el ojo izquierdo, intercambia las mitades. La corrección se guarda para la próxima vez. Un giro equivocado invertiría todas las «E» y cambiaría los ojos sin que nadie lo note.

**Respuesta:** el niño señala con la mano hacia dónde apuntan «las patitas de la E» y el docente toca esa flecha. El docente se sienta **al lado** del niño, no enfrente (enfrente vería la mano en espejo). No se usa paleta: con los ojos en la caja el niño no la vería. El docente no ve las «E» (están dentro de la caja), así que no puede influir en la respuesta. Antes de la primera línea, la app muestra estas instrucciones. El docente toca cuatro flechas y «no sé», ubicados en una franja en el borde de la pantalla que la caja deja libre. El lado de la franja (arriba, abajo, izquierda o derecha) se elige en la configuración; por defecto, arriba.

## Control de calidad

Un ojo queda «dudoso» si ocurre cualquiera de estas cosas:

- Cinco respuestas iguales seguidas (solo flechas; «no sé» no cuenta). Se cuenta entre líneas, aunque alguna se haya cortado.
- Falla un nivel grande y acierta uno menor: tras la primera falla del umbral se muestra un nivel más pequeño; si acierta ≥ 4 de 5, dudoso (con 3 de 5, el azar lo logra cerca del 10 % de las veces).
- El punto remoto no se confirma en la ranura siguiente ni en su reintento.
- Límite del dispositivo: en una ranura de la búsqueda no se puede dibujar ningún nivel.

**Corte de línea:** una línea se corta **solo cuando ya falló** (ya no puede llegar a los aciertos que pide); si todavía puede pasar, se piden las cinco «E». El resultado es idéntico al de pedir siempre las cinco. Entre una línea y la siguiente, la pantalla queda en blanco medio segundo y la franja muestra «✓ Siguiente línea», para que el cambio no sorprenda. El registro de cada línea guarda las respuestas, sus tiempos, cuántas «E» se respondieron y si se cortó, para el piloto y la fase de IA.

La regla «respuestas en menos de 0,5 s» está **desactivada en el MVP**, porque quien toca es el docente. Se guarda el tiempo de cada respuesta para analizarlo en el piloto.

Un resultado dudoso se convierte en semáforo amarillo.

## Clasificación por ojo

```
miopia          = fallaLejos && puntoRemoto != null        // miopiaEstimadaD = V_ojo de esa ranura
hipermetropia   = (pasaLejos && pasaConMas2) || (pasaLejos && !pasaCerca)
fallaAgudeza    = fallaLejos || !pasaCerca
astigmatismo    = abanicoConsistente && fallaAgudeza
posibleAstigm.  = abanicoConsistente && !fallaAgudeza     // «posible astigmatismo (por validar)»: se guarda y se muestra, no cambia el semáforo
otraCausa       = fallaLejos && puntoRemoto == null && !mejoraEstenopeico
indeterminado   = fallaLejos && puntoRemoto == null && mejoraEstenopeico && !hipermetropia && !astigmatismo
                  // puede ser miopía mayor a −5 D, hipermetropía alta o astigmatismo
normal          = pasaLejos && !pasaConMas2 && pasaCerca
semaforo        = dudoso ? AMARILLO : (normal ? VERDE : ROJO)
```

`pasaConMas2` y `mejoraEstenopeico` valen `null` cuando esa prueba no se hizo; en las fórmulas, `!x` significa «x es falso», no «x es null».

**Semáforo del niño:** ROJO si algún ojo es ROJO; si no, AMARILLO si algún ojo es AMARILLO; si no, VERDE.

**Indicación:** ROJO → «derivar»; VERDE → «no derivar»; AMARILLO → «repetir», salvo que algún ojo tenga el motivo «límite del dispositivo»: entonces «repetir con otro celular». Un ojo que llega al límite del dispositivo no se clasifica (sin categoría) y queda amarillo.

A la familia se le muestra «derivar» o «no derivar» y la agudeza de cada ojo. La categoría probable y la miopía estimada van en la constancia, marcadas como «estimación de tamizaje, no es una receta».

## Datos (guardados en el celular)

```json
{
  "estudiante": { "codigo": "3B-07", "edad": 9, "grado": "3B", "colegio": "..." },
  "dispositivo": { "pxPorMm": 16.7, "caja": { "P": 3.0, "e_mm": 15, "ranuras_mm": [333.3, 285.7, 250.0, 222.2, 200.0, 181.8, 166.7, 153.8, 142.9, 133.3, 125.0] } },
  "sesion": {
    "fecha": "2026-11-05T10:20:00", "umbralCorte": "6/9",
    "ojos": {
      "OD": { "pasaLejos": false, "umbral": "6/18", "puntoRemoto": "R4", "miopiaEstimadaD": -1.94,
              "pasaConMas2": null, "mejoraEstenopeico": null, "abanico": [60, 60], "pasaCerca": true,
              "dudoso": false, "categorias": ["miopia"] },
      "OI": { "...": "..." }
    },
    "semaforo": "ROJO", "duracionSeg": 0
  }
}
```

El niño se registra por código, sin nombre, para proteger los datos de menores.

## Pantallas

1. **Configuración:** arriba, lo que necesita el docente: «Pantalla calibrada» (con «Volver a calibrar») y «Tu celular sirve para la prueba». La **calibración** es un asistente de 3 pasos: (1) ajustar un rectángulo al ancho de un DNI de 85,6 mm, con un dibujo de la tarjeta, barra deslizante y − / + finos (se recomienda medir antes el DNI con una regla); (2) medir con una regla una línea de 10 cm: «Sí, guardar» o «No, volver a ajustar»; (3) confirmación clara («Calibración guardada»). Nada se guarda antes del paso 2, y después los − / + quedan ocultos tras «Volver a calibrar». El zoom con los dedos está desactivado; si la página está ampliada, o si cambia el devicePixelRatio desde la calibración (zoom o tamaño de letra del celular), la app pide recalibrar. Lo técnico va plegado en «Ajustes de la caja (para quien la arma)», con una explicación de cada número: P, e, separación de los lentes, distancia de cada ranura, línea de corte, lado y alto de la franja de botones, olvidar la corrección de la «D», verificación de qué niveles se pueden dibujar en cada ranura y ancho y alto de la línea de cada nivel en R0 y si cabe en la mitad de pantalla de cada ojo (con la pantalla en el foco del lente, el límite es esa mitad, no el ancho del lente). Si el navegador no tiene pantalla completa, bloqueo horizontal o Wake Lock, la prueba sigue y se muestra un aviso.
2. **Mi salón:** lista por código con estado pendiente o evaluado; carga desde CSV.
3. **Preparar al niño:** instrucciones con dibujos y el texto que dice el docente.
4. **Prueba:** el flujo por ojo, con los avisos de cambio de ranura. Mantener la pantalla encendida (Wake Lock API) y pedir brillo al máximo.
5. **Resultado:** semáforo, agudeza de cada ojo, miopía estimada, categorías y si es confiable o dudoso.
6. **Constancia:** texto simple, simulación aproximada de cómo ve el niño y enlace de WhatsApp (wa.me con el mensaje); versión imprimible.
7. **Resumen del salón:** conteo por color, lista de derivados y exportación a CSV.
8. **Modo práctica (sin caja):** desde el inicio, para que el docente aprenda. Funciona igual que la prueba, pero muestra un aviso visible en todas sus pantallas («Modo práctica: el resultado no vale y no se guarda») y nunca guarda datos. Como sin caja no hay tapa +2.00 que nuble la vista, la relectura con la tapa se simula sola: la app muestra «En la prueba real, aquí un niño con vista normal ve borroso. En práctica, la app simula esa respuesta» y registra que no la leyó. Nunca se le pide al docente que toque «No sé», para no crearle ese hábito en la prueba real.

## Criterios de aceptación

- [ ] Las pruebas unitarias reproducen la tabla de ranuras (d ± 0,1 mm; V en el ojo ± 0,01 D).
- [ ] En R0 la altura calculada no depende de `e`, y la tabla de tamaños se reproduce ± 0,05 mm.
- [ ] La regla de resolución desactiva los niveles cuyo trazo mide menos de 2 px físicos.
- [ ] Hay pruebas del punto remoto: encontrado y confirmado, no confirmado (dudoso) y no encontrado.
- [ ] Hay pruebas para cada regla de clasificación y de control de calidad.
- [ ] Tras calibrar, una línea de 100 mm en pantalla mide 100 ± 1 mm con regla.
- [ ] Después de la primera carga, la app completa una evaluación en modo avión.
- [ ] La app registra la duración de cada evaluación.

## Plan de sesiones

0. **Esqueleto:** proyecto Vite + TypeScript + Vitest, carpetas `src/core`, `src/logic`, `src/ui`, `src/data`.
1. **Núcleo óptico (`src/core`):** ranuras, vergencias, tamaño de optotipos, regla de resolución y nivel objetivo por ranura.
2. **Lógica (`src/logic`):** flujo por ojo como máquina de estados, búsqueda del punto remoto, control de calidad y clasificación.
3. **Pantallas de prueba (`src/ui`):** calibración, configuración de la caja (con el aviso de celular no apto), media pantalla por ojo, avisos de ranura, prueba de cerca a 40 cm y botones en los bordes.
4. **Resultado y datos:** semáforo, constancia, lista del salón, IndexedDB, modo sin conexión y CSV.
5. **Publicación:** despliegue en GitHub Pages con HTTPS (el service worker no funciona sin HTTPS fuera de localhost).
