import { syncSoTicket } from './soticket.js';
import { EVENTS, INFO, ROOM, BILLETTERIE, CONTENT, NOCUT, img, srcset } from './data.js';
const cut = n => n && !NOCUT.includes(n) ? `assets/img/cut/${n}.webp` : null;

/* ============ Utils ============ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const store = {
  get(k, d) { try { const v = localStorage.getItem('duc:' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('duc:' + k, JSON.stringify(v)); } catch { /* storage indisponible */ } },
};
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const NOW = new Date();
const toDate = (d, t = '00:00') => new Date(`${d}T${t}:00`);
const todayISO = () => { const n = NOW; return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`; };
const addDays = (iso, n) => { const d = toDate(iso, '12:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const fmt = {
  wd: iso => toDate(iso, '12:00').toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''),
  wdLong: iso => toDate(iso, '12:00').toLocaleDateString('fr-FR', { weekday: 'long' }),
  day: iso => toDate(iso, '12:00').getDate(),
  mon: iso => toDate(iso, '12:00').toLocaleDateString('fr-FR', { month: 'short' }).replace('.', ''),
  monLong: iso => toDate(iso, '12:00').toLocaleDateString('fr-FR', { month: 'long' }),
  full: iso => toDate(iso, '12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
  time: t => t,
  eur: n => `${n} €`,
};
const relDay = iso => iso === todayISO() ? 'Ce soir' : iso === addDays(todayISO(), 1) ? 'Demain' : fmt.full(iso);
const isPast = (d, t) => toDate(d, t) < NOW;
const setState = (d, s) => isPast(d, s.t) ? 'past' : s.s;
const STATUS = { ok: 'Réserver', last: 'Dernières places', full: 'Complet', door: 'Guichet', past: 'Passé' };
const bookable = st => st === 'ok' || st === 'last';
const byId = id => EVENTS.find(e => e.id === id);
const title = e => e.sub && !e.jam ? `${e.title} — ${e.sub}` : e.jam ? `${e.title} · ${e.sub}` : e.title;

/* every (event, date) occurrence, sorted */
const OCC = EVENTS.flatMap(e => e.dates.map(dt => ({ e, d: dt.d, sets: dt.sets })))
  .sort((a, b) => a.d.localeCompare(b.d) || a.sets[0].t.localeCompare(b.sets[0].t));
const upcoming = () => OCC.filter(o => o.sets.some(s => !isPast(o.d, s.t)));
const nextBookable = (pred = () => true) => {
  for (const o of OCC) {
    if (o.e.jam || !pred(o)) continue;
    const s = o.sets.find(s => bookable(setState(o.d, s)));
    if (s) return { ...o, set: s };
  }
  return null;
};
const posterVariant = e => ['', 'v2', 'v3'][[...e.id].reduce((a, c) => a + c.charCodeAt(0), 0) % 3];
const posterPos = e => { const h = [...e.id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 997, 7); return `--px:${20 + h % 60}%;--py:${15 + (h >> 2) % 55}%`; };

/* ============ Fragments ============ */
const media = (e, sizes = '(max-width: 700px) 100vw, 33vw', eager = false) => e.img
  ? `<img src="${img(e.img, 480)}" srcset="${srcset(e.img)}" sizes="${sizes}" alt="${esc(e.title)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="480" height="360">`
  : `<div class="poster ${posterVariant(e)}" style="${posterPos(e)}" aria-hidden="true"><strong>${esc(e.jam ? 'Jam du Duc' : e.title)}</strong></div>`;

const chip = (e, d, s) => {
  const st = setState(d, s);
  const label = e.jam ? 'Entrée libre' : STATUS[st];
  const attrs = bookable(st)
    ? `data-book="${e.id}" data-d="${d}" data-t="${s.t}" aria-label="Réserver ${esc(e.title)}, ${fmt.full(d)} à ${fmt.time(s.t)}"`
    : st === 'full' ? `data-wait="${e.id}" data-d="${d}" data-t="${s.t}" aria-label="${esc(e.title)} ${fmt.time(s.t)} complet — liste d'attente"`
    : `aria-disabled="true"`;
  return `<button type="button" class="set is-${st}" ${attrs}><b>${fmt.time(s.t)}</b><small>${label}</small></button>`;
};
const chips = o => `<div class="sets">${o.sets.map(s => chip(o.e, o.d, s)).join('')}</div>`;
const tagHtml = e => `<span class="tag ${e.jam ? 'is-jam' : e.tag === 'Événement' || e.tag === 'All star' ? 'is-duc' : ''}">${esc(e.tag)}</span>`;
const link = e => `concert.html#${e.id}`;

const card = o => `
<article class="ev" data-reveal>
  <a class="ev-media" href="${link(o.e)}" tabindex="-1" aria-hidden="true">${media(o.e)}${tagHtml(o.e)}
    <span class="ev-date"><b class="num">${fmt.day(o.d)}</b><span>${fmt.wd(o.d)} ${fmt.mon(o.d)}</span></span></a>
  <div class="ev-body">
    <h3><a href="${link(o.e)}">${esc(o.e.jam ? `Jam du Duc · ${o.e.sub}` : o.e.title)}</a></h3>
    <p class="meta">${o.e.price ? `dès ${o.e.price - 7} €` : 'Entrée libre'}</p>
  </div>
  ${chips(o)}
</article>`;

const RT_BG = ['var(--sapphire)', 'var(--cyan)', 'var(--jade)'];
const rowThumb = (e, i = 0) => cut(e.img)
  ? `<a class="rt" href="${link(e)}" tabindex="-1" aria-hidden="true" style="background:${RT_BG[[...e.id].reduce((a, c) => a + c.charCodeAt(0), 0) % 3]}"><img src="${cut(e.img)}" alt="" loading="lazy" decoding="async"></a>`
  : `<a class="rt" href="${link(e)}" tabindex="-1" aria-hidden="true">${media(e, '140px')}</a>`;
const row = o => `
<div class="row" data-cut="${o.e.img || ''}" data-id="${o.e.id}" data-tag="${esc(norm(o.e.tag))}" data-search="${esc(norm(`${o.e.title} ${o.e.sub || ''} ${o.e.tag}`))}" data-month="${o.d.slice(0, 7)}" data-avail="${o.sets.some(s => bookable(setState(o.d, s))) ? 1 : 0}">
  ${rowThumb(o.e)}
  <div class="row-date"><b class="num">${String(fmt.day(o.d)).padStart(2, '0')}</b><span>${fmt.wd(o.d)} ${fmt.mon(o.d)}</span></div>
  <div class="row-main"><h3><a href="${link(o.e)}">${esc(o.e.jam ? `Jam du Duc · ${o.e.sub}` : o.e.title)}</a></h3>
    <p class="meta">${esc(o.e.tag)}${o.e.price ? ` · ${o.e.price} €` : ' · entrée libre'}${(CONTENT[o.e.id] || {}).yt ? ' <span class="has-vid"><i aria-hidden="true"><svg viewBox="0 0 10 10"><path d="M3 2l5 3-5 3z" fill="currentColor"/></svg></i>Vidéo</span>' : ''}</p></div>
  ${chips(o)}
</div>`;

/* ============ Header / menu ============ */
function header() {
  const h = $('.hdr'); if (!h) return;
  const onScroll = () => h.classList.toggle('is-solid', scrollY > 24);
  onScroll(); addEventListener('scroll', onScroll, { passive: true });
  const b = $('.burger'), m = $('.menu');
  b?.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', open); m.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && m?.classList.contains('is-open')) b.click(); });
}

/* ============ Toast ============ */
function toast(msg) {
  let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
  t.textContent = msg; t.classList.add('is-on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('is-on'), 3200);
}

/* ============ Lottie (chargé à la demande) ============ */
let lottieP;
const lottieLib = () => lottieP ||= new Promise((res, rej) => {
  if (window.lottie) return res(window.lottie);
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie_light.min.js';
  s.async = true; s.onload = () => res(window.lottie); s.onerror = rej; document.head.append(s);
});
async function playLottie(el, name, { loop = true } = {}) {
  try {
    const lottie = await lottieLib();
    el.innerHTML = '';
    const a = lottie.loadAnimation({ container: el, renderer: 'svg', loop, autoplay: !reduce, path: `assets/lottie/${name}.json` });
    if (reduce) a.addEventListener('DOMLoaded', () => a.goToAndStop(a.totalFrames - 1, true));
    return a;
  } catch { return null; }
}
function lazyLotties() {
  const els = $$('[data-lottie]'); if (!els.length) return;
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return; io.unobserve(en.target);
    playLottie(en.target, en.target.dataset.lottie);
  }), { rootMargin: '100px' });
  els.forEach(e => io.observe(e));
}

/* ============ Booking sheet (1 clic) ============ */
const ICON_X = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg>';
const sheet = {
  el: null, st: {},
  build() {
    const d = document.createElement('dialog');
    d.className = 'sheet'; d.setAttribute('aria-labelledby', 'sh-title');
    document.body.append(d); this.el = d;
    d.addEventListener('click', e => { if (e.target === d) this.close(); });
    d.addEventListener('cancel', e => { e.preventDefault(); this.close(); });
    // swipe down to dismiss (mobile)
    let y0 = null, t0 = 0;
    d.addEventListener('pointerdown', e => { if (e.target.closest('.grab, .sh-head') && innerWidth < 900) { y0 = e.clientY; t0 = performance.now(); d.setPointerCapture(e.pointerId); d.style.transition = 'none'; } });
    d.addEventListener('pointermove', e => { if (y0 === null) return; const dy = e.clientY - y0; d.style.transform = `translateY(${dy > 0 ? dy : dy * .2}px)`; });
    d.addEventListener('pointerup', e => {
      if (y0 === null) return; const dy = e.clientY - y0, v = Math.abs(dy) / (performance.now() - t0); y0 = null;
      d.style.transition = ''; d.style.transform = '';
      if (dy > 120 || (dy > 20 && v > .11)) this.close();
    });
  },
  open(id, d, t) {
    if (!this.el) this.build();
    const e = byId(id); if (!e) return;
    const prefs = store.get('prefs', { qty: 2, rate: 'plein' });
    this.st = { e, d, t, qty: prefs.qty, rate: prefs.rate, step: 'form' };
    this.render();
    if (!this.el.open) { this.el.classList.remove('is-closing'); this.el.showModal(); sheetIn(this.el); }
    $('.pay', this.el)?.focus({ preventScroll: true });
  },
  close() {
    const d = this.el; if (!d?.open) return;
    sheetOut(d).then(() => { d.close(); d.style.clipPath = ''; });
  },
  price() {
    const { e, rate } = this.st;
    return rate === 'jeune' ? e.price - 7 : rate === 'pjc' ? e.price - 3 : e.price;
  },
  render() {
    const { e, d, t, qty, rate, step } = this.st;
    const occ = e.dates.find(x => x.d === d);
    const user = store.get('user', null);
    const head = `<div class="grab" aria-hidden="true"></div>
      <div class="sh-head"><div class="sh-thumb">${media(e, '76px')}</div>
        <div><h3 id="sh-title">${esc(e.title)}</h3><p>${esc(e.sub || e.tag)}</p></div>
        <button class="x" type="button" data-close aria-label="Fermer">${ICON_X}</button></div>`;
    if (step === 'done') {
      const code = this.st.code;
      this.el.innerHTML = `<div class="sheet-in">${head}
        <div class="sh-success" role="status">
          <div class="lot" data-success></div>
          <p class="big">Réservé.</p>
          <div class="ticket"><b>${esc(e.title)}</b><span>${fmt.full(d)} · set de ${fmt.time(t)} · portes ${fmt.time(t === '19:30' ? '19:00' : t === '22:00' ? '21:30' : t === '19:00' ? '18:30' : '21:00')}</span>
            <span>${qty} place${qty > 1 ? 's' : ''} · placement libre assis</span>
            <div class="code"><span>N° ${code}</span><span class="num">${fmt.eur(this.price() * qty)}</span></div></div>
          <div class="row-btns"><a class="btn" href="${gcal(e, d, t)}" target="_blank" rel="noopener">Ajouter à l’agenda</a><a class="btn ghost" href="${INFO.maps}" target="_blank" rel="noopener">Itinéraire</a></div>
          <p class="fine">Billet envoyé à ${esc(user?.email || '')}. Métro Châtelet, sortie 10.</p>
        </div></div>`;
      playLottie($('[data-success]', this.el), 'ticket-success', { loop: false }); successIn(this.el);
      $('[data-close]', this.el).addEventListener('click', () => this.close());
      return;
    }
    const dateSeg = e.dates.length > 1 ? `<div><div class="sh-label">Date</div><div class="seg">${e.dates.map(x => {
      const any = x.sets.some(s => bookable(setState(x.d, s)));
      return `<button type="button" data-date="${x.d}" aria-pressed="${x.d === d}" ${any ? '' : 'disabled'}>${fmt.wd(x.d)} ${fmt.day(x.d)}<small>${fmt.mon(x.d)}</small></button>`;
    }).join('')}</div></div>` : `<p class="fine" style="font-size:.95rem;color:var(--fg)">${relDay(d) === 'Ce soir' ? 'Ce soir, ' : ''}${fmt.full(d)}</p>`;
    const setSeg = `<div><div class="sh-label">Set · 75 min</div><div class="seg">${occ.sets.map(s => {
      const st = setState(d, s);
      return `<button type="button" data-time="${s.t}" aria-pressed="${s.t === t}" ${bookable(st) ? '' : 'disabled'}>${fmt.time(s.t)}<small>${st === 'last' ? 'Dernières places' : st === 'ok' ? 'Disponible' : STATUS[st]}</small></button>`;
    }).join('')}</div></div>`;
    const rateSeg = `<div><div class="sh-label">Tarif</div><div class="seg">
      <button type="button" data-rate="plein" aria-pressed="${rate === 'plein'}">Plein<small>${e.price} €</small></button>
      <button type="button" data-rate="jeune" aria-pressed="${rate === 'jeune'}">−25 ans, étudiant<small>${e.price - 7} €</small></button>
      <button type="button" data-rate="pjc" aria-pressed="${rate === 'pjc'}">Paris Jazz Club<small>${e.price - 3} €</small></button></div></div>`;
    const who = user
      ? `<div class="express">Réservation express · ${esc(user.email)} <button type="button" data-forget>Changer</button></div>`
      : `<div class="field" style="margin:0"><label for="sh-mail">E-mail pour recevoir vos billets</label><input id="sh-mail" type="email" autocomplete="email" inputmode="email" placeholder="vous@exemple.fr" required></div>`;
    const total = this.price() * qty;
    this.el.innerHTML = `<div class="sheet-in">${head}${dateSeg}${setSeg}${rateSeg}
      <div class="qty"><div><div class="sh-label" style="margin:0">Places</div><span class="fine">Groupe de plus de 10 : <a href="privatiser.html">tarif groupe</a></span></div>
        <div class="stepper"><button type="button" data-q="-1" aria-label="Retirer une place">−</button><output class="num" aria-live="polite">${qty}</output><button type="button" data-q="1" aria-label="Ajouter une place">+</button></div></div>
      ${who}
      <div class="total"><span>Total</span><b class="num" data-total>${fmt.eur(total)}</b></div>
      <button type="button" class="btn pay"><span class="lbl">${this.link() ? 'Payer sur la billetterie' : 'Réserver'} · ${fmt.eur(total)}</span><span class="spin" aria-hidden="true"></span></button>
      <p class="fine">Placement libre assis · ouverture des portes 30 min avant le set. Paiement sécurisé sur la billetterie du Duc. Billet nominatif envoyé par e-mail.</p>
    </div>`;
    this.bind();
  },
  bind() {
    const el = this.el;
    $('[data-close]', el).addEventListener('click', () => this.close());
    $$('[data-date]', el).forEach(b => b.addEventListener('click', () => {
      const x = this.st.e.dates.find(z => z.d === b.dataset.date);
      const s = x.sets.find(s => bookable(setState(x.d, s)));
      Object.assign(this.st, { d: x.d, t: s.t }); this.render();
    }));
    $$('[data-time]', el).forEach(b => b.addEventListener('click', () => { this.st.t = b.dataset.time; this.render(); }));
    $$('[data-rate]', el).forEach(b => b.addEventListener('click', () => { this.st.rate = b.dataset.rate; this.render(); }));
    $$('[data-q]', el).forEach(b => b.addEventListener('click', () => {
      this.st.qty = Math.min(10, Math.max(1, this.st.qty + +b.dataset.q));
      $('output', el).textContent = this.st.qty;
      const tot = fmt.eur(this.price() * this.st.qty);
      $('[data-total]', el).textContent = tot; $('.pay .lbl', el).textContent = `${this.link() ? 'Payer sur la billetterie' : 'Réserver'} · ${tot}`;
    }));
    $('[data-forget]', el)?.addEventListener('click', () => { store.set('user', null); this.render(); });
    $('.pay', el).addEventListener('click', () => this.pay());
  },
  link() { const o = this.st.e.dates.find(x => x.d === this.st.d); const st = o && o.sets.find(x => x.t === this.st.t); return st && st.link; },
  pay() {
    const el = this.el, mail = $('#sh-mail', el);
    if (mail) {
      if (!mail.checkValidity() || !mail.value.includes('.')) {
        mail.setCustomValidity('Saisissez une adresse e-mail valide pour recevoir vos billets.'); mail.reportValidity();
        mail.addEventListener('input', () => mail.setCustomValidity(''), { once: true }); return;
      }
      store.set('user', { email: mail.value.trim() });
    }
    store.set('prefs', { qty: this.st.qty, rate: this.st.rate });
    // SoTicket : l'API est en lecture seule → la vente se finalise sur la page de la séance.
    const url = this.link();
    if (url) { window.open(url, '_blank', 'noopener'); this.close(); toast('Finalisez votre paiement sur la billetterie du Duc.'); return; }
    const btn = $('.pay', el); btn.classList.add('is-loading'); btn.disabled = true;
    // En production : POST vers l'API de la billetterie (Apple Pay / Google Pay / carte enregistrée).
    setTimeout(() => {
      this.st.code = 'DUC-' + Math.random().toString(36).slice(2, 7).toUpperCase();
      this.st.step = 'done'; this.render();
    }, 900);
  },
};

function gcal(e, d, t) {
  const start = toDate(d, t), end = new Date(start.getTime() + 75 * 60000);
  const f = x => x.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const p = new URLSearchParams({ action: 'TEMPLATE', text: `${title(e)} au Duc des Lombards`, dates: `${f(start)}/${f(end)}`, location: `Duc des Lombards, ${INFO.address}`, details: 'Ouverture des portes 30 min avant. Placement libre assis.' });
  return `https://calendar.google.com/calendar/render?${p}`;
}
function ics(e, d, t) {
  const start = toDate(d, t), end = new Date(start.getTime() + 75 * 60000);
  const f = x => x.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Duc des Lombards//FR', 'BEGIN:VEVENT',
    `UID:${e.id}-${d}-${t}@ducdeslombards.com`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(start)}`, `DTEND:${f(end)}`,
    `SUMMARY:${title(e)} au Duc des Lombards`, `LOCATION:Duc des Lombards, ${INFO.address}`,
    'DESCRIPTION:Ouverture des portes 30 min avant. Placement libre assis.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' }));
  a.download = `duc-${e.id}.ics`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function waitlist(id, d, t) {
  const e = byId(id);
  const user = store.get('user', null);
  const alt = nextBookable(o => o.e.tag === e.tag && o.e.id !== id) || nextBookable(o => o.d >= d);
  if (!sheet.el) sheet.build();
  sheet.el.innerHTML = `<div class="sheet-in"><div class="grab" aria-hidden="true"></div>
    <div class="sh-head"><div class="sh-thumb">${media(e, '76px')}</div><div><h3 id="sh-title">${esc(e.title)}</h3><p>${fmt.full(d)} · ${fmt.time(t)} · complet</p></div>
    <button class="x" type="button" data-close aria-label="Fermer">${ICON_X}</button></div>
    <form class="waitlist"><p style="margin:0">Ce set est complet. Laissez votre e-mail : on vous prévient dès qu’une place se libère.</p>
      <div class="field" style="margin:0"><label for="wl">E-mail</label><input id="wl" type="email" required autocomplete="email" value="${esc(user?.email || '')}" placeholder="vous@exemple.fr"></div>
      <button class="btn" type="submit">M’avertir</button></form>
    ${alt ? `<div><div class="sh-label">Ou réservez tout de suite</div><div class="bot-card" style="grid-template-columns:56px 1fr">
      <div class="sh-thumb" style="width:56px">${media(alt.e, '56px')}</div><div><b>${esc(alt.e.title)}</b><span>${relDay(alt.d)}</span></div>
      ${chips(alt)}</div></div>` : ''}</div>`;
  if (!sheet.el.open) { sheet.el.showModal(); sheetIn(sheet.el); }
  $('[data-close]', sheet.el).addEventListener('click', () => sheet.close());
  $('form', sheet.el).addEventListener('submit', ev => {
    ev.preventDefault(); store.set('user', { email: $('#wl', sheet.el).value.trim() });
    sheet.close(); toast('C’est noté : on vous écrit dès qu’une place se libère.');
  });
}

/* global delegation: any set chip anywhere = 1 click */
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-book]');
  if (b) { ev.preventDefault(); sheet.open(b.dataset.book, b.dataset.d, b.dataset.t); return; }
  const w = ev.target.closest('[data-wait]');
  if (w) { ev.preventDefault(); waitlist(w.dataset.wait, w.dataset.d, w.dataset.t); }
});

/* ============ Mobile dock "ce soir" ============ */
function dock() {
  const n = nextBookable(); if (!n) return;
  const d = document.createElement('div'); d.className = 'dock';
  d.innerHTML = `<div class="d-txt"><b>${esc(n.e.title)}</b><span>${relDay(n.d)} · ${fmt.time(n.set.t)}</span></div>
    <button class="btn" type="button" data-book="${n.e.id}" data-d="${n.d}" data-t="${n.set.t}">Réserver</button>`;
  document.body.append(d);
  const hero = $('.poster-hero, .hero, .phero');
  const io = new IntersectionObserver(([en]) => d.classList.toggle('is-on', !en.isIntersecting));
  hero ? io.observe(hero) : d.classList.add('is-on');
}

/* ============ Pages ============ */
/* Affiche : nom coupé en deux lignes, détouré pris en sandwich entre les deux. */
function splitName(t) {
  const w = t.split(' ');
  if (w.length === 1) return [t, ''];
  let best = 1, diff = 1e9;
  for (let i = 1; i < w.length; i++) { const d = Math.abs(w.slice(0, i).join(' ').length - w.slice(i).join(' ').length); if (d < diff) { diff = d; best = i; } }
  return [w.slice(0, best).join(' '), w.slice(best).join(' ')];
}
const ddmm = d => `${String(fmt.day(d)).padStart(2, '0')}.${d.slice(5, 7)}`;
function posterHero(o, label, intro = false) {
  const e = o.e, name = e.jam ? 'Jam du Duc' : e.title;
  const [l1, l2] = splitName(name.replace(' & ', ' & '));
  const fs = Math.max(...[l1, l2].map(x => x.length));
  const size = `font-size:min(${(118 / Math.max(fs, 5)).toFixed(1)}vw, 15rem, 24svh)`;
  return `<section class="poster-hero" data-hero aria-labelledby="ph-title">
    ${intro ? `<p class="ph-id"><span class="ph-id-a">Club de jazz</span><span class="ph-id-b">Paris · Châtelet</span><span class="ph-id-c">2 concerts par soir · depuis les années 80</span></p>` : ''}
    <div class="ph-meta"><span class="lab"><span class="eq" data-lottie="equalizer" aria-hidden="true"></span>${esc(label)}</span>
      <span class="ph-date num" data-flap>${ddmm(o.d)}</span><span class="ph-tag">${esc(e.tag)}</span></div>
    <div class="stage">
      <h1 id="ph-title" class="sr">${esc(title(e))}</h1>
      <div class="nm l1" aria-hidden="true" style="${size}">${esc(l1)}</div>
      ${cut(e.img) ? `<div class="blk" aria-hidden="true" style="left:58%;top:18%;width:22%;height:64%"></div>
      <div class="cut-wrap"><img class="cut" src="${cut(e.img)}" alt="${esc(e.title)}" fetchpriority="high" decoding="async" style="translate:-50% 0"></div>`
        : e.img ? `<div class="blk" aria-hidden="true" style="left:62%;top:10%;width:30%;height:70%"></div>
      <div class="cut-wrap"><div class="ph-photo"><img class="cut" src="${img(e.img, 960)}" alt="${esc(e.title)}" fetchpriority="high" decoding="async"></div></div>`
        : `<div class="blk" aria-hidden="true" style="left:var(--pad);top:30%;width:36%;height:38%"></div>`}
      <div class="nm l2" aria-hidden="true" style="${size}">${esc(l2 || l1)}${e.sub && !e.jam ? `<span class="sub">${esc(e.sub)}</span>` : e.jam ? `<span class="sub">${esc(e.sub)}</span>` : ''}</div>
    </div>
    <div class="ph-book">
      <div class="ph-price">${e.price ? `<b class="num">${e.price - 7}–${e.price} €</b><span>Placement libre · 75 min</span>` : `<b>Libre</b><span>Consommation obligatoire</span>`}</div>
      ${chips(o)}
    </div>
  </section>`;
}
function home() {
  const n = nextBookable(); const root = $('[data-home-hero]');
  if (n && root) root.outerHTML = posterHero(n, n.d === todayISO() ? 'Ce soir au Duc' : `${relDay(n.d)} au Duc`, true);
  const tk = $('[data-ticker]');
  if (tk) {
    const items = upcoming().filter(o => !o.e.jam).slice(0, 12).map(o => `<a href="${link(o.e)}">${esc(o.e.title)} <span>${ddmm(o.d)}</span></a>`).join('');
    const id = `<a href="le-duc.html">Club de jazz <span>Paris · Châtelet</span></a>`;
    tk.innerHTML = id + items + (id + items).replace(/<a /g, '<a aria-hidden="true" tabindex="-1" ');
  }
  // collage de détourés
  const cl = $('[data-collage]');
  if (cl) {
    const seen = new Set();
    const picks = upcoming().filter(o => cut(o.e.img) && !o.e.jam && o.e.id !== n?.e.id && !seen.has(o.e.id) && seen.add(o.e.id)).slice(0, 5);
    const L = [ { l: 1, t: 8, w: 36, bg: 'var(--jade)', s: .6 }, { l: 33, t: 36, w: 30, bg: '#fff', s: 1.2 }, { l: 60, t: 4, w: 34, bg: '#fff', s: .8 }, { l: 66, t: 50, w: 32, bg: '#000', s: 1.4 }, { l: 4, t: 56, w: 30, bg: '#0f0f0f', s: 1.0 } ];
    cl.insertAdjacentHTML('beforeend', picks.map((o, i) => { const p = L[i]; const st = o.sets.find(x => bookable(setState(o.d, x)));
      return `<div class="pc" data-speed="${p.s}" style="left:${p.l}%;top:${p.t}%;width:${p.w}%">
      <a href="${link(o.e)}" style="display:block;position:relative;text-decoration:none;color:inherit">
        <span class="bg" aria-hidden="true" style="background:${p.bg};left:10%;right:10%;top:16%;bottom:0"></span>
        <img src="${cut(o.e.img)}" alt="${esc(o.e.title)}" loading="lazy" decoding="async">
        <span class="lb">${esc(o.e.title)}<small>${fmt.wd(o.d)} ${ddmm(o.d)}</small></span></a>
      ${st ? `<button class="bk" type="button" data-book="${o.e.id}" data-d="${o.d}" data-t="${st.t}" aria-label="Réserver ${esc(o.e.title)} à ${st.t}">${st.t}<small>Réserver</small></button>` : ''}</div>`; }).join(''));
  }
  const rl = $('[data-rows]');
  if (rl) rl.innerHTML = upcoming().slice(0, 8).map(row).join('');
  const jn = $('[data-jam-next]'), j = upcoming().find(o => o.e.jam);
  if (jn && j) jn.textContent = `Prochaine : ${relDay(j.d).toLowerCase()} · ${j.e.sub}`;
}

function agenda() {
  const list = $('[data-agenda]'); if (!list) return;
  const occ = upcoming();
  const months = [...new Set(occ.map(o => o.d.slice(0, 7)))];
  list.innerHTML = months.map(m => {
    const its = occ.filter(o => o.d.startsWith(m));
    return `<section data-mon="${m}"><h2 class="month-h">${fmt.monLong(m + '-01')} <span class="cnt">${its.filter(o => !o.e.jam).length} concerts</span></h2>${its.map(row).join('')}</section>`;
  }).join('') + `<p class="empty" data-none hidden>Aucun concert ne correspond. <button class="btn ghost" type="button" data-reset>Tout afficher</button></p>`;
  const tags = [...new Set(EVENTS.map(e => e.tag))];
  $('[data-tags]').innerHTML = `<button class="chip" type="button" data-tag="" aria-pressed="true">Tout</button>`
    + months.map(m => `<button class="chip" type="button" data-m="${m}" aria-pressed="false">${fmt.monLong(m + '-01')}</button>`).join('')
    + `<span class="vr"></span><button class="chip" type="button" data-avail aria-pressed="false">Places dispo</button><span class="vr"></span>`
    + tags.map(t => `<button class="chip" type="button" data-tag="${esc(norm(t))}" aria-pressed="false">${esc(t)}</button>`).join('');
  const f = { tag: '', m: '', avail: false, q: '' };
  const q = $('[data-q]'); q.value = f.q;
  const apply = () => {
    let shown = 0;
    $$('.row', list).forEach(r => {
      const ok = (!f.tag || r.dataset.tag === f.tag) && (!f.m || r.dataset.month === f.m) && (!f.avail || r.dataset.avail === '1') && (!f.q || r.dataset.search.includes(norm(f.q)));
      r.hidden = !ok; shown += ok;
    });
    $$('section[data-mon]', list).forEach(s => s.hidden = !$$('.row:not([hidden])', s).length);
    $('[data-none]', list).hidden = !!shown;
    $$('.chip', $('[data-tags]')).forEach(c => c.setAttribute('aria-pressed',
      c.hasAttribute('data-avail') ? f.avail : c.dataset.m ? c.dataset.m === f.m : c.dataset.tag === f.tag && (c.dataset.tag !== '' || (!f.m && !f.avail))));
  };
  $('[data-tags]').addEventListener('click', ev => {
    const c = ev.target.closest('.chip'); if (!c) return;
    if (c.hasAttribute('data-avail')) f.avail = !f.avail;
    else if (c.dataset.m) f.m = f.m === c.dataset.m ? '' : c.dataset.m;
    else if (c.dataset.tag === '') { f.tag = ''; f.m = ''; f.avail = false; }
    else f.tag = f.tag === c.dataset.tag ? '' : c.dataset.tag;
    apply();
  });
  q.addEventListener('input', () => { f.q = q.value; apply(); });
  list.addEventListener('click', ev => { if (ev.target.closest('[data-reset]')) { Object.assign(f, { tag: '', m: '', avail: false, q: '' }); q.value = ''; apply(); } });
  apply();
}

function concert() {
  const root = $('[data-concert]'); if (!root) return;
  if (!root.dataset.bound) { root.dataset.bound = 1; addEventListener('hashchange', () => { concert(); scrollTo(0, 0); motionScene(); }); }
  const e = byId(location.hash.slice(1)) || nextBookable()?.e || EVENTS[0];
  document.title = `${e.title} — Le Duc des Lombards`;
  const occ = e.dates.map(x => ({ e, d: x.d, sets: x.sets }));
  const first = occ.find(o => o.sets.some(s => bookable(setState(o.d, s)))) || occ[0];
  const others = upcoming().filter(o => o.e.id !== e.id && !o.e.jam).slice(0, 5);
  const C = CONTENT[e.id] || {};
  const paras = (C.desc || '').split('\n').filter(Boolean);
  const about = (paras.length || C.lu) ? `<section class="sec about"><div class="sec-head"><h2>${e.jam ? 'La <span class="it">jam</span>' : 'Le <span class="it">concert</span>'}</h2></div><div class="g12">
    <div class="cell c7">${paras.length ? `<p class="about-lede">${esc(paras[0])}</p>${paras.slice(1).map(x => `<p class="about-p">${esc(x)}</p>`).join('')}` : `<p class="about-lede">${esc(title(e))}, ${esc(e.tag.toLowerCase())}, en live au Duc des Lombards.</p>`}
      ${e.jam ? '<p class="about-p"><b>Réservations sur Shotgun</b> ou directement au guichet.</p>' : ''}</div>
    <div class="cell c5" style="border-right:0"><span class="k">Line-up</span>${C.lu ? `<ul class="lineup">${C.lu.map(([n, i]) => `<li><b>${esc(n)}</b><span>${esc(i)}</span></li>`).join('')}</ul>` : ''}</div>
  </div></section>` : '';
  const video = C.yt ? `<section class="sec"><div class="sec-head"><h2>En <span class="it">vidéo</span></h2><div class="side"><a class="btn" href="https://www.youtube.com/watch?v=${C.yt}" target="_blank" rel="noopener">YouTube ↗</a></div></div>
    <div class="vp" data-yt="${C.yt}"><img src="assets/img/yt/${C.yt}.webp" alt="" loading="lazy" decoding="async"><button class="vp-play" type="button" aria-label="Lire la vidéo de ${esc(e.title)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg><span>Lire la vidéo</span></button><span class="vp-tag">${esc(e.title)}</span></div></section>` : '';
  const live = !/claudeusercontent\.com$/.test(location.hostname);
  const video2 = C.yt && live ? `<section class="sec"><div class="sec-head"><h2>En <span class="it">vidéo</span></h2></div>
    <div class="vp is-playing"><iframe src="https://www.youtube-nocookie.com/embed/${C.yt}?rel=0&modestbranding=1" title="Vidéo — ${esc(e.title)}" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div></section>` : video;
  root.innerHTML = posterHero(first, relDay(first.d)) + about + video2 + `
  ${occ.length > 1 ? `<section class="sec"><div class="sec-head"><h2>Toutes <span class="it">les dates</span></h2></div>${occ.map(row).join('')}</section>` : ''}
  <section class="sec"><div class="g12">
    <div class="cell c4"><span class="k">Portes</span><p class="lede">${e.jam ? 'Dès 23:30' : '30 min avant le set'}</p></div>
    <div class="cell c4"><span class="k">Accès</span><p class="lede">42, rue des Lombards<br>Métro Châtelet</p></div>
    <div class="cell c4"><span class="k">Au bar</span><p class="lede"><a href="bar.html">Cocktails & planches</a></p></div>
  </div></section>
  <section class="sec"><div class="sec-head"><h2>À suivre</h2><div class="side"><a class="btn" href="agenda.html">Agenda <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 10h14M12 5l5 5-5 5"/></svg></a></div></div>${others.map(row).join('')}</section>`;
  const ld = document.createElement('script'); ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify(e.dates.map(x => ({ '@context': 'https://schema.org', '@type': 'MusicEvent', name: title(e), startDate: `${x.d}T${x.sets[0].t}:00+01:00`,
    location: { '@type': 'MusicVenue', name: 'Le Duc des Lombards', address: INFO.address }, offers: e.price ? { '@type': 'Offer', price: e.price, priceCurrency: 'EUR', url: BILLETTERIE } : undefined })));
  document.head.append(ld);
}

/* ============ Chatbot ============ */
const KB = [
  { k: /\b(prix|tarif|combien|cher|reduc|etudiant|jeune|moins de 25|chomeur|demandeur)/, a: () => `<p>Les concerts vont de <b>29 € à 41 €</b> selon la programmation, placement libre assis.</p><p>−7 € pour les moins de 25 ans, étudiants et demandeurs d’emploi · −3 € avec la carte Paris Jazz Club et pour les groupes de plus de 10.</p>`, book: true },
  { k: /\b(heure|horaire|ouvr|porte|duree|dure|quand commence|commence)/, a: () => `<p>Deux concerts par soir, du lundi au samedi : <b>19h30</b> (portes 19h) et <b>22h</b> (portes 21h30). Chaque set dure 75 minutes. Certaines dates jouent à 19h et 21h30.</p>`, book: true },
  { k: /\b(metro|venir|adresse|acces|parking|bus|rer|ou est|ou se trouve|itineraire|noctilien)/, a: () => `<p><b>${INFO.address}</b>, ${INFO.corner}.</p><p>Métro ${INFO.metro}. RER A et B Châtelet-Les Halles. Parkings Indigo Sébastopol et Saemes Les Halles.</p><p><a href="${INFO.maps}" target="_blank" rel="noopener">Ouvrir l’itinéraire</a></p>`, book: true },
  { k: /\b(pmr|handicap|fauteuil|mobilite|accessib)/, a: () => `<p>Le Duc accueille les personnes en situation de handicap : file prioritaire chaque soir, entrée par la porte principale, registre d’accessibilité à l’accueil.</p><p>Pour préparer votre venue : Amma Dakwa, <a href="mailto:adakwa@ducdeslombards.com">adakwa@ducdeslombards.com</a> ou ${INFO.phone}.</p>` },
  { k: /\bjam/, a: () => { const j = upcoming().filter(o => o.e.jam).slice(0, 3); return `<p>Les <b>Jams du Duc</b> ont lieu le vendredi et le samedi dès 23h30, entrée libre (consommation obligatoire), sans réservation.</p>${j.length ? `<p>Prochaines : ${j.map(o => `${fmt.wd(o.d)} ${fmt.day(o.d)} avec ${esc(o.e.sub)}`).join(' · ')}.</p>` : ''}<p>Le meilleur plan : réservez le set de 22h et restez pour la jam.</p>`; }, book: o => o.sets.some(s => s.t === '22:00') },
  { k: /\b(membre|adhe|abonn|carte membre|fidel)/, a: () => `<p>La carte membre coûte <b>275 € par saison</b> (100 membres maximum) : −7 € sur tous les sets pour vous et jusqu’à 4 invités, coupe-file, places VIP, prévente 48 h avant tout le monde, −20 % au bar pendant les jams.</p><p><a href="membre.html">Devenir membre</a></p>` },
  { k: /\b(privat|seminaire|groupe|comite|entreprise|anniversaire|soiree privee|cocktail dinatoire|mezzanine)/, a: () => `<p>Privatisation complète jusqu’à <b>80 invités</b>, ou la mezzanine pour 25 personnes avec bar dédié. Séminaires possibles en journée (9h–17h), écran et vidéoprojecteur.</p><p>Groupes et CE : Noëmi Flamen, <a href="mailto:nflamen@ducdeslombards.com">nflamen@ducdeslombards.com</a> · 01 40 28 94 95. <a href="privatiser.html">Demander un devis</a></p>` },
  { k: /\b(bar|boire|cocktail|vin|champagne|manger|planche|fromage|charcut|whisk|diner)/, a: () => `<p>Cocktails maison « It’s All About Jazz ! », vins et champagnes de vignerons indépendants (dont Champagne Dehours et Fils), whiskies, jus de fruits.</p><p>À grignoter : planches de charcuterie Seguin Gourmet et fromages de Jean-Yves Bordier. <a href="bar.html">Voir le bar</a></p>`, book: true },
  { k: /\b(cadeau|offrir|carte cadeau)/, a: () => `<p>La <b>carte cadeau</b> se dépense en une ou plusieurs fois sur la billetterie, valable un an : à eux de choisir le concert de leurs rêves.</p><p><a href="infos.html#cadeau">Offrir une carte cadeau</a></p>` },
  { k: /\b(contact|telephone|appeler|mail|joindre|presse)/, a: () => `<p>${INFO.phone} (${INFO.phoneHours}) · <a href="mailto:${INFO.email}">${INFO.email}</a>.</p><p>Presse : ${INFO.press}.</p>` },
  { k: /\b(complet|liste d.attente|plus de place)/, a: () => `<p>Si un set est complet, touchez-le : vous rejoignez la liste d’attente en un clic et on vous propose une alternative disponible.</p>`, book: true },
  { k: /\b(bonjour|salut|hello|bonsoir|coucou|hey)\b/, a: () => `<p>Bonsoir ! Je connais tout l’agenda du Duc. Dites-moi un soir, un artiste ou un style, et je vous réserve une place en un clic.</p>`, book: true },
  { k: /\b(merci|super|parfait|top|genial)/, a: () => `<p>Avec plaisir. À très vite rue des Lombards !</p>` },
];
const STYLES = { vocal: 'Vocal', voix: 'Vocal', chant: 'Vocal', chanteuse: 'Vocal', piano: 'Piano', pianiste: 'Piano', groove: 'Groove', funk: 'Groove', folk: 'Folk', 'all star': 'All star', cuba: 'Comme à Cuba', cubain: 'Comme à Cuba', latin: 'Comme à Cuba', guitare: 'Guitar', guitar: 'Guitar', crooner: 'Crooner', standard: 'Standards', batterie: 'Drums', drums: 'Drums', album: "Sortie d'album", noel: 'Vocal', christmas: 'Vocal', contrebasse: 'Contrebasse' };
const WD = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MO = { nov: '11', novembre: '11', dec: '12', decembre: '12' };

function answer(raw) {
  const t = norm(raw);
  const out = { html: '', occ: [] };
  const avail = o => o.sets.some(s => bookable(setState(o.d, s)));
  // 1. date intents
  let dayFilter = null, dayLabel = '';
  if (/ce soir|tonight|aujourd/.test(t)) { dayFilter = [todayISO()]; dayLabel = 'ce soir'; }
  else if (/apres.demain/.test(t)) { dayFilter = [addDays(todayISO(), 2)]; dayLabel = 'après-demain'; }
  else if (/demain/.test(t)) { dayFilter = [addDays(todayISO(), 1)]; dayLabel = 'demain'; }
  else if (/week.?end/.test(t)) { const span = [...Array(8)].map((_, i) => addDays(todayISO(), i)).filter(d => [5, 6, 0].includes(toDate(d, '12:00').getDay())).slice(0, 3); dayFilter = span; dayLabel = 'ce week-end'; }
  else if (/semaine/.test(t)) { dayFilter = [...Array(7)].map((_, i) => addDays(todayISO(), i)); dayLabel = 'cette semaine'; }
  else {
    const wd = WD.findIndex(w => t.includes(w));
    if (wd >= 0) { for (let i = 0; i < 8; i++) { const d = addDays(todayISO(), i); if (toDate(d, '12:00').getDay() === wd) { dayFilter = [d]; dayLabel = fmt.full(d); break; } } }
    const m = t.match(/\b(\d{1,2})\s*(nov|novembre|dec|decembre)\b/);
    if (m) { const d = `2026-${MO[m[2]]}-${m[1].padStart(2, '0')}`; dayFilter = [d]; dayLabel = `le ${fmt.full(d)}`; }
  }
  // 2. artist match
  const words = t.split(/[^a-z0-9]+/).filter(w => w.length >= 4 && !['concert', 'jazz', 'place', 'places', 'reserver', 'billet', 'soir', 'quel', 'quels', 'quelle', 'avez', 'vous', 'pour', 'demain', 'semaine', 'samedi', 'vendredi', 'trio', 'quartet', 'quintet'].includes(w));
  const artist = upcoming().filter(o => words.some(w => norm(`${o.e.title} ${o.e.sub || ''}`).includes(w)));
  // 3. style
  const styleKey = Object.keys(STYLES).find(k => t.includes(k));
  if (artist.length) {
    const e = artist[0].e; const occ = artist.filter(o => o.e.id === e.id);
    const ok = occ.filter(avail);
    const d1 = ((CONTENT[e.id] || {}).desc || '').split(/(?<=[.!?…])\s/)[0];
    out.html = ok.length ? `${d1 ? `<p>${esc(d1)}</p>` : ''}<p><b>${esc(e.title)}</b>${e.sub ? ` (${esc(e.sub)})` : ''} joue ${occ.map(o => fmt.full(o.d)).join(', ')}. ${e.price ? `Tarif ${e.price} €.` : ''} <a href="${link(e)}">Voir la fiche et la vidéo</a></p>`
      : `<p><b>${esc(e.title)}</b> affiche complet${e.jam ? '' : ' sur toutes les dates'}. Touchez un horaire pour la liste d’attente, ou essayez ceci :</p>`;
    out.occ = occ.slice(0, 2);
    if (!ok.length && !e.jam) { const alt = nextBookable(o => o.e.tag === e.tag && o.e.id !== e.id) || nextBookable(); if (alt) out.occ.push(alt); }
    return out;
  }
  if (dayFilter && styleKey) {
    const tag = norm(STYLES[styleKey]);
    const both = upcoming().filter(o => dayFilter.includes(o.d) && norm(o.e.tag).includes(tag));
    if (both.length) { out.html = `<p>${dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)}, côté ${esc(STYLES[styleKey].toLowerCase())} :</p>`; out.occ = both.slice(0, 3); return out; }
    const next = upcoming().filter(o => norm(o.e.tag).includes(tag) && o.d >= dayFilter[0]);
    out.html = `<p>Pas de ${esc(STYLES[styleKey].toLowerCase())} ${dayLabel}. ${next.length ? `Le prochain rendez-vous ${esc(STYLES[styleKey].toLowerCase())} :` : 'Voici ce qui se joue :'}</p>`;
    out.occ = next.length ? next.slice(0, 2) : upcoming().filter(o => dayFilter.includes(o.d)).slice(0, 3);
    return out;
  }
  if (dayFilter) {
    const occ = upcoming().filter(o => dayFilter.includes(o.d));
    const con = occ.filter(o => !o.e.jam);
    if (!occ.length) { const n = nextBookable(o => o.d >= dayFilter[0]); out.html = `<p>Relâche ${dayLabel} (le Duc joue du lundi au samedi). Le prochain concert disponible :</p>`; if (n) out.occ = [n]; return out; }
    out.html = `<p>${dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)} au Duc : ${con.map(o => `<b>${esc(o.e.title)}</b>`).join(', ') || 'la jam'}${occ.some(o => o.e.jam) && con.length ? ', puis la jam dès 23h30' : ''}. Un clic sur l’horaire et c’est réservé :</p>`;
    out.occ = [...con, ...occ.filter(o => o.e.jam)].slice(0, 4);
    return out;
  }
  if (styleKey) {
    const tag = STYLES[styleKey];
    const occ = upcoming().filter(o => norm(o.e.tag).includes(norm(tag)) || (styleKey === 'noel' || styleKey === 'christmas') && /christmas/i.test(o.e.sub || ''));
    const seen = new Set(); const uniq = occ.filter(o => !seen.has(o.e.id) && seen.add(o.e.id));
    out.html = uniq.length ? `<p>Côté ${esc(tag.toLowerCase())}, voici ce qui arrive :</p>` : `<p>Pas de date ${esc(tag.toLowerCase())} à l’agenda pour l’instant. Voici le prochain concert disponible :</p>`;
    out.occ = uniq.length ? uniq.slice(0, 3) : [nextBookable()].filter(Boolean);
    return out;
  }
  for (const r of KB) {
    if (r.k.test(t)) {
      out.html = r.a();
      if (r.book) { const n = nextBookable(typeof r.book === 'function' ? r.book : undefined) || nextBookable(); if (n) { out.html += `<p>Prochain concert avec des places :</p>`; out.occ = [n]; } }
      return out;
    }
  }
  if (/reserv|billet|place|dispo|concert|programme|agenda|quoi|qui joue/.test(t)) {
    const occ = upcoming().filter(o => !o.e.jam && avail(o)).slice(0, 3);
    out.html = `<p>Les prochains concerts avec des places disponibles :</p>`; out.occ = occ; return out;
  }
  const n = nextBookable();
  out.html = `<p>Je n’ai pas la réponse exacte, mais je peux vous aider pour l’agenda, les tarifs, l’accès, le bar ou une privatisation. L’équipe répond aussi au ${INFO.phone}.</p>`;
  if (n) out.occ = [n];
  return out;
}

function bot() {
  const fab = document.createElement('button');
  fab.className = 'bot-fab'; fab.type = 'button'; fab.setAttribute('aria-label', 'Poser une question au Duc'); fab.setAttribute('aria-expanded', 'false');
  fab.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.4A8.5 8.5 0 1 1 21 12Z"/><circle cx="8.5" cy="12" r=".8" fill="currentColor"/><circle cx="12" cy="12" r=".8" fill="currentColor"/><circle cx="15.5" cy="12" r=".8" fill="currentColor"/></svg><span class="ping" aria-hidden="true"></span>`;
  const hint = document.createElement('div'); hint.className = 'bot-hint'; hint.textContent = 'Une place pour ce soir ? Demandez-moi.';
  const p = document.createElement('div'); p.className = 'bot'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Assistant du Duc des Lombards');
  p.innerHTML = `<div class="bot-h"><span class="av" aria-hidden="true"></span><div><b>Le Duc répond</b><span>En ligne · réservation en 1 clic</span></div><button class="x" type="button" aria-label="Fermer l’assistant">${ICON_X}</button></div>
    <div class="bot-log" aria-live="polite"></div>
    <div class="quick">${['Ce soir', 'Ce week-end', 'Du piano', 'Tarifs', 'Venir au Duc', 'Jam session', 'Privatiser'].map(q => `<button class="chip" type="button">${q}</button>`).join('')}</div>
    <form class="bot-f"><label for="bot-in">Écrivez votre question</label><div class="bot-row"><input id="bot-in" autocomplete="off" placeholder="Ex. : un concert ce soir ?"><button type="submit" aria-label="Envoyer"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h13M11 5l5 5-5 5"/></svg></button></div></form>`;
  const scrim = document.createElement('div'); scrim.className = 'bot-scrim'; scrim.setAttribute('aria-hidden', 'true');
  document.body.append(hint, scrim, p, fab);
  scrim.addEventListener('click', () => open(false));
  const log = $('.bot-log', p), input = $('#bot-in', p);
  // Mobile : la popup suit la zone réellement visible (clavier ouvert ou non)
  const fit = () => {
    const vv = window.visualViewport;
    if (!vv || innerWidth > 760 || !p.classList.contains('is-open')) { p.style.top = p.style.height = p.style.bottom = ''; p.classList.remove('kb'); return; }
    const kb = innerHeight - vv.height > 120;
    const top = vv.offsetTop + (kb ? 10 : 64 + 16);
    const bottomGap = kb ? 10 : 64 + 16;
    p.classList.toggle('kb', kb);
    p.style.top = top + 'px'; p.style.bottom = 'auto';
    p.style.height = Math.max(240, vv.height - (top - vv.offsetTop) - bottomGap) + 'px';
    log.scrollTop = log.scrollHeight;
  };
  window.visualViewport?.addEventListener('resize', fit);
  window.visualViewport?.addEventListener('scroll', fit);
  input.addEventListener('focus', () => setTimeout(fit, 300));
  input.addEventListener('blur', () => setTimeout(fit, 300));
  let greeted = false;
  const push = (cls, html) => { const m = document.createElement('div'); m.className = `msg ${cls} msg-in`; m.innerHTML = html; log.append(m); log.scrollTop = log.scrollHeight; return m; };
  // une ligne d'action compacte par concert (plus de carte)
  const cards = occ => occ.slice(0, 3).forEach(o => {
    const st = o.sets.find(x => bookable(setState(o.d, x)));
    const name = o.e.jam ? `Jam du Duc · ${o.e.sub}` : o.e.title;
    const b = document.createElement(st ? 'button' : 'a');
    b.className = 'bot-go msg-in' + (st ? '' : ' is-off');
    if (st) { b.type = 'button'; Object.assign(b.dataset, { book: o.e.id, d: o.d, t: st.t }); }
    else b.href = link(o.e);
    b.innerHTML = `<span>${esc(name)}<small>${fmt.wd(o.d)} ${ddmm(o.d)}${st ? ` · ${st.t}` : o.e.jam ? ' · 23:30 · entrée libre' : ' · complet'}</small></span><b>${st ? 'Réserver' : 'Voir'} →</b>`;
    log.append(b);
  });
  const reply = async q => {
    push('u', esc(q));
    const ty = document.createElement('div'); ty.className = 'typing'; log.append(ty); log.scrollTop = log.scrollHeight;
    playLottie(ty, 'typing');
    await new Promise(r => setTimeout(r, reduce ? 50 : 520));
    ty.remove();
    const a = answer(q); push('b', a.html); cards(a.occ); log.scrollTop = log.scrollHeight;
  };
  const open = v => {
    p.classList.toggle('is-open', v); scrim.classList.toggle('is-on', v); requestAnimationFrame(() => fit && fit()); document.documentElement.style.overflow = v ? 'hidden' : ''; fab.setAttribute('aria-expanded', v); hint.classList.remove('is-on');
    $('.ping', fab)?.remove();
    if (v) {
      if (!greeted) {
        greeted = true; const n = nextBookable();
        push('b', `<p>Bonsoir ! Je suis l’assistant du Duc. Posez-moi votre question dans la zone en bas : un soir, un artiste, un tarif…</p>${n ? `<p>${relDay(n.d) === 'Ce soir' ? 'Ce soir' : relDay(n.d)}, il reste des places pour <b>${esc(n.e.title)}</b> :</p>` : ''}`);
        if (n) cards([n]);
      }
      setTimeout(() => input.focus({ preventScroll: true }), 60);
    } else fab.focus({ preventScroll: true });
  };
  fab.addEventListener('click', () => open(!p.classList.contains('is-open')));
  $('.x', p).addEventListener('click', () => open(false));
  addEventListener('keydown', e => { if (e.key === 'Escape' && p.classList.contains('is-open') && !sheet.el?.open) open(false); });
  $('.quick', p).addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) reply(c.textContent); });
  $('form', p).addEventListener('submit', e => { e.preventDefault(); const v = input.value.trim(); if (!v) return; input.value = ''; reply(v); });
  // bring the booking sheet above the chat
  p.addEventListener('click', e => { if (e.target.closest('[data-book],[data-wait]') && innerWidth < 760) open(false); });
  if (!store.get('hinted', false)) setTimeout(() => { if (!p.classList.contains('is-open')) { hint.classList.add('is-on'); store.set('hinted', true); setTimeout(() => hint.classList.remove('is-on'), 6000); } }, 4000);
  document.addEventListener('click', e => { if (e.target.closest('[data-open-bot]')) { e.preventDefault(); open(true); } });
}

/* ============ Motion (motion.dev, ex-Framer Motion) ============ */
let M = null;
const EO = [.23, 1, .32, 1], IO = [.77, 0, .175, 1];
function revealNow(scope) {
  if (!M || reduce) { $$('[data-reveal]', scope).forEach(e => e.style.opacity = 1); return; }
  M.animate($$('[data-reveal]', scope), { opacity: [0, 1] }, { duration: .4, delay: M.stagger(.04) });
}
/* masques : mots (<span class="w"><i>) ou lettres (<span class="ch"><i>) */
function splitText(el, mode = 'w') {
  if (el.dataset.split) return $$(`.${el.dataset.split} > i`, el);
  const walk = node => [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(p => {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.append(document.createTextNode(' ')); return; }
        const units = mode === 'ch' ? [...p] : [p];
        const word = document.createElement('span'); word.style.display = 'inline-block'; word.style.whiteSpace = 'nowrap';
        units.forEach(u => { const w = document.createElement('span'); w.className = mode; const i = document.createElement('i'); i.textContent = u; w.append(i); word.append(w); });
        frag.append(mode === 'ch' ? word : word.firstChild);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
  });
  walk(el); el.dataset.split = mode;
  return $$(`.${mode} > i`, el);
}
/* compteur « split-flap » pour la date 06.11 */
function flap(el) {
  const txt = el.textContent; el.textContent = ''; el.setAttribute('aria-label', txt);
  return [...txt].map((c, i) => {
    if (!/\d/.test(c)) { el.append(c); return null; }
    const box = document.createElement('span'); box.className = 'flap';
    const col = document.createElement('span');
    const seq = [...Array(10 + +c + 1)].map((_, k) => k % 10);
    col.innerHTML = seq.map(d => `<b>${d}</b>`).join(''); box.append(col); el.append(box);
    return { col, steps: seq.length - 1, i };
  }).filter(Boolean);
}

/* ---------- Transition de page : 6 colonnes couleur ---------- */
const PT = (() => { const d = document.createElement('div'); d.className = 'pt'; d.setAttribute('aria-hidden', 'true'); d.innerHTML = '<i></i>'.repeat(6); document.body.append(d); if (reduce) d.classList.add('is-off'); return d; })();
setTimeout(() => { if (!M) PT.classList.add('is-off'); }, 2500);
document.addEventListener('click', ev => {
  const a = ev.target.closest('a[href]');
  if (!a || !M || reduce || ev.metaKey || ev.ctrlKey || a.target === '_blank') return;
  const href = a.getAttribute('href');
  if (!/^[\w-]+\.html(#[\w-]*)?$/.test(href)) return;
  const here = location.pathname.split('/').pop() || 'index.html';
  if (href.split('#')[0] === here) return;
  ev.preventDefault();
  PT.classList.remove('is-off');
  const cols = $$('i', PT);
  cols.forEach(c => c.style.transformOrigin = 'bottom');
  M.animate(cols, { transform: ['scaleY(0)', 'scaleY(1)'] }, { duration: .55, delay: M.stagger(.05), ease: IO }).finished.then(() => location.href = href);
});
addEventListener('pageshow', e => { if (e.persisted) PT.classList.add('is-off'); });

/* ---------- La scène d'affiche ---------- */
function motionScene() {
  if (!M) return;
  const { animate, stagger, scroll } = M;
  const hero = $('.poster-hero'); if (!hero) return;
  const l1 = splitText($('.nm.l1', hero), 'ch'), l2 = splitText($('.nm.l2', hero), 'ch');
  const t0 = .45;
  animate(l1, { transform: ['translateY(105%)', 'translateY(0%)'] }, { duration: .9, delay: stagger(.035, { startDelay: t0 }), ease: IO });
  animate(l2, { transform: ['translateY(-105%)', 'translateY(0%)'] }, { duration: .9, delay: stagger(.035, { startDelay: t0 + .25, from: 'last' }), ease: IO });
  const blk = $('.blk', hero);
  animate(blk, { transform: ['scaleY(0)', 'scaleY(1)'] }, { duration: .8, delay: t0 + .1, ease: IO });
  blk.style.transformOrigin = 'bottom';
  const c = $('.cut', hero);
  if (c) {
    animate(c, { clipPath: ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'], transform: ['translateY(12%) scale(1.08)', 'translateY(0%) scale(1)'] }, { duration: 1.3, delay: t0 + .2, ease: IO });
    // le détouré suit la souris, ressort amorti
    const wrap = $('.cut-wrap', hero);
    if (matchMedia('(pointer: fine)').matches) hero.addEventListener('pointermove', ev => {
      const r = hero.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width - .5, y = (ev.clientY - r.top) / r.height - .5;
      animate(wrap, { transform: `translate(${x * 30}px, ${y * 16}px) rotate(${x * 2}deg)` }, { type: 'spring', stiffness: 120, damping: 18 });
      animate(blk, { transform: `translate(${-x * 22}px, ${-y * 12}px)` }, { type: 'spring', stiffness: 90, damping: 16 });
    });
  }
  const fl = $('[data-flap]', hero);
  if (fl) flap(fl).forEach(f => animate(f.col, { transform: ['translateY(0)', `translateY(-${f.steps}em)`] }, { duration: 1.4 + f.i * .12, delay: t0, ease: [.6, 0, .1, 1] }));
  const pid = $('.ph-id', hero);
  if (pid) animate($$('span', pid), { transform: ['translateY(105%)', 'translateY(0%)'] }, { duration: .7, delay: stagger(.08, { startDelay: .35 }), ease: IO });
  animate($$('.ph-meta > *, .ph-book', hero), { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0px)'] }, { duration: .6, delay: stagger(.06, { startDelay: t0 + .7 }), ease: EO });
  animate($$('.ph-book .set', hero), { clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'] }, { duration: .7, delay: stagger(.08, { startDelay: t0 + .9 }), ease: IO });
  // défilement : les deux lignes s'écartent, le détouré monte
  scroll(animate($('.nm.l1', hero), { transform: ['translateX(0%)', 'translateX(-28%)'] }, { ease: 'linear' }), { target: hero, offset: ['start start', 'end start'] });
  scroll(animate($('.nm.l2', hero), { transform: ['translateX(0%)', 'translateX(22%)'] }, { ease: 'linear' }), { target: hero, offset: ['start start', 'end start'] });
  if (c) scroll(animate(c, { transform: ['translateY(0%) scale(1)', 'translateY(-14%) scale(1.06)'] }, { ease: 'linear' }), { target: hero, offset: ['start start', 'end start'] });
}

async function motion() {
  if (reduce) return;
  try { M = await import('https://cdn.jsdelivr.net/npm/motion@11/+esm'); } catch { PT.classList.add('is-off'); return; }
  document.documentElement.classList.add('js-motion');
  const { animate, inView, stagger, scroll } = M;
  // entrée de page : les colonnes se lèvent
  animate($$('i', PT), { transform: ['scaleY(1)', 'scaleY(0)'] }, { duration: .75, delay: stagger(.06), ease: IO }).finished.then(() => PT.classList.add('is-off'));
  motionScene();
  // titres de pages et de sections : lettres qui montent
  $$('main h1:not(.sr), main h2').forEach(h => {
    if (h.closest('.poster-hero')) return;
    const ch = splitText(h, 'ch'); ch.forEach(i => i.style.transform = 'translateY(105%)');
    inView(h, () => { animate(ch, { transform: ['translateY(105%)', 'translateY(0%)'] }, { duration: .8, delay: stagger(.022, { startDelay: h.closest('.phero') ? .5 : 0 }), ease: IO }); }, { margin: '0px 0px -8% 0px' });
  });
  // détouré des pages intérieures
  $$('.pcut').forEach(p => animate(p, { clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'], transform: ['translateY(10%)', 'translateY(0%)'] }, { duration: 1.2, delay: .55, ease: IO }));
  // collage : marquees liées au scroll + parallaxe par pièce
  const cl = $('.collage');
  if (cl) {
    scroll(animate($('.marq.m1', cl), { transform: ['translateX(5%)', 'translateX(-45%)'] }, { ease: 'linear' }), { target: cl, offset: ['start end', 'end start'] });
    scroll(animate($('.marq.m2', cl), { transform: ['translateX(-45%)', 'translateX(5%)'] }, { ease: 'linear' }), { target: cl, offset: ['start end', 'end start'] });
    $$('.pc', cl).forEach((p, i) => {
      const sp = +p.dataset.speed || 1;
      scroll(animate(p, { transform: [`translateY(${80 * sp}px) rotate(${(i % 2 ? 1 : -1) * 3 * sp}deg)`, `translateY(${-80 * sp}px) rotate(0deg)`] }, { ease: 'linear' }), { target: cl, offset: ['start end', 'end start'] });
      inView(p, () => { animate($('img', p), { clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'] }, { duration: 1, delay: i * .08, ease: IO }); animate($('.bg', p), { transform: ['scaleX(0)', 'scaleX(1)'] }, { duration: .8, delay: i * .08, ease: IO }); animate($('.lb', p), { clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'] }, { duration: .6, delay: .5 + i * .08, ease: IO }); });
    });
  }
  // lignes d'agenda : balayage gauche → droite
  const rowsIn = scope => inView($$('.row', scope).filter(r => !r.dataset.in), el => { const r = el.target || el; r.dataset.in = 1; animate(r, { clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'] }, { duration: .7, ease: IO }); }, { margin: '0px 0px -5% 0px' });
  rowsIn(document);
  inView('[data-reveal]', a => { const el = a.target || a; animate(el, { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0px)'] }, { duration: .7, ease: EO }); }, { margin: '0px 0px -10% 0px' });
  inView('.photo', a => { const el = a.target || a; animate(el, { clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'] }, { duration: 1.1, ease: IO }); });
  inView('[data-count]', a => { const el = a.target || a; const to = +el.dataset.count; animate(0, to, { duration: 1.4, ease: EO, onUpdate: v => el.textContent = Math.round(v) + (el.dataset.suffix || '') }); });
  // ticker : accélère avec la vitesse de défilement
  const tk = $('.ticker-track');
  if (tk) { let last = scrollY, raf; addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const v = Math.min(Math.abs(scrollY - last), 80); last = scrollY; tk.getAnimations().forEach(x => x.playbackRate = 1 + v / 6); clearTimeout(tk._t); tk._t = setTimeout(() => tk.getAnimations().forEach(x => x.playbackRate = 1), 160); }); }, { passive: true }); }
  peek();
}

/* ---------- Aperçu détouré qui suit le curseur sur l'agenda ---------- */
function peek() {
  if (!matchMedia('(pointer: fine)').matches) return;
  const pk = document.createElement('div'); pk.className = 'peek'; pk.setAttribute('aria-hidden', 'true'); document.body.append(pk);
  let cur = null;
  document.addEventListener('pointermove', ev => {
    const r = ev.target.closest?.('.row[data-cut]');
    const id = r?.dataset.cut || (r ? 'p:' + r.dataset.id : null);
    if (id !== cur) {
      cur = id;
      if (r) {
        const e = byId(r.dataset.id);
        pk.innerHTML = r.dataset.cut ? `<img src="${cut(r.dataset.cut)}" alt="">` : media(e, '280px');
        M.animate(pk, { opacity: 1, clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'] }, { duration: .45, ease: IO });
      } else M.animate(pk, { opacity: 0 }, { duration: .2 });
    }
    if (r) M.animate(pk, { transform: `translate(${ev.clientX + 28}px, ${ev.clientY - 180}px) rotate(${(ev.movementX || 0) * .4}deg)` }, { type: 'spring', stiffness: 260, damping: 26 });
  }, { passive: true });
}

/* ---------- Panneau de réservation : volet ---------- */
function sheetIn(el) {
  if (!M) return;
  M.animate(el, { clipPath: ['inset(0 0 0 100%)', 'inset(0 0 0 0%)'] }, { duration: .6, ease: IO });
  M.animate($$('.sheet-in > *', el), { opacity: [0, 1], transform: ['translateX(40px)', 'translateX(0px)'] }, { duration: .55, delay: M.stagger(.05, { startDelay: .2 }), ease: EO });
  const h = $('.sh-head h3', el); if (h) M.animate(splitText(h, 'ch'), { transform: ['translateY(105%)', 'translateY(0%)'] }, { duration: .7, delay: M.stagger(.02, { startDelay: .25 }), ease: IO });
}
function sheetOut(el) { return M ? M.animate(el, { clipPath: ['inset(0 0 0 0%)', 'inset(0 0 0 100%)'] }, { duration: .45, ease: IO }).finished : Promise.resolve(); }
function successIn(el) {
  if (!M) return;
  const b = $('.sh-success .big', el); if (b) M.animate(splitText(b, 'ch'), { transform: ['translateY(110%) rotate(8deg)', 'translateY(0%) rotate(0deg)'] }, { duration: .8, delay: M.stagger(.05), ease: IO });
  M.animate($$('.ticket, .row-btns, .sh-success .fine', el), { clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'] }, { duration: .7, delay: M.stagger(.1, { startDelay: .4 }), ease: IO });
}

/* ============ Lecteur vidéo (façade légère : rien ne charge avant le clic) ============ */
document.addEventListener('click', ev => {
  const b = ev.target.closest('.vp-play'); if (!b) return;
  const vp = b.closest('.vp'), id = vp.dataset.yt;
  // L'aperçu Claude interdit les iframes externes : on ouvre YouTube à côté. Sur le site en ligne, lecture intégrée.
  if (/claudeusercontent\.com$/.test(location.hostname)) { window.open(`https://www.youtube.com/watch?v=${id}`, '_blank', 'noopener'); return; }
  const f = document.createElement('iframe');
  f.src = `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
  f.title = 'Vidéo'; f.allow = 'encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
  vp.classList.add('is-playing'); vp.append(f);
  if (M) M.animate(f, { clipPath: ['inset(0 0 0 100%)', 'inset(0 0 0 0%)'] }, { duration: .6, ease: IO });
});

/* ============ Devis privatisation ============ */
function quote() {
  const f = $('[data-quote]'); if (!f) return;
  f.addEventListener('submit', ev => {
    ev.preventDefault();
    if (!f.reportValidity()) return;
    const v = Object.fromEntries(new FormData(f));
    const lines = [`Nom : ${v.nom}`, `E-mail : ${v.email}`, `Formule : ${v.formule}`, `Invités : ${v.invites || '—'}`, `Date : ${v.date || '—'}`, '', v.projet || ''];
    const href = `mailto:nflamen@ducdeslombards.com?subject=${encodeURIComponent('Demande de devis — ' + v.formule)}&body=${encodeURIComponent(lines.join('\n'))}`;
    f.innerHTML = `<h3>Votre demande est prête</h3>
      <p>Il ne reste qu’à l’envoyer depuis votre messagerie à <b>nflamen@ducdeslombards.com</b>, ou par téléphone au 01 40 28 94 95.</p>
      <pre style="white-space:pre-wrap;background:rgba(242,235,221,.05);padding:14px;border-radius:12px;font:inherit;font-size:.9rem">${esc(lines.join('\n'))}</pre>
      <p style="display:grid;gap:10px"><a class="btn" href="${href}">Ouvrir dans ma messagerie</a><button class="btn ghost" type="button" data-copy>Copier le texte</button></p>`;
    $('[data-copy]', f).addEventListener('click', async () => { try { await navigator.clipboard.writeText(lines.join('\n')); toast('Texte copié.'); } catch { toast('Copie impossible : sélectionnez le texte.'); } });
  });
}

/* ============ Boot ============ */
try { await syncSoTicket(EVENTS); } catch (err) { console.warn('SoTicket indisponible, données de démonstration', err); }
header();
const page = document.body.dataset.page;
({ home, agenda, concert })[page]?.();
dock(); bot(); lazyLotties(); quote();
{ const n = nextBookable(); $$('[data-next]').forEach(b => { if (n) { b.dataset.book = n.e.id; b.dataset.d = n.d; b.dataset.t = n.set.t; } }); }
motion();
