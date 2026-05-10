// src/routes/admin.js
const express = require('express')
const router = express.Router()
const axios = require('axios')
const { query } = require('../config/db')

const SKETCHFAB_API = 'https://api.sketchfab.com/v3'
const headers = { Authorization: `Token ${process.env.SKETCHFAB_API_KEY}` }

// Sketchfab 모델 검색
router.get('/sketchfab/search', async (req, res) => {
  try {
    const { keyword } = req.query

    const response = await axios.get(`${SKETCHFAB_API}/models`, {
      headers,
      params: {
        q: keyword,
        count: 10,
        sort_by: '-relevance',
      }
    })

    const models = response.data.results.map(model => ({
      uid: model.uid,
      name: model.name,
      model_url: `https://sketchfab.com/models/${model.uid}`,
      thumbnail_url: model.thumbnails?.images?.[0]?.url || null,
      author: model.user?.username
    }))

    res.json({ success: true, data: models })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 선택한 모델 DB에 저장
router.post('/furniture/:furniture_id/model', async (req, res) => {
  try {
    const { furniture_id } = req.params
    const { model_url, thumbnail_url, is_default } = req.body

    // 기본 모델로 설정 시 기존 기본 모델 해제
    if (is_default) {
      await query(
        'UPDATE furniture_models SET is_default = FALSE WHERE furniture_id = $1',
        [furniture_id]
      )
    }

    const result = await query(
      `INSERT INTO furniture_models (furniture_id, model_url, thumbnail_url, is_default)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [furniture_id, model_url, thumbnail_url, is_default || false]
    )

    // furnitures 테이블 thumbnail_url도 업데이트
    if (is_default) {
      await query(
        'UPDATE furnitures SET thumbnail_url = $1, model_url = $2 WHERE id = $3',
        [thumbnail_url, model_url, furniture_id]
      )
    }

    res.json({ success: true, data: result.rows[0] })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 가구별 모델 목록 조회
router.get('/furniture/:furniture_id/models', async (req, res) => {
  try {
    const { furniture_id } = req.params
    const result = await query(
      `SELECT * FROM furniture_models 
       WHERE furniture_id = $1 
       ORDER BY is_default DESC, created_at ASC`,
      [furniture_id]
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 모델 삭제
router.delete('/furniture/model/:model_id', async (req, res) => {
  try {
    const { model_id } = req.params
    await query('DELETE FROM furniture_models WHERE id = $1', [model_id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router