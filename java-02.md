# RideShare — Java 2

**Shkurtesat:** MVP (Minimum Viable Product – produkti minimal i përdorshëm); AI (Artificial Intelligence – inteligjencë artificiale).

## 1. Problemi
Studentët që udhëtojnë për në AAB nuk e dinë lehtë kush niset në orën që u duhet. Informacioni për udhëtimet shpërndahet në shumë biseda dhe grupe, kështu që duhet të pyesin e të presin përgjigje. Nga ana tjetër, shoferi që ka vende të lira nuk e di kush ka nevojë për to.

## 2. Përdoruesit
- **Shoferi (Dreni):** dëshiron të publikojë nisjen, orën dhe sa vende të lira ka, pastaj të shqyrtojë kërkesat dhe t'i pranojë ose t'i refuzojë.
- **Udhëtari (Arta):** dëshiron të gjejë shpejt një udhëtim që i përshtatet, ta kuptojë mirë para se të kërkojë vend (ora, vendtakimi) dhe të marrë një përgjigje të qartë nga shoferi.

## 3. Tri ekranet
1. Lista e udhëtimeve: çdo udhëtim shfaq nisjen, destinacionin, orën dhe vendet e lira. Udhëtari shtyp “Shiko” për të hapur një udhëtim.
2. Detajet e udhëtimit: shfaq edhe vendtakimin dhe shoferin. Këtu ndodhet butoni “Kërko një vend”. E vendosa butonin pas detajeve që udhëtari të mos bëjë kërkesë të nxituar; kostoja është një hap shtesë.
3. Kërkesa në pritje: shfaq statusin “Në pritje të shoferit”. Kur shoferi përgjigjet, statusi bëhet “E konfirmuar” ose “E refuzuar”.

## 4. MVP — vetëm tri veçori
1. Shoferi publikon një udhëtim me orën, vendtakimin dhe vendet e lira.
2. Udhëtari sheh listën dhe detajet dhe dërgon një kërkesë për vend.
3. Shoferi e pranon ose e refuzon kërkesën; statusi ruhet dhe e shohin të dy.

## 5. Çfarë e lëmë për më vonë?
- Harta me lëvizjen live të makinës.
- Pagesat në aplikacion (edhe chat-i dhe vlerësimet mund të presin).

## 6. Si e provoj?
- Kur kërkoj një vend, shfaqet statusi “Në pritje të shoferit”. Një klikim i dytë nuk krijon kërkesë të dytë. Numri i vendeve ulet me një vetëm pasi shoferi e pranon kërkesën.
- Nëse nuk ka vende të lira, butoni “Kërko një vend” nuk lejon kërkesë dhe shfaqet arsyeja “Nuk ka vende të lira”. Numri i vendeve nuk bëhet kurrë negativ dhe udhëtari mund të zgjedhë një udhëtim tjetër.

## 7. Prova me kolegun
Kolegu e lexoi butonin “Rezervo” sikur vendi konfirmohet menjëherë dhe nuk e kuptoi që duhet të presë shoferin. E ndryshova butonin në “Kërko një vend” dhe në ekranin e tretë shtova qartë statusin “Në pritje të shoferit”.

## 8. Ndihma nga AI
Përdora AI (Claude) për të më ndihmuar të formuloj përgjigjet në bazë të ligjëratës dhe ushtrimeve të Javës 2. Vetë kontrollova që përgjigjet përputhen me skicën time, me rrjedhën lista → detajet → kërkesa në pritje dhe me rastin kur nuk ka vende të lira.
