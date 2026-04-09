import ExportButton from "../Export/ExportImage";

export default function Topbar({ mode, setMode, showGrid, setShowGrid, onUndo, onRedo, svgRef }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="logo-wrap">
          <span className="logo-text">
            SS<span className="logo-accent">O</span>K
          </span>
          <span className="logo-sub">가구 배치 시뮬레이터</span>
        </div>
      </div>

      <div className="topbar-center">
        <div className="btn-group">
          <button className="btn-tool" onClick={onUndo} title="실행 취소 (Ctrl+Z)">
            <span className="btn-tool-icon">↩</span> 취소
          </button>
          <button className="btn-tool" onClick={onRedo} title="다시 실행 (Ctrl+Y)">
            <span className="btn-tool-icon">↪</span> 복원
          </button>
        </div>

        <div className="divider-v" />

        <div className="btn-group">
          <button
            className={`btn-tool ${mode === "select" ? "active" : ""}`}
            onClick={() => setMode("select")}
            title="선택 모드"
          >
            <span className="btn-tool-icon">🖱</span> 선택
          </button>
          <button
            className={`btn-tool ${mode === "wall" ? "active" : ""}`}
            onClick={() => setMode(mode === "wall" ? "select" : "wall")}
            title="벽 그리기"
          >
            <span className="btn-tool-icon">📐</span> 벽 그리기
          </button>
        </div>

        <div className="divider-v" />

        <button
          className={`btn-outline ${showGrid ? "active" : ""}`}
          onClick={() => setShowGrid(v => !v)}
        >
          <span style={{ fontSize: 13 }}>{showGrid ? "⊞" : "⊟"}</span>
          격자 {showGrid ? "ON" : "OFF"}
        </button>

        <div className="divider-v" />

        {/* 21번: PNG/JPG 내보내기 */}
        <ExportButton svgRef={svgRef} />
      </div>

      <div className="topbar-right">
        <button className="btn-outline">
          <span style={{ fontSize: 12 }}>💾</span> 저장
        </button>
        <button className="btn-outline btn-danger">
          <span style={{ fontSize: 12 }}>✕</span> 나가기
        </button>
      </div>
    </header>
  );
}