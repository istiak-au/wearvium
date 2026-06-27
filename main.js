/* =========================================================================
   WEARVIUM — shared scripts
   ========================================================================= */
(function () {
  'use strict';

  /* ---------- the range grid (home + products) ---------- */
  var RANGE = [
    {name:"Tops / knitwear",        meta:"01", img:"1576566588028-4147f3842f27"},
    {name:"Shirting / polos",       meta:"02", img:"1602810318383-e386cc2a3ccf"},
    {name:"Tailoring / blazers",    meta:"03", img:"1507003211169-0a1dd7228f2d"},
    {name:"Bottoms / trousers",     meta:"04", img:"1594633312681-425c7b97ccd1"},
    {name:"Outerwear / softshell",  meta:"05", img:"1591047139829-d91aecb6caea"},
    {name:"Workwear / hi-vis",      meta:"06", img:"1495385794356-15371f348c31"},
    {name:"Healthcare / hospitality",meta:"07", img:"1539008835657-9e8e9680c956"},
    {name:"Headwear / accessories", meta:"08", img:"1584917865442-de89df76afd3"}
  ];
  function imgUrl(id, w){ return 'https://images.unsplash.com/photo-' + id + '?w=' + (w||700) + '&q=80&auto=format&fit=crop'; }

  var grid = document.getElementById('rangeGrid');
  if (grid) {
    grid.innerHTML = RANGE.map(function (p, i) {
      return '<a class="card" href="products.html">' +
        '<div class="card-media">' +
          '<span class="gi">' + p.meta + '</span>' +
          '<img data-fallback data-seed="' + (i + 6) + '" alt="' + p.name + '" src="' + imgUrl(p.img) + '">' +
          '<span class="quick">View range →</span>' +
        '</div>' +
        '<div class="card-info"><div><h3>' + p.name + '</h3></div></div>' +
      '</a>';
    }).join('');
  }

  /* ---------- graceful image fallback ---------- */
  function attachFallback(img) {
    img.addEventListener('error', function () {
      if (img.dataset.failed) return;
      img.dataset.failed = '1';
      var tones = [90, 86, 82, 88, 84, 80];
      var t = tones[(parseInt(img.dataset.seed || '0', 10)) % tones.length];
      img.style.background = 'linear-gradient(135deg,hsl(0 0% ' + t + '%),hsl(0 0% ' + (t - 8) + '%))';
      img.removeAttribute('src');
      img.classList.add('is-fallback');
    }, { once: true });
  }
  document.querySelectorAll('img[data-fallback]').forEach(attachFallback);

  /* ---------- mobile menu ---------- */
  var mm = document.getElementById('mobileMenu');
  var mt = document.getElementById('menuToggle');
  var menuOpen = false;
  function closeMenu() { menuOpen = false; if (mm) mm.classList.remove('open'); if (mt) mt.textContent = 'Menu'; document.body.style.overflow = ''; }
  if (mt && mm) {
    mt.onclick = function () { menuOpen = !menuOpen; mm.classList.toggle('open', menuOpen); mt.textContent = menuOpen ? 'Close' : 'Menu'; document.body.style.overflow = menuOpen ? 'hidden' : ''; };
    mm.querySelectorAll('a').forEach(function (a) { a.onclick = closeMenu; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- reveals ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function showAll(sel) { document.querySelectorAll(sel).forEach(function (el) { el.classList.add('in'); }); }
  if (reduce || !('IntersectionObserver' in window)) {
    showAll('.reveal'); showAll('.obs');
  } else {
    window.addEventListener('load', function () { showAll('.reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.obs').forEach(function (el) { io.observe(el); });
  }

  /* ---------- nav background solidifies on scroll ---------- */
  var hdr = document.querySelector('header');
  if (hdr) {
    addEventListener('scroll', function () { hdr.style.background = scrollY > 40 ? 'rgba(255,255,255,.94)' : 'rgba(255,255,255,.82)'; }, { passive: true });
  }

  /* ---------- year ---------- */
  var y = document.getElementById('yr');
  if (y) y.textContent = new Date().getFullYear();

  /* =======================================================================
     QUOTE FORM (contact page)
     Works on day one via a mailto: handoff. To capture submissions in an
     inbox later, paste a Formspree endpoint below — no other change needed.
     ===================================================================== */
  var FORMSPREE_ENDPOINT = ''; // e.g. 'https://formspree.io/f/xxxxxxx'
  var TO_EMAIL = 'info@wearvium.com';

  var form = document.getElementById('quote-form');
  if (form) {
    var params = new URLSearchParams(window.location.search);
    function setVal(id, v) {
      var el = document.getElementById(id);
      if (!el || !v) return;
      if (el.tagName === 'SELECT') {
        Array.prototype.forEach.call(el.options, function (o) {
          if (o.value.toLowerCase() === v.toLowerCase()) el.value = o.value;
        });
      } else { el.value = v; }
    }
    setVal('interest', params.get('interest'));
    setVal('industry', params.get('industry'));
    var forItem = params.get('for');
    if (forItem) {
      var msg0 = document.getElementById('message');
      if (msg0 && !msg0.value) msg0.value = 'Product of interest: ' + forItem + '\n\n';
    }

    function field(id) { return document.getElementById(id).closest('.field'); }
    function val(id) { return (document.getElementById(id).value || '').trim(); }
    function showErr(id, on) { field(id).classList.toggle('invalid', !!on); }

    function validate() {
      var ok = true;
      ['name', 'company', 'email', 'message'].forEach(function (id) {
        var v = val(id), bad = !v;
        if (id === 'email') bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        showErr(id, bad); if (bad) ok = false;
      });
      return ok;
    }

    ['name', 'company', 'email', 'message'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', function () { if (field(id).classList.contains('invalid')) showErr(id, false); });
    });

    var status = document.getElementById('form-status');
    function say(t) { if (status) { status.textContent = t; status.classList.add('show'); } }

    function buildBody() {
      return [
        'New enquiry from the Wearvium website', '',
        'Name:      ' + val('name'),
        'Company:   ' + val('company'),
        'Email:     ' + val('email'),
        'Interest:  ' + val('interest'),
        'Industry:  ' + val('industry'),
        'Quantity:  ' + val('quantity'),
        'Country:   ' + val('country'),
        'Deadline:  ' + val('deadline'), '',
        'Brief:',
        val('message')
      ].join('\n');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) { say('Please complete the highlighted fields so we can reply with clear next steps.'); return; }
      var subject = 'Quote enquiry — ' + (val('company') || val('name'));
      if (FORMSPREE_ENDPOINT) {
        say('Sending your enquiry…');
        var data = new FormData(form);
        data.append('_subject', subject);
        fetch(FORMSPREE_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
          .then(function (r) { if (r.ok) { form.reset(); say('Thanks — your enquiry is in. We\u2019ll reply with clear next steps.'); } else { throw new Error(); } })
          .catch(function () { say('Something went wrong sending the form. Email us directly at ' + TO_EMAIL + '.'); });
      } else {
        window.location.href = 'mailto:' + TO_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(buildBody());
        say('Your email app is opening with the details filled in. If nothing happens, email us at ' + TO_EMAIL + '.');
      }
    });
  }
})();
