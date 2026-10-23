-- Khoảng "Số người cần" theo môn. Cầu lông, Pickleball nhận mặc định 2–20 (4),
-- đúng như thanh trượt trước đây.
ALTER TABLE "Sport" ADD COLUMN "minPlayers" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN "maxPlayers" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN "defaultPlayers" INTEGER NOT NULL DEFAULT 4;

ALTER TABLE "Sport" ADD CONSTRAINT "Sport_players_range_check"
  CHECK ("minPlayers" >= 2 AND "minPlayers" <= "defaultPlayers" AND "defaultPlayers" <= "maxPlayers");

-- Thêm 12 môn. Môn đã có (trùng id) thì giữ nguyên.
INSERT INTO "Sport" ("id", "slug", "name", "icon", "sortOrder", "minPlayers", "maxPlayers", "defaultPlayers") VALUES
  ('football',     'bong-da',     'Bóng đá',     '⚽', 3,  10, 22, 14),
  ('futsal',       'futsal',      'Futsal',      '🥅', 4,  8,  14, 10),
  ('tennis',       'tennis',      'Tennis',      '🎾', 5,  2,  4,  4),
  ('table_tennis', 'bong-ban',    'Bóng bàn',    '⚪', 6,  2,  4,  2),
  ('volleyball',   'bong-chuyen', 'Bóng chuyền', '🏐', 7,  8,  14, 12),
  ('basketball',   'bong-ro',     'Bóng rổ',     '🏀', 8,  4,  12, 10),
  ('handball',     'bong-nem',    'Bóng ném',    '🤾', 9,  10, 16, 14),
  ('golf',         'golf',        'Golf',        '⛳', 10, 2,  4,  4),
  ('billiards',    'bi-a',        'Bi-a',        '🎱', 11, 2,  4,  2),
  ('bowling',      'bowling',     'Bowling',     '🎳', 12, 2,  6,  4),
  ('swimming',     'boi-loi',     'Bơi lội',     '🏊', 13, 2,  10, 4),
  ('boxing',       'boxing',      'Boxing',      '🥊', 14, 2,  8,  2)
ON CONFLICT ("id") DO NOTHING;
