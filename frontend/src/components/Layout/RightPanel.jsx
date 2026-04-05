export default function RightPanel({
  rightOpen, setRightOpen,
  selectedInfo,
  updateItem, removeItem,
  rooms,
}) {
  return (
    <aside className={`right-panel ${rightOpen ? "open" : "closed"}`}>
      <button
        className="sidebar-edge-btn right-edge"
        onClick={() => setRightOpen(v => !v)}
        title={rightOpen ? "패널 닫기" : "패널 열기"}
      >
        {rightOpen ? "›" : "‹"}
      </button>

      <div className="right-panel-content">
        {selectedInfo ? (
          <>
            <div className="selected-preview">
              <img src={selectedInfo.url} alt={selectedInfo.name} />
            </div>
            <p className="info-section-title">가구 정보</p>
            <div className="info-row">
              <span>이름</span>
              <span className="info-val">
                {selectedInfo.name?.replace(/\.[^.]+$/, "").slice(0, 12) || "가구"}
              </span>
            </div>
            <div className="info-row">
              <span>너비</span>
              <div className="info-input-wrap">
                <input
                  type="number" className="info-input"
                  value={selectedInfo.w}
                  onChange={(e) => updateItem(selectedInfo.instanceId, { w: +e.target.value })}
                />
                <span className="info-unit">px</span>
              </div>
            </div>
            <div className="info-row">
              <span>높이</span>
              <div className="info-input-wrap">
                <input
                  type="number" className="info-input"
                  value={selectedInfo.h}
                  onChange={(e) => updateItem(selectedInfo.instanceId, { h: +e.target.value })}
                />
                <span className="info-unit">px</span>
              </div>
            </div>
            <div className="info-row">
              <span>회전</span>
              <span className="info-val">{selectedInfo.rotation || 0}°</span>
            </div>
            <button
              className="btn-outline btn-danger del-btn"
              onClick={() => removeItem(selectedInfo.instanceId)}
            >
              🗑 가구 삭제
            </button>
          </>
        ) : (
          <>
            <p className="info-section-title">공간 정보</p>
            <div className="info-row">
              <span>벽 두께</span>
              <span className="info-val">200 mm</span>
            </div>
            <div className="info-row">
              <span>방 높이</span>
              <span className="info-val">2400 mm</span>
            </div>
            <div className="info-row">
              <span>공간 이름</span>
              <span className="info-val">자취방</span>
            </div>
            {rooms.length > 0 && (
              <div className="info-row">
                <span>공간 면적</span>
                <span className="info-val" style={{ color: "#059669" }}>
                  {rooms.reduce((s, r) => s + (r.area || 0), 0).toFixed(2)} ㎡
                </span>
              </div>
            )}
            <div className="info-hint">
              가구를 클릭하면<br />가구 정보가 표시됩니다
            </div>
          </>
        )}
      </div>
    </aside>
  );
}