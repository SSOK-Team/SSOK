import { useState } from "react";
import FurnitureSearch        from "../Furniture/FurnitureSearch";
import { useFavorites, FavoriteButton } from "../Furniture/FurnitureFavorites";
import WallMaterial           from "../Room/WallMaterial";
import DoorWindowLibrary      from "../Room/DoorWindowLibrary";
import FloorPlanImport        from "../Room/FloorPlanImport";

export default function LeftSidebar({
  leftOpen, setLeftOpen,
  mode, setMode, rooms,
  furnitureList, handleFurnitureUpload, addFurnitureToCanvas,
  materialList, handleMaterialUpload,
  materials, onMaterialApply,
  bgImage, bgOpacity, onBgLoad, onBgOpacity, onBgClear,
  onAddDoorWindow,
}) {
  const [leftTab, setLeftTab] = useState("draw");
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [filteredList, setFilteredList] = useState(null);
  const { toggleFavorite, isFavorite } = useFavorites();

  const displayList = (() => {
    const base = filteredList ?? furnitureList;
    return showFavOnly ? base.filter((f) => isFavorite(f.id)) : base;
  })();

  const TABS = [
    { key: "draw",      icon: "✏️", label: "도면" },
    { key: "furniture", icon: "🪑", label: "가구" },
    { key: "material",  icon: "🎨", label: "마감재" },
    { key: "room",      icon: "🚪", label: "문/창" },
    { key: "floorplan", icon: "🗺️", label: "밑그림" },
  ];

  return (
    <aside className={`left-sidebar ${leftOpen ? "open" : "closed"}`}>
      <nav className="left-tabs">
        {TABS.map(({ key, icon, label }) => (
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
            <button className={`tool-btn ${mode === "select" ? "active" : ""}`} onClick={() => setMode("select")}>
              <span>🖱</span> 선택 모드
            </button>
            <button className={`tool-btn ${mode === "wall" ? "active" : ""}`} onClick={() => setMode(mode === "wall" ? "select" : "wall")}>
              <span>📐</span> 벽 그리기
            </button>
            <div className="tip-box">
              {mode === "wall"
                ? "캔버스를 클릭해 꼭짓점을 찍으세요.\n3개 이상 찍은 후 시작점을 클릭하면\n공간이 완성됩니다.\n\n치수 숫자를 더블클릭하면 직접 수정할 수 있습니다."
                : "도구를 선택하거나\n상단 툴바를 이용하세요.\n\n치수 숫자를 더블클릭하면 직접 수정할 수 있습니다."}
            </div>
            {rooms.length > 0 && (
              <div style={{
                background: "rgba(5,150,105,0.06)", border: "1.5px solid #059669",
                borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#059669", fontWeight: 600,
              }}>
                ✓ 공간 {rooms.length}개 완성
                <div style={{ fontWeight: 400, color: "#555", marginTop: 4, fontSize: 11 }}>
                  총 {rooms.reduce((s, r) => s + (r.area || 0), 0).toFixed(2)} ㎡
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 가구 (검색 17 + 즐겨찾기 18 포함) ── */}
        {leftTab === "furniture" && (
          <div className="panel-section">
            <p className="panel-title">가구 업로드</p>
            <label className="upload-btn">
              <span>📁</span> 이미지 업로드
              <input type="file" accept="image/png,image/jpg,image/jpeg" multiple hidden onChange={handleFurnitureUpload} />
            </label>

            {/* 검색 (17번) */}
            <FurnitureSearch
              furnitureList={furnitureList}
              onResults={setFilteredList}
            />

            {/* 즐겨찾기 필터 토글 (18번) */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p className="panel-sub">가구 ({displayList.length})</p>
              <button
                onClick={() => setShowFavOnly(v => !v)}
                style={{
                  fontSize: 11, background: "none", border: "none",
                  cursor: "pointer", color: showFavOnly ? "#f59e0b" : "#bbb",
                  fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 600,
                }}
              >
                ★ {showFavOnly ? "전체 보기" : "즐겨찾기"}
              </button>
            </div>

            <div className="furniture-grid">
              {displayList.length === 0 ? (
                <p className="empty-msg">
                  {showFavOnly ? "즐겨찾기한 가구가 없습니다" : "PNG · JPG 파일을 업로드하세요"}
                </p>
              ) : displayList.map((f) => (
                <div key={f.id} className="furniture-thumb" style={{ position: "relative" }}
                  onClick={() => addFurnitureToCanvas(f)}>
                  <img src={f.url} alt={f.name} />
                  <span>{f.name.replace(/\.[^.]+$/, "")}</span>
                  <span className="add-hint">+ 배치</span>
                  {/* 즐겨찾기 버튼 (18번) */}
                  <FavoriteButton
                    id={f.id}
                    isFavorite={isFavorite(f.id)}
                    onToggle={toggleFavorite}
                  />
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
              <input type="file" accept="image/png,image/jpg,image/jpeg" multiple hidden onChange={handleMaterialUpload} />
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
                    <button onClick={() => onMaterialApply("wall",    { kind: "image", data: m.url })}>벽</button>
                    <button onClick={() => onMaterialApply("floor",   { kind: "image", data: m.url })}>바닥</button>
                    <button onClick={() => onMaterialApply("ceiling", { kind: "image", data: m.url })}>천장</button>
                  </div>
                </div>
              ))}
            </div>

            {/* 색상 팔레트로 벽/바닥재 선택 (2번) */}
            <div style={{ marginTop: 12, borderTop: "1px solid #f0f0f0", paddingTop: 12 }}>
              <WallMaterial materials={materials} onApply={onMaterialApply} />
            </div>
          </div>
        )}

        {/* ── 문/창문 (9번) ── */}
        {leftTab === "room" && (
          <div className="panel-section">
            <p className="panel-title">문 / 창문</p>
            <DoorWindowLibrary onAdd={onAddDoorWindow} />
          </div>
        )}

        {/* ── 도면 밑그림 (13번) ── */}
        {leftTab === "floorplan" && (
          <div className="panel-section">
            <FloorPlanImport
              bgImage={bgImage}
              opacity={bgOpacity}
              onImageLoad={onBgLoad}
              onOpacityChange={onBgOpacity}
              onClear={onBgClear}
            />
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