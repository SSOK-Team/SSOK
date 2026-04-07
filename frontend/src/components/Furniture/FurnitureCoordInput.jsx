/**
 * 가구 수치 직접 입력 (3번 기능) — mm 단위
 * 1px = 10mm 스케일 기준
 */

const MM_PER_PX = 10;
const pxToMm = (px) => Math.round(px * MM_PER_PX);
const mmToPx = (mm) => Math.round(mm / MM_PER_PX);

const Row = ({ label, valueMm, onChangeMm }) => (
  <div style={{
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    padding: "7px 0",
    borderBottom: "1px solid #f0f0f0",
    gap: 8,
  }}>
    <span style={{ fontSize: 12, color: "#999", fontWeight: 500, flexShrink: 0 }}>{label}</span>
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <input
        type="number"
        value={valueMm}
        step={10}
        min={10}
        onChange={(e) => onChangeMm(Number(e.target.value))}
        style={{
          width: 72, padding: "4px 8px", fontSize: 12,
          fontFamily: "'Noto Sans KR', sans-serif",
          border: "1.5px solid #e5e5e5", borderRadius: 6,
          textAlign: "right", background: "#fafafa", color: "#111",
          outline: "none", transition: "border-color 0.15s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#059669")}
        onBlur={(e)  => (e.target.style.borderColor = "#e5e5e5")}
      />
      <span style={{ fontSize: 11, color: "#bbb" }}>mm</span>
    </div>
  </div>
);

export default function FurnitureCoordInput({ selectedInfo, onUpdate }) {
  if (!selectedInfo) return null;

  const update = (field, mm) => {
    onUpdate(selectedInfo.instanceId, { [field]: mmToPx(mm) });
  };

  return (
    <div style={{ marginTop: 4 }}>
      <p style={{
        fontSize: 11, fontWeight: 700, color: "#999",
        textTransform: "uppercase", letterSpacing: "0.08em",
        marginBottom: 4,
      }}>위치 / 크기 (mm)</p>
      <Row label="X 위치" valueMm={pxToMm(selectedInfo.x)} onChangeMm={(mm) => update("x", mm)} />
      <Row label="Y 위치" valueMm={pxToMm(selectedInfo.y)} onChangeMm={(mm) => update("y", mm)} />
      <Row label="너비"   valueMm={pxToMm(selectedInfo.w)} onChangeMm={(mm) => update("w", mm)} />
      <Row label="높이"   valueMm={pxToMm(selectedInfo.h)} onChangeMm={(mm) => update("h", mm)} />
    </div>
  );
}