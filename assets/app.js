import { syncSoTicket } from './soticket.js';
import { addToCart, warmCart, sameSite, bridgeUrl, BRIDGE_INSTALLED } from './cart.js';
import { EVENTS, INFO, BILLETTERIE, CONTENT, GENRES, FOCUS, img, srcset } from './data.js';
/* Le Duc des Lombards — v4 « affiche papier » : l'agenda d'abord, 1 clic pour découvrir, 1 clic pour réserver. */

/* ============ Utils ============ */
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

/* ============ Langue (FR par défaut, EN dans /en/) ============ */
const EN = document.documentElement.lang === 'en';
const LOC = EN ? 'en-GB' : 'fr-FR';
const LP = EN ? 'en/' : '';            // préfixe des liens de pages (les pages EN ont <base href="../">)
const DICT = {
  'Réserver': 'Book', 'Dernières places': 'Last seats', 'Complet': 'Sold out', 'Guichet': 'At the door', 'Passé': 'Past',
  'Liste d’attente': 'Waiting list', 'Entrée libre': 'Free entry', 'Ce soir': 'Tonight', 'Demain': 'Tomorrow',
  'Tout': 'All', '7 jours': 'Next 7 days', 'Places dispo': 'Available', 'concerts': 'concerts', 'soirs': 'nights',
  'Aucun concert ne correspond.': 'No concert matches.', 'Tout afficher': 'Show all',
  'Puis': 'Then', '23:30 · entrée libre · sans réservation': '11:30pm · free entry · no booking',
  'Plein': 'Full price', 'Réduit': 'Reduced', 'Jeune': 'Under 25',
  'Placement libre assis · portes 30 min avant le set · 75 min': 'Unreserved seating · doors 30 min before · 75-min set',
  'Le concert': 'The concert', 'En vidéo': 'Video', 'L’affiche': 'The poster', 'À suivre au Duc': 'Coming up at the Duc', 'Tout l’agenda': 'Full programme',
  'Accès': 'Getting here', 'Au bar': 'At the bar', 'Une question': 'Questions', 'Cocktails, vins & planches': 'Cocktails, wines & sharing boards',
  'Présentation et vidéo': 'About & video', 'Voir l’artiste': 'See the artist', 'avec': 'with',
  'Jams du Duc': 'Duc Jam sessions', 'Ven. & sam. · 23:30 · entrée libre, sans réservation': 'Fri & Sat · 11:30pm · free entry, no booking',
  'Prochaines': 'Next',
  'Réduit : carte Paris Jazz Club, groupes 10+ · Jeune : −25 ans, étudiants, demandeurs d’emploi': 'Reduced: Paris Jazz Club card, groups 10+ · Under 25, students, jobseekers',
};
const T = s => EN ? (DICT[s] ?? s) : s;
const NOW = new Date();
const toDate = (d, t = '00:00') => new Date(`${d}T${t}:00`);
const todayISO = () => { const n = NOW; return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`; };
const addDays = (iso, n) => { const d = toDate(iso, '12:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const fmt = {
  wd: iso => toDate(iso, '12:00').toLocaleDateString(LOC, { weekday: 'short' }).replace('.', ''),
  wdLong: iso => toDate(iso, '12:00').toLocaleDateString(LOC, { weekday: 'long' }),
  day: iso => toDate(iso, '12:00').getDate(),
  mon: iso => toDate(iso, '12:00').toLocaleDateString(LOC, { month: 'short' }).replace('.', ''),
  monLong: iso => toDate(iso, '12:00').toLocaleDateString(LOC, { month: 'long' }),
  full: iso => toDate(iso, '12:00').toLocaleDateString(LOC, { weekday: 'long', day: 'numeric', month: 'long' }),
  time: t => t,
  eur: n => `${n} €`,
};
const relDay = iso => iso === todayISO() ? T('Ce soir') : iso === addDays(todayISO(), 1) ? T('Demain') : fmt.full(iso);
const isPast = (d, t) => toDate(d, t) < NOW;
const setState = (d, s) => isPast(d, s.t) ? 'past' : s.s;
const STATUS = { ok: T('Réserver'), last: T('Dernières places'), full: T('Complet'), door: T('Guichet'), past: T('Passé') };
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
/* ============ Charte « affiche papier » : une famille musicale = une couleur ============ */
const gc = e => GENRES[e.genre] || GENRES.classic;
const gvars = e => `--g:${gc(e).c};--gl:${gc(e).l}`;
const name = e => e.jam ? 'Jam du Duc' : e.title;
const ddmm = d => `${String(fmt.day(d)).padStart(2, '0')}.${d.slice(5, 7)}`;
const link = e => `${LP}concert.html#${e.id}`;
// Tarifs relevés sur la billetterie : plein / réduit (Paris Jazz Club) / jeune
const pjcP = e => e.pjc ?? e.price - 3;
const lowP = e => e.jeune ?? pjcP(e);
const BT_RATE = { plein: 'Tarif PLEIN', pjc: 'Tarif RÉDUIT', jeune: 'Tarif JEUNE' };
const AR = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M3 10h14M12 5l5 5-5 5"/></svg>';

/* Photo en bichromie (couleur de la famille + papier) : aucun détourage, juste la photo d'origine */
const media = (e, sizes = '(max-width: 700px) 100vw, 25vw', eager = false) => `<span class="duo" style="${gvars(e)}">${e.img
  ? `<img src="${img(e.img, 480)}" srcset="${srcset(e.img)}" sizes="${sizes}" alt="${esc(name(e))}" style="object-position:${FOCUS[e.img] || '50% 30%'}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="480" height="360">`
  : `<span class="duo-ph" aria-hidden="true">${esc(name(e))}</span>`}</span>`;
/* Pastille de style : médaillon or, texte circulaire qui tourne lentement, reflet qui passe (SVG + CSS, plus léger qu'un Lottie) */
const GOLD_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
  <linearGradient id="duc-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3e3a6"/><stop offset=".28" stop-color="#c9a24c"/><stop offset=".55" stop-color="#8a6624"/><stop offset=".8" stop-color="#d8b866"/><stop offset="1" stop-color="#7a5a1e"/></linearGradient>
  <path id="duc-ring" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0"/></defs></svg>`;
document.body.insertAdjacentHTML('afterbegin', GOLD_DEFS);
const badge = (e, cls = '') => {
  const l = gc(e).label.toUpperCase();
  let ring = ''; while (ring.length < 42) ring += `${l} ✦ `;
  return `<span class="badge ${cls}" role="img" aria-label="Style : ${esc(gc(e).label)}"><svg viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="49" fill="url(#duc-gold)"/><circle cx="50" cy="50" r="45.5" fill="none" stroke="#1a1408" stroke-opacity=".35" stroke-width=".6"/>
    <g class="ring"><text><textPath href="#duc-ring" textLength="224" lengthAdjust="spacing">${esc(ring.trim())}</textPath></text></g>
    <circle cx="50" cy="50" r="24" fill="none" stroke="#1a1408" stroke-opacity=".35" stroke-width=".6"/>
    <text class="mid" x="50" y="51" text-anchor="middle" dominant-baseline="central" font-size="${Math.min(13, 70 / l.split(' ')[0].length).toFixed(1)}">${esc(l.split(' ')[0])}</text></svg></span>`;
};

const chip = (e, d, s) => {
  const st = setState(d, s);
  const label = e.jam ? T('Entrée libre') : st === 'full' ? T('Liste d’attente') : STATUS[st];
  const attrs = bookable(st)
    ? `data-book="${e.id}" data-d="${d}" data-t="${s.t}" aria-label="Réserver ${esc(name(e))}, ${fmt.full(d)} à ${fmt.time(s.t)}"`
    : st === 'full' ? `data-wait="${e.id}" data-d="${d}" data-t="${s.t}" aria-label="${esc(name(e))} ${fmt.time(s.t)} complet, liste d’attente"`
    : `aria-disabled="true"`;
  return `<button type="button" class="set is-${st}" ${attrs}><b>${fmt.time(s.t)}</b><small>${label}</small></button>`;
};
const chips = o => `<div class="sets">${o.sets.map(s => chip(o.e, o.d, s)).join('')}</div>`;

/* Les jams se greffent sur le concert du même soir : « puis Jam du Duc dès 23:30 » */
const jamOf = d => OCC.find(o => o.e.jam && o.d === d);
const dateLine = d => `<span class="dl"><b>${fmt.wdLong(d)} ${fmt.day(d)}</b> ${fmt.monLong(d)}</span>`;
const when = d => d === todayISO() ? T('Ce soir') : d === addDays(todayISO(), 1) ? T('Demain') : '';

/* Carte concert (grille sur ordinateur, ligne compacte sur mobile) :
   toute la carte ouvre la fiche artiste, les horaires réservent en 1 clic. */
const card = (o, { eager = false } = {}) => {
  const e = o.e, j = !e.jam && jamOf(o.d), w = when(o.d);
  const ds = o.ds || [o.d], multi = ds.length > 1;
  const range = multi ? (EN ? `<span class="dl"><b>${fmt.day(ds[0])}</b>–<b>${fmt.day(ds.at(-1))} ${fmt.monLong(ds.at(-1))}</b></span>` : `<span class="dl">Du <b>${fmt.day(ds[0])}</b> au <b>${fmt.day(ds.at(-1))} ${fmt.monLong(ds.at(-1))}</b></span>`) : dateLine(o.d);
  return `<article class="cc${e.jam ? ' is-jam' : ''}" style="${gvars(e)}" data-g="${e.genre}" data-month="${o.d.slice(0, 7)}" data-d="${ds.join(' ')}"
    data-search="${esc(norm(`${e.title} ${e.sub || ''} ${e.tag} ${gc(e).label}`))}" data-avail="${(o.occs || [o]).some(x => x.sets.some(s => bookable(setState(x.d, s)))) ? 1 : 0}">
    <div class="cc-media">${media(e, '(max-width: 700px) 96px, (max-width: 1300px) 33vw, 25vw', eager)}${w ? `<span class="when">${w}</span>` : ''}</div>
    <div class="cc-body">
      <p class="cc-date">${range}${multi ? `<span class="nd">${ds.length} ${T('soirs')}</span>` : ''}</p>
      <h3><a class="cc-link" href="${link(e)}" aria-label="${esc(name(e))} : ${T('Voir l’artiste')}">${esc(name(e))}<span class="go" aria-hidden="true">${AR}</span></a></h3>
      <p class="cc-sub"><span class="gl">${esc(gc(e).label)}</span>${e.jam ? `${T('avec')} ${esc(e.sub)}` : `${e.sub ? `<span class="s">${esc(e.sub)}</span>` : ''}<span class="cc-p">${e.price} €</span>`}</p>
      ${e.jam ? `<p class="cc-jam">${T('23:30 · entrée libre · sans réservation')}</p>` : chips(o)}
    </div>
  </article>`;
};

/* ============ Header / menu ============ */
function header() {
  const h = $('.hdr'); if (!h) return;
  const onScroll = () => h.classList.toggle('is-solid', scrollY > 8);
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
async function playLottie(el, nm, { loop = true } = {}) {
  try {
    const lottie = await lottieLib();
    el.innerHTML = '';
    const a = lottie.loadAnimation({ container: el, renderer: 'svg', loop, autoplay: !reduce, path: `assets/lottie/${nm}.json` });
    if (reduce) a.addEventListener('DOMLoaded', () => a.goToAndStop(a.totalFrames - 1, true));
    return a;
  } catch { return null; }
}

/* ============ AGENDA (page d'accueil) ============ */
function agenda() {
  const list = $('[data-agenda]'); if (!list) return;
  const raw = upcoming().filter(o => !o.e.jam || !OCC.some(x => !x.e.jam && x.d === o.d));
  // un concert sur plusieurs soirs = une seule carte (dates au choix dans le panneau de réservation)
  const occ = [];
  raw.forEach(o => {
    const g = !o.e.jam && occ.find(x => x.e.id === o.e.id && x.d.slice(0, 7) === o.d.slice(0, 7));
    if (g) { g.ds.push(o.d); g.occs.push(o); return; }
    occ.push({ ...o, ds: [o.d], occs: [o] });
  });
  // horaires affichés : la première soirée encore réservable
  occ.forEach(g => { const f = g.occs.find(x => x.sets.some(s => bookable(setState(x.d, s)))); if (f) Object.assign(g, { d: f.d, sets: f.sets }); });
  const months = [...new Set(occ.map(o => o.d.slice(0, 7)))];
  let first = true;
  // une seule grille continue (pas de trou en fin de mois) ; les intitulés de mois n'apparaissent qu'en vue liste
  list.innerHTML = `<div class="grid">${months.map(m => {
    const its = occ.filter(o => o.d.slice(0, 7) === m);
    return `<h2 class="mh" data-mon="${m}"><span>${fmt.monLong(m + '-01')} ${m.slice(0, 4)}</span><small>${its.filter(o => !o.e.jam).length} ${T('concerts')}</small></h2>`
      + its.map(o => { const c = card(o, { eager: first }); first = false; return c; }).join('');
  }).join('')}</div><p class="empty" data-none hidden>${T('Aucun concert ne correspond.')} <button class="btn" type="button" data-reset>${T('Tout afficher')}</button></p>`;

  // Filtres : quand, style, places, recherche
  const week = [...Array(7)].map((_, i) => addDays(todayISO(), i));
  const used = new Set(upcoming().filter(o => !o.e.jam).map(o => o.e.genre));
  const genres = Object.keys(GENRES).filter(g => used.has(g));
  $('[data-tags]').innerHTML =
      `<button class="chip" type="button" data-when="" aria-pressed="true">${T('Tout')}</button>`
    + `<button class="chip" type="button" data-when="tonight" aria-pressed="false">${T('Ce soir')}</button>`
    + `<button class="chip" type="button" data-when="week" aria-pressed="false">${T('7 jours')}</button>`
    + `<span class="vr" aria-hidden="true"></span>`
    + genres.map(g => `<button class="chip g" type="button" data-g="${g}" style="--g:${GENRES[g].c}" aria-pressed="false"><i aria-hidden="true"></i>${GENRES[g].label}</button>`).join('')
;
  // bandeau Jams du Duc
  const jb = $('[data-jams]'), jams = upcoming().filter(o => o.e.jam).slice(0, 4);
  if (jb && jams.length) jb.innerHTML = `<div class="wrap"><b class="jt">${T('Jams du Duc')}</b><span class="ji">${T('Ven. & sam. · 23:30 · entrée libre, sans réservation')}</span>
    <span class="jn">${T('Prochaines')} : ${jams.map(o => `<a href="${link(o.e)}">${fmt.wd(o.d)} ${fmt.day(o.d)} · ${esc(o.e.sub)}</a>`).join('')}</span></div>`;
  const f = { when: '', g: '', avail: false, q: '' };
  const q = $('[data-q]');
  const apply = () => {
    let shown = 0;
    $$('.cc', list).forEach(c => {
      const d = c.dataset.d;
      const dd = d.split(' ');
      const okW = !f.when || (f.when === 'tonight' ? dd.includes(todayISO()) : f.when === 'week' ? dd.some(x => week.includes(x)) : c.dataset.month === f.when);
      const ok = okW && (!f.g || c.dataset.g === f.g) && (!f.avail || c.dataset.avail === '1') && (!f.q || c.dataset.search.includes(norm(f.q)));
      c.hidden = !ok; shown += ok;
    });
    $$('.mh[data-mon]', list).forEach(h => h.hidden = !$$(`.cc[data-month="${h.dataset.mon}"]:not([hidden])`, list).length);
    $('[data-none]', list).hidden = !!shown;
    $$('[data-when]', $('[data-tags]')).forEach(c => c.setAttribute('aria-pressed', c.dataset.when === f.when));
    $$('[data-g]', $('[data-tags]')).forEach(c => c.setAttribute('aria-pressed', c.dataset.g === f.g));
    $('[data-avail]', $('[data-tags]'))?.setAttribute('aria-pressed', f.avail);
  };
  $('[data-tags]').addEventListener('click', ev => {
    const c = ev.target.closest('.chip'); if (!c) return;
    if (c.hasAttribute('data-avail')) f.avail = !f.avail;
    else if (c.dataset.g) f.g = f.g === c.dataset.g ? '' : c.dataset.g;
    else if ('when' in c.dataset) { f.when = c.dataset.when; if (!f.when) { f.g = ''; f.avail = false; } }
    apply();
  });
  q?.addEventListener('input', () => { f.q = q.value; apply(); });
  list.addEventListener('click', ev => { if (ev.target.closest('[data-reset]')) { Object.assign(f, { when: '', g: '', avail: false, q: '' }); if (q) q.value = ''; apply(); } });
  // Vue affiches / liste (ordinateur), mémorisée
  const vt = $('[data-view]');
  const setView = v => { list.dataset.v = v; $$('button', vt).forEach(b => b.setAttribute('aria-pressed', b.dataset.v === v)); store.set('view', v); };
  vt?.addEventListener('click', ev => { const b = ev.target.closest('button'); if (b) setView(b.dataset.v); });
  setView(store.get('view', 'grid'));
  apply();
}

/* ============ FICHE CONCERT ============ */
function concert() {
  const root = $('[data-concert]'); if (!root) return;
  if (!root.dataset.bound) { root.dataset.bound = 1; addEventListener('hashchange', () => { concert(); scrollTo(0, 0); heroIn(); }); }
  const e = byId(location.hash.slice(1)) || nextBookable()?.e || EVENTS[0];
  document.title = `${name(e)}${e.jam ? ` · ${e.sub}` : ''} — Le Duc des Lombards, ${EN ? 'jazz club in Paris' : 'club de jazz à Paris'}`;
  const occ = e.dates.map(x => ({ e, d: x.d, sets: x.sets }));
  const live = occ.filter(o => o.sets.some(s => !isPast(o.d, s.t)));
  const shown = (live.length ? live : occ).slice(0, 4);
  const C = CONTENT[e.id] || {};
  const paras = (C.desc || '').split('\n').filter(Boolean);
  const others = upcoming().filter(o => o.e.id !== e.id && !o.e.jam).filter((o, i, a) => a.findIndex(x => x.e.id === o.e.id) === i).slice(0, 4);
  const lu = C.lu?.length ? `<ul class="lu">${C.lu.map(([n, i]) => `<li><b>${esc(n)}</b> <span>${esc(i)}</span></li>`).join('')}</ul>` : '';
  const prices = e.price ? `<p class="ch-price"><span>${T('Plein')} <b>${e.price} €</b></span><span>${T('Réduit')} <b>${pjcP(e)} €</b></span>${e.jeune ? `<span>${T('Jeune')} <b>${e.jeune} €</b></span>` : ''}</p>
      <p class="fine">${T('Réduit : carte Paris Jazz Club, groupes 10+ · Jeune : −25 ans, étudiants, demandeurs d’emploi')}</p>`
    : `<p class="ch-price"><span><b>${T('Entrée libre')}</b>${EN ? ' · drink purchase required' : ' · consommation obligatoire'}</span></p>`;
  const live2 = !/claudeusercontent\.com$/.test(location.hostname);
  const video = C.yt ? (live2
      ? `<div class="vp is-playing"><iframe src="https://www.youtube-nocookie.com/embed/${C.yt}?rel=0&modestbranding=1" title="Vidéo — ${esc(name(e))}" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`
      : `<div class="vp" data-yt="${C.yt}"><img src="assets/img/yt/${C.yt}.webp" alt="" loading="lazy" decoding="async"><button class="vp-play" type="button" aria-label="Lire la vidéo de ${esc(name(e))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg><span>Lire la vidéo</span></button></div>`) : '';
  root.innerHTML = `
  <section class="chero" style="${gvars(e)}" aria-labelledby="ch-title"><div class="ch-grid">
    <div class="ch-when">
      <p class="ch-day"><b>${fmt.wdLong(shown[0].d)} ${fmt.day(shown[0].d)} ${fmt.monLong(shown[0].d)}</b> ${shown[0].d.slice(0, 4)}</p>
      <p class="ch-times">${e.jam ? (EN ? '11:30PM · free entry' : '23H30 · entrée libre') : shown[0].sets.map(x => x.t.replace(':', 'H')).join(' <i>|</i> ')}${e.dates.length > 1 ? ` <span class="more">· ${e.dates.length} ${T('soirs')}</span>` : ''}</p>
    </div>
    <h1 id="ch-title" class="ch-name">${esc(name(e))}</h1>
    ${e.sub ? `<p class="ch-sub">${e.jam ? `${T('avec')} ${esc(e.sub)}` : esc(e.sub)}</p>` : ''}
    ${lu}
    <div class="ch-book">
      ${shown.map(o => `<div class="ch-occ"><span class="ch-occ-d">${fmt.wd(o.d)} <b>${fmt.day(o.d)}</b></span>${e.jam ? `<p class="cc-jam">${T('23:30 · entrée libre · sans réservation')}</p>` : chips(o)}</div>`).join('')}
      ${prices}
      <p class="fine">${T('Placement libre assis · portes 30 min avant le set · 75 min')}</p>
      ${paras.length || C.yt ? `<a class="lnk more-l" href="#about" data-scroll="about">${T('Présentation et vidéo')} <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M10 3v14M5 12l5 5 5-5"/></svg></a>` : ''}
    </div>
    <figure class="ch-media">${media(e, '(max-width: 900px) 100vw, 45vw', true)}${e.jam ? '' : badge(e, 'big')}</figure>
    <div class="ch-sign" aria-hidden="true"><span class="logo"></span><p>42 rue des Lombards · 75001 Paris<br>01 42 33 22 88 · ducdeslombards.com</p></div>
  </div></section>
  ${paras.length || video ? `<section class="sec ch-about" id="about" style="${gvars(e)}"><div class="wrap ${paras.length && video ? 'two' : 'one'}">
    ${paras.length ? `<div><h2 class="sh">${T('Le concert')}</h2><p class="lede">${esc(paras[0])}</p>${paras.slice(1).map(x => `<p>${esc(x)}</p>`).join('')}</div>` : ''}
    ${video ? `<div><h2 class="sh">${T('En vidéo')}</h2>${video}</div>` : ''}</div></section>` : ''}
  ${e.affiche ? `<section class="sec aff" style="${gvars(e)}"><div class="wrap"><h2 class="sh">${T('L’affiche')}</h2>
    <picture><source media="(max-width: 700px)" srcset="assets/img/affiches/${e.affiche}-916.webp"><img src="assets/img/affiches/${e.affiche}-169.webp" alt="${EN ? 'Official poster' : 'Affiche officielle'} : ${esc(name(e))} au Duc des Lombards" loading="lazy" decoding="async" width="1600" height="900"></picture></div></section>` : ''}
  <section class="sec strip"><div class="wrap"><div><span class="k">${T('Accès')}</span><p>42, rue des Lombards · ${EN ? 'Châtelet metro, exit 10' : 'Métro Châtelet, sortie 10'}</p></div><div><span class="k">${T('Au bar')}</span><p><a href="${LP}bar.html">${T('Cocktails, vins & planches')}</a></p></div><div><span class="k">${T('Une question')}</span><p><a href="tel:+33142332288">01 42 33 22 88</a></p></div></div></section>
  ${others.length ? `<section class="sec"><div class="wrap"><div class="sec-head"><h2 class="sh">${T('À suivre au Duc')}</h2><a class="lnk" href="${LP}index.html">${T('Tout l’agenda')} ${AR}</a></div>
    <div class="grid">${others.map(o => card(o)).join('')}</div></div></section>` : ''}`;
  const ld = document.createElement('script'); ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify(e.dates.map(x => ({ '@context': 'https://schema.org', '@type': 'MusicEvent', name: title(e), startDate: `${x.d}T${x.sets[0].t}:00+01:00`,
    location: { '@type': 'MusicVenue', name: 'Le Duc des Lombards', address: INFO.address }, offers: e.price ? { '@type': 'Offer', price: e.price, priceCurrency: 'EUR', url: e.bt || BILLETTERIE } : undefined })));
  document.head.append(ld);
}

/* ancres de la fiche : défilement sans toucher au hash (qui porte l'identifiant du concert) */
document.addEventListener('click', ev => { const a = ev.target.closest('[data-scroll]'); if (!a) return; ev.preventDefault(); document.getElementById(a.dataset.scroll)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); });

/* Actualités : la semaine au Duc, générée depuis l'agenda */
function week() {
  const r = $('[data-week]'); if (!r) return;
  const end = addDays(todayISO(), 7), seen = new Set();
  r.innerHTML = upcoming().filter(o => !o.e.jam && o.d <= end && !seen.has(o.e.id) && seen.add(o.e.id)).map(o => card(o)).join('') || `<p class="fine">${EN ? 'No concert this week.' : 'Pas de concert cette semaine.'}</p>`;
}
/* Newsletter : formulaire prêt, à relier à l'outil d'emailing du Duc */
function newsletter() {
  const f = $('[data-newsletter]'); if (!f) return;
  f.addEventListener('submit', ev => { ev.preventDefault(); if (!f.reportValidity()) return;
    f.innerHTML = `<p class="lede">${EN ? 'Thank you! You will receive our next newsletter.' : 'Merci ! Vous recevrez notre prochaine newsletter.'}</p>`; });
}

/* « À l'affiche » sur les pages intérieures */
function upnext() {
  const r = $('[data-upnext]'); if (!r) return;
  const seen = new Set();
  r.innerHTML = upcoming().filter(o => !o.e.jam && !seen.has(o.e.id) && seen.add(o.e.id)).slice(0, 4).map(o => card(o)).join('');
}

/* ============ Booking sheet (1 clic) ============ */
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
    // Séance reliée à la billetterie officielle : on y va directement, séance déjà ouverte.
    // Tarif et nombre de places se choisissent une seule fois, sur la billetterie.
    warmCart();
    const prefs = store.get('prefs', { qty: 2, rate: 'plein' });
    this.st = { e, d, t, qty: prefs.qty, rate: prefs.rate === 'jeune' && !e.jeune ? 'plein' : prefs.rate, step: 'form' };
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
    return rate === 'jeune' && e.jeune ? e.jeune : rate === 'pjc' ? pjcP(e) : e.price;
  },
  render() {
    const { e, d, t, qty, rate, step } = this.st;
    const occ = e.dates.find(x => x.d === d);
    const user = store.get('user', null);
    const head = `<div class="grab" aria-hidden="true"></div>
      <div class="sh-head"><div class="sh-thumb">${media(e, '76px')}</div>
        <div><h3 id="sh-title">${esc(e.title)}</h3><p>${esc(e.sub || gc(e).label)}</p></div>
        <button class="x" type="button" data-close aria-label="Fermer">${ICON_X}</button></div>`;
    if (step === 'handoff') {
      const url = this.link();
      this.el.innerHTML = `<div class="sheet-in">${head}
        <div class="bt-memo is-big" role="status"><span class="sh-label">${this.st.added ? 'Ajouté au panier' : 'Billetterie ouverte dans un nouvel onglet'}</span><p>${this.st.added ? `<b>${this.st.qty} × ${BT_RATE[this.st.rate] || BT_RATE.plein}</b> · ${fmt.full(this.st.d)} à ${fmt.time(this.st.t)}. Votre panier est ouvert : il ne reste qu’à payer.` : this.memo()}</p>
          <p class="fine">Paiement sécurisé sur billetterie.ducdeslombards.com · places gardées 30 min · billets envoyés par e-mail.</p></div>
        <div class="row-btns"><a class="btn solid" href="${this.st.cartUrl || url}" target="_blank" rel="noopener">${this.st.added ? 'Ouvrir le panier' : 'Rouvrir la billetterie'}</a><button class="btn ghost" type="button" data-back>Modifier</button></div>
      </div>`;
      $('[data-close]', this.el).addEventListener('click', () => this.close());
      $('[data-back]', this.el).addEventListener('click', () => { this.st.step = 'form'; this.render(); });
      return;
    }
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
    const rateSeg = `<div><div class="sh-label">${EN ? 'Ticket' : 'Tarif'}</div><div class="seg">
      <button type="button" data-rate="plein" aria-pressed="${rate === 'plein'}">${T('Plein')}<small>${e.price} €</small></button>
      <button type="button" data-rate="pjc" aria-pressed="${rate === 'pjc'}">${T('Réduit')}<small>${pjcP(e)} € · Paris Jazz Club</small></button>
      ${e.jeune ? `<button type="button" data-rate="jeune" aria-pressed="${rate === 'jeune'}">${T('Jeune')}<small>${e.jeune} € · ${EN ? 'under 25' : '−25 ans'}</small></button>` : ''}</div></div>`;
    const who = user
      ? `<div class="express">Réservation express · ${esc(user.email)} <button type="button" data-forget>Changer</button></div>`
      : `<div class="field" style="margin:0"><label for="sh-mail">E-mail pour recevoir vos billets</label><input id="sh-mail" type="email" autocomplete="email" inputmode="email" placeholder="vous@exemple.fr" required></div>`;
    const total = this.price() * qty;
    const url = this.link();
    const memo = url ? `<p class="fine">Vos places sont ajoutées directement au panier de la billetterie officielle.</p>` : '';
    this.el.innerHTML = `<div class="sheet-in">${head}${dateSeg}${setSeg}${rateSeg}
      <div class="qty"><div><div class="sh-label" style="margin:0">${EN ? 'Seats' : 'Places'}</div><span class="fine">${EN ? 'Groups of 10+:' : 'Groupe de plus de 10 :'} <a href="${LP}privatiser.html">${EN ? 'group rate' : 'tarif groupe'}</a></span></div>
        <div class="stepper"><button type="button" data-q="-1" aria-label="Retirer une place">−</button><output class="num" aria-live="polite">${qty}</output><button type="button" data-q="1" aria-label="Ajouter une place">+</button></div></div>
      ${url ? memo : who}
      <div class="total"><span>Total</span><b class="num" data-total>${fmt.eur(total)}</b></div>
      <button type="button" class="btn pay"><span class="lbl">${url ? (EN ? 'Add to basket' : 'Ajouter au panier') : T('Réserver')} · ${fmt.eur(total)}</span><span class="spin" aria-hidden="true"></span></button>
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
      $('[data-total]', el).textContent = tot; $('.pay .lbl', el).textContent = `${this.link() ? (EN ? 'Add to basket' : 'Ajouter au panier') : T('Réserver')} · ${tot}`;
      const m = $('.bt-memo p', el); if (m) m.innerHTML = this.memo();
    }));
    $('[data-forget]', el)?.addEventListener('click', () => { store.set('user', null); this.render(); });
    $('.pay', el).addEventListener('click', () => this.pay());
  },
  memo() {
    const { d, t, qty, rate } = this.st;
    return `Ouvrez la séance du <b>${fmt.full(d)} à ${fmt.time(t)}</b>, choisissez <b>${qty} × ${BT_RATE[rate] || BT_RATE.plein}</b>, puis « Ajouter au panier ».`;
  },
  link() { const o = this.st.e.dates.find(x => x.d === this.st.d); const st = o && o.sets.find(x => x.t === this.st.t); return st && st.link; },
  pay() {
    const el = this.el, mail = $('#sh-mail', el);
    // Billetterie officielle : on ouvre la page exacte de la séance choisie, récap à l'appui.
    const url = this.link();
    if (url) {
      store.set('prefs', { qty: this.st.qty, rate: this.st.rate });
      const o = this.st.e.dates.find(x => x.d === this.st.d), set = o && o.sets.find(x => x.t === this.st.t);
      if (set.sid && !sameSite()) {
        // Hors ducdeslombards.com : la passerelle installée sur la billetterie ajoute et ouvre le panier.
        const u = BRIDGE_INSTALLED ? bridgeUrl(set.sid, this.st.qty, this.st.rate) : url;
        window.open(u, '_blank');
        Object.assign(this.st, { step: 'handoff', added: BRIDGE_INSTALLED, cartUrl: BRIDGE_INSTALLED ? BILLETTERIE + 'cart' : null }); this.render();
        return;
      }
      // Onglet ouvert dans le geste du clic (anti-bloqueur), rempli une fois le panier prêt.
      const w = window.open('', '_blank');
      const btn = $('.pay', el); btn.classList.add('is-loading'); btn.disabled = true;
      const go = (u, added) => {
        if (w && !w.closed) w.location.href = u; else window.open(u, '_blank', 'noopener');
        Object.assign(this.st, { step: 'handoff', added, cartUrl: added ? u : null }); this.render();
      };
      addToCart(set.sid, this.st.qty, this.st.rate)
        .then(cartUrl => go(cartUrl, true))
        .catch(() => go(url, false));
      return;
    }
    if (mail) {
      if (!mail.checkValidity() || !mail.value.includes('.')) {
        mail.setCustomValidity('Saisissez une adresse e-mail valide pour recevoir vos billets.'); mail.reportValidity();
        mail.addEventListener('input', () => mail.setCustomValidity(''), { once: true }); return;
      }
      store.set('user', { email: mail.value.trim() });
    }
    store.set('prefs', { qty: this.st.qty, rate: this.st.rate });
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
  const alt = nextBookable(o => o.e.genre === e.genre && o.e.id !== id) || nextBookable(o => o.d >= d);
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
const STYLES = { classic: 'Classic jazz', classique: 'Classic jazz', modern: 'Modern jazz', moderne: 'Modern jazz', world: 'World', monde: 'World', manouche: 'Manouche', gypsy: 'Manouche', vocal: 'Vocal', voix: 'Vocal', chant: 'Vocal', chanteuse: 'Vocal', piano: 'Piano', pianiste: 'Piano', groove: 'Groove', funk: 'Groove', folk: 'Folk', 'all star': 'All star', cuba: 'Comme à Cuba', cubain: 'Comme à Cuba', latin: 'Comme à Cuba', guitare: 'Guitar', guitar: 'Guitar', crooner: 'Crooner', standard: 'Standards', batterie: 'Drums', drums: 'Drums', album: "Sortie d'album", noel: 'Vocal', christmas: 'Vocal', contrebasse: 'Contrebasse' };
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
    if (!ok.length && !e.jam) { const alt = nextBookable(o => o.e.genre === e.genre && o.e.id !== e.id) || nextBookable(); if (alt) out.occ.push(alt); }
    return out;
  }
  if (dayFilter && styleKey) {
    const tag = norm(STYLES[styleKey]);
    const both = upcoming().filter(o => dayFilter.includes(o.d) && norm(o.e.tag + ' ' + gc(o.e).label).includes(tag));
    if (both.length) { out.html = `<p>${dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)}, côté ${esc(STYLES[styleKey].toLowerCase())} :</p>`; out.occ = both.slice(0, 3); return out; }
    const next = upcoming().filter(o => norm(o.e.tag + ' ' + gc(o.e).label).includes(tag) && o.d >= dayFilter[0]);
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
    const occ = upcoming().filter(o => norm(o.e.tag + ' ' + gc(o.e).label).includes(norm(tag)) || (styleKey === 'noel' || styleKey === 'christmas') && /christmas/i.test(o.e.sub || ''));
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
  fab.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.4A8.5 8.5 0 1 1 21 12Z"/><circle cx="8.5" cy="12" r=".8" fill="currentColor"/><circle cx="12" cy="12" r=".8" fill="currentColor"/><circle cx="15.5" cy="12" r=".8" fill="currentColor"/></svg><span class="fab-l">Une question ?</span>`;
  const p = document.createElement('div'); p.className = 'bot'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Assistant du Duc des Lombards');
  p.innerHTML = `<div class="bot-h"><span class="av" aria-hidden="true"></span><div><b>Une question sur le Duc ?</b><span>Assistant automatique · réponses tirées du site</span></div><button class="x" type="button" aria-label="Fermer l’assistant">${ICON_X}</button></div>
    <div class="bot-log" aria-live="polite"></div>
    <div class="quick">${['Ce soir', 'Ce week-end', 'Du piano', 'Tarifs', 'Venir au Duc', 'Jam session', 'Privatiser'].map(q => `<button class="chip" type="button">${q}</button>`).join('')}</div>
    <form class="bot-f"><label for="bot-in">Écrivez votre question</label><div class="bot-row"><input id="bot-in" autocomplete="off" placeholder="Ex. : un concert ce soir ?"><button type="submit" aria-label="Envoyer"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h13M11 5l5 5-5 5"/></svg></button></div></form>`;
  const scrim = document.createElement('div'); scrim.className = 'bot-scrim'; scrim.setAttribute('aria-hidden', 'true');
  document.body.append(scrim, p); ($('.hdr .burger') ? $('.hdr .burger').before(fab) : document.body.append(fab));
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
    const nm = o.e.jam ? `Jam du Duc · ${o.e.sub}` : o.e.title;
    const b = document.createElement(st ? 'button' : 'a');
    b.className = 'bot-go msg-in' + (st ? '' : ' is-off');
    if (st) { b.type = 'button'; Object.assign(b.dataset, { book: o.e.id, d: o.d, t: st.t }); }
    else b.href = link(o.e);
    b.innerHTML = `<span>${esc(nm)}<small>${fmt.wd(o.d)} ${ddmm(o.d)}${st ? ` · ${st.t}` : o.e.jam ? ' · 23:30 · entrée libre' : ' · complet'}</small></span><b>${st ? 'Réserver' : 'Voir'} →</b>`;
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
    p.classList.toggle('is-open', v); scrim.classList.toggle('is-on', v); requestAnimationFrame(() => fit && fit()); document.documentElement.style.overflow = v ? 'hidden' : ''; fab.setAttribute('aria-expanded', v);
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
  document.addEventListener('click', e => { if (e.target.closest('[data-open-bot]')) { e.preventDefault(); open(true); } });
}
/* ============ Motion (motion.dev) : discret, au service de la lecture ============ */
let M = null;
const EO = [.23, 1, .32, 1], IO = [.77, 0, .175, 1];
function splitText(el) {
  if (el.dataset.split) return $$('.lt > i', el);
  const walk = node => [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(p => {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.append(document.createTextNode(' ')); return; }
        const word = document.createElement('span'); word.style.display = 'inline-block'; word.style.whiteSpace = 'nowrap';
        [...(Intl.Segmenter ? [...new Intl.Segmenter('fr', { granularity: 'grapheme' }).segment(p.normalize('NFC'))].map(x => x.segment) : [...p.normalize('NFC')])].forEach(u => { const w = document.createElement('span'); w.className = 'lt'; const i = document.createElement('i'); i.textContent = u; w.append(i); word.append(w); });
        frag.append(word);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
  });
  walk(el); el.dataset.split = 1;
  return $$('.lt > i', el);
}
function heroIn() {
  if (!M) return;
  const h = $('.chero'); if (!h) return;
  const n = $('.ch-name', h);
  M.animate(splitText(n), { transform: ['translateY(105%)', 'translateY(0%)'] }, { duration: .8, delay: M.stagger(.025, { startDelay: .1 }), ease: IO });
  M.animate($('.duo', h), { clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'] }, { duration: .9, ease: IO });
  M.animate($$('.ch-when, .ch-sub, .lu, .ch-book, .ch-sign', h), { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0px)'] }, { duration: .6, delay: M.stagger(.06, { startDelay: .3 }), ease: EO });
  const b = $('.badge', h); if (b) M.animate(b, { transform: ['scale(0) rotate(-90deg)', 'scale(1) rotate(0deg)'] }, { type: 'spring', stiffness: 220, damping: 14, delay: .6 });
}
async function motion() {
  if (reduce) return;
  try { M = await import('https://cdn.jsdelivr.net/npm/motion@11/+esm'); } catch { return; }
  document.documentElement.classList.add('js-motion');
  const { animate, inView, stagger } = M;
  heroIn();
  // cartes visibles au chargement : entrée en cascade ; les suivantes au défilement
  const vis = $$('.cc').filter(c => !c.hidden && c.getBoundingClientRect().top < innerHeight);
  animate(vis, { opacity: [0, 1], transform: ['translateY(16px)', 'translateY(0px)'] }, { duration: .5, delay: stagger(.035), ease: EO });
  inView($$('.cc').filter(c => !vis.includes(c)), a => { const el = a.target || a; animate(el, { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0px)'] }, { duration: .55, ease: EO }); }, { margin: '0px 0px -6% 0px' });
  $$('main .ph h1').forEach(h => animate(splitText(h), { transform: ['translateY(105%)', 'translateY(0%)'] }, { duration: .7, delay: stagger(.025), ease: IO }));
  inView('[data-count]', a => { const el = a.target || a; const to = +el.dataset.count; animate(0, to, { duration: 1.4, ease: EO, onUpdate: v => el.textContent = Math.round(v) + (el.dataset.suffix || '') }); });
}

/* ---------- Panneau de réservation : volet ---------- */
function sheetIn(el) {
  if (!M) return;
  M.animate(el, { transform: innerWidth < 900 ? ['translateY(100%)', 'translateY(0%)'] : ['translateX(100%)', 'translateX(0%)'] }, { duration: .5, ease: IO });
  M.animate($$('.sheet-in > *', el), { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0px)'] }, { duration: .45, delay: M.stagger(.04, { startDelay: .18 }), ease: EO });
}
function sheetOut(el) { return M ? M.animate(el, { transform: innerWidth < 900 ? ['translateY(0%)', 'translateY(100%)'] : ['translateX(0%)', 'translateX(100%)'] }, { duration: .35, ease: IO }).finished.then(() => { el.style.transform = ''; }) : Promise.resolve(); }
function successIn(el) {
  if (!M) return;
  M.animate($$('.ticket, .row-btns, .sh-success .fine', el), { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0)'] }, { duration: .5, delay: M.stagger(.08, { startDelay: .3 }), ease: EO });
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
({ agenda, concert })[page]?.();
$$('[data-toc]').forEach(d => { if (innerWidth > 900) d.open = true; });
upnext(); week(); newsletter(); if (!EN) bot(); quote();
{ const n = nextBookable(); $$('[data-next]').forEach(b => { if (n) { b.dataset.book = n.e.id; b.dataset.d = n.d; b.dataset.t = n.set.t; } }); }
motion();
