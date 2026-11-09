/* Connecteur SoTicket (Supersoniks — API externe v2, lecture seule)
 * ------------------------------------------------------------------
 * Ce que l'API fournit (GET /api/v2/sessions, Bearer JWT) :
 *   start_date (timestamp s), stock { available, gauge, sold },
 *   infos_status { available, closed }, prices[], public_link (page de vente).
 * Ce qu'elle ne fournit pas : panier, commande, paiement (écritures sur devis).
 * → Le site affiche les disponibilités et tarifs en direct, puis le clic
 *   « Payer » ouvre la page de vente SoTicket de la séance (public_link).
 *
 * Le jeton JWT ne doit JAMAIS être dans le navigateur : on passe par le
 * proxy serveur api/soticket.php (ou équivalent), qui ajoute le jeton,
 * filtre les champs et met en cache 5 minutes (comme l'API).
 */

export const SOTICKET = {
  // URL du proxy. Laisser null tant que le jeton Supersoniks n'est pas fourni :
  // le site utilise alors les données de démonstration (assets/data.js).
  endpoint: null, // ex. '/api/soticket.php'
  daysAhead: 60,
  lastPlacesThreshold: 0.1, // « Dernières places » sous 10 % de la jauge (ou ≤ 8 places)
};

const pad = n => String(n).padStart(2, '0');
const parisParts = ts => {
  const f = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const p = Object.fromEntries(f.formatToParts(new Date(ts * 1000)).map(x => [x.type, x.value]));
  return { d: `${p.year}-${p.month}-${p.day}`, t: `${pad(+p.hour)}:${p.minute}` };
};

const statusOf = s => {
  const st = s.stock || {}, info = s.infos_status || {};
  if (info.closed || info.available === false || st.available === 0) return 'full';
  const gauge = st.gauge || st.initial || 0;
  if (st.available != null && (st.available <= 8 || (gauge && st.available / gauge <= SOTICKET.lastPlacesThreshold))) return 'last';
  return 'ok';
};

const priceOf = s => {
  const amounts = (s.prices || []).filter(p => p.price_available !== false).map(p => p.amount_display ?? p.amount).filter(x => typeof x === 'number');
  return amounts.length ? { max: Math.max(...amounts), min: Math.min(...amounts), list: s.prices } : null;
};

/** Récupère les séances à venir et les applique aux évènements du site. */
export async function syncSoTicket(EVENTS) {
  if (!SOTICKET.endpoint) return { live: false };
  const from = Math.floor(Date.now() / 1000), to = from + SOTICKET.daysAhead * 86400;
  const res = await fetch(`${SOTICKET.endpoint}?from=${from}&to=${to}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`SoTicket ${res.status}`);
  const sessions = await res.json();
  const index = new Map();
  for (const s of sessions) {
    const { d, t } = parisParts(s.start_date);
    index.set(`${d}|${t}`, s);
  }
  let matched = 0;
  for (const e of EVENTS) for (const date of e.dates) for (const set of date.sets) {
    const s = index.get(`${date.d}|${set.t}`);
    if (!s || set.s === 'door') continue;
    set.s = statusOf(s);
    set.link = s.public_link || null;
    set.sid = s.id;
    const pr = priceOf(s);
    if (pr) { e.price = pr.max; e.priceMin = pr.min; e.prices = pr.list; }
    matched++;
  }
  return { live: true, matched };
}
