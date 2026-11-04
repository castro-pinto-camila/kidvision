# KidVision — Especificación del MVP

El MVP es una aplicación web instalable (PWA) que funciona sin internet, la usa el docente y trabaja con una caja óptica de cartón con ranuras. Mide la agudeza visual, clasifica el tipo probable de error refractivo y estima las dioptrías de miopía. Es una herramienta de **tamizaje**: no diagnostica ni receta.

## Decisiones fijadas

- **Usuario:** el docente. Los padres son una fase posterior.
- **Hardware:** caja de unos 35 cm con lentes de +3.00 D (lentes de lectura) en la mirilla y ranuras donde se inserta el celular. Cada ranura equivale a una distancia óptica distinta. La cartilla impresa a 3 m solo se usa para validar; no es parte del producto.
- **Dioptrías:** se estima la miopía (0 a −5 D, pasos de 0,5 D). La hipermetropía se detecta con un clip de +2.00 D, pero no se cuantifica. El astigmatismo se detecta con la carta de abanico; su magnitud es de la versión 2.

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
| R0 | 0,0 | 333,3 | 0,00 | Agudeza lejana, clip +2.00 D, abanico |
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

Con el clip de +2.00 D sobre el lente y el celular en R0, la potencia total es +5.00 D y la vergencia resultante es +2.00 D (la prueba de la IAPB).

`P`, `e`, las distancias de las ranuras y la posición horizontal del centro del lente son **parámetros editables** en la configuración, porque la caja real tendrá tolerancias.

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

El ojo evaluado se elige pintando en negro la mitad de pantalla del otro ojo. La «E» se centra frente al lente (31 mm desde el centro de la pantalla por defecto, editable). En cada cambio, la app indica «Coloca el celular en la ranura Rx» y espera a que el docente confirme. Orden: **por lugares, no por ojos**, para mover el celular lo menos posible. En cada lugar se prueba el ojo derecho y luego el izquierdo (solo cambia la mitad negra) y recién después se mueve el celular: R0 (lejos y umbral de los dos ojos), lentes de +2.00 (una sola espera para los dos), búsqueda del punto remoto con los dos ojos en cada ranura (un ojo que ya confirmó deja de probarse; cada ojo sigue yendo de borroso a nítido), estenopeico, abanico (primero el ojo cuya ranura es donde ya está el celular) y, al final, el paso 6 (cerca) de ambos ojos, para que el niño salga de la caja una sola vez.

1. **Agudeza lejana (R0):** cinco «E» de nivel 6/9 en orientaciones aleatorias, separadas un ancho de letra, con barras de apiñamiento. Pasa con ≥ 4 de 5 (IAPB). Si falla, se mide el umbral: desde 6/60 hacia abajo, la agudeza es el último nivel con ≥ 3 de 5 aciertos. El umbral llega hasta el nivel de corte y se detiene en el primer nivel con < 3 de 5 (si falla el 6/60, la agudeza es «menor que 6/60»). Tras esa primera falla se muestra un nivel más pequeño, si se puede dibujar, como control de calidad. «No sé» cuenta como error. Dos «E» seguidas nunca tienen la misma orientación, tampoco entre una línea y la siguiente.
2. **Si pasó: lentes de +2.00 D (R0).** El «clip» son unos lentes de lectura de +2.00 sostenidos delante de la caja, que cubren los dos ojos a la vez: una sola espera de 60 s para los dos ojos y relectura de la línea 6/9 de cada ojo que pasó. «Sigue leyendo» = ≥ 4 de 5.
3. **Si falló: búsqueda del punto remoto.** Avanzar R1, R2, … R10 mostrando cinco «E» del nivel objetivo. El punto remoto es la primera ranura con ≥ 4 de 5 aciertos **confirmada en la siguiente ranura** (o en la última). Siempre se avanza de borroso a nítido, para que el niño no compense enfocando. Si la ranura de confirmación falla, se repite una vez: si en el reintento pasa, queda confirmado; si no, el punto remoto queda **tentativo** y el ojo dudoso. Si en una ranura no se puede dibujar ningún nivel, la búsqueda termina, el ojo queda dudoso por «límite del dispositivo» y no se hace el estenopeico.
4. **Si no se encontró punto remoto: estenopeico (R0).** Repetir el umbral con el oclusor estenopeico; «mejora» = gana al menos 1 nivel.
5. **Carta de abanico:** en R0, o en la ranura del punto remoto si se encontró. 12 rayos cada 30°, numerados como un reloj. El niño dice el número del rayo que ve más negro y el docente toca uno de seis botones («12–6», «1–7», «2–8», «3–9», «4–10», «5–11») o «todas iguales». En la segunda vuelta la carta, con sus números, gira **60°, 90° o 120° al azar**. Cada elección se convierte a ángulo físico sumando la rotación de su vuelta; es consistente si los dos ángulos difieren ≤ 15° sobre 180°. (Con un giro de 15°, repetir el mismo número salía siempre consistente.) «Todas iguales» en cualquiera de las vueltas = no consistente. Rayos con suavizado y grosor mínimo de 3 px.
6. **Agudeza cercana (fuera de la caja, a 40 cm):** el celular se sostiene a 40 cm del ojo, medidos con un cordón, sin el lente de la caja; el otro ojo se tapa con el oclusor. Línea 6/9 con ≥ 4 de 5.

**Pantalla siempre horizontal y comprobación con la «D»:** la prueba se dibuja siempre horizontal; si el celular está vertical (por ejemplo, porque el navegador no deja bloquear el giro), la app gira su dibujo 90°, y la pantalla de «Coloca el celular…» indica «este lado hacia arriba». Al empezar cada prueba, antes de la primera línea, se muestra una «D» grande en la mitad del ojo derecho; el docente mira por la caja y confirma que la ve con el ojo derecho y derecha. Si la ve al revés, la app gira el dibujo 180°; si la ve con el ojo izquierdo, intercambia las mitades. La corrección se guarda para la próxima vez. Un giro equivocado invertiría todas las «E» y cambiaría los ojos sin que nadie lo note.

**Respuesta:** el docente toca cuatro flechas y «no sé», ubicados en una franja en el borde de la pantalla que la caja deja libre. El lado de la franja (arriba, abajo, izquierda o derecha) se elige en la configuración; por defecto, arriba.

## Control de calidad

Un ojo queda «dudoso» si ocurre cualquiera de estas cosas:

- Cinco respuestas iguales seguidas (solo flechas; «no sé» no cuenta). Se cuenta entre líneas, aunque alguna se haya cortado.
- Falla un nivel grande y acierta uno menor: tras la primera falla del umbral se muestra un nivel más pequeño; si acierta ≥ 4 de 5, dudoso (con 3 de 5, el azar lo logra cerca del 10 % de las veces).
- El punto remoto no se confirma en la ranura siguiente ni en su reintento.
- Límite del dispositivo: en una ranura de la búsqueda no se puede dibujar ningún nivel.

**Corte de línea:** una línea termina en cuanto queda decidida (llega a los aciertos que pide o ya no puede llegar); el resultado es idéntico al de pedir las cinco «E». El registro de cada línea guarda las respuestas, sus tiempos, cuántas «E» se respondieron y si se cortó, para el piloto y la fase de IA.

La regla «respuestas en menos de 0,5 s» está **desactivada en el MVP**, porque quien toca es el docente. Se guarda el tiempo de cada respuesta para analizarlo en el piloto.

Un resultado dudoso se convierte en semáforo amarillo.

## Clasificación por ojo

```
miopia          = fallaLejos && puntoRemoto != null        // miopiaEstimadaD = V_ojo de esa ranura
hipermetropia   = (pasaLejos && pasaConMas2) || (pasaLejos && !pasaCerca)
astigmatismo    = abanicoConsistente
otraCausa       = fallaLejos && puntoRemoto == null && !mejoraEstenopeico
indeterminado   = fallaLejos && puntoRemoto == null && mejoraEstenopeico && !hipermetropia && !astigmatismo
                  // puede ser miopía mayor a −5 D, hipermetropía alta o astigmatismo
normal          = pasaLejos && !pasaConMas2 && pasaCerca && !abanicoConsistente
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
