const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { query } = require('../config/db')

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname } = req.body

    if (!email || !password || !nickname) {
      return res.status(400).json({ error: '이메일, 비밀번호, 닉네임을 입력해주세요' })
    }

    // 이메일 중복 확인
    const existing = await query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: '이미 사용 중인 이메일입니다' })
    }

    // 비밀번호 암호화
    const password_hash = await bcrypt.hash(password, 10)

    // 유저 생성
    const result = await query(
      'INSERT INTO users (email, password_hash, nickname) VALUES ($1, $2, $3) RETURNING id, email, nickname',
      [email, password_hash, nickname]
    )

    res.status(201).json({ message: '회원가입 성공', user: result.rows[0] })

  } catch (error) {
    console.error('회원가입 오류:', error)
    res.status(500).json({ error: '회원가입 중 오류가 발생했습니다' })
  }
})

// 로그인
router.post('/login', async (req, res) => {
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

module.exports = router