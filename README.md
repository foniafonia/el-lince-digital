# El Lince Digital

**Jugar:** https://foniafonia.github.io/el-lince-digital/

Juego de buscar: el lince pide un dibujo («ratón», «rana»…) y hay que encontrarlo en el tablero. Cada dibujo trabaja un sonido (/R/, /RR/, /S/, /L/, grupos como /BL/, /TR/…).
Salió del curso de AELFA (octubre de 2026). Aquí está como página suelta, igual que Snake de palabras.

- Juego en `index.html` + `lince-extra.js` y `lince-extra.css` (carátula, ajustes ⚙️ y voz). Voz Ximena (Microsoft, `es-ES-XimenaNeural`) en `voz/`: una por palabra (220) y 4 frases. Sin registro; no guarda nada de quien juega.
- **Dibujos:** emojis o pictos propios de Fönia (131 palabras con picto; CC0, hechos con IA, pendientes de revisión de una logopeda; salen de `pictogramas-propios/publicar`). Se cambia en ⚙️ o con `?dibujos=picto|emoji`.
- **Pares mínimos (👂):** 17 parejas que solo cambian en un sonido. Antes de jugar se elige el contraste (uno o varios): sonoridad en oclusivas p/b, t/d, k/g (6), R/L (3), modo de articulación f/p, g/j, d/l (3) y vocales (4). Punto de articulación aún no tiene parejas. Sin marcar nada salen todas. **Voz de las 33 palabras de los pares:** Piper `es_ES-sharvard-medium`, hablante F (CC-BY 3.0), más lenta, sin cortes y al mismo volumen; se regenera con `python3 voz/generar-pares.py` (lee las parejas de `lince-extra.js`; necesita el modelo en `~/Developer/voz-logopedia/modelos/`). Se recuerda en el aparato y se puede fijar en el enlace con `?contraste=son.rl.modo.voc`. *sapo/sopa* no es par mínimo (cambian dos vocales): solo sale en «todas».
- **Crea tu Lince:** el botón de la carátula abre un selector para elegir las palabras (con emojis o pictos), jugar con ellas y copiar un enlace para mandarlo: `?sel=<números en base 36 separados por puntos>&dibujos=picto|emoji`. Los números son la posición de cada palabra en el banco del juego: si se añaden palabras, hay que añadirlas al final.
- **Buzón «¿Qué picto te falta?»:** en la carátula, en ⚙️, en «Crea tu Lince» y al acabar. Toca una palabra sin picto o escribe otra: suma 1 a `lince_pide_<palabra>` o `lince_otra_<palabra>` (anónimo). Se lee en `estadisticas.html` («Pictos que piden»).
- **Imprimir:** 🖨️ en la carátula, en ⚙️ y en «Crea tu Lince». Una ventana deja elegir qué sacar: tablero con dibujos, tablero vacío, fichas pequeñas (del tamaño de las casillas) y cartas redondas con la palabra; con opción de ahorrar tinta. Las hojas A4 imitan la pantalla (cabecera verde y dorada, mosaico, aro de madera). Desde el juego imprime el tablero que se ve, casilla por casilla. Claves de contador `lince_imprimir`, `lince_imprimir_picto`, `lince_imprimir_vacio`.
- **Informe de caso (opcional, en `lince-informe.js`):** la logopeda crea un código de caso (sin nombre) y el juego guarda en el aparato, en `localStorage` (`lince-casos-v1`), cada palabra buscada con su tiempo, errores y qué se tocó. Saca un informe anonimizado con gráficas (SVG), indicadores orientativos (velocidad, atención, control inhibitorio, discriminación auditiva, aprendizaje), CSV e impresión/PDF. Nada sale del aparato. Sin valor diagnóstico.
- Contador anónimo: espacio `foniafonia-lince` en abacus. Claves `lince_aperturas`, `lince_personas`, `lince_completados`, `lince_skool` y por canal `lince_c_<canal>_aperturas`.
- Canales: añadir `?c=gw|wa|tg|fb|ma|ig|th|sk|ln` al enlace (gw grupos de WhatsApp, wa chats de WhatsApp, ma grupos de Facebook); `?yo=1` para que las visitas de José no cuenten.
- Estadísticas: `estadisticas.html`. Privacidad: `privacidad.html`.
- Material de apoyo: no sustituye a la logopeda.

Idea y diseño: José Aserraf · Gabinete Fönia · Lo entrega ColmenIA.
