# RideShare — Java 3

## Çfarë ndërtova
Tri ekranet e RideShare me të dhëna fiktive: listën me tri karta udhëtimesh, detajet e udhëtimit te adresa /udhetimi/[id] dhe kërkesën e simuluar te /udhetimi/[id]/kerkesa. Shtova edhe faqen “Udhëtimi nuk u gjet” dhe komponentin KartaUdhetimi.

## Provat që bëra
### Prova 1: Lista në telefon
Hapa faqen kryesore në pamjen e telefonit (375 px); prisja tri karta pa lëvizje anash; pashë tri karta (Prishtinë 07:30, Fushë Kosovë 08:00, Lipjan 08:15) dhe faqja nuk lëviz anash. Karta e Lipjanit shkruan “Plot”.

### Prova 2: Detajet e udhëtimit të dytë
Klikova “Shiko” te karta 2; prisja adresën /udhetimi/2 dhe vendtakimin e saj; pashë /udhetimi/2 me orën 08:00, vendtakimin “Te stacioni i trenit”, shoferen Blerta dhe 1 vend të lirë.
Te karta 3 (zero vende) butoni “Nuk ka vende të lira” është i çaktivizuar dhe nuk ka lidhje për kërkesë. Adresa /udhetimi/99 shfaq “Udhëtimi nuk u gjet”; “Kthehu te lista” më ktheu te tri kartat.

### Prova 3: Kërkesa në pritje
Te udhëtimi 2 klikova “Kërko një vend”; prisja “Simulim: Në pritje”, pa rezervim real; pashë “Simulim: Në pritje” dhe shënimin se kërkesa nuk është dërguar te shoferja. Pastaj u ktheva te detajet dhe lista: udhëtimi 2 ka ende 1 vend të lirë, pra asgjë nuk u rezervua.

## Çfarë do të përmirësoj
Kërkesa është vetëm simulim: nuk ruhet dhe shoferi nuk e sheh. Javën tjetër dua t'i ruaj udhëtimet dhe kërkesat në databazë, që numri i vendeve të ulet pas pranimit.

## Ndihma nga AI (Artificial Intelligence – inteligjencë artificiale)
AI (Claude) më ndihmoi t'i kryej tri provat në një shfletues.
