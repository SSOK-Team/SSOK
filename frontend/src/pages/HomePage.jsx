import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Noto Sans KR', sans-serif; background: #fafafa; color: #111; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 60px; height: 64px; display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid #f0f0f0; }
  .logo { font-size: 22px; font-weight: 900; color: #111; letter-spacing: -1px; }
  .logo span { color: #059669; }
  .nav-right { display: flex; align-items: center; gap: 10px; }
  .btn-ghost { padding: 8px 20px; border: 1.5px solid #e5e5e5; border-radius: 8px; background: #fff; color: #333; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'Noto Sans KR', sans-serif; transition: all 0.15s; }
  .btn-ghost:hover { border-color: #059669; color: #059669; }
  .btn-primary { padding: 8px 20px; border: none; border-radius: 8px; background: #111; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Noto Sans KR', sans-serif; transition: all 0.15s; }
  .btn-primary:hover { background: #333; }
  .hero { min-height: 100vh; display: flex; align-items: center; padding: 100px 60px 60px; max-width: 1200px; margin: 0 auto; }
  .hero-inner { width: 100%; display: grid; grid-template-columns: 1fr 400px; gap: 80px; align-items: center; }
  .hero-left { animation: fadeUp 0.6s 0.1s ease both; }
  .hero-badge { display: inline-flex; align-items: center; gap: 7px; background: #f0fdf4; border: 1px solid #a7f3d0; border-radius: 999px; padding: 5px 14px; font-size: 12px; font-weight: 600; color: #059669; margin-bottom: 24px; }
  .badge-dot { width: 6px; height: 6px; background: #059669; border-radius: 50%; }
  .hero h1 { font-size: 54px; font-weight: 900; line-height: 1.12; letter-spacing: -2px; color: #111; margin-bottom: 18px; }
  .hero h1 .accent { color: #059669; font-style: normal; font-family: 'Noto Sans KR', sans-serif; }
  .hero-desc { font-size: 16px; color: #666; line-height: 1.8; margin-bottom: 36px; font-weight: 300; }
  .hero-features { display: flex; flex-direction: column; gap: 10px; margin-bottom: 36px; }
  .feature-item { display: flex; align-items: center; gap: 12px; font-size: 14px; color: #444; }
  .feature-icon { width: 32px; height: 32px; border-radius: 8px; background: #f0fdf4; border: 1px solid #a7f3d0; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
  .hero-cta { display: flex; gap: 10px; }
  .cta-main { padding: 13px 28px; background: #111; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'Noto Sans KR', sans-serif; transition: all 0.2s; }
  .cta-main:hover { background: #333; transform: translateY(-1px); }
  .cta-sub { padding: 13px 24px; background: #fff; color: #444; border: 1.5px solid #e5e5e5; border-radius: 10px; font-size: 15px; font-weight: 500; cursor: pointer; font-family: 'Noto Sans KR', sans-serif; transition: all 0.2s; }
  .cta-sub:hover { border-color: #999; color: #111; }
  .auth-card { background: #fff; border: 1px solid #eee; border-radius: 20px; padding: 32px 28px; box-shadow: 0 4px 40px rgba(0,0,0,0.06); animation: fadeUp 0.6s 0.2s ease both; }
  .auth-tabs { display: flex; background: #f5f5f5; border-radius: 10px; padding: 4px; margin-bottom: 24px; }
  .auth-tab { flex: 1; padding: 9px; font-size: 14px; font-weight: 500; border: none; background: transparent; color: #999; border-radius: 7px; cursor: pointer; font-family: 'Noto Sans KR', sans-serif; transition: all 0.2s; }
  .auth-tab.active { background: #fff; color: #111; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  .form-group { margin-bottom: 14px; }
  .form-label { display: block; font-size: 12px; font-weight: 600; color: #888; margin-bottom: 6px; letter-spacing: 0.3px; text-transform: uppercase; }
  .form-input { width: 100%; padding: 11px 14px; background: #fafafa; border: 1.5px solid #eee; border-radius: 9px; font-size: 14px; color: #111; font-family: 'Noto Sans KR', sans-serif; outline: none; transition: all 0.2s; }
  .form-input:focus { border-color: #059669; background: #fff; box-shadow: 0 0 0 3px rgba(5,150,105,0.08); }
  .form-input::placeholder { color: #ccc; }
  .form-submit { width: 100%; padding: 13px; background: #111; color: #fff; border: none; border-radius: 9px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Noto Sans KR', sans-serif; transition: all 0.2s; margin-top: 6px; }
  .form-submit:hover { background: #333; }
  .form-switch { text-align: center; font-size: 13px; color: #aaa; margin-top: 14px; }
  .form-switch span { color: #059669; cursor: pointer; font-weight: 600; }
  .stats-wrap { background: #fff; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; }
  .stats { max-width: 1200px; margin: 0 auto; padding: 0 60px; display: flex; }
  .stat { flex: 1; padding: 28px 0; border-right: 1px solid #f0f0f0; text-align: center; }
  .stat:last-child { border-right: none; }
  .stat-n { font-size: 28px; font-weight: 900; color: #059669; letter-spacing: -1px; margin-bottom: 4px; }
  .stat-l { font-size: 13px; color: #999; }
`

export default function HomePage() {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', nickname: '' })
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    const url = tab === 'login'
      ? 'http://localhost:3000/api/auth/login'
      : 'http://localhost:3000/api/auth/register'

    const body = tab === 'login'
      ? { email: form.email, password: form.password }
      : { email: form.email, password: form.password, nickname: form.nickname }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (res.ok) {
        if (tab === 'login') {
          localStorage.setItem('token', data.token)
          navigate('/simulator')
        } else {
          alert('회원가입 성공! 로그인해주세요')
          setTab('login')
        }
      } else {
        alert(data.error || '오류가 발생했습니다')
      }
    } catch (e) {
      alert('서버 연결 오류')
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div>
        <nav className="nav">
          <div className="logo">SS<span>O</span>K <span className="logo-sub">Smart Space Optimizer Kit</span></div>
          <div className="nav-right">
            <button className="btn-ghost" onClick={() => setTab('login')}>로그인</button>
            <button className="btn-primary" onClick={() => setTab('register')}>시작하기</button>
          </div>
        </nav>

        <section className="hero">
          <div className="hero-inner">
            <div className="hero-left">
              <div className="hero-badge"><span className="badge-dot" />자취방 가구 배치 시뮬레이터</div>
              <h1>내 방에 딱 맞는<br /><span className="accent">가구 배치</span>를<br />미리 확인하세요</h1>
              <p className="hero-desc">방 사진을 올리고 가구를 드래그해서 배치해보세요.<br />실제 치수 기반으로 공간 활용도까지 분석해드립니다.</p>
              <div className="hero-features">
                <div className="feature-item"><div className="feature-icon">📸</div><span>방 사진 업로드 후 가구 자유 배치</span></div>
                <div className="feature-item"><div className="feature-icon">📐</div><span>실제 cm 치수 기반 정확한 시뮬레이션</span></div>
                <div className="feature-item"><div className="feature-icon">📊</div><span>공간 효율 실시간 분석 (테트리스 모드)</span></div>
                <div className="feature-item"><div className="feature-icon">🖼️</div><span>AI 기반 가구 이미지 배경 자동 제거</span></div>
              </div>
              <div className="hero-cta">
                <button className="cta-main" onClick={() => setTab('register')}>지금 시작하기 →</button>
                <button className="cta-sub">서비스 둘러보기</button>
              </div>
            </div>

            <div className="auth-card">
              <div className="auth-tabs">
                <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>로그인</button>
                <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>회원가입</button>
              </div>
              {tab === 'register' && (
                <div className="form-group">
                  <label className="form-label">닉네임</label>
                  <input className="form-input" type="text" name="nickname" placeholder="닉네임을 입력해주세요" value={form.nickname} onChange={handleChange} />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">이메일</label>
                <input className="form-input" type="email" name="email" placeholder="이메일을 입력해주세요" value={form.email} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">비밀번호</label>
                <input className="form-input" type="password" name="password" placeholder="비밀번호를 입력해주세요" value={form.password} onChange={handleChange} />
              </div>
              <button className="form-submit" onClick={handleSubmit}>
                {tab === 'login' ? '로그인' : '회원가입'}
              </button>
              <div className="form-switch">
                {tab === 'login'
                  ? <>계정이 없으신가요? <span onClick={() => setTab('register')}>회원가입</span></>
                  : <>이미 계정이 있으신가요? <span onClick={() => setTab('login')}>로그인</span></>
                }
              </div>
            </div>
          </div>
        </section>

        <div className="stats-wrap">
          <div className="stats">
            <div className="stat"><div className="stat-n">2D</div><div className="stat-l">캔버스 기반 배치</div></div>
            <div className="stat"><div className="stat-n">AI</div><div className="stat-l">배경 자동 제거</div></div>
            <div className="stat"><div className="stat-n">실측</div><div className="stat-l">cm 기반 치수 반영</div></div>
            <div className="stat"><div className="stat-n">분석</div><div className="stat-l">공간 효율 계산</div></div>
          </div>
        </div>
      </div>
    </>
  )
}