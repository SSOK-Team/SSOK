import { useState } from "react";
import DraggableImage from "../components/Canvas/DraggableImage";
import LeftSidebar from "../components/Layout/LeftSidebar";
import RightPanel from "../components/Layout/RightPanel";
import BottomBar from "../components/Layout/BottomBar"
import Topbar from "../components/Layout/Topbar"

import "../index.css";

export default function SimulatorPage() {
  const [placedItems, setPlacedItems] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [walls, setWalls] = useState([]);
  const [vertices, setVertices] = useState([]);
  const [drawingWall, setDrawingWall] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mode, setMode] = useState('select');
  const [showGrid, setShowGrid] = useState(true);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [furnitureList, setFurnitureList] = useState([]);
  const [materialList, setMaterialList] = useState([]);
  const [scale, setScale] = useState(1);
  const [areaResult, setAreaResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const saveHistory = () => {};

  const onUndo = () => {};
  const onRedo = () => {};

  const handleFurnitureUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setFurnitureList(prev => [...prev, { id: Date.now() + Math.random(), name: file.name, url }]);
    });
  };

  const handleMaterialUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setMaterialList(prev => [...prev, { id: Date.now() + Math.random(), name: file.name, url }]);
    });
  };

  const addFurnitureToCanvas = (f) => {
    setPlacedItems(prev => [...prev, {
      ...f,
      instanceId: Date.now(),
      x: 100, y: 100, rotation: 0,
      w: f.w || 100, h: f.h || 100,
    }]);
  };

  const updateItem = (id, updates) => {
    setPlacedItems(prev =>
      prev.map(item => (item.instanceId === id ? { ...item, ...updates } : item))
    );
  };

  const removeItem = (id) => {
    setPlacedItems(prev => prev.filter(item => item.instanceId !== id));
    setSelectedItem(null);
  };

  const clearAll = () => setPlacedItems([]);

  const calcArea = () => {
  const totalArea = rooms.reduce((s, r) => s + (r.area || 0), 0)
  const furnitureArea = placedItems.reduce((s, item) => {
    return s + ((item.w || 0) * (item.h || 0)) / 10000
  }, 0)
  setAreaResult({
    total: totalArea.toFixed(2),
    furniture: furnitureArea.toFixed(2),
    remaining: (totalArea - furnitureArea).toFixed(2)
  })
}

  const selectedInfo = selectedItem
    ? placedItems.find(i => i.instanceId === selectedItem)
    : null;

  return (
    <div className="app-wrapper">
       <Topbar
  mode={mode}
  setMode={setMode}
  showGrid={showGrid}
  setShowGrid={setShowGrid}
  onUndo={onUndo}
  onRedo={onRedo}
/>
      <div className="body-layout">
        <LeftSidebar
          leftOpen={leftOpen}
          setLeftOpen={setLeftOpen}
          mode={mode}
          setMode={setMode}
          rooms={rooms}
          furnitureList={furnitureList}
          handleFurnitureUpload={handleFurnitureUpload}
          addFurnitureToCanvas={addFurnitureToCanvas}
          materialList={materialList}
          handleMaterialUpload={handleMaterialUpload}
        />
        <div className="canvas-area">
          <DraggableImage
            mode={mode}
            showGrid={showGrid}
            walls={walls}
            setWalls={setWalls}
            vertices={vertices}
            setVertices={setVertices}
            rooms={rooms}
            setRooms={setRooms}
            drawingWall={drawingWall}
            setDrawingWall={setDrawingWall}
            placedItems={placedItems}
            updateItem={updateItem}
            removeItem={removeItem}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            saveHistory={saveHistory}
          />
        </div>
        <RightPanel
          rightOpen={rightOpen}
          setRightOpen={setRightOpen}
          selectedInfo={selectedInfo}
          updateItem={updateItem}
          removeItem={removeItem}
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