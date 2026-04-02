import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState } from "react";
import Floor from "../3D/Floor";
import Wall from "../3D/Wall";
import FurnitureBox from "../3D/FurnitureBox";

export default function RoomCanvas3D({ placedItems, updateItem, removeItem, roomSize }) {
  const [selectedId, setSelectedId] = useState(null);

  const scale = 0.01;
  const W = roomSize.width * scale;
  const H = roomSize.height * scale;
  const wallH = 2.5;
  const wallT = 0.1;

  const handleSelect = (id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <div style={{ width: "100%", height: "600px", borderRadius: "10px", overflow: "hidden" }}>
      <Canvas
        shadows
        camera={{ position: [0, 4, 6], fov: 50 }}
        style={{ background: "#f0ede8" }}
        onClick={() => setSelectedId(null)}
      >
        {/* 조명 */}
        <ambientLight intensity={1} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />

        {/* 바닥 */}
        <Floor width={W} height={H} />

        {/* 벽 4개 */}
        <Wall width={W} height={wallH} depth={wallT} position={[0, wallH/2, -H/2]} rotation={[0,0,0]} />
        <Wall width={W} height={wallH} depth={wallT} position={[0, wallH/2,  H/2]} rotation={[0,0,0]} />
        <Wall width={wallT} height={wallH} depth={H} position={[-W/2, wallH/2, 0]} rotation={[0,0,0]} />
        <Wall width={wallT} height={wallH} depth={H} position={[ W/2, wallH/2, 0]} rotation={[0,0,0]} />

        {/* 가구 */}
        {placedItems.map((item) => (
          <FurnitureBox
            key={item.id}
            item={item}
            roomWidth={roomSize.width}
            roomHeight={roomSize.height}
            isSelected={item.id === selectedId}
            onSelect={handleSelect}
            onRemove={removeItem}
          />
        ))}

        {/* 시점 회전/줌 */}
        <OrbitControls makeDefault />
      </Canvas>

      {/* 선택된 가구 삭제 버튼 */}
      {selectedId && (
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <button
            className="btn-outline"
            style={{ color: "var(--danger)" }}
            onClick={() => { removeItem(selectedId); setSelectedId(null); }}
          >
            ✕ 가구 삭제
          </button>
        </div>
      )}
    </div>
  );
}