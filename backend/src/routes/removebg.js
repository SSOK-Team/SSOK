const express = require('express')
const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const { imageUrl } = req.body

    if (!imageUrl) {
      return res.status(400).json({ error: '이미지 URL이 필요합니다' })
    }

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVEBG_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: imageUrl,
        size: 'auto'
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.errors?.[0]?.title || '배경 제거 실패')
    }

    const resultBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(resultBuffer).toString('base64')

    res.json({ result: `data:image/png;base64,${base64}` })

  } catch (error) {
    console.error('Remove.bg 오류:', error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router