/**
 * 우클릭 컨텍스트 메뉴 (16번 기능)
 * props: menu { x, y, item }, onClose, onDelete, onDuplicate, onLock, isLocked
 */
export default function ContextMenu({ menu, onClose, onDelete, onDuplicate, onLock, isLocked }) {
  if (!menu) return null;

  const actions = [
    { icon: "📋", label: "복제",             onClick: () => { onDuplicate(menu.item); onClose(); } },
    { icon: isLocked ? "🔓" : "🔒",
      label: isLocked ? "잠금 해제" : "잠금",
      onClick: () => { onLock(menu.item.instanceId); onClose(); } },
    { icon: "🗑", label: "삭제", danger: true, onClick: () => { onDelete(menu.item.instanceId); onClose(); } },
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: menu.y, left: menu.x,
        zIndex: 9000,
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: 10,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        padding: 4,
        minWidth: 140,
        fontFamily: "'Noto Sans KR', sans-serif",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 아이템 이름 */}
      <div style={{
        padding: "6px 12px 6px",
        fontSize: 11, color: "#bbb", fontWeight: 500,
        borderBottom: "1px solid #f0f0f0", marginBottom: 4,
      }}>
        {menu.item?.name?.replace(/\.[^.]+$/, "") || "가구"}
      </div>

      {actions.map(({ icon, label, danger, onClick }) => (
        <button
          key={label}
          onClick={onClick}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            width: "100%", padding: "8px 12px",
            background: "none", border: "none",
            borderRadius: 6, cursor: "pointer",
            fontSize: 13, fontWeight: 500,
            color: danger ? "#ef4444" : "#333",
            textAlign: "left",
            transition: "background 0.12s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = danger ? "#fef2f2" : "#f5f5f5")}
          onMouseOut={(e)  => (e.currentTarget.style.background = "none")}
        >
          <span>{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
}