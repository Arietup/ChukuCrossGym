# Chuku Cross Gym — Landing page

**Fecha:** 2026-08-08
**Estado:** aprobado, listo para plan de implementación
**Stack:** HTML + CSS + JavaScript planos. Sin build, sin framework, sin dependencias de runtime.

---

## 1. Contexto y objetivo

Chuku Cross Gym es un gimnasio en el cantón El Triunfo (provincia del Guayas, Ecuador), dirigido por
el coach Anthony Ramires. La página cumple dos trabajos a la vez:

1. **Anunciar y llenar** el conversatorio de culturismo del **9 de agosto de 2026**.
2. **Ser la web permanente del gym** una vez que ese evento pase.

Métrica de éxito: conversaciones abiertas por WhatsApp. La página no vende en línea ni cobra;
todo camino termina en un chat con el gym o con el coach.

### Dirección y datos fijos

| Dato | Valor |
|---|---|
| Marca | Chuku Cross Gym |
| Ciudad | El Triunfo, Guayas, Ecuador |
| Dirección | Cdla. Jaime Roldós, Muro de Berlín |
| Referencia | Frente al puente peatonal |
| Coach | Anthony Ramires |
| Horario | Lun–Vie 7:00–12:00 y 16:00–21:00 · Sáb 8:00–12:00 |
| Correo | anthony_1908@yahoo.com |
| IG gym | https://www.instagram.com/chukucross/ |
| IG coach | https://www.instagram.com/anthonyfit20/ |
| WhatsApp (único, del coach) | 593995128564 |

---

## 2. Análisis de competencia

Investigación hecha sobre las tres marcas de referencia en Guayaquil. Conclusiones con evidencia,
no impresiones.

### Smart Fit Ecuador
Cadena regional. Negro con acentos amarillo/rojo, carrusel promocional, tres planes en tarjetas
(Fit $21.90 / Smart $25.90 / Black $29.90 + IVA), CTA repetido "¡Inscríbete ya!", todo empuja a
WhatsApp. Compite por precio y cobertura de sedes.

### Taurus Fitness
30 años en Guayaquil, +10 sedes. Su CSS en producción revela la construcción:

```
--primary: 0 72% 45%          → exactamente Tailwind red-600 (#dc2626)
#dc2626 #ef4444 #b91c1c       → red-600 / red-500 / red-700
#111827 #374151 #f9fafb       → grises Tailwind, fríos, tintados de azul
font-family: Futura Std       → geométrica, redonda, corporativa
+ 9 Google Fonts cargadas sin usar
```

Next.js + Tailwind + shadcn/ui. **Su rojo no es una decisión de marca: es el rojo por defecto del
framework.** Sus grises son los grises por defecto de Tailwind.

### Corporal Fitness
Sin sitio web propio. Toda su presencia vive en Instagram y Facebook.

### Conclusión estratégica

Las tres compiten en el mismo terreno: **cadena pulcra, escalable, intercambiable**. Un gimnasio de
cantón pierde siempre ahí — no tiene sedes, ni precio de volumen, ni presupuesto de marca.

Chuku Cross Gym gana en el terreno opuesto: **un lugar concreto con un coach con nombre y cara**.
La web debe verse hecha a mano y local, no corporativa. Ninguna de las tres marcas ocupa ese espacio.

---

## 3. Identidad visual

### Origen: el logo

El logo (623×623 px) trae un idioma completo antes de que empecemos: escudo, león, **kettlebell en
lugar de la O** de CR⊙SS, estrellas flanqueando EL TRIUNFO, y el wordmark **partido en dos colores**
(CHUKU bermellón / CROSS negro). Ese vocabulario es el activo diferenciador — ninguna cadena lo tiene.

### Color

Muestreado píxel a píxel del logo, no elegido a criterio:

```css
--naranja:  #E4411F;  /* bermellón del león — hue 9°, sat 84%. 21.067 px muestreados */
--brasa:    #B32C10;  /* hover, pressed, acento sobre claro */
--carbon:   #0E0D0C;  /* negro cálido */
--carbon-2: #2A2724;  /* superficies elevadas sobre carbón */
--hueso:    #EFE9DE;  /* claro cálido, superficie principal clara */
--hueso-2:  #FBF8F3;  /* claro más alto */
--piedra:   #C9C0B2;  /* bordes y separadores sobre claro */
--gris:     #8A8378;  /* texto secundario SOBRE OSCURO */
--tinta:    #5A534B;  /* texto secundario SOBRE CLARO */
--blanco:   #FFFFFF;  /* solo texto sobre bermellón y sobre foto */
```

**`--gris` y `--tinta` no son intercambiables.** Son el mismo rol tipográfico en dos fondos, y la
razón es de contraste medido, no de gusto:

| Combinación | Contraste | AA (4.5:1) |
|---|---|---|
| `--gris` sobre `--carbon` | 6.9:1 | ✓ |
| `--gris` sobre `--hueso` | 3.10:1 | ✗ |
| `--tinta` sobre `--hueso` | 6.27:1 | ✓ |

Usar `--gris` para texto secundario sobre fondo claro deja el párrafo por debajo del mínimo
accesible — se desvanece en un celular a pleno sol, que es exactamente el contexto de uso en
El Triunfo. Ningún color se escribe a mano en el CSS: todo es `var(--token)`, salvo `rgba()` de
`--carbon` y `--hueso` cuando hace falta transparencia.

Los neutros están tintados hacia el **cálido** a propósito. Es la oposición directa a los grises
fríos de Taurus, y es lo que permite que convivan con el bermellón sin vibrar.

### Tipografía

| Rol | Familia | Uso |
|---|---|---|
| Display | **Big Shoulders Display** 900 | Titulares de panel. Condensada, industrial, de rotulación |
| Lectura | **Archivo** 400/600 | Párrafos, listas, etiquetas de formulario |
| Datos | **Space Mono** 400/700 | Contador, fechas, eyebrows, contador de actos |

Contraste deliberado con la Futura Std de Taurus: donde ellos son geométricos y redondos,
nosotros somos condensados y angulares. El mono no es decoración — es el vernáculo del
entrenamiento (series, repeticiones, fechas).

Escala display: `clamp(3.5rem, 11vw, 9rem)`, `line-height: .82`, `letter-spacing: -.015em`.

---

## 4. Formato: híbrido en tres actos

Derivado de dos referencias que el usuario aportó y que fueron inspeccionadas en Chrome:

- **jetbrooklyn.com** — no es un carrusel. Son paneles del alto del viewport, cada uno mandado por
  una sola palabra gigante (el titular mide ~1300 px en un viewport de 1440). *Se toma: la escala
  tipográfica y un mensaje por pantalla.*
- **sbhfitnesscenter.org** — bandas asimétricas donde foto y texto se turnan de lado invirtiendo
  también el fondo, con formulario cerrando el index. *Se toma: el ritmo alternado y el cierre.*

El contenido de Chuku no es homogéneo: el evento y el gym son **afiche**, la historia del coach y el
formulario son **lectura**. Forzar todo a paneles recortaría justo lo que le da alma al gym. De ahí
el híbrido.

### ACTO I — Paneles a pantalla completa

`scroll-snap-type: y proximity` sobre el contenedor, `scroll-snap-align: start` en cada panel.
CSS nativo, sin librería.

| # | Panel | Contenido |
|---|---|---|
| 01 | El evento | Estado dependiente de la fecha (§6). Titular gigante + regresiva + CTA |
| 02 | El gym | `FIERRO, PISO Y GANAS` sobre foto a sangre con velo carbón |
| 03 | El coach | `ANTHONY RAMIRES` gigante + retrato + león como marca de agua |

### ACTO II — Bandas asimétricas

Scroll normal. Foto a sangre y texto alternan lado; el fondo alterna carbón → hueso → bermellón.

1. **Qué se habla ese día** — programa del evento en cuatro bloques
2. **El gym por dentro** — galería + áreas
3. **Quiénes somos** — el discurso del coach + redes
4. **Membresías** — tres planes sin precio

### ACTO III — Cierre

5. **Formulario → WhatsApp del coach**
6. **Ubicación** — dirección, mapa, horario
7. **Footer** + botón flotante de WhatsApp del gym

---

## 5. Elemento firma

**El contador de actos.** Columna fija a la derecha con `01 02 03` en Space Mono; el acto activo se
estira a una barra bermellón. Hace explícito el "sistema de slides" y a la vez orienta al usuario.
Se oculta al entrar al Acto II, donde ya no aplica.

Dos glifos tomados del propio logo lo acompañan, con restricción:

- **Kettlebell (⊙)** como viñeta y separador, en lugar de bullets genéricos.
- **León** como marca de agua al 6% de opacidad, **solo** detrás del panel del coach.

Todo lo demás se mantiene callado. La boldness se gasta en un solo lugar.

---

## 6. Lógica

Dos piezas no triviales. Ambas son funciones puras, viven en `script.js` y llevan asserts.

### 6.1 `estadoEvento(fechaEvento, ahora)`

```js
→ { fase: 'antes' | 'hoy' | 'pasado', d, h, m, s }
```

Controla el panel 01 y evita que la página envejezca sola:

Las fases se calculan contra **dos instantes fijos** derivados de `CONFIG.evento.inicio`, no contra
el calendario local del visitante. Así el resultado es idéntico se abra la página desde El Triunfo,
Madrid o Tokio:

```
inicio = 2026-08-09T10:00:00-05:00
fin    = inicio + 12 h   (cierre de jornada del evento)
```

| Fase | Condición | Panel 01 muestra |
|---|---|---|
| `antes` | `ahora < inicio` | `CONVERSATORIO DE CULTURISMO` + regresiva viva + "Reservar mi cupo" |
| `hoy` | `inicio ≤ ahora ≤ fin` | `ES HOY` + hora + "Cómo llegar" |
| `pasado` | `ahora > fin` | Panel de marca `CHUKU CROSS GYM` + "Entrena con nosotros" |

La regresiva se detiene al llegar a cero y dispara el cambio de fase sin recargar.

**Efecto sobre el Acto II:** en fase `pasado`, la banda 1 cambia de tiempo verbal — su eyebrow pasa
de `09.08.2026 · ESTE DOMINGO` a `09.08.2026 · YA OCURRIÓ` y el titular de "Qué se habla ese día" a
"Qué se habló ese día". Es el mismo contenido; solo cambian dos cadenas, ambas en `CONFIG`.

### 6.2 `mensajeWhatsApp(nombre, interes, texto)`

```js
→ 'https://wa.me/593995128564?text=<encodeURIComponent(mensaje)>'
```

Mensaje generado:

```
Hola coach Anthony 👋
Soy *Juan Pérez*.
Me interesa: *Membresía mensual*

Quiero empezar el lunes, ¿hay cupo?
```

Validación en frontera: `nombre` y `texto` obligatorios y recortados; si faltan, no se abre WhatsApp
y se marca el campo con mensaje de error en la voz de la interfaz ("Escribe tu nombre para que el
coach sepa quién eres"). El campo `interes` es un `<select>` con cuatro valores fijos:
Membresía, Asesoría personalizada, Evento 09/08, Otro.

Los CTAs de los planes usan la misma función con el interés preseleccionado.

### 6.3 Prueba

Un único `selfTest()` al final de `script.js` que corre **solo** si la URL contiene `?selftest`,
con `console.assert` sobre las dos funciones: las tres fases de `estadoEvento` (incluidos los bordes
exactos del día del evento) y el escapado correcto de `mensajeWhatsApp` con acentos, saltos de línea
y campos vacíos. Sin framework, sin fixtures.

---

## 7. Configuración

Todo dato mutable vive en un objeto al inicio de `script.js`. Cambiar el WhatsApp del gym es editar
una línea.

```js
const CONFIG = {
  whatsapp: '593995128564',              // único número, el del coach, en toda la página
  igGym:    'https://www.instagram.com/chukucross/',
  igCoach:  'https://www.instagram.com/anthonyfit20/',
  tiktok:   '',                          // PENDIENTE: si queda vacío, el enlace no se pinta
  correo:   'anthony_1908@yahoo.com',
  horario:  { semana: 'Lun a Vie · 7:00–12:00 y 16:00–21:00', sabado: 'Sáb · 8:00–12:00' },
  evento:   { inicio: '2026-08-09T10:00:00-05:00' }
};
```

Los enlaces se aplican por `data-wa` / `data-social` recorriendo el DOM una vez. **Un enlace social
con valor vacío se oculta en lugar de apuntar a `#`** — un enlace muerto es peor que ninguno.

**Un solo número de WhatsApp** para toda la página, el del coach. No hay distinción gym/coach ni
lógica de respaldo: cada CTA solo cambia el texto del mensaje que precompone, no el destino.

---

## 8. Contenido

### Discurso de "Quiénes somos"

Ejes acordados: la fe como motor, disciplina, formación de la juventud de El Triunfo, fomento del
deporte local. Tono conversacional ecuatoriano, sin cursilería ni lenguaje motivacional de póster.
Se escribe alrededor de una idea concreta: *la disciplina que se aprende cargando un disco sirve
para todo lo demás*.

### Programa del evento

Cuatro bloques: **Conversatorio** (planificación de temporada, volumen, definición, descanso),
**Posing** (cuartos de giro, mandatorias, transiciones, corrección en vivo), **Categorías**
(Men's Physique, Classic Physique, Bodybuilding, Bikini, Wellness y qué exige cada una), **Qué hace
a un atleta** (disciplina fuera del gym, entorno, cabeza, constancia).

Más dos bloques de apoyo: invitados nacionales y marcas presentes, ambos sin nombres específicos
hasta que se confirmen, con remisión a redes.

### Membresías

Diario · Mensual (destacado) · Trimestral. **Sin precio.** Cada tarjeta lista lo que incluye y su
CTA abre WhatsApp con el plan ya escrito en el mensaje. Decisión de negocio: evita competir por
precio contra Smart Fit, permite subir tarifas sin tocar la web y lleva la venta al chat donde el
coach cierra.

---

## 9. Responsive

| Ancho | Comportamiento |
|---|---|
| ≥ 1024px | Paneles a `100vh` con snap, contador de actos visible, bandas a 2 columnas |
| 640–1023px | Paneles a `90vh`, contador oculto, bandas a 1 columna |
| < 640px | Paneles a `85vh` con `scroll-snap-type: none`, display baja a `clamp` mínimo, galería a 2 columnas |

El snap se suelta en móvil a propósito: en pantallas cortas con barra de navegador variable, el snap
obligatorio corta contenido y pelea con el scroll del usuario.

Navegación: barra fija con logo; menú hamburguesa a pantalla completa bajo 900px.

---

## 10. Calidad

- `prefers-reduced-motion: reduce` desactiva el scroll suave, el `scroll-snap`, las transiciones y
  el zoom de galería; la regresiva pasa a actualizarse cada minuto en vez de cada segundo. El
  contenido queda íntegro y legible.
- **No hay animaciones de revelado por scroll ni cinta deslizante.** El movimiento se concentra en
  la regresiva y en el contador de actos, que son los dos únicos lugares donde el movimiento
  comunica algo. Todo el contenido es visible aunque el JavaScript falle por completo.
- Foco de teclado visible en todos los interactivos; el formulario es operable solo con teclado.
- **La regresiva no se anuncia dígito a dígito.** Un `aria-live` sobre un elemento que cambia cada
  segundo deja a un lector de pantalla dictando números sin parar, y vuelve la página inutilizable
  para quien lo usa. Los dígitos son visuales; el anuncio vive en un párrafo solo para lectores de
  pantalla que cambia de texto únicamente al cruzar un umbral:

  | Falta | Anuncio |
  |---|---|
  | más de un día | «Faltan 2 días para el conversatorio» |
  | entre 1 hora y 1 día | «Faltan 11 horas para el conversatorio» |
  | menos de 1 hora | «Faltan 23 minutos para el conversatorio» |
  | menos de 1 minuto | «El conversatorio empieza en menos de un minuto» |

  La granularidad sube conforme se acerca la hora: minutos en la última hora, que es cuando el dato
  importa. La función que arma esa frase es pura y vive en `logic.js` con su prueba.
- `alt` descriptivo real en cada foto; el mapa embebido lleva `title`.
- Contraste mínimo AA: texto sobre bermellón siempre blanco puro; `--gris` verificado sobre carbón
  y sobre hueso.
- Fotos con `loading="lazy"`. Si una falta, el marco conserva su etiqueta estilizada en vez de
  mostrar el ícono roto del navegador.
- El contenido revelado por scroll debe ser visible si el JS falla (los estilos de revelado se
  aplican solo bajo una clase que añade el propio script).
- Metadatos Open Graph y `<title>` con la fecha del evento, para que el enlace compartido por
  WhatsApp muestre bien.

---

## 11. Insumos pendientes

Ninguno bloquea la construcción; todos tienen respaldo definido.

| Insumo | Respaldo mientras llega |
|---|---|
| TikTok | El enlace no se pinta |
| Fotos del gym | Marco estilizado con etiqueta de área |
| Logo PNG con transparencia | El león como marca de agua se omite; el JPG se usa solo en la barra y el footer |

Resueltos en revisión: hora del evento (**10:00 -05:00**), horario de atención (Lun–Vie y Sáb) y
número de WhatsApp (uno solo, el del coach). El domingo no se publica ni como abierto ni como
cerrado, porque no fue confirmado.

El repositorio git lo crea el usuario al subir a GitHub; este proyecto no lo versiona por ahora.

---

## 12. Fuera de alcance

Sin backend, sin base de datos, sin pasarela de pago, sin registro de usuarios, sin blog, sin
multi-idioma, sin panel de administración. El formulario **no** envía correo: compone un mensaje y
abre WhatsApp. No se usa ninguna librería de terceros (ni Swiper, ni GSAP, ni fullPage.js); las
referencias del usuario cargan 800 KB y 1,4 MB de Wix y ese es justamente el camino que no se toma.
