-- schema-kerkesa.sql
-- Shto tabelën e kërkesave për vend

CREATE TABLE IF NOT EXISTS kerkesa (
  id SERIAL PRIMARY KEY,
  udhetimi_id TEXT NOT NULL REFERENCES udhetimet(id) ON DELETE CASCADE,
  udhetari_login TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ne_pritje' CHECK (status IN ('ne_pritje', 'pranuar', 'refuzuar')),
  krijuar_ne TIMESTAMP DEFAULT NOW(),
  perditesuar_ne TIMESTAMP DEFAULT NOW(),
  UNIQUE(udhetimi_id, udhetari_login)
);

CREATE INDEX IF NOT EXISTS idx_kerkesa_udhetimi ON kerkesa(udhetimi_id);
CREATE INDEX IF NOT EXISTS idx_kerkesa_udhetari ON kerkesa(udhetari_login);
CREATE INDEX IF NOT EXISTS idx_kerkesa_status ON kerkesa(status);
