import { useState } from "react";
import FurnitureCoordInput   from "../Furniture/FurnitureCoordInput";
import FurnitureColorPalette from "../Furniture/FurnitureColorPalette";
import FurnitureLock         from "../Furniture/FurnitureLock";
import FurnitureAlign        from "../Furniture/FurnitureAlign";

// ── 공통 인라인 입력 스타일 ──
const inputStyle = {
  width: "100%",
  padding: "5px 8px",
  fontSize: 12,
  fontFamily: "'Noto Sans KR', sans-serif",
  border: "1.5px solid #e5e5e5",
  borderRadius: 6,
  background: "#fafafa",
  color: "#111",
  outline: "none",
  textAlign: "right",
  transition: "border-color 0.15s",
};

// ── 라벨 + 입력 행 ──
function EditRow({ label, children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 0",
      borderBottom: "1px solid #f0f0f0",
      gap: 8,
    }}>
      <span style={{ fontSize: 12, color: "#999", fontWeight: 500, flexShrink: 0 }}>
        {label}
      </span>
      {children}
    </div>
  );
}

// ── 숫자 입력 + 단위 ──
function NumberInput({ value, onChange, unit, min, max, step = 1 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <input
        type="number"
        value={value}
        min={min} max={max} step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ...inputStyle, width: 72 }}
        onFocus={(e) => (e.target.style.borderColor = "#059669")}
        onBlur={(e)  => (e.target.style.borderColor = "#e5e5e5")}
      />
      <span style={{ fontSize: 11, color: "#bbb", flexShrink: 0 }}>{unit}</span>
    </div>
  );
}

export default function RightPanel({
  rightOpen, setRightOpen,
  selectedInfo,
  updateItem, removeItem,
  rooms,
  isLocked, onToggleLock,
  selectedIds, placedItems,
  // 공간 설정 상태 (App.jsx에서 내려줌)
  spaceConfig, setSpaceConfig,
  selectedRoomIdx, 
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
          // ════════════════════════════
          //  가구 선택됐을 때
          // ════════════════════════════
          <>
            {/* 미리보기 */}
            {selectedInfo.url && (
              <div className="selected-preview">
                <img src={selectedInfo.url} alt={selectedInfo.name} />
              </div>
            )}

            <p className="info-section-title">가구 정보</p>

            {/* 가구 이름 — 직접 수정 가능 */}
            <EditRow label="이름">
              <input
                type="text"
                value={selectedInfo.label ?? selectedInfo.name?.replace(/\.[^.]+$/, "") ?? "가구"}
                onChange={(e) => updateItem(selectedInfo.instanceId, { label: e.target.value })}
                style={{ ...inputStyle, width: 100, textAlign: "left" }}
                onFocus={(e) => (e.target.style.borderColor = "#059669")}
                onBlur={(e)  => (e.target.style.borderColor = "#e5e5e5")}
              />
            </EditRow>

            {/* 회전 — 슬라이더 + 숫자 입력 */}
            <EditRow label="회전">
              <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, justifyContent: "flex-end" }}>
                <input
                  type="range"
                  min={0} max={359} step={1}
                  value={selectedInfo.rotation || 0}
                  onChange={(e) => updateItem(selectedInfo.instanceId, { rotation: Number(e.target.value) })}
                  style={{ width: 60, accentColor: "#059669" }}
                />
                <input
                  type="number"
                  min={0} max={359} step={1}
                  value={selectedInfo.rotation || 0}
                  onChange={(e) => updateItem(selectedInfo.instanceId, { rotation: Number(e.target.value) % 360 })}
                  style={{ ...inputStyle, width: 48 }}
                  onFocus={(e) => (e.target.style.borderColor = "#059669")}
                  onBlur={(e)  => (e.target.style.borderColor = "#e5e5e5")}
                />
                <span style={{ fontSize: 11, color: "#bbb" }}>°</span>
              </div>
            </EditRow>

            {/* 3번: 수치 직접 입력 (mm) */}
            <FurnitureCoordInput
              selectedInfo={selectedInfo}
              onUpdate={updateItem}
            />

            {/* 6번: 색상 팔레트 */}
            <div style={{ marginTop: 12, borderTop: "1px solid #f0f0f0", paddingTop: 12 }}>
              <FurnitureColorPalette
                colorTint={selectedInfo.colorTint}
                onColorChange={(color) => updateItem(selectedInfo.instanceId, { colorTint: color })}
              />
            </div>

            {/* 5번: 잠금 */}
            <FurnitureLock
              isLocked={isLocked(selectedInfo.instanceId)}
              onToggle={() => onToggleLock(selectedInfo.instanceId)}
            />

            {/* 삭제 */}
            <button
              className="btn-outline btn-danger del-btn"
              onClick={() => removeItem(selectedInfo.instanceId)}
              style={{ marginTop: 8 }}
            >
              🗑 가구 삭제
            </button>
          </>
        ) : (
          // ════════════════════════════
          //  가구 미선택 — 공간 정보
          // ════════════════════════════
          <>
            <p className="info-section-title">공간 설정</p>

            {/* 공간 이름 — 직접 수정 */}
            <EditRow label="공간 이름">
              <input
                type="text"
                value={spaceConfig?.name ?? "자취방"}
                onChange={(e) => setSpaceConfig(prev => ({ ...prev, name: e.target.value }))}
                style={{ ...inputStyle, width: 100, textAlign: "left" }}
                onFocus={(e) => (e.target.style.borderColor = "#059669")}
                onBlur={(e)  => (e.target.style.borderColor = "#e5e5e5")}
              />
            </EditRow>

            {/* 벽 두께 — 수정 가능 */}
            <EditRow label="벽 두께">
              <NumberInput
                value={spaceConfig?.wallThickness ?? 200}
                onChange={(v) => setSpaceConfig(prev => ({ ...prev, wallThickness: v }))}
                unit="mm" min={50} max={500} step={10}
              />
            </EditRow>

            {/* 방 높이 — 수정 가능 */}
            <EditRow label="방 높이">
              <NumberInput
                value={spaceConfig?.roomHeight ?? 2300}
                onChange={(v) => setSpaceConfig(prev => ({ ...prev, roomHeight: v }))}
                unit="mm" min={2000} max={4000} step={100}
              />
            </EditRow>

            {/* 공간 면적 — 자동 계산 */}
            {rooms.length > 0 && (
              <div style={{ marginTop: 4 }}>
                {rooms.map((r, i) => (
                  <EditRow key={i} label={`방 ${i + 1} 면적`}>
                    <span style={{ 
                      fontSize: 12, fontWeight: 700, 
                      color: selectedRoomIdx === i ? "#059669" : "#888",
                      background: selectedRoomIdx === i ? "#f0fdf4" : "transparent",
                      padding: "2px 6px", borderRadius: 4,
                    }}>
                      {(r.area || 0).toFixed(2)} ㎡
                    </span>
                  </EditRow>
                ))}
                <EditRow label="전체 면적">
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>
                    {rooms.reduce((s, r) => s + (r.area || 0), 0).toFixed(2)} ㎡
                  </span>
                </EditRow>
              </div>
            )}

            {/* 4번: 정렬 툴 */}
            <div style={{ marginTop: 14, borderTop: "1px solid #f0f0f0", paddingTop: 14 }}>
              <FurnitureAlign
                selectedIds={selectedIds}
                placedItems={placedItems}
                onUpdate={updateItem}
              />
            </div>

            {rooms.length === 0 && (
              <div className="info-hint">
                가구를 클릭하면<br />가구 정보가 표시됩니다
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}