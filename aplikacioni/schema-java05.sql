-- schema-java05.sql
-- Java 5 · Hyrja dhe Lejet
-- Ekzekuto në Neon SQL Editor pasi ke ekzekutuar schema.sql (Java 4)

CREATE TABLE IF NOT EXISTS profilet (
  github_login TEXT PRIMARY KEY,
  roli TEXT NOT NULL CHECK (roli IN ('udhetar', 'shofer'))
);

ALTER TABLE udhetimet ADD COLUMN IF NOT EXISTS pronari TEXT;
ALTER TABLE udhetimet ADD COLUMN IF NOT EXISTS shofer_id TEXT;

-- ID 2: shofer aktiv (GitHub login i studentit)
UPDATE udhetimet
SET pronari = 'Mendritbajrami-cmd', shofer_id = 'Mendritbajrami-cmd'
WHERE id = '2';

-- ID 1 dhe ID 3: pronar tjetër (për testimin e refuzimit)
UPDATE udhetimet
SET pronari = 'DEMO-SHOFER-2', shofer_id = 'DEMO-SHOFER-2'
WHERE id IN ('1', '3');

INSERT INTO profilet (github_login, roli)
VALUES ('Mendritbajrami-cmd', 'shofer')
ON CONFLICT (github_login) DO UPDATE SET roli = EXCLUDED.roli;

SELECT id, nisja, ora, shofer_id, pronari FROM udhetimet ORDER BY id;
SELECT github_login, roli FROM profilet;
