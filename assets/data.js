/* Le Duc des Lombards — données du site (reprises de ducdeslombards.com, nov. 2026).
   Statuts des sets : ok | last (dernières places) | full (complet) | door (guichet uniquement).
   Prix : fourchette officielle 29–41 € « selon la programmation ». Prix, statuts et
   séances relevés sur billetterie.ducdeslombards.com le 9 nov. 2026 (price = tarif PLEIN,
   pjc = tarif REDUIT Paris Jazz Club, jeune = tarif JEUNE). */

/* Photos reprises du site actuel, recadrées en 4:3 et converties en WebP (480 / 960 px). */
export const img = (name, w = 960) => name ? `assets/img/${name}-${w >= 700 ? 960 : 480}.webp` : null;
export const srcset = name => name ? `assets/img/${name}-480.webp 480w, assets/img/${name}-960.webp 960w` : '';

/* Détourés jugés propres ; les autres photos s'affichent en cadre plein. */
export const NOCUT = ['harland', 'belmondo', 'faraotrio', 'morvan'];
export const LOGO = 'assets/img/logo.webp';
export const ROOM = 'assets/img/room-1152.webp';
export const BILLETTERIE = 'https://billetterie.ducdeslombards.com/';

const S = (t, s = 'ok') => ({ t, s });
const two = (a = 'ok', b = 'ok') => [S('19:30', a), S('22:00', b)];
const twoDec = (a = 'ok', b = 'ok') => [S('19:00', a), S('21:30', b)];
const jam = () => [S('23:30', 'door')];

export const EVENTS = [
  { id: 'or-bareket-quartet-ayin', title: 'Or Bareket Quartet', sub: '/AYIN/', tag: 'Contrebasse', price: 33, img: 'orbareket',
    dates: [{ d: '2026-11-06', sets: two() }] },
  { id: 'jam-du-duc-simon-chivallon-15', jam: true, img: 'chivallon', title: 'Jam du Duc', sub: 'Simon Chivallon', tag: 'Jam du Duc',
    dates: [{ d: '2026-11-06', sets: jam() }] },
  { id: 'kyle-eastwood-quintet-0', title: 'Kyle Eastwood Quintet', tag: 'Événement', price: 41, img: 'kyle',
    dates: [{ d: '2026-11-07', sets: two('full', 'full') }, { d: '2026-11-08', sets: two('full', 'full') }] },
  { id: 'ege-turev-1', title: 'Ege Turev', tag: 'Drums newcomer', price: 15, pjc: 12, img: 'ege',
    dates: [{ d: '2026-11-10', sets: two() }] },
  { id: 'terrace-martin-quartet', img: 'terrace', title: 'The Terrace Martin Quartet', tag: 'Groove', price: 41, pjc: 38, jeune: 34,
    dates: [{ d: '2026-11-11', sets: two('full', 'full') }] },
  { id: 'jesse-harris-6', title: 'Jesse Harris', tag: 'Folk', price: 38, pjc: 35, jeune: 31, img: 'jesse',
    dates: [{ d: '2026-11-12', sets: two() }] },
  { id: 'ekep-nkwelle-0', title: 'Ekep Nkwelle', tag: 'Vocal', price: 41, pjc: 38, jeune: 34, img: 'ekep',
    dates: [{ d: '2026-11-13', sets: two('full', 'ok') }, { d: '2026-11-14', sets: two('full', 'ok') }] },
  { id: 'jam-du-duc-gael-horellou-7', jam: true, img: 'horellou', title: 'Jam du Duc', sub: 'Gaël Horellou', tag: 'Jam du Duc',
    dates: [{ d: '2026-11-13', sets: jam() }] },
  { id: 'jam-du-duc-simon-chivallon-16', jam: true, img: 'chivallon', title: 'Jam du Duc', sub: 'Simon Chivallon', tag: 'Jam du Duc',
    dates: [{ d: '2026-11-14', sets: jam() }] },
  { id: 'leron-thomas-pan-amsterdam-and-free-band', title: 'Leron Thomas', sub: 'Pan Amsterdam and the Free Band', tag: 'Groove', price: 38, pjc: 35, jeune: 31, img: 'leron',
    dates: [{ d: '2026-11-16', sets: two() }] },
  { id: 'eric-harland-trio-feat-baptiste-trotignon-john-leftwich', img: 'harland', title: 'Eric Harland Trio', sub: 'feat. Baptiste Trotignon & John Leftwich', tag: 'All star', price: 41, pjc: 38, jeune: 34,
    dates: [{ d: '2026-11-17', sets: two() }, { d: '2026-11-18', sets: two() }] },
  { id: 'pablo-campos-quintet', title: 'Pablo Campos Quintet', tag: 'Crooner', price: 38, pjc: 35, jeune: 31, img: 'pablo',
    dates: [{ d: '2026-11-19', sets: two() }] },
  { id: 'antonio-farao-stephane-belmondo-quartet', img: 'belmondo', title: 'Antonio Faraò & Stéphane Belmondo Quartet', tag: 'All star', price: 41, pjc: 38, jeune: 34,
    dates: [{ d: '2026-11-20', sets: two() }] },
  { id: 'jam-du-duc-alex-monfort-1', jam: true, img: 'monfort', title: 'Jam du Duc', sub: 'Alex Monfort', tag: 'Jam du Duc',
    dates: [{ d: '2026-11-20', sets: jam() }] },
  { id: 'antonio-farao-trio-3', img: 'faraotrio', title: 'Antonio Faraò Trio', tag: 'Piano master', price: 41, pjc: 38, jeune: 34,
    dates: [{ d: '2026-11-21', sets: two() }] },
  { id: 'jam-du-duc-paul-morvan-25', jam: true, img: 'morvan', title: 'Jam du Duc', sub: 'Paul Morvan', tag: 'Jam du Duc',
    dates: [{ d: '2026-11-21', sets: jam() }] },
  { id: 'theodore-kuzma-trio-0', title: 'Théodore Kuzma Trio', tag: 'Standards', price: 15, pjc: 12, img: 'kuzma',
    dates: [{ d: '2026-11-23', sets: two() }] },
  { id: 'dave-bristow-sides', img: 'bristow', title: 'Dave Bristow', sub: 'Sides', tag: 'Piano chic', price: 15, pjc: 12,
    dates: [{ d: '2026-11-24', sets: two() }] },
  { id: 'gabi-hartmann-4', title: 'Gabi Hartmann', tag: 'Vocal', price: 36, pjc: 33, jeune: 29, img: 'gabi',
    dates: ['2026-11-25', '2026-11-26', '2026-11-27', '2026-11-28'].map(d => ({ d, sets: two('full', d === '2026-11-28' ? 'full' : 'ok') })) },
  { id: 'jam-du-duc-franck-amsallem-9', jam: true, img: 'amsallem', title: 'Jam du Duc', sub: 'Franck Amsallem', tag: 'Jam du Duc',
    dates: [{ d: '2026-11-27', sets: jam() }] },
  { id: 'jam-du-duc-acoustic-standards-trio-3', jam: true, img: 'acoustic', title: 'Jam du Duc', sub: 'Acoustic Standards Trio', tag: 'Jam du Duc',
    dates: [{ d: '2026-11-28', sets: jam() }] },
  { id: 'jultrane-confirmation', title: 'Jultrane', sub: 'Confirmation', tag: "Sortie d'album", price: 38, pjc: 35, jeune: 31, img: 'jultrane',
    dates: [{ d: '2026-11-30', sets: twoDec() }] },
  { id: 'hugo-lippi-olha-maria', img: 'lippi', title: 'Hugo Lippi', sub: '« Olha Maria »', tag: 'Guitar master', price: 31, pjc: 28, jeune: 24,
    dates: [{ d: '2026-12-03', sets: twoDec() }] },
  { id: 'roberto-fonseca-trio-0', img: 'fonseca', title: 'Roberto Fonseca Trio', tag: 'Comme à Cuba', price: 75, pjc: 72, jeune: 68,
    dates: [{ d: '2026-12-10', sets: twoDec() }, { d: '2026-12-11', sets: twoDec('full', 'ok') }] },
  { id: 'sarah-mckenzie-merry-christmas-sarah-mckenzie', img: 'mckenzie', title: 'Sarah McKenzie', sub: 'Merry Christmas with Sarah McKenzie', tag: 'Vocal', price: 48, pjc: 45, jeune: 41,
    dates: ['2026-12-21', '2026-12-22', '2026-12-23'].map(d => ({ d, sets: twoDec() })) },
];
/* ---------- Billetterie officielle (SoTicket) ----------
   Chaque séance a sa propre page : https://billetterie.ducdeslombards.com/agenda/<id séance>-<nom>.
   Relevé sur la billetterie le 9 novembre 2026. Ordre : dates puis sets, comme ci-dessus. */
const SEANCES = {
  'ege-turev-1': ['Ege-Turev', [4095, 4096]],
  'terrace-martin-quartet': ['The-Terrace-Martin-Quartet', [4078, 4079]],
  'jesse-harris-6': ['Jesse-Harris', [4103, 4104]],
  'ekep-nkwelle-0': ['Ekep-Nkwelle', [4073, 4074, 4075, 4076]],
  'jam-du-duc-gael-horellou-7': ['JAM-DU-DUC-GAEL-HORELLOU', [4113]],
  'jam-du-duc-simon-chivallon-16': ['JAM-DU-DUC-SIMON-CHIVALLON', [4114]],
  'leron-thomas-pan-amsterdam-and-free-band': ['Leron-Thomas-Pan-Amsterdam-the-Free-Band', [4071, 4072]],
  'eric-harland-trio-feat-baptiste-trotignon-john-leftwich': ['Eric-Harland-Trio-feat-Baptiste-Trotignon-John-Leftwich', [4084, 4085, 4086, 4087]],
  'pablo-campos-quintet': ['Pablo-Campos-Quintet', [4105, 4106]],
  'antonio-farao-stephane-belmondo-quartet': ['Antonio-Farao-Stephane-Belmondo-Quartet', [4097, 4098]],
  'jam-du-duc-alex-monfort-1': ['JAM-DU-DUC-ALEX-MONFORT', [4126]],
  'antonio-farao-trio-3': ['Antonio-Farao-Trio', [4099, 4100]],
  'jam-du-duc-paul-morvan-25': ['JAM-DU-DUC-PAUL-MORVAN', [4115]],
  'theodore-kuzma-trio-0': ['Theodore-Kuzma-Trio', [4109, 4110]],
  'dave-bristow-sides': ['Dave-Bristow-Sides', [4101, 4102]],
  'gabi-hartmann-4': ['Gabi-Hartmann', [3896, 3897, 3898, 3899, 3900, 3901, 3902, 3903]],
  'jam-du-duc-franck-amsallem-9': ['JAM-DU-DUC-FRANCK-AMSALLEM', [4116]],
  'jam-du-duc-acoustic-standards-trio-3': ['JAM-DU-DUC-ACOUSTIC-STANDARDS-TRIO', [4117]],
  'jultrane-confirmation': ['Jultrane-Confirmation', [4080, 4081]],
  'hugo-lippi-olha-maria': ['HUGO-LIPPI-Olha-Maria', [4124, 4125]],
  'roberto-fonseca-trio-0': ['Roberto-Fonseca-Trio', [4089, 4090, 4091, 4092]],
  'sarah-mckenzie-merry-christmas-sarah-mckenzie': ['SARAH-McKENZIE-Merry-Christmas-with-Sarah-McKenzie', [4118, 4119, 4120, 4121, 4122, 4123]],
};
for (const e of EVENTS) {
  const m = SEANCES[e.id]; if (!m) continue;
  const [nom, ids] = m; let i = 0;
  e.bt = `${BILLETTERIE}agenda/${ids[0]}-${nom}`;
  for (const o of e.dates) for (const st of o.sets) {
    const id = ids[i++]; if (!id) continue;
    st.sid = id;
    if (st.s !== 'door') st.link = `${BILLETTERIE}agenda/${id}-${nom}`;
  }
}


export const NEWS = [
  { title: 'Leron Thomas, Pan Amsterdam & the Free Band', img: 'leron', href: 'concert.html#leron-thomas-pan-amsterdam-and-free-band' },
  { title: 'Cette semaine au Duc !', img: 'jesse', href: 'agenda.html' },
  { title: 'Programme de novembre 2026', img: 'jultrane', href: 'agenda.html' },
];

export const INFO = {
  address: '42, rue des Lombards, 75001 Paris',
  corner: 'à l’angle du 21, boulevard de Sébastopol',
  phone: '01 42 33 22 88', phoneHref: '+33142332288',
  email: 'contact@ducdeslombards.com',
  press: 'antonin@donnalee.fr',
  phoneHours: 'Lun.–ven. 14h–23h · sam. 17h–23h',
  metro: 'Châtelet (sortie 10, place Sainte-Opportune) — lignes 1, 4, 7, 11, 14',
  rer: 'Châtelet-Les Halles — RER A et B',
  bus: '21, 38, 47, 58, 64, 67, 69, 70, 72, 74, 75, 76, 81, 85',
  noct: 'N11 à N16, N21 à N24, N120 à N122',
  parkings: ['Indigo Sébastopol — 43 bis, bd de Sébastopol', 'Saemes Les Halles–Saint-Eustache — 22, rue des Halles'],
  maps: 'https://www.google.com/maps/search/?api=1&query=Duc+des+Lombards+42+rue+des+Lombards+75001+Paris',
};

/* Textes, line-up et vidéos repris des fiches concert de ducdeslombards.com */
export const CONTENT = {
 "kyle-eastwood-quintet-0": {
  "yt": "cb4LoHqW7pY",
  "desc": "Après avoir distillé le répertoire des bandes originales des films de son père dans le cadre de son projet “Eastwood by Eastwood”, le contrebassiste américain au swing élégant est de retour dans le club pour deux soirées événements !",
  "lu": [
   [
    "Kyle Eastwood",
    "Contrebasse & basse électrique"
   ],
   [
    "Andrew McCormack",
    "Piano"
   ],
   [
    "Brandon Allen",
    "Saxophones"
   ],
   [
    "Chris Higginbottom",
    "Batterie"
   ],
   [
    "Quentin Collins",
    "Trompette & bugle"
   ]
  ]
 },
 "ege-turev-1": {
  "yt": "qJGyOpPShG4",
  "desc": "Ege Turev est un jeune et talentueux batteur originaire d'Istanbul, qui fait fureur à chacun de ses passages au Duc. Nous l’accueillons ce soir entouré d’un quartet de jeunes pointures de la scène parisienne !",
  "lu": [
   [
    "Josiah Woodson",
    "Trompette"
   ],
   [
    "Antoine Fleury",
    "Claviers"
   ],
   [
    "Jean-Claude Brival",
    "Basse électrique"
   ],
   [
    "Ege Turev",
    "Batterie"
   ]
  ]
 },
 "terrace-martin-quartet": {
  "yt": "ByV4BeUjPR4",
  "desc": "S’il est collaborateur de longue date de Snoop Dogg, Terrace Martin s’est également illustré comme l’un des architectes des albums « good kid, m.A.A.d city » et « To Pimp a Butterfly » de Kendrick Lamar. Proche de Kamasi Washington, Robert Glasper ou encore de Christan Scott, ce brillant multi-instrumentiste, arrangeur, producteur et compositeur de Los Angeles sera de passage à Paris pour participer au tournage du film « Miles & Juliette ». L’occasion pour lui de rendre hommage au trompettiste légendaire dans le club, d’ores et déjà à guichet fermé.",
  "lu": [
   [
    "Terrace Martin",
    "Sax"
   ],
   [
    "Gabriel Sauzay",
    "Contrebasse"
   ],
   [
    "Francesco Ciniglio",
    "Batterie"
   ],
   [
    "Richard Sears",
    "Piano"
   ]
  ]
 },
 "jesse-harris-6": {
  "yt": "f6B0Vy2ajsQ",
  "desc": "Place au dernier épisode de la résidence de trois mois de Jesse Harris ! Il est l’homme qui se cache derrière les tubes de Melody Gardot, mais aussi de Norah Jones dont il a composé le célébrissime « Don’t Know Why ». Cet orfèvre du son et producteur new-yorkais, qui a sorti une vingtaine d’albums sous son nom, distillera sur notre scène les chansons et compositions teintées de folk de son nouvel opus « If You Believed in Me ».",
  "lu": [
   [
    "Jesse Harris",
    "Guitare & voix"
   ],
   [
    "Jeff Boudreaux",
    "Batterie"
   ],
   [
    "Wilbur Thompson",
    "Contrebasse"
   ],
   [
    "Robby Marshall",
    "Clarinette"
   ],
   [
    "Madeleine Athané-Best",
    "Violon"
   ],
   [
    "Pavel Paul",
    "Violon"
   ],
   [
    "Nina Tonji",
    "Alto"
   ],
   [
    "Marion Frere",
    "Violoncelle"
   ]
  ]
 },
 "ekep-nkwelle-0": {
  "yt": "Bc-5PlLoj24",
  "desc": "Ekep Nkwelle est une étoile montante du jazz vocal. Cette jeune chanteuse originaire de Washington DC a séduit Wynton Marsalis, Kenny Barron, Dianne Reeves, ou encore Emmet Cohen. A découvrir de toute urgence !",
  "lu": [
   [
    "Ekep Nkwelle",
    "Voix"
   ],
   [
    "Luther S. Allison",
    "Piano"
   ],
   [
    "Darryl Hall",
    "Contrebasse"
   ],
   [
    "Jason Brown",
    "Batterie"
   ]
  ]
 },
 "jam-du-duc-gael-horellou-7": {
  "desc": "Amoureux du jazz, curieux et/ou musiciens, tous les vendredis et samedis, le Duc des Lombards vous donne rendez-vous pour ses Jam Sessions ! Ce soir, la Jam sera animée par Gaël Horellou. La Jam du Duc : un incontournable de la vie nocturne parisienne !",
  "lu": [
   [
    "Gaël Horellou",
    "Sax alto"
   ],
   [
    "Levi Harvey",
    "Orgue"
   ],
   [
    "Thomas Galliano",
    "Batterie"
   ]
  ]
 },
 "jam-du-duc-simon-chivallon-16": {
  "desc": "Amoureux du jazz, curieux et/ou musiciens, tous les vendredis et samedis, le Duc des Lombards vous donne rendez-vous pour ses Jam Sessions ! Ce soir, la Jam sera animée par Simon Chivallon. La Jam du Duc : un incontournable de la vie nocturne parisienne !",
  "lu": [
   [
    "Simon Chivallon",
    "Piano"
   ],
   [
    "Clément Daldosso",
    "Contrebasse"
   ],
   [
    "Pierre-Eden Guilbaud",
    "Batterie"
   ]
  ]
 },
 "leron-thomas-pan-amsterdam-and-free-band": {
  "yt": "5K_qD87oQPE",
  "desc": "Leron Thomas est aussi à l’aise avec le jazz que le rock, le hip hop, ou l’indie pop. Pas étonnant donc que ce véritable caméléon ait tapé dans l’œil de Metronomy, Guts, ou encore de celui que l’on surnomme l’Iguane… Le trompettiste et chanteur américain a en effet produit l’album « Free » d’Iggy Pop, et officié au sein de son live band. C’est avec ce même groupe, dans lequel on retrouve le plus punk des pianistes de jazz Florian Pellissier et les excellents Tibo Brandalise, Kenny Ruby et Greg F, qu’il débarquera au Duc pour nous présenter son nouveau projet « PANARAMA », paru sur le label Def Presse !",
  "lu": [
   [
    "Leron Thomas",
    "Trompette & voix"
   ],
   [
    "Florian Pellissier",
    "Piano"
   ],
   [
    "Tibo Brandalise",
    "Batterie"
   ],
   [
    "Kenny Ruby",
    "Basse"
   ],
   [
    "Greg F",
    "Guitare"
   ]
  ]
 },
 "eric-harland-trio-feat-baptiste-trotignon-john-leftwich": {
  "yt": "i7FtRtf7nGk",
  "desc": "Eric Harland est l’un des meilleurs batteurs de sa génération. Très tôt repéré par Wynton Marsalis qui l’encourage à étudier à New York, il se forge une carrière prestigieuse en jouant avec des éminences du jazz telles que Betty Carter, Joe Henderson, Charles Lloyd, Joshua Redman ou encore Terence Blanchard. Il invite ce soir à ses côtés les exceptionnels Baptiste Trotignon au piano et John Leftwich à la contrebasse... La grande classe.",
  "lu": [
   [
    "Eric Harland",
    "Batterie"
   ],
   [
    "Baptiste Trotignon",
    "Piano"
   ],
   [
    "John Leftwich",
    "Contrebasse"
   ]
  ]
 },
 "pablo-campos-quintet": {
  "yt": "bihR9mvLYcQ",
  "desc": "Pablo Campos se passionne pour le Great American Songbook. Ce pianiste et chanteur proche de l’Amazing Keystone Big Band est également l’un des membres fondateurs du Zoot Collectif. Ce soir, il réunit sur notre scène un quintet de prouesses de la scène parisienne !",
  "lu": [
   [
    "Pablo Campos",
    "Piano & chant"
   ],
   [
    "Noé Codjia",
    "Trompette"
   ],
   [
    "Jeanne Michard",
    "Saxophone ténor"
   ],
   [
    "Viktor Nyberg",
    "Contrebasse"
   ],
   [
    "Philippe Maniez",
    "Batterie"
   ]
  ]
 },
 "antonio-farao-stephane-belmondo-quartet": {
  "yt": "FsqLdL79PDA",
  "desc": "Les pontes du jazz européen que sont Stéphane Belmondo et Antonio Faraò s’entourent de deux complices de tout premier plan : Thomas Bramerie et Benjamin Henocq. Un véritable carré d’as qui oscillera entre standards revisités et compositions originales.",
  "lu": [
   [
    "Stéphane Belmondo",
    "Trompette, bugle, shells"
   ],
   [
    "Antonio Faraò",
    "Piano"
   ],
   [
    "Thomas Bramerie",
    "Contrebasse"
   ],
   [
    "Benjamin Henocq",
    "Batterie"
   ]
  ]
 },
 "jam-du-duc-alex-monfort-1": {
  "desc": "Amoureux du jazz, curieux et/ou musiciens, tous les vendredis et samedis, le Duc des Lombards vous donne rendez-vous pour ses Jam Sessions ! Ce soir, la Jam sera animée par Alex Monfort. La Jam du Duc : un incontournable de la vie nocturne parisienne !",
  "lu": [
   [
    "Denis Pitalua",
    "Basse"
   ],
   [
    "Vincent Tortiller",
    "Batterie"
   ],
   [
    "Alex Monfort",
    "Piano"
   ]
  ]
 },
 "antonio-farao-trio-3": {
  "yt": "Lzq7VxsiDgE",
  "desc": "Antonio Faraò sillonne les scènes internationales depuis plus de quarante ans. Ce maître italien du piano, qui a côtoyé Jack DeJohnette, Marcus Miller, ou encore Benny Golson, mêle avec élégance l’héritage du jazz moderne, les rythmes du funk et une grande liberté d’improvisation. Démonstration en trio.",
  "lu": [
   [
    "Antonio Faraò",
    "Piano"
   ],
   [
    "Thomas Bramerie",
    "Contrebasse"
   ],
   [
    "Benjamin Henocq",
    "Batterie"
   ]
  ]
 },
 "jam-du-duc-paul-morvan-25": {
  "desc": "Amoureux du jazz, curieux et/ou musiciens, tous les vendredis et samedis après le second set, le Duc des Lombards vous donne rendez-vous pour ses Jam Sessions ! Ce soir, la Jam sera animée par Paul Morvan ! La Jam du Duc : un incontournable de la vie nocturne parisienne et un des rares lieux à proposer encore de la musique Live après minuit !",
  "lu": [
   [
    "Paul Morvan",
    "Batterie"
   ],
   [
    "Dmitry Baevsky",
    "Sax alto"
   ],
   [
    "Gabriel Sauzay",
    "Contrebasse"
   ]
  ]
 },
 "theodore-kuzma-trio-0": {
  "yt": "E6QSxQQAS9E",
  "desc": "Le pianiste parisien au swing déroutant Théodore Kuzma est influencé notamment par Art Tatum, Wynton Kelly et Bud Powell. Ce féru de bebop âgé de seulement 21 ans revisitera ce soir une sélection de standards en trio !",
  "lu": [
   [
    "Théodore Kuzma",
    "Piano"
   ],
   [
    "Gustave Reichert",
    "Batterie"
   ],
   [
    "Slim Chikhaoui",
    "Contrebasse"
   ]
  ]
 },
 "dave-bristow-sides": {
  "yt": "_twhAHL5o7A",
  "desc": "Le pianiste Dave Bristow est influencé tant par Herbie Hancock, Thelonious Monk, Bill Evans ou Frank Zappa que par la musique de jeu vidéo. Après nous avoir présenté son album “Unknown Unknown”, il revient avec son quintet pour défendre son projet “Sides”.",
  "lu": [
   [
    "Dave Bristow",
    "Piano, compositions"
   ],
   [
    "Christian Altehülshorst",
    "Trompette"
   ],
   [
    "Félix Hardouin",
    "Sax alto"
   ],
   [
    "Gabriel Pierre",
    "Contrebasse"
   ],
   [
    "Guillaume Prévost",
    "Batterie"
   ]
  ]
 },
 "gabi-hartmann-4": {
  "yt": "3MFZF0PJLoI",
  "desc": "Pour célébrer la fin de la tournée de son deuxième album, La Femme aux yeux de sel, la chanteuse parisienne multilingue, nommée au Prix Joséphine et en tournée internationale depuis plusieurs années, nous invite à plonger dans l’univers de Salinda, une femme en quête d’elle-même au fil d’un voyage initiatique. À la croisée du jazz, de la folk, de la soul et des musiques globales, son univers singulier raconte les rencontres, les métamorphoses et les chemins parcourus au fil de ses voyages. Pour clôturer cette tournée, elle a choisi de revenir là où tout a commencé pour elle en 2021, dans le club qui l'avait accueilli en résidence pour son premier EP.\nAccompagnée de son sextet, elle y donnera plusieurs concerts exceptionnels et invitera, chaque soir, des guests surprises à partager la scène avec elle, pour célébrer ensemble la fin de cette aventure.",
  "lu": [
   [
    "Gabrielle Hartmann",
    "Chant & guitare"
   ],
   [
    "Florian Robin",
    "Piano"
   ],
   [
    "Jérome Arrighi",
    "Basse"
   ],
   [
    "Arthur Alard",
    "Batterie & percussions"
   ],
   [
    "Abdoulaye Kouyaté",
    "Guitare"
   ],
   [
    "Robby Marschall",
    "Saxophone"
   ]
  ]
 },
 "jam-du-duc-franck-amsallem-9": {
  "desc": "Amoureux du jazz, curieux et/ou musiciens, tous les vendredis et samedis, le Duc des Lombards vous donne rendez-vous pour ses Jam Sessions ! Ce soir, la Jam sera animée par Franck Amsallem. La Jam du Duc : un incontournable de la vie nocturne parisienne !",
  "lu": [
   [
    "Franck Amsallem",
    "Piano"
   ],
   [
    "Pierre Marcus",
    "Contrebasse"
   ],
   [
    "Jesús Vega",
    "Batterie"
   ]
  ]
 },
 "jam-du-duc-acoustic-standards-trio-3": {
  "desc": "Amoureux du jazz, curieux et/ou musiciens, tous les vendredis et samedis, le Duc des Lombards vous donne rendez-vous pour ses Jam Sessions ! Ce soir, la Jam sera animée par le Acoustic Standards Trio. La Jam du Duc : un incontournable de la vie nocturne parisienne !",
  "lu": [
   [
    "Romain Vuillemin",
    "Guitare & voix"
   ],
   [
    "Damien Varaillon",
    "Contrebasse"
   ],
   [
    "David Grebil",
    "Batterie"
   ]
  ]
 },
 "jultrane-confirmation": {
  "yt": "0JgyNrBE_mk",
  "lu": [
   [
    "Julien Ndiaye",
    "Saxophone ténor & soprano"
   ],
   [
    "Cyril Galamini",
    "Trombone"
   ],
   [
    "Renaud Gensane",
    "Trompette"
   ],
   [
    "Frédéric D’Oelsnitz",
    "Piano"
   ],
   [
    "Gabriel Pierre",
    "Contrebasse"
   ],
   [
    "Laurent Sarrien",
    "Batterie"
   ]
  ]
 },
 "hugo-lippi-olha-maria": {
  "yt": "w0_n4C96Zek",
  "lu": [
   [
    "Hugo Lippi",
    "Guitare"
   ],
   [
    "Gael Rakotondrabe",
    "Piano"
   ],
   [
    "Laurent Vernerey",
    "Contrebasse"
   ],
   [
    "Denis Benarrosh",
    "Batterie"
   ]
  ]
 },
 "roberto-fonseca-trio-0": {
  "yt": "vdph2l0iw74",
  "lu": [
   [
    "Roberto Fonseca",
    "Piano & voix"
   ],
   [
    "Felipe Cabrera",
    "Contrebasse"
   ],
   [
    "Lukmil Perez",
    "Batterie"
   ]
  ]
 },
 "sarah-mckenzie-merry-christmas-sarah-mckenzie": {
  "yt": "j3qGakE0ohw",
  "lu": [
   [
    "Sarah McKenzie",
    "Piano & voix"
   ],
   [
    "Pierre Boussaguet",
    "Contrebasse"
   ],
   [
    "Hugo Lippi",
    "Guitare"
   ],
   [
    "Sebastiaan de Krom",
    "Batterie"
   ]
  ]
 }
};
