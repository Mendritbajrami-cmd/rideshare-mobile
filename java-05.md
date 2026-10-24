# RideShare — Java 5 · Hyrja dhe lejet

## Çfarë ndërtova
Identiteti është kush je: e merr serveri nga sesioni i verifikuar i GitHub (NextAuth), jo nga formulari. Roli (`udhetar` ose `shofer`) ruhet në tabelën `profilet` në Neon dhe vendos çfarë lejohet të bësh. Pronësia (`udhetimet.shofer_id`) tregon cilin udhëtim e zotëron. Ora ndryshon vetëm kur serveri konfirmon që je shofer dhe pronari i atij udhëtimi.

## Provat që bëra
### Prova 1: Hyrja, rifreskimi dhe dalja
Hapa /panel pa hyrë dhe u shfaq butoni "Hyr me GitHub" me mesazhin që lista është publike. Hyra me GitHub; pas rifreskimit emri dhe roli mbetën në panel. Pas klikimit "Dil", paneli kërkoi përsëri hyrje.

### Prova 2: Shoferi ndryshon udhëtimin e vet
Si shofer i ID 2 e ndryshova orën në 08:25. Paneli shfaqi "Ora u ruajt me sukses"; lista, detajet e /udhetimi/2 dhe SQL Editor treguan 08:25. Pastaj e riktheva orën në 08:15.

### Prova 3: Veprimi pa leje refuzohet
Në DevTools ndryshova inputin e fshehur `id` nga 2 në 1 dhe klikova Ruaj. U shfaq "Nuk ke leje për këtë udhëtim. Ora nuk ndryshoi." Në Neon SQL Editor `SELECT id, ora, shofer_id FROM udhetimet` tregoi që ID 1 mbeti 08:00 dhe i përket DEMO-SHOFER-2.

## Ku gjendet puna
Repository: https://github.com/yllalickaj7-bit/rideshare-mobile. Skedarët e rinj: `aplikacioni/schema-java05.sql`, `src/lib/auth.ts`, `src/lib/lejet.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/components/Hyrja.tsx`, `src/app/panel/page.tsx`, `src/app/panel/actions.ts` dhe `src/app/page.tsx` i përditësuar.

## Çfarë mbetet për përmirësim
Kërkesa për vend është ende simulim. Më pas do ta ruaja kërkesën në Neon dhe do t'i lejoja shoferit-pronar ta pranojë ose refuzojë.

## Ndihma nga AI (Artificial Intelligence – inteligjencë artificiale)
AI më ndihmoi të vendos skedarët sipas udhëzimeve dhe të krijojë tabelën `profilet`. Hyrjen, ndryshimin e orës dhe refuzimin e ID 1 i provova vetë në shfletues dhe Neon.
