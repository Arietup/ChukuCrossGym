# Chuku Cross Gym — Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir la landing de Chuku Cross Gym en HTML/CSS/JS planos: anuncia el conversatorio del 9 de agosto de 2026 y se convierte sola en la web permanente del gym cuando ese evento pasa.

**Architecture:** Página única en tres actos. Acto I son paneles a pantalla completa con `scroll-snap` nativo; Acto II son bandas asimétricas en scroll normal; Acto III cierra con formulario a WhatsApp, ubicación y pie. La lógica pura vive aislada del DOM en `logic.js` para poder probarse con Node; `app.js` solo cablea DOM y contiene el `CONFIG` editable.

**Tech Stack:** HTML5, CSS3 (custom properties, grid, `scroll-snap`, `clamp`), JavaScript ES2020 sin transpilar. Google Fonts (Big Shoulders Display, Archivo, Space Mono). Node 20 solo para correr `test.js`. **Cero dependencias de runtime.**

## Global Constraints

- Sin framework, sin build, sin librerías de terceros. Nada de Swiper, GSAP, fullPage.js, Tailwind ni jQuery.
- El proyecto **no está bajo git**. No ejecutar `git init`, `git add` ni `git commit`. El usuario versiona al subir a GitHub.
- Idioma de toda la interfaz: español ecuatoriano. Sentence case en párrafos, mayúsculas solo en display y etiquetas mono.
- Marca escrita siempre **Chuku Cross Gym** (nunca "Churu", nunca "Chuku Cross" a secas en texto corrido).
- Un solo número de WhatsApp en toda la página: `593995128564`. Los CTAs cambian el mensaje, jamás el destino.
- Paleta exacta, **nueve tokens**: `--naranja #E4411F`, `--brasa #B32C10`, `--carbon #0E0D0C`, `--carbon-2 #2A2724`, `--hueso #EFE9DE`, `--hueso-2 #FBF8F3`, `--piedra #C9C0B2`, `--gris #8A8378`, `--tinta #5A534B`.
- **Ningún color a mano.** Todo color se escribe `var(--token)`. Única excepción permitida: `rgba(14,13,12,α)` y `rgba(239,233,222,α)` cuando se necesita transparencia, porque `var()` no transporta alfa — son `--carbon` y `--hueso` con opacidad, no colores nuevos.
- `--gris` es texto secundario **sobre oscuro**; `--tinta` es texto secundario **sobre claro**. No intercambiarlos: `--gris` sobre `--hueso` da 3.10:1 y falla AA; `--tinta` da 6.27:1 y pasa.
- Tipografía: Big Shoulders Display 900 (display), Archivo 400/600 (lectura), Space Mono 400/700 (datos).
- Fecha del evento: `2026-08-09T10:00:00-05:00`. Duración 12 h.
- Horario publicado: `Lun a Vie · 7:00–12:00 y 16:00–21:00` y `Sáb · 8:00–12:00`. **No publicar nada sobre el domingo.**
- Dirección: `Cdla. Jaime Roldós, Muro de Berlín` · referencia `Frente al puente peatonal` · `El Triunfo, Guayas`.
- Correo: `anthony_1908@yahoo.com`. IG gym `https://www.instagram.com/chukucross/`. IG coach `https://www.instagram.com/anthonyfit20/`.
- Toda imagen lleva `loading="lazy"` y `alt` descriptivo real (nunca `alt=""` salvo decorativas puras).
- `prefers-reduced-motion: reduce` debe desactivar scroll suave, `scroll-snap`, transiciones y zoom de galería; la regresiva pasa a 60 s.
- **Ninguna región `aria-live` puede colgar de un elemento que cambia cada segundo.** Los dígitos de la regresiva son visuales y no se anuncian. El anuncio para lector de pantalla vive en un párrafo aparte que solo cambia de texto al cruzar un umbral (día → hora → minuto), de modo que suena unas pocas veces por hora y una vez por minuto en la última hora.
- **Sin animaciones de revelado por scroll y sin cinta deslizante.** El movimiento vive solo en la regresiva y el contador de actos. Todo el contenido debe ser legible aunque el JS falle por completo — no ocultar nada con CSS que dependa de JavaScript para mostrarse.

## File Structure

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Marcado semántico completo. Sin estilos ni scripts en línea salvo el `data-*` de configuración |
| `styles.css` | Tokens, tipografía, layout de los tres actos, responsive, accesibilidad |
| `logic.js` | **Solo funciones puras.** Cero DOM, cero `window`. Exportable a Node |
| `app.js` | `CONFIG` + cableado del DOM: enlaces, regresiva, snap, formulario, revelados |
| `test.js` | Pruebas con `node:assert` sobre `logic.js`. Se corre con `node test.js` |
| `assets/` | `logo.jpg`, `gym-01…06.jpg`, `coach.jpg` |

`logic.js` se separa de `app.js` por una razón concreta: es lo único con reglas que pueden fallar en silencio (fases de fecha, escapado de URL), y aislarlo del DOM es lo que lo hace probable con Node.

---

### Task 1: `estadoEvento` — fases y cuenta regresiva

**Files:**
- Create: `logic.js`
- Create: `test.js`

**Interfaces:**
- Consumes: nada.
- Produces: `estadoEvento(inicioISO: string, ahora: Date|string|number, duracionHoras = 12) → { fase: 'antes'|'hoy'|'pasado', d: number, h: number, m: number, s: number }`

- [ ] **Step 1: Escribir la prueba que falla**

Crear `test.js`:

```js
const assert = require('node:assert/strict');
const { estadoEvento } = require('./logic.js');

const INICIO = '2026-08-09T10:00:00-05:00';

// antes: un día completo por delante
let r = estadoEvento(INICIO, '2026-08-08T10:00:00-05:00');
assert.equal(r.fase, 'antes');
assert.deepEqual([r.d, r.h, r.m, r.s], [1, 0, 0, 0]);

// antes: resto mixto de días/horas/minutos/segundos
r = estadoEvento(INICIO, '2026-08-07T08:30:15-05:00');
assert.equal(r.fase, 'antes');
assert.deepEqual([r.d, r.h, r.m, r.s], [2, 1, 29, 45]);

// borde inferior: un segundo antes sigue siendo 'antes'
r = estadoEvento(INICIO, '2026-08-09T09:59:59-05:00');
assert.equal(r.fase, 'antes');
assert.deepEqual([r.d, r.h, r.m, r.s], [0, 0, 0, 1]);

// borde exacto de inicio: ya es 'hoy'
assert.equal(estadoEvento(INICIO, '2026-08-09T10:00:00-05:00').fase, 'hoy');

// durante la jornada
assert.equal(estadoEvento(INICIO, '2026-08-09T16:00:00-05:00').fase, 'hoy');

// borde exacto de fin (inicio + 12 h): ya es 'pasado'
assert.equal(estadoEvento(INICIO, '2026-08-09T22:00:00-05:00').fase, 'pasado');

// mucho después
assert.equal(estadoEvento(INICIO, '2026-12-01T00:00:00-05:00').fase, 'pasado');

// el mismo instante escrito en otra zona horaria da el mismo resultado
assert.equal(
  estadoEvento(INICIO, '2026-08-09T16:00:00-05:00').fase,
  estadoEvento(INICIO, '2026-08-09T22:00:00+01:00').fase,
  'la fase no puede depender de la zona horaria del visitante'
);

// acepta Date y timestamp, no solo string
assert.equal(estadoEvento(INICIO, new Date('2026-08-01T00:00:00-05:00')).fase, 'antes');
assert.equal(estadoEvento(INICIO, Date.parse('2026-12-01T00:00:00-05:00')).fase, 'pasado');

console.log('✓ estadoEvento');
```

- [ ] **Step 2: Correr la prueba y verificar que falla**

Run: `node test.js`
Expected: FAIL con `Cannot find module './logic.js'`

- [ ] **Step 3: Implementación mínima**

Crear `logic.js`:

```js
// Funciones puras. Sin DOM, sin window: por eso se pueden probar con Node.

function estadoEvento(inicioISO, ahora, duracionHoras = 12) {
  const inicio = new Date(inicioISO).getTime();
  const fin = inicio + duracionHoras * 3600 * 1000;
  const t = ahora instanceof Date ? ahora.getTime() : new Date(ahora).getTime();

  if (t >= fin) return { fase: 'pasado', d: 0, h: 0, m: 0, s: 0 };
  if (t >= inicio) return { fase: 'hoy', d: 0, h: 0, m: 0, s: 0 };

  let resto = Math.floor((inicio - t) / 1000);
  const d = Math.floor(resto / 86400); resto -= d * 86400;
  const h = Math.floor(resto / 3600);  resto -= h * 3600;
  const m = Math.floor(resto / 60);
  const s = resto - m * 60;
  return { fase: 'antes', d, h, m, s };
}

if (typeof module !== 'undefined') module.exports = { estadoEvento };
```

Nota: en el navegador `logic.js` se carga como script normal y deja `estadoEvento` como global; el `module.exports` solo existe bajo Node.

- [ ] **Step 4: Correr la prueba y verificar que pasa**

Run: `node test.js`
Expected: `✓ estadoEvento`

- [ ] **Step 5: Verificación**

Confirmar que `logic.js` no contiene ninguna referencia a `document`, `window` o `navigator`.
Run: `grep -nE 'document|window|navigator' logic.js` → Expected: sin resultados.

---

### Task 2: `mensajeWhatsApp` — compone el mensaje y valida

**Files:**
- Modify: `logic.js`
- Modify: `test.js`

**Interfaces:**
- Consumes: `logic.js` de Task 1.
- Produces: `mensajeWhatsApp(numero: string, datos: { nombre, interes, texto }) → { ok: true, url: string } | { ok: false, campo: 'nombre'|'texto', error: string }`

- [ ] **Step 1: Escribir la prueba que falla**

Añadir al final de `test.js`, antes de nada cambiar la primera línea de import:

```js
// reemplazar la línea de require inicial por:
const { estadoEvento, mensajeWhatsApp } = require('./logic.js');
```

Y agregar al final del archivo:

```js
const NUM = '593995128564';

// caso feliz completo
let w = mensajeWhatsApp(NUM, { nombre: 'Juan Pérez', interes: 'Membresía mensual', texto: '¿Hay cupo el lunes?' });
assert.equal(w.ok, true);
assert.ok(w.url.startsWith('https://wa.me/593995128564?text='));

// el mensaje decodificado tiene la forma acordada
let decodificado = decodeURIComponent(w.url.split('?text=')[1]);
assert.equal(
  decodificado,
  'Hola coach Anthony 👋\nSoy *Juan Pérez*.\nMe interesa: *Membresía mensual*\n\n¿Hay cupo el lunes?'
);

// acentos, ñ y signos van escapados en la URL, no crudos
assert.ok(!w.url.includes('é'), 'los acentos deben ir codificados');
assert.ok(w.url.includes('%0A'), 'los saltos de línea deben ir codificados');

// interés vacío: se omite esa línea, no queda "Me interesa: **"
w = mensajeWhatsApp(NUM, { nombre: 'Ana', interes: '', texto: 'Hola' });
decodificado = decodeURIComponent(w.url.split('?text=')[1]);
assert.equal(decodificado, 'Hola coach Anthony 👋\nSoy *Ana*.\n\nHola');

// nombre faltante o solo espacios: no se abre WhatsApp
for (const malo of ['', '   ', undefined]) {
  const r2 = mensajeWhatsApp(NUM, { nombre: malo, interes: 'Otro', texto: 'Hola' });
  assert.equal(r2.ok, false);
  assert.equal(r2.campo, 'nombre');
  assert.ok(r2.error.length > 0);
}

// mensaje faltante: no se abre WhatsApp
for (const malo of ['', '  ', undefined]) {
  const r3 = mensajeWhatsApp(NUM, { nombre: 'Ana', interes: 'Otro', texto: malo });
  assert.equal(r3.ok, false);
  assert.equal(r3.campo, 'texto');
}

// se recortan espacios sobrantes de los extremos
w = mensajeWhatsApp(NUM, { nombre: '  Ana  ', interes: 'Otro', texto: '  Hola  ' });
decodificado = decodeURIComponent(w.url.split('?text=')[1]);
assert.ok(decodificado.includes('*Ana*'));
assert.ok(decodificado.endsWith('Hola'));

console.log('✓ mensajeWhatsApp');
```

- [ ] **Step 2: Correr la prueba y verificar que falla**

Run: `node test.js`
Expected: FAIL con `mensajeWhatsApp is not a function`

- [ ] **Step 3: Implementación mínima**

Añadir a `logic.js` antes del `module.exports`, y actualizar el export:

```js
function mensajeWhatsApp(numero, datos) {
  const nombre = String(datos && datos.nombre || '').trim();
  const texto  = String(datos && datos.texto  || '').trim();
  const interes = String(datos && datos.interes || '').trim();

  if (!nombre) {
    return { ok: false, campo: 'nombre', error: 'Escribe tu nombre para que el coach sepa quién eres' };
  }
  if (!texto) {
    return { ok: false, campo: 'texto', error: 'Cuéntale al coach qué necesitas' };
  }

  const lineas = ['Hola coach Anthony 👋', `Soy *${nombre}*.`];
  if (interes) lineas.push(`Me interesa: *${interes}*`);
  lineas.push('', texto);

  return { ok: true, url: `https://wa.me/${numero}?text=${encodeURIComponent(lineas.join('\n'))}` };
}

if (typeof module !== 'undefined') module.exports = { estadoEvento, mensajeWhatsApp };
```

- [ ] **Step 4: Correr las pruebas y verificar que pasan**

Run: `node test.js`
Expected: `✓ estadoEvento` y `✓ mensajeWhatsApp`

- [ ] **Step 5: Verificación**

Run: `grep -nE 'document|window|navigator' logic.js` → Expected: sin resultados.

---

### Task 3: Esqueleto, tokens y barra de navegación

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `assets/` (copiar `ChukuCross-Logo.jpg` desde `C:\sistemas\CHUKU-CROSS-sources\` como `assets/logo.jpg`)

**Interfaces:**
- Consumes: nada.
- Produces: las custom properties de `:root` y las clases `.wrap`, `.mono`, `.display`, `.btn`, `.btn--naranja`, `.btn--hueso`, `.nav`, que todas las tareas siguientes reutilizan.

- [ ] **Step 1: Crear `index.html` con el esqueleto y la barra**

```html
<!DOCTYPE html>
<html lang="es-EC">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Chuku Cross Gym · El Triunfo — Conversatorio de Culturismo 09.08.2026</title>
<meta name="description" content="Chuku Cross Gym en El Triunfo, Guayas. Conversatorio de culturismo el 9 de agosto de 2026: posing, categorías, invitados nacionales y marcas. Cdla. Jaime Roldós, Muro de Berlín, frente al puente peatonal.">
<meta name="theme-color" content="#0E0D0C">
<meta property="og:type" content="website">
<meta property="og:title" content="Conversatorio de Culturismo · Chuku Cross Gym">
<meta property="og:description" content="09 de agosto de 2026 · El Triunfo. Posing, categorías, invitados nacionales y marcas.">
<meta property="og:image" content="assets/logo.jpg">
<meta property="og:locale" content="es_EC">
<link rel="icon" href="assets/logo.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700&family=Big+Shoulders+Display:wght@700;800;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
</head>
<body>

<a class="skip" href="#actos">Saltar al contenido</a>

<header class="nav">
  <div class="nav__in">
    <a class="nav__logo" href="#top">
      <img src="assets/logo.jpg" alt="Chuku Cross Gym" width="44" height="44">
      <span><b>CHUKU CROSS</b><i>EL TRIUNFO</i></span>
    </a>
    <nav class="nav__links" id="menu" aria-label="Navegación principal">
      <a href="#evento">Evento</a>
      <a href="#gym">El gym</a>
      <a href="#coach">Coach</a>
      <a href="#planes">Membresías</a>
      <a href="#contacto">Contacto</a>
      <a class="btn btn--naranja btn--sm" href="#" data-wa data-wa-msg="Hola, quiero información del Chuku Cross Gym.">WhatsApp</a>
    </nav>
    <button class="burger" id="burger" aria-expanded="false" aria-controls="menu" aria-label="Abrir menú">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>

<main id="top">
  <div id="actos"></div>
</main>

<script src="logic.js"></script>
<script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Crear `styles.css` con tokens y barra**

```css
:root{
  --naranja:#E4411F; --brasa:#B32C10;
  --carbon:#0E0D0C; --carbon-2:#2A2724;
  --hueso:#EFE9DE; --hueso-2:#FBF8F3;
  --piedra:#C9C0B2; --gris:#8A8378; --tinta:#5A534B;
  --display:'Big Shoulders Display',Impact,'Arial Narrow',sans-serif;
  --texto:'Archivo',system-ui,sans-serif;
  --dato:'Space Mono',ui-monospace,monospace;
  --nav-h:66px;
}
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--carbon);color:var(--hueso);font-family:var(--texto);
  font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}
a{color:inherit}

.skip{position:absolute;left:-9999px;top:0;z-index:100;background:var(--naranja);
  color:#fff;padding:12px 18px;font-weight:700}
.skip:focus{left:0}
:focus-visible{outline:3px solid var(--naranja);outline-offset:3px}

.wrap{width:min(1220px,92vw);margin-inline:auto}
.mono{font-family:var(--dato);letter-spacing:.16em;text-transform:uppercase;font-size:.72rem}
.display{font-family:var(--display);font-weight:900;text-transform:uppercase;
  line-height:.82;letter-spacing:-.015em;margin:0}

.btn{font-family:var(--texto);font-weight:700;font-size:.82rem;letter-spacing:.05em;
  text-transform:uppercase;text-decoration:none;padding:15px 26px;display:inline-block;
  border:2px solid transparent;transition:background .18s,color .18s,border-color .18s}
.btn--naranja{background:var(--naranja);color:#fff}
.btn--naranja:hover{background:var(--brasa)}
.btn--hueso{background:transparent;color:var(--hueso);border-color:var(--hueso)}
.btn--hueso:hover{background:var(--hueso);color:var(--carbon)}
.btn--sm{padding:10px 16px;font-size:.72rem}

.nav{position:fixed;inset:0 0 auto 0;z-index:50;height:var(--nav-h);
  background:rgba(14,13,12,.82);backdrop-filter:blur(10px);
  border-bottom:1px solid rgba(239,233,222,.12)}
.nav__in{height:100%;display:flex;align-items:center;justify-content:space-between;
  width:min(1220px,92vw);margin-inline:auto;gap:20px}
.nav__logo{display:flex;align-items:center;gap:11px;text-decoration:none}
.nav__logo img{border-radius:3px}
.nav__logo span{display:flex;flex-direction:column;line-height:1}
.nav__logo b{font-family:var(--display);font-weight:900;font-size:1.12rem;letter-spacing:.01em}
.nav__logo i{font-family:var(--dato);font-style:normal;font-size:.56rem;
  letter-spacing:.22em;color:var(--gris);margin-top:3px}
.nav__links{display:flex;align-items:center;gap:26px}
.nav__links a{font-size:.84rem;font-weight:600;text-decoration:none;color:var(--hueso)}
.nav__links a:not(.btn):hover{color:var(--naranja)}
.burger{display:none;background:none;border:0;padding:10px;cursor:pointer}
.burger span{display:block;width:24px;height:2px;background:var(--hueso);margin:5px 0}
```

- [ ] **Step 3: Verificar en el navegador**

Abrir `index.html`. Expected: barra fija oscura, logo a la izquierda con "CHUKU CROSS / EL TRIUNFO", enlaces a la derecha, botón naranja de WhatsApp. Las tres tipografías cargadas (comprobar en DevTools → Network que llegan las tres familias).

- [ ] **Step 4: Verificar accesibilidad básica**

Pulsar Tab desde el inicio. Expected: aparece el enlace "Saltar al contenido" y todos los enlaces muestran contorno naranja visible.

---

### Task 4: Acto I — paneles con `scroll-snap` y contador de actos

**Files:**
- Modify: `index.html` (reemplazar `<div id="actos"></div>`)
- Modify: `styles.css`
- Create: `app.js`

**Interfaces:**
- Consumes: tokens y `.display`/`.mono` de Task 3.
- Produces: la estructura `.actos > .panel[data-acto]`, el elemento `.contador`, y el objeto `CONFIG` de `app.js` que las tareas 5, 7, 8 y 9 leen.

- [ ] **Step 1: Reemplazar el marcador por los tres paneles**

En `index.html`, sustituir `<div id="actos"></div>` por:

```html
<div class="actos" id="actos">

  <ol class="contador" id="contador" aria-hidden="true">
    <li data-i="1"><b>01</b></li>
    <li data-i="2"><b>02</b></li>
    <li data-i="3"><b>03</b></li>
  </ol>

  <section class="panel panel--evento" id="evento" data-acto="1">
    <div class="panel__in">
      <p class="mono panel__eyebrow" id="evento-eyebrow">El Triunfo · 09.08.2026</p>
      <h1 class="display panel__title" id="evento-title">Conversatorio<br><span>de culturismo</span></h1>
      <p class="panel__lead" id="evento-lead">Posing, categorías, invitados nacionales y marcas presentes. Entrada libre.</p>
      <div id="evento-slot"></div>
    </div>
  </section>

  <section class="panel panel--gym" id="gym" data-acto="2">
    <div class="panel__bg"><img src="assets/gym-01.jpg" alt="Interior del Chuku Cross Gym" loading="lazy"></div>
    <div class="panel__in">
      <p class="mono panel__eyebrow">El lugar</p>
      <h2 class="display panel__title">Fierro,<br>piso<br><span>y ganas</span></h2>
      <p class="panel__lead">El gym del cantón. Aquí entrena el que compite y el que recién empieza, en el mismo piso.</p>
    </div>
  </section>

  <section class="panel panel--coach" id="coach" data-acto="3">
    <div class="panel__marca" aria-hidden="true"></div>
    <div class="panel__in">
      <p class="mono panel__eyebrow">Coach y fundador</p>
      <h2 class="display panel__title">Anthony<br><span>Ramires</span></h2>
      <p class="panel__lead">Fe como motor, disciplina como método y la juventud de El Triunfo como propósito.</p>
    </div>
  </section>

</div>
```

- [ ] **Step 2: Añadir el CSS de paneles y contador**

```css
.actos{scroll-snap-type:y proximity;position:relative}
.panel{position:relative;min-height:100vh;display:flex;align-items:center;
  scroll-snap-align:start;overflow:hidden;padding:calc(var(--nav-h) + 40px) 0 60px}
.panel__in{position:relative;z-index:2;width:min(1220px,92vw);margin-inline:auto}
.panel__eyebrow{color:var(--naranja);margin:0 0 18px}
.panel__title{font-size:clamp(3.4rem,11vw,9rem)}
.panel__title span{color:var(--naranja)}
.panel__lead{font-size:clamp(1rem,1.5vw,1.18rem);max-width:46ch;color:var(--piedra);margin:26px 0 0}

.panel--evento{background:var(--carbon)}
.panel--gym{background:var(--carbon-2)}
.panel--gym .panel__title span{color:var(--naranja)}
.panel--coach{background:var(--hueso);color:var(--carbon)}
.panel--coach .panel__lead{color:var(--tinta)}
.panel--coach .panel__eyebrow{color:var(--brasa)}

.panel__bg{position:absolute;inset:0;z-index:1}
.panel__bg img{width:100%;height:100%;object-fit:cover;opacity:.34}
.panel__bg::after{content:'';position:absolute;inset:0;
  background:linear-gradient(90deg,rgba(14,13,12,.92) 0%,rgba(14,13,12,.55) 60%,rgba(14,13,12,.2) 100%)}

/* marca de agua del león: se activa solo si existe assets/leon.png (Task 10) */
.panel__marca{position:absolute;right:-4vw;bottom:-6vh;width:min(52vw,620px);aspect-ratio:1;
  background:url('assets/leon.png') center/contain no-repeat;opacity:.06;z-index:1}

.contador{position:fixed;right:26px;top:50%;transform:translateY(-50%);z-index:40;
  list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:14px;
  transition:opacity .3s}
.contador li b{font-family:var(--dato);font-size:.66rem;color:var(--gris);
  display:block;padding-right:20px;position:relative;transition:color .25s}
.contador li b::after{content:'';position:absolute;right:0;top:50%;transform:translateY(-50%);
  width:12px;height:2px;background:var(--gris);transition:width .25s,background .25s,height .25s}
.contador li.on b{color:var(--naranja)}
.contador li.on b::after{width:20px;height:3px;background:var(--naranja)}
.contador.oculto{opacity:0;pointer-events:none}
```

- [ ] **Step 3: Crear `app.js` con `CONFIG` y el cableado base**

```js
(function () {
  'use strict';

  const CONFIG = {
    whatsapp: '593995128564',
    igGym:    'https://www.instagram.com/chukucross/',
    igCoach:  'https://www.instagram.com/anthonyfit20/',
    tiktok:   '',
    correo:   'anthony_1908@yahoo.com',
    horario:  { semana: 'Lun a Vie · 7:00–12:00 y 16:00–21:00', sabado: 'Sáb · 8:00–12:00' },
    evento:   { inicio: '2026-08-09T10:00:00-05:00', duracionHoras: 12 }
  };
  window.CHUKU = CONFIG;

  document.documentElement.classList.add('js');

  // --- enlaces de WhatsApp: mismo destino, distinto mensaje ---
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    const msg = a.getAttribute('data-wa-msg') || 'Hola, quiero información del Chuku Cross Gym.';
    a.href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(msg);
    a.target = '_blank';
    a.rel = 'noopener';
  });

  // --- menú móvil ---
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      const abierto = menu.classList.toggle('abierto');
      burger.setAttribute('aria-expanded', String(abierto));
      burger.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('abierto');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // --- contador de actos ---
  const contador = document.getElementById('contador');
  const paneles = document.querySelectorAll('.panel[data-acto]');
  if (contador && paneles.length) {
    const marcas = contador.querySelectorAll('li');
    const io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        const i = Number(en.target.getAttribute('data-acto'));
        marcas.forEach(function (li) {
          li.classList.toggle('on', Number(li.getAttribute('data-i')) === i);
        });
      });
    }, { threshold: 0.55 });
    paneles.forEach(function (p) { io.observe(p); });

    // el contador solo existe mientras dura el Acto I
    const finActoI = document.querySelector('.panel[data-acto="3"]');
    const io2 = new IntersectionObserver(function (entradas) {
      contador.classList.toggle('oculto', !entradas[0].isIntersecting && entradas[0].boundingClientRect.top < 0);
    }, { threshold: 0.1 });
    io2.observe(finActoI);
  }
})();
```

- [ ] **Step 4: Verificar en el navegador**

Abrir `index.html` y hacer scroll. Expected:
- Cada panel ocupa la pantalla completa y encaja al soltar el scroll.
- El contador lateral derecho marca `01`, `02`, `03` en naranja según el panel visible.
- Al pasar del tercer panel hacia abajo, el contador se desvanece.
- El panel del coach es claro (hueso) y los otros dos oscuros.

- [ ] **Step 5: Verificar el respaldo sin imágenes**

Como `assets/gym-01.jpg` aún no existe, confirmar que el panel del gym sigue legible (fondo `--carbon-2` sólido) y no muestra el ícono de imagen rota de forma que tape el texto. Si lo hace, se corrige en Task 10.

---

### Task 5: Panel 01 — estados del evento y regresiva

**Files:**
- Modify: `app.js`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `estadoEvento` de Task 1; `CONFIG` y los ids `evento-eyebrow`, `evento-title`, `evento-lead`, `evento-slot` de Task 4.
- Produces: la clase `body.fase-antes|fase-hoy|fase-pasado`, que Task 6 usa para cambiar el tiempo verbal de la banda del evento.

- [ ] **Step 1: Añadir el CSS de la regresiva**

```css
.cuenta{display:flex;gap:12px;margin:32px 0 34px;padding:0;list-style:none}
.cuenta li{background:rgba(239,233,222,.07);border:1px solid rgba(239,233,222,.16);
  padding:12px 0;min-width:78px;text-align:center}
.cuenta b{font-family:var(--dato);font-weight:700;font-size:1.6rem;color:var(--naranja);
  display:block;line-height:1;font-variant-numeric:tabular-nums}
.cuenta span{font-family:var(--dato);font-size:.56rem;letter-spacing:.18em;
  text-transform:uppercase;color:var(--gris);display:block;margin-top:7px}
.panel__cta{display:flex;gap:14px;flex-wrap:wrap}
@media (max-width:520px){ .cuenta li{min-width:0;flex:1} .cuenta b{font-size:1.2rem} }
```

- [ ] **Step 2: Añadir el control de fases a `app.js`**

Insertar antes del cierre de la IIFE:

```js
  // --- panel 01: cambia solo según la fecha ---
  const TEXTOS = {
    antes: {
      eyebrow: 'El Triunfo · 09.08.2026 · 10:00',
      titulo:  'Conversatorio<br><span>de culturismo</span>',
      lead:    'Posing, categorías, invitados nacionales y marcas presentes. Entrada libre.',
      cta:     '<a class="btn btn--naranja" href="#" data-wa data-wa-msg="Hola, quiero reservar mi cupo para el conversatorio del 9 de agosto.">Reservar mi cupo</a>' +
               '<a class="btn btn--hueso" href="#programa">Ver el programa</a>'
    },
    hoy: {
      eyebrow: 'Es hoy · 10:00 · Cdla. Jaime Roldós',
      titulo:  'Es hoy:<br><span>te esperamos</span>',
      lead:    'Conversatorio de culturismo en el Chuku Cross Gym. Muro de Berlín, frente al puente peatonal.',
      cta:     '<a class="btn btn--naranja" href="#ubicacion">Cómo llegar</a>' +
               '<a class="btn btn--hueso" href="#" data-wa data-wa-msg="Hola, voy en camino al conversatorio. ¿Alguna indicación?">Escribir al gym</a>'
    },
    pasado: {
      eyebrow: 'El Triunfo · Guayas · Ecuador',
      titulo:  'Chuku<br><span>Cross Gym</span>',
      lead:    'El gym del cantón. Fierro, piso y ganas, con un coach que te corrige de verdad.',
      cta:     '<a class="btn btn--naranja" href="#" data-wa data-wa-msg="Hola, quiero entrenar en el Chuku Cross Gym.">Entrena con nosotros</a>' +
               '<a class="btn btn--hueso" href="#planes">Ver membresías</a>'
    }
  };

  const elEyebrow = document.getElementById('evento-eyebrow');
  const elTitulo  = document.getElementById('evento-title');
  const elLead    = document.getElementById('evento-lead');
  const elSlot    = document.getElementById('evento-slot');
  let faseActual = null;

  function pintarCuenta(e) {
    elSlot.innerHTML =
      '<ol class="cuenta">' +
        '<li><b>' + String(e.d).padStart(2,'0') + '</b><span>Días</span></li>' +
        '<li><b>' + String(e.h).padStart(2,'0') + '</b><span>Horas</span></li>' +
        '<li><b>' + String(e.m).padStart(2,'0') + '</b><span>Min</span></li>' +
        '<li><b>' + String(e.s).padStart(2,'0') + '</b><span>Seg</span></li>' +
      '</ol>' +
      '<div class="panel__cta">' + TEXTOS.antes.cta + '</div>';
  }

  function aplicarFase(e) {
    if (e.fase === faseActual) {
      if (e.fase === 'antes') {
        const b = elSlot.querySelectorAll('.cuenta b');
        if (b.length === 4) {
          b[0].textContent = String(e.d).padStart(2,'0');
          b[1].textContent = String(e.h).padStart(2,'0');
          b[2].textContent = String(e.m).padStart(2,'0');
          b[3].textContent = String(e.s).padStart(2,'0');
        }
      }
      return;
    }
    faseActual = e.fase;
    const t = TEXTOS[e.fase];
    elEyebrow.textContent = t.eyebrow;
    elTitulo.innerHTML = t.titulo;
    elLead.textContent = t.lead;
    elSlot.innerHTML = (e.fase === 'antes') ? '' : '<div class="panel__cta">' + t.cta + '</div>';
    if (e.fase === 'antes') pintarCuenta(e);

    document.body.classList.remove('fase-antes','fase-hoy','fase-pasado');
    document.body.classList.add('fase-' + e.fase);

    // los CTA recién insertados necesitan su href de WhatsApp
    elSlot.querySelectorAll('[data-wa]').forEach(function (a) {
      a.href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(a.getAttribute('data-wa-msg'));
      a.target = '_blank'; a.rel = 'noopener';
    });
  }

  function tick() {
    aplicarFase(estadoEvento(CONFIG.evento.inicio, new Date(), CONFIG.evento.duracionHoras));
  }
  tick();
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(tick, 1000);
  } else {
    setInterval(tick, 60000);
  }
```

- [ ] **Step 3: Verificar la fase actual en el navegador**

Abrir `index.html`. Expected (hoy es 8 de agosto de 2026): titular "Conversatorio de culturismo", regresiva corriendo con menos de 1 día, botones "Reservar mi cupo" y "Ver el programa".

- [ ] **Step 4: Verificar las otras dos fases sin esperar**

En la consola del navegador:

```js
// simular que ya pasó el evento
document.body.className = '';
CHUKU.evento.inicio = '2020-01-01T10:00:00-05:00';
```
Recargar no sirve (el CONFIG vuelve al valor original), así que en su lugar editar temporalmente `CONFIG.evento.inicio` en `app.js` a `'2020-01-01T10:00:00-05:00'` y recargar.
Expected: el panel muestra "Chuku Cross Gym" y el botón "Entrena con nosotros", sin regresiva.

Luego probar `'2026-08-08T18:40:00-05:00'` (unos minutos en el pasado inmediato).
Expected: "Es hoy: te esperamos" con el botón "Cómo llegar".

**Restaurar `CONFIG.evento.inicio` a `'2026-08-09T10:00:00-05:00'` antes de continuar.**

- [ ] **Step 5: Verificar que las pruebas siguen pasando**

Run: `node test.js`
Expected: `✓ estadoEvento` y `✓ mensajeWhatsApp`

---

### Task 6: Acto II — banda del programa y banda del gym

**Files:**
- Modify: `index.html` (después de `</div>` que cierra `.actos`, dentro de `<main>`)
- Modify: `styles.css`

**Interfaces:**
- Consumes: `.wrap`, `.display`, `.mono` de Task 3; `body.fase-*` de Task 5.
- Produces: las clases `.banda`, `.banda--invertida`, `.banda__foto`, `.banda__txt`, `.grid-programa` que Task 7 reutiliza.

- [ ] **Step 1: Añadir el CSS de bandas**

```css
.banda{display:grid;grid-template-columns:1fr 1fr;align-items:center;min-height:74vh}
.banda--invertida .banda__foto{order:2}
.banda__foto{position:relative;min-height:74vh;background:var(--carbon-2)}
.banda__foto img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.banda__foto::after{content:attr(data-etiqueta);position:absolute;left:20px;bottom:18px;
  font-family:var(--dato);font-size:.58rem;letter-spacing:.18em;text-transform:uppercase;
  color:rgba(239,233,222,.55);z-index:2}
.banda__txt{padding:clamp(38px,6vw,84px)}
.banda__txt h2{font-family:var(--display);font-weight:900;text-transform:uppercase;
  line-height:.86;letter-spacing:-.012em;font-size:clamp(2.6rem,5.2vw,4.6rem);margin:14px 0 22px}
.banda__txt p{max-width:52ch}
.banda--oscura{background:var(--carbon)}
.banda--clara{background:var(--hueso);color:var(--carbon)}
.banda--clara p{color:var(--tinta)}
.banda--naranja{background:var(--naranja);color:#fff}
.banda--naranja p{color:rgba(255,255,255,.9)}
.banda--naranja .mono{color:rgba(255,255,255,.8)}

.seccion{padding:clamp(64px,9vw,120px) 0}
.seccion--clara{background:var(--hueso);color:var(--carbon)}
.seccion__head{margin-bottom:52px}
.seccion__head h2{font-family:var(--display);font-weight:900;text-transform:uppercase;
  line-height:.86;font-size:clamp(2.6rem,6vw,5.2rem);margin:14px 0 0}

.grid-programa{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:2px;
  background:var(--piedra)}
.grid-programa article{background:var(--hueso);padding:34px 30px 38px}
.grid-programa h3{font-family:var(--display);font-weight:800;text-transform:uppercase;
  font-size:1.85rem;line-height:.9;margin:16px 0 12px}
.grid-programa p{color:var(--tinta);font-size:.95rem;margin:0}
.grid-programa .kb{width:26px;height:26px;display:block;color:var(--naranja)}
.grid-programa .kb svg{width:100%;height:100%;fill:currentColor}

/* el tiempo verbal cambia con la fase del evento */
.fase-pasado .solo-antes{display:none}
.solo-pasado{display:none}
.fase-pasado .solo-pasado{display:inline}
```

- [ ] **Step 2: Añadir las dos bandas al `index.html`**

Insertar justo después del `</div>` que cierra `.actos`:

El glifo de kettlebell se define **una sola vez** como `<symbol>` y se reutiliza con `<use>`. No
repetir el `<path>` en cada tarjeta.

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <symbol id="kb" viewBox="0 0 24 24">
    <path d="M12 2a5 5 0 0 0-5 5c0 .9.24 1.74.66 2.47A7 7 0 0 0 5 15.5 6.5 6.5 0 0 0 11.5 22h1A6.5 6.5 0 0 0 19 15.5a7 7 0 0 0-2.66-6.03A4.96 4.96 0 0 0 17 7a5 5 0 0 0-5-5Zm0 2a3 3 0 0 1 3 3 3 3 0 0 1-.6 1.8l-.5.65.68.45A5 5 0 0 1 17 15.5 4.5 4.5 0 0 1 12.5 20h-1A4.5 4.5 0 0 1 7 15.5a5 5 0 0 1 2.42-4.6l.68-.45-.5-.65A3 3 0 0 1 9 7a3 3 0 0 1 3-3Z"/>
  </symbol>
</svg>

<section class="seccion seccion--clara" id="programa">
  <div class="wrap">
    <header class="seccion__head">
      <p class="mono" style="color:var(--brasa)">09.08.2026 · 10:00 · El Triunfo</p>
      <h2>Qué se <span class="solo-antes">habla</span><span class="solo-pasado">habló</span><br>ese día</h2>
    </header>

    <div class="grid-programa">
      <article>
        <span class="kb" aria-hidden="true"><svg><use href="#kb"></use></svg></span>
        <h3>Conversatorio</h3>
        <p>Cómo se planifica una temporada: volumen, definición, descanso y por qué el progreso se mide en meses y no en semanas.</p>
      </article>
      <article>
        <span class="kb" aria-hidden="true"><svg><use href="#kb"></use></svg></span>
        <h3>Posing</h3>
        <p>Cuartos de giro, poses mandatorias y transiciones. La rutina que se ve y la que puntúa, con corrección en vivo delante de todos.</p>
      </article>
      <article>
        <span class="kb" aria-hidden="true"><svg><use href="#kb"></use></svg></span>
        <h3>Categorías</h3>
        <p>Men's Physique, Classic Physique, Bodybuilding, Bikini y Wellness: qué exige cada una y en cuál encaja tu estructura.</p>
      </article>
      <article>
        <span class="kb" aria-hidden="true"><svg><use href="#kb"></use></svg></span>
        <h3>Qué hace a un atleta</h3>
        <p>Disciplina fuera del gym, manejo de la cabeza, entorno y constancia. La parte que nadie sube a redes.</p>
      </article>
    </div>
  </div>
</section>

<section class="banda banda--oscura">
  <div class="banda__foto" data-etiqueta="Invitados nacionales">
    <img src="assets/gym-02.jpg" alt="Atletas entrenando en el Chuku Cross Gym" loading="lazy">
  </div>
  <div class="banda__txt">
    <p class="mono" style="color:var(--naranja)">Quiénes acompañan</p>
    <h2>Invitados<br>y marcas</h2>
    <p>Atletas y preparadores con recorrido en tarima ecuatoriana acompañan la jornada, responden preguntas y corrigen posing en vivo. La nómina se publica en nuestras redes.</p>
    <p>Marcas de suplementación, indumentaria y accesorios estarán presentes con stands y muestras durante todo el evento.</p>
    <p style="margin-top:26px">
      <a class="btn btn--naranja" href="#" data-wa data-wa-msg="Hola, represento a una marca y quiero estar presente en el evento del 9 de agosto.">Quiero llevar mi marca</a>
    </p>
  </div>
</section>
```

- [ ] **Step 3: Verificar en el navegador**

Expected: sección clara con cuatro tarjetas de programa separadas por una línea fina de `--piedra`, cada una con el glifo de kettlebell naranja arriba. Debajo, banda oscura con foto a la izquierda (o bloque sólido si falta la imagen) y texto a la derecha.

- [ ] **Step 4: Verificar el cambio de tiempo verbal**

En la consola: `document.body.classList.add('fase-pasado')`.
Expected: el titular cambia de "Qué se habla ese día" a "Qué se habló ese día".
Deshacer con `document.body.classList.remove('fase-pasado')`.

---

### Task 7: Acto II — el gym por dentro, quiénes somos y membresías

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `.banda`, `.seccion`, `.grid-programa` de Task 6; `CONFIG` de Task 4.
- Produces: los ids `#planes` y `#coach-redes`, y las clases `.galeria`, `.planes`, que Task 10 ajusta en responsive.

- [ ] **Step 1: Añadir el CSS**

```css
.galeria{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:200px;gap:10px;margin-top:20px}
.galeria figure{margin:0;position:relative;background:var(--carbon-2);overflow:hidden}
.galeria figure img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
.galeria figure:hover img{transform:scale(1.05)}
.galeria figure::after{content:attr(data-etiqueta);position:absolute;left:14px;bottom:12px;
  font-family:var(--dato);font-size:.55rem;letter-spacing:.16em;text-transform:uppercase;
  color:rgba(239,233,222,.6)}
.galeria .ancha{grid-column:span 2}
.galeria .alta{grid-row:span 2}

.areas{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2px;
  background:rgba(239,233,222,.14);margin-top:44px}
.areas li{background:var(--carbon);padding:26px 24px;list-style:none}
.areas b{font-family:var(--display);font-weight:800;text-transform:uppercase;
  font-size:1.35rem;display:block;margin-bottom:6px}
.areas span{color:var(--gris);font-size:.88rem}

.cita{border-left:4px solid var(--naranja);padding:6px 0 6px 24px;margin:34px 0;
  font-family:var(--display);font-weight:700;font-size:1.7rem;line-height:1.08;
  text-transform:none;letter-spacing:0}
.cita cite{display:block;font-family:var(--dato);font-size:.62rem;letter-spacing:.16em;
  text-transform:uppercase;color:var(--gris);font-style:normal;margin-top:14px}

.redes{display:flex;gap:10px;flex-wrap:wrap;margin-top:26px}
.chip{font-family:var(--dato);font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;
  padding:11px 16px;border:1px solid currentColor;text-decoration:none;transition:background .18s,color .18s}
.chip:hover{background:var(--carbon);color:var(--hueso)}

.planes{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-top:12px}
.plan{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.24);
  padding:34px 28px 30px;display:flex;flex-direction:column}
.plan--destacado{background:#fff;color:var(--carbon);border-color:#fff}
.plan__flag{font-family:var(--dato);font-size:.56rem;letter-spacing:.18em;text-transform:uppercase;
  background:var(--carbon);color:#fff;padding:5px 10px;align-self:flex-start;margin-bottom:14px}
.plan h3{font-family:var(--display);font-weight:900;text-transform:uppercase;
  font-size:2.2rem;margin:0 0 8px;line-height:.9}
.plan ul{list-style:none;padding:0;margin:16px 0 26px;flex:1}
.plan li{padding:9px 0;border-bottom:1px solid rgba(255,255,255,.18);font-size:.92rem}
.plan--destacado li{border-color:rgba(14,13,12,.12)}
.plan li::before{content:'✓';color:var(--naranja);font-weight:700;margin-right:10px}
.plan--destacado li::before{color:var(--brasa)}
.planes__nota{font-family:var(--dato);font-size:.62rem;letter-spacing:.1em;
  color:rgba(255,255,255,.75);margin-top:22px;text-transform:uppercase}
```

- [ ] **Step 2: Añadir las tres secciones al `index.html`** (después de la banda de invitados)

```html
<section class="seccion" id="gym-dentro">
  <div class="wrap">
    <header class="seccion__head">
      <p class="mono" style="color:var(--naranja)">El gym por dentro</p>
      <h2>Todo lo que<br>necesitas, sin<br><span style="color:var(--naranja)">adornos</span></h2>
    </header>

    <div class="galeria">
      <figure class="ancha alta" data-etiqueta="Zona de peso libre"><img src="assets/gym-01.jpg" alt="Zona de peso libre con barras, discos y racks" loading="lazy"></figure>
      <figure data-etiqueta="Máquinas"><img src="assets/gym-02.jpg" alt="Área de máquinas de tren superior e inferior" loading="lazy"></figure>
      <figure data-etiqueta="Funcional"><img src="assets/gym-03.jpg" alt="Área de entrenamiento funcional" loading="lazy"></figure>
      <figure data-etiqueta="Cardio"><img src="assets/gym-04.jpg" alt="Área de cardio" loading="lazy"></figure>
      <figure data-etiqueta="Espejos y posing"><img src="assets/gym-05.jpg" alt="Zona de espejos para práctica de posing" loading="lazy"></figure>
    </div>

    <ul class="areas">
      <li><b>Peso libre</b><span>Barras, discos, mancuernas y racks</span></li>
      <li><b>Máquinas</b><span>Tren superior, tren inferior y poleas</span></li>
      <li><b>Funcional</b><span>Trabajo metabólico y acondicionamiento</span></li>
      <li><b>Asesoría</b><span>Rutina y seguimiento con el coach</span></li>
    </ul>
  </div>
</section>

<section class="banda banda--clara banda--invertida" id="nosotros">
  <div class="banda__foto" data-etiqueta="Coach Anthony Ramires">
    <img src="assets/coach.jpg" alt="Anthony Ramires, coach y fundador del Chuku Cross Gym" loading="lazy">
  </div>
  <div class="banda__txt">
    <p class="mono" style="color:var(--brasa)">Quiénes somos</p>
    <h2>Lo que se<br>levanta aquí<br>empieza en<br>la fe</h2>
    <p>Anthony Ramires construyó el Chuku Cross Gym con Dios como motor y una idea simple: la disciplina que se aprende cargando un disco sirve para todo lo demás.</p>
    <p>Su trabajo va más allá de la rutina. Formar juventud en El Triunfo es la razón del proyecto: darle a los chicos del cantón un lugar donde llegar después del colegio, una meta que perseguir y gente que les exija en serio. Aquí no se entrena solo el cuerpo; se enseña puntualidad, respeto y palabra cumplida.</p>
    <p>Por eso el gym impulsa el deporte local, abre sus puertas a eventos como el conversatorio del 9 de agosto y acompaña a quien quiere competir. Si vienes por salud, por estética o por tarima, el trato es el mismo: se te enseña, se te corrige y se te acompaña.</p>

    <blockquote class="cita">Un atleta no se construye en el escenario. Se construye los días que nadie te ve entrenar.<cite>Anthony Ramires</cite></blockquote>

    <div class="redes" id="coach-redes">
      <a class="btn btn--naranja" href="#" data-wa data-wa-msg="Hola coach, quiero asesoría en el Chuku Cross Gym.">WhatsApp del coach</a>
      <a class="chip" data-social="igCoach" href="#">Instagram del coach</a>
      <a class="chip" data-social="igGym" href="#">Instagram del gym</a>
      <a class="chip" data-social="tiktok" href="#">TikTok</a>
    </div>
  </div>
</section>

<section class="seccion" id="planes" style="background:var(--naranja);color:#fff">
  <div class="wrap">
    <header class="seccion__head">
      <p class="mono" style="color:rgba(255,255,255,.85)">Membresías</p>
      <h2>Entrena<br>desde hoy</h2>
    </header>

    <div class="planes">
      <article class="plan">
        <h3>Diario</h3>
        <ul><li>Acceso completo al gym</li><li>Sin compromiso</li><li>Ideal si estás de paso</li></ul>
        <a class="btn btn--hueso" href="#" data-wa data-wa-msg="Hola, quiero saber el valor del pase diario.">Consultar</a>
      </article>
      <article class="plan plan--destacado">
        <span class="plan__flag">El más tomado</span>
        <h3>Mensual</h3>
        <ul><li>Acceso completo al gym</li><li>Rutina armada por el coach</li><li>Seguimiento de tu progreso</li></ul>
        <a class="btn btn--naranja" href="#" data-wa data-wa-msg="Hola, quiero saber el valor de la membresía mensual.">Consultar</a>
      </article>
      <article class="plan">
        <h3>Trimestral</h3>
        <ul><li>Todo lo del plan mensual</li><li>Plan de temporada con el coach</li><li>Mejor valor por mes</li></ul>
        <a class="btn btn--hueso" href="#" data-wa data-wa-msg="Hola, quiero saber el valor de la membresía trimestral.">Consultar</a>
      </article>
    </div>
    <p class="planes__nota">Los valores se confirman por WhatsApp · promociones vigentes cada mes</p>
  </div>
</section>
```

- [ ] **Step 3: Cablear las redes en `app.js`**

Insertar antes del cierre de la IIFE:

```js
  // --- redes: un enlace vacío se oculta en vez de apuntar a la nada ---
  document.querySelectorAll('[data-social]').forEach(function (a) {
    const url = CONFIG[a.getAttribute('data-social')];
    if (!url) { a.remove(); return; }
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
  });
```

- [ ] **Step 4: Verificar en el navegador**

Expected:
- Galería en mosaico de 4 columnas con una celda ancha y alta.
- Banda clara del coach con la foto a la derecha (por `banda--invertida`) y la cita con filo naranja.
- Sección de membresías con fondo naranja completo y la tarjeta central en blanco.
- **El chip de TikTok no aparece** (porque `CONFIG.tiktok` está vacío). Los dos de Instagram sí, y abren en pestaña nueva.

---

### Task 8: Acto III — formulario que compone el WhatsApp

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `app.js`

**Interfaces:**
- Consumes: `mensajeWhatsApp` de Task 2; `CONFIG` de Task 4.
- Produces: el id `#contacto`.

- [ ] **Step 1: Añadir el CSS**

```css
.form{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:36px}
.campo{display:flex;flex-direction:column;gap:8px}
.campo--ancho{grid-column:1 / -1}
.campo label{font-family:var(--dato);font-size:.62rem;letter-spacing:.16em;
  text-transform:uppercase;color:var(--gris)}
.campo input,.campo select,.campo textarea{font-family:var(--texto);font-size:1rem;
  background:rgba(239,233,222,.06);border:1px solid rgba(239,233,222,.22);
  color:var(--hueso);padding:15px 16px;width:100%}
.campo textarea{resize:vertical;min-height:130px}
.campo input:focus,.campo select:focus,.campo textarea:focus{border-color:var(--naranja);outline:none}
.campo select option{background:var(--carbon);color:var(--hueso)}
.campo .error{font-family:var(--texto);font-size:.82rem;color:var(--naranja);min-height:1.2em}
.campo--malo input,.campo--malo textarea{border-color:var(--naranja)}
```

- [ ] **Step 2: Añadir el formulario al `index.html`**

```html
<section class="seccion" id="contacto">
  <div class="wrap" style="max-width:820px">
    <header class="seccion__head">
      <p class="mono" style="color:var(--naranja)">Escríbele al coach</p>
      <h2>Empieza por<br>un mensaje</h2>
      <p style="color:var(--piedra);margin-top:20px">Llena esto y se abre WhatsApp con tu mensaje ya escrito. No guardamos nada: va directo al chat.</p>
    </header>

    <form class="form" id="form-wa" novalidate>
      <div class="campo" id="campo-nombre">
        <label for="f-nombre">Tu nombre</label>
        <input id="f-nombre" name="nombre" type="text" autocomplete="name" placeholder="Juan Pérez">
        <span class="error" id="err-nombre" aria-live="polite"></span>
      </div>

      <div class="campo">
        <label for="f-interes">Qué te interesa</label>
        <select id="f-interes" name="interes">
          <option value="Membresía">Membresía</option>
          <option value="Asesoría personalizada">Asesoría personalizada</option>
          <option value="Evento del 09/08">Evento del 09/08</option>
          <option value="Otro">Otro</option>
        </select>
        <span class="error"></span>
      </div>

      <div class="campo campo--ancho" id="campo-texto">
        <label for="f-texto">Tu mensaje</label>
        <textarea id="f-texto" name="texto" placeholder="Quiero empezar el lunes, ¿hay cupo a las 7?"></textarea>
        <span class="error" id="err-texto" aria-live="polite"></span>
      </div>

      <div class="campo--ancho">
        <button class="btn btn--naranja" type="submit">Enviar por WhatsApp</button>
      </div>
    </form>
  </div>
</section>
```

- [ ] **Step 3: Cablear el formulario en `app.js`**

Insertar antes del cierre de la IIFE:

```js
  // --- formulario: compone el mensaje y abre WhatsApp ---
  const form = document.getElementById('form-wa');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();

      const campos = {
        nombre: document.getElementById('campo-nombre'),
        texto:  document.getElementById('campo-texto')
      };
      Object.keys(campos).forEach(function (k) { campos[k].classList.remove('campo--malo'); });
      document.getElementById('err-nombre').textContent = '';
      document.getElementById('err-texto').textContent = '';

      const r = mensajeWhatsApp(CONFIG.whatsapp, {
        nombre:  document.getElementById('f-nombre').value,
        interes: document.getElementById('f-interes').value,
        texto:   document.getElementById('f-texto').value
      });

      if (!r.ok) {
        campos[r.campo].classList.add('campo--malo');
        document.getElementById('err-' + r.campo).textContent = r.error;
        document.getElementById('f-' + r.campo).focus();
        return;
      }
      window.open(r.url, '_blank', 'noopener');
    });
  }
```

- [ ] **Step 4: Verificar los tres caminos en el navegador**

1. Enviar vacío → Expected: borde naranja en "Tu nombre", mensaje "Escribe tu nombre para que el coach sepa quién eres", foco en ese campo.
2. Poner nombre y enviar sin mensaje → Expected: el error salta a "Tu mensaje" con "Cuéntale al coach qué necesitas".
3. Llenar los tres y enviar → Expected: se abre `wa.me` en pestaña nueva con el mensaje ya redactado, acentos correctos y saltos de línea respetados.

- [ ] **Step 5: Verificar que las pruebas siguen pasando**

Run: `node test.js`
Expected: `✓ estadoEvento` y `✓ mensajeWhatsApp`

---

### Task 9: Ubicación, pie y botón flotante

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `app.js`

**Interfaces:**
- Consumes: `CONFIG.horario` y `CONFIG.correo` de Task 4.
- Produces: el id `#ubicacion` al que apunta el CTA "Cómo llegar" de la fase `hoy` (Task 5).

- [ ] **Step 1: Añadir el CSS**

```css
.loc{display:grid;grid-template-columns:1fr 1.15fr;gap:0;min-height:70vh}
.loc__info{padding:clamp(38px,6vw,84px);background:var(--carbon-2)}
.loc__map{background:var(--carbon-2);min-height:340px}
.loc__map iframe{width:100%;height:100%;border:0;display:block;filter:grayscale(1) contrast(1.1)}
.datos{margin:30px 0 34px}
.datos div{padding:16px 0;border-bottom:1px solid rgba(239,233,222,.16)}
.datos dt{font-family:var(--dato);font-size:.6rem;letter-spacing:.18em;
  text-transform:uppercase;color:var(--gris);margin-bottom:6px}
.datos dd{margin:0;font-size:1.02rem}

.pie{background:var(--carbon);border-top:1px solid rgba(239,233,222,.14);padding:56px 0 26px}
.pie__in{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:36px}
.pie__marca{display:flex;gap:14px;align-items:flex-start}
.pie__marca img{width:62px;height:62px;border-radius:4px}
.pie h4{font-family:var(--dato);font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;
  color:var(--gris);margin:0 0 14px;font-weight:400}
.pie a{color:var(--hueso);text-decoration:none;display:block;padding:5px 0;font-size:.9rem}
.pie a:hover{color:var(--naranja)}
.pie__legal{text-align:center;color:var(--gris);font-family:var(--dato);font-size:.6rem;
  letter-spacing:.12em;text-transform:uppercase;margin:44px 0 0;
  border-top:1px solid rgba(239,233,222,.1);padding-top:24px}

.flota{position:fixed;right:20px;bottom:20px;z-index:45;background:var(--naranja);color:#fff;
  border-radius:50px;padding:14px 20px;display:flex;align-items:center;gap:10px;
  text-decoration:none;font-weight:700;font-size:.86rem;
  box-shadow:0 10px 30px rgba(0,0,0,.4);transition:background .18s,transform .18s}
.flota:hover{background:var(--brasa);transform:translateY(-2px)}
.flota svg{width:21px;height:21px;fill:currentColor}
@media (max-width:640px){ .flota span{display:none} .flota{padding:15px;border-radius:50%} }
```

- [ ] **Step 2: Añadir ubicación, pie y botón al `index.html`**

Después de la sección de contacto, y el botón flotante justo antes de los `<script>`:

```html
<section class="loc" id="ubicacion">
  <div class="loc__info">
    <p class="mono" style="color:var(--naranja)">Cómo llegar</p>
    <h2 class="display" style="font-size:clamp(2.4rem,5vw,4.2rem);margin:14px 0 0">El Triunfo,<br><span style="color:var(--naranja)">Guayas</span></h2>

    <dl class="datos">
      <div><dt>Dirección</dt><dd>Cdla. Jaime Roldós, Muro de Berlín</dd></div>
      <div><dt>Referencia</dt><dd>Frente al puente peatonal</dd></div>
      <div><dt>Horario</dt><dd id="horario-semana">—</dd><dd id="horario-sabado" style="margin-top:6px">—</dd></div>
      <div><dt>Correo</dt><dd><a id="correo" href="#">—</a></dd></div>
    </dl>

    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <a class="btn btn--naranja" target="_blank" rel="noopener"
         href="https://www.google.com/maps/search/?api=1&query=Cdla.%20Jaime%20Rold%C3%B3s%20Muro%20de%20Berl%C3%ADn%2C%20El%20Triunfo%2C%20Guayas%2C%20Ecuador">Abrir en Maps</a>
      <a class="btn btn--hueso" href="#" data-wa data-wa-msg="Hola, ¿me pasan la ubicación exacta del gym?">Pedir ubicación</a>
    </div>
  </div>
  <div class="loc__map">
    <iframe title="Mapa de Chuku Cross Gym en El Triunfo, Guayas"
      src="https://maps.google.com/maps?q=Cdla.%20Jaime%20Rold%C3%B3s%2C%20Muro%20de%20Berl%C3%ADn%2C%20El%20Triunfo%2C%20Guayas%2C%20Ecuador&z=15&output=embed"
      loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
  </div>
</section>

<footer class="pie">
  <div class="wrap pie__in">
    <div class="pie__marca">
      <img src="assets/logo.jpg" alt="">
      <div>
        <p style="margin:0;font-family:var(--display);font-weight:900;font-size:1.5rem;line-height:1">CHUKU CROSS GYM</p>
        <p style="margin:6px 0 0;color:var(--gris);font-size:.86rem">Cdla. Jaime Roldós, Muro de Berlín<br>El Triunfo · Guayas · Ecuador</p>
      </div>
    </div>
    <div>
      <h4>La web</h4>
      <a href="#evento">Evento 09.08.2026</a>
      <a href="#gym-dentro">El gym</a>
      <a href="#nosotros">Quiénes somos</a>
      <a href="#planes">Membresías</a>
      <a href="#contacto">Contacto</a>
    </div>
    <div>
      <h4>Síguenos</h4>
      <a data-social="igGym" href="#">Instagram del gym</a>
      <a data-social="igCoach" href="#">Instagram del coach</a>
      <a data-social="tiktok" href="#">TikTok</a>
      <a href="#" data-wa data-wa-msg="Hola, quiero información del Chuku Cross Gym.">WhatsApp</a>
    </div>
  </div>
  <p class="pie__legal">© <span id="anio">2026</span> Chuku Cross Gym · Coach Anthony Ramires</p>
</footer>

<a class="flota" href="#" data-wa data-wa-msg="Hola, quiero información del Chuku Cross Gym." aria-label="Escribir por WhatsApp">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.13c-.25.69-1.44 1.32-1.99 1.4-.53.08-1.19.11-1.92-.12-.44-.14-1.01-.33-1.74-.64-3.06-1.32-5.06-4.4-5.21-4.6-.15-.2-1.24-1.65-1.24-3.15s.79-2.24 1.07-2.55c.28-.31.61-.38.81-.38h.58c.19 0 .44-.07.69.53.25.6.86 2.1.94 2.25.08.15.13.33.02.53-.1.2-.15.33-.3.5-.15.18-.32.39-.45.53-.15.15-.31.31-.13.61.18.3.79 1.3 1.69 2.11 1.16 1.03 2.14 1.35 2.44 1.5.3.15.48.13.66-.08.18-.2.76-.89.96-1.19.2-.3.4-.25.68-.15.28.1 1.77.83 2.07.99.3.15.5.22.58.35.07.13.07.74-.18 1.43Z"/></svg>
  <span>Escríbenos</span>
</a>
```

- [ ] **Step 3: Cablear horario, correo y año en `app.js`**

```js
  // --- datos que salen de CONFIG ---
  const hs = document.getElementById('horario-semana');
  const hsab = document.getElementById('horario-sabado');
  if (hs) hs.textContent = CONFIG.horario.semana;
  if (hsab) hsab.textContent = CONFIG.horario.sabado;

  const correo = document.getElementById('correo');
  if (correo) { correo.textContent = CONFIG.correo; correo.href = 'mailto:' + CONFIG.correo; }

  const anio = document.getElementById('anio');
  if (anio) anio.textContent = String(new Date().getFullYear());
```

- [ ] **Step 4: Verificar en el navegador**

Expected: mapa en escala de grises a la derecha, datos a la izquierda con el horario correcto en dos líneas (`Lun a Vie · 7:00–12:00 y 16:00–21:00` y `Sáb · 8:00–12:00`), correo enlazado como `mailto:`, pie de tres columnas, botón flotante naranja abajo a la derecha. **En ningún lugar debe aparecer el domingo.**

- [ ] **Step 5: Verificar que el CTA de la fase `hoy` funciona**

Cambiar temporalmente `CONFIG.evento.inicio` a un instante de hace una hora, recargar y pulsar "Cómo llegar".
Expected: la página baja hasta `#ubicacion`. **Restaurar la fecha original.**

---

### Task 10: Responsive, movimiento reducido y verificación final

**Files:**
- Modify: `styles.css`
- Modify: `app.js`
- Modify: `index.html` (solo la línea de `.panel__marca` si no hay `leon.png`)

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: entrega final.

- [ ] **Step 1: Añadir el CSS responsive**

```css
@media (max-width:1023px){
  .contador{display:none}
  .panel{min-height:90vh}
  .banda,.loc{grid-template-columns:1fr}
  .banda--invertida .banda__foto{order:0}
  .banda__foto{min-height:52vh}
  .galeria{grid-template-columns:repeat(2,1fr);grid-auto-rows:160px}
  .galeria .ancha{grid-column:span 2}
  .galeria .alta{grid-row:span 1}
  .pie__in{grid-template-columns:1fr 1fr}
  .pie__marca{grid-column:1 / -1}
}
@media (max-width:900px){
  .nav__links{position:fixed;inset:var(--nav-h) 0 auto 0;background:var(--carbon);
    flex-direction:column;align-items:flex-start;gap:0;padding:20px 4vw 30px;
    border-bottom:1px solid rgba(239,233,222,.14);display:none}
  .nav__links.abierto{display:flex}
  .nav__links a{padding:15px 0;font-size:1.05rem;width:100%}
  .burger{display:block}
}
@media (max-width:639px){
  .actos{scroll-snap-type:none}
  .panel{min-height:85vh;padding-top:calc(var(--nav-h) + 26px)}
  .form{grid-template-columns:1fr}
  .galeria{grid-template-columns:1fr;grid-auto-rows:200px}
  .galeria .ancha{grid-column:span 1}
  .pie__in{grid-template-columns:1fr}
  .banda__txt{padding:34px 5vw 44px}
  .cita{font-size:1.3rem}
}
@media (prefers-reduced-motion: reduce){
  html{scroll-behavior:auto}
  .actos{scroll-snap-type:none}
  *,*::before,*::after{animation-duration:.01ms !important;transition-duration:.01ms !important}
  .galeria figure:hover img{transform:none}
}
```

- [ ] **Step 2: Resolver el respaldo de imágenes faltantes**

Añadir a `app.js` antes del cierre de la IIFE:

```js
  // --- si una foto no existe, se quita y queda el marco con su etiqueta ---
  document.querySelectorAll('.banda__foto img, .galeria img, .panel__bg img').forEach(function (img) {
    img.addEventListener('error', function () { img.remove(); });
  });
```

Y en `styles.css`, si `assets/leon.png` aún no existe, comentar la regla `.panel__marca` completa para no pedir un archivo inexistente.

- [ ] **Step 3: Verificar en tres anchos**

En DevTools, probar 1440px, 900px y 375px. Expected:
- **1440px:** contador visible, bandas a dos columnas, galería 4 columnas, paneles a 100vh con snap.
- **900px:** contador oculto, hamburguesa visible y funcional, bandas apiladas, galería 2 columnas.
- **375px:** sin snap (el scroll es libre), formulario en una columna, botón flotante circular sin texto, ningún desbordamiento horizontal.

Comprobar en cada ancho: `document.documentElement.scrollWidth <= window.innerWidth` → Expected: `true`.

- [ ] **Step 4: Verificar movimiento reducido**

En DevTools → Rendering → *Emulate CSS prefers-reduced-motion: reduce*, recargar.
Expected: sin desplazamiento suave, sin snap, sin zoom en hover de galería. La regresiva sigue mostrando valores correctos pero se actualiza cada minuto en vez de cada segundo.

- [ ] **Step 5: Verificar accesibilidad de teclado**

Recorrer toda la página solo con Tab. Expected: contorno naranja visible en cada elemento interactivo, la hamburguesa abre y cierra con Enter, el formulario se llena y envía sin ratón, y el foco entra al campo con error tras un envío inválido.

- [ ] **Step 6: Verificación final**

Run: `node test.js`
Expected: `✓ estadoEvento` y `✓ mensajeWhatsApp`

Run: `grep -rn "Churu" index.html styles.css app.js logic.js`
Expected: sin resultados (la marca es Chuku, nunca Churu).

Run: `grep -rniE "domingo|\\$[0-9]" index.html`
Expected: sin resultados (ni domingo, ni precios en la página).

Confirmar en DevTools → Network que no se carga ninguna librería de terceros aparte de Google Fonts y el iframe de Maps.

---

## Insumos que el usuario debe entregar

Al terminar el plan, la página funciona completa. Estos insumos solo mejoran lo que ya está:

| Insumo | Dónde entra | Sin él |
|---|---|---|
| `assets/gym-01…05.jpg`, `assets/coach.jpg` | Galería, bandas y panel del gym | Marcos sólidos con la etiqueta del área |
| `assets/leon.png` (fondo transparente) | `.panel__marca` del panel del coach | La regla queda comentada |
| TikTok | `CONFIG.tiktok` | El enlace no se pinta |
