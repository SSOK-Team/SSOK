// src/pages/Verified.jsx
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function Verified() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isSuccess = searchParams.get('success') === 'true'
  const [count, setCount] = useState(5)

  useEffect(() => {
    if (!isSuccess) return
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return prev
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isSuccess])

  // count가 0이 되면 navigate (렌더링 밖에서 처리)
  useEffect(() => {
    if (count <= 0) {
      navigate('/')
    }
  }, [count, navigate])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'sans-serif'
    }}>
      {isSuccess ? (
        <>
          <div style={{ fontSize: '64px' }}>✅</div>
          <h2 style={{ fontSize: '24px', marginTop: '16px' }}>이메일 인증 완료!</h2>
          <p style={{ color: '#555' }}>인증이 완료되었습니다. 이제 로그인할 수 있어요.</p>
          <p style={{ color: '#999', fontSize: '14px' }}>{count}초 후 홈으로 이동합니다...</p>
          <button
            onClick={() => navigate('/')}
            style={{
              marginTop: '16px',
              padding: '12px 32px',
              background: '#4F46E5',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px'
            }}
          >
            바로 로그인하기
          </button>
        </>
      ) : (
        <>
          <div style={{ fontSize: '64px' }}>❌</div>
          <h2 style={{ fontSize: '24px', marginTop: '16px' }}>인증 실패</h2>
          <p style={{ color: '#555' }}>링크가 만료되었거나 유효하지 않습니다.</p>
          <button
            onClick={() => navigate('/')}
            style={{
              marginTop: '16px',
              padding: '12px 32px',
              background: '#4F46E5',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px'
            }}
          >
            홈으로 돌아가기
          </button>
        </>
      )}
    </div>
  )
}