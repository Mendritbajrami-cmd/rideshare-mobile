-- schema-pronaret.sql
-- Cakto të gjitha udhëtimet ekzistuese te shoferi Mendritbajrami-cmd,
-- që kërkesat e udhëtarëve të shfaqen te llogaria e shoferit.

UPDATE udhetimet
SET pronari = 'Mendritbajrami-cmd',
    shofer_id = 'Mendritbajrami-cmd';

SELECT id, nisja, destinacioni, ora, vende, pronari FROM udhetimet ORDER BY id;
