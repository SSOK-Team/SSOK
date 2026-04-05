// src/jobs/cleanupTokens.js
const pool = require('../config/db');   // config에서

async function cleanupExpiredTokens() {
  const result = await pool.query(
    `DELETE FROM email_verification_tokens
     WHERE expires_at < NOW() AND used_at IS NULL`
  );
  console.log(`[Cleanup] 만료 토큰 ${result.rowCount}개 삭제`);
}

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
setInterval(cleanupExpiredTokens, TWENTY_FOUR_HOURS);
cleanupExpiredTokens();

module.exports = { cleanupExpiredTokens };