const dotenv = require('dotenv')
dotenv.config()
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  // ✅ 한 줄로 교체
  ssl: { rejectUnauthorized: false },           // ✅ Supabase SSL 추가
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('DB 연결 실패:', err.message);
    return;
  }
  console.log('PostgreSQL 연결 성공');
  release();
});

const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };