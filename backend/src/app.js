// src/app.js
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

const furnitureRoutes     = require('./routes/furnitures');
const roomRoutes          = require('./routes/rooms');
const layoutRoutes        = require('./routes/layouts');
const uploadRoutes        = require('./routes/upload');
const errorHandler        = require('./middlewares/errorHandler');
const removebgRoutes      = require('./routes/removebg');
const spaceAnalysisRoutes = require('./routes/spaceAnalysis');
const authRoutes          = require('./routes/auth');
const { apiLimiter }      = require('./middlewares/rateLimiter'); // ✅ 추가
require('./jobs/cleanupTokens');                                  // ✅ 추가

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use('/api', apiLimiter); // ✅ 추가 — 전체 API에 100회/15분 제한

app.use(cors());

app.use('/api/furnitures',     furnitureRoutes);
app.use('/api/rooms',          roomRoutes);
app.use('/api/layouts',        layoutRoutes);
app.use('/api/upload',         uploadRoutes);
app.use('/api/removebg',       removebgRoutes);
app.use('/api/space-analysis', spaceAnalysisRoutes);
app.use('/api/auth',           authRoutes);
app.use(express.json()); // body-parser 설정 (회원가입 시 필수)

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

// src/app.js 맨 아래 module.exports = app; 바로 위에 추가
const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`))

module.exports = app;