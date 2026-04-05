// src/utils/tokenUtil.js
const jwt = require('jsonwebtoken')
const crypto = require('crypto') // ✅ 이게 있어야 generateRandomToken 작동

function generateJwtToken(userId) {
  return jwt.sign(
    { userId, purpose: 'email-verification' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  )
}

function generateRandomToken() { // ✅ 이 함수가 빠져 있었던 것
  return crypto.randomBytes(32).toString('hex')
}

function verifyJwtToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}

module.exports = { generateJwtToken, generateRandomToken, verifyJwtToken }