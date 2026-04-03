import { useState } from "react";

export default function LeftSidebar({
  leftOpen, setLeftOpen,
  mode, setMode,
  rooms,
  furnitureList, handleFurnitureUpload, addFurnitureToCanvas,
  materialList, handleMaterialUpload,
}) {
  const [leftTab, setLeftTab] = useState("draw");

  return (
    <aside className={`left-sidebar ${leftOpen ? "open" : "closed"}`}>
      <nav className="left-tabs">
        {[
          { key: "draw", label: "도면 그리기" },
          { key: "furniture", label: "가구" },
          { key: "material", label: "마감재" },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            className={`left-tab-btn ${leftTab === key ? "active" : ""}`}
            onClick={() => setLeftTab(key)}
          >
            <span className="tab-icon">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="left-panel">

        {/* ── 도면 그리기 ── */}
        {leftTab === "draw" && (
          <div className="panel-section">
            <p className="panel-title">도면 그리기</p>
            <button
              className={`tool-btn ${mode === "select" ? "active" : ""}`}
              onClick={() => setMode("select")}
            >
              <span>🖱</span> 선택 모드
            </button>
            <button
              className={`tool-btn ${mode === "wall" ? "active" : ""}`}
              onClick={() => setMode(mode === "wall" ? "select" : "wall")}
            >
              <span>📐</span> 벽 그리기
            </button>
            <div className="tip-box">
              {mode === "wall"
                ? "캔버스를 클릭해 꼭짓점을 찍으세요.\n3개 이상 찍은 후 시작점을 클릭하면\n공간이 완성됩니다.\n\n치수 숫자를 더블클릭하면 직접 수정할 수 있습니다."
                : "도구를 선택하거나\n상단 툴바를 이용하세요.\n\n치수 숫자를 더블클릭하면 직접 수정할 수 있습니다."}
            </div>
            {rooms.length > 0 && (
              <div style={{
                background: "rgba(5,150,105,0.06)",
                border: "1.5px solid #059669",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 12,
                color: "#059669",
                fontWeight: 600,
              }}>
                ✓ 공간 {rooms.length}개 완성
                <div style={{ fontWeight: 400, color: "#555", marginTop: 4, fontSize: 11 }}>
                  총 {rooms.reduce((s, r) => s + (r.area || 0), 0).toFixed(2)} ㎡
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 가구 ── */}
        {leftTab === "furniture" && (
          <div className="panel-section">
            <p className="panel-title">가구 업로드</p>
            <label className="upload-btn">
              <span>📁</span> 이미지 업로드
              <input
                type="file"
                accept="image/png,image/jpg,image/jpeg"
                multiple hidden
                onChange={handleFurnitureUpload}
              />
            </label>
            <p className="panel-sub">업로드된 가구 ({furnitureList.length})</p>
            <div className="furniture-grid">
              {furnitureList.length === 0 ? (
                <p className="empty-msg">PNG · JPG 파일을 업로드하세요</p>
              ) : furnitureList.map((f) => (
                <div key={f.id} className="furniture-thumb" onClick={() => addFurnitureToCanvas(f)}>
                  <img src={f.url} alt={f.name} />
                  <span>{f.name.replace(/\.[^.]+$/, "")}</span>
                  <span className="add-hint">+ 배치</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 마감재 ── */}
        {leftTab === "material" && (
          <div className="panel-section">
            <p className="panel-title">마감재 업로드</p>
            <label className="upload-btn">
              <span>📁</span> 이미지 업로드
              <input
                type="file"
                accept="image/png,image/jpg,image/jpeg"
                multiple hidden
                onChange={handleMaterialUpload}
              />
            </label>
            <p className="panel-sub">업로드된 마감재 ({materialList.length})</p>
            <div className="furniture-grid">
              {materialList.length === 0 ? (
                <p className="empty-msg">PNG · JPG 파일을 업로드하세요</p>
              ) : materialList.map((m) => (
                <div key={m.id} className="furniture-thumb material-thumb">
                  <img src={m.url} alt={m.name} />
                  <span>{m.name.replace(/\.[^.]+$/, "")}</span>
                  <div className="material-btns">
                    <button>벽</button>
                    <button>바닥</button>
                    <button>천장</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <button
        className="sidebar-edge-btn left-edge"
        onClick={() => setLeftOpen(v => !v)}
        title={leftOpen ? "패널 닫기" : "패널 열기"}
      >
        {leftOpen ? "‹" : "›"}
      </button>
    </aside>
  );
}