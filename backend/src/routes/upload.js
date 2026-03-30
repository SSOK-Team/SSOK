const express  = require('express');
const multer   = require('multer');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const s3       = require('../config/s3');
const auth     = require('../middlewares/auth');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
    cb(null, true);
  },
});

// POST /api/upload/room-photo
router.post('/room-photo', auth, upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '파일이 없습니다.' });
    }

    const ext = req.file.originalname.split('.').pop();
    const key = `rooms/${req.user.id}/${uuidv4()}.${ext}`;

    await s3.send(new PutObjectCommand({
      Bucket:      process.env.S3_BUCKET_NAME,
      Key:         key,
      Body:        req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    res.json({ url });
  } catch (err) { next(err); }
});

module.exports = router;