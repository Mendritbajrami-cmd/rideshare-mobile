# RideShare — Java 4 · Neon dhe PostgreSQL

Ruaje këtë skedar si java-04.md pranë README, jashtë aplikacioni/.
Plotëso të gjitha përgjigjet; hiqi shenjat [PLOTËSO].
Mos vendos DATABASE_URL, pamje të kredencialeve ose të dhëna reale.

## Çfarë ndërtova
Në këtë ushtrim lidha aplikacionin RideShare me databazën PostgreSQL në Neon duke përdorur me suksese paketën `@neondatabase/serverless` dhe `server-only`. Lista kryesore e udhëtimeve, faqja e detajeve (`/udhetimi/[id]`) dhe faqja e simulimit të kërkesës (`/udhetimi/[id]/kerkesa`) tani i lexojnë të dhënat drejtpërdrejt nga tabela `udhetimet` në Neon në mënyrë dinamike (`export const dynamic = "force-dynamic"`).

## Provat që bëra
### Prova 1: Ndryshimi në databazë shfaqet në aplikacion
Pas ekzekutimit të pyetjes SQL `UPDATE udhetimet SET ora = '08:25' WHERE id = '2';` në Neon SQL Editor, rifreskova faqen kryesore dhe detajet e ID 2. Të dyja faqet pas rifreskimit treguan orën e re 08:25 pa pasur nevojë të ndryshohej kodi i aplikacionit. Pas kësaj, ktheva orën në 08:15 me SQL dhe të dyja faqet reflektuan sërish orën origjinale 08:15.

### Prova 2: Lista bosh dhe rikthimi
Shtova përkohësisht kushtin `WHERE false` te pyetja SQL në funksionin `lexoUdhetimet()`. Pas ruajtjes dhe rifreskimit, aplikacioni shfaqi mesazhin "Nuk ka udhëtime për momentin." Pas heqjes së `WHERE false`, u kthyen përsëri të tri kartat e udhëtimeve.

### Prova 3: Lidhja mungon, rikthimi dhe siguria
Riemërtova përkohësisht variablën `DATABASE_URL` në `.env.local` si `DATABASE_URL_PA_TEST` dhe rinisa serverin dev. Gjatë rifreskimit, aplikacioni kapi gabimin e lidhjes dhe shfaqi mesazhin paralajmërues "Nuk u lidhëm me databazën. Provo përsëri.". Pasi riktheva emrin e saktë `DATABASE_URL` dhe rinisa serverin, aplikacioni punoi sërish me sukses. Skedari `.env.local` është i përfshirë në `.gitignore` dhe nuk shfaqet në GitHub Desktop.

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
