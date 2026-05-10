// src/components/SketchfabSearch.jsx
import { useState } from 'react'

export default function SketchfabSearch({ furnitureId, onSelect }) {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  console.log('furnitureId:', furnitureId)

  // 검색
  const handleSearch = async () => {
    if (!keyword.trim()) return
    setLoading(true)
    try {
      const res = await fetch(
        `http://localhost:3000/api/admin/sketchfab/search?keyword=${encodeURIComponent(keyword)}`
      )
      const data = await res.json()
      setResults(data.data)
    } catch (err) {
      alert('검색 실패')
    } finally {
      setLoading(false)
    }
  }

  // 모델 선택 → DB 저장
  const handleSelect = async (model) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/admin/furniture/${furnitureId}/model`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model_url: model.model_url,
            thumbnail_url: model.thumbnail_url,
            is_default: true
          })
        }
      )
      const data = await res.json()
      if (data.success) {
        alert('모델 저장 완료!')
        onSelect(model)  // 부모 컴포넌트에 선택된 모델 전달
      }
    } catch (err) {
      alert('저장 실패')
    }
  }

  return (
    <div style={{ padding: '16px' }}>
      {/* 검색창 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="모델 검색 (예: single bed)"
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: '#059669',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {loading ? '검색 중...' : '검색'}
        </button>
      </div>

      {/* 검색 결과 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        maxHeight: '600px',
        overflowY: 'auto'
      }}>
        {results.map((model) => (
          <div
            key={model.uid}
            onClick={() => handleSelect(model)}
            style={{
              border: '1px solid #eee',
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#059669'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#eee'}
          >
            {/* 썸네일 */}
            <img
              src={model.thumbnail_url}
              alt={model.name}
              style={{ width: '100%', height: '120px', objectFit: 'cover' }}
            />
            {/* 모델 이름 */}
            <div style={{ padding: '8px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#111' }}>
                {model.name}
              </p>
              <p style={{ fontSize: '11px', color: '#999' }}>
                by {model.author}
              </p>
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && !loading && (
        <p style={{ textAlign: 'center', color: '#999', fontSize: '14px' }}>
          검색어를 입력해주세요
        </p>
      )}
    </div>
  )
}