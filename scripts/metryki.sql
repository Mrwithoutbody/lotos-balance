-- scripts/metryki.sql
-- Wynik pilotu prosto z D1. Bez narzedzi analitycznych: rejestracje sa w tabeli
-- better-auth, powroty licza sie z dat w progress.
-- Uruchomienie:
--   CLOUDFLARE_ACCOUNT_ID=5ac2ce215d670d3c2f2cd33317caaaba \
--   npx wrangler d1 execute lotos-db --remote --file scripts/metryki.sql

-- 1. Ile kont, ile z nich zrobilo cokolwiek.
SELECT
  (SELECT count(*) FROM user) AS konta,
  (SELECT count(DISTINCT user_id) FROM progress) AS zrobili_cwiczenie,
  (SELECT count(*) FROM progress) AS cwiczen_lacznie;

-- 2. Rejestracje dzien po dniu — widac skok po story Anny.
SELECT date(created_at, 'unixepoch') AS dzien, count(*) AS rejestracji
FROM user
GROUP BY dzien
ORDER BY dzien;

-- 3. Retencja: ile osob wrocilo w kolejnych oknach od pierwszego cwiczenia.
--    Powrot = cwiczenie w innym dniu niz pierwszy, w danym oknie.
WITH pierwszy AS (
  SELECT user_id, min(date) AS d0 FROM progress GROUP BY user_id
)
SELECT
  count(*) AS z_pierwszym_cwiczeniem,
  sum(EXISTS (
    SELECT 1 FROM progress p WHERE p.user_id = pierwszy.user_id
      AND p.date > d0 AND julianday(p.date) - julianday(d0) <= 1
  )) AS wrocilo_d1,
  sum(EXISTS (
    SELECT 1 FROM progress p WHERE p.user_id = pierwszy.user_id
      AND p.date > d0 AND julianday(p.date) - julianday(d0) <= 7
  )) AS wrocilo_d7,
  sum(EXISTS (
    SELECT 1 FROM progress p WHERE p.user_id = pierwszy.user_id
      AND p.date > d0 AND julianday(p.date) - julianday(d0) <= 30
  )) AS wrocilo_d30
FROM pierwszy;

-- 4. Ile dni z cwiczeniem na osobe — rozklad zaangazowania.
SELECT dni, count(*) AS osob FROM (
  SELECT user_id, count(DISTINCT date) AS dni FROM progress GROUP BY user_id
) GROUP BY dni ORDER BY dni;

-- 5. Czy cwiczenia pomagaja: srednia zmiana samopoczucia per obszar programu.
SELECT card_id, count(*) AS wykonan, round(avg(after - before), 2) AS srednia_zmiana
FROM progress
WHERE before IS NOT NULL AND after IS NOT NULL
GROUP BY card_id
ORDER BY srednia_zmiana DESC;
