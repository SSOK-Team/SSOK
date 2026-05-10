// backend/scripts/fetchModels.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const axios = require('axios')
const { query } = require('../src/config/db')

const SKETCHFAB_API = 'https://api.sketchfab.com/v3'
const headers = { Authorization: `Token ${process.env.SKETCHFAB_API_KEY}` }

const furnitureKeywords = [
  { name: '싱글 침대',  keyword: 'single bed bedroom furniture 3d' },
  { name: '더블 침대',  keyword: 'double bed furniture interior 3d' },
  { name: '퀸 침대',    keyword: 'queen size bed furniture 3d' },
  { name: '1인 책상',   keyword: 'study desk office furniture 3d' },
  { name: 'L자 책상',   keyword: 'L shape corner desk furniture 3d' },
  { name: '2인 소파',   keyword: 'two seat couch sofa interior 3d' },
  { name: '2도어 옷장', keyword: 'wardrobe cabinet closet 3d' },
  { name: '3단 수납장', keyword: 'bookshelf storage cabinet 3d' },
]

async function fetchAndSaveModels() {
  for (const item of furnitureKeywords) {
    try {
      console.log(`🔍 검색 중: ${item.name}`)

      const response = await axios.get(`${SKETCHFAB_API}/models`, {
        headers,
        params: {
          q: item.keyword,
          downloadable: true,
          license: 'cc-by',
          count: 5,              // ✅ 5개씩
          sort_by: '-likeCount'
        }
      })

      const models = response.data.results  // ✅ 여기서 선언
      if (!models.length) {
        console.log(`❌ ${item.name} 모델 없음`)
        continue
      }

      // 가구 id 조회
      const furnitureResult = await query(
        'SELECT id FROM furnitures WHERE name = $1',
        [item.name]
      )

      const furnitureId = furnitureResult.rows[0]?.id
      if (!furnitureId) {
        console.log(`❌ ${item.name} DB에 없음`)
        continue
      }

      // 여러 모델 저장
      for (let i = 0; i < models.length; i++) {
        const model = models[i]
        const modelUrl = `https://sketchfab.com/models/${model.uid}`
        const thumbnailUrl = model.thumbnails?.images?.[0]?.url || null

        await query(
          `INSERT INTO furniture_models (furniture_id, model_url, thumbnail_url, is_default)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [furnitureId, modelUrl, thumbnailUrl, i === 0]  // 첫 번째가 기본 모델
        )
        console.log(`  ✅ 저장: ${model.name}`)
      }

    } catch (err) {
      console.error(`❌ ${item.name} 오류:`, err.message)
    }

    // API 제한 방지 (1초 대기)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('🎉 모든 모델 저장 완료!')
  process.exit(0)
}

fetchAndSaveModels()