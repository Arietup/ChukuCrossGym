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
      '<p class="sr-solo" id="cuenta-resumen" aria-live="polite"></p>' +
      '<div class="panel__cta">' + TEXTOS.antes.cta + '</div>';
    actualizarResumen(e);
  }

  // el resumen para lector de pantalla solo se reescribe si el texto cambió,
  // si no cada tick de 1s reactivaría el aria-live y ahogaría al lector
  function actualizarResumen(e) {
    const p = document.getElementById('cuenta-resumen');
    if (!p) return;
    const texto = resumenRegresiva(e);
    if (p.textContent !== texto) p.textContent = texto;
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
        actualizarResumen(e);
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

  // --- redes: un enlace vacío se oculta en vez de apuntar a la nada ---
  document.querySelectorAll('[data-social]').forEach(function (a) {
    const url = CONFIG[a.getAttribute('data-social')];
    if (!url) { a.remove(); return; }
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
  });
})();
