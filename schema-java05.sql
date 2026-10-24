-- schema-java05.sql
-- Java 5 · Hyrja dhe Lejet
-- Ekzekuto në Neon SQL Editor pasi ke ekzekutuar schema.sql (Java 4)

-- Shtoj kolonën pronari nëse nuk ekziston
ALTER TABLE udhetimet ADD COLUMN IF NOT EXISTS pronari TEXT;

-- Cakto pronarin e secilit udhëtim
-- ID 2: shofer aktiv (GitHub login i studentit)
UPDATE udhetimet SET pronari = 'Mendritbajrami-cmd' WHERE id = '2';

-- ID 1 dhe ID 3: pronar tjetër fiktiv (për testimin e refuzimit)
UPDATE udhetimet SET pronari = 'shofer-tjeter' WHERE id IN ('1', '3');

-- Verifiko
SELECT id, nisja, ora, pronari FROM udhetimet ORDER BY id;
