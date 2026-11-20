# Le Duc des Lombards — refonte (maquette)

Proposition de refonte du site [ducdeslombards.com](https://ducdeslombards.com) : club de jazz, Paris · Châtelet.

- Site statique multipage (HTML, CSS, JS), sans framework ni traceur.
- **v4 « affiche papier »** : l'accueil est l'agenda (8 à 10 concerts visibles sans défiler sur ordinateur, 4 à 5 sur mobile), charte inspirée des visuels 2026 du Duc (papier crème, League Spartan + Archivo, une couleur par famille musicale, pastille dorée), photos en bichromie générées en CSS à partir des photos d'origine : aucun détourage à préparer.
- 1 clic pour découvrir (toute la carte ouvre la fiche artiste), 1 clic pour réserver (horaire 19:30 / 22:00).
- Familles et couleurs : `GENRES` dans `assets/data.js` ; visuels officiels dans `assets/img/affiches/`.
- Assistant (chatbot) conservé, plus discret, sur les contenus du site ; lecteur YouTube intégré sur chaque fiche concert.
- Animations Motion (motion.dev) légères.
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

## Mettre à jour le site (pour l'équipe du Duc)

- **Ajouter un concert** : une ligne dans `EVENTS` (`assets/data.js`) avec titre, sous-titre, tarifs, dates et sets, plus la photo d'origine en `assets/img/<nom>-480.webp` et `-960.webp`. Aucun détourage : la bichromie est générée automatiquement.
- **Style musical** : une ligne dans `G` (même fichier) → `classic`, `modern`, `vocal`, `world` ou `manouche`. Couleur et pastille suivent.
- **Cadrage du visage** : une ligne dans `FOCUS` (`'nom': 'x% y%'`).
- **Affiche officielle** : déposer `assets/img/affiches/<nom>-169.webp` et `-916.webp`, puis l'ajouter dans `AFF`.
- **À valider par le Duc** : les styles attribués aux artistes absents des visuels fournis (liste `G`).

## Pages et langues

- Pages : Agenda (accueil), fiche concert, Le Duc, Bar (carte complète), Actualités, Infos, Privatiser, Membres, Espace pro, Newsletter.
- Version anglaise dans `en/` (générée par `tools/build.py` : `python3 tools/build.py .`). Les présentations d'artistes restent en français ; l'assistant n'est proposé qu'en français.
- **Newsletter** : le formulaire est prêt mais doit être relié à l'outil d'emailing du Duc (non identifié sur le site actuel).
- **Carte du bar** : les prix au verre et à la bouteille renvoient au PDF officiel (leur rattachement n'est pas lisible de façon fiable dans le PDF).
