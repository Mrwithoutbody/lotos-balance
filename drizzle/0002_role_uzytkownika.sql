-- Rola konta: zwykła użytkowniczka, twórczyni talii albo specjalistka.
-- Domyślnie 'user' — nikt nie dostaje uprawnień przez przypadek.
ALTER TABLE `user` ADD `role` text DEFAULT 'user' NOT NULL;

-- Konta powiązane z istniejącą talią stają się twórczyniami.
UPDATE `user` SET `role` = 'creator'
WHERE `id` IN (SELECT `user_id` FROM `creators` WHERE `user_id` IS NOT NULL);
