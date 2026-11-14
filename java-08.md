# Java 8 · Vendtakimi në RideShare

Projekti: https://github.com/Mendritbajrami-cmd/rideshare-mobile

## Parashikimi

Te detajet e udhëtimit shtova zgjedhjen e vendtakimit: fushë manuale
"Shkruaj vendtakimin" + butoni "Konfirmo në telefon" + butoni
"Përdor vendndodhjen time". Parashikoj se faqja hapet pa kërkuar leje,
sepse leximi nis vetëm në klikim; pas suksesit shfaqet "Pozicioni u mor"
me saktësinë në metra; pas refuzimit apo skadimit pritja mbaron dhe
fusha manuale mbetet e përdorshme; teksti me vetëm hapësira nuk e
përditëson vendtakimin e konfirmuar, por shfaq gabim. Komponenti mbahet
lokalisht në telefonin e Artës: Dritoni ende nuk sheh vendtakimin, sepse
dërgimi te shoferi është hap i ardhshëm.

## Skedari i ndryshuar

- `aplikacioni/src/components/ZgjedhVendtakimin.tsx` — komponent i ri
  klienti me dy vlera `useState`: tekstin që po shkruhet dhe vendtakimin
  e konfirmuar. Butoni kopjon tekstin e pastruar me `trim()`; teksti bosh
  kërkon plotësim. Leximi i vendndodhjes thirret vetëm brenda klikimit,
  me kontroll të mbështetjes, mesazh pritjeje dhe `timeout: 10000`.
  Gjendja e leximit ka `data-state`: idle, loading, success, denied,
  timeout, unavailable.
- `aplikacioni/src/app/udhetimi/[id]/page.tsx` — e njëjta përdorim te
  detajet e udhëtimit; leximi i Neon mbetet në server.
- `aplikacioni/src/app/java-08-test/page.tsx` — faqja e provës me të
  njëjtin komponent dhe të dhëna fiktive lokale, pa login dhe pa databazë.
- `mobile-week08.json` — konfigurimi i testit pranë README.

## Kufizimi

Gjendja e zgjedhjes ruhet vetëm lokale në komponent: pas rifreskimit të
faqes vendtakimi i konfirmuar humbet. Dritoni nuk merr ende vendtakimin —
dërgimi dhe leximi te shoferi mbetet për javën tjetër.

## Provat

### Prova 1

Pranimi i lejes.

Hapat: Rifreskova faqen `/java-08-test` dhe vura re që asnjë pyetje për
leje nuk dallohet gjatë hapjes; pastaj klikova "Përdor vendndodhjen time"
dhe pranova lejen (vendndodhje e simuluar si te DevTools → Sensors).
Pritshmëria: Faqja hapet pa thirrje lejeje; pas klikimit shfaqet pritja
"Po kërkojmë vendndodhjen…", pastaj "Pozicioni u mor" me saktësinë në
metra, dhe butoni mbetet i përdorshëm.
Vëzhgimi: Kaloj — faqja hapet pa kërkuar leje (0 thirrje gjatë hapjes);
pas klikimit gjendja `success` shfaq "Pozicioni u mor." dhe
"Saktësia rreth 37 m" nga vendndodhja e simuluar; shkruajta "Biblioteka"
dhe e konfirmova; koordinatat nuk treguan vetë emrin e bibliotekës.

### Prova 2

Refuzimi dhe skadimi i leximit.

Hapat: Përsërita klikimin me lejen e bllokuar (kodi 1), pastaj simulova
kodi 3 (koha mbaroi) si në udhëzim dhe në të dyja rastet konfirmova
"Parkingu" manualisht.
Pritshmëria: Për refuzimin shfaqet "Leja u refuzua. Shkruaj vendtakimin
vetë."; për kodin 3 shfaqet "Koha mbaroi"; në të dyja rastet pritja
mbaron, butoni mbetet aktiv dhe konfirmimi manual punon.
Vëzhgimi: Kaloj — gjendja `denied` dhe `timeout` u shfaqën me mesazhet e
duhura, pritja përfundoi në të dyja degët, "Parkingu" u konfirmua dhe
lista me detajet mbetën të përdorshme. Kontrolli pa mbështetje
(`navigator.geolocation` i munguar) gjithashtu kaloi me gjendjen
`unavailable` dhe fushën manuale aktive.

### Prova 3

Skedarët që publikoj.

Hapat: Hapa listën e skedarëve që do të ngarkohen: kontrollova
`.gitignore`, dosjen e komponentit të ri dhe faqen e provës; kërkova
tekst koordinatash reale, adresash dhe sekretesh.
Pritshmëria: Në repository të mos dalin as koordinata reale, as adresa
sime, as sekrete; `.env.local` të mbetet i pa publikuar.
Vëzhgimi: Kaloj — komponenti lexon vetëm `position.coords.accuracy` dhe
nuk ruajton asnjë koordinatë apo adresë; `.env.local` është i injortuar
nga git; faqja e provës ka vetëm të dhëna fiktive. Kufizim i raportuar:
nuk e prova në pajisje reale me GPS të vërtetë, vetëm me vendndodhje
të simuluar në shfletues.

## Prova me një hyrje të re

Hyrja që provova: teksti me vetëm hapësira në fushën "Shkruaj
vendtakimin", pastaj klikimi i "Konfirmo në telefon".
Parashikimi im para klikimit: butoni nuk duhet ta përditësojë vendtakimin
e konfirmuar ("Biblioteka" mbetet), sepse `trim()` zbraz tekstin; pres
një mesazh gabimi që kërkon plotësim.
Çfarë pashë realisht: shfaqet gabimi "Shkruaj vendtakimin para se ta
konfirmosh." dhe vendtakimi i konfirmuar mbetet "Biblioteka", ashtu siç
parashikova.
Skedari dhe funksioni që e shpjegojnë: `ZgjedhVendtakimin.tsx`, funksioni
`konfirmo()` — pastron me `trim()`, nëse rezultati është bosh vendos
mesazhin në `gabimFushes` dhe kthehet pa e prekur `vendtakimi`.
Çfarë kuptova ose korrigjova: konfirmimi dhe shkrimi janë dy veprime të
ndara; vetëm tekst i plotë e përditëson zgjedhjen. Kufizimi që shënova:
gjendja lokale humbet pas rifreskimit, ndaj dërgimi te shoferi është
hapi logjik i ardhshëm.

## Ndihma nga AI

Logjikën e komponentit e ndërtova me ndihmën e asistentit AI (OpenCode)
duke ndjekur udhëzimin; AI ndihmoi me strukturën `useState`/klikim dhe me
faqen e provës. Tri provat i kryva vetë duke ekzekutuar testet e sjelljes
kunder serverit lokal me vendndodhje të simuluar (i njëjti skenar si te
DevTools → Sensors), dhe i verifikova rezultatet para dorëzimit.
