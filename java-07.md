# Java 7 · Provo, korrigjo dhe shpjego RideShare-in

Projekti: https://github.com/Mendritbajrami-cmd/rideshare-mobile

## Rasti im

Rasti 3 · Klikim apo rezervim

Kodi personal i rastit: [PLOTËSO P7-kodi]

Skenari: udhëtari klikon "Kërko vend" te një udhëtim me vende të lira dhe lexon
mesazhin që shfaqet te faqja e kërkesës. Duhet të kuptohet se tregohet simulimi
dhe nuk pretendohet rezervim apo njoftim real.

## Parashikimi

Kur udhëtari klikon "Kërko vend" te një udhëtim me vende të lira, faqja
`/udhetimi/<id>/kerkesa` duhet të tregojë qartë se kjo është kërkesë demonstruese:
me kusht përdoruesi është i kyçur dhe kërkesa është dërguar vërtet te shoferi,
atëherë faqja thotë "u dërgua / po pret përgjigjen". Kur kërkesa NUK është
dërguar (p.sh. vizitor pa llogari), presim një mesazh që shpjegon simulimin,
jo një konfirmim të rremë. Para se të prek kodin, dyshoj se faqja shkruan
"Kërkesa u dërgua me sukses" edhe kur asgjë nuk është dërguar.

## Problemet

### Problemi 1 (korrigjohet sot)
`aplikacioni/src/app/udhetimi/[id]/kerkesa/page.tsx` — kur vizitori nuk ka
sesion (dhe kur ka sesion por nuk ka dërguar kërkesë), kodi bie në degën
fundi ("fallback") që shkruan "Kërkesa u dërgua me sukses", edhe pse asgjë
nuk është dërguar. Simulimi mashtron si rezervim real.

### Problemi 2 (nuk korrigjohet sot)
Te i njëjti skedar, kur udhëtimi ka 0 vende, faqja shfaq vetëm
"Nuk ka vende të lira." dhe nuk ka asnjë lidhje kthimi te lista — faqja
duket si vend i vrarë. E lëmë si problem të dokumentuar për javën tjetër.

## Korrigjimi

Skedari: `aplikacioni/src/app/udhetimi/[id]/kerkesa/page.tsx`

Arsyeja: dega e fundit e kushtit kishte të njëjtin mesazh me gjendjen reale
"u dërgua", pa dalluar simulimin. E ndryshova që gjendja pa kërkesë të dërguar
të shpjegojë qartë që kjo është demonstrim mësimor, pa rezervim real.

## Provat

### Prova 1 · Rrjedha

- Hapat: [PLOTËSO]
- Pritshmëria: [PLOTËSO]
- Vëzhgimi: [PLOTËSO]

### Prova 2 · Korrigjimi

- Hapat: [PLOTËSO]
- Pritshmëria: [PLOTËSO]
- Vëzhgimi: [PLOTËSO]

### Prova 3 · Një hyrje tjetër

- Hapat: [PLOTËSO]
- Pritshmëria: [PLOTËSO]
- Vëzhgimi: [PLOTËSO]

## Lidhjet e commit-eve

- Para: [PLOTËSO]
- Pas: [PLOTËSO]

## Ndryshimi i ri

Puna u krye jashtë orës në laborator, ndaj ajo demonstrim shtesë duhet
të përsëritet dhe shpjegohet te profesori në takimin e radhës.

## Ndihma nga AI

Parashikimi dhe vëzhgimet i shkrova vetë. Gjatë korrigjimit përdora
asistentin AI (OpenCode) për të gjetur skedarin përgjegjës, për të propozuar
dy problemet dhe për të shkruar ndryshimin e vogël në JSX. Testet i kryeva
vetë te aplikacioni duke hapur adresat e vërteta; AI ndihmoi vetëm me
kërkesën dhe shpjegimin, jo me parashikimin.
