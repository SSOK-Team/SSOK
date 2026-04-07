/**
 * 도면 이미지 불러오기 (13번 기능)
 * 실제 평면도를 캔버스 배경(밑그림)으로 설정
 * props: bgImage, opacity, onImageLoad, onOpacityChange, onClear
 */

export default function FloorPlanImport({ bgImage, opacity, onImageLoad, onOpacityChange, onClear }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{
        fontSize: 11, fontWeight: 700, color: "#999",
        textTransform: "uppercase", letterSpacing: "0.08em",
      }}>도면 밑그림</p>

      {!bgImage ? (
        <label style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 6,
          padding: "20px 12px",
          border: "1.5px dashed #e5e5e5", borderRadius: 10,
          cursor: "pointer", background: "#fafafa",
          fontSize: 12, color: "#999",
          transition: "border-color 0.15s",
        }}
          onMouseOver={(e) => (e.currentTarget.style.borderColor = "#059669")}
          onMouseOut={(e)  => (e.currentTarget.style.borderColor = "#e5e5e5")}
        >
          <span style={{ fontSize: 28 }}>🗺️</span>
          <span>평면도 이미지 업로드</span>
          <span style={{ fontSize: 10, color: "#bbb" }}>PNG · JPG · PDF</span>
          <input
            type="file" accept="image/png,image/jpeg,image/jpg" hidden
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              onImageLoad(url);
            }}
          />
        </label>
      ) : (
        <>
          {/* 미리보기 */}
          <div style={{
            width: "100%", aspectRatio: "4/3",
            border: "1.5px solid #e5e5e5", borderRadius: 8,
            overflow: "hidden", background: "#f5f5f5", position: "relative",
          }}>
            <img
              src={bgImage}
              alt="도면 미리보기"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>

          {/* 투명도 슬라이더 */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: "#999" }}>투명도</span>
              <span style={{ fontSize: 11, color: "#555", fontWeight: 600 }}>
                {Math.round(opacity * 100)}%
              </span>
            </div>
            <input
              type="range" min={0.05} max={1} step={0.05}
              value={opacity}
              onChange={(e) => onOpacityChange(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#059669" }}
            />
          </div>

          {/* 제거 버튼 */}
          <button
            onClick={onClear}
            style={{
              width: "100%", padding: "8px 0",
              fontSize: 12, fontFamily: "'Noto Sans KR', sans-serif",
              fontWeight: 600, color: "#ef4444",
              border: "1.5px solid rgba(239,68,68,0.4)",
              borderRadius: 8, background: "#fff",
              cursor: "pointer", transition: "background 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#fef2f2")}
            onMouseOut={(e)  => (e.currentTarget.style.background = "#fff")}
          >
            🗑 밑그림 제거
          </button>
        </>
      )}
    </div>
  );
}