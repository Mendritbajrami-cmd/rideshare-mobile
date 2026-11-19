-- schema-java10.sql
-- Java 10 · Dy ekrane, një gjendje
-- Nuk krijohet tabelë e re: kërkesa ruhet në `kerkesa` (schema-kerkesa.sql)
-- dhe vendet në `udhetimet` (schema.sql). Ky skedar shton vetëm udhëtimin
-- e provës me 2 vende dhe pronarin-shofer të testit.

INSERT INTO udhetimet (id, nisja, destinacioni, ora, vendtakimi, vende, pronari, shofer_id)
VALUES ('10', 'Ferizaj', 'AAB', '08:15', 'Biblioteka', 2, 'Mendritbajrami-cmd', 'Mendritbajrami-cmd')
ON CONFLICT (id) DO NOTHING;

-- Rregulli "vendet nuk bëhen negative" mbahet nga kufizimi ekzistues
-- i tabelës: udhetimet_vende_check CHECK (vende >= 0).
-- Pranimi dhe zbritja e një vendi bëhen në të njëjtën deklaratë SQL.

SELECT id, nisja, destinacioni, ora, vende, pronari FROM udhetimet WHERE id = '10';
