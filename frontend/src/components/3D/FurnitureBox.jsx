import { useState } from "react";
import { Text } from "@react-three/drei";

export default function FurnitureBox({ item, roomWidth, roomHeight, onSelect, onRemove, isSelected }) {
  const [hovered, setHovered] = useState(false);

  // 2D 좌표 → 3D 좌표 변환
  const scale = 0.01;
  const x = (item.x - roomWidth / 2) * scale;
  const z = (item.y - roomHeight / 2) * scale;
  const w = item.w * scale;
  const h = item.h * scale;
  const wallH = 0.8; // 가구 높이

  return (
    <group
      position={[x, wallH / 2, z]}
      rotation={[0, (item.rotation || 0) * (Math.PI / 180), 0]}
      onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh castShadow>
        <boxGeometry args={[w, wallH, h]} />
        <meshStandardMaterial
          color={isSelected ? "#4a7c6f" : hovered ? "#c8a96e" : (item.color || "#d4c4a0")}
        />
      </mesh>
      {/* 가구 이름 표시 */}
      <Text
        position={[0, wallH / 2 + 0.1, 0]}
        fontSize={0.15}
        color="#333"
        anchorX="center"
        anchorY="bottom"
      >
        {item.emoji} {item.name}
      </Text>
    </group>
  );
}