import { useRef, useState, useEffect, useCallback } from "react";

const GRID = 10;
const SNAP = 10;
const WALL_W = 4;

function snap(v) { return Math.round(v / SNAP) * SNAP; }

function polyArea(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    a += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return Math.abs(a / 2) / 10000;
}

function near(ax, ay, bx, by, r = 18) {
  return Math.hypot(ax - bx, ay - by) < r;
}

function wallLen(w) {
  return Math.round(Math.hypot(w.x2 - w.x1, w.y2 - w.y1));
}

// HomePage 기준 포인트 컬러
const ACCENT = "#059669";
const ACCENT_DIM = "rgba(5,150,105,0.85)";
const DANGER = "#ef4444";

export default function DraggableImage({
  mode, showGrid,
  walls, setWalls, vertices, setVertices,
  rooms, setRooms, drawingWall, setDrawingWall,
  placedItems, updateItem, removeItem,
  selectedItem, setSelectedItem, saveHistory,
}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [wPts, setWPts] = useState([]);
  const dragItem = useRef(null);
  const dragVertex = useRef(null);
  const [selVtx, setSelVtx] = useState(null);

  const [editingWall, setEditingWall] = useState(null);
  const editInputRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setSize({ w: Math.max(500, width), h: Math.max(380, height) });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (editingWall && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingWall]);

  const toSVG = (e) => {
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const s = pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
    return { x: snap(s.x), y: snap(s.y) };
  };

  const handleClick = (e) => {
    if (mode !== "wall") return;
    if (e.target.closest(".fg")) return;
    const pos = toSVG(e);

    if (wPts.length >= 3 && near(pos.x, pos.y, wPts[0].x, wPts[0].y)) {
      const newRoom = { id: Date.now(), points: wPts, area: polyArea(wPts) };
      const newWalls = wPts.map((p, i) => {
        const n = wPts[(i + 1) % wPts.length];
        return { id: Date.now() + i, x1: p.x, y1: p.y, x2: n.x, y2: n.y, v1: p.id, v2: n.id };
      });
      setRooms(r => [...r, newRoom]);
      setWalls(w => [...w, ...newWalls]);
      setVertices(v => [...v, ...wPts]);
      setWPts([]);
      setDrawingWall(null);
      saveHistory();
      return;
    }
    const pt = { id: Date.now(), x: pos.x, y: pos.y };
    setWPts(prev => {
      if (prev.length > 0) setDrawingWall({ x1: prev.at(-1).x, y1: prev.at(-1).y, x2: pos.x, y2: pos.y });
      return [...prev, pt];
    });
  };

  const handleLabelDblClick = (e, wall) => {
    e.stopPropagation();
    setEditingWall({ wallId: wall.id, value: String(wallLen(wall)) });
  };

  const commitWallEdit = (wall, newLen) => {
    const len = parseInt(newLen, 10);
    if (!len || len <= 0) { setEditingWall(null); return; }
    const dx = wall.x2 - wall.x1;
    const dy = wall.y2 - wall.y1;
    const orig = Math.hypot(dx, dy);
    if (orig === 0) { setEditingWall(null); return; }
    const ratio = len / orig;
    const newX2 = snap(wall.x1 + dx * ratio);
    const newY2 = snap(wall.y1 + dy * ratio);
    const v2id = wall.v2;

    setWalls(ws => ws.map(w => {
      if (w.id === wall.id) return { ...w, x2: newX2, y2: newY2 };
      if (w.v1 === v2id) return { ...w, x1: newX2, y1: newY2 };
      if (w.v2 === v2id) return { ...w, x2: newX2, y2: newY2 };
      return w;
    }));
    setVertices(vs => vs.map(v => v.id === v2id ? { ...v, x: newX2, y: newY2 } : v));
    setRooms(rs => rs.map(room => {
      const pts = room.points.map(p => p.id === v2id ? { ...p, x: newX2, y: newY2 } : p);
      return { ...room, points: pts, area: polyArea(pts) };
    }));
    saveHistory();
    setEditingWall(null);
  };

  const handleMouseMove = useCallback((e) => {
    if (!svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const s = pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
    const snapped = { x: snap(s.x), y: snap(s.y) };
    setMouse(snapped);

    if (mode === "wall" && wPts.length > 0)
      setDrawingWall({ x1: wPts.at(-1).x, y1: wPts.at(-1).y, x2: snapped.x, y2: snapped.y });

    if (dragItem.current) {
      const { id, ox, oy } = dragItem.current;
      updateItem(id, { x: snap(s.x - ox), y: snap(s.y - oy) });
    }
    if (dragVertex.current) {
      const vid = dragVertex.current;
      setVertices(v => v.map(p => p.id === vid ? { ...p, ...snapped } : p));
      setRooms(r => r.map(room => {
        const pts = room.points.map(p => p.id === vid ? { ...p, ...snapped } : p);
        return { ...room, points: pts, area: polyArea(pts) };
      }));
      setWalls(w => w.map(wall => ({
        ...wall,
        ...(wall.v1 === vid ? { x1: snapped.x, y1: snapped.y } : {}),
        ...(wall.v2 === vid ? { x2: snapped.x, y2: snapped.y } : {}),
      })));
    }
  }, [mode, wPts, updateItem]);

  const handleMouseUp = () => { dragItem.current = null; dragVertex.current = null; };

  const startDragItem = (e, item) => {
    if (mode !== "select") return;
    e.stopPropagation();
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const s = pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
    dragItem.current = { id: item.instanceId, ox: s.x - item.x, oy: s.y - item.y };
    setSelectedItem(item);
  };

  const startDragVertex = (e, v) => {
    e.stopPropagation();
    dragVertex.current = v.id;
    setSelVtx(v.id);
    saveHistory();
  };

  const rotateItem = (e, item) => {
    e.stopPropagation();
    updateItem(item.instanceId, { rotation: ((item.rotation || 0) + 90) % 360 });
  };

  // Grid lines
  const gridLines = [];
  if (showGrid) {
    for (let x = 0; x <= size.w; x += GRID)
      gridLines.push(<line key={`gv${x}`} x1={x} y1={0} x2={x} y2={size.h}
        stroke={x % 100 === 0 ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.05)"}
        strokeWidth={x % 100 === 0 ? 0.8 : 0.5} />);
    for (let y = 0; y <= size.h; y += GRID)
      gridLines.push(<line key={`gh${y}`} x1={0} y1={y} x2={size.w} y2={y}
        stroke={y % 100 === 0 ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.05)"}
        strokeWidth={y % 100 === 0 ? 0.8 : 0.5} />);
  }

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <svg
        ref={svgRef}
        width={size.w} height={size.h}
        onClick={handleClick}
        style={{
          cursor: mode === "wall" ? "crosshair" : "default",
          display: "block",
        }}
      >
        {/* Grid */}
        {gridLines}

        {/* Room fills */}
        {rooms.map(r => (
          <polygon key={`room${r.id}`}
            points={r.points.map(p => `${p.x},${p.y}`).join(" ")}
            fill="rgba(5,150,105,0.04)"
            stroke={ACCENT}
            strokeWidth={1}
            strokeDasharray="6 3"
            stroke-opacity="0.4"
          />
        ))}

        {/* Completed walls */}
        {walls.map(w => (
          <line key={`wall${w.id}`}
            x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2}
            stroke="#111"
            strokeWidth={WALL_W}
            strokeLinecap="round"
          />
        ))}

        {/* Wall length labels */}
        {walls.map(w => {
          const mx = (w.x1 + w.x2) / 2;
          const my = (w.y1 + w.y2) / 2;
          const len = wallLen(w);
          const isEditing = editingWall?.wallId === w.id;
          const labelW = 52;
          const labelH = 22;

          return (
            <g key={`lbl${w.id}`}>
              {isEditing ? (
                <foreignObject
                  x={mx - labelW / 2} y={my - labelH / 2}
                  width={labelW} height={labelH}
                  style={{ overflow: "visible" }}
                >
                  <input
                    ref={editInputRef}
                    type="number"
                    value={editingWall.value}
                    onChange={e => setEditingWall(v => ({ ...v, value: e.target.value }))}
                    onBlur={() => commitWallEdit(w, editingWall.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") commitWallEdit(w, editingWall.value);
                      if (e.key === "Escape") setEditingWall(null);
                    }}
                    style={{
                      width: labelW,
                      height: labelH,
                      fontSize: 11,
                      fontFamily: "'Noto Sans KR', sans-serif",
                      fontWeight: 600,
                      textAlign: "center",
                      border: `1.5px solid ${ACCENT}`,
                      borderRadius: 6,
                      background: "#fff",
                      color: "#111",
                      outline: "none",
                      boxShadow: `0 0 0 3px rgba(5,150,105,0.12)`,
                      padding: "0 4px",
                    }}
                  />
                </foreignObject>
              ) : (
                <g
                  onDoubleClick={e => handleLabelDblClick(e, w)}
                  style={{ cursor: "text" }}
                >
                  <rect
                    x={mx - labelW / 2} y={my - labelH / 2}
                    width={labelW} height={labelH} rx={6}
                    fill="rgba(255,255,255,0.95)"
                    stroke="rgba(0,0,0,0.08)"
                    strokeWidth={0.8}
                  />
                  <text
                    x={mx} y={my + 4}
                    fontSize="10" fill="#555"
                    textAnchor="middle"
                    fontFamily="'Noto Sans KR', sans-serif"
                    fontWeight="500"
                  >
                    {len}px
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Preview — already-placed segments while drawing */}
        {mode === "wall" && wPts.length > 1 && wPts.slice(0, -1).map((p, i) => (
          <line key={`dprev${i}`}
            x1={p.x} y1={p.y} x2={wPts[i + 1].x} y2={wPts[i + 1].y}
            stroke="#111" strokeWidth={WALL_W} strokeLinecap="round"
          />
        ))}

        {/* Preview — cursor line */}
        {mode === "wall" && wPts.length > 0 && drawingWall && (
          <>
            <line
              x1={drawingWall.x1} y1={drawingWall.y1}
              x2={drawingWall.x2} y2={drawingWall.y2}
              stroke={ACCENT} strokeWidth={WALL_W}
              strokeDasharray="10 5" strokeLinecap="round"
              opacity={0.7}
            />
            <g>
              <rect
                x={(drawingWall.x1 + drawingWall.x2) / 2 - 24}
                y={(drawingWall.y1 + drawingWall.y2) / 2 - 13}
                width={48} height={18} rx={6}
                fill={ACCENT_DIM}
              />
              <text
                x={(drawingWall.x1 + drawingWall.x2) / 2}
                y={(drawingWall.y1 + drawingWall.y2) / 2 + 1}
                fontSize="10" fill="#fff" textAnchor="middle"
                fontFamily="'Noto Sans KR', sans-serif" fontWeight="600"
              >
                {Math.round(Math.hypot(drawingWall.x2 - drawingWall.x1, drawingWall.y2 - drawingWall.y1))}px
              </text>
            </g>
          </>
        )}

        {/* Drawing vertices */}
        {mode === "wall" && wPts.map((p, i) => (
          <g key={p.id}>
            {i === 0 && wPts.length >= 3 && (
              <circle cx={p.x} cy={p.y} r={20}
                fill="none" stroke={ACCENT} strokeWidth={1.5}
                strokeDasharray="4 3" opacity={0.6} />
            )}
            <circle cx={p.x} cy={p.y} r={i === 0 ? 7 : 4.5}
              fill={ACCENT}
              stroke="#fff" strokeWidth={2}
            />
          </g>
        ))}

        {/* Completed vertices (draggable) */}
        {vertices.map(v => (
          <circle key={v.id} cx={v.x} cy={v.y} r={5}
            fill={selVtx === v.id ? ACCENT : "#fff"}
            stroke={ACCENT}
            strokeWidth={2} style={{ cursor: "grab" }}
            onMouseDown={e => startDragVertex(e, v)}
          />
        ))}

        {/* Cursor coord (wall mode) */}
        {mode === "wall" && (
          <g>
            <rect x={mouse.x + 14} y={mouse.y - 24} width={68} height={17} rx={6}
              fill="rgba(17,17,17,0.75)" />
            <text x={mouse.x + 48} y={mouse.y - 12} fontSize="9.5" fill="rgba(255,255,255,0.9)"
              textAnchor="middle" fontFamily="'Noto Sans KR', sans-serif">
              {mouse.x}, {mouse.y}
            </text>
          </g>
        )}

        {/* Placed furniture */}
        {placedItems.map(item => {
          const sel = selectedItem?.instanceId === item.instanceId;
          return (
            <g key={item.instanceId} className="fg"
              transform={`translate(${item.x},${item.y}) rotate(${item.rotation || 0},${item.w / 2},${item.h / 2})`}
              onMouseDown={e => startDragItem(e, item)}
              onClick={e => { e.stopPropagation(); setSelectedItem(item); }}
              style={{ cursor: mode === "select" ? "grab" : "default" }}
            >
              <rect x={3} y={4} width={item.w} height={item.h} rx={4} fill="rgba(0,0,0,0.08)" />
              <image href={item.url} x={0} y={0} width={item.w} height={item.h}
                preserveAspectRatio="xMidYMid meet" />
              {sel && (
                <rect x={-3} y={-3} width={item.w + 6} height={item.h + 6} rx={8}
                  fill="none" stroke={ACCENT} strokeWidth={2} strokeDasharray="7 4" />
              )}
              {sel && (
                <g>
                  <g onClick={e => rotateItem(e, item)} onMouseDown={e => e.stopPropagation()}
                    style={{ cursor: "pointer" }}>
                    <circle cx={item.w} cy={0} r={14} fill={ACCENT} stroke="#fff" strokeWidth={1.5} />
                    <text x={item.w} y={4.5} textAnchor="middle" fontSize="14"
                      fill="#fff" style={{ pointerEvents: "none", userSelect: "none" }}>↻</text>
                  </g>
                  <g onClick={e => { e.stopPropagation(); removeItem(item.instanceId); }}
                    onMouseDown={e => e.stopPropagation()} style={{ cursor: "pointer" }}>
                    <circle cx={item.w} cy={item.h} r={14} fill={DANGER} stroke="#fff" strokeWidth={1.5} />
                    <text x={item.w} y={item.h + 4.5} textAnchor="middle" fontSize="12"
                      fill="#fff" style={{ pointerEvents: "none", userSelect: "none" }}>✕</text>
                  </g>
                </g>
              )}
            </g>
          );
        })}

        {/* Empty state */}
        {rooms.length === 0 && placedItems.length === 0 && (
          <g>
            <text x={size.w / 2} y={size.h / 2 - 24}
              textAnchor="middle" fontSize="44" opacity={0.10}>🏠</text>
            <text x={size.w / 2} y={size.h / 2 + 16}
              textAnchor="middle" fontSize="14" fill="rgba(0,0,0,0.18)"
              fontFamily="'Noto Sans KR', sans-serif" fontWeight="400">
              왼쪽 패널에서 벽 그리기를 시작하세요
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}