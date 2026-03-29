const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/auth');
const svc     = require('../services/layoutService');

router.use(auth);

// GET /api/layouts?roomId=xxx
router.get('/', async (req, res, next) => {
  try {
    const data = await svc.getLayoutsByRoom(req.query.roomId, req.user.id);
    if (!data) return res.status(404).json({ message: '방을 찾을 수 없습니다.' });
    res.json(data);
  } catch (err) { next(err); }
});

// GET /api/layouts/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await svc.getLayoutWithItems(req.params.id, req.user.id);
    if (!data) return res.status(404).json({ message: '배치를 찾을 수 없습니다.' });
    res.json(data);
  } catch (err) { next(err); }
});

// POST /api/layouts
router.post('/', async (req, res, next) => {
  try {
    const { roomId, title, items } = req.body;
    if (!roomId || !Array.isArray(items)) {
      return res.status(400).json({ message: 'roomId와 items는 필수입니다.' });
    }
    const data = await svc.saveLayout({
      roomId, userId: req.user.id, title, items
    });
    if (!data) return res.status(403).json({ message: '권한이 없습니다.' });
    res.status(201).json(data);
  } catch (err) { next(err); }
});

// DELETE /api/layouts/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const data = await svc.deleteLayout(req.params.id, req.user.id);
    if (!data) return res.status(404).json({ message: '배치를 찾을 수 없습니다.' });
    res.json({ message: '삭제되었습니다.' });
  } catch (err) { next(err); }
});

module.exports = router;