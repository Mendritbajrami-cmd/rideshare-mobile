# Java 10 · Dy ekrane, një gjendje

Projekti: https://github.com/Mendritbajrami-cmd/rideshare-mobile

## Çfarë ndërtova

Kërkesa e udhëtarit ruhet në Neon dhe të dy ekranet (`/udhetimi/[id]`) lexojnë
gjendjen nga serveri automatikisht çdo 5 sekonda, pa Refresh manual. I njëjti
ekran shërben për të dy rolet: serveri e njeh rolin nga sesioni dhe nga
pronari i udhëtimit. Shoferi sheh kërkesat e udhëtimit të vet dhe butonat
"Prano kërkesën" / "Refuzo"; udhëtari sheh vetëm kërkesën e vet, njoftimin
kur shoferi përgjigjet ("Kërkesa u pranua nga shoferi." ose "Kërkesa u
refuzua nga shoferi.") dhe butonin "Kërko një vend". Kufiri: një udhëtar mund
të kërkojë vetëm një vend për një linjë (nisja → destinacioni, ora) brenda
ciklit; kufiri llogaritet me orën e serverit dhe rifreskohet kur nis udhëtimi
i radhës (p.sh. Prishtinë → AAB, 08:00). Kështu një përdorues nuk mund t'i
mbushë vendet duke e shtypur disa herë. Pranimi zbret një vend një herë,
përsëritja
e pranimit nuk e ul numrin përsëri dhe vendet nuk bëhen negative. Nëse leximi
dështon, ekrani mban vlerat e fundit dhe shfaq "Po rilidhemi · të dhënat mund
të jenë të vjetra"; pas rikthimit lexon menjëherë dhe paralajmërimi hiqet
vetëm pas një përgjigjeje të suksesshme.

## Skedarët e ndryshuar

- `schema-java10.sql` — nuk shton tabelë të re; shton udhëtimin e provës me
  2 vende, `id = 10` (Ferizaj → AAB), me pronar shoferin e testit. Rregulli
  "vendet nuk bëhen negative" mbahet nga kufizimi ekzistues
  `udhetimet_vende_check CHECK (vende >= 0)`.
- `aplikacioni/src/lib/kerkesa.ts` — `lexoGjendjenEUdhetimit(id, login)`
  kthen udhëtimin (ID, nisja, destinacioni, ora, vendet) dhe kërkesat që ky
  sesion ka të drejtë të shohë: shoferi pronar merr të gjitha kërkesat e
  udhëtimit, udhëtari vetëm kërkesën e vet. `pergjigjuKerkeses` tani:
  verifikon që vepruesi është pronari i udhëtimit; pranon vetëm kërkesë
  `ne_pritje` me vende të lira; pranimi dhe zbritja e një vendi bëhen në një
  deklaratë të vetme SQL (`WITH ... UPDATE kerkesa ... UPDATE udhetimet`),
  ndaj janë atomike; përsëritja e pranimit kthen sukses pa zbritje.
- `aplikacioni/src/app/api/udhetimet/[id]/gjendja/route.ts` — `GET` vetëm
  lexim, me `Cache-Control: no-store`: pa sesion `401`, udhëtim i panjohur
  `404`, përndryshe gjendja e lejuar për këtë sesion.
- `aplikacioni/src/components/GjendjaUdhetimit.tsx` — komponenti klient:
  lexim çdo 5 sekonda, pa lexim të dytë ndërsa i pari pret, përgjigje të
  vjetruara hidhen, timer-i pastrohet në dalje nga faqja; gjendja e rrjetit
  ruhet dhe veprimet bllokohen pa lidhje; pranimi/dërgimi i kërkesës bëhen
  me butona që tregojnë pritjen dhe konfirmohen vetëm pas përgjigjes.
- `aplikacioni/src/app/udhetimi/[id]/page.tsx` — vendos komponentin e
  gjendjes në faqen e udhëtimit (në vend të butonit të vjetër të kërkesës).
- `aplikacioni/src/components/RifreskimiAutomatik.tsx` — rifreskon panelin me
  `router.refresh()` çdo 5 sekonda; pauzon pa lidhje dhe rifreskon menjëherë
  pas rikthimit.
- `aplikacioni/src/app/panel/page.tsx` dhe `.../panel/kerkesa/page.tsx` —
  vendosin rifreskimin automatik të panelit.

## Provat

Udhëtimi i provës: `id = 10` me 2 vende. Sesionet: shoferi
`Mendritbajrami-cmd` dhe udhëtari `MendritBajrami` (dy sesione të ndryshme).
Udhëtimet 11 dhe 12 u përdorën vetëm për provat dhe u fshinë pas tyre.

### Prova 1 — Kërkesa mbërrin te shoferi

Hapat: Hapa `/udhetimi/10` si udhëtar (pa kërkesë, 2 vende), pastaj hapa të
njëjtin udhëtim si shofer dhe e lashë të hapur pa e rifreskuar. Udhëtari
klikoi "Kërko një vend".

Pritshmëria: Udhëtari sheh "Në pritje" dhe "Kërkesa u dërgua"; shoferi e
shfaq kërkesën në leximin e radhës, pa Refresh, me statusin "Në pritje";
vendet mbeten 2 në të dy ekranet.

Vëzhgimi: Kaloj — udhëtari pa "Në pritje"; shoferi pa "KËRKESA E
MENDRITBAJRAMI / Në pritje" pas **5.1 sekondash** pa asnjë rifreskim manual;
të dy ekranet treguan 2 vende; në databazë u krijua një rresht i vetëm
`ne_pritje` për çiftin (udhëtimi 10, MendritBajrami).

### Prova 2 — Pranimi përditëson të dy ekranet

Hapat: Shoferi klikoi "Prano kërkesën". Pastaj përsërita të njëjtin pranim
me një kërkesë të dytë ndaj API-së. Për rastin e 0 vendeve përdora udhëtimin
11 me 1 vend: udhëtari dërgoi kërkesë, pastaj vendin e bëra 0 me të dhëna
prove (SQL) dhe shoferi provoi pranimin.

Pritshmëria: Pas pranimit të dy ekranet tregojnë "U pranua" dhe 1 vend;
përsëritja nuk e ul numrin përsëri; me 0 vende pranimi refuzohet dhe kërkesa
mbetet në pritje; vetëm pronari mund të pranojë.

Vëzhgimi: Kaloj — shoferi pa "U pranua" + "Pranimi u ruajt" dhe 1 vend brenda
0.8 s; udhëtari pa "U pranua" + "Vendi u konfirmua" dhe 1 vend në leximin e
radhës, pa Refresh; databaza: `vende = 1`, kërkesa `pranuar`. Përsëritja e
pranimit ktheu `200 {"sukses":true}` dhe vendet mbetën **1** (pa zbritje të
dytë). Në udhëtimin 11 me 0 vende, pranimi ktheu "Nuk ka më vende të lira.",
vendet mbetën **0** dhe kërkesa mbeti `ne_pritje`. Udhëtari që provoi të
pranojë kërkesën e dikujt tjetër mori `400 Vetëm shoferi pronar mund të
përgjigjet.`; pa sesion, leximi dhe pranimi kthyen **401**.

Refuzimi u provua në të njëjtin udhëtim 10: shoferi klikoi "Refuzo" dhe
udhëtari pa "U refuzua", njoftimin "Kërkesa u refuzua nga shoferi." dhe
shënimin e kufirit ("Kërkesa u refuzua · kufiri i kërkesave · rifreskohet pas
nisjes në 08:15") pa buton; vendet mbetën 2, kërkesa u shënua `refuzuar`.
Edhe një kërkesë e dytë për të njëjtën linjë (edhe përmes një udhëtimi tjetër
me të njëjtën nisje, destinacion dhe orë) u refuzua me `400` dhe vendet
mbetën 2. Kufiri llogaritet nga `NOW()` i databazës; kur kërkesa u zhvendos
2 ditë më parë (jashtë ciklit), butoni "Provo përsëri" u shfaq dhe kërkimi i
ri kaloi, pa iu ulur vendet udhëtimit.

### Prova 3 — Ndërprerja dhe rilidhja

Hapat: Nisa një kërkesë të re në pritje në udhëtimin 12 (2 vende). Vendosa
vetëm dritaren e udhëtarit në DevTools → Network → Offline, ndërsa shoferi
mbeti online. Shoferi pranoi kërkesën. Pastaj e ktheva udhëtarin online, pa
Refresh manual.

Pritshmëria: Udhëtari offline mban pamjen e fundit me paralajmërimin "Po
rilidhemi…" dhe veprimet bllokohen; shoferi sheh 1 vend; pas rikthimit
udhëtari merr gjendjen e re automatikisht dhe paralajmërimi hiqet.

Vëzhgimi: Kaloj — udhëtari offline shfaqi "Po rilidhemi · të dhënat mund të
jenë të vjetra", mbajti 2 vende dhe "Në pritje", dhe shfaqi "Veprimet që
kërkojnë rrjet janë të bllokuara"; shoferi pa 1 vend dhe "U pranua"; pas
kthimit online, udhëtari pa "U pranua" dhe 1 vend pas **0.8 s** (lexim i
menjëhershëm), dhe paralajmërimi u zëvendësua me "Gjendja u lexua nga
serveri". Databaza: `vende = 1`, kërkesa `pranuar`.

### Udhëtim tjetër, parashikim

Zgjodha udhëtimin 12 në vend të 10 për provën 3. Parashikova që sjellja të
ishte e njëjta, vetëm ID-ja ndryshon, sepse gjendja lexohet sipas
`udhetimi_id` dhe roli sipas pronarit — ashtu ndodhi. Ndryshimi i vetëm mes
udhëtimeve është numri fillestar i vendeve.

## Kufizimet

- Përditësimi është periodik (çdo 5 s), jo shtytje në kohë reale: vonesa
  maksimale është një interval leximi.
- Për demonstrim manual duhen dy sesione me identitete të ndryshme (dy
  llogari GitHub ose punë në çift); dy skeda normale ndajnë të njëjtin sesion.
- Udhëtimet demo 1 dhe 3 kanë pronar `DEMO-SHOFER-2`; pranimi tani kërkon
  login-in e pronarit, ndaj ato pranohen vetëm me atë identitet prove. Për
  demonstrim përdoret udhëtimi 10, pronar `Mendritbajrami-cmd`.
- Kufiri i kërkesave është një kërkesë për udhëtar dhe linjë brenda ciklit
  (nga nisja e kaluar në nisjen e radhës), me orën e serverit në zonën e
  Kosovës; pas nisjes, cikli i radhës lejon kërkesë të re. Nëse kërkesa e
  vjetër ishte pranuar, vendi i zënë kthehet para kërkimit të ri.
- Paneli (`/panel` dhe `/panel/kerkesa`) rifreskohet automatikisht çdo 5
  sekonda; pa lidhje pauzohet dhe nis menjëherë pas rikthimit.
- Provat u kryen në serverin lokal kundër Neon-it real; nuk u provua në
  Vercel me dy pajisje fizike.

## Ndihma nga AI

Logjikën e leximit periodik, rrugën `GET /api/udhetimet/[id]/gjendja` dhe
pranimin atomik i ndërtova me ndihmën e asistentit AI (OpenCode), duke
ndjekur modelin ekzistues të `kerkesa`. AI ndihmoi edhe me skriptin e provës
(Playwright me dy sesione, ndërprerje rrjeti dhe kontrolle SQL). Tri provat i
ekzekutova vetë dhe verifikova çdo rezultat edhe direkt në Neon: 1 rresht i
vetëm pas kërkesës, 1 vend pas pranimit, asnjë zbritje e dytë pas përsëritjes,
0 vende dhe kërkesë ende në pritje në rastin e mbingarkesës, dhe 1 vend pas
rilidhjes.
