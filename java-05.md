# RideShare — Java 5 · Hyrja dhe Lejet

Ruaje këtë skedar si `java-05.md` pranë README, jashtë `aplikacioni/`.
Plotëso të gjitha përgjigjet.
Mos vendos kredenciale reale.

## Çfarë ndërtova

Në këtë ushtrim shtova autentikimin dhe autorizimin në aplikacionin RideShare duke përdorur **NextAuth.js** (GitHub Provider) dhe kontrolle të rolit/pronësisë në anën e serverit.

**Ndryshimet kryesore:**
- Instalova `next-auth@beta` dhe konfigurova GitHub OAuth App (`AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_SECRET` në `.env.local`).
- Krijova `src/auth.ts` me GitHub Provider dhe callback `jwt/session` që ruan `login`-in e GitHub-it në sesion.
- Shtova kolonën `pronari TEXT` në tabelën `udhetimet` (Neon) nëpërmjet `schema-java05.sql`. ID `2` ka `pronari = 'Mendritbajrami-cmd'`; ID `1` dhe `3` kanë `pronari = 'shofer-tjeter'`.
- Shtova funksionin `ndryshoOren(id, oraRe, githubLogin)` në `src/lib/udhetimet.ts` që lexon `pronari` nga databaza dhe hedh gabim `"jo_pronar"` nëse logjiku i sesionit nuk përputhet me pronarin.
- Krijova `POST /api/ora` (route handler) që kthen `401` nëse nuk ka sesion aktiv dhe `403` nëse pronësia nuk përputhet.
- Shtova `SessionProvider` në `layout.tsx` dhe komponentin `ButoiHyrjes.tsx` (login/logout në header).
- Krijova faqen `/udhetimi/[id]/ndrysho` me formular për ndryshim ore.

## Provat që bëra

### Prova 1: Hyrja me GitHub + ndryshimi i orës së ID 2 (sukses)
- **Hapat:** Klikova "Hyr me GitHub" → autorizova aplikacionin tek GitHub → u ktheva te aplikacioni i kyçur si `Mendritbajrami-cmd` → hapa udhëtimin ID 2 → klikova "🕐 Ndrysho orën" → futa orën `09:45` → klikova "Ruaj orën".
- **Rezultati real:** Serveri mori kërkesën, verifikoi sesionin (`login = Mendritbajrami-cmd`), kontrolloi `pronari` të ID 2 (`'Mendritbajrami-cmd'`) — u përputh — dhe ekzekutoi `UPDATE udhetimet SET ora = '09:45' WHERE id = '2'`. Faqja shfaqi `✅ Ora u ndryshua me sukses!` dhe u ridrejtua te `/udhetimi/2`. Ora e re u shfaq direkt nga Neon.

### Prova 2: Refuzim kur provo ndryshimin e ID 1 (403 – jo pronar)
- **Hapat:** I kyçur ende si `Mendritbajrami-cmd`, hapa udhëtimin ID 1 → klikova "🕐 Ndrysho orën" → futa orën `10:00` → klikova "Ruaj orën".
- **Rezultati real:** Serveri verifikoi sesionin (valid) → lexoi `pronari` të ID 1 (`'shofer-tjeter'`) → nuk u përputh me `Mendritbajrami-cmd` → hodhi `jo_pronar` → API ktheu `HTTP 403` me mesazhin `"Nuk ke leje. Ky udhëtim nuk i përket llogarisë sate."`. Faqja shfaqi `❌ Nuk ke leje. Ky udhëtim nuk i përket llogarisë sate.` pa bërë asnjë ndryshim në databazë.

### Prova 3: Refuzim pa hyrë fare (401 – i pa-autentikuar)
- **Hapat:** Klikova "Dil" (logout) → u largova nga sesioni → hapa direkt URL-në `/udhetimi/2/ndrysho`.
- **Rezultati real:** Faqja `ndrysho` (client component) zbuloi `status = "unauthenticated"` dhe shfaqi menjëherë mesazhin `❌ Nuk je i autentikuar. Hyr me GitHub që të ndryshosh orën.` pa shfaqur formularin. Nëse dikush do të dërgonte manualisht `POST /api/ora` pa sesion, serveri do të kthente `HTTP 401`.

## Ku gjendet puna

- Schema SQL e Java 5: `schema-java05.sql` (root i repo-s)
- Konfigurimi i NextAuth: `aplikacioni/src/auth.ts`
- Route handler NextAuth: `aplikacioni/src/app/api/auth/[...nextauth]/route.ts`
- API e ndryshimit të orës: `aplikacioni/src/app/api/ora/route.ts`
- Funksioni i pronësisë: `aplikacioni/src/lib/udhetimet.ts` (`ndryshoOren`)
- Komponenti i hyrjes: `aplikacioni/src/components/ButoiHyrjes.tsx`
- Faqja e ndryshimit: `aplikacioni/src/app/udhetimi/[id]/ndrysho/page.tsx`
- Linku i repository-t: https://github.com/Mendritbajrami-cmd/rideshare-mobile

## Çfarë mbetet për përmirësim

Kërkesa për vend mbetet simulim frontend. Roli i shoferit dhe pasagjerit nuk është i ndarë ende si role të ndryshme në databazë — pronësia kontrollohet vetëm me `pronari = githubLogin`. Rezervimet reale dhe role-t do të shtohen në javët e ardhshme.

## Ndihma nga AI (Artificial Intelligence – inteligjencë artificiale)

Përdora AI për konfigurimin e NextAuth.js v5 beta (GitHub provider, callback jwt/session, route handler), krijimin e funksionit `ndryshoOren` me kontroll pronësie, strukturimin e API route me kodet `401/403`, dhe shkrimin e raportit. Të gjitha ndryshimet i verifikova vetë duke ekzekutuar `npm run build` dhe duke testuar tre skenarët në browser.
