// import { Canvas } from "@react-three/fiber";
// import { OrbitControls } from "@react-three/drei";
// import { useState, useMemo } from "react";
// import * as THREE from "three";
// import FurnitureBox from "../3D/FurnitureBox";

// export default function RoomCanvas3D({ placedItems, removeItem, roomSize, walls, rooms, materials }) {
//   const [selectedId, setSelectedId] = useState(null);

//   const SCALE = 0.01;
//   const wallH = 2.5;
//   const wallT = 0.1;

//   const handleSelect = (id) => {
//     setSelectedId((prev) => (prev === id ? null : id));
//   };

//   const { walls3D, floors, cx, cy } = useMemo(() => {
//     if (!walls || walls.length === 0) return { walls3D: [], floors: [], cx: 0, cy: 0 };

//     // 전체 좌표 기준점
//     const allX = walls.flatMap(w => [w.x1, w.x2]);
//     const allY = walls.flatMap(w => [w.y1, w.y2]);
//     const cx = (Math.min(...allX) + Math.max(...allX)) / 2;
//     const cy = (Math.min(...allY) + Math.max(...allY)) / 2;

//     // 벽 3D 변환
//     const walls3D = walls.map(wall => {
//       const x1 = (wall.x1 - cx) * SCALE;
//       const z1 = (wall.y1 - cy) * SCALE;
//       const x2 = (wall.x2 - cx) * SCALE;
//       const z2 = (wall.y2 - cy) * SCALE;
//       const length = Math.sqrt((x2-x1)**2 + (z2-z1)**2);
//       const angle = Math.atan2(z2-z1, x2-x1);
//       return { cx: (x1+x2)/2, cz: (z1+z2)/2, length, angle };
//     });

//     // 각 room별로 바닥 Shape 생성 (각각 자기 중심 기준)
//     const floors = (rooms || []).map(room => {
//       if (!room.points || room.points.length === 0) return null;
//       const points = room.points.map(p => new THREE.Vector2(
//         (p.x - cx) * SCALE,
//         -(p.y - cy) * SCALE
//       ));
//       return new THREE.Shape(points);
//     }).filter(Boolean);

//     if (floors.length === 0) {
//       const points = walls.map(w => new THREE.Vector2(
//         (w.x1 - cx) * SCALE,
//         -(w.y1 - cy) * SCALE
//       ));
//       floors.push(new THREE.Shape(points));
//     }

//     return { walls3D, floors, cx, cy };
//   }, [walls, rooms]);

//   const hasWalls = walls && walls.length > 0;

//   return (
//     <div style={{ width: "100%", height: "600px", borderRadius: "10px", overflow: "hidden" }}>
//       {!hasWalls ? (
//         <div style={{
//           width: "100%", height: "100%",
//           display: "flex", alignItems: "center", justifyContent: "center",
//           background: "#f0ede8", flexDirection: "column", gap: 12,
//           color: "#888", fontSize: 16,
//         }}>
//           <span style={{ fontSize: 48 }}>✏️</span>
//           <span>2D에서 먼저 방을 그려주세요</span>
//         </div>
//       ) : (
//         <Canvas
//           shadows
//           camera={{ position: [0, 4, 6], fov: 50 }}
//           style={{ background: "#f0ede8" }}
//           onClick={() => setSelectedId(null)}
//         >
//           <ambientLight intensity={1} />
//           <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />

//           {/* 바닥 */}
//           {floors.map((shape, i) => (
//             <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
//               <shapeGeometry args={[shape]} />
//               <meshStandardMaterial 
//                 color={materials?.floor?.kind === "color" ? materials.floor.data : "#d4c5a9"} 
//                 side={THREE.DoubleSide} 
//               />
//             </mesh>
//           ))}

//           {/* 벽 */}
//           {walls3D.map((w, i) => (
//             <mesh key={i} position={[w.cx, wallH / 2, w.cz]} rotation={[0, -w.angle, 0]}>
//               <boxGeometry args={[w.length, wallH, wallT]} />
//               <meshStandardMaterial 
//                 color={materials?.wall?.kind === "color" ? materials.wall.data : "#e8e0d5"} 
//               />
//             </mesh>
//           ))}

//           {/* 가구 - 2D 좌표를 3D로 변환 */}
//           {placedItems.map((item) => {
//             const x = (item.x - cx) * SCALE;
//             const z = (item.y - cy) * SCALE;
//             const w = (item.w || 100) * SCALE;
//             const h = (item.h || 100) * SCALE;
//             const isSelected = item.instanceId === selectedId;

//             return (
//               <mesh
//                 key={item.instanceId}
//                 position={[x + w/2, 0.4, z + h/2]}
//                 rotation={[0, -(item.rotation || 0) * Math.PI / 180, 0]}
//                 onClick={(e) => { e.stopPropagation(); handleSelect(item.instanceId); }}
//               >
//                 <boxGeometry args={[w, 0.8, h]} />
//                 <meshStandardMaterial color={isSelected ? "#4a7c6f" : "#c8a96e"} />
//               </mesh>
//             );
//           })}

//           <OrbitControls makeDefault />
//         </Canvas>
//       )}

//       {selectedId && (
//         <div style={{ textAlign: "center", marginTop: 8 }}>
//           <button
//             className="btn-outline"
//             style={{ color: "var(--danger)" }}
//             onClick={() => { removeItem(selectedId); setSelectedId(null); }}
//           >
//             ✕ 가구 삭제
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState, useMemo } from "react";
import * as THREE from "three";

export default function RoomCanvas3D({ placedItems, removeItem, roomSize, walls, rooms, materials, roomMaterials, setSelectedRoomIdx, selectedRoomIdx }) {
  const [selectedId, setSelectedId] = useState(null);

  const SCALE = 0.01;
  const wallH = 2.5;
  const wallT = 0.1;

  const handleSelect = (id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const getColor = (roomIdx, type, defaultColor) => {
    const roomMat = roomMaterials?.[roomIdx];
    if (roomMat?.[type]?.kind === "color") return roomMat[type].data;
    if (materials?.[type]?.kind === "color") return materials[type].data;
    return defaultColor;
  };

  const { walls3D, floors, cx, cy } = useMemo(() => {
    console.log("rooms:", rooms);  // ← 이 줄 추가
    console.log("walls:", walls);  // ← 이 줄 추가
    if (!walls || walls.length === 0) return { walls3D: [], floors: [], cx: 0, cy: 0 };

    const allX = walls.flatMap(w => [w.x1, w.x2]);
    const allY = walls.flatMap(w => [w.y1, w.y2]);
    const cx = (Math.min(...allX) + Math.max(...allX)) / 2;
    const cy = (Math.min(...allY) + Math.max(...allY)) / 2;

    const walls3D = (rooms || []).flatMap((room, roomIdx) => {
      if (!room.points || room.points.length === 0) return [];
      return room.points.map((p, i) => {
        const next = room.points[(i + 1) % room.points.length];
        const x1 = (p.x - cx) * SCALE;
        const z1 = (p.y - cy) * SCALE;
        const x2 = (next.x - cx) * SCALE;
        const z2 = (next.y - cy) * SCALE;
        const length = Math.sqrt((x2-x1)**2 + (z2-z1)**2);
        const angle = Math.atan2(z2-z1, x2-x1);
        return { cx: (x1+x2)/2, cz: (z1+z2)/2, length, angle, roomIdx };
      });
    });
    const floors = (rooms || []).map((room, i) => {
      if (!room.points || room.points.length === 0) return null;
      const points = room.points.map(p => new THREE.Vector2(
        (p.x - cx) * SCALE,
        -(p.y - cy) * SCALE
      ));
      return { shape: new THREE.Shape(points), roomIdx: i };
    }).filter(Boolean);

    if (floors.length === 0) {
      const points = walls.map(w => new THREE.Vector2(
        (w.x1 - cx) * SCALE,
        -(w.y1 - cy) * SCALE
      ));
      floors.push({ shape: new THREE.Shape(points), roomIdx: 0 });
    }

    return { walls3D, floors, cx, cy };
  }, [walls, rooms]);

  const hasWalls = walls && walls.length > 0;

  return (
    <div style={{ width: "100%", height: "600px", borderRadius: "10px", overflow: "hidden" }}>
      {!hasWalls ? (
        <div style={{
          width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "#f0ede8", flexDirection: "column", gap: 12,
          color: "#888", fontSize: 16,
        }}>
          <span style={{ fontSize: 48 }}>✏️</span>
          <span>2D에서 먼저 방을 그려주세요</span>
        </div>
      ) : (
        <Canvas
          shadows
          camera={{ position: [0, 4, 6], fov: 50 }}
          style={{ background: "#f0ede8" }}
          onClick={() => setSelectedId(null)}
        >
          <ambientLight intensity={1} />
          <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />

          {/* 바닥 - 방별로 색상 적용 */}
          {floors.map(({ shape, roomIdx }, i) => (
            <mesh
              key={i}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, selectedRoomIdx === roomIdx ? 0.05 : 0, 0]}
              receiveShadow
              onClick={(e) => { e.stopPropagation(); setSelectedRoomIdx?.(roomIdx); }}
            >
              <shapeGeometry args={[shape]} />
              <meshStandardMaterial
                color={roomMaterials?.[roomIdx]?.floor?.kind === "color" 
                  ? roomMaterials[roomIdx].floor.data 
                  : "#d4c5a9"}
                side={THREE.DoubleSide}
                emissive={selectedRoomIdx === roomIdx ? "#4a7c6f" : "#000000"}
                emissiveIntensity={selectedRoomIdx === roomIdx ? 0.3 : 0}
              />
            </mesh>
          ))}

          {/* 벽 - 방별로 색상 적용 */}
          {walls3D.map((w, i) => (
            <mesh key={i} position={[w.cx, wallH / 2, w.cz]} rotation={[0, -w.angle, 0]}>
              <boxGeometry args={[w.length, wallH, wallT]} />
              <meshStandardMaterial 
                color={roomMaterials?.[w.roomIdx]?.wall?.kind === "color"
                  ? roomMaterials[w.roomIdx].wall.data
                  : "#e8e0d5"}
                emissive={selectedRoomIdx === w.roomIdx ? "#4a7c6f" : "#000000"}
                emissiveIntensity={selectedRoomIdx === w.roomIdx ? 0.15 : 0}
              />
            </mesh>
          ))}
          
          {/* 가구 */}
          {placedItems.map((item) => {
            const x = (item.x - cx) * SCALE;
            const z = (item.y - cy) * SCALE;
            const w = (item.w || 100) * SCALE;
            const h = (item.h || 100) * SCALE;
            const isSelected = item.instanceId === selectedId;
            return (
              <mesh
                key={item.instanceId}
                position={[x + w/2, 0.4, z + h/2]}
                rotation={[0, -(item.rotation || 0) * Math.PI / 180, 0]}
                onClick={(e) => { e.stopPropagation(); handleSelect(item.instanceId); }}
              >
                <boxGeometry args={[w, 0.8, h]} />
                <meshStandardMaterial color={isSelected ? "#4a7c6f" : "#c8a96e"} />
              </mesh>
            );
          })}

          <OrbitControls makeDefault />
        </Canvas>
      )}
    </div>
  );
}