# Guía de resultados: qué secuencia da cada resultado

Este archivo lo genera `npm run guia`; no se edita a mano. Cada escenario es un niño simulado al que se le hace la prueba completa con el flujo y la clasificación reales de la app. Una prueba automática comprueba que lo que dice «Qué debe salir» (escrito a mano desde las reglas del SPEC) coincide con lo que da la app.

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

## 1. Vista normal

**Cómo es el niño:** Lee la línea 6/9 de lejos con los dos ojos, no la lee con los lentes de +2.00 (se le nubla), lee de cerca y no ve ninguna línea más negra en el abanico.

**Qué debe salir:** semáforo **VERDE** · indicación **No derivar**

**Por qué (reglas del SPEC):** Normal = pasa de lejos + NO pasa con +2.00 + pasa de cerca. Si los dos ojos son verdes, no se deriva.

**Resultado que da la app:**
- Ojo derecho: semáforo **VERDE** · categoría: normal · sin punto remoto
- Ojo izquierdo: semáforo **VERDE** · categoría: normal · sin punto remoto
- Niño: semáforo **VERDE** · **No derivar**

<details>
<summary>Secuencia completa de la prueba (17 pasos)</summary>

1. **Pon el pasador en R0** y confirma.
2. Ojo derecho, línea 6/60 en R0, prueba práctica (no cuenta): las «E» apuntan ↑ ← → ← ↑; tocas ↑ ← → ← ↑; aciertos 5 de 5.
3. Ojo derecho, línea 6/9 en R0, prueba de lejos: las «E» apuntan ← → ↑ → ←; tocas ← → ↑ → ←; aciertos 5 de 5 → **pasa** (hacen falta 4).
4. Ojo izquierdo, línea 6/9 en R0, prueba de lejos: las «E» apuntan ← → ↓ → ↓; tocas ← → ↓ → ↓; aciertos 5 de 5 → **pasa** (hacen falta 4).
5. **Pon el pasador en R0** y baja la tapa +2.00 y confirma.
6. **Espera 60 s** con los dos ojos mirando el círculo azul, y confirma.
7. Ojo derecho, línea 6/9 en R0, prueba con los lentes de +2.00: las «E» apuntan ↓ ← → ↓ ←; tocas ↑ → ← ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
8. Ojo izquierdo, línea 6/9 en R0, prueba con los lentes de +2.00: las «E» apuntan → ↓ ↑ ← ↓; tocas ← ↑ ↓ → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
9. **Pon el pasador en R0** (sube la tapa +2.00) y confirma.
10. Abanico, ojo derecho, vuelta 1 (carta sin girar): el niño ve todas iguales → tocas «Todas iguales».
11. Abanico, ojo derecho, vuelta 2 (carta girada 90°): el niño ve todas iguales → tocas «Todas iguales».
12. Abanico, ojo izquierdo, vuelta 1 (carta sin girar): el niño ve todas iguales → tocas «Todas iguales».
13. Abanico, ojo izquierdo, vuelta 2 (carta girada 60°): el niño ve todas iguales → tocas «Todas iguales».
14. **Prueba de cerca, ojo derecho:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
15. Ojo derecho, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan ↓ ↑ ↓ → ↑; tocas ↓ ↑ ↓ → ↑; aciertos 5 de 5 → **pasa** (hacen falta 4).
16. **Prueba de cerca, ojo izquierdo:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
17. Ojo izquierdo, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan ↑ ↓ ← ↑ ↓; tocas ↑ ↓ ← ↑ ↓; aciertos 5 de 5 → **pasa** (hacen falta 4).

</details>

## 2. Miopía leve (−1,0 D) en los dos ojos

**Cómo es el niño:** No lee 6/9 de lejos. Al acercar el celular, ve nítido en R2 y confirma.

**Qué debe salir:** semáforo **ROJO** · indicación **Derivar**

**Por qué (reglas del SPEC):** Miopía = falla de lejos y se encuentra el punto remoto (la primera ranura donde lee y lo confirma). La miopía estimada es la vergencia de esa ranura en el ojo. Cualquier ojo rojo = derivar.

**Resultado que da la app:**
- Ojo derecho: semáforo **ROJO** · categoría: miopía · punto remoto R2 (miopía estimada -0,99 D)
- Ojo izquierdo: semáforo **ROJO** · categoría: miopía · punto remoto R2 (miopía estimada -0,99 D)
- Niño: semáforo **ROJO** · **Derivar**

<details>
<summary>Secuencia completa de la prueba (28 pasos)</summary>

1. **Pon el pasador en R0** y confirma.
2. Ojo derecho, línea 6/60 en R0, prueba práctica (no cuenta): las «E» apuntan ↑ ← → ← ↑; tocas ↑ ← → ← ↑; aciertos 5 de 5.
3. Ojo derecho, línea 6/9 en R0, prueba de lejos: las «E» apuntan ← → ↑ → ←; tocas → ← ↓ ← →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
4. Ojo derecho, línea 6/60 en R0, prueba para ver cuánto lee: las «E» apuntan ↓ → ↓ → ↓; tocas ↓ → ↓ → ↓; aciertos 5 de 5 → **pasa** (hacen falta 3).
5. Ojo derecho, línea 6/36 en R0, prueba para ver cuánto lee: las «E» apuntan ← ↓ → ↓ ←; tocas → ↑ ← ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 3).
6. Ojo derecho, línea 6/24 en R0, prueba de control: las «E» apuntan → ↓ ↑ ← ↓; tocas ← ↑ ↓ → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
7. Ojo izquierdo, línea 6/9 en R0, prueba de lejos: las «E» apuntan → ↑ ← ↑ ↓; tocas ← ↓ → ↓ ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
8. Ojo izquierdo, línea 6/60 en R0, prueba para ver cuánto lee: las «E» apuntan → ↑ → ↓ ←; tocas → ↑ → ↓ ←; aciertos 5 de 5 → **pasa** (hacen falta 3).
9. Ojo izquierdo, línea 6/36 en R0, prueba para ver cuánto lee: las «E» apuntan ↑ ↓ ← ↑ ↓; tocas ↓ ↑ → ↓ ↑; aciertos 0 de 5 → **no pasa** (hacen falta 3).
10. Ojo izquierdo, línea 6/24 en R0, prueba de control: las «E» apuntan → ↑ ↓ ← ↑; tocas ← ↓ ↑ → ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
11. **Pon el pasador en R1** y confirma.
12. Ojo derecho, línea 6/12 en R1, prueba buscando el punto remoto: las «E» apuntan ↑ ← → ↓ ←; tocas ↓ → ← ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
13. Ojo izquierdo, línea 6/12 en R1, prueba buscando el punto remoto: las «E» apuntan ↓ ↑ → ← →; tocas ↑ ↓ ← → ←; aciertos 0 de 5 → **no pasa** (hacen falta 4).
14. **Pon el pasador en R2** y confirma.
15. Ojo derecho, línea 6/12 en R2, prueba buscando el punto remoto: las «E» apuntan → ↑ ↓ ↑ →; tocas → ↑ ↓ ↑ →; aciertos 5 de 5 → **pasa** (hacen falta 4).
16. Ojo izquierdo, línea 6/12 en R2, prueba buscando el punto remoto: las «E» apuntan ← ↓ ↑ ↓ ←; tocas ← ↓ ↑ ↓ ←; aciertos 5 de 5 → **pasa** (hacen falta 4).
17. **Pon el pasador en R3** y confirma.
18. Ojo derecho, línea 6/12 en R3, prueba buscando el punto remoto: las «E» apuntan ← → ↓ → ←; tocas ← → ↓ → ←; aciertos 5 de 5 → **pasa** (hacen falta 4).
19. Ojo izquierdo, línea 6/12 en R3, prueba buscando el punto remoto: las «E» apuntan → ↓ ← ↓ ↑; tocas → ↓ ← ↓ ↑; aciertos 5 de 5 → **pasa** (hacen falta 4).
20. **Pon el pasador en R2** y confirma.
21. Abanico, ojo derecho, vuelta 1 (carta sin girar): el niño ve todas iguales → tocas «Todas iguales».
22. Abanico, ojo derecho, vuelta 2 (carta girada 120°): el niño ve todas iguales → tocas «Todas iguales».
23. Abanico, ojo izquierdo, vuelta 1 (carta sin girar): el niño ve todas iguales → tocas «Todas iguales».
24. Abanico, ojo izquierdo, vuelta 2 (carta girada 60°): el niño ve todas iguales → tocas «Todas iguales».
25. **Prueba de cerca, ojo derecho:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
26. Ojo derecho, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan ↑ ← ↓ ↑ →; tocas ↑ ← ↓ ↑ →; aciertos 5 de 5 → **pasa** (hacen falta 4).
27. **Prueba de cerca, ojo izquierdo:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
28. Ojo izquierdo, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan → ← ↓ ↑ ↓; tocas → ← ↓ ↑ ↓; aciertos 5 de 5 → **pasa** (hacen falta 4).

</details>

## 3. Miopía moderada (−3,0 D)

**Cómo es el niño:** Igual que la anterior, pero necesita acercar el celular hasta R6.

**Qué debe salir:** semáforo **ROJO** · indicación **Derivar**

**Por qué (reglas del SPEC):** Igual que la miopía leve: el punto remoto es la primera ranura donde lee y se confirma.

**Resultado que da la app:**
- Ojo derecho: semáforo **ROJO** · categoría: miopía · punto remoto R6 (miopía estimada -2,87 D)
- Ojo izquierdo: semáforo **ROJO** · categoría: miopía · punto remoto R6 (miopía estimada -2,87 D)
- Niño: semáforo **ROJO** · **Derivar**

<details>
<summary>Secuencia completa de la prueba (40 pasos)</summary>

1. **Pon el pasador en R0** y confirma.
2. Ojo derecho, línea 6/60 en R0, prueba práctica (no cuenta): las «E» apuntan ↑ ← → ← ↑; tocas ↑ ← → ← ↑; aciertos 5 de 5.
3. Ojo derecho, línea 6/9 en R0, prueba de lejos: las «E» apuntan ← → ↑ → ←; tocas → ← ↓ ← →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
4. Ojo derecho, línea 6/60 en R0, prueba para ver cuánto lee: las «E» apuntan ↓ → ↓ → ↓; tocas ↓ → ↓ → ↓; aciertos 5 de 5 → **pasa** (hacen falta 3).
5. Ojo derecho, línea 6/36 en R0, prueba para ver cuánto lee: las «E» apuntan ← ↓ → ↓ ←; tocas → ↑ ← ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 3).
6. Ojo derecho, línea 6/24 en R0, prueba de control: las «E» apuntan → ↓ ↑ ← ↓; tocas ← ↑ ↓ → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
7. Ojo izquierdo, línea 6/9 en R0, prueba de lejos: las «E» apuntan → ↑ ← ↑ ↓; tocas ← ↓ → ↓ ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
8. Ojo izquierdo, línea 6/60 en R0, prueba para ver cuánto lee: las «E» apuntan → ↑ → ↓ ←; tocas → ↑ → ↓ ←; aciertos 5 de 5 → **pasa** (hacen falta 3).
9. Ojo izquierdo, línea 6/36 en R0, prueba para ver cuánto lee: las «E» apuntan ↑ ↓ ← ↑ ↓; tocas ↓ ↑ → ↓ ↑; aciertos 0 de 5 → **no pasa** (hacen falta 3).
10. Ojo izquierdo, línea 6/24 en R0, prueba de control: las «E» apuntan → ↑ ↓ ← ↑; tocas ← ↓ ↑ → ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
11. **Pon el pasador en R1** y confirma.
12. Ojo derecho, línea 6/12 en R1, prueba buscando el punto remoto: las «E» apuntan ↑ ← → ↓ ←; tocas ↓ → ← ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
13. Ojo izquierdo, línea 6/12 en R1, prueba buscando el punto remoto: las «E» apuntan ↓ ↑ → ← →; tocas ↑ ↓ ← → ←; aciertos 0 de 5 → **no pasa** (hacen falta 4).
14. **Pon el pasador en R2** y confirma.
15. Ojo derecho, línea 6/12 en R2, prueba buscando el punto remoto: las «E» apuntan → ↑ ↓ ↑ →; tocas ← ↓ ↑ ↓ ←; aciertos 0 de 5 → **no pasa** (hacen falta 4).
16. Ojo izquierdo, línea 6/12 en R2, prueba buscando el punto remoto: las «E» apuntan ← ↓ ↑ ↓ ←; tocas → ↑ ↓ ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
17. **Pon el pasador en R3** y confirma.
18. Ojo derecho, línea 6/12 en R3, prueba buscando el punto remoto: las «E» apuntan ← → ↓ → ←; tocas → ← ↑ ← →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
19. Ojo izquierdo, línea 6/12 en R3, prueba buscando el punto remoto: las «E» apuntan → ↓ ← ↓ ↑; tocas ← ↑ → ↑ ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
20. **Pon el pasador en R4** y confirma.
21. Ojo derecho, línea 6/18 en R4, prueba buscando el punto remoto: las «E» apuntan ↓ ↑ → ← ↓; tocas ↑ ↓ ← → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
22. Ojo izquierdo, línea 6/18 en R4, prueba buscando el punto remoto: las «E» apuntan → ↑ → ← ↓; tocas ← ↓ ← → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
23. **Pon el pasador en R5** y confirma.
24. Ojo derecho, línea 6/18 en R5, prueba buscando el punto remoto: las «E» apuntan ↑ ↓ ← → ↑; tocas ↓ ↑ → ← ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
25. Ojo izquierdo, línea 6/18 en R5, prueba buscando el punto remoto: las «E» apuntan → ↑ ← ↑ ←; tocas ← ↓ → ↓ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
26. **Pon el pasador en R6** y confirma.
27. Ojo derecho, línea 6/18 en R6, prueba buscando el punto remoto: las «E» apuntan ← → ↑ ↓ →; tocas ← → ↑ ↓ →; aciertos 5 de 5 → **pasa** (hacen falta 4).
28. Ojo izquierdo, línea 6/18 en R6, prueba buscando el punto remoto: las «E» apuntan ↑ ↓ → ← ↓; tocas ↑ ↓ → ← ↓; aciertos 5 de 5 → **pasa** (hacen falta 4).
29. **Pon el pasador en R7** y confirma.
30. Ojo derecho, línea 6/18 en R7, prueba buscando el punto remoto: las «E» apuntan ← ↑ ← → ↑; tocas ← ↑ ← → ↑; aciertos 5 de 5 → **pasa** (hacen falta 4).
31. Ojo izquierdo, línea 6/18 en R7, prueba buscando el punto remoto: las «E» apuntan ← ↓ → ← ↑; tocas ← ↓ → ← ↑; aciertos 5 de 5 → **pasa** (hacen falta 4).
32. **Pon el pasador en R6** y confirma.
33. Abanico, ojo derecho, vuelta 1 (carta sin girar): el niño ve todas iguales → tocas «Todas iguales».
34. Abanico, ojo derecho, vuelta 2 (carta girada 120°): el niño ve todas iguales → tocas «Todas iguales».
35. Abanico, ojo izquierdo, vuelta 1 (carta sin girar): el niño ve todas iguales → tocas «Todas iguales».
36. Abanico, ojo izquierdo, vuelta 2 (carta girada 90°): el niño ve todas iguales → tocas «Todas iguales».
37. **Prueba de cerca, ojo derecho:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
38. Ojo derecho, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan ← ↓ ↑ → ←; tocas → ↑ ↓ ← →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
39. **Prueba de cerca, ojo izquierdo:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
40. Ojo izquierdo, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan ← ↓ ← ↑ ←; tocas → ↑ → ↓ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).

</details>

## 4. Miopía solo en el ojo derecho (−2,0 D)

**Cómo es el niño:** El ojo izquierdo es normal; el derecho es miope.

**Qué debe salir:** semáforo **ROJO** · indicación **Derivar**

**Por qué (reglas del SPEC):** El semáforo del niño es el peor de los dos ojos: un ojo rojo basta para derivar.

**Resultado que da la app:**
- Ojo derecho: semáforo **ROJO** · categoría: miopía · punto remoto R4 (miopía estimada -1,94 D)
- Ojo izquierdo: semáforo **VERDE** · categoría: normal · sin punto remoto
- Niño: semáforo **ROJO** · **Derivar**

<details>
<summary>Secuencia completa de la prueba (30 pasos)</summary>

1. **Pon el pasador en R0** y confirma.
2. Ojo derecho, línea 6/60 en R0, prueba práctica (no cuenta): las «E» apuntan ↑ ← → ← ↑; tocas ↑ ← → ← ↑; aciertos 5 de 5.
3. Ojo derecho, línea 6/9 en R0, prueba de lejos: las «E» apuntan ← → ↑ → ←; tocas → ← ↓ ← →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
4. Ojo derecho, línea 6/60 en R0, prueba para ver cuánto lee: las «E» apuntan ↓ → ↓ → ↓; tocas ↓ → ↓ → ↓; aciertos 5 de 5 → **pasa** (hacen falta 3).
5. Ojo derecho, línea 6/36 en R0, prueba para ver cuánto lee: las «E» apuntan ← ↓ → ↓ ←; tocas → ↑ ← ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 3).
6. Ojo derecho, línea 6/24 en R0, prueba de control: las «E» apuntan → ↓ ↑ ← ↓; tocas ← ↑ ↓ → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
7. Ojo izquierdo, línea 6/9 en R0, prueba de lejos: las «E» apuntan → ↑ ← ↑ ↓; tocas → ↑ ← ↑ ↓; aciertos 5 de 5 → **pasa** (hacen falta 4).
8. **Pon el pasador en R0** y baja la tapa +2.00 y confirma.
9. **Espera 60 s** con los dos ojos mirando el círculo azul, y confirma.
10. Ojo izquierdo, línea 6/9 en R0, prueba con los lentes de +2.00: las «E» apuntan → ↑ → ↓ ←; tocas ← ↓ ← ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
11. **Pon el pasador en R1** (sube la tapa +2.00) y confirma.
12. Ojo derecho, línea 6/12 en R1, prueba buscando el punto remoto: las «E» apuntan ↑ ↓ ← ↑ ↓; tocas ↓ ↑ → ↓ ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
13. **Pon el pasador en R2** y confirma.
14. Ojo derecho, línea 6/12 en R2, prueba buscando el punto remoto: las «E» apuntan → ↑ ↓ ← ↑; tocas ← ↓ ↑ → ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
15. **Pon el pasador en R3** y confirma.
16. Ojo derecho, línea 6/12 en R3, prueba buscando el punto remoto: las «E» apuntan → ← → ↓ ←; tocas ← → ← ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
17. **Pon el pasador en R4** y confirma.
18. Ojo derecho, línea 6/18 en R4, prueba buscando el punto remoto: las «E» apuntan → ↑ → ← →; tocas → ↑ → ← →; aciertos 5 de 5 → **pasa** (hacen falta 4).
19. **Pon el pasador en R5** y confirma.
20. Ojo derecho, línea 6/18 en R5, prueba buscando el punto remoto: las «E» apuntan ↓ ↑ ↓ ↑ →; tocas ↓ ↑ ↓ ↑ →; aciertos 5 de 5 → **pasa** (hacen falta 4).
21. **Pon el pasador en R4** y confirma.
22. Abanico, ojo derecho, vuelta 1 (carta sin girar): el niño ve todas iguales → tocas «Todas iguales».
23. Abanico, ojo derecho, vuelta 2 (carta girada 120°): el niño ve todas iguales → tocas «Todas iguales».
24. **Pon el pasador en R0** y confirma.
25. Abanico, ojo izquierdo, vuelta 1 (carta sin girar): el niño ve todas iguales → tocas «Todas iguales».
26. Abanico, ojo izquierdo, vuelta 2 (carta girada 120°): el niño ve todas iguales → tocas «Todas iguales».
27. **Prueba de cerca, ojo derecho:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
28. Ojo derecho, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan ↑ ↓ ← ↓ →; tocas ↑ ↓ ← ↓ →; aciertos 5 de 5 → **pasa** (hacen falta 4).
29. **Prueba de cerca, ojo izquierdo:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
30. Ojo izquierdo, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan → ↓ ← → ↓; tocas → ↓ ← → ↓; aciertos 5 de 5 → **pasa** (hacen falta 4).

</details>

## 5. Hipermetropía (+3,0 D)

**Cómo es el niño:** Lee 6/9 de lejos (su ojo acomoda), pero también lo lee con los lentes de +2.00.

**Qué debe salir:** semáforo **ROJO** · indicación **Derivar**

**Por qué (reglas del SPEC):** Hipermetropía = pasa de lejos y TAMBIÉN pasa con +2.00 (el ojo normal se nubla con esos lentes, el hipermétrope no). No se mide cuánto.

**Resultado que da la app:**
- Ojo derecho: semáforo **ROJO** · categoría: hipermetropía · sin punto remoto
- Ojo izquierdo: semáforo **ROJO** · categoría: hipermetropía · sin punto remoto
- Niño: semáforo **ROJO** · **Derivar**

<details>
<summary>Secuencia completa de la prueba (17 pasos)</summary>

1. **Pon el pasador en R0** y confirma.
2. Ojo derecho, línea 6/60 en R0, prueba práctica (no cuenta): las «E» apuntan ↑ ← → ← ↑; tocas ↑ ← → ← ↑; aciertos 5 de 5.
3. Ojo derecho, línea 6/9 en R0, prueba de lejos: las «E» apuntan ← → ↑ → ←; tocas ← → ↑ → ←; aciertos 5 de 5 → **pasa** (hacen falta 4).
4. Ojo izquierdo, línea 6/9 en R0, prueba de lejos: las «E» apuntan ← → ↓ → ↓; tocas ← → ↓ → ↓; aciertos 5 de 5 → **pasa** (hacen falta 4).
5. **Pon el pasador en R0** y baja la tapa +2.00 y confirma.
6. **Espera 60 s** con los dos ojos mirando el círculo azul, y confirma.
7. Ojo derecho, línea 6/9 en R0, prueba con los lentes de +2.00: las «E» apuntan ↓ ← → ↓ ←; tocas ↓ ← → ↓ ←; aciertos 5 de 5 → **pasa** (hacen falta 4).
8. Ojo izquierdo, línea 6/9 en R0, prueba con los lentes de +2.00: las «E» apuntan → ↓ ↑ ← ↓; tocas → ↓ ↑ ← ↓; aciertos 5 de 5 → **pasa** (hacen falta 4).
9. **Pon el pasador en R0** (sube la tapa +2.00) y confirma.
10. Abanico, ojo derecho, vuelta 1 (carta sin girar): el niño ve todas iguales → tocas «Todas iguales».
11. Abanico, ojo derecho, vuelta 2 (carta girada 90°): el niño ve todas iguales → tocas «Todas iguales».
12. Abanico, ojo izquierdo, vuelta 1 (carta sin girar): el niño ve todas iguales → tocas «Todas iguales».
13. Abanico, ojo izquierdo, vuelta 2 (carta girada 60°): el niño ve todas iguales → tocas «Todas iguales».
14. **Prueba de cerca, ojo derecho:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
15. Ojo derecho, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan ↓ ↑ ↓ → ↑; tocas ↓ ↑ ↓ → ↑; aciertos 5 de 5 → **pasa** (hacen falta 4).
16. **Prueba de cerca, ojo izquierdo:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
17. Ojo izquierdo, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan ↑ ↓ ← ↑ ↓; tocas ↑ ↓ ← ↑ ↓; aciertos 5 de 5 → **pasa** (hacen falta 4).

</details>

## 6. Hipermetropía que solo se nota de cerca (+1,0 D)

**Cómo es el niño:** Lee 6/9 de lejos, se nubla con los lentes de +2.00 (como un niño normal), pero no lee 6/9 de cerca.

**Qué debe salir:** semáforo **ROJO** · indicación **Derivar**

**Por qué (reglas del SPEC):** También es hipermetropía si pasa de lejos y NO pasa de cerca. «Normal» exige pasar de cerca, así que no es verde.

**Resultado que da la app:**
- Ojo derecho: semáforo **ROJO** · categoría: hipermetropía · sin punto remoto
- Ojo izquierdo: semáforo **ROJO** · categoría: hipermetropía · sin punto remoto
- Niño: semáforo **ROJO** · **Derivar**

<details>
<summary>Secuencia completa de la prueba (17 pasos)</summary>

1. **Pon el pasador en R0** y confirma.
2. Ojo derecho, línea 6/60 en R0, prueba práctica (no cuenta): las «E» apuntan ↑ ← → ← ↑; tocas ↑ ← → ← ↑; aciertos 5 de 5.
3. Ojo derecho, línea 6/9 en R0, prueba de lejos: las «E» apuntan ← → ↑ → ←; tocas ← → ↑ → ←; aciertos 5 de 5 → **pasa** (hacen falta 4).
4. Ojo izquierdo, línea 6/9 en R0, prueba de lejos: las «E» apuntan ← → ↓ → ↓; tocas ← → ↓ → ↓; aciertos 5 de 5 → **pasa** (hacen falta 4).
5. **Pon el pasador en R0** y baja la tapa +2.00 y confirma.
6. **Espera 60 s** con los dos ojos mirando el círculo azul, y confirma.
7. Ojo derecho, línea 6/9 en R0, prueba con los lentes de +2.00: las «E» apuntan ↓ ← → ↓ ←; tocas ↑ → ← ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
8. Ojo izquierdo, línea 6/9 en R0, prueba con los lentes de +2.00: las «E» apuntan → ↓ ↑ ← ↓; tocas ← ↑ ↓ → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
9. **Pon el pasador en R0** (sube la tapa +2.00) y confirma.
10. Abanico, ojo derecho, vuelta 1 (carta sin girar): el niño ve todas iguales → tocas «Todas iguales».
11. Abanico, ojo derecho, vuelta 2 (carta girada 90°): el niño ve todas iguales → tocas «Todas iguales».
12. Abanico, ojo izquierdo, vuelta 1 (carta sin girar): el niño ve todas iguales → tocas «Todas iguales».
13. Abanico, ojo izquierdo, vuelta 2 (carta girada 60°): el niño ve todas iguales → tocas «Todas iguales».
14. **Prueba de cerca, ojo derecho:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
15. Ojo derecho, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan ↓ ↑ ↓ → ↑; tocas ↑ ↓ ↑ ← ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
16. **Prueba de cerca, ojo izquierdo:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
17. Ojo izquierdo, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan ↑ ↓ ← ↑ ↓; tocas ↓ ↑ → ↓ ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).

</details>

## 7. Astigmatismo con mala agudeza

**Cómo es el niño:** Es miope (−1,0 D) y en el abanico ve más negra siempre la misma línea (vertical), en las dos vueltas aunque la carta gire.

**Qué debe salir:** semáforo **ROJO** · indicación **Derivar**

**Por qué (reglas del SPEC):** Astigmatismo = el abanico es consistente (las dos líneas elegidas, ya sumado el giro de la carta, difieren 15° o menos) Y la agudeza falla (de lejos o de cerca).

**Resultado que da la app:**
- Ojo derecho: semáforo **ROJO** · categoría: miopía + astigmatismo · punto remoto R2 (miopía estimada -0,99 D)
- Ojo izquierdo: semáforo **ROJO** · categoría: miopía + astigmatismo · punto remoto R2 (miopía estimada -0,99 D)
- Niño: semáforo **ROJO** · **Derivar**

<details>
<summary>Secuencia completa de la prueba (28 pasos)</summary>

1. **Pon el pasador en R0** y confirma.
2. Ojo derecho, línea 6/60 en R0, prueba práctica (no cuenta): las «E» apuntan ↑ ← → ← ↑; tocas ↑ ← → ← ↑; aciertos 5 de 5.
3. Ojo derecho, línea 6/9 en R0, prueba de lejos: las «E» apuntan ← → ↑ → ←; tocas → ← ↓ ← →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
4. Ojo derecho, línea 6/60 en R0, prueba para ver cuánto lee: las «E» apuntan ↓ → ↓ → ↓; tocas ↓ → ↓ → ↓; aciertos 5 de 5 → **pasa** (hacen falta 3).
5. Ojo derecho, línea 6/36 en R0, prueba para ver cuánto lee: las «E» apuntan ← ↓ → ↓ ←; tocas → ↑ ← ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 3).
6. Ojo derecho, línea 6/24 en R0, prueba de control: las «E» apuntan → ↓ ↑ ← ↓; tocas ← ↑ ↓ → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
7. Ojo izquierdo, línea 6/9 en R0, prueba de lejos: las «E» apuntan → ↑ ← ↑ ↓; tocas ← ↓ → ↓ ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
8. Ojo izquierdo, línea 6/60 en R0, prueba para ver cuánto lee: las «E» apuntan → ↑ → ↓ ←; tocas → ↑ → ↓ ←; aciertos 5 de 5 → **pasa** (hacen falta 3).
9. Ojo izquierdo, línea 6/36 en R0, prueba para ver cuánto lee: las «E» apuntan ↑ ↓ ← ↑ ↓; tocas ↓ ↑ → ↓ ↑; aciertos 0 de 5 → **no pasa** (hacen falta 3).
10. Ojo izquierdo, línea 6/24 en R0, prueba de control: las «E» apuntan → ↑ ↓ ← ↑; tocas ← ↓ ↑ → ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
11. **Pon el pasador en R1** y confirma.
12. Ojo derecho, línea 6/12 en R1, prueba buscando el punto remoto: las «E» apuntan ↑ ← → ↓ ←; tocas ↓ → ← ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
13. Ojo izquierdo, línea 6/12 en R1, prueba buscando el punto remoto: las «E» apuntan ↓ ↑ → ← →; tocas ↑ ↓ ← → ←; aciertos 0 de 5 → **no pasa** (hacen falta 4).
14. **Pon el pasador en R2** y confirma.
15. Ojo derecho, línea 6/12 en R2, prueba buscando el punto remoto: las «E» apuntan → ↑ ↓ ↑ →; tocas → ↑ ↓ ↑ →; aciertos 5 de 5 → **pasa** (hacen falta 4).
16. Ojo izquierdo, línea 6/12 en R2, prueba buscando el punto remoto: las «E» apuntan ← ↓ ↑ ↓ ←; tocas ← ↓ ↑ ↓ ←; aciertos 5 de 5 → **pasa** (hacen falta 4).
17. **Pon el pasador en R3** y confirma.
18. Ojo derecho, línea 6/12 en R3, prueba buscando el punto remoto: las «E» apuntan ← → ↓ → ←; tocas ← → ↓ → ←; aciertos 5 de 5 → **pasa** (hacen falta 4).
19. Ojo izquierdo, línea 6/12 en R3, prueba buscando el punto remoto: las «E» apuntan → ↓ ← ↓ ↑; tocas → ↓ ← ↓ ↑; aciertos 5 de 5 → **pasa** (hacen falta 4).
20. **Pon el pasador en R2** y confirma.
21. Abanico, ojo derecho, vuelta 1 (carta sin girar): el niño dice «1» → tocas «1».
22. Abanico, ojo derecho, vuelta 2 (carta girada 120°): el niño dice «5» → tocas «5».
23. Abanico, ojo izquierdo, vuelta 1 (carta sin girar): el niño dice «1» → tocas «1».
24. Abanico, ojo izquierdo, vuelta 2 (carta girada 60°): el niño dice «3» → tocas «3».
25. **Prueba de cerca, ojo derecho:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
26. Ojo derecho, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan ↑ ← ↓ ↑ →; tocas ↑ ← ↓ ↑ →; aciertos 5 de 5 → **pasa** (hacen falta 4).
27. **Prueba de cerca, ojo izquierdo:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
28. Ojo izquierdo, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan → ← ↓ ↑ ↓; tocas → ← ↓ ↑ ↓; aciertos 5 de 5 → **pasa** (hacen falta 4).

</details>

## 8. Posible astigmatismo (por validar)

**Cómo es el niño:** Ve bien de lejos y de cerca, pero en el abanico elige siempre la misma línea.

**Qué debe salir:** semáforo **VERDE** · indicación **No derivar**

**Por qué (reglas del SPEC):** Con buena agudeza de lejos y de cerca, un abanico consistente NO es astigmatismo: se anota «posible astigmatismo (por validar)» y no cambia el semáforo, porque la pantalla puede hacer ver más negras las líneas verticales y horizontales.

**Resultado que da la app:**
- Ojo derecho: semáforo **VERDE** · categoría: normal · sin punto remoto · «posible astigmatismo (por validar)»
- Ojo izquierdo: semáforo **VERDE** · categoría: normal · sin punto remoto · «posible astigmatismo (por validar)»
- Niño: semáforo **VERDE** · **No derivar**

<details>
<summary>Secuencia completa de la prueba (17 pasos)</summary>

1. **Pon el pasador en R0** y confirma.
2. Ojo derecho, línea 6/60 en R0, prueba práctica (no cuenta): las «E» apuntan ↑ ← → ← ↑; tocas ↑ ← → ← ↑; aciertos 5 de 5.
3. Ojo derecho, línea 6/9 en R0, prueba de lejos: las «E» apuntan ← → ↑ → ←; tocas ← → ↑ → ←; aciertos 5 de 5 → **pasa** (hacen falta 4).
4. Ojo izquierdo, línea 6/9 en R0, prueba de lejos: las «E» apuntan ← → ↓ → ↓; tocas ← → ↓ → ↓; aciertos 5 de 5 → **pasa** (hacen falta 4).
5. **Pon el pasador en R0** y baja la tapa +2.00 y confirma.
6. **Espera 60 s** con los dos ojos mirando el círculo azul, y confirma.
7. Ojo derecho, línea 6/9 en R0, prueba con los lentes de +2.00: las «E» apuntan ↓ ← → ↓ ←; tocas ↑ → ← ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
8. Ojo izquierdo, línea 6/9 en R0, prueba con los lentes de +2.00: las «E» apuntan → ↓ ↑ ← ↓; tocas ← ↑ ↓ → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
9. **Pon el pasador en R0** (sube la tapa +2.00) y confirma.
10. Abanico, ojo derecho, vuelta 1 (carta sin girar): el niño dice «1» → tocas «1».
11. Abanico, ojo derecho, vuelta 2 (carta girada 90°): el niño dice «4» → tocas «4».
12. Abanico, ojo izquierdo, vuelta 1 (carta sin girar): el niño dice «1» → tocas «1».
13. Abanico, ojo izquierdo, vuelta 2 (carta girada 60°): el niño dice «3» → tocas «3».
14. **Prueba de cerca, ojo derecho:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
15. Ojo derecho, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan ↓ ↑ ↓ → ↑; tocas ↓ ↑ ↓ → ↑; aciertos 5 de 5 → **pasa** (hacen falta 4).
16. **Prueba de cerca, ojo izquierdo:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
17. Ojo izquierdo, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan ↑ ↓ ← ↑ ↓; tocas ↑ ↓ ← ↑ ↓; aciertos 5 de 5 → **pasa** (hacen falta 4).

</details>

## 9. Abanico que no se repite

**Cómo es el niño:** Es miope (−1,0 D). En el abanico elige una línea distinta cada vez que la carta gira (en la práctica, elige «todas iguales»).

**Qué debe salir:** semáforo **ROJO** · indicación **Derivar**

**Por qué (reglas del SPEC):** «Todas iguales» en cualquiera de las dos vueltas = abanico no consistente = no hay astigmatismo.

**Resultado que da la app:**
- Ojo derecho: semáforo **ROJO** · categoría: miopía · punto remoto R2 (miopía estimada -0,99 D)
- Ojo izquierdo: semáforo **ROJO** · categoría: miopía · punto remoto R2 (miopía estimada -0,99 D)
- Niño: semáforo **ROJO** · **Derivar**

<details>
<summary>Secuencia completa de la prueba (28 pasos)</summary>

1. **Pon el pasador en R0** y confirma.
2. Ojo derecho, línea 6/60 en R0, prueba práctica (no cuenta): las «E» apuntan ↑ ← → ← ↑; tocas ↑ ← → ← ↑; aciertos 5 de 5.
3. Ojo derecho, línea 6/9 en R0, prueba de lejos: las «E» apuntan ← → ↑ → ←; tocas → ← ↓ ← →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
4. Ojo derecho, línea 6/60 en R0, prueba para ver cuánto lee: las «E» apuntan ↓ → ↓ → ↓; tocas ↓ → ↓ → ↓; aciertos 5 de 5 → **pasa** (hacen falta 3).
5. Ojo derecho, línea 6/36 en R0, prueba para ver cuánto lee: las «E» apuntan ← ↓ → ↓ ←; tocas → ↑ ← ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 3).
6. Ojo derecho, línea 6/24 en R0, prueba de control: las «E» apuntan → ↓ ↑ ← ↓; tocas ← ↑ ↓ → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
7. Ojo izquierdo, línea 6/9 en R0, prueba de lejos: las «E» apuntan → ↑ ← ↑ ↓; tocas ← ↓ → ↓ ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
8. Ojo izquierdo, línea 6/60 en R0, prueba para ver cuánto lee: las «E» apuntan → ↑ → ↓ ←; tocas → ↑ → ↓ ←; aciertos 5 de 5 → **pasa** (hacen falta 3).
9. Ojo izquierdo, línea 6/36 en R0, prueba para ver cuánto lee: las «E» apuntan ↑ ↓ ← ↑ ↓; tocas ↓ ↑ → ↓ ↑; aciertos 0 de 5 → **no pasa** (hacen falta 3).
10. Ojo izquierdo, línea 6/24 en R0, prueba de control: las «E» apuntan → ↑ ↓ ← ↑; tocas ← ↓ ↑ → ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
11. **Pon el pasador en R1** y confirma.
12. Ojo derecho, línea 6/12 en R1, prueba buscando el punto remoto: las «E» apuntan ↑ ← → ↓ ←; tocas ↓ → ← ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
13. Ojo izquierdo, línea 6/12 en R1, prueba buscando el punto remoto: las «E» apuntan ↓ ↑ → ← →; tocas ↑ ↓ ← → ←; aciertos 0 de 5 → **no pasa** (hacen falta 4).
14. **Pon el pasador en R2** y confirma.
15. Ojo derecho, línea 6/12 en R2, prueba buscando el punto remoto: las «E» apuntan → ↑ ↓ ↑ →; tocas → ↑ ↓ ↑ →; aciertos 5 de 5 → **pasa** (hacen falta 4).
16. Ojo izquierdo, línea 6/12 en R2, prueba buscando el punto remoto: las «E» apuntan ← ↓ ↑ ↓ ←; tocas ← ↓ ↑ ↓ ←; aciertos 5 de 5 → **pasa** (hacen falta 4).
17. **Pon el pasador en R3** y confirma.
18. Ojo derecho, línea 6/12 en R3, prueba buscando el punto remoto: las «E» apuntan ← → ↓ → ←; tocas ← → ↓ → ←; aciertos 5 de 5 → **pasa** (hacen falta 4).
19. Ojo izquierdo, línea 6/12 en R3, prueba buscando el punto remoto: las «E» apuntan → ↓ ← ↓ ↑; tocas → ↓ ← ↓ ↑; aciertos 5 de 5 → **pasa** (hacen falta 4).
20. **Pon el pasador en R2** y confirma.
21. Abanico, ojo derecho, vuelta 1 (carta sin girar): el niño ve todas iguales → tocas «Todas iguales».
22. Abanico, ojo derecho, vuelta 2 (carta girada 120°): el niño ve todas iguales → tocas «Todas iguales».
23. Abanico, ojo izquierdo, vuelta 1 (carta sin girar): el niño ve todas iguales → tocas «Todas iguales».
24. Abanico, ojo izquierdo, vuelta 2 (carta girada 60°): el niño ve todas iguales → tocas «Todas iguales».
25. **Prueba de cerca, ojo derecho:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
26. Ojo derecho, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan ↑ ← ↓ ↑ →; tocas ↑ ← ↓ ↑ →; aciertos 5 de 5 → **pasa** (hacen falta 4).
27. **Prueba de cerca, ojo izquierdo:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
28. Ojo izquierdo, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan → ← ↓ ↑ ↓; tocas → ← ↓ ↑ ↓; aciertos 5 de 5 → **pasa** (hacen falta 4).

</details>

## 10. Otra causa (no mejora con nada)

**Cómo es el niño:** No lee de lejos, no encuentra ninguna ranura donde vea mejor y tampoco mejora con el estenopeico (el agujerito).

**Qué debe salir:** semáforo **ROJO** · indicación **Derivar**

**Por qué (reglas del SPEC):** Otra causa = falla de lejos, sin punto remoto, y NO mejora con el estenopeico. Se deriva.

**Resultado que da la app:**
- Ojo derecho: semáforo **ROJO** · categoría: otra causa · sin punto remoto
- Ojo izquierdo: semáforo **ROJO** · categoría: otra causa · sin punto remoto
- Niño: semáforo **ROJO** · **Derivar**

<details>
<summary>Secuencia completa de la prueba (56 pasos)</summary>

1. **Pon el pasador en R0** y confirma.
2. Ojo derecho, línea 6/60 en R0, prueba práctica (no cuenta): las «E» apuntan ↑ ← → ← ↑; tocas ↑ ← → ← ↑; aciertos 5 de 5.
3. Ojo derecho, línea 6/9 en R0, prueba de lejos: las «E» apuntan ← → ↑ → ←; tocas → ← ↓ ← →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
4. Ojo derecho, línea 6/60 en R0, prueba para ver cuánto lee: las «E» apuntan ↓ → ↓ → ↓; tocas ↓ → ↓ → ↓; aciertos 5 de 5 → **pasa** (hacen falta 3).
5. Ojo derecho, línea 6/36 en R0, prueba para ver cuánto lee: las «E» apuntan ← ↓ → ↓ ←; tocas → ↑ ← ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 3).
6. Ojo derecho, línea 6/24 en R0, prueba de control: las «E» apuntan → ↓ ↑ ← ↓; tocas ← ↑ ↓ → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
7. Ojo izquierdo, línea 6/9 en R0, prueba de lejos: las «E» apuntan → ↑ ← ↑ ↓; tocas ← ↓ → ↓ ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
8. Ojo izquierdo, línea 6/60 en R0, prueba para ver cuánto lee: las «E» apuntan → ↑ → ↓ ←; tocas → ↑ → ↓ ←; aciertos 5 de 5 → **pasa** (hacen falta 3).
9. Ojo izquierdo, línea 6/36 en R0, prueba para ver cuánto lee: las «E» apuntan ↑ ↓ ← ↑ ↓; tocas ↓ ↑ → ↓ ↑; aciertos 0 de 5 → **no pasa** (hacen falta 3).
10. Ojo izquierdo, línea 6/24 en R0, prueba de control: las «E» apuntan → ↑ ↓ ← ↑; tocas ← ↓ ↑ → ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
11. **Pon el pasador en R1** y confirma.
12. Ojo derecho, línea 6/12 en R1, prueba buscando el punto remoto: las «E» apuntan ↑ ← → ↓ ←; tocas ↓ → ← ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
13. Ojo izquierdo, línea 6/12 en R1, prueba buscando el punto remoto: las «E» apuntan ↓ ↑ → ← →; tocas ↑ ↓ ← → ←; aciertos 0 de 5 → **no pasa** (hacen falta 4).
14. **Pon el pasador en R2** y confirma.
15. Ojo derecho, línea 6/12 en R2, prueba buscando el punto remoto: las «E» apuntan → ↑ ↓ ↑ →; tocas ← ↓ ↑ ↓ ←; aciertos 0 de 5 → **no pasa** (hacen falta 4).
16. Ojo izquierdo, línea 6/12 en R2, prueba buscando el punto remoto: las «E» apuntan ← ↓ ↑ ↓ ←; tocas → ↑ ↓ ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
17. **Pon el pasador en R3** y confirma.
18. Ojo derecho, línea 6/12 en R3, prueba buscando el punto remoto: las «E» apuntan ← → ↓ → ←; tocas → ← ↑ ← →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
19. Ojo izquierdo, línea 6/12 en R3, prueba buscando el punto remoto: las «E» apuntan → ↓ ← ↓ ↑; tocas ← ↑ → ↑ ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
20. **Pon el pasador en R4** y confirma.
21. Ojo derecho, línea 6/18 en R4, prueba buscando el punto remoto: las «E» apuntan ↓ ↑ → ← ↓; tocas ↑ ↓ ← → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
22. Ojo izquierdo, línea 6/18 en R4, prueba buscando el punto remoto: las «E» apuntan → ↑ → ← ↓; tocas ← ↓ ← → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
23. **Pon el pasador en R5** y confirma.
24. Ojo derecho, línea 6/18 en R5, prueba buscando el punto remoto: las «E» apuntan ↑ ↓ ← → ↑; tocas ↓ ↑ → ← ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
25. Ojo izquierdo, línea 6/18 en R5, prueba buscando el punto remoto: las «E» apuntan → ↑ ← ↑ ←; tocas ← ↓ → ↓ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
26. **Pon el pasador en R6** y confirma.
27. Ojo derecho, línea 6/18 en R6, prueba buscando el punto remoto: las «E» apuntan ← → ↑ ↓ →; tocas → ← ↓ ↑ ←; aciertos 0 de 5 → **no pasa** (hacen falta 4).
28. Ojo izquierdo, línea 6/18 en R6, prueba buscando el punto remoto: las «E» apuntan ↑ ↓ → ← ↓; tocas ↓ ↑ ← → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
29. **Pon el pasador en R7** y confirma.
30. Ojo derecho, línea 6/18 en R7, prueba buscando el punto remoto: las «E» apuntan ← ↑ ← → ↑; tocas → ↓ → ← ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
31. Ojo izquierdo, línea 6/18 en R7, prueba buscando el punto remoto: las «E» apuntan ← ↓ → ← ↑; tocas → ↑ ← → ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
32. **Pon el pasador en R8** y confirma.
33. Ojo derecho, línea 6/18 en R8, prueba buscando el punto remoto: las «E» apuntan ← → ← ↓ ↑; tocas → ← → ↑ ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
34. Ojo izquierdo, línea 6/18 en R8, prueba buscando el punto remoto: las «E» apuntan → ← ↓ ← ↓; tocas ← → ↑ → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
35. **Pon el pasador en R9** y confirma.
36. Ojo derecho, línea 6/18 en R9, prueba buscando el punto remoto: las «E» apuntan → ← ↑ ← ↑; tocas ← → ↓ → ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
37. Ojo izquierdo, línea 6/18 en R9, prueba buscando el punto remoto: las «E» apuntan ← ↓ → ↓ →; tocas → ↑ ← ↑ ←; aciertos 0 de 5 → **no pasa** (hacen falta 4).
38. **Pon el pasador en R10** y confirma.
39. Ojo derecho, línea 6/24 en R10, prueba buscando el punto remoto: las «E» apuntan → ↑ → ↑ ←; tocas ← ↓ ← ↓ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
40. Ojo izquierdo, línea 6/24 en R10, prueba buscando el punto remoto: las «E» apuntan ↑ ↓ → ← ↑; tocas ↓ ↑ ← → ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
41. **Pon el pasador en R0** y pon el estenopeico y confirma.
42. Ojo derecho, línea 6/60 en R0, prueba con el estenopeico: las «E» apuntan → ↓ → ↓ ↑; tocas → ↓ → ↓ ↑; aciertos 5 de 5 → **pasa** (hacen falta 3).
43. Ojo derecho, línea 6/36 en R0, prueba con el estenopeico: las «E» apuntan ← ↑ ↓ ↑ ←; tocas → ↓ ↑ ↓ →; aciertos 0 de 5 → **no pasa** (hacen falta 3).
44. Ojo derecho, línea 6/24 en R0, prueba de control: las «E» apuntan ↓ → ↑ ← ↑; tocas ↑ ← ↓ → ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
45. Ojo izquierdo, línea 6/60 en R0, prueba con el estenopeico: las «E» apuntan ↓ ↑ ← → ↓; tocas ↓ ↑ ← → ↓; aciertos 5 de 5 → **pasa** (hacen falta 3).
46. Ojo izquierdo, línea 6/36 en R0, prueba con el estenopeico: las «E» apuntan → ↑ ↓ ← ↑; tocas ← ↓ ↑ → ↓; aciertos 0 de 5 → **no pasa** (hacen falta 3).
47. Ojo izquierdo, línea 6/24 en R0, prueba de control: las «E» apuntan → ← → ↓ ←; tocas ← → ← ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
48. **Pon el pasador en R0** (quita el estenopeico) y confirma.
49. Abanico, ojo derecho, vuelta 1 (carta sin girar): el niño ve todas iguales → tocas «Todas iguales».
50. Abanico, ojo derecho, vuelta 2 (carta girada 90°): el niño ve todas iguales → tocas «Todas iguales».
51. Abanico, ojo izquierdo, vuelta 1 (carta sin girar): el niño ve todas iguales → tocas «Todas iguales».
52. Abanico, ojo izquierdo, vuelta 2 (carta girada 60°): el niño ve todas iguales → tocas «Todas iguales».
53. **Prueba de cerca, ojo derecho:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
54. Ojo derecho, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan → ← ↓ ↑ →; tocas ← → ↑ ↓ ←; aciertos 0 de 5 → **no pasa** (hacen falta 4).
55. **Prueba de cerca, ojo izquierdo:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
56. Ojo izquierdo, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan → ↑ ↓ ← →; tocas ← ↓ ↑ → ←; aciertos 0 de 5 → **no pasa** (hacen falta 4).

</details>

## 11. Indeterminado (mejora con el estenopeico)

**Cómo es el niño:** No lee de lejos y no encuentra punto remoto, pero con el estenopeico lee mejor.

**Qué debe salir:** semáforo **ROJO** · indicación **Derivar**

**Por qué (reglas del SPEC):** Indeterminado = falla de lejos, sin punto remoto, y SÍ mejora con el estenopeico (parece un problema de enfoque que la caja no alcanza a medir). Se deriva.

**Resultado que da la app:**
- Ojo derecho: semáforo **ROJO** · categoría: indeterminado · sin punto remoto
- Ojo izquierdo: semáforo **ROJO** · categoría: indeterminado · sin punto remoto
- Niño: semáforo **ROJO** · **Derivar**

<details>
<summary>Secuencia completa de la prueba (62 pasos)</summary>

1. **Pon el pasador en R0** y confirma.
2. Ojo derecho, línea 6/60 en R0, prueba práctica (no cuenta): las «E» apuntan ↑ ← → ← ↑; tocas ↑ ← → ← ↑; aciertos 5 de 5.
3. Ojo derecho, línea 6/9 en R0, prueba de lejos: las «E» apuntan ← → ↑ → ←; tocas → ← ↓ ← →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
4. Ojo derecho, línea 6/60 en R0, prueba para ver cuánto lee: las «E» apuntan ↓ → ↓ → ↓; tocas ↓ → ↓ → ↓; aciertos 5 de 5 → **pasa** (hacen falta 3).
5. Ojo derecho, línea 6/36 en R0, prueba para ver cuánto lee: las «E» apuntan ← ↓ → ↓ ←; tocas → ↑ ← ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 3).
6. Ojo derecho, línea 6/24 en R0, prueba de control: las «E» apuntan → ↓ ↑ ← ↓; tocas ← ↑ ↓ → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
7. Ojo izquierdo, línea 6/9 en R0, prueba de lejos: las «E» apuntan → ↑ ← ↑ ↓; tocas ← ↓ → ↓ ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
8. Ojo izquierdo, línea 6/60 en R0, prueba para ver cuánto lee: las «E» apuntan → ↑ → ↓ ←; tocas → ↑ → ↓ ←; aciertos 5 de 5 → **pasa** (hacen falta 3).
9. Ojo izquierdo, línea 6/36 en R0, prueba para ver cuánto lee: las «E» apuntan ↑ ↓ ← ↑ ↓; tocas ↓ ↑ → ↓ ↑; aciertos 0 de 5 → **no pasa** (hacen falta 3).
10. Ojo izquierdo, línea 6/24 en R0, prueba de control: las «E» apuntan → ↑ ↓ ← ↑; tocas ← ↓ ↑ → ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
11. **Pon el pasador en R1** y confirma.
12. Ojo derecho, línea 6/12 en R1, prueba buscando el punto remoto: las «E» apuntan ↑ ← → ↓ ←; tocas ↓ → ← ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
13. Ojo izquierdo, línea 6/12 en R1, prueba buscando el punto remoto: las «E» apuntan ↓ ↑ → ← →; tocas ↑ ↓ ← → ←; aciertos 0 de 5 → **no pasa** (hacen falta 4).
14. **Pon el pasador en R2** y confirma.
15. Ojo derecho, línea 6/12 en R2, prueba buscando el punto remoto: las «E» apuntan → ↑ ↓ ↑ →; tocas ← ↓ ↑ ↓ ←; aciertos 0 de 5 → **no pasa** (hacen falta 4).
16. Ojo izquierdo, línea 6/12 en R2, prueba buscando el punto remoto: las «E» apuntan ← ↓ ↑ ↓ ←; tocas → ↑ ↓ ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
17. **Pon el pasador en R3** y confirma.
18. Ojo derecho, línea 6/12 en R3, prueba buscando el punto remoto: las «E» apuntan ← → ↓ → ←; tocas → ← ↑ ← →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
19. Ojo izquierdo, línea 6/12 en R3, prueba buscando el punto remoto: las «E» apuntan → ↓ ← ↓ ↑; tocas ← ↑ → ↑ ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
20. **Pon el pasador en R4** y confirma.
21. Ojo derecho, línea 6/18 en R4, prueba buscando el punto remoto: las «E» apuntan ↓ ↑ → ← ↓; tocas ↑ ↓ ← → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
22. Ojo izquierdo, línea 6/18 en R4, prueba buscando el punto remoto: las «E» apuntan → ↑ → ← ↓; tocas ← ↓ ← → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
23. **Pon el pasador en R5** y confirma.
24. Ojo derecho, línea 6/18 en R5, prueba buscando el punto remoto: las «E» apuntan ↑ ↓ ← → ↑; tocas ↓ ↑ → ← ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
25. Ojo izquierdo, línea 6/18 en R5, prueba buscando el punto remoto: las «E» apuntan → ↑ ← ↑ ←; tocas ← ↓ → ↓ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
26. **Pon el pasador en R6** y confirma.
27. Ojo derecho, línea 6/18 en R6, prueba buscando el punto remoto: las «E» apuntan ← → ↑ ↓ →; tocas → ← ↓ ↑ ←; aciertos 0 de 5 → **no pasa** (hacen falta 4).
28. Ojo izquierdo, línea 6/18 en R6, prueba buscando el punto remoto: las «E» apuntan ↑ ↓ → ← ↓; tocas ↓ ↑ ← → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
29. **Pon el pasador en R7** y confirma.
30. Ojo derecho, línea 6/18 en R7, prueba buscando el punto remoto: las «E» apuntan ← ↑ ← → ↑; tocas → ↓ → ← ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
31. Ojo izquierdo, línea 6/18 en R7, prueba buscando el punto remoto: las «E» apuntan ← ↓ → ← ↑; tocas → ↑ ← → ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
32. **Pon el pasador en R8** y confirma.
33. Ojo derecho, línea 6/18 en R8, prueba buscando el punto remoto: las «E» apuntan ← → ← ↓ ↑; tocas → ← → ↑ ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
34. Ojo izquierdo, línea 6/18 en R8, prueba buscando el punto remoto: las «E» apuntan → ← ↓ ← ↓; tocas ← → ↑ → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
35. **Pon el pasador en R9** y confirma.
36. Ojo derecho, línea 6/18 en R9, prueba buscando el punto remoto: las «E» apuntan → ← ↑ ← ↑; tocas ← → ↓ → ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
37. Ojo izquierdo, línea 6/18 en R9, prueba buscando el punto remoto: las «E» apuntan ← ↓ → ↓ →; tocas → ↑ ← ↑ ←; aciertos 0 de 5 → **no pasa** (hacen falta 4).
38. **Pon el pasador en R10** y confirma.
39. Ojo derecho, línea 6/24 en R10, prueba buscando el punto remoto: las «E» apuntan → ↑ → ↑ ←; tocas ← ↓ ← ↓ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
40. Ojo izquierdo, línea 6/24 en R10, prueba buscando el punto remoto: las «E» apuntan ↑ ↓ → ← ↑; tocas ↓ ↑ ← → ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
41. **Pon el pasador en R0** y pon el estenopeico y confirma.
42. Ojo derecho, línea 6/60 en R0, prueba con el estenopeico: las «E» apuntan → ↓ → ↓ ↑; tocas → ↓ → ↓ ↑; aciertos 5 de 5 → **pasa** (hacen falta 3).
43. Ojo derecho, línea 6/36 en R0, prueba con el estenopeico: las «E» apuntan ← ↑ ↓ ↑ ←; tocas ← ↑ ↓ ↑ ←; aciertos 5 de 5 → **pasa** (hacen falta 3).
44. Ojo derecho, línea 6/24 en R0, prueba con el estenopeico: las «E» apuntan ↓ → ↑ ← ↑; tocas ↓ → ↑ ← ↑; aciertos 5 de 5 → **pasa** (hacen falta 3).
45. Ojo derecho, línea 6/18 en R0, prueba con el estenopeico: las «E» apuntan ↓ ↑ ← → ↓; tocas ↓ ↑ ← → ↓; aciertos 5 de 5 → **pasa** (hacen falta 3).
46. Ojo derecho, línea 6/12 en R0, prueba con el estenopeico: las «E» apuntan → ↑ ↓ ← ↑; tocas → ↑ ↓ ← ↑; aciertos 5 de 5 → **pasa** (hacen falta 3).
47. Ojo derecho, línea 6/9 en R0, prueba con el estenopeico: las «E» apuntan → ← → ↓ ←; tocas ← → ← ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 3).
48. Ojo izquierdo, línea 6/60 en R0, prueba con el estenopeico: las «E» apuntan ↓ ↑ → ← ↓; tocas ↓ ↑ → ← ↓; aciertos 5 de 5 → **pasa** (hacen falta 3).
49. Ojo izquierdo, línea 6/36 en R0, prueba con el estenopeico: las «E» apuntan ↑ → ↓ ↑ ↓; tocas ↑ → ↓ ↑ ↓; aciertos 5 de 5 → **pasa** (hacen falta 3).
50. Ojo izquierdo, línea 6/24 en R0, prueba con el estenopeico: las «E» apuntan ← → ← ↑ ←; tocas ← → ← ↑ ←; aciertos 5 de 5 → **pasa** (hacen falta 3).
51. Ojo izquierdo, línea 6/18 en R0, prueba con el estenopeico: las «E» apuntan ↑ ↓ ← ↑ →; tocas ↑ ↓ ← ↑ →; aciertos 5 de 5 → **pasa** (hacen falta 3).
52. Ojo izquierdo, línea 6/12 en R0, prueba con el estenopeico: las «E» apuntan ← ↑ → ↑ ↓; tocas ← ↑ → ↑ ↓; aciertos 5 de 5 → **pasa** (hacen falta 3).
53. Ojo izquierdo, línea 6/9 en R0, prueba con el estenopeico: las «E» apuntan ↑ ← ↓ → ↑; tocas ↓ → ↑ ← ↓; aciertos 0 de 5 → **no pasa** (hacen falta 3).
54. **Pon el pasador en R0** (quita el estenopeico) y confirma.
55. Abanico, ojo derecho, vuelta 1 (carta sin girar): el niño ve todas iguales → tocas «Todas iguales».
56. Abanico, ojo derecho, vuelta 2 (carta girada 120°): el niño ve todas iguales → tocas «Todas iguales».
57. Abanico, ojo izquierdo, vuelta 1 (carta sin girar): el niño ve todas iguales → tocas «Todas iguales».
58. Abanico, ojo izquierdo, vuelta 2 (carta girada 90°): el niño ve todas iguales → tocas «Todas iguales».
59. **Prueba de cerca, ojo derecho:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
60. Ojo derecho, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan ↑ ↓ ← ↑ ↓; tocas ↓ ↑ → ↓ ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
61. **Prueba de cerca, ojo izquierdo:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
62. Ojo izquierdo, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan ↓ ← ↓ → ↑; tocas ↑ → ↑ ← ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).

</details>

## 12. Miopía mayor a −5 D (más de lo que mide la caja)

**Cómo es el niño:** Es muy miope (−7,0 D): no lee en ninguna ranura, de R1 a R10, y el estenopeico (el agujerito) tampoco le mejora la lectura.

**Qué debe salir:** semáforo **ROJO** · indicación **Derivar**

**Por qué (reglas del SPEC):** Sin punto remoto, la app no puede decir cuánta miopía hay. Si el estenopeico no mejora sale «otra causa»; si mejora, «indeterminado» (que puede ser una miopía mayor a −5 D). Los dos son rojos: se deriva.

**Resultado que da la app:**
- Ojo derecho: semáforo **ROJO** · categoría: otra causa · sin punto remoto
- Ojo izquierdo: semáforo **ROJO** · categoría: otra causa · sin punto remoto
- Niño: semáforo **ROJO** · **Derivar**

<details>
<summary>Secuencia completa de la prueba (56 pasos)</summary>

1. **Pon el pasador en R0** y confirma.
2. Ojo derecho, línea 6/60 en R0, prueba práctica (no cuenta): las «E» apuntan ↑ ← → ← ↑; tocas ↑ ← → ← ↑; aciertos 5 de 5.
3. Ojo derecho, línea 6/9 en R0, prueba de lejos: las «E» apuntan ← → ↑ → ←; tocas → ← ↓ ← →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
4. Ojo derecho, línea 6/60 en R0, prueba para ver cuánto lee: las «E» apuntan ↓ → ↓ → ↓; tocas ↓ → ↓ → ↓; aciertos 5 de 5 → **pasa** (hacen falta 3).
5. Ojo derecho, línea 6/36 en R0, prueba para ver cuánto lee: las «E» apuntan ← ↓ → ↓ ←; tocas → ↑ ← ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 3).
6. Ojo derecho, línea 6/24 en R0, prueba de control: las «E» apuntan → ↓ ↑ ← ↓; tocas ← ↑ ↓ → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
7. Ojo izquierdo, línea 6/9 en R0, prueba de lejos: las «E» apuntan → ↑ ← ↑ ↓; tocas ← ↓ → ↓ ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
8. Ojo izquierdo, línea 6/60 en R0, prueba para ver cuánto lee: las «E» apuntan → ↑ → ↓ ←; tocas → ↑ → ↓ ←; aciertos 5 de 5 → **pasa** (hacen falta 3).
9. Ojo izquierdo, línea 6/36 en R0, prueba para ver cuánto lee: las «E» apuntan ↑ ↓ ← ↑ ↓; tocas ↓ ↑ → ↓ ↑; aciertos 0 de 5 → **no pasa** (hacen falta 3).
10. Ojo izquierdo, línea 6/24 en R0, prueba de control: las «E» apuntan → ↑ ↓ ← ↑; tocas ← ↓ ↑ → ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
11. **Pon el pasador en R1** y confirma.
12. Ojo derecho, línea 6/12 en R1, prueba buscando el punto remoto: las «E» apuntan ↑ ← → ↓ ←; tocas ↓ → ← ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
13. Ojo izquierdo, línea 6/12 en R1, prueba buscando el punto remoto: las «E» apuntan ↓ ↑ → ← →; tocas ↑ ↓ ← → ←; aciertos 0 de 5 → **no pasa** (hacen falta 4).
14. **Pon el pasador en R2** y confirma.
15. Ojo derecho, línea 6/12 en R2, prueba buscando el punto remoto: las «E» apuntan → ↑ ↓ ↑ →; tocas ← ↓ ↑ ↓ ←; aciertos 0 de 5 → **no pasa** (hacen falta 4).
16. Ojo izquierdo, línea 6/12 en R2, prueba buscando el punto remoto: las «E» apuntan ← ↓ ↑ ↓ ←; tocas → ↑ ↓ ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
17. **Pon el pasador en R3** y confirma.
18. Ojo derecho, línea 6/12 en R3, prueba buscando el punto remoto: las «E» apuntan ← → ↓ → ←; tocas → ← ↑ ← →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
19. Ojo izquierdo, línea 6/12 en R3, prueba buscando el punto remoto: las «E» apuntan → ↓ ← ↓ ↑; tocas ← ↑ → ↑ ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
20. **Pon el pasador en R4** y confirma.
21. Ojo derecho, línea 6/18 en R4, prueba buscando el punto remoto: las «E» apuntan ↓ ↑ → ← ↓; tocas ↑ ↓ ← → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
22. Ojo izquierdo, línea 6/18 en R4, prueba buscando el punto remoto: las «E» apuntan → ↑ → ← ↓; tocas ← ↓ ← → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
23. **Pon el pasador en R5** y confirma.
24. Ojo derecho, línea 6/18 en R5, prueba buscando el punto remoto: las «E» apuntan ↑ ↓ ← → ↑; tocas ↓ ↑ → ← ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
25. Ojo izquierdo, línea 6/18 en R5, prueba buscando el punto remoto: las «E» apuntan → ↑ ← ↑ ←; tocas ← ↓ → ↓ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
26. **Pon el pasador en R6** y confirma.
27. Ojo derecho, línea 6/18 en R6, prueba buscando el punto remoto: las «E» apuntan ← → ↑ ↓ →; tocas → ← ↓ ↑ ←; aciertos 0 de 5 → **no pasa** (hacen falta 4).
28. Ojo izquierdo, línea 6/18 en R6, prueba buscando el punto remoto: las «E» apuntan ↑ ↓ → ← ↓; tocas ↓ ↑ ← → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
29. **Pon el pasador en R7** y confirma.
30. Ojo derecho, línea 6/18 en R7, prueba buscando el punto remoto: las «E» apuntan ← ↑ ← → ↑; tocas → ↓ → ← ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
31. Ojo izquierdo, línea 6/18 en R7, prueba buscando el punto remoto: las «E» apuntan ← ↓ → ← ↑; tocas → ↑ ← → ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
32. **Pon el pasador en R8** y confirma.
33. Ojo derecho, línea 6/18 en R8, prueba buscando el punto remoto: las «E» apuntan ← → ← ↓ ↑; tocas → ← → ↑ ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
34. Ojo izquierdo, línea 6/18 en R8, prueba buscando el punto remoto: las «E» apuntan → ← ↓ ← ↓; tocas ← → ↑ → ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
35. **Pon el pasador en R9** y confirma.
36. Ojo derecho, línea 6/18 en R9, prueba buscando el punto remoto: las «E» apuntan → ← ↑ ← ↑; tocas ← → ↓ → ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
37. Ojo izquierdo, línea 6/18 en R9, prueba buscando el punto remoto: las «E» apuntan ← ↓ → ↓ →; tocas → ↑ ← ↑ ←; aciertos 0 de 5 → **no pasa** (hacen falta 4).
38. **Pon el pasador en R10** y confirma.
39. Ojo derecho, línea 6/24 en R10, prueba buscando el punto remoto: las «E» apuntan → ↑ → ↑ ←; tocas ← ↓ ← ↓ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
40. Ojo izquierdo, línea 6/24 en R10, prueba buscando el punto remoto: las «E» apuntan ↑ ↓ → ← ↑; tocas ↓ ↑ ← → ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
41. **Pon el pasador en R0** y pon el estenopeico y confirma.
42. Ojo derecho, línea 6/60 en R0, prueba con el estenopeico: las «E» apuntan → ↓ → ↓ ↑; tocas → ↓ → ↓ ↑; aciertos 5 de 5 → **pasa** (hacen falta 3).
43. Ojo derecho, línea 6/36 en R0, prueba con el estenopeico: las «E» apuntan ← ↑ ↓ ↑ ←; tocas → ↓ ↑ ↓ →; aciertos 0 de 5 → **no pasa** (hacen falta 3).
44. Ojo derecho, línea 6/24 en R0, prueba de control: las «E» apuntan ↓ → ↑ ← ↑; tocas ↑ ← ↓ → ↓; aciertos 0 de 5 → **no pasa** (hacen falta 4).
45. Ojo izquierdo, línea 6/60 en R0, prueba con el estenopeico: las «E» apuntan ↓ ↑ ← → ↓; tocas ↓ ↑ ← → ↓; aciertos 5 de 5 → **pasa** (hacen falta 3).
46. Ojo izquierdo, línea 6/36 en R0, prueba con el estenopeico: las «E» apuntan → ↑ ↓ ← ↑; tocas ← ↓ ↑ → ↓; aciertos 0 de 5 → **no pasa** (hacen falta 3).
47. Ojo izquierdo, línea 6/24 en R0, prueba de control: las «E» apuntan → ← → ↓ ←; tocas ← → ← ↑ →; aciertos 0 de 5 → **no pasa** (hacen falta 4).
48. **Pon el pasador en R0** (quita el estenopeico) y confirma.
49. Abanico, ojo derecho, vuelta 1 (carta sin girar): el niño ve todas iguales → tocas «Todas iguales».
50. Abanico, ojo derecho, vuelta 2 (carta girada 90°): el niño ve todas iguales → tocas «Todas iguales».
51. Abanico, ojo izquierdo, vuelta 1 (carta sin girar): el niño ve todas iguales → tocas «Todas iguales».
52. Abanico, ojo izquierdo, vuelta 2 (carta girada 60°): el niño ve todas iguales → tocas «Todas iguales».
53. **Prueba de cerca, ojo derecho:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
54. Ojo derecho, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan → ← ↓ ↑ →; tocas ← → ↑ ↓ ←; aciertos 0 de 5 → **no pasa** (hacen falta 4).
55. **Prueba de cerca, ojo izquierdo:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
56. Ojo izquierdo, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan → ↑ ↓ ← →; tocas ← ↓ ↑ → ←; aciertos 0 de 5 → **no pasa** (hacen falta 4).

</details>

## 13. Respuestas dudosas (siempre la misma flecha)

**Cómo es el niño:** El niño responde siempre «arriba», sin mirar.

**Qué debe salir:** semáforo **AMARILLO** · indicación **Repetir la prueba**

**Por qué (reglas del SPEC):** Cinco respuestas iguales seguidas = resultado dudoso: el semáforo pasa a amarillo y se indica repetir la prueba.

**Resultado que da la app:**
- Ojo derecho: semáforo **AMARILLO** · categoría: otra causa · sin punto remoto · dudoso: respuestas-iguales
- Ojo izquierdo: semáforo **AMARILLO** · categoría: otra causa · sin punto remoto · dudoso: respuestas-iguales
- Niño: semáforo **AMARILLO** · **Repetir la prueba**

<details>
<summary>Secuencia completa de la prueba (52 pasos)</summary>

1. **Pon el pasador en R0** y confirma.
2. Ojo derecho, línea 6/60 en R0, prueba práctica (no cuenta): las «E» apuntan ↑ ← → ← ↑; tocas ↑ ↑ ↑ ↑ ↑; aciertos 2 de 5.
3. Ojo derecho, línea 6/9 en R0, prueba de lejos: las «E» apuntan ← → ↑ → ←; tocas ↑ ↑ ↑ ↑ ↑; aciertos 1 de 5 → **no pasa** (hacen falta 4).
4. Ojo derecho, línea 6/60 en R0, prueba para ver cuánto lee: las «E» apuntan ↓ → ↓ → ↓; tocas ↑ ↑ ↑ ↑ ↑; aciertos 0 de 5 → **no pasa** (hacen falta 3).
5. Ojo derecho, línea 6/36 en R0, prueba de control: las «E» apuntan ← ↓ → ↓ ←; tocas ↑ ↑ ↑ ↑ ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
6. Ojo izquierdo, línea 6/9 en R0, prueba de lejos: las «E» apuntan → ↓ ↑ ← ↓; tocas ↑ ↑ ↑ ↑ ↑; aciertos 1 de 5 → **no pasa** (hacen falta 4).
7. Ojo izquierdo, línea 6/60 en R0, prueba para ver cuánto lee: las «E» apuntan → ↑ ← ↑ ↓; tocas ↑ ↑ ↑ ↑ ↑; aciertos 2 de 5 → **no pasa** (hacen falta 3).
8. Ojo izquierdo, línea 6/36 en R0, prueba de control: las «E» apuntan → ↑ → ↓ ←; tocas ↑ ↑ ↑ ↑ ↑; aciertos 1 de 5 → **no pasa** (hacen falta 4).
9. **Pon el pasador en R1** y confirma.
10. Ojo derecho, línea 6/12 en R1, prueba buscando el punto remoto: las «E» apuntan ↑ ↓ ← ↑ ↓; tocas ↑ ↑ ↑ ↑ ↑; aciertos 2 de 5 → **no pasa** (hacen falta 4).
11. Ojo izquierdo, línea 6/12 en R1, prueba buscando el punto remoto: las «E» apuntan → ↑ ↓ ← ↑; tocas ↑ ↑ ↑ ↑ ↑; aciertos 2 de 5 → **no pasa** (hacen falta 4).
12. **Pon el pasador en R2** y confirma.
13. Ojo derecho, línea 6/12 en R2, prueba buscando el punto remoto: las «E» apuntan ↑ ← → ↓ ←; tocas ↑ ↑ ↑ ↑ ↑; aciertos 1 de 5 → **no pasa** (hacen falta 4).
14. Ojo izquierdo, línea 6/12 en R2, prueba buscando el punto remoto: las «E» apuntan ↓ ↑ → ← →; tocas ↑ ↑ ↑ ↑ ↑; aciertos 1 de 5 → **no pasa** (hacen falta 4).
15. **Pon el pasador en R3** y confirma.
16. Ojo derecho, línea 6/12 en R3, prueba buscando el punto remoto: las «E» apuntan → ↑ ↓ ↑ →; tocas ↑ ↑ ↑ ↑ ↑; aciertos 2 de 5 → **no pasa** (hacen falta 4).
17. Ojo izquierdo, línea 6/12 en R3, prueba buscando el punto remoto: las «E» apuntan ← ↓ ↑ ↓ ←; tocas ↑ ↑ ↑ ↑ ↑; aciertos 1 de 5 → **no pasa** (hacen falta 4).
18. **Pon el pasador en R4** y confirma.
19. Ojo derecho, línea 6/18 en R4, prueba buscando el punto remoto: las «E» apuntan ← → ↓ → ←; tocas ↑ ↑ ↑ ↑ ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
20. Ojo izquierdo, línea 6/18 en R4, prueba buscando el punto remoto: las «E» apuntan → ↓ ← ↓ ↑; tocas ↑ ↑ ↑ ↑ ↑; aciertos 1 de 5 → **no pasa** (hacen falta 4).
21. **Pon el pasador en R5** y confirma.
22. Ojo derecho, línea 6/18 en R5, prueba buscando el punto remoto: las «E» apuntan ↓ ↑ → ← ↓; tocas ↑ ↑ ↑ ↑ ↑; aciertos 1 de 5 → **no pasa** (hacen falta 4).
23. Ojo izquierdo, línea 6/18 en R5, prueba buscando el punto remoto: las «E» apuntan → ↑ → ← ↓; tocas ↑ ↑ ↑ ↑ ↑; aciertos 1 de 5 → **no pasa** (hacen falta 4).
24. **Pon el pasador en R6** y confirma.
25. Ojo derecho, línea 6/18 en R6, prueba buscando el punto remoto: las «E» apuntan ↑ ↓ ← → ↑; tocas ↑ ↑ ↑ ↑ ↑; aciertos 2 de 5 → **no pasa** (hacen falta 4).
26. Ojo izquierdo, línea 6/18 en R6, prueba buscando el punto remoto: las «E» apuntan → ↑ ← ↑ ←; tocas ↑ ↑ ↑ ↑ ↑; aciertos 2 de 5 → **no pasa** (hacen falta 4).
27. **Pon el pasador en R7** y confirma.
28. Ojo derecho, línea 6/18 en R7, prueba buscando el punto remoto: las «E» apuntan ← → ↑ ↓ →; tocas ↑ ↑ ↑ ↑ ↑; aciertos 1 de 5 → **no pasa** (hacen falta 4).
29. Ojo izquierdo, línea 6/18 en R7, prueba buscando el punto remoto: las «E» apuntan ↑ ↓ → ← ↓; tocas ↑ ↑ ↑ ↑ ↑; aciertos 1 de 5 → **no pasa** (hacen falta 4).
30. **Pon el pasador en R8** y confirma.
31. Ojo derecho, línea 6/18 en R8, prueba buscando el punto remoto: las «E» apuntan ← ↑ ← → ↑; tocas ↑ ↑ ↑ ↑ ↑; aciertos 2 de 5 → **no pasa** (hacen falta 4).
32. Ojo izquierdo, línea 6/18 en R8, prueba buscando el punto remoto: las «E» apuntan ← ↓ → ← ↑; tocas ↑ ↑ ↑ ↑ ↑; aciertos 1 de 5 → **no pasa** (hacen falta 4).
33. **Pon el pasador en R9** y confirma.
34. Ojo derecho, línea 6/18 en R9, prueba buscando el punto remoto: las «E» apuntan ← → ← ↓ ↑; tocas ↑ ↑ ↑ ↑ ↑; aciertos 1 de 5 → **no pasa** (hacen falta 4).
35. Ojo izquierdo, línea 6/18 en R9, prueba buscando el punto remoto: las «E» apuntan → ← ↓ ← ↓; tocas ↑ ↑ ↑ ↑ ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
36. **Pon el pasador en R10** y confirma.
37. Ojo derecho, línea 6/24 en R10, prueba buscando el punto remoto: las «E» apuntan → ← ↑ ← ↑; tocas ↑ ↑ ↑ ↑ ↑; aciertos 2 de 5 → **no pasa** (hacen falta 4).
38. Ojo izquierdo, línea 6/24 en R10, prueba buscando el punto remoto: las «E» apuntan ← ↓ → ↓ →; tocas ↑ ↑ ↑ ↑ ↑; aciertos 0 de 5 → **no pasa** (hacen falta 4).
39. **Pon el pasador en R0** y pon el estenopeico y confirma.
40. Ojo derecho, línea 6/60 en R0, prueba con el estenopeico: las «E» apuntan → ↑ → ↑ ←; tocas ↑ ↑ ↑ ↑ ↑; aciertos 2 de 5 → **no pasa** (hacen falta 3).
41. Ojo derecho, línea 6/36 en R0, prueba de control: las «E» apuntan ↑ ↓ → ← ↑; tocas ↑ ↑ ↑ ↑ ↑; aciertos 2 de 5 → **no pasa** (hacen falta 4).
42. Ojo izquierdo, línea 6/60 en R0, prueba con el estenopeico: las «E» apuntan ↓ → ↓ → ↑; tocas ↑ ↑ ↑ ↑ ↑; aciertos 1 de 5 → **no pasa** (hacen falta 3).
43. Ojo izquierdo, línea 6/36 en R0, prueba de control: las «E» apuntan ← ↑ ↓ ↑ ←; tocas ↑ ↑ ↑ ↑ ↑; aciertos 2 de 5 → **no pasa** (hacen falta 4).
44. **Pon el pasador en R0** (quita el estenopeico) y confirma.
45. Abanico, ojo derecho, vuelta 1 (carta sin girar): el niño ve todas iguales → tocas «Todas iguales».
46. Abanico, ojo derecho, vuelta 2 (carta girada 120°): el niño ve todas iguales → tocas «Todas iguales».
47. Abanico, ojo izquierdo, vuelta 1 (carta sin girar): el niño ve todas iguales → tocas «Todas iguales».
48. Abanico, ojo izquierdo, vuelta 2 (carta girada 90°): el niño ve todas iguales → tocas «Todas iguales».
49. **Prueba de cerca, ojo derecho:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
50. Ojo derecho, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan → ← ↑ ↓ ↑; tocas ↑ ↑ ↑ ↑ ↑; aciertos 2 de 5 → **no pasa** (hacen falta 4).
51. **Prueba de cerca, ojo izquierdo:** saca el celular de la caja, tira de 40 cm desde la mejilla, tapa el otro ojo.
52. Ojo izquierdo, línea 6/9 a 40 cm, prueba de cerca (40 cm): las «E» apuntan ↓ → ↓ → ↑; tocas ↑ ↑ ↑ ↑ ↑; aciertos 1 de 5 → **no pasa** (hacen falta 4).

</details>
