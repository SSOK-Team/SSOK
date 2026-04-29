// export default function BottomBar({ leftOpen, rooms, areaResult, calcArea }) {
//   return (
//     <footer className="bottombar">
//       <div className={`bottombar-sidebar-slot ${leftOpen ? "open" : "closed"}`}>
//         <button
//           className="btn-3d"
//           onClick={() => alert("3D 변환 기능은 준비 중입니다.")}
//           disabled={rooms.length === 0}
//           title={rooms.length === 0 ? "벽을 먼저 그려주세요" : "3D로 보기"}
//         >
//           <span className="btn-3d-icon">⬛</span>
//           <span>3D로 보기</span>
//         </button>
//       </div>

//       <div className="bottombar-main">
//         <button className="btn-primary" onClick={calcArea}>
//           <span>📐</span> 남은 면적 계산
//         </button>

//         {areaResult && (
//           <div className="area-result">
//             <div className="area-chip">
//               <span className="chip-label">전체</span>
//               <span className="chip-val">{areaResult.total} ㎡</span>
//             </div>
//             <span className="area-op">−</span>
//             <div className="area-chip">
//               <span className="chip-label">가구</span>
//               <span className="chip-val">{areaResult.furniture} ㎡</span>
//             </div>
//             <span className="area-op">=</span>
//             <div className="area-chip highlight">
//               <span className="chip-label">남은 면적</span>
//               <span className="chip-val">{areaResult.remaining} ㎡</span>
//             </div>
//           </div>
//         )}
//       </div>
//     </footer>
//   );
// }


export default function BottomBar({ leftOpen, rooms, areaResult, calcArea, is3D, setIs3D }) {
  return (
    <footer className="bottombar">
      <div className={`bottombar-sidebar-slot ${leftOpen ? "open" : "closed"}`}>
        <button
          className="btn-3d"
          onClick={() => setIs3D(v => !v)}
        >
          <span className="btn-3d-icon">⬛</span>
          <span>{is3D ? "2D 평면도" : "3D로 보기"}</span>
        </button>
      </div>
      <div className="bottombar-main">
        <button className="btn-primary" onClick={calcArea}>
          <span>📐</span> 남은 면적 계산
        </button>
        {areaResult && (
          <div className="area-result">
            <div className="area-chip">
              <span className="chip-label">전체</span>
              <span className="chip-val">{areaResult.total} ㎡</span>
            </div>
            <span className="area-op">−</span>
            <div className="area-chip">
              <span className="chip-label">가구</span>
              <span className="chip-val">{areaResult.furniture} ㎡</span>
            </div>
            <span className="area-op">=</span>
            <div className="area-chip highlight">
              <span className="chip-label">남은 면적</span>
              <span className="chip-val">{areaResult.remaining} ㎡</span>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}