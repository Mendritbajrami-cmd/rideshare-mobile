# Java 9 · Udhëtimet e preferuara

Projekti: https://github.com/Mendritbajrami-cmd/rideshare-mobile

## Çfarë ndërtova

Te detajet e udhëtimit shtova butonin e preferuara: ☆ "Ruaj udhëtimin" →
★ "Po ruhet…" (pritja) → ★ "I ruajtur" (konfirmimi pas përgjigjes së
serverit). Numri "Të preferuarat" rritet optimistikisht gjatë pritjes dhe
konfirmohet me numrin real nga databaza pas suksesit. Preferimi ruhet në
tabelën e re `preferimet` në Neon, i lidhur me përdoruesin e kyçur
(login-i i GitHub) dhe me udhëtimin; pas rifreskimit lexohet nga serveri
dhe mesazhi thotë "Preferimet u lexuan nga serveri.". Preferimi është
personal — nuk zvogëlon vendet e Dritonit dhe nuk dërgon kërkesë rezervimi.

## Skedarët e ndryshuar

- `schema-java09.sql` — skema: tabela `preferimet` me `id SERIAL`,
  `udhetimi_id` (çelës i huaj te `udhetimet`, `ON DELETE CASCADE`),
  `udhetari_login`, `krijuar_ne`, dhe kufizimi
  `UNIQUE(udhetimi_id, udhetari_login)` që ndalon kopjet në nivelin e
  databazës, plus indeks te `udhetari_login`.
- `aplikacioni/src/lib/preferimet.ts` — funksionet e databazës:
  `lexoPreferimin` (a e ka ruajtur ky përdorues këtë udhëtim),
  `numriPreferimeve` (numri i preferimeve të përdoruesit) dhe
  `ruajPreferimin`, që kontrollon që udhëtimi ekziston dhe shkruan me
  `INSERT ... ON CONFLICT (udhetimi_id, udhetari_login) DO NOTHING`.
- `aplikacioni/src/app/api/preferimet/route.ts` — API `POST /api/preferimet`
  me NextAuth: pa sesion kthen `401`; pa ID kthen `400`; flag-i
  `gabimProve` shkakton refuzim të kontrolluar **para çdo shkrimi** në
  databazë (kjo është edhe prova e Rastit 2); suksesi kthen numrin real.
- `aplikacioni/src/components/PreferimiButoni.tsx` — komponenti klient:
  gjendjet `ruajtur`/`pritje`/`deshmuar` me `useState`; numri optimistik
  (+1 në klikim, −1 në rikthim); butoni bllokohet gjatë pritjes dhe pas
  ruajtjes, ndaj klikimet e shpejta nuk nisin ruajtje të reja.
- `aplikacioni/src/app/udhetimi/[id]/page.tsx` — faqja e udhëtimit lexon
  në server preferimin dhe numrin e përdoruesit të kyçur dhe i jep si
  vlera fillestare butonit.

## Provat

### Prova 1 — Ruajtje e suksesshme dhe rifreskim

Hapat: Hapa `/udhetimi/2` te serveri lokal, i kyçur si Arta
(Mendritbajrami-cmd) me 2 preferime ekzistuese; klikova "Ruaj udhëtimin";
pritja dhe konfirmimi u vunë re me Playwright (kërkesa u vonua 700 ms
me qëllim që gjendja e pritjes të shihej); pastaj rifreskova faqen.

Pritshmëria: Ylli mbushet menjëherë me "Po ruhet…" dhe numri bëhet 3
edhe pse kërkesa ende pret; pas përgjigjes shfaqet "I ruajtur" me
"U ruajt te të preferuarat."; pas rifreskimit preferimi mbetet dhe
mesazhi thotë "Preferimet u lexuan nga serveri.".

Vëzhgimi: Kaloj — gjatë pritjes numri ishte 3 (optimistik); pas
përgjigjes "★ I ruajtur" + "U ruajt te të preferuarat."; pas rifreskimit
mesazhi ishte "Preferimet u lexuan nga serveri." dhe numri mbeti 3; në
Neon ekziston saktësisht 1 rresht për çiftin (Mendritbajrami-cmd, 2).

### Prova 2 — Refuzim i kontrolluar para shkrimit

Hapat: Hapa `/udhetimi/1?gabim-prove=1` (udhëtim i paruajtur, numri 0);
klikova "Ruaj udhëtimin"; vura re pritjen, rikthimin dhe mesazhin;
kontrollova databazën për çiftin; pastaj hapa faqen pa parametrin dhe
prova sërish.

Pritshmëria: Pas pritjes ylli kthehet bosh ("☆ Provo përsëri"), numri
rikthehet në 0 dhe shfaqet "Nuk u ruajt. Provo përsëri."; në databazë të
mos ketë rresht të ri; pa refuzimin ruajtja përsërit me sukses.

Vëzhgimi: Kaloj — pas pritjes "☆ Provo përsëri" + "Nuk u ruajt. Provo
përsëri."; numri u rikthye nga 1 optimistik në 0; në databazë rreshta
për çiftin (Mendritbajrami-cmd, 1): **0** (verifikova direkt me SQL, jo
vetëm në UI); hapja pa `?gabim-prove=1` ruajti me sukses. Refuzimi ndodh
në API përpara shkrimit, ndaj databaza nuk preket fare.

### Prova 3 — Përsëritja nuk krijon kopje

Hapat: Në `/udhetimi/4` klikova "Ruaj udhëtimin" dhe provova klikim të
dytë gjatë pritjes (400 ms); pastaj kërkuara përsëritja e të njëjtit
synim ruajtjeje në nivelin e databazës (3 shkrime të njëjta me
`ON CONFLICT DO NOTHING`); rifreskova faqen dhe kontrollova numrin e
rreshtave me SQL.

Pritshmëria: Klikimet gjatë pritjes të mos nisin ruajtje të dytë; në
databazë të ketë vetëm një rresht për çiftin përdorues–udhëtim; pas
rifreskimit preferimi mbetet "★ I ruajtur".

Vëzhgimi: Kaloj — klikimi i dytë gjatë pritjes u refuzua nga butoni
(`disabled`); tri shkrime të njëjta në databazë prodhuan
**saktësisht 1 rresht** (verifikova me `SELECT COUNT(*)`); pas
rifreskimit faqja shfaqte "★ I ruajtur" me 1 rresht për çift. Prova
është e dyfishtë: butoni bllokon dublikatën në UI dhe `UNIQUE` +
`ON CONFLICT DO NOTHING` e ndalojnë në databazë.

Kolegu zgjedh një udhëtim tjetër: e njëjta zgjidhje funksionon, sepse
çifti (login, udhetimi_id) është unik — numri "Të preferuarat" është
totali personal i preferimeve dhe rritet pavarësisht se cili udhëtim
ruhet. Prova edhe pa sesion: `POST /api/preferimet` pa cookie ktheu
**HTTP 401**.

## Kufizimet

- Heqja e preferimit nuk është ndërtuar — detyra kërkon vetëm shtimin;
  është zgjerim opsional (do të ishte `DELETE ... WHERE` + butoni i dytë).
- Numri "Të preferuarat" është totali personal i përdoruesit, jo numri i
  preferimeve për atë udhëtim.
- `?gabim-prove=1` është mjet prove: kushdo që e hap faqen me këtë
  parametër sheh refuzim të kontrolluar; refuzimi ndodh para shkrimit,
  ndaj nuk prish të dhënat.
- Preferimi tregohet te faqja e udhëtimit; nuk ka ende faqe/listë e
  veçantë "Të preferuarat" në navigim.

## Ndihma nga AI

Logjikën e preferimit e ndërtova me ndihmën e asistentit AI (OpenCode):
skema SQL, funksionet e databazës, API-ja dhe komponenti klient u shkruan
duke ndjekur format e njëjta me kodin ekzistues (`kerkesa`). AI ndihmoi
edhe me skriptet e provës (Playwright + seancë lokale NextAuth) dhe me
pajisjen e refuzimit të kontrolluar. Tri provat i kryva vetë kunder
serverit lokal dhe verifikova çdo rezultat edhe direkt në databazën Neon
(1 rresht pas ruajtjes, 0 pas refuzimit, 1 pas tri shkrimeve) para
dorëzimit.
