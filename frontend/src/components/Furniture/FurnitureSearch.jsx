import { useState } from "react";

/**
 * 가구 검색 필터 (17번 기능)
 * props:
 *   furnitureList   — 전체 가구 배열
 *   onResults       — 필터된 결과 배열 콜백
 */
export default function FurnitureSearch({ furnitureList, onResults }) {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    const filtered = q.trim()
      ? furnitureList.filter((f) =>
          f.name.replace(/\.[^.]+$/, "").toLowerCase().includes(q.toLowerCase())
        )
      : furnitureList;
    onResults(filtered);
  };

  const handleClear = () => {
    setQuery("");
    onResults(furnitureList);
  };

  return (
    <div style={{ position: "relative", marginBottom: 8 }}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="가구 검색..."
        style={{
          width: "100%",
          padding: "8px 30px 8px 10px",
          fontSize: 12,
          fontFamily: "'Noto Sans KR', sans-serif",
          border: "1.5px solid #e5e5e5",
          borderRadius: 8,
          outline: "none",
          background: "#fafafa",
          color: "#111",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#059669")}
        onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")}
      />
      {query && (
        <button
          onClick={handleClear}
          style={{
            position: "absolute", right: 8, top: "50%",
            transform: "translateY(-50%)",
            background: "none", border: "none",
            cursor: "pointer", color: "#999", fontSize: 14, lineHeight: 1,
          }}
        >✕</button>
      )}
    </div>
  );
}