require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const SQL = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(255) NOT NULL UNIQUE,
  nickname   VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL DEFAULT '내 방',
  width_cm   NUMERIC(7,2) NOT NULL,
  height_cm  NUMERIC(7,2) NOT NULL,
  photo_url  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS furniture_categories (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS furnitures (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   INT NOT NULL REFERENCES furniture_categories(id),
  name          VARCHAR(100) NOT NULL,
  width_cm      NUMERIC(7,2) NOT NULL,
  depth_cm      NUMERIC(7,2) NOT NULL,
  height_cm     NUMERIC(7,2) NOT NULL,
  thumbnail_url TEXT,
  is_default    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS room_layouts (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id  UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  title    VARCHAR(100) NOT NULL DEFAULT '기본 배치',
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS layout_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layout_id    UUID NOT NULL REFERENCES room_layouts(id) ON DELETE CASCADE,
  furniture_id UUID NOT NULL REFERENCES furnitures(id),
  pos_x        NUMERIC(8,4) NOT NULL,
  pos_y        NUMERIC(8,4) NOT NULL,
  scale        NUMERIC(5,4) NOT NULL DEFAULT 1.0,
  rotation_deg NUMERIC(6,2) NOT NULL DEFAULT 0
);

INSERT INTO furniture_categories (name, icon) VALUES
  ('침대',   'bed'),
  ('책상',   'desk'),
  ('소파',   'sofa'),
  ('옷장',   'wardrobe'),
  ('수납장', 'shelf')
ON CONFLICT DO NOTHING;

INSERT INTO furnitures (category_id, name, width_cm, depth_cm, height_cm)
SELECT c.id, v.name, v.w, v.d, v.h
FROM (VALUES
  ('침대', '싱글 침대',  100, 200, 50),
  ('침대', '더블 침대',  140, 200, 50),
  ('침대', '퀸 침대',    160, 200, 50),
  ('책상', '1인 책상',   120,  60, 75),
  ('책상', 'L자 책상',   160, 140, 75),
  ('소파', '2인 소파',   150,  85, 85),
  ('옷장', '2도어 옷장', 100,  60, 200),
  ('수납장', '3단 수납장', 80,  40, 120)
) AS v(cat, name, w, d, h)
JOIN furniture_categories c ON c.name = v.cat
WHERE NOT EXISTS (
  SELECT 1 FROM furnitures f WHERE f.name = v.name
);
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('마이그레이션 시작...');
    await client.query(SQL);
    console.log('✅ 완료! 테이블 및 시드 데이터 생성됨');
  } catch (err) {
    console.error('❌ 실패:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();