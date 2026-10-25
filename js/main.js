/* Воск и Треск — интерактив лендинга */
(function () {
  'use strict';
  var doc = document, body = doc.body, root = doc.documentElement;
  var TG = 'https://t.me/borisenkaaa';
  var IG = 'https://ig.me/m/voskitresk';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function rub(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽'; }

  /* ---------- Шапка ---------- */
  var header = $('.header'), hero = $('.hero');
  function onScroll() {
    var limit = hero ? hero.offsetHeight - 80 : 40;
    header.classList.toggle('is-solid', window.pageYOffset > limit);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Бургер ---------- */
  var burger = $('.burger'), nav = $('#nav');
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    body.classList.toggle('no-scroll', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }
  burger.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  window.addEventListener('resize', function () { if (window.innerWidth > 900) setMenu(false); });

  /* ---------- Свеча на первом экране ---------- */
  var candle = $('.candle');
  if (candle) {
    candle.addEventListener('click', function () {
      var lit = !root.classList.contains('is-lit');
      root.classList.toggle('is-lit', lit);
      candle.setAttribute('aria-pressed', lit ? 'true' : 'false');
      candle.setAttribute('aria-label', lit ? 'Погасить свечу' : 'Зажечь свечу');
    });
  }

  /* ---------- Слайдеры ---------- */
  function initSlider(el) {
    var track = $('[data-track]', el), prev = $('[data-prev]', el), next = $('[data-next]', el), bar = $('[data-bar]', el);
    function items() { return $$(':scope > *:not(.is-hidden)', track); }
    function step() {
      var it = items()[0];
      if (!it) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 16;
      var per = Math.max(1, Math.floor((track.clientWidth + gap) / (it.offsetWidth + gap)) - 1);
      return (it.offsetWidth + gap) * per;
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth;
      var x = track.scrollLeft;
      prev.disabled = x <= 2;
      next.disabled = x >= max - 2;
      var ratio = track.scrollWidth ? track.clientWidth / track.scrollWidth : 1;
      var w = Math.min(100, Math.max(12, ratio * 100));
      bar.style.width = w + '%';
      var p = max > 0 ? x / max : 0;
      bar.style.transform = 'translateX(' + (p * (100 / w * 100 - 100)) + '%)';
    }
    function go(dir) { track.scrollBy({ left: dir * step(), behavior: reduceMotion ? 'auto' : 'smooth' }); }
    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    // перетаскивание мышью на десктопе
    var down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('mousedown', function (e) { down = true; moved = false; sx = e.pageX; sl = track.scrollLeft; track.style.scrollSnapType = 'none'; });
    window.addEventListener('mousemove', function (e) {
      if (!down) return;
      var dx = e.pageX - sx;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = sl - dx;
    });
    window.addEventListener('mouseup', function () { if (!down) return; down = false; track.style.scrollSnapType = ''; });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });
    window.addEventListener('resize', update);
    update();
    return { update: update, track: track };
  }
  // :scope не поддерживается в старых браузерах — запасной вариант
  try { doc.querySelector(':scope'); } catch (e) {
    $$ = function (s, c) {
      if (s.indexOf(':scope > ') === 0 && c) {
        return Array.prototype.filter.call(c.children, function (n) { return !n.classList.contains('is-hidden'); });
      }
      return Array.prototype.slice.call((c || doc).querySelectorAll(s));
    };
  }
  var sliders = $$('[data-slider]').map(initSlider);
  var catalogSlider = sliders[0];

  /* ---------- Фильтр каталога ---------- */
  var pills = $$('[data-filter]');
  function applyFilter(f) {
    pills.forEach(function (p) {
      var on = p.getAttribute('data-filter') === f;
      p.classList.toggle('is-active', on);
      p.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    $$('.card').forEach(function (c) {
      c.classList.toggle('is-hidden', f !== 'all' && c.getAttribute('data-cat') !== f);
    });
    catalogSlider.track.scrollLeft = 0;
    catalogSlider.update();
  }
  pills.forEach(function (p) { p.addEventListener('click', function () { applyFilter(p.getAttribute('data-filter')); }); });
  $$('[data-goto-filter]').forEach(function (b) {
    b.addEventListener('click', function () {
      applyFilter(b.getAttribute('data-goto-filter'));
      $('#catalog').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Карточки ---------- */
  $$('.card').forEach(function (card) {
    var moodBtn = $('.card__mood-btn', card);
    moodBtn.addEventListener('click', function () {
      var on = !card.classList.contains('show-mood');
      card.classList.toggle('show-mood', on);
      moodBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      moodBtn.textContent = on ? 'Свеча' : 'Настроение';
    });
    var addBtn = $('[data-add-card]', card), out = $('[data-price-out]', card);
    $$('.size button', card).forEach(function (b, i, all) {
      b.addEventListener('click', function () {
        all.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); });
        out.textContent = rub(b.getAttribute('data-price')).replace(' ₽', '');
        addBtn.setAttribute('data-size', b.getAttribute('data-size'));
        addBtn.setAttribute('data-price', b.getAttribute('data-price'));
      });
    });
    addBtn.addEventListener('click', function () {
      bagAdd({
        id: card.getAttribute('data-id'),
        name: card.getAttribute('data-name'),
        size: addBtn.getAttribute('data-size'),
        price: +addBtn.getAttribute('data-price')
      });
      addBtn.classList.add('is-added');
      addBtn.textContent = 'Добавлено';
      setTimeout(function () { addBtn.classList.remove('is-added'); addBtn.textContent = 'В заказ'; }, 1600);
    });
  });
  $$('[data-add]').forEach(function (b) {
    b.addEventListener('click', function () {
      var card = $('.card[data-id="' + b.getAttribute('data-add') + '"]');
      if (card) $('[data-add-card]', card).click();
    });
  });

  /* ---------- Заказ ---------- */
  var KEY = 'voskitresk-bag';
  var bag = [];
  try { bag = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { bag = []; }
  var bagEl = $('#bag'), list = $('[data-bag-list]'), empty = $('[data-bag-empty]'), foot = $('[data-bag-foot]'),
      totalEl = $('[data-bag-total]'), counters = $$('[data-bag-count]'), toastEl = $('[data-toast]'), lastFocus = null;

  function save() { try { localStorage.setItem(KEY, JSON.stringify(bag)); } catch (e) {} }
  function count() { return bag.reduce(function (s, i) { return s + i.qty; }, 0); }
  function total() { return bag.reduce(function (s, i) { return s + i.qty * i.price; }, 0); }
  function render() {
    counters.forEach(function (c) { c.textContent = count(); });
    list.innerHTML = '';
    bag.forEach(function (it, idx) {
      var li = doc.createElement('li');
      li.className = 'bag__item';
      li.innerHTML = '<img src="img/p-' + it.id + '.jpg" alt="" width="56" height="64">' +
        '<div><b></b><small></small></div>' +
        '<div class="qty"><button type="button" aria-label="Убрать одну">−</button><span></span><button type="button" aria-label="Добавить ещё">+</button></div>';
      $('b', li).textContent = it.name;
      $('small', li).textContent = it.size + ', ' + rub(it.price);
      $('.qty span', li).textContent = it.qty;
      var btns = $$('.qty button', li);
      btns[0].addEventListener('click', function () { it.qty--; if (it.qty < 1) bag.splice(idx, 1); save(); render(); });
      btns[1].addEventListener('click', function () { it.qty++; save(); render(); });
      list.appendChild(li);
    });
    var has = bag.length > 0;
    empty.hidden = has; foot.hidden = !has; list.hidden = !has;
    totalEl.textContent = rub(total());
  }
  function bagAdd(item) {
    var found = bag.filter(function (i) { return i.id === item.id && i.size === item.size; })[0];
    if (found) found.qty++; else { item.qty = 1; bag.push(item); }
    save(); render();
    counters.forEach(function (c) { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); });
    toast('«' + item.name.replace(/[«»]/g, '').replace('Аромасаше ', '') + '» в заказе');
  }
  function openBag() {
    lastFocus = doc.activeElement;
    setMenu(false);
    bagEl.hidden = false;
    body.classList.add('no-scroll');
    requestAnimationFrame(function () { requestAnimationFrame(function () { bagEl.classList.add('is-open'); }); });
    setTimeout(function () { $('.bag__close', bagEl).focus(); }, 50);
  }
  function closeBag() {
    bagEl.classList.remove('is-open');
    body.classList.remove('no-scroll');
    setTimeout(function () { bagEl.hidden = true; if (lastFocus) lastFocus.focus(); }, reduceMotion ? 0 : 340);
  }
  $$('[data-open-bag]').forEach(function (b) { b.addEventListener('click', openBag); });
  $$('[data-close-bag]').forEach(function (b) { b.addEventListener('click', closeBag); });
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!bagEl.hidden) closeBag(); else if (root.classList.contains('menu-open')) setMenu(false);
  });
  // удержание фокуса внутри панели
  bagEl.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var f = $$('button, a[href]', bagEl).filter(function (n) { return n.offsetParent !== null; });
    if (!f.length) return;
    if (e.shiftKey && doc.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && doc.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });

  function orderText() {
    var lines = bag.map(function (i) { return '— ' + i.name + ', ' + i.size + ' × ' + i.qty + ' = ' + rub(i.qty * i.price); });
    return 'Здравствуйте! Хочу заказать:\n' + lines.join('\n') + '\nИтого: ' + rub(total()) + '\nДоставка по Красноярску / самовывоз — подскажите, как удобнее.';
  }
  function legacyCopy(text) {
    var ta = doc.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.top = '-1000px'; ta.style.fontSize = '16px';
    body.appendChild(ta);
    var range = doc.createRange(); range.selectNodeContents(ta);
    var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    ta.setSelectionRange(0, text.length);
    var ok = false; try { ok = doc.execCommand('copy'); } catch (e) {}
    body.removeChild(ta);
    return ok;
  }
  $$('[data-send]').forEach(function (b) {
    b.addEventListener('click', function () {
      var url = b.getAttribute('data-send') === 'tg' ? TG : IG;
      // открываем окно сразу, чтобы Safari не заблокировал всплывающее окно
      var text = orderText();
      // копируем синхронно, пока страница в фокусе, затем открываем мессенджер
      var ok = legacyCopy(text);
      if (!ok && navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { toast('Заказ скопирован — вставьте его в сообщение'); }, function () {});
      }
      toast(ok ? 'Заказ скопирован — вставьте его в сообщение' : 'Перечислите ароматы в сообщении — мы ответим');
      var w = window.open(url, '_blank');
      if (w) { try { w.opener = null; } catch (e) {} } else { window.location.href = url; }
    });
  });

  var tt;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(tt);
    tt = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2600);
  }

  /* ---------- Карта ---------- */
  var map = $('[data-map]');
  $$('.point').forEach(function (p, i, all) {
    p.addEventListener('click', function () {
      all.forEach(function (x) { x.classList.toggle('is-active', x === p); });
      map.src = 'https://yandex.ru/map-widget/v1/?text=' + encodeURIComponent(p.getAttribute('data-q')) + '&z=16';
      if (window.innerWidth <= 900) map.parentNode.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    });
  });

  render();
})();
