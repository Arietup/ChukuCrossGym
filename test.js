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
