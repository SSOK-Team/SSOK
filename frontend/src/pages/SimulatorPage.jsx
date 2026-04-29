import { useState, useCallback, useRef } from "react";
import DraggableImage       from "../components/Canvas/DraggableImage";
import RoomCanvas3D         from "../components/Canvas/RoomCanvas3D";
import LeftSidebar          from "../components/Layout/LeftSidebar";
import RightPanel           from "../components/Layout/RightPanel";
import BottomBar            from "../components/Layout/BottomBar";
import Topbar               from "../components/Layout/Topbar";
import ContextMenu          from "../components/ContextMenu/ContextMenu";
import { useFurnitureLock } from "../hooks/useFurnitureLock";
import { useContextMenu }   from "../hooks/useContextMenu";
import "../index.css";

const MAX_PX = 200;
const MIN_PX = 30;

export default function SimulatorPage() {
  // ── 모드 / UI ──
  const [mode, setMode]           = useState("select");
  const [showGrid, setShowGrid]   = useState(true);
  const [leftOpen, setLeftOpen]   = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [is3D, setIs3D]           = useState(false);
  const [scale, setScale]         = useState(1);

  // ── 공간 설정 ──
  const [spaceConfig, setSpaceConfig] = useState({
    name:          "자취방",
    wallThickness: 200,
    roomHeight:    2300,
  });

  // ── 도면 상태 ──
  const [walls, setWalls]             = useState([]);
  const [vertices, setVertices]       = useState([]);
  const [rooms, setRooms]             = useState([]);
  const [drawingWall, setDrawingWall] = useState(null);

  // ── 가구 / 마감재 ──
  const [furnitureList, setFurnitureList] = useState([]);
  const [placedItems, setPlacedItems]     = useState([]);
  const [materialList, setMaterialList]   = useState([]);
  const [selectedItem, setSelectedItem]   = useState(null);
  const [selectedIds, setSelectedIds]     = useState(new Set());
  const [areaResult, setAreaResult]       = useState(null);

  // ── 벽지/바닥재 ──
  const [materials, setMaterials] = useState({ wall: null, floor: null, ceiling: null });

  // ── 도면 밑그림 ──
  const [bgImage, setBgImage]     = useState(null);
  const [bgOpacity, setBgOpacity] = useState(0.3);

  // ── SVG ref ──
  const svgRef = useRef(null);

  // ── 잠금 / 우클릭 메뉴 ──
  const { toggleLock, isLocked }     = useFurnitureLock();
  const { menu, openMenu, closeMenu } = useContextMenu();

  // ── 히스토리 ──
  const historyRef = useRef([]);
  const futureRef  = useRef([]);

  const saveHistory = useCallback(() => {
    historyRef.current.push({ walls, vertices, rooms, placedItems });
    futureRef.current = [];
  }, [walls, vertices, rooms, placedItems]);

  const undo = () => {
    if (!historyRef.current.length) return;
    futureRef.current.push({ walls, vertices, rooms, placedItems });
    const prev = historyRef.current.pop();
    setWalls(prev.walls); setVertices(prev.vertices);
    setRooms(prev.rooms); setPlacedItems(prev.placedItems);
  };

  const redo = () => {
    if (!futureRef.current.length) return;
    historyRef.current.push({ walls, vertices, rooms, placedItems });
    const next = futureRef.current.pop();
    setWalls(next.walls); setVertices(next.vertices);
    setRooms(next.rooms); setPlacedItems(next.placedItems);
  };

  // ── 가구 업로드 (비율 자동 감지) ──
  const handleFurnitureUpload = (e) => {
    Array.from(e.target.files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        const ratio = img.naturalWidth / img.naturalHeight;
        let w, h;
        if (ratio >= 1) { w = MAX_PX; h = Math.round(MAX_PX / ratio); }
        else             { h = MAX_PX; w = Math.round(MAX_PX * ratio); }
        w = Math.max(w, MIN_PX);
        h = Math.max(h, MIN_PX);
        setFurnitureList((prev) => [
          ...prev,
          { id: Date.now() + Math.random(), name: file.name, url, w, h,
            naturalW: img.naturalWidth, naturalH: img.naturalHeight },
        ]);
      };
      img.src = url;
    });
  };

  const handleMaterialUpload = (e) => {
    Array.from(e.target.files).forEach((file) => {
      const url = URL.createObjectURL(file);
      setMaterialList((prev) => [...prev, { id: Date.now() + Math.random(), name: file.name, url }]);
    });
  };

  // ── 가구 조작 ──
  const addFurnitureToCanvas = (furniture) => {
    saveHistory();
    setPlacedItems((prev) => [
      ...prev,
      { ...furniture, instanceId: Date.now(), x: 120, y: 120, rotation: 0, colorTint: null,
        w: furniture.w || 100, h: furniture.h || 100 },
    ]);
  };

  const updateItem = (instanceId, updates) =>
    setPlacedItems((prev) =>
      prev.map((item) => item.instanceId === instanceId ? { ...item, ...updates } : item)
    );

  const removeItem = (instanceId) => {
    saveHistory();
    setPlacedItems((prev) => prev.filter((item) => item.instanceId !== instanceId));
    if (selectedItem?.instanceId === instanceId) setSelectedItem(null);
  };

  const duplicateItem = (item) => {
    saveHistory();
    setPlacedItems((prev) => [
      ...prev,
      { ...item, instanceId: Date.now(), x: item.x + 20, y: item.y + 20 },
    ]);
  };

  const clearAll = () => {
    saveHistory();
    setPlacedItems([]);
  };

  // ── 면적 계산 ──
  const calcArea = () => {
    const totalArea     = rooms.reduce((s, r) => s + (r.area || 0), 0);
    const furnitureArea = placedItems.reduce((s, i) => s + ((i.w || 0) * (i.h || 0)) / 10000, 0);
    setAreaResult({
      total:     totalArea.toFixed(2),
      furniture: furnitureArea.toFixed(2),
      remaining: Math.max(0, totalArea - furnitureArea).toFixed(2),
    });
  };

  const selectedInfo = selectedItem
    ? placedItems.find((i) => i.instanceId === selectedItem?.instanceId ?? selectedItem)
    : null;

  return (
    <div className="app-wrapper">
      <Topbar
        mode={mode}         setMode={setMode}
        showGrid={showGrid} setShowGrid={setShowGrid}
        onUndo={undo}       onRedo={redo}
        svgRef={svgRef}
      />

      <div className="body-layout">
        <LeftSidebar
          leftOpen={leftOpen}   setLeftOpen={setLeftOpen}
          mode={mode}           setMode={setMode}
          rooms={rooms}
          furnitureList={furnitureList}
          handleFurnitureUpload={handleFurnitureUpload}
          addFurnitureToCanvas={addFurnitureToCanvas}
          materialList={materialList}
          handleMaterialUpload={handleMaterialUpload}
          materials={materials}
          onMaterialApply={(type, val) => setMaterials((prev) => ({ ...prev, [type]: val }))}
          bgImage={bgImage}     bgOpacity={bgOpacity}
          onBgLoad={setBgImage} onBgOpacity={setBgOpacity}
          onBgClear={() => setBgImage(null)}
          onAddDoorWindow={addFurnitureToCanvas}
        />

        <div className="canvas-area">
          {is3D
            ? <RoomCanvas3D
                placedItems={placedItems}
                updateItem={updateItem}
                removeItem={removeItem}
                roomSize={{ width: 500, height: 400 }}
                walls={walls}
                rooms={rooms}
              />
            : <DraggableImage
                mode={mode}               showGrid={showGrid}
                walls={walls}             setWalls={setWalls}
                vertices={vertices}       setVertices={setVertices}
                rooms={rooms}             setRooms={setRooms}
                drawingWall={drawingWall} setDrawingWall={setDrawingWall}
                placedItems={placedItems}
                updateItem={updateItem}   removeItem={removeItem}
                selectedItem={selectedItem} setSelectedItem={setSelectedItem}
                saveHistory={saveHistory}
                isLocked={isLocked}
                onContextMenu={openMenu}
                bgImage={bgImage}         bgOpacity={bgOpacity}
                materials={materials}
                svgRef={svgRef}
              />
          }
        </div>

        <RightPanel
          rightOpen={rightOpen}   setRightOpen={setRightOpen}
          selectedInfo={selectedInfo}
          updateItem={updateItem} removeItem={removeItem}
          rooms={rooms}
          isLocked={isLocked}     onToggleLock={toggleLock}
          selectedIds={selectedIds}
          placedItems={placedItems}
          spaceConfig={spaceConfig}
          setSpaceConfig={setSpaceConfig}
        />
      </div>

      <BottomBar
        leftOpen={leftOpen}
        rooms={rooms}
        areaResult={areaResult}
        calcArea={calcArea}
        is3D={is3D}
        setIs3D={setIs3D}
      />

      <ContextMenu
        menu={menu}
        onClose={closeMenu}
        onDelete={removeItem}
        onDuplicate={duplicateItem}
        onLock={toggleLock}
        isLocked={menu?.item ? isLocked(menu.item.instanceId) : false}
      />
    </div>
  );
}