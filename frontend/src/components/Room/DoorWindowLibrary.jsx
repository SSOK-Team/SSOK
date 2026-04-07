/**
 * 문/창문 라이브러리 (9번 기능)
 * props: onAdd(item) — 캔버스에 문/창문 추가
 */

const LIBRARY = [
  // 문
  { id: "door-single-90",  type: "door",   label: "외여닫이 문",  width: 90,  height: 20, icon: "🚪" },
  { id: "door-single-80",  type: "door",   label: "외여닫이 문(소)", width: 80, height: 20, icon: "🚪" },
  { id: "door-double-180", type: "door",   label: "쌍여닫이 문",  width: 180, height: 20, icon: "🚪" },
  { id: "door-slide-90",   type: "door",   label: "미닫이 문",    width: 90,  height: 20, icon: "🚪" },
  // 창문
  { id: "window-120",      type: "window", label: "창문 (120)",   width: 120, height: 15, icon: "🪟" },
  { id: "window-90",       type: "window", label: "창문 (90)",    width: 90,  height: 15, icon: "🪟" },
  { id: "window-60",       type: "window", label: "창문 (60)",    width: 60,  height: 15, icon: "🪟" },
  { id: "window-bay",      type: "window", label: "베이 창",      width: 150, height: 15, icon: "🪟" },
];

export default function DoorWindowLibrary({ onAdd }) {
  const doors   = LIBRARY.filter((i) => i.type === "door");
  const windows = LIBRARY.filter((i) => i.type === "window");

  const Section = ({ title, items }) => (
    <div style={{ marginBottom: 14 }}>
      <p style={{
        fontSize: 11, fontWeight: 700, color: "#999",
        textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8,
      }}>{title}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onAdd({
              ...item,
              instanceId: Date.now() + Math.random(),
              x: 150, y: 150, rotation: 0,
              w: item.width, h: item.height,
            })}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 10px",
              background: "#fafafa",
              border: "1.5px solid #e5e5e5",
              borderRadius: 8, cursor: "pointer",
              fontSize: 12, fontFamily: "'Noto Sans KR', sans-serif",
              color: "#333", textAlign: "left",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.background = "#f0fdf4"; }}
            onMouseOut={(e)  => { e.currentTarget.style.borderColor = "#e5e5e5"; e.currentTarget.style.background = "#fafafa"; }}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            <span style={{ fontSize: 10, color: "#bbb" }}>{item.width}cm</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <Section title="문" items={doors} />
      <Section title="창문" items={windows} />
    </div>
  );
}