/**
 * 가구 잠금 버튼 (5번 기능)
 * props: isLocked, onToggle
 */
export default function FurnitureLock({ isLocked, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={isLocked ? "잠금 해제" : "가구 잠금"}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "8px 0",
        marginTop: 6,
        fontSize: 13,
        fontFamily: "'Noto Sans KR', sans-serif",
        fontWeight: 600,
        border: `1.5px solid ${isLocked ? "#f59e0b" : "#e5e5e5"}`,
        borderRadius: 8,
        background: isLocked ? "#fffbeb" : "#fff",
        color: isLocked ? "#b45309" : "#555",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: 15 }}>{isLocked ? "🔒" : "🔓"}</span>
      {isLocked ? "잠금 해제" : "가구 잠금"}
    </button>
  );
}