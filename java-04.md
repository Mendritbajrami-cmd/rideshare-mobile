# RideShare — Java 4 · Neon dhe PostgreSQL

Ruaje këtë skedar si java-04.md pranë README, jashtë aplikacioni/.
Plotëso të gjitha përgjigjet.
Mos vendos DATABASE_URL, pamje të kredencialeve ose të dhëna reale.

## Çfarë ndërtova
Në këtë ushtrim lidha aplikacionin RideShare me databazën PostgreSQL në Neon duke përdorur me sukses paketën `@neondatabase/serverless` dhe `server-only`. Lista kryesore e udhëtimeve, faqja e detajeve (`/udhetimi/[id]`) dhe faqja e simulimit të kërkesës (`/udhetimi/[id]/kerkesa`) tani i lexojnë të dhënat drejtpërdrejt nga tabela `udhetimet` në Neon në mënyrë dinamike (`export const dynamic = "force-dynamic"; export const revalidate = 0;`).

## Provat që bëra
### Prova 1: Ndryshimi në databazë shfaqet në aplikacion
- **Hapat:** Në Neon SQL Editor ekzekutova SQL komandën `UPDATE udhetimet SET ora = '08:25' WHERE id = '2';` dhe më pas rifreskova aplikacionin në shfletues.
- **Rezultati real:** Karta e udhëtimit me ID 2 në faqen kryesore dhe në faqen e detajeve tregoi orën e përditësuar 08:25 menjëherë pa ndryshuar asnjë rresht kodi. Pas verifikimit, ekzekutova sërish SQL komandën për ta kthyer orën në 08:15 dhe të dyja faqet pas rifreskimit treguan sërish orën origjinale 08:15.

### Prova 2: Lista bosh dhe rikthimi
- **Hapat:** Te skedari `src/lib/udhetimet.ts`, brenda funksionit `lexoUdhetimet`, shtova përkohësisht kushtin `WHERE false` në pyetjen SQL (`FROM udhetimet WHERE false ORDER BY id`).
- **Rezultati real:** Pas ruajtjes dhe rifreskimit të faqes kryesore, aplikacioni shfaqi me sukses mesazhin "Nuk ka udhëtime për momentin.". Pasi hoqa kushtin `WHERE false` dhe ruajta skedarin, u kthyen përsëri të gjitha kartat e udhëtimeve në ekran.

### Prova 3: Lidhja mungon, rikthimi dhe siguria
- **Hapat:** Në skedarin `.env.local` riemërtova përkohësisht variablën `DATABASE_URL` në `DATABASE_URL_PA_TEST`, ndala serverin dev dhe e rinisa atë përsëri.
- **Rezultati real:** Gjatë rifreskimit të faqes, aplikacioni kapi gabimin e mungesës së databazës dhe shfaqi mesazhin paralajmërues "Nuk u lidhëm me databazën. Provo përsëri.". Pasi riktheva emrin `DATABASE_URL` dhe rinisa serverin, aplikacioni u lidh sërish normalisht me Neon, ndërsa skedari `.env.local` është i mbrojtur në `.gitignore` dhe nuk përfshihet në GitHub Desktop.

## Ku gjendet puna
- Tabela dhe të dhëna fillestare SQL: `aplikacioni/schema.sql`
- Lidhja me Neon: `aplikacioni/src/lib/db.ts`
- Funksionet e leximit SQL: `aplikacioni/src/lib/udhetimet.ts`
- Faqet Next.js: `aplikacioni/src/app/page.tsx`, `aplikacioni/src/app/udhetimi/[id]/page.tsx`, `aplikacioni/src/app/udhetimi/[id]/kerkesa/page.tsx`
- Linku i repository-t: https://github.com/Mendritbajrami-cmd/rideshare-mobile

## Çfarë mbetet për përmirësim
Kërkesa për vend ("Në pritje") mbetet ende një simulim në frontend. Nuk ka ende një formular publik për krijimin e udhëtimeve të reja ose ruajtjen e rezervimeve reale në databazë, gjë që do të shtohet në javët e ardhshme.

## Ndihma nga AI (Artificial Intelligence – inteligjencë artificiale)
Përdora AI për konfigurimin e strukturës së kodit të lidhjes me Neon database (`getSql()`, queries async), krijimin e skedarit `schema.sql`, përshtatjen e faqeve me `force-dynamic` dhe kontrollin e ekzekutimit të provave. Të gjitha ndryshimet dhe funksionalitetet i verifikova vetë.
