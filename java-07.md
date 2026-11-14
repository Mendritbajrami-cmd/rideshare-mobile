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

- Hapat: Hapa listën publike te `/`, zura ID 1 (Prishtinë – AAB, ora 08:00,
  1 vend i lirë) dhe klikova "Shiko detajet". Te detajet hapëm faqen e
  kërkesës demonstrative me "Kërko vend".
- Pritshmëria: I njëjti ID të sjellë te detajet e duhura: Prishtinë – AAB,
  ora 08:00, 1 vend, vendtakimi "Stacioni i autobusëve"; te kërkesa i njëjtat
  vlera, pa pretenduar rezervim real.
- Vëzhgimi: Kaloj — detajet treguan Prishtinë – AAB, Ora 08:00,
  Vendtakimi: Stacioni i autobusëve, Vende të lira: 1. Faqja e kërkesës
  tregoi të njëjtin udhëtim dhe mesazhin e simulimit. Kufiri i simulimit
  shpjegohet qartë: "Kjo faqe është demonstrim mësimor dhe nuk ka rezervim real."

### Prova 2 · Korrigjimi

- Hapat: Përsërita saktë hapat e Problemit 1: hyra te
  `/udhetimi/1/kerkesa` si vizitor pa sesion (asnjë kërkesë e dërguar)
  dhe lexova mesazhin pas ndryshimit.
- Pritshmëria: Faqja të mos më shkruajë më "Kërkesa u dërgua me sukses",
  por të tregojë qartë gjendjen simuluese: kërkesa nuk u dërgua.
- Vëzhgimi: Kaloj — tani shfaqet "Simulim: kërkesa nuk u dërgua", shpjegimi
  "Kjo faqe është demonstrim mësimor dhe nuk ka rezervim real" dhe udhëzimi
  për hyrje me GitHub. Konfirmimi i rremë u hoq.

### Prova 3 · Një hyrje tjetër

- Hapat: Ndryshova vetëm hyrjen: përdora ID 3 (Lipjan – AAB, ora 07:45,
  0 vende) nga lista dhe hapa `/udhetimi/3/kerkesa`.
- Pritshmëria: Me 0 vende pres mesazh "nuk ka vende" dhe asnjë premtim
  për rezervim; pres edhe një mënyrë për t'u kthyer te lista.
- Vëzhgimi: Pjesërisht dështoi — faqja tregoi saktë "Nuk ka vende të lira."
  (asnjë premtim rezervimi), por mbetet Problemi 2: pa lidhje kthimi te lista,
  faqja është vend i vrarë. Kjo mbetet e dokumentuar për korrigjim tjetër.

## Lidhjet e commit-eve

- Para: https://github.com/Mendritbajrami-cmd/rideshare-mobile/commit/be84e26fc38df8f561182efe62c8aa53455d595d
- Pas: https://github.com/Mendritbajrami-cmd/rideshare-mobile/commit/4a87b9823408c1f02a1ecee28d7b8414d602265d

## Ndryshimi i ri

Puna u krye jashtë orës në laborator, ndaj ajo demonstrim shtesë duhet
të përsëritet dhe shpjegohet te profesori në takimin e radhës.

## Ndihma nga AI

Parashikimi dhe vëzhgimet i shkrova vetë. Gjatë korrigjimit përdora
asistentin AI (OpenCode) për të gjetur skedarin përgjegjës, për të propozuar
dy problemet dhe për të shkruar ndryshimin e vogël në JSX. Testet i kryeva
vetë te aplikacioni duke hapur adresat e vërteta; AI ndihmoi vetëm me
kërkesën dhe shpjegimin, jo me parashikimin.
