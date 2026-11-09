/*
 * Ajout direct au panier de la billetterie officielle (billetterie.ducdeslombards.com, moteur Supersoniks).
 *
 * Parcours : on récupère le jeton public de la session billetterie (même cookie que le visiteur),
 * on lit les tarifs de la séance, on ajoute N places au bon tarif, puis on ouvre /cart.
 * Ça fonctionne quand le site est servi depuis ducdeslombards.com (même site que la billetterie :
 * cookies partagés, CORS accepté). Sinon, repli automatique sur la page de la séance.
 */
import { BILLETTERIE } from './data.js';

const B = BILLETTERIE.replace(/\/$/, '');
const RATE_RE = { plein: /PLEIN/i, pjc: /R[ÉE]DUIT/i, jeune: /JEUNE/i };
let tokenP = null;

/*
 * Passerelle billetterie (billetterie/duc-bridge.js) : passez à true une fois le script installé
 * sur billetterie.ducdeslombards.com. L'ajout direct au panier marche alors depuis n'importe quel
 * domaine (GitHub Pages compris), sans appel cross-origin.
 */
export const BRIDGE_INSTALLED = false;
const BT_RATE_KEY = { plein: 'plein', pjc: 'reduit', jeune: 'jeune' };
export const sameSite = () => /(^|\.)ducdeslombards\.com$/.test(location.hostname);
export const bridgeUrl = (sid, qty, rate = 'plein') => `${B}/cart#duc-add=${+sid}.${BT_RATE_KEY[rate] || 'plein'}.${Math.min(10, Math.max(1, qty))}`;

async function token() {
  if (!tokenP) tokenP = fetch(B + '/cart', { credentials: 'include' })
    .then(r => r.text())
    .then(h => { const m = h.match(/token["']?\s*[=:]\s*["'](ey[^"']+)["']/i); if (!m) throw new Error('token'); return m[1]; })
    .catch(e => { tokenP = null; throw e; });
  return tokenP;
}

async function api(path, opts = {}) {
  const tk = await token();
  const r = await fetch(B + '/api/v2' + path, {
    credentials: 'include', ...opts,
    headers: { Authorization: 'Bearer ' + tk, Accept: 'application/json', ...(opts.body ? { 'Content-Type': 'application/json' } : {}) },
  });
  const j = await r.json().catch(() => null);
  if (!r.ok || !j || j.success === false) throw new Error((j && j.messages && j.messages.map(m => m.content).join(' ')) || 'HTTP ' + r.status);
  return j.data;
}

/** Ajoute qty places (tarif plein | pjc | jeune) de la séance sid. Renvoie l'URL du panier. */
export async function addToCart(sid, qty, rate = 'plein') {
  const s = await api(`/sessions/${sid}?features[]=prices&features[]=stock`);
  const prices = (s.prices || []).filter(p => p.online !== false && p.price_available !== false);
  const price = prices.find(p => RATE_RE[rate]?.test(p.title)) || prices.find(p => RATE_RE.plein.test(p.title)) || prices[0];
  if (!price) throw new Error('Aucun tarif en vente');
  const q = (s.stock?.details || []).find(d => d.has_available) || { quota_id: 1 };
  await api('/cart/current/items', {
    method: 'POST',
    body: JSON.stringify({ items: [{ entity_type: 'event', entity_id: +sid, quantity: qty, price: { id: price.id }, quota: { id: q.quota_id } }], auto_seating: false }),
  });
  return B + '/cart';
}

/** Préchauffe le jeton (au survol / à l'ouverture du panneau) pour un ajout quasi instantané. */
export function warmCart() { if (sameSite()) token().catch(() => {}); }
