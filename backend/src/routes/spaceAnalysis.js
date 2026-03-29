const express = require('express')
const router = express.Router()

router.post('/', (req, res) => {
  try {
    const { room_width, room_depth, furnitures } = req.body

    if (!room_width || !room_depth || !furnitures) {
      return res.status(400).json({ error: '방 크기와 가구 정보가 필요합니다' })
    }

    // 방 전체 면적
    const room_area = room_width * room_depth

    // 가구가 차지하는 면적 계산
    const used_area = furnitures.reduce((total, furniture) => {
      return total + furniture.width * furniture.depth
    }, 0)

    // 가용 면적
    const free_area = room_area - used_area

    // 사용 비율
    const usage_percent = Math.round((used_area / room_area) * 100)

    // 피드백 메시지
    let message = ''
    if (usage_percent >= 70) {
      message = `현재 방의 ${usage_percent}%를 사용 중입니다. 활동 공간이 부족합니다.`
    } else if (usage_percent >= 40) {
      message = `현재 방의 ${usage_percent}%를 사용 중입니다. 적절한 공간 활용입니다.`
    } else {
      message = `현재 방의 ${usage_percent}%를 사용 중입니다. 활동 공간이 충분합니다.`
    }

    res.json({
      room_area,
      used_area,
      free_area,
      usage_percent,
      message
    })

  } catch (error) {
    console.error('공간 분석 오류:', error)
    res.status(500).json({ error: '공간 분석 중 오류가 발생했습니다' })
  }
})

module.exports = router