import { useState, useCallback, useRef } from "react";
import DraggableImage from "./components/Canvas/DraggableImage";
import Topbar      from "./components/Layout/Topbar";
import LeftSidebar from "./components/Layout/LeftSidebar";
import RightPanel  from "./components/Layout/RightPanel";
import BottomBar   from "./components/Layout/BottomBar";
import "./index.css";

export default function App() {
  // ── 모드 / UI 상태 ──
  const [mode, setMode] = useState("select");
  const [showGrid, setShowGrid] = useState(true);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  // ── 도면 상태 ──
  const [walls, setWalls] = useState([]);
  const [vertices, setVertices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [drawingWall, setDrawingWall] = useState(null);

  // ── 가구 / 마감재 상태 ──
  const [furnitureList, setFurnitureList] = useState([]);
  const [placedItems, setPlacedItems] = useState([]);
  const [materialList, setMaterialList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [areaResult, setAreaResult] = useState(null);

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

  // ── 가구 핸들러 ──
  const handleFurnitureUpload = (e) => {
    Array.from(e.target.files).forEach((file) => {
      const url = URL.createObjectURL(file);
      setFurnitureList((prev) => [
        ...prev, { id: Date.now() + Math.random(), name: file.name, url, w: 100, h: 100 },
      ]);
    });
  };

  const handleMaterialUpload = (e) => {
    Array.from(e.target.files).forEach((file) => {
      const url = URL.createObjectURL(file);
      setMaterialList((prev) => [...prev, { id: Date.now() + Math.random(), name: file.name, url }]);
    });
  };

  const addFurnitureToCanvas = (furniture) => {
    saveHistory();
    setPlacedItems((prev) => [
      ...prev, { ...furniture, instanceId: Date.now(), x: 120, y: 120, rotation: 0 },
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

  const calcArea = () => {
    const totalArea     = rooms.reduce((s, r) => s + (r.area || 0), 0);
    const furnitureArea = placedItems.reduce((s, i) => s + (i.w * i.h) / 10000, 0);
    setAreaResult({
      total:     totalArea.toFixed(2),
      furniture: furnitureArea.toFixed(2),
      remaining: Math.max(0, totalArea - furnitureArea).toFixed(2),
    });
  };

  const selectedInfo = selectedItem
    ? placedItems.find((i) => i.instanceId === selectedItem.instanceId)
    : null;

  return (
    <div className="app-wrapper">
      <Topbar
        mode={mode}         setMode={setMode}
        showGrid={showGrid} setShowGrid={setShowGrid}
        onUndo={undo}       onRedo={redo}
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
        />

        <main className="canvas-area">
          <DraggableImage
            mode={mode}               showGrid={showGrid}
            walls={walls}             setWalls={setWalls}
            vertices={vertices}       setVertices={setVertices}
            rooms={rooms}             setRooms={setRooms}
            drawingWall={drawingWall} setDrawingWall={setDrawingWall}
            placedItems={placedItems}
            updateItem={updateItem}   removeItem={removeItem}
            selectedItem={selectedItem} setSelectedItem={setSelectedItem}
            saveHistory={saveHistory}
          />
        </main>

        <RightPanel
          rightOpen={rightOpen} setRightOpen={setRightOpen}
          selectedInfo={selectedInfo}
          updateItem={updateItem} removeItem={removeItem}
          rooms={rooms}
        />
      </div>

      <BottomBar
        leftOpen={leftOpen}
        rooms={rooms}
        areaResult={areaResult}
        calcArea={calcArea}
      />
    </div>
  );
}