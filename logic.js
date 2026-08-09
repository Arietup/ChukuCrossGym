// Funciones puras. Sin DOM: por eso se pueden probar con Node.

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
