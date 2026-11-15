-- schema-java09.sql
-- Shto tabelën e udhëtimeve të preferuara

CREATE TABLE IF NOT EXISTS preferimet (
  id SERIAL PRIMARY KEY,
  udhetimi_id TEXT NOT NULL REFERENCES udhetimet(id) ON DELETE CASCADE,
  udhetari_login TEXT NOT NULL,
  krijuar_ne TIMESTAMP DEFAULT NOW(),
  UNIQUE(udhetimi_id, udhetari_login)
);

CREATE INDEX IF NOT EXISTS idx_preferimet_udhetari ON preferimet(udhetari_login);
