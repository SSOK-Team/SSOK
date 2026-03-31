import { useState } from "react";
import DraggableImage from "../components/Canvas/DraggableImage";
import FurnitureCanvas from "../components/Sidebar/FurnitureCanvas";
import "../index.css";

export default function App() {
  const [placedItems, setPlacedItems] = useState([]);
  const [roomSize, setRoomSize] = useState({ width: 500, height: 400 });
  const [scale, setScale] = useState(1);

  const addFurniture = (furniture) => {
    const newItem = {
      ...furniture,
      id: Date.now(),
      x: 100,
      y: 100,
      rotation: 0,
    };
    setPlacedItems((prev) => [...prev, newItem]);
  };

  const updateItem = (id, updates) => {
    setPlacedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeItem = (id) => {
    setPlacedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAll = () => setPlacedItems([]);

  return (
    <div className="app-wrapper">
      {/* ── Top Bar ── */}
      <header className="topbar">
        <div className="topbar-left">
          <span className="logo-text">SSOK</span>
          <span className="logo-sub">자취방 가구배치 시뮬레이터</span>
        </div>
        <div className="topbar-center">
          <span className="scale-info">비율 1m = {Math.round(56 * scale)}px</span>
        </div>
        <div className="topbar-right">
          <button className="btn-outline" onClick={() => setScale((s) => Math.min(s + 0.1, 2))}>
            + 확대
          </button>
          <button className="btn-outline" onClick={() => setScale((s) => Math.max(s - 0.1, 0.4))}>
            − 축소
          </button>
          <button className="btn-outline" onClick={clearAll}>
            전체 삭제
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <div className="main-layout">
        {/* Canvas area */}
        <div className="canvas-area">
          <DraggableImage
            placedItems={placedItems}
            updateItem={updateItem}
            removeItem={removeItem}
            roomSize={roomSize}
            scale={scale}
          />
        </div>

        {/* Right Sidebar */}
        <aside className="sidebar">
          <FurnitureCanvas onAdd={addFurniture} />
        </aside>
      </div>
    </div>
  );
}