const express = require('express');
const router  = express.Router();
const svc     = require('../services/furnitureService');

// GET /api/furnitures/categories
router.get('/categories', async (req, res, next) => {
  try {
    const data = await svc.getCategories();
    res.json(data);
  } catch (err) { next(err); }
});

// GET /api/furnitures?categoryId=1&search=침대
router.get('/', async (req, res, next) => {
  try {
    const { categoryId, search } = req.query;
    const data = await svc.getFurnitures({ categoryId, search });
    res.json(data);
  } catch (err) { next(err); }
});

// GET /api/furnitures/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await svc.getFurnitureById(req.params.id);
    if (!data) return res.status(404).json({ message: '가구를 찾을 수 없습니다.' });
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;