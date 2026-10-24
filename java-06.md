# RideShare — Java 6 · PWA dhe puna offline

## Çfarë ndërtova
Manifesti (`src/app/manifest.ts`) i jep aplikacionit emrin "RideShare AAB", pamjen standalone dhe dy ikona (192×192 dhe 512×512). Service worker-i (`public/sw.js`) ruan vetëm faqen offline, ikonat dhe listën publike nga `/api/udhetimet`; paneli, hyrja dhe POST nuk ruhen. Kopja publike në pajisje lexohet nga `public/offline.html` kur serveri nuk arrihet, me burimin dhe kohën e ruajtjes. Ndërfaqja kryesore tani tregon statusin Live/Pa internet, rolin (Shofer/Udhëtar), statistika, kërkim sipas nisjes dhe badge me ngjyra për vendet.

## Provat që bëra
### Prova 1: Manifesti dhe vizita online
Hapa http://localhost:3000/manifest.webmanifest: emri ishte RideShare AAB dhe ikonat /icons/icon-192.png (192×192) dhe /icons/icon-512.png (512×512) u hapën. Te Application → Service Workers /sw.js ishte aktiv dhe te Cache Storage → rideshare-public-v1 u ruajt /api/udhetimet. Shfletuesi në kompjuter ofroi instalimin; në telefon nuk e provova.

### Prova 2: Pa internet dhe pas rifreskimit
Simulova ndërprerjen me Network → Offline në tab-in RideShare dhe rifreskova faqen. U hap lexuesi offline me tri kartat dhe koha e ruajtjes, me mesazhin "Lista e fundit e ruajtur · Mund të jetë vjetruar". Butoni Kërko vend ishte i çaktivizuar, sepse kopja lokale nuk mund të konfirmojë asnjë rezervim në server.

### Prova 3: Lidhja rikthehet
Në Neon ndryshova ID 2 nga 08:15 në 08:25 ndërsa RideShare ishte offline; kopja tregonte ende 08:15. Pasi ktheva Online dhe klikova Rifresko listën, ID 2 tregoi 08:25, burimin server dhe kohën e re. Pastaj rikthova orën 08:15 në Neon dhe rifreskova sërish.

## Ku gjendet puna
Repository: https://github.com/yllalickaj7-bit/rideshare-mobile. Skedarët e shtuar: src/app/manifest.ts, src/app/api/udhetimet/route.ts, src/components/Pwa.tsx, src/app/layout.tsx, public/sw.js, public/offline.html, public/icons/icon-192.png, public/icons/icon-512.png.

## Çfarë mbetet për përmirësim
Në vizitën e parë pa internet nuk ka kopje, prandaj shfaqet "Ende nuk ka listë të ruajtur". Leximi offline tregon vetëm të dhëna publike që mund të jenë të vjetra dhe nuk lejon kërkesë apo ndryshim.

## Ndihma nga AI (Artificial Intelligence – inteligjencë artificiale)
Përdora AI për të përshtatur kodin e ushtrimit dhe dizajnin e ndërfaqes; provat dhe kontrollin në shfletues i bëra vetë.
