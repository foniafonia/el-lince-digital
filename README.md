# El Lince Digital

**Jugar:** https://foniafonia.github.io/el-lince-digital/

Juego de buscar: el lince pide un dibujo («ratón», «rana»…) y hay que encontrarlo en el tablero. Cada dibujo trabaja un sonido (/R/, /RR/, /S/, /L/, grupos como /BL/, /TR/…).
Salió del curso de AELFA (octubre de 2026). Aquí está como página suelta, igual que Snake de palabras.

- Juego en `index.html` + `lince-extra.js` y `lince-extra.css` (carátula, ajustes ⚙️ y voz). Voz Ximena (Microsoft, `es-ES-XimenaNeural`) en `voz/`: una por palabra (220) y 4 frases. Sin registro; no guarda nada de quien juega.
- **Dibujos:** emojis o pictos propios de Fönia (131 palabras con picto; CC0, hechos con IA, pendientes de revisión de una logopeda; salen de `pictogramas-propios/publicar`). Se cambia en ⚙️ o con `?dibujos=picto|emoji`.
- **Crea tu Lince:** el botón de la carátula abre un selector para elegir las palabras (con emojis o pictos), jugar con ellas y copiar un enlace para mandarlo: `?sel=<números en base 36 separados por puntos>&dibujos=picto|emoji`. Los números son la posición de cada palabra en el banco del juego: si se añaden palabras, hay que añadirlas al final.
- Contador anónimo: espacio `foniafonia-lince` en abacus. Claves `lince_aperturas`, `lince_personas`, `lince_completados`, `lince_skool` y por canal `lince_c_<canal>_aperturas`.
- Canales: añadir `?c=wa|tg|fb|ig|sk|ln|ma` al enlace; `?yo=1` para que las visitas de José no cuenten.
- Estadísticas: `estadisticas.html`. Privacidad: `privacidad.html`.
- Material de apoyo: no sustituye a la logopeda.

Idea y diseño: José Aserraf · Gabinete Fönia · Lo entrega ColmenIA.
