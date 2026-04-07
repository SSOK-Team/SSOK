/**
 * 가구 색상 팔레트 (6번 기능)
 * 선택된 가구에 tint 색상을 오버레이로 적용
 * props: instanceId, colorTint, onColorChange
 */

const PRESET_COLORS = [
  { label: "기본",   value: null },
  { label: "화이트", value: "#ffffff" },
  { label: "아이보리", value: "#f5f0e0" },
  { label: "그레이", value: "#9ca3af" },
  { label: "브라운", value: "#92400e" },
  { label: "네이비",  value: "#1e3a5f" },
  { label: "그린",   value: "#059669" },
  { label: "블랙",   value: "#111111" },
];

export default function FurnitureColorPalette({ colorTint, onColorChange }) {
  return (
    <div style={{ marginTop: 4 }}>
      <p style={{
        fontSize: 11, fontWeight: 700, color: "#999",
        textTransform: "uppercase", letterSpacing: "0.08em",
        marginBottom: 8,
      }}>색상</p>

      {/* 프리셋 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {PRESET_COLORS.map(({ label, value }) => (
          <button
            key={label}
            title={label}
            onClick={() => onColorChange(value)}
            style={{
              width: 24, height: 24,
              borderRadius: "50%",
              border: colorTint === value
                ? "2.5px solid #059669"
                : "1.5px solid #e5e5e5",
              background: value ?? "linear-gradient(135deg,#eee 40%,#ccc 100%)",
              cursor: "pointer",
              flexShrink: 0,
              transition: "border-color 0.15s",
              position: "relative",
            }}
          >
            {value === null && (
              <span style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, color: "#888",
              }}>✕</span>
            )}
          </button>
        ))}
      </div>

      {/* 커스텀 컬러 피커 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <label style={{ fontSize: 11, color: "#999" }}>커스텀</label>
        <input
          type="color"
          value={colorTint ?? "#ffffff"}
          onChange={(e) => onColorChange(e.target.value)}
          style={{
            width: 32, height: 24, border: "1.5px solid #e5e5e5",
            borderRadius: 6, cursor: "pointer", padding: 1,
            background: "none",
          }}
        />
        {colorTint && (
          <span style={{ fontSize: 11, color: "#555", fontFamily: "monospace" }}>
            {colorTint}
          </span>
        )}
      </div>
    </div>
  );
}