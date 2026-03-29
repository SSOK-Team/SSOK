const express = require('express')
const router = express.Router()
const Replicate = require('replicate')

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
})

router.post('/', async (req, res) => {
  try {
    const { imageUrl } = req.body

    if (!imageUrl) {
      return res.status(400).json({ error: '이미지 URL이 필요합니다' })
    }

    const output = await replicate.run(
      "schananas/grounded_sam:ee871c19efb1941f55f66a3d7d960428c8a5afcb77449547fe8e5a3ab9ebc21c",
      {
        input: {
          image: imageUrl,
          prompt: "furniture",
          box_threshold: 0.3,
          text_threshold: 0.25
        }
      }
    )

    res.json({ result: output })

  } catch (error) {
    console.error('SAM API 오류:', error)
    res.status(500).json({ error: 'SAM API 호출 중 오류가 발생했습니다' })
  }
})

module.exports = router