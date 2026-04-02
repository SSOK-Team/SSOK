export default function Wall({ width, height, depth, position, rotation }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color="#e8e0d5" />
    </mesh>
  );
}