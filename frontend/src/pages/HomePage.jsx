import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Noto Sans KR', sans-serif; background: #fafafa; color: #111; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }

  /* NAV */
  .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 60px; height: 64px; display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid #f0f0f0; }
  .logo { font-size: 22px; font-weight: 900; color: #111; letter-spacing: -1px; display: flex; align-items: center; gap: 10px; }
  .logo span { color: #059669; }
  .logo-sub { font-size: 15px; font-weight: 400; color: #999; font-style: normal; font-family: 'Noto Sans KR', sans-serif; letter-spacing: 0; }
  .nav-right { display: flex; align-items: center; gap: 10px; }
  .btn-ghost { padding: 8px 20px; border: 1.5px solid #e5e5e5; border-radius: 8px; background: #fff; color: #333; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'Noto Sans KR', sans-serif; transition: all 0.15s; }
  .btn-ghost:hover { border-color: #059669; color: #059669; }
  .btn-primary { padding: 8px 20px; border: none; border-radius: 8px; background: #111; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Noto Sans KR', sans-serif; transition: all 0.15s; }
  .btn-primary:hover { background: #333; }

  /* HERO */
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

  /* AUTH CARD */
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

  /* STATS */
  .stats-wrap { background: #fff; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; }
  .stats { max-width: 1200px; margin: 0 auto; padding: 0 60px; display: flex; }
  .stat { flex: 1; padding: 28px 0; border-right: 1px solid #f0f0f0; text-align: center; }
  .stat:last-child { border-right: none; }
  .stat-n { font-size: 28px; font-weight: 900; color: #059669; letter-spacing: -1px; margin-bottom: 4px; }
  .stat-l { font-size: 13px; color: #999; }

  /* SECTIONS */
  .section-divider { border: none; border-top: 1px solid #f0f0f0; margin: 0; }
  .section { max-width: 1200px; margin: 0 auto; padding: 80px 60px; }
  .section-title { font-size: 36px; font-weight: 900; color: #111; letter-spacing: -1.5px; margin-bottom: 12px; }
  .section-sub { font-size: 16px; color: #888; margin-bottom: 56px; font-weight: 300; }
  .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .card { background: #fff; border: 1px solid #eee; border-radius: 16px; padding: 28px 24px; transition: all 0.2s; }
  .card:hover { border-color: #059669; box-shadow: 0 4px 20px rgba(5,150,105,0.08); transform: translateY(-2px); }
  .card-icon { font-size: 32px; margin-bottom: 16px; }
  .card-title { font-size: 17px; font-weight: 700; color: #111; margin-bottom: 8px; }
  .card-desc { font-size: 14px; color: #888; line-height: 1.7; font-weight: 300; }
  .how-list { display: flex; flex-direction: column; gap: 16px; }
  .how-item { display: flex; align-items: flex-start; gap: 16px; }
  .how-num { width: 36px; height: 36px; border-radius: 50%; background: #059669; color: #fff; font-size: 15px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .how-text h4 { font-size: 15px; font-weight: 700; color: #111; margin-bottom: 4px; }
  .how-text p { font-size: 14px; color: #888; font-weight: 300; line-height: 1.6; }
`

export default function HomePage() {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', nickname: '' })
  const [loading, setLoading] = useState(false) // ✅ 추가
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {

    if (loading) return // ✅ 중복 클릭 방지

    const url = tab === 'login'
      ? 'http://localhost:3000/api/auth/login'
      : 'http://localhost:3000/api/auth/register'

    const body = tab === 'login'
      ? { email: form.email, password: form.password }
      : { email: form.email, password: form.password, nickname: form.nickname }

    try {
      setLoading(true) // ✅ 요청 시작
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
    } finally {
      setLoading(false) // ✅ 요청 완료
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div>
        {/* NAV */}
        <nav className="nav">
          <div className="logo">
            SS<span>O</span>K
            <span className="logo-sub">Smart Space Optimizer Kit</span>
          </div>
          <div className="nav-right">
            <button className="btn-ghost" onClick={() => setTab('login')}>로그인</button>
            <button className="btn-primary" onClick={() => setTab('register')}>시작하기</button>
          </div>
        </nav>

        {/* HERO */}
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
                <button className="cta-sub" onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}>서비스 둘러보기</button>
              </div>
            </div>

            {/* AUTH CARD */}
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
              <button 
                className="form-submit" 
                onClick={handleSubmit}
                disabled={loading}
                style = {{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer'}}
              >
                {loading ? '처리 중...' : (tab === 'login' ? '로그인' : '회원가입')}
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

        {/* 서비스 소개 섹션 */}
        <div id="about">
          <hr className="section-divider" />
          <div className="section">
            <h2 className="section-title">주요 기능</h2>
            <p className="section-sub">SSOK이 제공하는 스마트한 공간 설계 기능들</p>
            <div className="cards">
              <div className="card">
                <div className="card-icon">📸</div>
                <div className="card-title">방 사진 업로드</div>
                <div className="card-desc">내 방 사진을 올리면 캔버스 배경으로 설정돼요. 실제 방 분위기에서 가구를 배치해보세요.</div>
              </div>
              <div className="card">
                <div className="card-icon">🛋️</div>
                <div className="card-title">가구 드래그 배치</div>
                <div className="card-desc">침대, 책상, 소파 등 다양한 가구를 드래그해서 자유롭게 배치하고 회전할 수 있어요.</div>
              </div>
              <div className="card">
                <div className="card-icon">📐</div>
                <div className="card-title">실측 치수 반영</div>
                <div className="card-desc">실제 cm 치수를 기반으로 가구 크기를 정확하게 반영해 현실감 있는 시뮬레이션이 가능해요.</div>
              </div>
              <div className="card">
                <div className="card-icon">📊</div>
                <div className="card-title">공간 효율 분석</div>
                <div className="card-desc">가구 배치 후 남은 바닥 면적과 공간 활용도를 실시간으로 수치화해 분석해드려요.</div>
              </div>
              <div className="card">
                <div className="card-icon">🖼️</div>
                <div className="card-title">AI 배경 제거</div>
                <div className="card-desc">직접 찍은 가구 사진의 배경을 AI가 자동으로 제거해 캔버스에 자연스럽게 올릴 수 있어요.</div>
              </div>
              <div className="card">
                <div className="card-icon">💾</div>
                <div className="card-title">배치 저장</div>
                <div className="card-desc">완성한 가구 배치를 저장하고 나중에 다시 불러와서 수정할 수 있어요.</div>
              </div>
            </div>
          </div>

          <hr className="section-divider" />
          <div className="section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            <div>
              <h2 className="section-title">이렇게 사용해요</h2>
              <p className="section-sub">3단계로 간단하게 시작하세요</p>
              <div className="how-list">
                <div className="how-item">
                  <div className="how-num">1</div>
                  <div className="how-text">
                    <h4>회원가입 후 로그인</h4>
                    <p>간단한 정보 입력으로 바로 시작할 수 있어요.</p>
                  </div>
                </div>
                <div className="how-item">
                  <div className="how-num">2</div>
                  <div className="how-text">
                    <h4>방 크기 설정 및 사진 업로드</h4>
                    <p>방의 실제 가로·세로 크기를 입력하고 사진을 올려주세요.</p>
                  </div>
                </div>
                <div className="how-item">
                  <div className="how-num">3</div>
                  <div className="how-text">
                    <h4>가구 배치 시작</h4>
                    <p>원하는 가구를 선택해 드래그로 배치하고 공간 효율을 확인해보세요.</p>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ background: '#f8fffe', border: '1px solid #a7f3d0', borderRadius: '20px', padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏠</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>지금 바로 시작해보세요</div>
              <div style={{ fontSize: '14px', color: '#888', marginBottom: '24px', fontWeight: '300' }}>무료로 이용할 수 있어요</div>
              <button className="cta-main" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>시작하기 →</button>
            </div>
          </div>
        </div>


        {/* STATS */}
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