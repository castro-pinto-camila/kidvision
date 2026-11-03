# KidVision: contexto del proyecto

> **Nota para Claude Code:** este documento explica el problema, el usuario y la evidencia. Algunas secciones (Resumen ejecutivo, Decisiones de diseño, Solución propuesta) describen una versión anterior del diseño, con dos modos de distancia y sin medir dioptrías. El diseño vigente es la caja óptica con ranuras descrita en **SPEC.md**. Si este documento y SPEC.md dicen cosas distintas, **SPEC.md manda**.



## Resumen ejecutivo

KidVision es un kit de tamizaje visual escolar de bajo costo: una app que funciona sin internet, más accesorios de cartón y lentes, con el que un docente identifica baja agudeza visual en escolares de 6 a 12 años y deriva al niño a una evaluación profesional.

**Qué entrega por cada niño:**

- Un resultado en semáforo: verde (sin hallazgos), amarillo (repetir la prueba) o rojo (derivar).
- La agudeza visual de cada ojo, es decir, cuán mal ve el niño, que es lo más cercano a la idea del smartwatch que tuvo el equipo.
- Una categoría probable (miopía, hipermetropía, astigmatismo u otra causa), pensada para el profesional que recibe la derivación.
- Una constancia para la familia, con una simulación de cómo ve su hijo y los pasos para conseguir la cita.

**Qué no hace:** no diagnostica, no receta lentes y no mide dioptrías en esta fase. Es una herramienta de tamizaje.

**Base técnica:** sigue la guía escolar de la IAPB (2024), que recomienda una línea de cinco «E» de nivel 6/9 y una prueba con lente de +2.00 D para la hipermetropía, y que admite tecnologías móviles validadas en niños. La sección 9 contiene la especificación para construir el prototipo con Claude Code.

## Problema y need statement

**Need:** *Una forma de identificar baja agudeza visual en escolares de primaria de 6 a 12 años como estrategia inicial para corregir errores refractivos.*

El fin último es que la visión deje de ser una barrera para el aprendizaje. El proyecto actúa sobre la condición previa que sí controla: la identificación oportuna dentro del colegio. La evidencia asocia baja agudeza visual con menores puntajes en matemáticas en niños peruanos (Cueto et al., 2017), pero no permite afirmar que detectar mejore las notas por sí solo.

**Cifras clave**

| Dato | Valor | Fuente |
| --- | --- | --- |
| Prevalencia de errores refractivos, 7 a 11 años (Perú, ENDES 2017–2021) | 10,90 % (hipermetropía 5,19 %, miopía 3,35 %, astigmatismo 2,36 %); por reporte materno, subestima | De-La-Borda-Prazak et al. (2024) |
| Baja agudeza visual medida en escolares de Piura | 17 % de 599 | Araujo-Chumacero et al. (2015) |
| Puente Piedra (Lima Norte), 5 a 19 años | 3,7 % usaba lentes; 37,3 % cumplía criterios de referencia | Sauer et al. (2016) |
| Ejecución del tamizaje MINSA (PP 0018), a septiembre de 2024 | 72 543 de 954 174 (7,6 %) | MINSA (2024) |
| Asistencia a la derivación en Apurímac | de 66 % a 92 % con clínicas itinerantes y subsidios | Latorre-Arteaga et al. (2016) |
| Asistencia a la derivación en Kenia | 22 % (cartilla) frente a 54 % (smartphone + simulación + SMS) | Rono et al. (2018) |
| Tamizaje por docentes (metaanálisis, \~5,7 millones de niños) | sensibilidad 76,8 %, especificidad 93,6 % | Cunha et al. (2026) |

**Dos brechas encadenadas.** El análisis de cinco porqués y el *customer journey* llegan a lo mismo:

1. **Identificación:** no hay tamizaje sistemático; la detección depende del azar o de un padre atento.
2. **Conexión:** aun con sospecha, llegar a la evaluación depende del horario, el dinero y la persistencia de la familia. En el Caso 1, una niña de 9 años seguía sin evaluación casi once meses después de la sospecha.

KidVision ataca la primera brecha con el tamizaje y la segunda con la constancia y el seguimiento (sección 8).

## Fundamento clínico esencial

El dato que más condiciona el diseño es la acomodación: el niño puede enfocar a la fuerza y ocultar una hipermetropía, y cualquier objeto cercano lo hace enfocar de cerca.

| Condición | Qué pasa en el ojo | Cómo se manifiesta en la prueba |
| --- | --- | --- |
| Miopía | La imagen se enfoca delante de la retina (ojo largo o córnea muy curva) | Falla de lejos, ve bien de cerca. Es el hallazgo más fácil de captar |
| Hipermetropía | La imagen se enfoca detrás de la retina (ojo corto o córnea plana) | Puede pasar la prueba de lejos porque el niño acomoda; se busca con el lente de +2.00 D y con la visión cercana |
| Astigmatismo | La córnea o el cristalino no tienen la misma curvatura en todas las direcciones | Unas orientaciones se ven más nítidas que otras; se busca con la carta de abanico |
| Anisometropía | Gran diferencia de graduación entre los dos ojos | Por eso cada ojo se evalúa por separado |
| Ambliopía | El cerebro deja de usar bien un ojo que ve mal desde temprano | La foto o la prueba no la ven; se detectan sus factores de riesgo |

**Errores frecuentes que el equipo debe evitar:**

- **Dilatar no es cicloplejía.** La cicloplejía paraliza el músculo ciliar, que es lo que importa para medir; la dilatación de la pupila es un efecto acompañante. La oscuridad dilata la pupila, pero no paraliza el enfoque.
- **El error refractivo no está solo en la córnea.** Depende de la córnea, del cristalino y de la longitud del ojo.

**Cómo se mide:** la agudeza visual con optotipos (la «E» direccional en niños) indica *cuánto* ve el niño, no *por qué*. El error refractivo se mide con retinoscopia bajo cicloplejía (estándar de oro), autorrefractómetro o, como estimación, fotorrefracción. KidVision mide agudeza y usa pruebas complementarias para clasificar el tipo probable.

## Soluciones existentes y brecha

Ninguna solución revisada combina operación por docentes, un celular cualquiera sin internet, la clasificación del tipo probable (incluida la hipermetropía) y el seguimiento de la derivación adaptado al Perú.

| Solución | Qué mide | Quién la opera | Internet | Precio | Límite para este caso |
| --- | --- | --- | --- | --- | --- |
| WHOeyes (OMS) | Agudeza visual | Familiar o docente | No | Gratis | No distingue el tipo de error; requiere una segunda persona; no da seguimiento |
| Peek Acuity | Agudeza visual | Docente | No | Gratis | Solo Android; no distingue el tipo; su sistema de seguimiento está hecho para Kenia |
| GoCheck Kids | Riesgo ambliogénico por fotorrefracción | Personal capacitado | Sí | Suscripción institucional | Solo algunos iPhone; el equipo no logró acceso (pidió demo sin respuesta); tiende a infraestimar hipermetropía |
| Spot Vision Screener | Estimado refractivo | Técnico o enfermera | No | \~US$ 7 000 | Costo inalcanzable para un colegio público |
| QuickSee | Refracción objetiva | Técnico u optómetra | No | \~US$ 5 000–7 000 | Costo y operador especializado |
| USee | Esfera subjetiva con lentes ajustables | Docente con el niño | No | US$ 2 040 por kit | Solo miopía o hipermetropía; 15 min por niño |
| EyeQue VisionCheck | Estimado subjetivo | El propio usuario | Parcial | \~US$ 130 | Mal desempeño en niños por la acomodación |

Datos de la tabla según la investigación de soluciones del equipo, salvo la observación de acceso a GoCheck Kids, que viene de su prueba directa.

## Decisiones de diseño

El núcleo es la ruta subjetiva: pruebas de agudeza con apoyo de lentes y cartón, sin fotorrefracción ni IA de diagnóstico en esta fase.

| Decisión | Elegido | Descartado o postergado | Por qué |
| --- | --- | --- | --- |
| Enfoque | Pruebas subjetivas de agudeza | Fotorrefracción con IA | No hay datos clínicos etiquetados para entrenar un modelo; queda para la fase 3 |
| Umbral de derivación | Línea 6/9; falla con 3 o menos de 5 | 6/12 | La IAPB recomienda 6/9; 6/12 solo si los recursos son limitados. Configurable |
| Hipermetropía | Lente de +2.00 D por al menos 1 minuto | Gotas ciclopléjicas | Las gotas requieren un profesional |
| Visor tipo Cardboard | — | Descartado | Con lentes de foco corto cada píxel se ve enorme: en promedio no puede mostrar letras menores a 20/51 |
| Fotos y IA | Control de calidad (posición, distancia) | Diagnóstico | La IA aporta en la calidad de la medición, no en la precisión clínica |

**Dos modos de distancia, una misma app.** El documento del equipo propone una caja; la ruta subjetiva, la distancia estándar. La app soporta ambos con el mismo cálculo y el piloto decide:

- **Modo A, estándar (3 m):** celular en un parante de cartón a 3 m. Es la configuración de la IAPB y la referencia de comparación.
- **Modo B, caja óptica (33,3 cm):** caja con lentes de +3.00 D y la pantalla en su foco, a 33,3 cm. La imagen queda ópticamente en el infinito. La resolución alcanza: una «E» 6/9 mide 0,73 mm, unos 12 píxeles en una pantalla de 0,06 mm por píxel. Ahorra espacio, fija la distancia y aísla cada ojo. Su riesgo es que un instrumento cerrado puede inducir acomodación y simular miopía, así que debe validarse contra el modo A.

**Correcciones a afirmaciones previas del documento:**

- *«La penumbra dilata la pupila sin necesidad de gotas (cicloplejía)».* Falso: dilatar no es cicloplejía. Además, en la oscuridad la acomodación va a su reposo, en promedio 1,5 D, lo que vuelve al niño algo miope.
- *«El visor relaja el músculo ciliar».* La cercanía de un aparato cerrado tiende a hacer lo contrario. Lo que relaja la acomodación es que la imagen esté ópticamente lejos y el lente de +2.00 D.
- *«Precisión clínica».* Ninguna configuración está validada todavía; usar «por validar».
- *«Diagnóstico».* Es tamizaje: el resultado es derivar o no derivar.

## Solución propuesta: kit y pruebas

El kit tiene una app y cuatro accesorios de bajo costo; la app encadena cinco pruebas por cada ojo.

**Componentes del kit**

| Componente | Función | Modo A (3 m) | Modo B (caja) |
| --- | --- | --- | --- |
| App sin internet | Guía al docente, presenta las pruebas, clasifica y genera la constancia | Sí | Sí |
| Soporte de cartón | Fija el celular | Parante a la altura de los ojos, con visera contra reflejos | Caja de 33,3 cm con lentes de +3.00 D |
| Oclusor de cartón | Tapa el ojo que no se evalúa; tiene agujeros estenopeicos | Sí; podrá llevar impreso un marcador ArUco para medir la distancia (versión 2) | No hace falta: la app muestra solo la mitad de pantalla del ojo evaluado |
| Lentes de +2.00 D | Prueba de hipermetropía | En montura (lentes de lectura verificados) | Clip delante del lente de la caja |
| Paleta «E» de cartón | El niño indica la dirección | Sí | Sí |

**Las cinco pruebas, en orden**

1. **Agudeza lejana (detección):** una línea de cinco «E» de nivel 6/9 con barras de apiñamiento. Pasa con 4 o 5 aciertos. Si falla, la app mide la agudeza umbral para reportar *cuán mal* ve.
2. **Lente de +2.00 D (solo si pasó):** un minuto con el lente y relee la línea 6/9. Si sigue leyendo, hipermetropía probable.
3. **Estenopeico (solo si falló):** relee a través del agujero. Si mejora, la causa probable es refractiva; si no, se deriva a oftalmología por otra causa.
4. **Carta de abanico (todos):** líneas radiales; el niño toca la que ve más negra, dos veces, con la carta rotada. Si repite la orientación, astigmatismo probable. En el modo B la carta se ve con mejor resolución que a 3 m en una pantalla pequeña.
5. **Agudeza cercana a 40 cm (todos):** fuera de la caja, con el celular en la mano. Ver peor de cerca que de lejos sugiere hipermetropía o astigmatismo; combinar ambas distancias subió la especificidad para hipermetropía de 60,6 % a 84,8 % (Jin et al., 2015).

La prueba bicromática (rojo-verde) queda fuera del núcleo: no hay validación pediátrica en pantallas de celular.

## Flujo de tamizaje y clasificación

Cada ojo recorre las pruebas en un orden que obliga al niño a cambiar de lugar una sola vez, y la app combina los resultados en una categoría probable y un semáforo.

Flujo por ojo: (1) agudeza lejana 6/9 → si pasa: (2a) lente +2.00 D; si falla: (2b) estenopeico → (3) carta de abanico → (4) agudeza cercana → clasificación y semáforo.

El lente de +2.00 D solo se aplica a quien pasa de lejos, y el estenopeico solo a quien falla.

| Hallazgos | Categoría probable | Semáforo |
| --- | --- | --- |
| Lee 6/9 de lejos, cerca normal, se nubla con +2.00 D y abanico sin diferencias | Normal | Verde |
| Falla de lejos, cerca conservada y mejora con estenopeico | Miopía probable | Rojo |
| Sigue leyendo 6/9 con +2.00 D, o ve peor de cerca que de lejos | Hipermetropía probable | Rojo |
| Elige la misma línea del abanico en ambas vueltas | Astigmatismo probable (puede coexistir) | Rojo |
| Falla de lejos y no mejora con estenopeico | Baja agudeza de otra causa: oftalmología | Rojo |
| Falla de lejos, mejora con estenopeico y no encaja en otra fila | Error refractivo, tipo no determinado | Rojo |
| Respuestas inconsistentes o distancia no lograda | No concluyente: repetir | Amarillo |

El semáforo es una propuesta del equipo que debe validarse con un especialista.

## Cómo responde a las dos brechas

KidVision actúa en las etapas 1 a 4 del *customer journey* y deja preparada la etapa 5, donde se perdió la niña del Caso 1.

| Brecha | Causa en el análisis | Respuesta de KidVision |
| --- | --- | --- |
| Identificación | La detección depende del azar o de un padre atento; el MINSA ejecutó el 7,6 % de su meta de tamizaje | Tamizaje sistemático en el aula, operado por el docente, con un celular cualquiera y sin internet. No depende de que el niño se queje |
| Identificación | La precisión del docente depende del protocolo y del control de calidad | Protocolo guiado paso a paso; la app marca como dudoso un resultado sospechoso de azar y pide repetir |
| Conexión | La familia no entiende o no recibe el resultado (29,3 % de las inasistencias en un estudio de EE. UU.) | Constancia en lenguaje simple con una simulación de cómo ve el niño, por WhatsApp o impresa |
| Conexión | Horarios, colas y costos del SIS y de las clínicas | La constancia indica el centro de salud que corresponde, su horario y cómo pedir la cita en el SIS (dato por investigar por distrito) |
| Conexión | Sin seguimiento, la familia resuelve sola | Versión 2: estados por niño (avisado, cita pedida, atendido) y alertas a las 2, 4 y 6 semanas |

La referencia nacional para la segunda brecha es Apurímac: la asistencia a la derivación pasó de 66 % a 92 % cuando el tamizaje se conectó con la atención (Latorre-Arteaga et al., 2016).

## Validación, limitaciones y hoja de ruta

**Piloto inmediato (con el propio equipo y compañeros):**

- Evaluar a personas con receta conocida, sin sus lentes, en la caja y con una cartilla impresa a 3 m; comparar agudeza y dioptrías estimadas con su receta.
- Comprobar que los miopes no «pasan» en la caja: si pasan, la caja induce acomodación.
- Probar la carta de abanico con adultos sin astigmatismo, para descartar que las líneas diagonales se vean distintas por la pantalla.
- Medir el tiempo por evaluación y anotar dónde se confunde el docente.

**Limitaciones que el equipo debe declarar:**

- El lente de +2.00 D relaja la acomodación, pero no equivale a la cicloplejía; la IAPB reconoce que aún no hay consenso sobre tamizar la hipermetropía.
- Las respuestas de niños de 6 a 8 años son menos estables; por eso existe el control de calidad.
- Ninguna cifra de sensibilidad o especificidad aplica a KidVision hasta compararlo con un optómetra.
- Trabajar con datos de menores exige consentimiento de los padres y aprobación ética antes de un piloto en colegios.

**Hoja de ruta:**

1. **Fase 1, MVP:** lo descrito en SPEC.md.
2. **Fase 2, conexión:** página de la familia con QR, estados de seguimiento con alertas, magnitud del astigmatismo y respuesta por voz para niños mayores.
3. **Fase 3:** fotografía del reflejo rojo con IA, entrenada con los datos que el kit recolecte y con etiquetas de un profesional.
4. **Visión, plataforma colegio–posta:** la posta recibe a los derivados, agenda campañas y cierra el caso.

## Referencias principales

- IAPB (2024). Initial screening. IAPB School Eye Health Guidelines. https://www.iapb.org/learn/knowledge-hub/iapb-school-eye-health-guidelines/screening-guidelines/initial-screening/
- Rono, H. K., et al. (2018). Smartphone-based screening for visual impairment in Kenyan school children. The Lancet Global Health. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6057135/
- Wu, Y., et al. (2024). Real-world application of a smartphone-based visual acuity test (WHOeyes) with automatic distance calibration. British Journal of Ophthalmology.
- Jin, P., et al. (2015). Screening for significant refractive error using a combination of distance and near visual acuity. PLoS ONE. https://doi.org/10.1371/journal.pone.0117399
- Mavi, S., et al. (2024). Hyperopia: A practical introduction. Community Eye Health Journal.
- Chen, W., et al. (2021). Pinhole does not increase screening accuracy of detecting decreased BCVA in schoolchildren. BMC Ophthalmology.
- StatPearls (2026). Subjective refraction technique: Astigmatic dial.
- Su, Q., et al. (2025). Innovative myopic screening platform based on smartphones. Frontiers in Bioengineering and Biotechnology.
