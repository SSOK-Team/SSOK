export default function Floor({ width, height }) {
  return (
    <mesh position={[0, -0.01, 0]} receiveShadow>
      <boxGeometry args={[width, 0.02, height]} />
      <meshStandardMaterial color="#d4c5a9" />
    </mesh>
  );
}