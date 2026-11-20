"""Le Duc des Lombards — v4 « affiche papier » : agenda en accueil, photos en bichromie, couleurs par famille musicale."""
import pathlib, sys
OUT = pathlib.Path(sys.argv[1])

NAV = [("index.html", "Agenda"), ("le-duc.html", "Le Duc"), ("bar.html", "Bar"),
       ("infos.html", "Infos"), ("privatiser.html", "Privatiser"), ("membre.html", "Membres")]
AR = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M3 10h14M12 5l5 5-5 5"/></svg>'
MAPS = "https://www.google.com/maps/search/?api=1&amp;query=Duc+des+Lombards+42+rue+des+Lombards+75001+Paris"

def page(file, title, desc, body, data_page="", current="", upnext=True):
    nav = "".join(f'<a href="{h}"{" aria-current=\"page\"" if h == current else ""}>{t}</a>' for h, t in NAV)
    menu = "".join(f'<a href="{h}">{t}</a>' for h, t in NAV)
    up = f"""<section class="sec upnext" aria-labelledby="up-t"><div class="wrap"><div class="sec-head"><h2 class="sh" id="up-t">À l’affiche</h2><a class="lnk" href="index.html">Tout l’agenda {AR}</a></div><div class="grid" data-upnext></div></div></section>""" if upnext else ""
    html = f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#f3ede3">
<meta property="og:type" content="website"><meta property="og:site_name" content="Le Duc des Lombards">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}">
<meta property="og:image" content="assets/img/affiches/leron-169.webp">
<link rel="icon" href="assets/img/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..100,400..800&family=League+Spartan:wght@600..900&display=swap">
<link rel="stylesheet" href="assets/site.css">
<script type="module" src="assets/app.js"></script>
</head>
<body data-page="{data_page}">
<a class="skip" href="#main">Aller au contenu</a>
<header class="hdr"><div class="wrap">
  <a class="brand" href="index.html" aria-label="Le Duc des Lombards, club de jazz à Paris — agenda"><span class="logo" aria-hidden="true"></span><span class="brand-tx"><b>Club de jazz</b>Paris · Châtelet</span></a>
  <nav class="nav" aria-label="Navigation principale">{nav}</nav>
  <a class="hdr-tel" href="tel:+33142332288">01 42 33 22 88</a>
  <button class="burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="menu"><span></span><span></span></button>
</div></header>
<nav class="menu" id="menu" aria-label="Menu mobile">{menu}<p class="menu-foot">42, rue des Lombards · Paris 1er<br><a href="tel:+33142332288">01 42 33 22 88</a></p></nav>
<main id="main">
{body}
{up}
</main>
<footer class="ftr"><div class="wrap">
  <div class="ftr-a"><span class="logo" aria-hidden="true"></span><p>42, rue des Lombards<br>75001 Paris · Métro Châtelet</p><p><a href="tel:+33142332288">01 42 33 22 88</a><br><a href="mailto:contact@ducdeslombards.com">contact@ducdeslombards.com</a></p></div>
  <nav class="ftr-links" aria-label="Pied de page"><a href="index.html">Agenda</a><a href="le-duc.html">Le Duc</a><a href="bar.html">Bar</a><a href="infos.html">Infos</a><a href="infos.html#cadeau">Carte cadeau</a><a href="privatiser.html">Privatiser</a><a href="membre.html">Membres</a><a href="https://www.instagram.com/ducdeslombards/" rel="noopener">Instagram</a><a href="https://www.facebook.com/ducdeslombards" rel="noopener">Facebook</a></nav>
  <p class="ftr-base"><span>Concerts du lundi au samedi · 19:30 & 22:00 · Jams ven. & sam. 23:30</span><span>Site écoconçu · sans traceur · <a href="infos.html#contact">Mentions légales</a></span></p>
</div></footer>
</body>
</html>"""
    (OUT / file).write_text(html, encoding="utf-8")

def phero(h1, color, lede, acts="", cut=None):
    return f'''<section class="ph"><div class="wrap"><h1>{h1}</h1>{f'<p class="lede">{lede}</p>' if lede else ''}<div class="acts">{acts or f'<button class="btn solid" type="button" data-next>Réserver le prochain concert {AR}</button>'}</div></div></section>'''

# ---------------- Agenda = accueil ----------------
AG = """
<section class="ag-head"><div class="wrap">
  <h1>Agenda <span>Le Duc des Lombards · club de jazz à Paris · 2 concerts par soir</span></h1>
  <div class="ag-tools"><label class="sr" for="q">Rechercher un artiste</label><input id="q" class="search" type="search" placeholder="Rechercher un artiste" data-q>
    <div class="vt" data-view role="group" aria-label="Affichage"><button type="button" data-v="grid" aria-pressed="true" aria-label="Vue affiches"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 1h6v6H1zM9 1h6v6H9zM1 9h6v6H1zM9 9h6v6H9z" fill="currentColor"/></svg></button><button type="button" data-v="list" aria-pressed="false" aria-label="Vue liste"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 2h14v2.5H1zM1 6.75h14v2.5H1zM1 11.5h14V14H1z" fill="currentColor"/></svg></button></div></div>
</div>
<div class="filters"><div class="wrap" data-tags role="group" aria-label="Filtrer les concerts"></div></div></section>
<div class="wrap ag"><div data-agenda data-v="grid" aria-live="polite"></div></div>
"""
page("index.html", "Le Duc des Lombards — Club de jazz à Paris · Agenda et réservation",
     "Le Duc des Lombards, club de jazz à Châtelet, Paris : l’agenda des concerts, 19:30 et 22:00 du lundi au samedi. Réservez en un clic.", AG, "agenda", "index.html", upnext=False)
page("agenda.html", "Agenda — Le Duc des Lombards, club de jazz à Paris", "Tous les concerts du Duc des Lombards. Réservation en un clic.", AG, "agenda", "index.html", upnext=False)
page("concert.html", "Concert — Le Duc des Lombards", "Concert au Duc des Lombards, Paris 1er. Réservation en un clic.", '<div data-concert></div>', "concert", "index.html", upnext=False)

# ---------------- Le Duc ----------------
team = [("Lionel Guy-Bremond", "Gérant"), ("Marc Welinski", "Gérant"), ("Sébastien Vidal", "Direction artistique"),
        ("Noëmi Flamen", "Direction adjointe"), ("Laure Stokober", "Administration"), ("Amma Dakwa", "Coordination de salle"),
        ("Michel Chan", "Chef de salle"), ("Julien Oumraou", "Chef de salle"), ("Carine Nguyen", "Cheffe de salle"), ("Daniel Lamidey", "Bar")]
leduc = phero('Le Duc', "sapphire", "Un piano sous l’escalier, Bobby Few, le début des années 80. Le reste est une histoire de jazz.", cut="chivallon") + f"""
<section class="sec"><div class="g12">
  <div class="photo c7"><img src="assets/img/room-1152.webp" srcset="assets/img/room-576.webp 576w, assets/img/room-1152.webp 1152w" sizes="(max-width: 800px) 100vw, 58vw" alt="La scène du Duc vue d’en haut" loading="lazy" decoding="async"></div>
  <div class="c5" style="display:grid">
    <div class="cell" style="border-right:0"><span class="k">Par an</span><b class="huge num" data-count="300" data-suffix="+">300+</b></div>
    <div class="cell" style="border-right:0"><span class="k">Par soir</span><b class="huge num">2 sets</b></div>
    <div class="cell" style="border-right:0;border-bottom:0"><span class="k">Par set</span><b class="huge num">75′</b></div>
  </div>
</div></section>
<section class="sec"><div class="sec-head"><h2>Selon <span class="it">Bobby Few</span></h2></div>
  <div class="wrap" style="padding-bottom:var(--pad)"><ol class="list"><li>Un bon piano</li><li>Un patron ouvert</li><li>Un public attentif</li><li>Un lieu pour improviser après</li><li>La proximité</li></ol></div></section>
<section class="sec" id="equipe"><div class="sec-head"><h2>L’équipe</h2></div>
  <div class="g12">{"".join(f'<div class="cell c3"><span class="k">{r}</span><h3>{n}</h3></div>' for n, r in team)}</div></section>
<section class="sec"><div class="g12"><div class="cell c12" style="border-right:0;border-bottom:0"><span class="k">Partenaires</span><p class="lede" style="max-width:none">TSF Jazz · CNM · ADAMI · SACEM · Ville de Paris · Copie privée · Paris Jazz Club · SPEDIDAM</p></div></div></section>"""
page("le-duc.html", "Le Duc — histoire et équipe | Le Duc des Lombards", "L’histoire du Duc des Lombards, club de jazz de Châtelet depuis les années 80.", leduc, "duc", "le-duc.html")

# ---------------- Bar ----------------
bar = phero('Bar', "jade", "Vins, champagnes, whiskies et cocktails de producteurs indépendants.",
            f'<a class="btn" href="https://ducdeslombards.com/fr/le-bar" target="_blank" rel="noopener">La carte {AR}</a><button class="btn solid" type="button" data-next>Réserver {AR}</button>') + """
<section class="sec"><div class="g12">
  <div class="cell c12 inv" style="border-right:0"><span class="k">Cocktails maison</span><b class="huge">It’s All About <em>Jazz !</em></b></div>
  <div class="cell c4"><span class="k">À partager</span><h3>Charcuterie Seguin Gourmet</h3></div>
  <div class="cell c4"><span class="k">À partager</span><h3>Fromages Jean-Yves Bordier</h3></div>
  <div class="cell c4" style="border-right:0"><span class="k">Focus</span><h3>Champagne Dehours et Fils</h3></div>
</div></section>"""
page("bar.html", "Le Bar — Le Duc des Lombards", "Cocktails « It’s All About Jazz ! », vins et champagnes indépendants, planches Seguin Gourmet et fromages Bordier.", bar, "bar", "bar.html")

# ---------------- Infos ----------------
infos = phero('Infos', "black", "42, rue des Lombards, Paris 1er. Métro Châtelet, sortie 10.",
              f'<a class="btn" href="{MAPS}" target="_blank" rel="noopener">Itinéraire {AR}</a><button class="btn solid" type="button" data-next>Réserver {AR}</button>', cut="leron") + f"""
<div class="filters"><div class="wrap"><a class="chip" href="#tarifs">Tarifs</a><a class="chip" href="#venir">Venir</a><a class="chip" href="#pmr">Accessibilité</a><a class="chip" href="#cadeau">Carte cadeau</a><a class="chip" href="#contact">Contact</a></div></div>
<section class="sec" id="tarifs"><div class="g12">
  <div class="cell c5"><span class="k">Tarifs & horaires</span><b class="huge">29–41 €</b></div>
  <div class="cell c7" style="border-right:0"><table class="prices"><tbody>
    <tr><th>1<sup>er</sup> set<small>Portes 19:00</small></th><td class="num">19:30</td></tr>
    <tr><th>2<sup>e</sup> set<small>Portes 21:30</small></th><td class="num">22:00</td></tr>
    <tr><th>−25 ans, étudiants, demandeurs d’emploi</th><td class="num">−7 €</td></tr>
    <tr><th>Paris Jazz Club, groupes 10+</th><td class="num">−3 €</td></tr>
    <tr><th>Jams du Duc<small>Ven. & sam. dès 23:30</small></th><td>Libre</td></tr>
  </tbody></table></div>
</div></section>
<section class="sec" id="venir"><div class="g12">
  <div class="cell c3"><span class="k">Métro</span><h3>Châtelet<br>1 · 4 · 7 · 11 · 14</h3></div>
  <div class="cell c3"><span class="k">RER</span><h3>Châtelet-Les Halles<br>A · B</h3></div>
  <div class="cell c3"><span class="k">Noctilien</span><h3>N11–N16 · N21–N24</h3></div>
  <div class="cell c3" style="border-right:0"><span class="k">Parkings</span><h3>Indigo Sébastopol<br>Saemes Les Halles</h3></div>
</div></section>
<section class="sec" id="pmr"><div class="g12">
  <div class="cell c5"><span class="k">Accessibilité</span><b class="huge">PMR</b></div>
  <div class="cell c7" style="border-right:0"><ul class="list plain"><li>File prioritaire chaque soir</li><li>Accès par la porte principale</li><li>Registre à l’accueil</li></ul><p style="margin-top:14px">Amma Dakwa · <a href="mailto:adakwa@ducdeslombards.com">adakwa@ducdeslombards.com</a></p></div>
</div></section>
<section class="sec inv" id="cadeau"><div class="g12">
  <div class="cell c8"><span class="k">Carte cadeau · valable 1 an</span><b class="huge">Offrez du jazz</b></div>
  <div class="cell c4" style="border-right:0;display:flex;align-items:flex-end"><a class="btn inv" style="width:100%" href="https://billetterie.ducdeslombards.com/" target="_blank" rel="noopener">Offrir {AR}</a></div>
</div></section>
<section class="sec" id="contact"><div class="g12">
  <div class="cell c6"><span class="k">Public · lun.–ven. 14–23h · sam. 17–23h</span><a class="huge" style="text-decoration:none" href="tel:+33142332288">01 42 33 22 88</a></div>
  <div class="cell c6" style="border-right:0"><span class="k">E-mail</span><h3><a href="mailto:contact@ducdeslombards.com">contact@ducdeslombards.com</a></h3><p style="margin-top:14px">Groupes : nflamen@ducdeslombards.com<br>Presse : antonin@donnalee.fr</p></div>
</div></section>"""
page("infos.html", "Infos pratiques — Le Duc des Lombards", "Accès métro Châtelet, tarifs 29 à 41 €, horaires 19:30 et 22:00, accessibilité, carte cadeau et contacts.", infos, "infos", "infos.html")

# ---------------- Privatiser ----------------
priv = phero('Privatiser', "sapphire", "Le club, la mezzanine, ou vos invités en groupe.",
             f'<a class="btn solid" href="#devis">Demander un devis {AR}</a>') + f"""
<section class="sec"><div class="g12">
  <div class="cell c4"><span class="k">Club entier</span><b class="huge num" data-count="80">80</b><p>invités · cocktail 12 à 24 pièces</p></div>
  <div class="cell c4"><span class="k">Mezzanine</span><b class="huge num" data-count="25">25</b><p>invités · bar dédié</p></div>
  <div class="cell c4" style="border-right:0"><span class="k">En journée</span><b class="huge">9–17h</b><p>séminaires · écran · vidéoprojecteur</p></div>
</div></section>
<section class="sec" id="devis"><div class="g12">
  <div class="cell c5"><span class="k">Groupes & CE · dès 10 personnes</span><b class="huge">Devis</b><p style="margin-top:14px">Noëmi Flamen · 01 40 28 94 95</p></div>
  <form class="cell c7" style="border-right:0" data-quote>
    <div class="form-grid">
      <div class="field"><label for="p-name">Nom</label><input id="p-name" name="nom" autocomplete="name" required></div>
      <div class="field"><label for="p-mail">E-mail</label><input id="p-mail" name="email" type="email" autocomplete="email" required></div>
      <div class="field"><label for="p-type">Formule</label><select id="p-type" name="formule"><option>Club complet</option><option>Mezzanine</option><option>Séminaire</option><option>Groupe ou CE</option></select></div>
      <div class="field"><label for="p-n">Invités</label><input id="p-n" name="invites" type="number" min="10" max="80" inputmode="numeric"></div>
    </div>
    <div class="field"><label for="p-date">Date</label><input id="p-date" name="date" type="date"></div>
    <div class="field"><label for="p-msg">Votre projet</label><textarea id="p-msg" name="projet"></textarea></div>
    <button class="btn solid" type="submit" style="width:100%">Envoyer {AR}</button>
  </form>
</div></section>"""
page("privatiser.html", "Privatiser le Duc — Le Duc des Lombards", "Privatisez le Duc des Lombards : club jusqu’à 80 invités, mezzanine 25 invités, séminaires, groupes et CE.", priv, "priv", "privatiser.html")

# ---------------- Membre ----------------
perks = ["−7 € par set, vous + 4 invités", "Coupe-file toute l’année", "Places VIP, table au choix", "Prévente 48 h avant",
         "Une soirée membres par an", "−20 % au bar pendant les jams", "Cadeau de bienvenue", "Champagne par parrainage"]
membre = phero('Membres', "jade", "100 membres par saison. Pas un de plus.",
               f'<a class="btn solid" href="mailto:contact@ducdeslombards.com?subject=Adh%C3%A9sion%20membre">Adhérer {AR}</a>', cut="gabi") + f"""
<section class="sec"><div class="g12">
  <div class="cell c5 inv"><span class="k">La saison · sept. → août</span><b class="huge num">275 €</b></div>
  <div class="cell c7" style="border-right:0"><ol class="list">{"".join(f"<li>{p}</li>" for p in perks)}</ol></div>
</div></section>"""
page("membre.html", "Devenir membre — Le Duc des Lombards", "Carte membre : 275 € la saison, −7 € sur chaque set, coupe-file, places VIP, prévente 48 h.", membre, "membre", "membre.html")
print("ok")
