import { useRef } from "react";

/**
 * 벽지/바닥재 교체 (2번 기능)
 * 색상 또는 이미지 패턴을 벽/바닥/천장에 적용
 * props: materials, onApply(type, value)
 *        type: "wall" | "floor" | "ceiling"
 *        value: { kind: "color"|"image", data: string }
 */

const FLOOR_PRESETS = [
  { label: "원목", color: "#c8956c" },
  { label: "대리석", color: "#e8e8e8" },
  { label: "콘크리트", color: "#9ca3af" },
  { label: "타일", color: "#dbeafe" },
  { label: "다크우드", color: "#5c3d1e" },
  { label: "라이트우드", color: "#f0d9b5" },
];

const WALL_PRESETS = [
  { label: "화이트", color: "#ffffff" },
  { label: "아이보리", color: "#fef9ef" },
  { label: "그레이", color: "#e5e7eb" },
  { label: "민트", color: "#d1fae5" },
  { label: "블루", color: "#dbeafe" },
  { label: "핑크", color: "#fce7f3" },
];

function PresetGrid({ presets, current, onSelect }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
      {presets.map(({ label, color }) => (
        <button
          key={label}
          title={label}
          onClick={() => onSelect({ kind: "color", data: color })}
          style={{
            width: 28, height: 28, borderRadius: 6,
            background: color,
            border: current?.data === color
              ? "2.5px solid #059669"
              : "1.5px solid #e5e5e5",
            cursor: "pointer", flexShrink: 0,
            transition: "border-color 0.15s",
          }}
        />
      ))}
    </div>
  );
}

export default function WallMaterial({ materials, onApply }) {
  const fileRef = useRef(null);

  const handleImageUpload = (type, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onApply(type, { kind: "image", data: url });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* 벽 */}
      <div>
        <p style={{
          fontSize: 11, fontWeight: 700, color: "#999",
          textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8,
        }}>벽 색상</p>
        <PresetGrid
          presets={WALL_PRESETS}
          current={materials?.wall}
          onSelect={(v) => onApply("wall", v)}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: 11, color: "#999" }}>커스텀</label>
          <input
            type="color"
            value={materials?.wall?.kind === "color" ? materials.wall.data : "#ffffff"}
            onChange={(e) => onApply("wall", { kind: "color", data: e.target.value })}
            style={{ width: 32, height: 24, border: "1.5px solid #e5e5e5", borderRadius: 6, cursor: "pointer", padding: 1 }}
          />
          <label style={{
            fontSize: 11, color: "#059669", cursor: "pointer", fontWeight: 600,
            border: "1.5px solid #059669", borderRadius: 6, padding: "3px 8px",
          }}>
            이미지
            <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload("wall", e)} />
          </label>
        </div>
      </div>

      {/* 바닥 */}
      <div>
        <p style={{
          fontSize: 11, fontWeight: 700, color: "#999",
          textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8,
        }}>바닥재</p>
        <PresetGrid
          presets={FLOOR_PRESETS}
          current={materials?.floor}
          onSelect={(v) => onApply("floor", v)}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: 11, color: "#999" }}>커스텀</label>
          <input
            type="color"
            value={materials?.floor?.kind === "color" ? materials.floor.data : "#c8956c"}
            onChange={(e) => onApply("floor", { kind: "color", data: e.target.value })}
            style={{ width: 32, height: 24, border: "1.5px solid #e5e5e5", borderRadius: 6, cursor: "pointer", padding: 1 }}
          />
          <label style={{
            fontSize: 11, color: "#059669", cursor: "pointer", fontWeight: 600,
            border: "1.5px solid #059669", borderRadius: 6, padding: "3px 8px",
          }}>
            이미지
            <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload("floor", e)} />
          </label>
        </div>
      </div>

      {/* 천장 */}
      <div>
        <p style={{
          fontSize: 11, fontWeight: 700, color: "#999",
          textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8,
        }}>천장 색상</p>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="color"
            value={materials?.ceiling?.kind === "color" ? materials.ceiling.data : "#f8f8f8"}
            onChange={(e) => onApply("ceiling", { kind: "color", data: e.target.value })}
            style={{ width: 32, height: 24, border: "1.5px solid #e5e5e5", borderRadius: 6, cursor: "pointer", padding: 1 }}
          />
          <span style={{ fontSize: 11, color: "#bbb" }}>색상 선택</span>
        </div>
      </div>
    </div>
  );
}