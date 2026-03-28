const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// 서버 상태 확인
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'SSOK API 서버가 실행 중입니다.' })
})

app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`)
})


