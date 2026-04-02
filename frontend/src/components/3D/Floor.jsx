// export default function Floor({ width, height }) {
//   return (
//     <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
//       <boxGeometry args={[width, height]} />
//       <meshStandardMaterial color="#d4c5a9" />
//     </mesh>
//   );
// }

export default function Floor({ width, height }) {
  return (
    <mesh position={[0, -0.01, 0]} receiveShadow>
      <boxGeometry args={[width, 0.02, height]} />
      <meshStandardMaterial color="#d4c5a9" />
    </mesh>
  );
}