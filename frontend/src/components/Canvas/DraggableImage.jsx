import { useRef, useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────
//  스케일 상수
//  1px = 10mm  →  100px = 1000mm = 1m
//  스냅 단위: 50mm (5px)
//  격자 소단위: 100mm (10px)
//  격자 대단위: 1000mm (100px) = 1m
// ─────────────────────────────────────────
const PX_PER_MM  = 0.1;   // 1px = 10mm
const MM_PER_PX  = 10;    // 1px당 mm
const SNAP_PX    = 5;     // 스냅 단위 (50mm)
const GRID_SM    = 10;    // 소격자 (100mm = 10cm)
const GRID_LG    = 100;   // 대격자 (1000mm = 1m)
const WALL_W     = 4;
const ACCENT     = "#059669";

// px → mm 변환
const pxToMm = (px) => Math.round(px * MM_PER_PX);
// mm → px 변환
const mmToPx = (mm) => mm * PX_PER_MM;

// mm 값을 보기 좋게 표시 (1000mm 이상이면 m 병기)
const formatMm = (mm) => {
  if (mm >= 1000) {
    return `${mm}mm (${(mm / 1000).toFixed(2).replace(/\.?0+$/, "")}m)`;
  }
  return `${mm}mm`;
};

// 짧은 라벨 (치수 라벨용)
const shortMm = (mm) => {
  if (mm >= 1000) return `${(mm / 1000).toFixed(1)}m`;
  return `${mm}mm`;
};

function snap(v) { return Math.round(v / SNAP_PX) * SNAP_PX; }

function polyArea(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    a += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  // px² → mm² → m²
  const areaPx2 = Math.abs(a / 2);
  return areaPx2 * (MM_PER_PX * MM_PER_PX) / 1_000_000; // m²
}

function near(ax, ay, bx, by, r = 18) {
  return Math.hypot(ax - bx, ay - by) < r;
}

// 벽 길이 (mm)
function wallLenMm(w) {
  return pxToMm(Math.hypot(w.x2 - w.x1, w.y2 - w.y1));
}

export default function DraggableImage({
  mode, showGrid,
  walls, setWalls, vertices, setVertices,
  rooms, setRooms, drawingWall, setDrawingWall,
  placedItems, updateItem, removeItem,
  selectedItem, setSelectedItem,
  saveHistory,
  isLocked,
  onContextMenu,
  bgImage, bgOpacity,
  materials,
  svgRef,
}) {
  const containerRef     = useRef(null);
  const internalSvgRef   = useRef(null);
  const [size, setSize]  = useState({ w: 800, h: 600 });
  const [mouse, setMouse]= useState({ x: 0, y: 0 });
  const [wPts, setWPts]  = useState([]);
  const dragItem         = useRef(null);
  const dragVertex       = useRef(null);
  const [selVtx, setSelVtx]         = useState(null);
  const [editingWall, setEditingWall] = useState(null);
  const editInputRef     = useRef(null);

  // ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setSize({ w: Math.max(500, width), h: Math.max(380, height) });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // 편집 input 포커스
  useEffect(() => {
    if (editingWall && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingWall]);

  // svgRef 외부 공유
  useEffect(() => {
    if (svgRef) svgRef.current = internalSvgRef.current;
  }, [svgRef]);

  const getSvg = () => svgRef?.current ?? internalSvgRef.current;

  const toSVG = (e) => {
    const svg = getSvg();
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const s = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: snap(s.x), y: snap(s.y) };
  };

  // ── 벽 클릭 ──
  const handleClick = (e) => {
    if (mode !== "wall") return;
    if (e.target.closest(".fg")) return;
    const pos = toSVG(e);

    if (wPts.length >= 3 && near(pos.x, pos.y, wPts[0].x, wPts[0].y)) {
      const newRoom  = { id: Date.now(), points: wPts, area: polyArea(wPts) };
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
      if (prev.length > 0)
        setDrawingWall({ x1: prev.at(-1).x, y1: prev.at(-1).y, x2: pos.x, y2: pos.y });
      return [...prev, pt];
    });
  };

  // ── 치수 라벨 더블클릭 편집 ──
  const handleLabelDblClick = (e, wall) => {
    e.stopPropagation();
    // 편집값은 mm 단위로
    setEditingWall({ wallId: wall.id, valueMm: String(wallLenMm(wall)) });
  };

  const commitWallEdit = (wall, newMm) => {
    const mm = parseInt(newMm, 10);
    if (!mm || mm <= 0) { setEditingWall(null); return; }
    const newPx = mmToPx(mm);
    const dx = wall.x2 - wall.x1;
    const dy = wall.y2 - wall.y1;
    const orig = Math.hypot(dx, dy);
    if (orig === 0) { setEditingWall(null); return; }
    const ratio = newPx / orig;
    const newX2 = snap(wall.x1 + dx * ratio);
    const newY2 = snap(wall.y1 + dy * ratio);
    const v2id  = wall.v2;

    setWalls(ws => ws.map(w => {
      if (w.id === wall.id) return { ...w, x2: newX2, y2: newY2 };
      if (w.v1 === v2id)    return { ...w, x1: newX2, y1: newY2 };
      if (w.v2 === v2id)    return { ...w, x2: newX2, y2: newY2 };
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

  // ── 마우스 이동 ──
  const handleMouseMove = useCallback((e) => {
    const svg = getSvg();
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const s       = pt.matrixTransform(svg.getScreenCTM().inverse());
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
    if (isLocked?.(item.instanceId)) return;
    e.stopPropagation();
    const svg = getSvg();
    const pt  = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const s = pt.matrixTransform(svg.getScreenCTM().inverse());
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

  // ── 바닥재 렌더 ──
  const renderRoomFill = (room) => {
    const floorMat = materials?.floor;
    if (!floorMat) {
      return <polygon key={`rf${room.id}`}
        points={room.points.map(p => `${p.x},${p.y}`).join(" ")}
        fill="rgba(5,150,105,0.04)" stroke={ACCENT}
        strokeWidth={1} strokeDasharray="6 3" opacity={0.5} />;
    }
    if (floorMat.kind === "color") {
      return <polygon key={`rf${room.id}`}
        points={room.points.map(p => `${p.x},${p.y}`).join(" ")}
        fill={floorMat.data} stroke={ACCENT} strokeWidth={1} />;
    }
    const patId = `floor-pat-${room.id}`;
    return (
      <g key={`rf${room.id}`}>
        <defs>
          <pattern id={patId} patternUnits="userSpaceOnUse" width={120} height={120}>
            <image href={floorMat.data} x={0} y={0} width={120} height={120}
              preserveAspectRatio="xMidYMid slice" />
          </pattern>
        </defs>
        <polygon points={room.points.map(p => `${p.x},${p.y}`).join(" ")}
          fill={`url(#${patId})`} stroke={ACCENT} strokeWidth={1} />
      </g>
    );
  };

  // ── 격자 ──
  const gridLines = [];
  if (showGrid) {
    for (let x = 0; x <= size.w; x += GRID_SM) {
      const isMajor = x % GRID_LG === 0;
      gridLines.push(<line key={`gv${x}`} x1={x} y1={0} x2={x} y2={size.h}
        stroke={isMajor ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.05)"}
        strokeWidth={isMajor ? 0.8 : 0.4} />);
    }
    for (let y = 0; y <= size.h; y += GRID_SM) {
      const isMajor = y % GRID_LG === 0;
      gridLines.push(<line key={`gh${y}`} x1={0} y1={y} x2={size.w} y2={y}
        stroke={isMajor ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.05)"}
        strokeWidth={isMajor ? 0.8 : 0.4} />);
    }
  }

  // 캔버스 배경색
  const canvasBg = materials?.wall?.kind === "color" ? materials.wall.data : "#ffffff";

  // 마우스 좌표 mm 변환
  const mouseMm = { x: pxToMm(mouse.x), y: pxToMm(mouse.y) };

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <svg
        ref={internalSvgRef}
        width={size.w} height={size.h}
        onClick={handleClick}
        style={{ cursor: mode === "wall" ? "crosshair" : "default", display: "block", background: canvasBg }}
      >
        {/* 13번: 밑그림 */}
        {bgImage && (
          <image href={bgImage} x={0} y={0} width={size.w} height={size.h}
            preserveAspectRatio="xMidYMid meet"
            opacity={bgOpacity} style={{ pointerEvents: "none" }} />
        )}

        {/* 격자 */}
        {gridLines}

        {/* 격자 스케일 표시 (좌상단) */}
        {showGrid && (
          <g>
            <rect x={8} y={8} width={80} height={18} rx={4}
              fill="rgba(255,255,255,0.85)" stroke="rgba(0,0,0,0.08)" strokeWidth={0.8} />
            <text x={12} y={21} fontSize="9" fill="#888"
              fontFamily="'Noto Sans KR', sans-serif">
              격자 1칸 = 100mm
            </text>
          </g>
        )}

        {/* 2번: 방 바닥재 */}
        {rooms.map(renderRoomFill)}

        {/* 완성된 벽 */}
        {walls.map(w => (
          <line key={`wall${w.id}`}
            x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2}
            stroke="#111" strokeWidth={WALL_W} strokeLinecap="round" />
        ))}

        {/* 벽 치수 라벨 (mm 단위) */}
        {walls.map(w => {
          const mx = (w.x1 + w.x2) / 2;
          const my = (w.y1 + w.y2) / 2;
          const lenMm = wallLenMm(w);
          const label = shortMm(lenMm);
          const isEditing = editingWall?.wallId === w.id;
          const labelW = label.length > 6 ? 64 : 52;
          const labelH = 22;

          return (
            <g key={`lbl${w.id}`}>
              {isEditing ? (
                <foreignObject x={mx - 36} y={my - labelH / 2} width={72} height={labelH}
                  style={{ overflow: "visible" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <input
                      ref={editInputRef}
                      type="number"
                      value={editingWall.valueMm}
                      onChange={e => setEditingWall(v => ({ ...v, valueMm: e.target.value }))}
                      onBlur={() => commitWallEdit(w, editingWall.valueMm)}
                      onKeyDown={e => {
                        if (e.key === "Enter")  commitWallEdit(w, editingWall.valueMm);
                        if (e.key === "Escape") setEditingWall(null);
                      }}
                      style={{
                        width: 60, height: labelH, fontSize: 11,
                        fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 600,
                        textAlign: "right", border: `1.5px solid ${ACCENT}`,
                        borderRadius: "6px 0 0 6px", background: "#fff", color: "#111",
                        outline: "none", padding: "0 4px",
                      }}
                    />
                    <span style={{
                      height: labelH, lineHeight: `${labelH}px`,
                      padding: "0 5px", background: ACCENT, color: "#fff",
                      fontSize: 10, fontWeight: 700, borderRadius: "0 6px 6px 0",
                      whiteSpace: "nowrap",
                    }}>mm</span>
                  </div>
                </foreignObject>
              ) : (
                <g onDoubleClick={e => handleLabelDblClick(e, w)} style={{ cursor: "text" }}>
                  <rect x={mx - labelW / 2} y={my - labelH / 2}
                    width={labelW} height={labelH} rx={6}
                    fill="rgba(255,255,255,0.95)" stroke="rgba(0,0,0,0.08)" strokeWidth={0.8} />
                  <text x={mx} y={my + 4} fontSize="10" fill="#444"
                    textAnchor="middle" fontFamily="'Noto Sans KR', sans-serif" fontWeight="600">
                    {label}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* 그리는 중 - 이전 선분 */}
        {mode === "wall" && wPts.length > 1 && wPts.slice(0, -1).map((p, i) => (
          <line key={`dprev${i}`}
            x1={p.x} y1={p.y} x2={wPts[i + 1].x} y2={wPts[i + 1].y}
            stroke="#111" strokeWidth={WALL_W} strokeLinecap="round" />
        ))}

        {/* 그리는 중 - 커서 선 + 실시간 치수 */}
        {mode === "wall" && wPts.length > 0 && drawingWall && (() => {
          const lenMm = pxToMm(Math.hypot(
            drawingWall.x2 - drawingWall.x1,
            drawingWall.y2 - drawingWall.y1
          ));
          const label = shortMm(lenMm);
          const lw = Math.max(48, label.length * 7);
          return (
            <>
              <line
                x1={drawingWall.x1} y1={drawingWall.y1}
                x2={drawingWall.x2} y2={drawingWall.y2}
                stroke={ACCENT} strokeWidth={WALL_W}
                strokeDasharray="10 5" strokeLinecap="round" opacity={0.7}
              />
              <rect
                x={(drawingWall.x1 + drawingWall.x2) / 2 - lw / 2}
                y={(drawingWall.y1 + drawingWall.y2) / 2 - 11}
                width={lw} height={18} rx={6}
                fill="rgba(5,150,105,0.9)"
              />
              <text
                x={(drawingWall.x1 + drawingWall.x2) / 2}
                y={(drawingWall.y1 + drawingWall.y2) / 2 + 2}
                fontSize="10" fill="#fff" textAnchor="middle"
                fontFamily="'Noto Sans KR', sans-serif" fontWeight="700">
                {label}
              </text>
            </>
          );
        })()}

        {/* 그리는 중 꼭짓점 */}
        {mode === "wall" && wPts.map((p, i) => (
          <g key={p.id}>
            {i === 0 && wPts.length >= 3 && (
              <circle cx={p.x} cy={p.y} r={20}
                fill="none" stroke={ACCENT} strokeWidth={1.5}
                strokeDasharray="4 3" opacity={0.6} />
            )}
            <circle cx={p.x} cy={p.y} r={i === 0 ? 7 : 4.5}
              fill={ACCENT} stroke="#fff" strokeWidth={2} />
          </g>
        ))}

        {/* 완성된 꼭짓점 (드래그) */}
        {vertices.map(v => (
          <circle key={v.id} cx={v.x} cy={v.y} r={5}
            fill={selVtx === v.id ? ACCENT : "#fff"}
            stroke={ACCENT} strokeWidth={2} style={{ cursor: "grab" }}
            onMouseDown={e => startDragVertex(e, v)}
          />
        ))}

        {/* 커서 좌표 (mm 단위로 표시) */}
        {mode === "wall" && (
          <g>
            <rect x={mouse.x + 14} y={mouse.y - 26} width={96} height={20} rx={6}
              fill="rgba(17,17,17,0.80)" />
            <text x={mouse.x + 62} y={mouse.y - 12} fontSize="9.5"
              fill="rgba(255,255,255,0.92)" textAnchor="middle"
              fontFamily="'Noto Sans KR', sans-serif">
              {mouseMm.x}mm, {mouseMm.y}mm
            </text>
          </g>
        )}

        {/* 배치된 가구 */}
        {placedItems.map(item => {
          const sel    = selectedItem?.instanceId === item.instanceId;
          const locked = isLocked?.(item.instanceId);
          return (
            <g key={item.instanceId} className="fg"
              transform={`translate(${item.x},${item.y}) rotate(${item.rotation || 0},${item.w / 2},${item.h / 2})`}
              onMouseDown={e => startDragItem(e, item)}
              onClick={e => { e.stopPropagation(); setSelectedItem(item); }}
              onContextMenu={e => onContextMenu?.(e, item)}
              style={{ cursor: locked ? "not-allowed" : (mode === "select" ? "grab" : "default") }}
            >
              <rect x={3} y={4} width={item.w} height={item.h} rx={4} fill="rgba(0,0,0,0.08)" />
              <image href={item.url} x={0} y={0} width={item.w} height={item.h}
                preserveAspectRatio="xMidYMid meet" />

              {/* 6번: 색상 tint */}
              {item.colorTint && (
                <rect x={0} y={0} width={item.w} height={item.h} rx={4}
                  fill={item.colorTint} opacity={0.35} style={{ pointerEvents: "none" }} />
              )}

              {/* 5번: 잠금 표시 */}
              {locked && (
                <text x={item.w / 2} y={item.h / 2 + 5}
                  textAnchor="middle" fontSize="18"
                  style={{ pointerEvents: "none", userSelect: "none" }}>🔒</text>
              )}

              {/* 선택 테두리 */}
              {sel && (
                <rect x={-3} y={-3} width={item.w + 6} height={item.h + 6} rx={8}
                  fill="none" stroke={ACCENT} strokeWidth={2} strokeDasharray="7 4" />
              )}

              {/* 가구 크기 표시 (선택 시) — mm 단위 */}
              {sel && (
                <g>
                  <rect x={0} y={item.h + 6} width={item.w} height={16} rx={4}
                    fill="rgba(5,150,105,0.85)" />
                  <text x={item.w / 2} y={item.h + 17}
                    textAnchor="middle" fontSize="9" fill="#fff"
                    fontFamily="'Noto Sans KR', sans-serif" fontWeight="600">
                    {pxToMm(item.w)}×{pxToMm(item.h)}mm
                  </text>
                </g>
              )}

              {/* 선택 시 회전/삭제 버튼 */}
              {sel && !locked && (
                <g>
                  <g onClick={e => rotateItem(e, item)}
                    onMouseDown={e => e.stopPropagation()} style={{ cursor: "pointer" }}>
                    <circle cx={item.w} cy={0} r={14} fill={ACCENT} stroke="#fff" strokeWidth={1.5} />
                    <text x={item.w} y={4.5} textAnchor="middle" fontSize="14"
                      fill="#fff" style={{ pointerEvents: "none", userSelect: "none" }}>↻</text>
                  </g>
                  <g onClick={e => { e.stopPropagation(); removeItem(item.instanceId); }}
                    onMouseDown={e => e.stopPropagation()} style={{ cursor: "pointer" }}>
                    <circle cx={item.w} cy={item.h} r={14} fill="#ef4444" stroke="#fff" strokeWidth={1.5} />
                    <text x={item.w} y={item.h + 4.5} textAnchor="middle" fontSize="12"
                      fill="#fff" style={{ pointerEvents: "none", userSelect: "none" }}>✕</text>
                  </g>
                </g>
              )}
            </g>
          );
        })}

        {/* 빈 상태 */}
        {rooms.length === 0 && placedItems.length === 0 && !bgImage && (
          <g>
            <text x={size.w / 2} y={size.h / 2 - 24}
              textAnchor="middle" fontSize="44" opacity={0.10}>🏠</text>
            <text x={size.w / 2} y={size.h / 2 + 12}
              textAnchor="middle" fontSize="14" fill="rgba(0,0,0,0.18)"
              fontFamily="'Noto Sans KR', sans-serif">
              왼쪽 패널에서 벽 그리기를 시작하세요
            </text>
            <text x={size.w / 2} y={size.h / 2 + 30}
              textAnchor="middle" fontSize="11" fill="rgba(0,0,0,0.12)"
              fontFamily="'Noto Sans KR', sans-serif">
              스냅 단위: 50mm · 격자 1칸: 100mm · 대격자: 1m
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}