/*
 * Passerelle « ajout direct au panier » — à installer sur billetterie.ducdeslombards.com
 * (champ « JavaScript personnalisé » du thème Supersoniks, ou balise <script> en pied de page).
 *
 * Le site du Duc (quel que soit son domaine) envoie le visiteur sur :
 *   https://billetterie.ducdeslombards.com/cart#duc-add=<séance>.<tarif>.<quantité>
 *   ex. #duc-add=4103.plein.2   (tarif : plein | reduit | jeune)
 * Ce script ajoute les places au panier du visiteur puis affiche le panier.
 * Sans ce hash, il ne fait rien.
 */
(function () {
  var m = location.hash.match(/^#duc-add=(\d+)\.(plein|reduit|jeune)\.(\d{1,2})$/);
  if (!m) return;
  history.replaceState(null, '', location.pathname + location.search);
  var sid = +m[1], rate = m[2], qty = Math.min(10, Math.max(1, +m[3]));
  var RE = { plein: /PLEIN/i, reduit: /R[ÉE]DUIT/i, jeune: /JEUNE/i };

  function tokenFromPage() {
    var el = document.querySelector('[token]');
    if (el && /^ey/.test(el.getAttribute('token'))) return Promise.resolve(el.getAttribute('token'));
    return fetch('/cart', { credentials: 'include' }).then(function (r) { return r.text(); }).then(function (h) {
      var t = h.match(/token["']?\s*[=:]\s*["'](ey[^"']+)["']/i); if (!t) throw new Error('token'); return t[1];
    });
  }
  function api(tk, path, opts) {
    opts = opts || {};
    var headers = { Authorization: 'Bearer ' + tk, Accept: 'application/json' };
    if (opts.body) headers['Content-Type'] = 'application/json';
    return fetch('/api/v2' + path, { method: opts.method || 'GET', credentials: 'include', headers: headers, body: opts.body })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j || j.success === false) throw new Error('api'); return j.data; });
  }

  tokenFromPage().then(function (tk) {
    return api(tk, '/sessions/' + sid + '?features[]=prices&features[]=stock').then(function (s) {
      var prices = (s.prices || []).filter(function (p) { return p.online !== false && p.price_available !== false; });
      var price = prices.filter(function (p) { return RE[rate].test(p.title); })[0] || prices[0];
      var quota = ((s.stock && s.stock.details) || []).filter(function (d) { return d.has_available; })[0] || { quota_id: 1 };
      if (!price) throw new Error('prix');
      return api(tk, '/cart/current/items', {
        method: 'POST',
        body: JSON.stringify({ items: [{ entity_type: 'event', entity_id: sid, quantity: qty, price: { id: price.id }, quota: { id: quota.quota_id } }], auto_seating: false })
      });
    });
  }).then(function () {
    location.replace('/cart');            // recharge le panier, à jour
  }).catch(function () {
    location.replace('/'); // repli : accueil de la billetterie
  });
})();
