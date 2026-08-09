const assert = require('node:assert/strict');
const { estadoEvento, mensajeWhatsApp, resumenRegresiva } = require('./logic.js');

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

// resumenRegresiva: frase para el lector de pantalla, solo cambia por umbral
const resumenCasos = [
  [{ fase: 'antes', d: 2,  h: 5,  m: 10, s: 0  }, 'Faltan 2 días para el conversatorio'],
  [{ fase: 'antes', d: 1,  h: 0,  m: 0,  s: 0  }, 'Falta 1 día para el conversatorio'],
  [{ fase: 'antes', d: 0,  h: 11, m: 30, s: 0  }, 'Faltan 11 horas para el conversatorio'],
  [{ fase: 'antes', d: 0,  h: 1,  m: 0,  s: 0  }, 'Falta 1 hora para el conversatorio'],
  [{ fase: 'antes', d: 0,  h: 0,  m: 23, s: 45 }, 'Faltan 23 minutos para el conversatorio'],
  [{ fase: 'antes', d: 0,  h: 0,  m: 1,  s: 0  }, 'Falta 1 minuto para el conversatorio'],
  [{ fase: 'antes', d: 0,  h: 0,  m: 0,  s: 37 }, 'El conversatorio empieza en menos de un minuto']
];
for (const [e, esperado] of resumenCasos) {
  assert.equal(resumenRegresiva(e), esperado, JSON.stringify(e));
}

// las fases hoy y pasado no tienen regresiva que anunciar
assert.equal(resumenRegresiva({ fase: 'hoy', d: 0, h: 0, m: 0, s: 0 }), '');
assert.equal(resumenRegresiva({ fase: 'pasado', d: 0, h: 0, m: 0, s: 0 }), '');

console.log('✓ resumenRegresiva');

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
