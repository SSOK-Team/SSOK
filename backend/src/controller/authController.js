// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { sendVerificationEmail } = require('../services/emailService');
const { generateJwtToken, verifyJwtToken } = require('../utils/tokenUtil');

// ─────────────────────────────────────────────
// 1. 회원가입
// ─────────────────────────────────────────────
exports.register = async (req, res) => {
  const { email, password, nickname } = req.body;

  // 입력값 검증
  if (!email || !password) {
    return res.status(400).json({ success: false, message: '이메일과 비밀번호는 필수입니다.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: '유효하지 않은 이메일 형식입니다.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ success: false, message: '비밀번호는 8자 이상이어야 합니다.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 이메일 중복 확인
    const existing = await client.query(
      'SELECT id, is_verified FROM users WHERE email = $1', [email]
    );

    if (existing.rows.length > 0) {
      const user = existing.rows[0];

      // 이미 인증된 계정
      if (user.is_verified) {
        return res.status(409).json({ success: false, message: '이미 사용 중인 이메일입니다.' });
      }

      // 미인증 계정 → 인증 메일 재발송
      await resendVerification(client, user.id, email);
      await client.query('COMMIT');
      return res.json({ success: true, message: '인증 이메일을 재발송했습니다. 메일함을 확인해주세요.' });
    }

    // 비밀번호 해싱
    const passwordHash = await bcrypt.hash(password, 12);

    // 사용자 저장 (미인증 상태)
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, nickname, is_verified)
       VALUES ($1, $2, $3, FALSE) RETURNING id`,
      [email, passwordHash, nickname || email.split('@')[0]]
    );
    const userId = userResult.rows[0].id;

    // 인증 토큰 생성 및 저장
    const token = generateJwtToken(userId);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간 후

    await client.query(
      `INSERT INTO email_verification_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, token, expiresAt]
    );

    // 인증 이메일 발송
    const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;
    await sendVerificationEmail(email, verificationUrl);

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: '회원가입 완료! 이메일을 확인하여 인증을 완료해주세요.',
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('회원가입 오류:', err);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  } finally {
    client.release();
  }
};

// ─────────────────────────────────────────────
// 2. 이메일 인증 처리 (링크 클릭 시)
// ─────────────────────────────────────────────
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send(renderResultPage('error', '유효하지 않은 요청입니다.'));
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // JWT 검증 (만료 여부 포함)
    let decoded;
    try {
      decoded = verifyJwtToken(token);
    } catch (err) {
      return res.status(400).send(renderResultPage('error', '인증 링크가 만료되었거나 유효하지 않습니다.'));
    }

    if (decoded.purpose !== 'email-verification') {
      return res.status(400).send(renderResultPage('error', '올바르지 않은 인증 토큰입니다.'));
    }

    // DB에서 토큰 조회
    const tokenResult = await client.query(
      `SELECT * FROM email_verification_tokens
       WHERE token = $1 AND used_at IS NULL AND expires_at > NOW()`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).send(renderResultPage('error', '이미 사용된 링크이거나 만료된 링크입니다.'));
    }

    const tokenRow = tokenResult.rows[0];

    // 사용자 인증 완료 처리
    await client.query(
      'UPDATE users SET is_verified = TRUE WHERE id = $1',
      [tokenRow.user_id]
    );

    // 토큰 사용 처리 (재사용 방지)
    await client.query(
      'UPDATE email_verification_tokens SET used_at = NOW() WHERE id = $1',
      [tokenRow.id]
    );

    await client.query('COMMIT');

    // 인증 완료 → 프론트엔드로 리다이렉트
    res.send(renderResultPage('success', '이메일 인증이 완료되었습니다! 이제 앱으로 돌아가 로그인해 주세요.'));

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('이메일 인증 오류:', err);
    res.status(500).send(renderResultPage('error', '서버 오류가 발생했습니다.'));
  } finally {
    client.release();
  }
};

// ─────────────────────────────────────────────
// 3. 인증 메일 재발송
// ─────────────────────────────────────────────
exports.resendVerification = async (req, res) => {
  const { email } = req.body;

  const userResult = await pool.query(
    'SELECT id, is_verified FROM users WHERE email = $1', [email]
  );

  if (userResult.rows.length === 0) {
    // 보안상 계정 존재 여부를 노출하지 않음
    return res.json({ success: true, message: '이메일을 발송했습니다. 메일함을 확인해주세요.' });
  }

  const user = userResult.rows[0];

  if (user.is_verified) {
    return res.status(400).json({ success: false, message: '이미 인증된 계정입니다.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await resendVerification(client, user.id, email);
    await client.query('COMMIT');
    res.json({ success: true, message: '인증 이메일을 재발송했습니다.' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  } finally {
    client.release();
  }
};

// ─────────────────────────────────────────────
// 내부 헬퍼: 토큰 재생성 & 메일 발송
// ─────────────────────────────────────────────
async function resendVerification(client, userId, email) {
  // 기존 미사용 토큰 무효화
  await client.query(
    `UPDATE email_verification_tokens
     SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL`,
    [userId]
  );

  const token = generateJwtToken(userId);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await client.query(
    `INSERT INTO email_verification_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );

  const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;
  await sendVerificationEmail(email, verificationUrl);
}

// 인증 결과 HTML 페이지 (리다이렉트 불가 시 폴백)
function renderResultPage(type, message) {
  const isSuccess = type === 'success';
  return `
    <html><body style="font-family:sans-serif;text-align:center;padding:60px;">
      <h2>${isSuccess ? '✅ 인증 완료!' : '❌ 인증 실패'}</h2>
      <p>${message}</p>
      <a href="${process.env.FRONTEND_URL}">홈으로 돌아가기</a>
    </body></html>
  `;
}
// authController.js에 추가
// 1. 파일 맨 위에 이게 꼭 있어야 합니다!
const jwt = require('jsonwebtoken'); 

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const user = result.rows[0];

    // ✅ 인증 체크 (이 부분이 통과되어야 밑으로 내려갑니다)
    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: '이메일 인증이 필요합니다.',
        needsVerification: true,
        email: user.email,
      });
    }

    // ✅ 여기서부터 보내주신 코드입니다!
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // JWT 발급 (로그인 유지)
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET, // .env에 JWT_SECRET이 있는지 꼭 확인!
      { expiresIn: '7d' }
    );

    res.json({ success: true, token: accessToken, nickname: user.nickname });

  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};