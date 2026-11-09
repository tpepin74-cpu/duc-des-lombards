# Le Duc des Lombards — refonte (maquette)

Proposition de refonte du site [ducdeslombards.com](https://ducdeslombards.com) : club de jazz, Paris · Châtelet.

- Site statique multipage (HTML, CSS, JS), sans framework ni traceur.
- Réservation en 1 clic, chatbot sur les contenus du site, lecteur YouTube intégré sur chaque fiche concert.
- Animations Motion (motion.dev) et Lottie, palette saphir / cyan / jade.
- Maquette désindexée des moteurs de recherche (`noindex` + `robots.txt`).

Contenus, photos et vidéos repris du site actuel du Duc des Lombards. Paiement simulé : à brancher sur la billetterie officielle.

## Connecteur billetterie SoTicket (Supersoniks)

- `assets/soticket.js` : lit les séances (`GET /api/v2/sessions`, features `prices`, `stock`, `status`) via un proxy, met à jour en direct les états (disponible / dernières places / complet) et les tarifs, puis envoie l'acheteur sur la page de vente de la séance (`public_link`). L'API externe étant en lecture seule, le paiement se finalise sur SoTicket.
- `api/soticket.php` : proxy serveur qui garde le jeton JWT secret, filtre les champs et met en cache 5 minutes. À déposer sur un hébergement PHP (GitHub Pages n'exécute pas de PHP).
- Activation : renseigner `SOTICKET_TOKEN` côté serveur, puis `endpoint: '/api/soticket.php'` dans `assets/soticket.js`. Tant que l'endpoint est vide, le site utilise les données de démonstration.

## Ajout direct au panier de la billetterie

Le bouton « Ajouter au panier » met les places dans le panier de billetterie.ducdeslombards.com et l'ouvre.

- **Site servi depuis ducdeslombards.com** : fonctionne tel quel (appel direct à l'API de la billetterie).
- **Site servi depuis un autre domaine (GitHub Pages…)** : la billetterie refuse les appels d'un autre domaine.
  Installer `billetterie/duc-bridge.js` sur la billetterie (JavaScript personnalisé du thème Supersoniks
  ou `<script>` en pied de page), puis passer `BRIDGE_INSTALLED = true` dans `assets/cart.js`.
  Le site envoie alors vers `…/cart#duc-add=<séance>.<plein|reduit|jeune>.<quantité>` et la passerelle remplit le panier.
- Tant que la passerelle n'est pas activée, le bouton ouvre la page de la séance sur la billetterie.
