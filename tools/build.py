"""Le Duc des Lombards — v4 « affiche papier » : agenda en accueil, photos en bichromie, couleurs par famille musicale."""
import pathlib, sys
OUT = pathlib.Path(sys.argv[1])

NAV = [("index.html", "Agenda"), ("le-duc.html", "Le Duc"), ("bar.html", "Bar"), ("actualites.html", "Actualités"),
       ("infos.html", "Infos"), ("privatiser.html", "Privatiser"), ("membre.html", "Membres")]
NAV2 = [("espace-pro.html", "Espace pro"), ("newsletter.html", "Newsletter")]
AR = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M3 10h14M12 5l5 5-5 5"/></svg>'
MAPS = "https://www.google.com/maps/search/?api=1&amp;query=Duc+des+Lombards+42+rue+des+Lombards+75001+Paris"

import re
PAGES = []
# Couleur d'accent de chaque page (familles de la charte) et photo d'en-tête
ACC = {"classic": ("#1d3a9e", "#dfe6fb"), "modern": ("#8e1452", "#f6dbe7"), "vocal": ("#93304f", "#f5dfe5"),
       "world": ("#d93a1c", "#fbe1d8"), "ink": ("#141414", "#ece6da")}
CART = "https://billetterie.ducdeslombards.com/cart"
GIFT = "https://billetterie.ducdeslombards.com/"


EN_TXT = {'Actualités': 'News','Espace pro': 'Pro area','Recevoir la newsletter': 'Get the newsletter','Cette semaine au Duc': 'This week at the Duc','Toutes les actualités': 'All news','Archives des actualités': 'News archive','La semaine au Duc, les programmes du mois, les artistes et la presse.': 'The week at the Duc, monthly programmes, artists and press.','Actualités — Le Duc des Lombards': 'News — Le Duc des Lombards','Espace pro — Le Duc des Lombards': 'Pro area — Le Duc des Lombards','Newsletter — Le Duc des Lombards': 'Newsletter — Le Duc des Lombards','Artistes, tourneurs, presse et partenaires : la fiche technique du club et les bons interlocuteurs.': 'Artists, agents, press and partners: the club’s technical rider and the right contacts.','Fiche technique 2026': 'Technical rider 2026','Téléchargement': 'Download','Fiche technique DDL 2026': 'DDL technical rider 2026','Technical rider · PDF · 267 Ko': 'Technical rider · PDF · 267 KB','Logo du Duc': 'Duc logo','PNG · fond transparent': 'PNG · transparent background','Presse': 'Press','Relations presse, demandes d’accréditation': 'Press relations, accreditation requests','Groupes, CE, privatisation': 'Groups & private hire','Club': 'Club','Adresse': 'Address','Le programme du mois, la semaine au Duc et les préventes, directement dans votre boîte mail.': 'The monthly programme, the week at the Duc and presales, straight to your inbox.','Votre adresse e-mail': 'Your email address','S’inscrire': 'Subscribe','Au programme': 'Inside','Les concerts de la semaine': 'This week’s concerts','Le programme du mois': 'The monthly programme','Les préventes et les dates ajoutées': 'Presales and new dates','Les jams et les soirées spéciales': 'Jams and special nights','politique de confidentialité': 'privacy policy','Au-delà du jazz, le Duc sert des vins, champagnes, whiskies, cocktails et jus de fruits choisis chez des vignerons, producteurs et négociants passionnés. L’idée : accorder une improvisation au piano et un grand vin.': 'Beyond jazz, the Duc pours wines, champagnes, whiskies, cocktails and fruit juices chosen from passionate winegrowers, producers and merchants. The idea: pairing a piano improvisation with a great wine.','Rubriques de la carte': 'Menu sections','Cocktails': 'Cocktails','Vins & champagnes': 'Wines & champagnes','Spiritueux': 'Spirits','Sans alcool & bières': 'Soft drinks & beers','Focus Dehours': 'Dehours focus','Carte de cocktails maison · depuis janvier 2023': 'House cocktail list · since January 2023','Cocktails sans alcool': 'Alcohol-free cocktails','Champagnes': 'Champagnes','Rosé': 'Rosé','Rouges': 'Reds','Blancs': 'Whites','Spiritueux · 4 cl': 'Spirits · 4 cl','Bières': 'Beers','Softs': 'Soft drinks','Supplément soft : 2 €': 'Mixer: €2','La suggestion du Duc : planches de charcuterie Seguin Gourmet, fromages et beurres de la Fromagée de Jean-Yves Bordier.': 'The Duc’s suggestion: Seguin Gourmet charcuterie boards, cheeses and butters from Jean-Yves Bordier’s Fromagée.','Prix nets TTC, service compris. Prix au verre et à la bouteille sur': 'Net prices incl. VAT and service. Glass and bottle prices on','la carte complète (PDF, 161 Ko)': 'the full menu (PDF, 161 KB)','. L’abus d’alcool est dangereux pour la santé, à consommer avec modération.': '. Please drink responsibly.','La cuvée « Grande Réserve » Brut, à la carte du club : un champagne d’exception, à l’apéritif.': 'The “Grande Réserve” Brut on the club’s list: an exceptional champagne for the aperitif.','Saison du 1er septembre au 31 août': 'Season 1 September – 31 August','Vos avantages': 'Your benefits','Adhérer': 'Join','par an · 100 membres maximum par saison : une fois le quota atteint, plus aucune adhésion n’est acceptée.': 'a year · 100 members max per season: once full, no more memberships are accepted.','Écrivez-nous ou appelez le club : nous vous envoyons la carte et le cadeau de bienvenue.': 'Email or call the club: we’ll send you your card and welcome gift.','Le Duc des Lombards — Club de jazz à Paris · Agenda et réservation': 'Le Duc des Lombards — Jazz club in Paris · Programme & tickets', 'Le Duc des Lombards, club de jazz à Châtelet, Paris : l’agenda des concerts, 19:30 et 22:00 du lundi au samedi. Réservez en un clic.': 'Le Duc des Lombards, jazz club in Châtelet, Paris: live concerts at 7:30pm and 10pm, Monday to Saturday. Book in one click.', 'Agenda — Le Duc des Lombards, club de jazz à Paris': 'Programme — Le Duc des Lombards, jazz club in Paris', 'Tous les concerts du Duc des Lombards. Réservation en un clic.': 'All concerts at Le Duc des Lombards. Book in one click.', 'Aller au contenu': 'Skip to content', 'Le Duc des Lombards, club de jazz à Paris — agenda': 'Le Duc des Lombards, jazz club in Paris — programme', 'Club de jazz': 'Jazz club', 'Navigation principale': 'Main navigation', 'Agenda': 'Programme', 'Infos': 'Visit', 'Privatiser': 'Private events', 'Membres': 'Members', 'Menu mobile': 'Mobile menu', '42, rue des Lombards · Paris 1er': '42 rue des Lombards · Paris 1st', 'Mon panier sur la billetterie': 'My basket (ticket office)', 'Panier': 'Basket', 'Mon panier': 'My basket', 'Le Duc des Lombards · club de jazz à Paris · 2 concerts par soir': 'Le Duc des Lombards · jazz club in Paris · 2 shows a night', 'Rechercher un artiste': 'Search an artist', 'Affichage': 'View', 'Vue affiches': 'Poster view', 'Vue liste': 'List view', 'Filtrer les concerts': 'Filter concerts', 'Offrir une carte cadeau': 'Give a gift card', 'Jams du Duc': 'Duc jam sessions', '75001 Paris · Métro Châtelet': '75001 Paris · Châtelet metro', 'Pied de page': 'Footer', 'Carte cadeau': 'Gift card', 'Concerts du lundi au samedi · 19:30 & 22:00 · Jams ven. & sam. 23:30': 'Concerts Monday to Saturday · 7:30pm & 10pm · Jams Fri & Sat 11:30pm', 'Site écoconçu · sans traceur ·': 'Eco-designed · no trackers ·', 'Mentions légales': 'Legal notice', 'À l’affiche': 'Coming up', 'Tout l’agenda': 'Full programme', 'Réserver le prochain concert': 'Book the next concert', 'Réserver': 'Book', 'Le Duc — histoire et équipe | Le Duc des Lombards': 'The Duc — history & team | Le Duc des Lombards', 'L’histoire du Duc des Lombards, club de jazz de Châtelet depuis les années 80.': 'The story of Le Duc des Lombards, Châtelet jazz club since the 1980s.', 'Un piano sous l’escalier, Bobby Few, le début des années 80. Le reste est une histoire de jazz.': 'A piano under the stairs, Bobby Few, the early 80s. The rest is jazz history.', 'La scène du Duc vue d’en haut': 'The Duc stage seen from above', 'Par an': 'Per year', 'Par soir': 'Per night', 'Par set': 'Per set', 'Selon': 'According to', 'Un bon piano': 'A good piano', 'Un patron ouvert': 'An open-minded owner', 'Un public attentif': 'An attentive audience', 'Un lieu pour improviser après': 'A place to jam afterwards', 'La proximité': 'Closeness', 'L’équipe': 'The team', 'Gérant': 'Manager', 'Direction artistique': 'Artistic director', 'Direction adjointe': 'Deputy director', 'Coordination de salle': 'Front of house', 'Chef de salle': 'Floor manager', 'Cheffe de salle': 'Floor manager', 'Partenaires': 'Partners', 'Le Bar — Le Duc des Lombards': 'The Bar — Le Duc des Lombards', 'Cocktails « It’s All About Jazz ! », vins et champagnes indépendants, planches Seguin Gourmet et fromages Bordier.': '“It’s All About Jazz!” cocktails, independent wines and champagnes, Seguin Gourmet boards and Bordier cheeses.', 'Vins, champagnes, whiskies et cocktails de producteurs indépendants.': 'Wines, champagnes, whiskies and cocktails from independent producers.', 'La carte': 'The menu', 'Cocktails maison': 'House cocktails', 'À partager': 'To share', 'Charcuterie Seguin Gourmet': 'Seguin Gourmet charcuterie', 'Fromages Jean-Yves Bordier': 'Jean-Yves Bordier cheeses', 'Infos pratiques — Le Duc des Lombards': 'Visit — Le Duc des Lombards', 'Accès métro Châtelet, tarifs 29 à 41 €, horaires 19:30 et 22:00, accessibilité, carte cadeau et contacts.': 'Châtelet metro, tickets €29–41, shows at 7:30pm and 10pm, accessibility, gift cards and contacts.', '42, rue des Lombards, Paris 1er. Métro Châtelet, sortie 10.': '42 rue des Lombards, Paris 1st. Châtelet metro, exit 10.', 'Itinéraire': 'Directions', 'Tarifs': 'Prices', 'Venir': 'Getting here', 'Accessibilité': 'Accessibility', 'Tarifs & horaires': 'Prices & times', 'er': 'st', 'e': 'nd', 'Portes 19:00': 'Doors 7pm', 'Portes 21:30': 'Doors 9:30pm', '−25 ans, étudiants, demandeurs d’emploi': 'Under 25, students, jobseekers', 'Paris Jazz Club, groupes 10+': 'Paris Jazz Club, groups of 10+', 'Ven. & sam. dès 23:30': 'Fri & Sat from 11:30pm', 'Libre': 'Free', 'Métro': 'Metro', 'PMR': 'Step-free', 'File prioritaire chaque soir': 'Priority queue every night', 'Accès par la porte principale': 'Access through the main door', 'Registre à l’accueil': 'Accessibility register at reception', 'Carte cadeau · valable 1 an': 'Gift card · valid 1 year', 'Offrez du jazz': 'Give some jazz', 'Offrir': 'Give', 'Public · lun.–ven. 14–23h · sam. 17–23h': 'Box office · Mon–Fri 2–11pm · Sat 5–11pm', 'Groupes : nflamen@ducdeslombards.com': 'Groups: nflamen@ducdeslombards.com', 'Presse : antonin@donnalee.fr': 'Press: antonin@donnalee.fr', 'Privatiser le Duc — Le Duc des Lombards': 'Private events — Le Duc des Lombards', 'Privatisez le Duc des Lombards : club jusqu’à 80 invités, mezzanine 25 invités, séminaires, groupes et CE.': 'Hire Le Duc des Lombards: whole club up to 80 guests, mezzanine for 25, seminars and groups.', 'Le club, la mezzanine, ou vos invités en groupe.': 'The whole club, the mezzanine, or your guests as a group.', 'Demander un devis': 'Request a quote', 'Club entier': 'Whole club', 'invités · cocktail 12 à 24 pièces': 'guests · 12 to 24-piece cocktail', 'invités · bar dédié': 'guests · private bar', 'En journée': 'Daytime', '9–17h': '9am–5pm', 'séminaires · écran · vidéoprojecteur': 'seminars · screen · projector', 'Groupes & CE · dès 10 personnes': 'Groups · from 10 people', 'Devis': 'Quote', 'Nom': 'Name', 'Formule': 'Option', 'Club complet': 'Whole club', 'Séminaire': 'Seminar', 'Groupe ou CE': 'Group', 'Invités': 'Guests', 'Votre projet': 'Your project', 'Envoyer': 'Send', 'Devenir membre — Le Duc des Lombards': 'Membership — Le Duc des Lombards', 'Carte membre : 275 € la saison, −7 € sur chaque set, coupe-file, places VIP, prévente 48 h.': 'Membership: €275 a season, €7 off every set, skip the queue, VIP seats, 48-hour presale.', '100 membres par saison. Pas un de plus.': '100 members a season. Not one more.', 'Adhérer': 'Join', 'La saison · sept. → août': 'Season · Sept → Aug', '−7 € par set, vous + 4 invités': '€7 off per set, you + 4 guests', 'Coupe-file toute l’année': 'Skip the queue all year', 'Places VIP, table au choix': 'VIP seats, table of your choice', 'Prévente 48 h avant': '48-hour presale', 'Une soirée membres par an': 'One members’ night a year', '−20 % au bar pendant les jams': '20% off at the bar during jams', 'Cadeau de bienvenue': 'Welcome gift', 'Champagne par parrainage': 'Champagne for every referral', 'Concert — Le Duc des Lombards': 'Concert — Le Duc des Lombards', 'Concert au Duc des Lombards, Paris 1er. Réservation en un clic.': 'Concert at Le Duc des Lombards, Paris. Book in one click.', 'Français': 'Français', 'English version': 'English version'}
def translate(html):
    def tx(m):
        raw = m.group(1); k = raw.strip()
        return '>' + raw.replace(k, EN_TXT[k]) + '<' if k in EN_TXT else m.group(0)
    head, sep, rest = html.partition('<body')
    def attr(m):
        v = m.group(2)
        return f'{m.group(1)}="{EN_TXT.get(v, v)}"'
    html = re.sub(r'(alt|title|placeholder|aria-label|content)="([^"]*)"', attr, html)
    html = re.sub(r'>([^<]+)<', tx, html)
    return html

def page(file, title, desc, body, data_page="", current="", upnext=True, acc="classic"):
    PAGES.append((file, title, desc, body, data_page, current, upnext, acc))

def render(file, title, desc, body, data_page, current, upnext, acc, en=False):
    P = "en/" if en else ""
    nav = "".join(f'<a href="{P}{h}"{" aria-current=\"page\"" if h == current else ""}>{t}</a>' for h, t in NAV)
    menu = "".join(f'<a href="{P}{h}">{t}</a>' for h, t in NAV + NAV2) + f'<a href="{GIFT}" target="_blank" rel="noopener">Carte cadeau</a>'
    up = f"""<section class="sec upnext" aria-labelledby="up-t"><div class="wrap"><div class="sec-head"><h2 class="sh" id="up-t">À l’affiche</h2><a class="lnk" href="{P}index.html">Tout l’agenda {AR}</a></div><div class="grid" data-upnext></div></div></section>""" if upnext else ""
    g, gl = ACC[acc]
    other = f'{"./" if en else "en/"}{file}'
    html = f"""<!doctype html>
<html lang="{'en' if en else 'fr'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
{'<base href="../">' if en else ''}
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#f3ede3">
<meta property="og:type" content="website"><meta property="og:site_name" content="Le Duc des Lombards">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}">
<meta property="og:image" content="assets/img/affiches/leron-169.webp">
<link rel="alternate" hreflang="fr" href="{file}"><link rel="alternate" hreflang="en" href="en/{file}">
<link rel="icon" href="assets/img/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..100,400..800&family=League+Spartan:wght@600..900&display=swap">
<link rel="stylesheet" href="assets/site.css">
<script type="module" src="assets/app.js"></script>
</head>
<body data-page="{data_page}">
<a class="skip" href="{P}{file}#main">Aller au contenu</a>
<header class="hdr"><div class="wrap">
  <a class="brand" href="{P}index.html" aria-label="Le Duc des Lombards, club de jazz à Paris — agenda"><span class="logo" aria-hidden="true"></span><span class="brand-tx"><b>Club de jazz</b>Paris · Châtelet</span></a>
  <nav class="nav" aria-label="Navigation principale">{nav}</nav>
  <div class="hdr-tools">
    <a class="hdr-tel" href="tel:+33142332288">01 42 33 22 88</a>
    <a class="hdr-lang" href="{other}" hreflang="{'fr' if en else 'en'}" lang="{'fr' if en else 'en'}" aria-label="{'Version française' if en else 'English version'}">{'FR' if en else 'EN'}</a>
    <a class="hdr-cart" href="{CART}" target="_blank" rel="noopener" aria-label="Mon panier sur la billetterie"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 4h2.2l2.3 11h10.8l2-8H6.4"/><circle cx="9" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/></svg><span>Panier</span></a>
  </div>
  <button class="burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="menu"><span></span><span></span></button>
</div></header>
<nav class="menu" id="menu" aria-label="Menu mobile">{menu}<p class="menu-foot">42, rue des Lombards · Paris 1er<br><a href="tel:+33142332288">01 42 33 22 88</a> · <a href="{other}">{'Français' if en else 'English'}</a></p></nav>
<main id="main" style="--g:{g};--gl:{gl}">
{body}
{up}
</main>
<footer class="ftr"><div class="wrap">
  <div class="ftr-a"><span class="logo" aria-hidden="true"></span><p>42, rue des Lombards<br>75001 Paris · Métro Châtelet</p><p><a href="tel:+33142332288">01 42 33 22 88</a><br><a href="mailto:contact@ducdeslombards.com">contact@ducdeslombards.com</a></p></div>
  <nav class="ftr-links" aria-label="Pied de page"><a href="{P}index.html">Agenda</a><a href="{P}le-duc.html">Le Duc</a><a href="{P}bar.html">Bar</a><a href="{P}infos.html">Infos</a><a href="{GIFT}" target="_blank" rel="noopener">Carte cadeau</a><a href="{P}privatiser.html">Privatiser</a><a href="{P}membre.html">Membres</a><a href="{P}actualites.html">Actualités</a><a href="{P}espace-pro.html">Espace pro</a><a href="{P}newsletter.html">Newsletter</a><a href="{CART}" target="_blank" rel="noopener">Mon panier</a><a href="https://www.instagram.com/ducdeslombards/" rel="noopener">Instagram</a><a href="https://www.facebook.com/ducdeslombards" rel="noopener">Facebook</a><a href="{other}">{'Français' if en else 'English'}</a></nav>
  <p class="ftr-base"><span>Concerts du lundi au samedi · 19:30 & 22:00 · Jams ven. & sam. 23:30</span><span>Site écoconçu · sans traceur · <a href="{P}infos.html#contact">Mentions légales</a></span></p>
</div></footer>
</body>
</html>"""
    if en:
        html = html.replace('href="#', f'href="en/{file}#')       # ancres internes (avec <base>)
        html = re.sub(r'href="([\w-]+\.html)', r'href="en/\1', html)   # liens internes vers les pages EN
        html = translate(html)
        (OUT / "en").mkdir(exist_ok=True)
        (OUT / "en" / file).write_text(html, encoding="utf-8")
    else:
        (OUT / file).write_text(html, encoding="utf-8")

def phero(h1, color, lede, acts="", cut=None, photo=None):
    pic = f'<figure class="ph-pic"><span class="duo"><img src="assets/img/{photo}-1152.webp" srcset="assets/img/{photo}-576.webp 576w, assets/img/{photo}-1152.webp 1152w" sizes="(max-width: 800px) 100vw, 45vw" alt="" decoding="async"></span></figure>' if photo else ""
    return f'''<section class="ph{' has-pic' if photo else ''}"><div class="wrap"><div class="ph-t"><h1>{h1}</h1>{f'<p class="lede">{lede}</p>' if lede else ''}<div class="acts">{acts or f'<button class="btn solid" type="button" data-next>Réserver le prochain concert {AR}</button>'}</div></div>{pic}</div></section>'''

# ---------------- Agenda = accueil ----------------
AG = """
<section class="ag-head"><div class="wrap">
  <h1>Agenda <span>Le Duc des Lombards · club de jazz à Paris · 2 concerts par soir</span></h1>
  <div class="ag-tools"><label class="sr" for="q">Rechercher un artiste</label><input id="q" class="search" type="search" placeholder="Rechercher un artiste" data-q>
    <a class="lnk gift" href="https://billetterie.ducdeslombards.com/" target="_blank" rel="noopener">Offrir une carte cadeau</a>
    <div class="vt" data-view role="group" aria-label="Affichage"><button type="button" data-v="grid" aria-pressed="true" aria-label="Vue affiches"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 1h6v6H1zM9 1h6v6H9zM1 9h6v6H1zM9 9h6v6H9z" fill="currentColor"/></svg></button><button type="button" data-v="list" aria-pressed="false" aria-label="Vue liste"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 2h14v2.5H1zM1 6.75h14v2.5H1zM1 11.5h14V14H1z" fill="currentColor"/></svg></button></div></div>
</div>
<div class="filters"><div class="wrap" data-tags role="group" aria-label="Filtrer les concerts"></div></div></section>
<aside class="jams" data-jams aria-label="Jams du Duc"></aside>
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
leduc = phero('Le Duc', "sapphire", "Un piano sous l’escalier, Bobby Few, le début des années 80. Le reste est une histoire de jazz.", photo="room") + f"""
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
page("le-duc.html", "Le Duc — histoire et équipe | Le Duc des Lombards", "L’histoire du Duc des Lombards, club de jazz de Châtelet depuis les années 80.", leduc, "duc", "le-duc.html", acc="classic")

# ---------------- Bar (contenus et carte repris de ducdeslombards.com/fr/le-bar et du PDF « Notre carte ») ----------------
CARTE = "https://ducdeslombards.com/sites/default/files/ducdeslombards/fichiers/carte_ddl.pdf"
def menu_block(title, items, note=""):
    lis = "".join(f'<li><b>{n}</b>{f"<span>{d}</span>" if d else ""}{f"<em>{pr}</em>" if pr else ""}</li>' for n, d, pr in items)
    return f'<section class="mn"><h3>{title}</h3>{f"<p class=\'fine\'>{note}</p>" if note else ""}<ul>{lis}</ul></section>'
COCKTAILS = [("Key Lime Pie", "Vodka vanille, rhum brun, ananas, citron vert, coco", ""), ("Rob Roy", "Scotch, sweet vermouth, Bob’s Bitters Abbotts", ""),
  ("Port of Spain", "Mezcal, angostura, citron vert, sirop d’orgeat", ""), ("Aviation", "Gin, liqueur de marasquin, crème de violette, citron", ""),
  ("Sazerac", "Whisky rye, brandy, sucre, Peychaud’s, absinthe", ""), ("Vieux Carré", "Rye, cognac, sweet vermouth, Bénédictine, Peychaud’s, angostura", ""),
  ("Old Fashioned", "Bourbon, sucre, angostura", ""), ("Hemingway Special", "Havana, Luxardo, citron vert, pamplemousse", ""),
  ("Dry Martini", "Dry vermouth, gin ou vodka, zeste de citron ou olive", ""), ("French 75", "Cognac ou gin, vermouth blanc, citron, sucre, champagne", ""),
  ("Duc’s Margarita", "Mezcal, tequila, Cointreau, citron vert, Tabasco", ""), ("Espresso Martini", "Café expresso, liqueur de café, vodka", ""),
  ("Maï-Taï", "Rhum ambré, rhum blanc, Cointreau, sirop d’orgeat, citron vert, absinthe", ""), ("Bloody Mary", "Vodka, jus de tomate, citron, céleri, Tabasco, Worcestershire", "")]
SANS = [("8th Day", "Thé jasmin, citron vert, sirop de gingembre, limonade", ""), ("Spritz", "Bitter, Perrier, orange", ""), ("Mocktail du jour", "", "12 €")]
BIERES = [("Gallia Blonde", "Pression 25 / 50 cl", "7 € · 12 €"), ("Gallia New Western IPA", "Pression 25 / 50 cl", "7 € · 12 €"),
  ("Mort Subite Blanche", "Bouteille 33 cl", "8 €"), ("Heineken 0 %", "Sans alcool · 33 cl", "8 €")]
ASSIETTES = [("Tarama artisanal", "", ""), ("Assiette de saumon fumé", "Bio, label rouge", ""), ("Assiette de charcuterie", "Maison Seguin", ""), ("Sardinillas de Galice", "", "15 €")]
CHAMP = [("André Goutorbe & Fils", "Extra Brut", ""), ("Perrier-Jouët", "Grand Brut", ""), ("Ruinart", "Blanc de blancs", ""), ("Dehours et Fils", "Grande Réserve Brut · notre focus", "")]
ROUGES = [("Domaine Aegerter", "Bourgogne · Pinot noir", ""), ("Domaine des Sanzay", "Saumur-Champigny · Cabernet franc", ""), ("Domaine des Nugues", "Morgon · Gamay", ""),
  ("Château Pierre 1er", "Saint-Émilion grand cru · Merlot & cabernet franc", ""), ("Domaine Stéphane Ogier", "Côtes du Rhône · Grenache & syrah", ""),
  ("Domaine Johan Verrier", "Saint-Joseph · Syrah", ""), ("Domaine Aegerter", "Beaune 1er cru · Pinot noir", ""), ("Château Cantenac Brown", "Margaux grand cru classé", ""),
  ("Domaine Stéphane Ogier", "Côte-Rôtie · Syrah", "")]
BLANCS = [("Domaine Stéphane Ogier", "Côtes du Rhône · Grenache & roussanne", ""), ("Domaine Céline Chevallier", "Petit Chablis · Chardonnay", ""),
  ("Domaine Sophie Schaal", "Alsace · Riesling", ""), ("Joseph Mellot", "Sancerre · Sauvignon blanc", ""), ("Domaine de Beauclair", "Vouvray · Chenin", ""),
  ("Domaine Céline Chevallier", "Chablis 1er cru · Chardonnay", ""), ("Château Olivier", "Pessac-Léognan grand cru classé", ""), ("Domaine Xavier Gérard", "Condrieu « Arbuel » · Viognier", "")]
ROSE = [("Château Yssole", "Provence · Grenache, cinsault & syrah", "10 € · 40 €")]
SPIRITS = [("Whisky & bourbon", "Ballantine’s · Jack Daniel’s n°7 · Johnnie Walker Black · Bulleit · Jameson · Woodford Reserve · Port Charlotte · Oban 14 · Nikka from the Barrel · Laphroaig Quarter Cask · Aberlour A’bunadh · Kavalan Podium · Lagavulin 16 · whisky du moment", ""),
  ("Rhum", "Havana Club 3 ans · Zacapa 23 · Neisson agricole · Hampden Estate 8 ans", ""), ("Gin", "Beefeater · Plymouth · Citadelle · The Botanist · Monkey 47", ""),
  ("Agave", "Olmeca Altos · Patrón Reposado · Del Maguey Vida", ""), ("Vodka", "Fair · Grey Goose", ""),
  ("Apéritifs", "Cocchi Vermouth di Torino · Lillet blanc · Suze · Gran Classico · Kina l’Aéro d’Or · absinthe La Fée · JNPR n°1 sans alcool", ""),
  ("Digestifs", "Cognac VSOP Martell · Cognac XO Bache Gabrielsen · Bas-Armagnac Château de Bordeneuve · Calvados Christian Drouin · Grappa Nardini", "")]
SOFTS = [("Jus de fruits artisanaux Charles Papillon", "", ""), ("Citronnade maison", "", ""), ("Ginger beer · Ginger ale · Fever-Tree", "", ""), ("Coca-Cola · Coca-Cola Zéro · Perrier", "", ""), ("Les Abatilles 33 cl · Evian 50 cl", "", "")]
bar = phero('Bar', "jade", "Au-delà du jazz, le Duc sert des vins, champagnes, whiskies, cocktails et jus de fruits choisis chez des vignerons, producteurs et négociants passionnés. L’idée : accorder une improvisation au piano et un grand vin.",
            f'<a class="btn" href="#carte">La carte {AR}</a><button class="btn solid" type="button" data-next>Réserver {AR}</button>', photo="room") + f"""
<nav class="filters jump" aria-label="Rubriques de la carte"><div class="wrap"><a class="chip" href="#cocktails">Cocktails</a><a class="chip" href="#assiettes">À partager</a><a class="chip" href="#vins">Vins & champagnes</a><a class="chip" href="#spiritueux">Spiritueux</a><a class="chip" href="#softs">Sans alcool & bières</a><a class="chip" href="#dehours">Focus Dehours</a></div></nav>
<section class="sec" id="carte"><div class="wrap">
  <div class="bar-hero inv" id="cocktails"><span class="k">Carte de cocktails maison · depuis janvier 2023</span><b class="huge">It’s All About <em>Jazz !</em></b></div>
  <div class="menu-grid">
    {menu_block("Cocktails", COCKTAILS)}
    <div id="assiettes">{menu_block("À partager", ASSIETTES, "La suggestion du Duc : planches de charcuterie Seguin Gourmet, fromages et beurres de la Fromagée de Jean-Yves Bordier.")}
    {menu_block("Cocktails sans alcool", SANS)}</div>
  </div>
  <div class="menu-grid" id="vins">
    <div>{menu_block("Champagnes", CHAMP)}{menu_block("Rosé", ROSE)}</div>
    {menu_block("Rouges", ROUGES)}
    {menu_block("Blancs", BLANCS)}
  </div>
  <div class="menu-grid" id="spiritueux">
    {menu_block("Spiritueux · 4 cl", SPIRITS)}
    <div id="softs">{menu_block("Bières", BIERES)}{menu_block("Softs", SOFTS, "Supplément soft : 2 €")}</div>
  </div>
  <p class="carte-note">Prix nets TTC, service compris. Prix au verre et à la bouteille sur <a href="{CARTE}" target="_blank" rel="noopener">la carte complète (PDF, 161 Ko)</a>. L’abus d’alcool est dangereux pour la santé, à consommer avec modération.</p>
</div></section>
<section class="sec focus" id="dehours"><div class="wrap two">
  <div><span class="k">Focus</span><h2 class="sh">Champagne Dehours et Fils</h2><p class="lede">La cuvée « Grande Réserve » Brut, à la carte du club : un champagne d’exception, à l’apéritif.</p></div>
  <div><p>Le domaine cultive son vignoble familial dans le respect de la biodiversité : travail mécanique des sols, enherbement naturel entre les rangs. Les vins vieillissent sur lies totales et sont clarifiés par décantation naturelle, sans collage ni filtration.</p>
  <p>Majoritairement meunier, cépage roi de la vallée de la Marne, la Grande Réserve assemble une large part de vins de réserve issus d’une solera commencée en 1998. Fermentation malolactique complète, 15 à 27 mois de maturation en bouteille.</p></div>
</div></section>"""
page("bar.html", "Le Bar — Le Duc des Lombards", "Cocktails « It’s All About Jazz ! », vins et champagnes indépendants, planches Seguin Gourmet et fromages Bordier.", bar, "bar", "bar.html", acc="world")

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
page("infos.html", "Infos pratiques — Le Duc des Lombards", "Accès métro Châtelet, tarifs 29 à 41 €, horaires 19:30 et 22:00, accessibilité, carte cadeau et contacts.", infos, "infos", "infos.html", acc="ink")

# ---------------- Privatiser ----------------
priv = phero('Privatiser', "sapphire", "Le club, la mezzanine, ou vos invités en groupe.",
             f'<a class="btn solid" href="privatiser.html#devis">Demander un devis {AR}</a>', photo="room") + f"""
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
page("privatiser.html", "Privatiser le Duc — Le Duc des Lombards", "Privatisez le Duc des Lombards : club jusqu’à 80 invités, mezzanine 25 invités, séminaires, groupes et CE.", priv, "priv", "privatiser.html", acc="modern")

# ---------------- Membre (repris de ducdeslombards.com/fr/devenez-membre) ----------------
perks = ["7 € de réduction sur chaque set, pendant toute l’adhésion", "7 € de réduction pour 4 invités maximum par set", "Coupe-file sur tous les sets, toute l’année",
         "Places VIP dans le club", "Choix de votre table avec l’hôte d’accueil", "Réservation prioritaire en ligne et par ligne directe, prévente 48 h avant tout le monde",
         "Une soirée réservée aux membres par an, avec dégustation en compagnie de la direction et de l’équipe", "−20 % sur les consommations pendant les jams (ven. & sam.), sur présentation de la carte",
         "Offres et invitations exclusives au fil de l’actualité du club", "Un cadeau de bienvenue", "Une bouteille de champagne pour chaque nouveau membre parrainé"]
membre = phero('Membres', "jade", "100 membres par saison. Pas un de plus.",
               f'<a class="btn solid" href="mailto:contact@ducdeslombards.com?subject=Adh%C3%A9sion%20membre%20Duc%20des%20Lombards">Adhérer {AR}</a><a class="btn" href="tel:+33142332288">01 42 33 22 88</a>') + f"""
<section class="sec"><div class="g12">
  <div class="cell c5 inv"><span class="k">Saison du 1er septembre au 31 août</span><b class="huge num">275 €</b><p style="margin-top:14px">par an · 100 membres maximum par saison : une fois le quota atteint, plus aucune adhésion n’est acceptée.</p></div>
  <div class="cell c7" style="border-right:0"><span class="k">Vos avantages</span><ol class="list">{"".join(f"<li>{p}</li>" for p in perks)}</ol></div>
</div></section>
<section class="sec"><div class="wrap two"><div><h2 class="sh">Adhérer</h2><p class="lede">Écrivez-nous ou appelez le club : nous vous envoyons la carte et le cadeau de bienvenue.</p></div>
  <div><p><a class="btn solid" href="mailto:contact@ducdeslombards.com?subject=Adh%C3%A9sion%20membre%20Duc%20des%20Lombards">contact@ducdeslombards.com</a></p><p class="fine" style="margin-top:12px">42, rue des Lombards, 75001 Paris · 01 42 33 22 88</p></div></div></section>"""
page("membre.html", "Devenir membre — Le Duc des Lombards", "Carte membre : 275 € la saison, −7 € sur chaque set, coupe-file, places VIP, prévente 48 h.", membre, "membre", "membre.html", acc="vocal")

# ---------------- Actualités (reprises de ducdeslombards.com/fr/actualites) ----------------
ACTU_BASE = "https://ducdeslombards.com/fr/actualites/actualites/actualites/actualites/actualites/actualites/actualites/actualites/"
NEWS = [("16.11.2026", "Cette semaine au Duc ! 16 – 21 novembre 2026", "cette-semaine-au-duc-16-21-novembre-2026", "Semaine"),
        ("10.11.2026", "Cette semaine au Duc ! 10 – 14 novembre 2026", "cette-semaine-au-duc-10-14-novembre-2026", "Semaine"),
        ("14.10.2026", "Leron Thomas – Pan Amsterdam & the Free Band", "leron-thomas-pan-amsterdam-free-band", "Artiste"),
        ("12.10.2026", "Cette semaine au Duc !", "cette-semaine-au-duc", "Semaine"),
        ("12.10.2026", "Programme d’octobre 2026", "programme-d-octobre-2026", "Programme"),
        ("19.11.2025", "Paul Cornish – article rédigé par l’Officiel des spectacles", "paul-cornish-article-redige-par-l-officiel-des-spectacles", "Presse"),
        ("28.10.2025", "Programme de novembre 2025", "programme-de-novembre-2025", "Programme"),
        ("30.09.2025", "Programme d’octobre 2025", "programme-d-octobre-2025", "Programme")]
actu = phero('Actualités', "", "La semaine au Duc, les programmes du mois, les artistes et la presse.", f'<a class="btn solid" href="newsletter.html">Recevoir la newsletter {AR}</a>') + f"""
<section class="sec"><div class="wrap"><div class="sec-head"><h2 class="sh">Cette semaine au Duc</h2><a class="lnk" href="index.html">Tout l’agenda {AR}</a></div><div class="grid" data-week></div></div></section>
<section class="sec"><div class="wrap"><h2 class="sh">Toutes les actualités</h2>
  <ul class="news">{"".join(f'<li><a href="{ACTU_BASE}{slug}" target="_blank" rel="noopener"><span class="nk">{k}</span><time>{d}</time><b>{t}</b>{AR}</a></li>' for d, t, slug, k in NEWS)}</ul>
  <p style="margin-top:20px"><a class="lnk" href="https://ducdeslombards.com/fr/actualites/actualites/actualites/actualites/actualites/actualites/actualites/actualites" target="_blank" rel="noopener">Archives des actualités {AR}</a></p></div></section>"""
page("actualites.html", "Actualités — Le Duc des Lombards", "Les actualités du Duc des Lombards : la semaine au club, les programmes du mois, les artistes et la presse.", actu, "news", "actualites.html", upnext=False, acc="modern")

# ---------------- Espace pro (repris de ducdeslombards.com/fr/espace-pro) ----------------
RIDER = "https://ducdeslombards.com/sites/default/files/ducdeslombards/fichiers/2026-technical_rider_ddl_1.pdf"
pro = phero('Espace pro', "", "Artistes, tourneurs, presse et partenaires : la fiche technique du club et les bons interlocuteurs.", f'<a class="btn solid" href="{RIDER}" target="_blank" rel="noopener">Fiche technique 2026 {AR}</a>') + f"""
<section class="sec"><div class="g12">
  <div class="cell c4"><span class="k">Téléchargement</span><h3><a href="{RIDER}" target="_blank" rel="noopener">Fiche technique DDL 2026</a></h3><p class="fine" style="margin-top:8px">Technical rider · PDF · 267 Ko</p></div>
  <div class="cell c4"><span class="k">Téléchargement</span><h3><a href="assets/img/logo.png" download="logo-duc-des-lombards.png">Logo du Duc</a></h3><p class="fine" style="margin-top:8px">PNG · fond transparent</p></div>
  <div class="cell c4" style="border-right:0"><span class="k">Presse</span><h3><a href="mailto:antonin@donnalee.fr">antonin@donnalee.fr</a></h3><p class="fine" style="margin-top:8px">Relations presse, demandes d’accréditation</p></div>
  <div class="cell c4"><span class="k">Groupes, CE, privatisation</span><h3><a href="mailto:nflamen@ducdeslombards.com">Noëmi Flamen</a></h3><p class="fine" style="margin-top:8px">01 40 28 94 95</p></div>
  <div class="cell c4"><span class="k">Club</span><h3><a href="tel:+33142332288">01 42 33 22 88</a></h3><p class="fine" style="margin-top:8px">contact@ducdeslombards.com</p></div>
  <div class="cell c4" style="border-right:0"><span class="k">Adresse</span><h3>42, rue des Lombards<br>75001 Paris</h3></div>
</div></section>"""
page("espace-pro.html", "Espace pro — Le Duc des Lombards", "Fiche technique du Duc des Lombards, logo, contacts presse et groupes.", pro, "pro", "espace-pro.html", upnext=False, acc="ink")

# ---------------- Newsletter (repris de ducdeslombards.com/fr/newsletter) ----------------
nl = phero('Newsletter', "", "Le programme du mois, la semaine au Duc et les préventes, directement dans votre boîte mail.", "&nbsp;") + """
<section class="sec"><div class="wrap two">
  <form class="nl-form" data-newsletter>
    <div class="field"><label for="nl-mail">Votre adresse e-mail</label><input id="nl-mail" name="email" type="email" autocomplete="email" required placeholder="vous@exemple.fr"></div>
    <button class="btn solid" type="submit" style="width:100%">S’inscrire</button>
    <p class="fine" style="margin-top:14px">En saisissant votre adresse e-mail, vous acceptez de recevoir notre newsletter par voie électronique. Vous pouvez vous désinscrire à tout moment, via les liens de désinscription ou en nous contactant. Plus d’informations dans notre <a href="https://ducdeslombards.com/fr/conditions-generales-de-vente-et-politique-de-confidentialite" target="_blank" rel="noopener">politique de confidentialité</a>.</p>
  </form>
  <div><span class="k">Au programme</span><ol class="list"><li>Les concerts de la semaine</li><li>Le programme du mois</li><li>Les préventes et les dates ajoutées</li><li>Les jams et les soirées spéciales</li></ol></div>
</div></section>"""
page("newsletter.html", "Newsletter — Le Duc des Lombards", "Inscrivez-vous à la newsletter du Duc des Lombards.", nl, "newsletter", "newsletter.html", acc="classic")

for pg in PAGES: render(*pg)
for pg in PAGES: render(*pg, en=True)
print("ok")
