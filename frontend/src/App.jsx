import { useState, useCallback, useRef } from "react";
import DraggableImage from "./components/Canvas/DraggableImage";
import "./index.css";

export default function App() {
  const [mode, setMode] = useState("select");
  const [leftTab, setLeftTab] = useState("draw");
  const [showGrid, setShowGrid] = useState(true);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const [walls, setWalls] = useState([]);
  const [vertices, setVertices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [drawingWall, setDrawingWall] = useState(null);

  const [furnitureList, setFurnitureList] = useState([]);
  const [placedItems, setPlacedItems] = useState([]);
  const [materialList, setMaterialList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [areaResult, setAreaResult] = useState(null);

  const historyRef = useRef([]);
  const futureRef = useRef([]);

  const saveHistory = useCallback(() => {
    historyRef.current.push({ walls, vertices, rooms, placedItems });
    futureRef.current = [];
  }, [walls, vertices, rooms, placedItems]);

  const undo = () => {
    if (!historyRef.current.length) return;
    futureRef.current.push({ walls, vertices, rooms, placedItems });
    const prev = historyRef.current.pop();
    setWalls(prev.walls); setVertices(prev.vertices);
    setRooms(prev.rooms); setPlacedItems(prev.placedItems);
  };

  const redo = () => {
    if (!futureRef.current.length) return;
    historyRef.current.push({ walls, vertices, rooms, placedItems });
    const next = futureRef.current.pop();
    setWalls(next.walls); setVertices(next.vertices);
    setRooms(next.rooms); setPlacedItems(next.placedItems);
  };

  const handleFurnitureUpload = (e) => {
    Array.from(e.target.files).forEach((file) => {
      const url = URL.createObjectURL(file);
      setFurnitureList((prev) => [
        ...prev, { id: Date.now() + Math.random(), name: file.name, url, w: 100, h: 100 },
      ]);
    });
  };

  const handleMaterialUpload = (e) => {
    Array.from(e.target.files).forEach((file) => {
      const url = URL.createObjectURL(file);
      setMaterialList((prev) => [...prev, { id: Date.now() + Math.random(), name: file.name, url }]);
    });
  };

  const addFurnitureToCanvas = (furniture) => {
    saveHistory();
    setPlacedItems((prev) => [
      ...prev, { ...furniture, instanceId: Date.now(), x: 120, y: 120, rotation: 0 },
    ]);
  };

  const updateItem = (instanceId, updates) =>
    setPlacedItems((prev) =>
      prev.map((item) => item.instanceId === instanceId ? { ...item, ...updates } : item)
    );

  const removeItem = (instanceId) => {
    saveHistory();
    setPlacedItems((prev) => prev.filter((item) => item.instanceId !== instanceId));
    if (selectedItem?.instanceId === instanceId) setSelectedItem(null);
  };

  const calcArea = () => {
    const totalArea = rooms.reduce((s, r) => s + (r.area || 0), 0);
    const furnitureArea = placedItems.reduce((s, i) => s + (i.w * i.h) / 10000, 0);
    setAreaResult({
      total: totalArea.toFixed(2),
      furniture: furnitureArea.toFixed(2),
      remaining: Math.max(0, totalArea - furnitureArea).toFixed(2),
    });
  };

  const selectedInfo = selectedItem
    ? placedItems.find((i) => i.instanceId === selectedItem.instanceId)
    : null;

  return (
    <div className="app-wrapper">

      {/* ══ TOPBAR ══ */}
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
            <button className="btn-tool" onClick={undo} title="실행 취소 (Ctrl+Z)">
              <span className="btn-tool-icon">↩</span> 취소
            </button>
            <button className="btn-tool" onClick={redo} title="다시 실행 (Ctrl+Y)">
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

      {/* ══ BODY ══ */}
      <div className="body-layout">

        {/* ── 왼쪽 사이드바 ── */}
        <aside className={`left-sidebar ${leftOpen ? "open" : "closed"}`}>
          <nav className="left-tabs">
            {[
              { key: "draw",      icon: "✏️", label: "도면 그리기" },
              { key: "furniture", icon: "🪑", label: "가구" },
              { key: "material",  icon: "🎨", label: "마감재" },
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

          {/* 사이드바 엣지 버튼 */}
          <button
            className="sidebar-edge-btn left-edge"
            onClick={() => setLeftOpen(v => !v)}
            title={leftOpen ? "패널 닫기" : "패널 열기"}
          >
            {leftOpen ? "‹" : "›"}
          </button>
        </aside>

        {/* ── 캔버스 ── */}
        <main className="canvas-area">
          <DraggableImage
            mode={mode}
            showGrid={showGrid}
            walls={walls} setWalls={setWalls}
            vertices={vertices} setVertices={setVertices}
            rooms={rooms} setRooms={setRooms}
            drawingWall={drawingWall} setDrawingWall={setDrawingWall}
            placedItems={placedItems}
            updateItem={updateItem}
            removeItem={removeItem}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            saveHistory={saveHistory}
          />
        </main>

        {/* ── 오른쪽 정보 패널 ── */}
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
                    <input type="number" className="info-input" value={selectedInfo.w}
                      onChange={(e) => updateItem(selectedInfo.instanceId, { w: +e.target.value })} />
                    <span className="info-unit">px</span>
                  </div>
                </div>
                <div className="info-row">
                  <span>높이</span>
                  <div className="info-input-wrap">
                    <input type="number" className="info-input" value={selectedInfo.h}
                      onChange={(e) => updateItem(selectedInfo.instanceId, { h: +e.target.value })} />
                    <span className="info-unit">px</span>
                  </div>
                </div>
                <div className="info-row">
                  <span>회전</span>
                  <span className="info-val">{selectedInfo.rotation || 0}°</span>
                </div>
                <button className="btn-outline btn-danger del-btn"
                  onClick={() => removeItem(selectedInfo.instanceId)}>
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
      </div>

      {/* ══ BOTTOMBAR ══ */}
      <footer className="bottombar">
        <div className={`bottombar-sidebar-slot ${leftOpen ? "open" : "closed"}`}>
          <button
            className="btn-3d"
            onClick={() => alert("3D 변환 기능은 준비 중입니다.")}
            disabled={rooms.length === 0}
          >
            <span className="btn-3d-icon">⬛</span>
            <span>3D로 보기</span>
          </button>
        </div>

        <div className="bottombar-main">
          <button className="btn-primary" onClick={calcArea}>
            <span>📐</span> 남은 면적 계산
          </button>

          {areaResult && (
            <div className="area-result">
              <div className="area-chip">
                <span className="chip-label">전체</span>
                <span className="chip-val">{areaResult.total} ㎡</span>
              </div>
              <span className="area-op">−</span>
              <div className="area-chip">
                <span className="chip-label">가구</span>
                <span className="chip-val">{areaResult.furniture} ㎡</span>
              </div>
              <span className="area-op">=</span>
              <div className="area-chip highlight">
                <span className="chip-label">남은 면적</span>
                <span className="chip-val">{areaResult.remaining} ㎡</span>
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}