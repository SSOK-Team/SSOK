const rateLimit = require('express-rate-limit');

// 로그인 시도 제한 — 15분에 10번
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: '너무 많은 로그인 시도입니다. 15분 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 회원가입 제한 — 1시간에 5번
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: '너무 많은 회원가입 시도입니다. 1시간 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 일반 API 제한 — 15분에 100번
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 인증 메일 재발급 발송 제한 - 10분에 3번
const resendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: { message: '잠시 후 다시 시도해주세요. (10분 3회 제한)' },
  standardHeaders: true,
  legacyHeaders: false,
});


module.exports = { loginLimiter, registerLimiter, apiLimiter, resendLimiter };