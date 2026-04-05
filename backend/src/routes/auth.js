// src/routes/auth.js
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { query } = require('../config/db')
const { sendVerificationEmail } = require('../services/emailService')      // ✅ 추가
const { generateJwtToken, verifyJwtToken } = require('../utils/tokenUtil') // ✅ 추가
const { registerLimiter, loginLimiter, resendLimiter } = require('../middlewares/rateLimiter') // ✅ 추가

// ─────────────────────────────────────────────
// 회원가입
// ─────────────────────────────────────────────
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { email, password, nickname } = req.body

    if (!email || !password || !nickname) {
      return res.status(400).json({ error: '이메일, 비밀번호, 닉네임을 입력해주세요' })
    }

    // 이메일 중복 확인
    const existing = await query('SELECT id, is_verified FROM users WHERE email = $1', [email])

    if (existing.rows.length > 0) {
      const user = existing.rows[0]

      // 미인증 계정이면 인증 메일 재발송
      if (!user.is_verified) {
        await createAndSendToken(user.id, email)
        return res.json({ message: '인증 이메일을 재발송했습니다. 메일함을 확인해주세요.' })
      }

      return res.status(400).json({ error: '이미 사용 중인 이메일입니다' })
    }

    // 비밀번호 암호화
    const password_hash = await bcrypt.hash(password, 10)

    // 유저 생성 (is_verified 기본값 FALSE)
    const result = await query(
      `INSERT INTO users (email, password_hash, nickname, is_verified)
       VALUES ($1, $2, $3, FALSE) RETURNING id, email, nickname`,
      [email, password_hash, nickname]
    )

    const userId = result.rows[0].id

    // ✅ 인증 토큰 생성 & 이메일 발송
    await createAndSendToken(userId, email)

    res.status(201).json({
      message: '회원가입 성공! 이메일을 확인하여 인증을 완료해주세요.',
      user: result.rows[0]
    })

  } catch (error) {
    console.error('회원가입 오류:', error)
    res.status(500).json({ error: '회원가입 중 오류가 발생했습니다' })
  }
})

// ─────────────────────────────────────────────
// 로그인
// ─────────────────────────────────────────────
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요' })
    }

    // 유저 확인
    const result = await query('SELECT * FROM users WHERE email = $1', [email])
    if (result.rows.length === 0) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 틀렸습니다' })
    }

    const user = result.rows[0]

    // ✅ 이메일 인증 여부 확인
    if (!user.is_verified) {
      return res.status(403).json({
        error: '이메일 인증이 필요합니다.',
        needsVerification: true,  // 프론트에서 재발송 버튼 표시용
        email: user.email
      })
    }

    // 비밀번호 확인
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 틀렸습니다' })
    }

    // JWT 토큰 발급
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: '로그인 성공',
      token,
      user: { id: user.id, email: user.email, nickname: user.nickname }
    })

  } catch (error) {
    console.error('로그인 오류:', error)
    res.status(500).json({ error: '로그인 중 오류가 발생했습니다' })
  }
})

// ─────────────────────────────────────────────
// ✅ 이메일 인증 처리 (링크 클릭 시)
// ─────────────────────────────────────────────
router.get('/verify-email', async (req, res) => {
  const { token } = req.query

  if (!token) {
    return res.status(400).json({ error: '토큰이 없습니다.' })
  }

  try {
    // JWT 검증 (만료 여부 포함)
    let decoded
    try {
      decoded = verifyJwtToken(token)
    } catch (err) {
      return res.status(400).send(renderPage('fail', '인증 링크가 만료되었거나 유효하지 않습니다.'))
    }

    if (decoded.purpose !== 'email-verification') {
      return res.status(400).send(renderPage('fail', '올바르지 않은 인증 토큰입니다.'))
    }

    // DB에서 토큰 조회 (사용 여부 + 만료 확인)
    const tokenResult = await query(
      `SELECT * FROM email_verification_tokens
       WHERE token = $1 AND used_at IS NULL AND expires_at > NOW()`,
      [token]
    )

    if (tokenResult.rows.length === 0) {
      return res.status(400).send(renderPage('fail', '이미 사용된 링크이거나 만료된 링크입니다.'))
    }

    const tokenRow = tokenResult.rows[0]

    // 인증 완료 처리
    await query('UPDATE users SET is_verified = TRUE WHERE id = $1', [tokenRow.user_id])

    // 토큰 사용 처리 (재사용 방지)
    await query(
      'UPDATE email_verification_tokens SET used_at = NOW() WHERE id = $1',
      [tokenRow.id]
    )

    // 프론트엔드로 리다이렉트
    res.redirect(`${process.env.FRONTEND_URL}/verified?success=true`)

  } catch (error) {
    console.error('이메일 인증 오류:', error)
    res.status(500).send(renderPage('fail', '서버 오류가 발생했습니다.'))
  }
})

// ─────────────────────────────────────────────
// ✅ 인증 메일 재발송
// ─────────────────────────────────────────────
router.post('/resend-verification', resendLimiter, async (req, res) => {
  try {
    const { email } = req.body

    const result = await query(
      'SELECT id, is_verified FROM users WHERE email = $1', [email]
    )

    // 보안상 계정 존재 여부 노출 안 함
    if (result.rows.length === 0) {
      return res.json({ message: '인증 이메일을 발송했습니다. 메일함을 확인해주세요.' })
    }

    const user = result.rows[0]

    if (user.is_verified) {
      return res.status(400).json({ error: '이미 인증된 계정입니다.' })
    }

    await createAndSendToken(user.id, email)

    res.json({ message: '인증 이메일을 재발송했습니다.' })

  } catch (error) {
    console.error('재발송 오류:', error)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
})

// ─────────────────────────────────────────────
// 내부 헬퍼 함수들
// ─────────────────────────────────────────────

// 토큰 생성 + DB 저장 + 메일 발송
async function createAndSendToken(userId, email) {
  // 기존 미사용 토큰 무효화
  await query(
    `UPDATE email_verification_tokens
     SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL`,
    [userId]
  )

  // 새 토큰 생성
  const token = generateJwtToken(userId)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24시간

  // DB 저장
  await query(
    `INSERT INTO email_verification_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  )

  // 이메일 발송
  const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`
  await sendVerificationEmail(email, verificationUrl)
}

// 인증 결과 HTML (리다이렉트 실패 시 폴백)
function renderPage(type, message) {
  const isSuccess = type === 'success'
  return `
    <html><body style="font-family:sans-serif;text-align:center;padding:60px;">
      <h2>${isSuccess ? '✅ 인증 완료!' : '❌ 인증 실패'}</h2>
      <p>${message}</p>
      <a href="${process.env.FRONTEND_URL}">홈으로 돌아가기</a>
    </body></html>
  `
}

module.exports = router