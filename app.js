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
