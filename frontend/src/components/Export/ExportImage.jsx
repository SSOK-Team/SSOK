/**
 * PNG/JPG 내보내기 (21번 기능)
 * SVG 캔버스를 이미지로 변환해서 다운로드
 * props: svgRef — DraggableImage 안의 SVG ref
 */

export function exportCanvasAsImage(svgRef, format = "png", filename = "ssok-layout") {
  const svg = svgRef?.current;
  if (!svg) return;

  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svg);
  const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const scale = 2; // 고해상도
    canvas.width  = svg.width.baseVal.value * scale;
    canvas.height = svg.height.baseVal.value * scale;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);

    URL.revokeObjectURL(url);

    const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
    const quality  = format === "jpg" ? 0.92 : undefined;
    const dataUrl  = canvas.toDataURL(mimeType, quality);

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${filename}.${format}`;
    a.click();
  };
  img.src = url;
}

/**
 * 내보내기 버튼 UI (Topbar에서 사용)
 */
export default function ExportButton({ svgRef }) {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div style={{ display: "flex", gap: 2 }}>
        <button
          onClick={() => exportCanvasAsImage(svgRef, "png")}
          style={{
            padding: "6px 12px", height: 36,
            fontSize: 12, fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 500,
            border: "1.5px solid #e5e5e5", borderRadius: "8px 0 0 8px",
            background: "#fff", color: "#333", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.color = "#059669"; }}
          onMouseOut={(e)  => { e.currentTarget.style.borderColor = "#e5e5e5"; e.currentTarget.style.color = "#333"; }}
        >
          <span style={{ fontSize: 12 }}>📷</span> PNG
        </button>
        <button
          onClick={() => exportCanvasAsImage(svgRef, "jpg")}
          style={{
            padding: "6px 12px", height: 36,
            fontSize: 12, fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 500,
            border: "1.5px solid #e5e5e5", borderLeft: "none", borderRadius: "0 8px 8px 0",
            background: "#fff", color: "#333", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.color = "#059669"; }}
          onMouseOut={(e)  => { e.currentTarget.style.borderColor = "#e5e5e5"; e.currentTarget.style.color = "#333"; }}
        >
          JPG
        </button>
      </div>
    </div>
  );
}