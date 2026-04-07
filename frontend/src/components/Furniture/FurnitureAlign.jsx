/**
 * 가구 정렬 툴 (4번 기능)
 * 선택된 여러 가구를 왼쪽/중앙/오른쪽/위/아래 정렬 + 간격 균등 배분
 *
 * props:
 *   selectedIds   — Set<instanceId>
 *   placedItems   — 전체 가구 배열
 *   onUpdate      — (instanceId, updates) => void
 */

const BTN = {
  display: "flex", alignItems: "center", justifyContent: "center",
  width: 32, height: 32,
  border: "1.5px solid #e5e5e5", borderRadius: 6,
  background: "#fff", cursor: "pointer", fontSize: 14,
  transition: "border-color 0.15s, background 0.15s",
};

export default function FurnitureAlign({ selectedIds, placedItems, onUpdate }) {
  if (!selectedIds || selectedIds.size < 2) {
    return (
      <p style={{ fontSize: 11, color: "#bbb", textAlign: "center", padding: "8px 0" }}>
        2개 이상 선택 시 정렬 가능
      </p>
    );
  }

  const selected = placedItems.filter((i) => selectedIds.has(i.instanceId));

  const alignLeft = () => {
    const minX = Math.min(...selected.map((i) => i.x));
    selected.forEach((i) => onUpdate(i.instanceId, { x: minX }));
  };

  const alignCenterH = () => {
    const minX = Math.min(...selected.map((i) => i.x));
    const maxX = Math.max(...selected.map((i) => i.x + i.w));
    const cx = (minX + maxX) / 2;
    selected.forEach((i) => onUpdate(i.instanceId, { x: cx - i.w / 2 }));
  };

  const alignRight = () => {
    const maxX = Math.max(...selected.map((i) => i.x + i.w));
    selected.forEach((i) => onUpdate(i.instanceId, { x: maxX - i.w }));
  };

  const alignTop = () => {
    const minY = Math.min(...selected.map((i) => i.y));
    selected.forEach((i) => onUpdate(i.instanceId, { y: minY }));
  };

  const alignCenterV = () => {
    const minY = Math.min(...selected.map((i) => i.y));
    const maxY = Math.max(...selected.map((i) => i.y + i.h));
    const cy = (minY + maxY) / 2;
    selected.forEach((i) => onUpdate(i.instanceId, { y: cy - i.h / 2 }));
  };

  const alignBottom = () => {
    const maxY = Math.max(...selected.map((i) => i.y + i.h));
    selected.forEach((i) => onUpdate(i.instanceId, { y: maxY - i.h }));
  };

  const distributeH = () => {
    const sorted = [...selected].sort((a, b) => a.x - b.x);
    const minX = sorted[0].x;
    const maxX = sorted.at(-1).x + sorted.at(-1).w;
    const totalW = sorted.reduce((s, i) => s + i.w, 0);
    const gap = (maxX - minX - totalW) / (sorted.length - 1);
    let cursor = minX;
    sorted.forEach((i) => {
      onUpdate(i.instanceId, { x: cursor });
      cursor += i.w + gap;
    });
  };

  const distributeV = () => {
    const sorted = [...selected].sort((a, b) => a.y - b.y);
    const minY = sorted[0].y;
    const maxY = sorted.at(-1).y + sorted.at(-1).h;
    const totalH = sorted.reduce((s, i) => s + i.h, 0);
    const gap = (maxY - minY - totalH) / (sorted.length - 1);
    let cursor = minY;
    sorted.forEach((i) => {
      onUpdate(i.instanceId, { y: cursor });
      cursor += i.h + gap;
    });
  };

  const actions = [
    { icon: "⬛", label: "왼쪽 정렬",    onClick: alignLeft },
    { icon: "⬛", label: "가로 중앙",    onClick: alignCenterH },
    { icon: "⬛", label: "오른쪽 정렬",  onClick: alignRight },
    { icon: "⬛", label: "위 정렬",      onClick: alignTop },
    { icon: "⬛", label: "세로 중앙",    onClick: alignCenterV },
    { icon: "⬛", label: "아래 정렬",    onClick: alignBottom },
    { icon: "↔", label: "가로 간격 균등", onClick: distributeH },
    { icon: "↕", label: "세로 간격 균등", onClick: distributeV },
  ];

  const ICONS = ["◀▮", "▮▮", "▮▶", "▲▮", "▮▮", "▮▼", "↔", "↕"];

  return (
    <div>
      <p style={{
        fontSize: 11, fontWeight: 700, color: "#999",
        textTransform: "uppercase", letterSpacing: "0.08em",
        marginBottom: 8,
      }}>정렬</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4 }}>
        {actions.map(({ label, onClick }, i) => (
          <button
            key={label}
            onClick={onClick}
            title={label}
            style={BTN}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.background = "#f0fdf4"; }}
            onMouseOut={(e)  => { e.currentTarget.style.borderColor = "#e5e5e5"; e.currentTarget.style.background = "#fff"; }}
          >
            <span style={{ fontSize: 11 }}>{ICONS[i]}</span>
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
        {actions.map(({ label }, i) => (
          i < 6 && (
            <span key={label} style={{ fontSize: 10, color: "#bbb" }}>
              {["←", "↔", "→", "↑", "↕", "↓"][i]} {label}
            </span>
          )
        ))}
      </div>
    </div>
  );
}