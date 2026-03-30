import { useRef, useState, useCallback } from "react";

const GRID = 10; // snap grid in px

function snapToGrid(val) {
  return Math.round(val / GRID) * GRID;
}

export default function DraggableImage({
  placedItems,
  updateItem,
  removeItem,
  roomSize = { width: 500, height: 400 },
  scale = 1,
}) {
  const canvasRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);
  const dragging = useRef(null); // { id, offsetX, offsetY }

  const W = Math.round(roomSize.width * scale);
  const H = Math.round(roomSize.height * scale);

  /* ── Drag start ── */
  const onMouseDown = useCallback((e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(id);
    const item = placedItems.find((i) => i.id === id);
    const rect = canvasRef.current.getBoundingClientRect();
    dragging.current = {
      id,
      offsetX: e.clientX - rect.left - item.x,
      offsetY: e.clientY - rect.top - item.y,
    };

    const onMove = (me) => {
      if (!dragging.current) return;
      const r = canvasRef.current.getBoundingClientRect();
      const newX = snapToGrid(me.clientX - r.left - dragging.current.offsetX);
      const newY = snapToGrid(me.clientY - r.top - dragging.current.offsetY);
      updateItem(dragging.current.id, { x: newX, y: newY });
    };

    const onUp = () => {
      dragging.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [placedItems, updateItem]);

  /* ── Touch support ── */
  const onTouchStart = useCallback((e, id) => {
    e.stopPropagation();
    setSelectedId(id);
    const touch = e.touches[0];
    const item = placedItems.find((i) => i.id === id);
    const rect = canvasRef.current.getBoundingClientRect();
    dragging.current = {
      id,
      offsetX: touch.clientX - rect.left - item.x,
      offsetY: touch.clientY - rect.top - item.y,
    };

    const onMove = (te) => {
      if (!dragging.current) return;
      const t = te.touches[0];
      const r = canvasRef.current.getBoundingClientRect();
      updateItem(dragging.current.id, {
        x: snapToGrid(t.clientX - r.left - dragging.current.offsetX),
        y: snapToGrid(t.clientY - r.top - dragging.current.offsetY),
      });
    };
    const onEnd = () => {
      dragging.current = null;
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  }, [placedItems, updateItem]);

  const rotate = (id) => {
    const item = placedItems.find((i) => i.id === id);
    updateItem(id, { rotation: ((item.rotation || 0) + 90) % 360 });
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Dimension labels */}
      <div style={{
        textAlign: "center",
        fontSize: 11,
        color: "var(--text-mute)",
        marginBottom: 6,
        letterSpacing: "1px",
      }}>
        {roomSize.width} cm × {roomSize.height} cm
      </div>

      {/* Room canvas */}
      <div
        ref={canvasRef}
        className="room-canvas"
        style={{ width: W, height: H }}
        onClick={() => setSelectedId(null)}
      >
        {/* Grid lines */}
        <svg
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          width={W} height={H}
        >
          {Array.from({ length: Math.floor(W / (GRID * 5)) + 1 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={i * GRID * 5} y1={0}
              x2={i * GRID * 5} y2={H}
              stroke="rgba(0,0,0,0.07)" strokeWidth="1"
            />
          ))}
          {Array.from({ length: Math.floor(H / (GRID * 5)) + 1 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1={0} y1={i * GRID * 5}
              x2={W} y2={i * GRID * 5}
              stroke="rgba(0,0,0,0.07)" strokeWidth="1"
            />
          ))}
        </svg>

        {/* Placed furniture */}
        {placedItems.map((item) => {
          const isSelected = item.id === selectedId;
          const isRotated = (item.rotation || 0) % 180 !== 0;
          const displayW = isRotated ? item.h : item.w;
          const displayH = isRotated ? item.w : item.h;

          return (
            <div
              key={item.id}
              className={`placed-item ${isSelected ? "selected" : ""}`}
              style={{
                left: item.x,
                top: item.y,
                width: displayW,
                height: displayH,
                background: item.color || "#d4c4a0",
                transform: `rotate(${item.rotation || 0}deg)`,
              }}
              onMouseDown={(e) => onMouseDown(e, item.id)}
              onTouchStart={(e) => onTouchStart(e, item.id)}
              onClick={(e) => { e.stopPropagation(); setSelectedId(item.id); }}
            >
              {isSelected && (
                <div className="item-controls" onClick={(e) => e.stopPropagation()}>
                  <button title="회전" onClick={() => rotate(item.id)}>↻</button>
                  <button title="삭제" onClick={() => removeItem(item.id)}
                    style={{ color: "var(--danger)" }}>✕</button>
                </div>
              )}
              <span className="item-emoji">{item.emoji}</span>
              <span className="item-label">{item.name}</span>
            </div>
          );
        })}

        {/* Empty state hint */}
        {placedItems.length === 0 && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            color: "rgba(0,0,0,0.2)",
            fontSize: 14, gap: 8, pointerEvents: "none",
          }}>
            <span style={{ fontSize: 40 }}>🏠</span>
            <span>오른쪽에서 가구를 선택해 배치하세요</span>
          </div>
        )}
      </div>

      {/* Bottom legend */}
      <div style={{
        marginTop: 8, fontSize: 11,
        color: "var(--text-mute)", textAlign: "center",
      }}>
        클릭으로 선택 · 드래그로 이동 · ↻ 회전 · ✕ 삭제
      </div>
    </div>
  );
}